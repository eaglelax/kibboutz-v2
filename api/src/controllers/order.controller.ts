import { Response } from 'express';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../db';
import { orders, orderItems, cartItems, products, productImages, addresses, users } from '../db/schema';
import { AuthRequest, OrderStatus } from '../types';
import { generateOrderNumber, calculateDeliveryFee, getPaginationParams, getTotalPages } from '../utils';

// Helper: enrichir des commandes avec items, produits, images, adresse, user
async function enrichOrders(orderRows: (typeof orders.$inferSelect)[], opts?: {
  includeUser?: boolean;
  includeProductImages?: boolean;
  includeProductProducer?: boolean;
}) {
  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map(o => o.id);
  const addressIds = [...new Set(orderRows.map(o => o.addressId))];

  // Récupérer items et adresses en parallèle
  const [allItems, addressList] = await Promise.all([
    db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)),
    db.select().from(addresses).where(inArray(addresses.id, addressIds)),
  ]);

  const addressMap = new Map(addressList.map(a => [a.id, a]));

  // Récupérer les produits pour les items
  const productIds = [...new Set(allItems.map(i => i.productId))];
  let productMap = new Map<string, any>();
  let imagesByProduct = new Map<string, any[]>();
  let producerMap = new Map<string, any>();

  if (productIds.length > 0) {
    const productList = await db.select().from(products)
      .where(inArray(products.id, productIds));
    productMap = new Map(productList.map(p => [p.id, p]));

    if (opts?.includeProductImages) {
      const images = await db.select().from(productImages)
        .where(inArray(productImages.productId, productIds));
      for (const img of images) {
        if (!imagesByProduct.has(img.productId)) imagesByProduct.set(img.productId, []);
        imagesByProduct.get(img.productId)!.push(img);
      }
    }

    if (opts?.includeProductProducer) {
      const producerIds = [...new Set(productList.map(p => p.producerId))];
      if (producerIds.length > 0) {
        const producers = await db.select({
          id: users.id, firstName: users.firstName, lastName: users.lastName,
        }).from(users).where(inArray(users.id, producerIds));
        producerMap = new Map(producers.map(p => [p.id, p]));
      }
    }
  }

  // Récupérer les users si nécessaire
  let userMap = new Map<string, any>();
  if (opts?.includeUser) {
    const userIds = [...new Set(orderRows.map(o => o.userId))];
    const userList = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      email: users.email, phone: users.phone,
    }).from(users).where(inArray(users.id, userIds));
    userMap = new Map(userList.map(u => [u.id, u]));
  }

  return orderRows.map(order => {
    const items = allItems
      .filter(item => item.orderId === order.id)
      .map(item => {
        const product = productMap.get(item.productId);
        return {
          ...item,
          product: product ? {
            ...product,
            ...(opts?.includeProductImages ? { images: imagesByProduct.get(item.productId) || [] } : {}),
            ...(opts?.includeProductProducer ? { producer: producerMap.get(product.producerId) || null } : {}),
          } : null,
        };
      });

    return {
      ...order,
      items,
      address: addressMap.get(order.addressId) || null,
      ...(opts?.includeUser ? { user: userMap.get(order.userId) || null } : {}),
    };
  });
}

// Créer une commande
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const { addressId, notes, paymentMethod } = req.body;

    // Vérifier l'adresse
    const [address] = await db.select().from(addresses)
      .where(and(
        eq(addresses.id, addressId),
        eq(addresses.userId, req.user.id)
      ));

    if (!address) {
      res.status(404).json({
        success: false,
        error: 'Adresse non trouvée',
      });
      return;
    }

    // Récupérer le panier avec les produits
    const cartItemsList = await db.select().from(cartItems)
      .where(eq(cartItems.userId, req.user.id));

    if (cartItemsList.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Le panier est vide',
      });
      return;
    }

    const cartProductIds = [...new Set(cartItemsList.map(i => i.productId))];
    const cartProducts = await db.select().from(products)
      .where(inArray(products.id, cartProductIds));
    const productMap = new Map(cartProducts.map(p => [p.id, p]));

    const cart = cartItemsList.map(item => ({
      ...item,
      product: productMap.get(item.productId)!,
    }));

    // Vérifier le stock de chaque produit
    for (const item of cart) {
      if (item.product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          error: `Stock insuffisant pour ${item.product.name}. Disponible: ${item.product.stock}`,
        });
        return;
      }
    }

    // Calculer les totaux
    const subtotal = cart.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const deliveryFee = calculateDeliveryFee(subtotal, address.city);
    const total = subtotal + deliveryFee;

    // Créer la commande
    const orderNumber = generateOrderNumber();
    const newOrderId = createId();

    await db.insert(orders).values({
      id: newOrderId,
      orderNumber,
      userId: req.user.id,
      addressId,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'COD',
      notes: notes || null,
    });

    // Créer les items de commande
    const orderItemsData = cart.map(item => ({
      orderId: newOrderId,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      subtotal: item.product.price * item.quantity,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Mettre à jour le stock des produits
    for (const item of cart) {
      await db.update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }

    // Vider le panier
    await db.delete(cartItems).where(eq(cartItems.userId, req.user.id));

    // Récupérer la commande complète
    const [newOrder] = await db.select().from(orders)
      .where(eq(orders.id, newOrderId));
    const [enrichedOrder] = await enrichOrders([newOrder], { includeProductImages: true });

    res.status(201).json({
      success: true,
      data: enrichedOrder,
      message: 'Commande créée avec succès',
    });
  } catch (error) {
    console.error('CreateOrder error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande',
    });
  }
};

// Obtenir les commandes de l'utilisateur
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const { page, limit, offset } = getPaginationParams(req.query as { page?: string; limit?: string });
    const { status } = req.query;

    const conditions: any[] = [eq(orders.userId, req.user.id)];

    if (status) {
      conditions.push(eq(orders.status, status as OrderStatus));
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(...conditions));

    const total = Number(count);

    const myOrders = await db.select().from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const enriched = await enrichOrders(myOrders, { includeProductImages: true });

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: getTotalPages(total, limit),
      },
    });
  } catch (error) {
    console.error('GetMyOrders error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commandes',
    });
  }
};

// Obtenir une commande par ID
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;

    const [order] = await db.select().from(orders)
      .where(eq(orders.id, id));

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Commande non trouvée',
      });
      return;
    }

    // Vérifier les permissions
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      if (req.user.role === 'PRODUCER') {
        // Vérifier si le producteur a des produits dans la commande
        const items = await db.select().from(orderItems)
          .where(eq(orderItems.orderId, id));
        const itemProductIds = [...new Set(items.map(i => i.productId))];
        if (itemProductIds.length > 0) {
          const prods = await db.select({ id: products.id, producerId: products.producerId })
            .from(products).where(inArray(products.id, itemProductIds));
          const hasProducts = prods.some(p => p.producerId === req.user!.id);
          if (!hasProducts) {
            res.status(403).json({ success: false, error: 'Accès non autorisé' });
            return;
          }
        } else {
          res.status(403).json({ success: false, error: 'Accès non autorisé' });
          return;
        }
      } else {
        res.status(403).json({ success: false, error: 'Accès non autorisé' });
        return;
      }
    }

    const [enrichedOrder] = await enrichOrders([order], {
      includeUser: true,
      includeProductImages: true,
      includeProductProducer: true,
    });

    res.json({
      success: true,
      data: enrichedOrder,
    });
  } catch (error) {
    console.error('GetOrder error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la commande',
    });
  }
};

// Obtenir toutes les commandes (Admin)
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query as { page?: string; limit?: string });
    const { status } = req.query;

    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(orders.status, status as OrderStatus));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause);

    const total = Number(count);

    const allOrders = await db.select().from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const enriched = await enrichOrders(allOrders, { includeUser: true });

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: getTotalPages(total, limit),
      },
    });
  } catch (error) {
    console.error('GetAllOrders error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commandes',
    });
  }
};

// Changer le statut d'une commande
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;
    const { status } = req.body;

    const [order] = await db.select().from(orders)
      .where(eq(orders.id, id));

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Commande non trouvée',
      });
      return;
    }

    // Vérifier les permissions selon le rôle et le statut
    const allowedTransitions: Record<string, Record<string, OrderStatus[]>> = {
      CLIENT: {
        PENDING: ['CANCELLED'],
      },
      PRODUCER: {
        PENDING: ['PREPARING'],
        PREPARING: ['READY'],
        READY: ['IN_DELIVERY'],
        IN_DELIVERY: ['DELIVERED'],
      },
      DELIVERY: {
        READY: ['IN_DELIVERY'],
        IN_DELIVERY: ['DELIVERED'],
      },
      ADMIN: {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['READY', 'CANCELLED'],
        READY: ['IN_DELIVERY', 'CANCELLED'],
        IN_DELIVERY: ['DELIVERED', 'CANCELLED'],
      },
    };

    const currentStatus = order.status as OrderStatus;
    const userTransitions = allowedTransitions[req.user.role] || {};
    const allowedStatuses = userTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(status)) {
      res.status(403).json({
        success: false,
        error: `Transition de ${currentStatus} vers ${status} non autorisée pour votre rôle`,
      });
      return;
    }

    // Si annulation, remettre le stock
    if (status === 'CANCELLED') {
      const items = await db.select().from(orderItems)
        .where(eq(orderItems.orderId, id));

      for (const item of items) {
        await db.update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    }

    // Mettre à jour le statut
    const updateData: Partial<typeof orders.$inferInsert> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = 'PAID';
    }

    await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id));

    // Retourner la commande mise à jour
    const [updatedOrder] = await db.select().from(orders)
      .where(eq(orders.id, id));
    const [enrichedOrder] = await enrichOrders([updatedOrder]);

    res.json({
      success: true,
      data: enrichedOrder,
      message: `Statut mis à jour: ${status}`,
    });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut',
    });
  }
};

// Assigner un livreur (Admin)
export const assignDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { deliveryPersonId } = req.body;

    const [order] = await db.select().from(orders)
      .where(eq(orders.id, id));

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Commande non trouvée',
      });
      return;
    }

    await db.update(orders)
      .set({
        deliveryPersonId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    res.json({
      success: true,
      message: 'Livreur assigné avec succès',
    });
  } catch (error) {
    console.error('AssignDelivery error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'assignation du livreur',
    });
  }
};

// Obtenir les commandes pour un producteur
export const getProducerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const { page, limit, offset } = getPaginationParams(req.query as { page?: string; limit?: string });

    // Récupérer les IDs de produits du producteur
    const producerProducts = await db.select({ id: products.id }).from(products)
      .where(eq(products.producerId, req.user.id));

    const productIds = producerProducts.map(p => p.id);

    if (productIds.length === 0) {
      res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
      return;
    }

    // Trouver les IDs de commandes contenant ces produits
    const relevantItems = await db.select({ orderId: orderItems.orderId }).from(orderItems)
      .where(inArray(orderItems.productId, productIds));

    const orderIds = [...new Set(relevantItems.map(i => i.orderId))];

    if (orderIds.length === 0) {
      res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
      return;
    }

    // Récupérer les commandes
    const orderList = await db.select().from(orders)
      .where(inArray(orders.id, orderIds))
      .orderBy(desc(orders.createdAt));

    // Récupérer tous les items, produits, adresses, users
    const allItems = await db.select().from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const allItemProductIds = [...new Set(allItems.map(i => i.productId))];
    const productList = allItemProductIds.length > 0
      ? await db.select().from(products).where(inArray(products.id, allItemProductIds))
      : [];
    const productMap = new Map(productList.map(p => [p.id, p]));

    const addressIds = [...new Set(orderList.map(o => o.addressId))];
    const addressList = await db.select().from(addresses)
      .where(inArray(addresses.id, addressIds));
    const addressMap = new Map(addressList.map(a => [a.id, a]));

    const userIds = [...new Set(orderList.map(o => o.userId))];
    const userList = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName, phone: users.phone,
    }).from(users).where(inArray(users.id, userIds));
    const userMap = new Map(userList.map(u => [u.id, u]));

    // Assembler - filtrer les items pour ne garder que ceux du producteur
    const result = orderList.map(order => ({
      ...order,
      items: allItems
        .filter(item => item.orderId === order.id && productIds.includes(item.productId))
        .map(item => ({
          ...item,
          product: productMap.get(item.productId) || null,
        })),
      address: addressMap.get(order.addressId) || null,
      user: userMap.get(order.userId) || null,
    }));

    // Pagination
    const paginatedResult = result.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedResult,
      pagination: {
        page,
        limit,
        total: result.length,
        totalPages: getTotalPages(result.length, limit),
      },
    });
  } catch (error) {
    console.error('GetProducerOrders error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commandes',
    });
  }
};
