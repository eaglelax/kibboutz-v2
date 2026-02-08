import { Response } from 'express';
import { eq, and, asc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../db';
import { categories, products } from '../db/schema';
import { AuthRequest } from '../types';
import { slugify } from '../utils';

// Obtenir toutes les catégories
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allCategories = await db.select().from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    // Grouper parent/enfants en mémoire
    const childrenMap = new Map<string, (typeof allCategories[0])[]>();
    for (const cat of allCategories) {
      if (cat.parentId) {
        if (!childrenMap.has(cat.parentId)) childrenMap.set(cat.parentId, []);
        childrenMap.get(cat.parentId)!.push(cat);
      }
    }

    const rootCategories = allCategories
      .filter(cat => !cat.parentId)
      .map(cat => ({
        ...cat,
        children: childrenMap.get(cat.id) || [],
      }));

    res.json({
      success: true,
      data: rootCategories,
    });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories',
    });
  }
};

// Obtenir une catégorie par ID ou slug
export const getCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const [category] = await db.select().from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée',
      });
      return;
    }

    const children = await db.select().from(categories)
      .where(eq(categories.parentId, id));

    const categoryProducts = await db.select().from(products)
      .where(and(eq(products.categoryId, id), eq(products.isActive, true)))
      .limit(20);

    res.json({
      success: true,
      data: {
        ...category,
        children,
        products: categoryProducts,
      },
    });
  } catch (error) {
    console.error('GetCategory error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la catégorie',
    });
  }
};

// Créer une catégorie (Admin)
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, icon, parentId, sortOrder } = req.body;

    const slug = slugify(name);

    // Vérifier si le slug existe déjà
    const [existingCategory] = await db.select().from(categories)
      .where(eq(categories.slug, slug));

    if (existingCategory) {
      res.status(400).json({
        success: false,
        error: 'Une catégorie avec ce nom existe déjà',
      });
      return;
    }

    const newCategoryId = createId();
    await db.insert(categories).values({
      id: newCategoryId,
      name,
      slug,
      icon: icon || null,
      parentId: parentId || null,
      sortOrder: sortOrder || 0,
    });

    const [category] = await db.select().from(categories)
      .where(eq(categories.id, newCategoryId));

    res.status(201).json({
      success: true,
      data: category,
      message: 'Catégorie créée avec succès',
    });
  } catch (error) {
    console.error('CreateCategory error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la catégorie',
    });
  }
};

// Mettre à jour une catégorie (Admin)
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, icon, parentId, sortOrder, isActive } = req.body;

    const [existingCategory] = await db.select().from(categories)
      .where(eq(categories.id, id));

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée',
      });
      return;
    }

    const updateData: Partial<typeof categories.$inferInsert> = {};

    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (icon !== undefined) updateData.icon = icon;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, id));

    const [updatedCategory] = await db.select().from(categories)
      .where(eq(categories.id, id));

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Catégorie mise à jour avec succès',
    });
  } catch (error) {
    console.error('UpdateCategory error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la catégorie',
    });
  }
};

// Supprimer une catégorie (Admin)
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const [category] = await db.select().from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée',
      });
      return;
    }

    // Vérifier si la catégorie a des produits
    const categoryProducts = await db.select({ id: products.id }).from(products)
      .where(eq(products.categoryId, id))
      .limit(1);

    if (categoryProducts.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Impossible de supprimer une catégorie contenant des produits',
      });
      return;
    }

    // Vérifier si la catégorie a des sous-catégories
    const children = await db.select({ id: categories.id }).from(categories)
      .where(eq(categories.parentId, id))
      .limit(1);

    if (children.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Impossible de supprimer une catégorie contenant des sous-catégories',
      });
      return;
    }

    await db.delete(categories).where(eq(categories.id, id));

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    console.error('DeleteCategory error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la catégorie',
    });
  }
};
