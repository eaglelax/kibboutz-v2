import { Response } from 'express';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db';
import { cartItems, products, productImages } from '../db/schema';
import { AuthRequest } from '../types';

// Helper: récupérer le panier complet avec produits et images
async function getFullCart(userId: string) {
  const items = await db.select().from(cartItems)
    .where(eq(cartItems.userId, userId));

  if (items.length === 0) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  const productIds = [...new Set(items.map(i => i.productId))];

  const [productList, imageList] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    db.select().from(productImages).where(inArray(productImages.productId, productIds)),
  ]);

  const productMap = new Map(productList.map(p => [p.id, p]));

  const enrichedItems = items.map(item => {
    const product = productMap.get(item.productId)!;
    return {
      ...item,
      product: {
        ...product,
        images: imageList.filter(i => i.productId === item.productId),
      },
    };
  });

  const subtotal = enrichedItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  return {
    items: enrichedItems,
    subtotal,
    itemCount: enrichedItems.length,
  };
}

// Obtenir le panier de l'utilisateur
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const cart = await getFullCart(req.user.id);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('GetCart error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du panier',
    });
  }
};

// Ajouter au panier
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const { productId, quantity } = req.body;

    // Vérifier que le produit existe et est actif
    const [product] = await db.select().from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)));

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Produit non trouvé ou indisponible',
      });
      return;
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        error: `Stock insuffisant. Disponible: ${product.stock}`,
      });
      return;
    }

    // Vérifier si le produit est déjà dans le panier
    const [existingItem] = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.userId, req.user.id),
        eq(cartItems.productId, productId)
      ));

    if (existingItem) {
      // Mettre à jour la quantité
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        res.status(400).json({
          success: false,
          error: `Stock insuffisant. Disponible: ${product.stock}`,
        });
        return;
      }

      await db.update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Ajouter un nouvel item
      await db.insert(cartItems).values({
        userId: req.user.id,
        productId,
        quantity,
      });
    }

    // Récupérer le panier mis à jour
    const cart = await getFullCart(req.user.id);

    res.status(201).json({
      success: true,
      data: cart,
      message: 'Produit ajouté au panier',
    });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout au panier',
    });
  }
};

// Mettre à jour la quantité d'un item
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const itemId = req.params.itemId as string;
    const { quantity } = req.body;

    // Récupérer le cart item
    const [cartItem] = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.userId, req.user.id)
      ));

    if (!cartItem) {
      res.status(404).json({
        success: false,
        error: 'Item non trouvé dans le panier',
      });
      return;
    }

    // Récupérer le produit pour vérifier le stock
    const [product] = await db.select().from(products)
      .where(eq(products.id, cartItem.productId));

    // Vérifier le stock
    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        error: `Stock insuffisant. Disponible: ${product.stock}`,
      });
      return;
    }

    await db.update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId as string));

    // Récupérer le panier mis à jour
    const cart = await getFullCart(req.user.id);

    res.json({
      success: true,
      data: cart,
      message: 'Quantité mise à jour',
    });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour',
    });
  }
};

// Supprimer un item du panier
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const itemId = req.params.itemId as string;

    const [cartItem] = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.userId, req.user.id)
      ));

    if (!cartItem) {
      res.status(404).json({
        success: false,
        error: 'Item non trouvé dans le panier',
      });
      return;
    }

    await db.delete(cartItems).where(eq(cartItems.id, itemId as string));

    res.json({
      success: true,
      message: 'Produit retiré du panier',
    });
  } catch (error) {
    console.error('RemoveFromCart error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression',
    });
  }
};

// Vider le panier
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    await db.delete(cartItems).where(eq(cartItems.userId, req.user.id));

    res.json({
      success: true,
      message: 'Panier vidé',
    });
  } catch (error) {
    console.error('ClearCart error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du vidage du panier',
    });
  }
};
