import { Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { addresses } from '../db/schema';
import { AuthRequest } from '../types';
import { createId } from '@paralleldrive/cuid2';

// Obtenir les adresses de l'utilisateur
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const userAddresses = await db.query.addresses.findMany({
      where: eq(addresses.userId, req.user.id),
    });

    res.json({
      success: true,
      data: userAddresses,
    });
  } catch (error) {
    console.error('GetAddresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des adresses',
    });
  }
};

// Obtenir une adresse par ID
export const getAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;

    const address = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.id, id),
        eq(addresses.userId, req.user.id)
      ),
    });

    if (!address) {
      res.status(404).json({
        success: false,
        error: 'Adresse non trouvée',
      });
      return;
    }

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error('GetAddress error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'adresse',
    });
  }
};

// Créer une adresse
export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const { label, fullAddress, city, quarter, latitude, longitude, isDefault } = req.body;

    // Si c'est l'adresse par défaut, désactiver les autres
    if (isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, req.user.id));
    }

    // Si c'est la première adresse, la rendre par défaut
    const existingAddresses = await db.query.addresses.findMany({
      where: eq(addresses.userId, req.user.id),
    });

    const shouldBeDefault = isDefault || existingAddresses.length === 0;

    const newId = createId();

    await db.insert(addresses).values({
      id: newId,
      userId: req.user.id,
      label,
      fullAddress,
      city,
      quarter: quarter || null,
      latitude: latitude || null,
      longitude: longitude || null,
      isDefault: shouldBeDefault,
    });

    const address = await db.query.addresses.findFirst({
      where: eq(addresses.id, newId),
    });

    res.status(201).json({
      success: true,
      data: address,
      message: 'Adresse créée avec succès',
    });
  } catch (error) {
    console.error('CreateAddress error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'adresse',
    });
  }
};

// Mettre à jour une adresse
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;
    const { label, fullAddress, city, quarter, latitude, longitude, isDefault } = req.body;

    const existingAddress = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.id, id),
        eq(addresses.userId, req.user.id)
      ),
    });

    if (!existingAddress) {
      res.status(404).json({
        success: false,
        error: 'Adresse non trouvée',
      });
      return;
    }

    // Si c'est l'adresse par défaut, désactiver les autres
    if (isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, req.user.id));
    }

    const updateData: Partial<typeof addresses.$inferInsert> = {};

    if (label !== undefined) updateData.label = label;
    if (fullAddress !== undefined) updateData.fullAddress = fullAddress;
    if (city !== undefined) updateData.city = city;
    if (quarter !== undefined) updateData.quarter = quarter;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    await db.update(addresses)
      .set(updateData)
      .where(eq(addresses.id, id));

    const updatedAddress = await db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    });

    res.json({
      success: true,
      data: updatedAddress,
      message: 'Adresse mise à jour avec succès',
    });
  } catch (error) {
    console.error('UpdateAddress error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'adresse',
    });
  }
};

// Supprimer une adresse
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;

    const address = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.id, id),
        eq(addresses.userId, req.user.id)
      ),
    });

    if (!address) {
      res.status(404).json({
        success: false,
        error: 'Adresse non trouvée',
      });
      return;
    }

    await db.delete(addresses).where(eq(addresses.id, id));

    // Si c'était l'adresse par défaut, en définir une autre
    if (address.isDefault) {
      const remainingAddresses = await db.query.addresses.findMany({
        where: eq(addresses.userId, req.user.id),
        limit: 1,
      });

      if (remainingAddresses.length > 0) {
        await db.update(addresses)
          .set({ isDefault: true })
          .where(eq(addresses.id, remainingAddresses[0].id));
      }
    }

    res.json({
      success: true,
      message: 'Adresse supprimée avec succès',
    });
  } catch (error) {
    console.error('DeleteAddress error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'adresse',
    });
  }
};

// Définir une adresse par défaut
export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const id = req.params.id as string;

    const address = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.id, id),
        eq(addresses.userId, req.user.id)
      ),
    });

    if (!address) {
      res.status(404).json({
        success: false,
        error: 'Adresse non trouvée',
      });
      return;
    }

    // Désactiver les autres adresses par défaut
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, req.user.id));

    // Activer celle-ci
    await db.update(addresses)
      .set({ isDefault: true })
      .where(eq(addresses.id, id));

    res.json({
      success: true,
      message: 'Adresse définie par défaut',
    });
  } catch (error) {
    console.error('SetDefaultAddress error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour',
    });
  }
};
