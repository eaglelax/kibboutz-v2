import { Response } from 'express';
import { eq, and, like, desc, asc, sql, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../db';
import { products, productImages, categories, users, producerProfiles } from '../db/schema';
import { AuthRequest } from '../types';
import { getPaginationParams, getTotalPages } from '../utils';
import type { Product } from '../db/schema';

// Helper: enrichir les produits avec images, catégorie, producteur
async function enrichProducts(productRows: Product[], opts?: { includeProducerProfile?: boolean }) {
  if (productRows.length === 0) return [];

  const productIds = productRows.map(p => p.id);
  const categoryIds = [...new Set(productRows.map(p => p.categoryId))];
  const producerIds = [...new Set(productRows.map(p => p.producerId))];

  const [imageList, categoryList, producerList] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, productIds)),
    db.select().from(categories).where(inArray(categories.id, categoryIds)),
    db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
      .from(users).where(inArray(users.id, producerIds)),
  ]);

  let profileMap = new Map<string, any>();
  if (opts?.includeProducerProfile) {
    const profiles = await db.select().from(producerProfiles)
      .where(inArray(producerProfiles.userId, producerIds));
    profileMap = new Map(profiles.map(p => [p.userId, p]));
  }

  const categoryMap = new Map(categoryList.map(c => [c.id, c]));
  const producerMap = new Map(producerList.map(p => [p.id, p]));

  return productRows.map(p => ({
    ...p,
    images: imageList.filter(i => i.productId === p.id),
    category: categoryMap.get(p.categoryId) || null,
    producer: opts?.includeProducerProfile
      ? { ...(producerMap.get(p.producerId) || {}), profile: profileMap.get(p.producerId) || null }
      : producerMap.get(p.producerId) || null,
  }));
}

// Obtenir tous les produits (avec filtres et pagination)
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query as { page?: string; limit?: string });
    const { category, producer, search, minPrice, maxPrice, sortBy, sortOrder } = req.query;

    // Construire les conditions
    const conditions: any[] = [eq(products.isActive, true)];

    if (category) {
      conditions.push(eq(products.categoryId, category as string));
    }
    if (producer) {
      conditions.push(eq(products.producerId, producer as string));
    }
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }
    if (minPrice) {
      conditions.push(sql`${products.price} >= ${parseInt(minPrice as string, 10)}`);
    }
    if (maxPrice) {
      conditions.push(sql`${products.price} <= ${parseInt(maxPrice as string, 10)}`);
    }

    // Compter le total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));

    const total = Number(count);

    // Déterminer l'ordre
    let orderByClause: any = desc(products.createdAt);
    if (sortBy === 'price') {
      orderByClause = sortOrder === 'asc' ? asc(products.price) : desc(products.price);
    } else if (sortBy === 'name') {
      orderByClause = sortOrder === 'asc' ? asc(products.name) : desc(products.name);
    }

    // Récupérer les produits
    const productList = await db.select().from(products)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const enriched = await enrichProducts(productList);

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
    console.error('GetProducts error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des produits',
    });
  }
};

// Obtenir un produit par ID
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const [product] = await db.select().from(products)
      .where(eq(products.id, id));

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
      });
      return;
    }

    const [enriched] = await enrichProducts([product], { includeProducerProfile: true });

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error('GetProduct error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du produit',
    });
  }
};

// Créer un produit (Producteur)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const { name, description, price, unit, categoryId, stock, minQuantity, origin } = req.body;

    const newProductId = createId();
    await db.insert(products).values({
      id: newProductId,
      producerId: req.user.id,
      categoryId,
      name,
      description,
      price: parseInt(price, 10),
      unit,
      stock: parseFloat(stock),
      minQuantity: minQuantity ? parseFloat(minQuantity) : 1,
      origin: origin || null,
    });

    const [product] = await db.select().from(products)
      .where(eq(products.id, newProductId));
    const [enriched] = await enrichProducts([product]);

    res.status(201).json({
      success: true,
      data: enriched,
      message: 'Produit créé avec succès',
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du produit',
    });
  }
};

// Mettre à jour un produit (Producteur/Admin)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;
    const { name, description, price, unit, categoryId, stock, minQuantity, origin, isActive } = req.body;

    const [existingProduct] = await db.select().from(products)
      .where(eq(products.id, id));

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
      });
      return;
    }

    if (req.user.role !== 'ADMIN' && existingProduct.producerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Vous n\'êtes pas autorisé à modifier ce produit',
      });
      return;
    }

    const updateData: Partial<typeof products.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price, 10);
    if (unit !== undefined) updateData.unit = unit;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (stock !== undefined) updateData.stock = parseFloat(stock);
    if (minQuantity !== undefined) updateData.minQuantity = parseFloat(minQuantity);
    if (origin !== undefined) updateData.origin = origin;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(products)
      .set(updateData)
      .where(eq(products.id, id));

    const [updatedProduct] = await db.select().from(products)
      .where(eq(products.id, id));
    const [enriched] = await enrichProducts([updatedProduct]);

    res.json({
      success: true,
      data: enriched,
      message: 'Produit mis à jour avec succès',
    });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du produit',
    });
  }
};

// Supprimer un produit (Producteur/Admin)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;

    const [existingProduct] = await db.select().from(products)
      .where(eq(products.id, id));

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
      });
      return;
    }

    if (req.user.role !== 'ADMIN' && existingProduct.producerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Vous n\'êtes pas autorisé à supprimer ce produit',
      });
      return;
    }

    // Soft delete : désactiver le produit
    await db.update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));

    res.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du produit',
    });
  }
};

// Obtenir les produits d'un producteur
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const { page, limit, offset } = getPaginationParams(req.query as { page?: string; limit?: string });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.producerId, req.user.id));

    const total = Number(count);

    const myProducts = await db.select().from(products)
      .where(eq(products.producerId, req.user.id))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const enriched = await enrichProducts(myProducts);

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
    console.error('GetMyProducts error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de vos produits',
    });
  }
};

// Ajouter une image à un produit
export const addProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;
    const { url, isPrimary } = req.body;

    const [product] = await db.select().from(products)
      .where(eq(products.id, id));

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
      });
      return;
    }

    if (req.user.role !== 'ADMIN' && product.producerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Vous n\'êtes pas autorisé à modifier ce produit',
      });
      return;
    }

    // Si c'est l'image principale, désactiver les autres
    if (isPrimary) {
      await db.update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, id));
    }

    await db.insert(productImages).values({
      productId: id,
      url,
      isPrimary: isPrimary || false,
    });

    // Retourner le produit avec ses images
    const images = await db.select().from(productImages)
      .where(eq(productImages.productId, id));

    res.status(201).json({
      success: true,
      data: { ...product, images },
      message: 'Image ajoutée avec succès',
    });
  } catch (error) {
    console.error('AddProductImage error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout de l\'image',
    });
  }
};

// Supprimer une image
export const deleteProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;
    const imageId = req.params.imageId as string;

    const [product] = await db.select().from(products)
      .where(eq(products.id, id));

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
      });
      return;
    }

    if (req.user.role !== 'ADMIN' && product.producerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Vous n\'êtes pas autorisé à modifier ce produit',
      });
      return;
    }

    await db.delete(productImages).where(eq(productImages.id, imageId));

    res.json({
      success: true,
      message: 'Image supprimée avec succès',
    });
  } catch (error) {
    console.error('DeleteProductImage error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'image',
    });
  }
};
