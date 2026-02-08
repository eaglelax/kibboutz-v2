import { Response } from 'express';
import { eq, or } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../db';
import { users, producerProfiles, addresses } from '../db/schema';
import { AuthRequest } from '../types';
import { hashPassword, comparePassword, generateToken } from '../utils';

// Inscription
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query.users.findFirst({
      where: or(
        eq(users.email, email),
        phone ? eq(users.phone, phone) : undefined
      ),
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Un compte avec cet email ou téléphone existe déjà',
      });
      return;
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(password);

    // Créer l'utilisateur
    const userRole = role === 'PRODUCER' ? 'PRODUCER' : 'CLIENT';
    const userStatus = role === 'PRODUCER' ? 'PENDING' : 'ACTIVE';

    const newUserId = createId();
    await db.insert(users).values({
      id: newUserId,
      email,
      phone: phone || null,
      passwordHash,
      firstName,
      lastName,
      role: userRole,
      status: userStatus,
    });

    // Si producteur, créer le profil
    if (role === 'PRODUCER' && req.body.businessName) {
      await db.insert(producerProfiles).values({
        userId: newUserId,
        businessName: req.body.businessName,
        description: req.body.description || null,
        location: req.body.location || '',
      });
    }

    // Récupérer l'utilisateur créé
    const user = await db.query.users.findFirst({
      where: eq(users.id, newUserId),
    });

    if (!user) {
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du compte',
      });
      return;
    }

    // Générer le token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'CLIENT' | 'PRODUCER' | 'DELIVERY' | 'ADMIN',
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        token,
      },
      message: role === 'PRODUCER'
        ? 'Compte créé. En attente de validation par un administrateur.'
        : 'Compte créé avec succès',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription',
    });
  }
};

// Connexion
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Vérifier le mot de passe
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Vérifier le statut
    if (user.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        error: 'Votre compte a été suspendu',
      });
      return;
    }

    if (user.status === 'PENDING') {
      res.status(403).json({
        success: false,
        error: 'Votre compte est en attente de validation',
      });
      return;
    }

    // Générer le token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'CLIENT' | 'PRODUCER' | 'DELIVERY' | 'ADMIN',
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion',
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié',
      });
      return;
    }

    const [user] = await db.select().from(users)
      .where(eq(users.id, req.user.id));

    // Récupérer profile et adresses séparément
    const [profile] = user ? await db.select().from(producerProfiles)
      .where(eq(producerProfiles.userId, user.id)) : [undefined];
    const userAddresses = user ? await db.select().from(addresses)
      .where(eq(addresses.userId, user.id)) : [];

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        profile: profile || null,
        addresses: userAddresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil',
    });
  }
};

// Mettre à jour le profil
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié',
      });
      return;
    }

    const { firstName, lastName, phone } = req.body;

    await db.update(users)
      .set({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profil mis à jour avec succès',
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil',
    });
  }
};

// Changer le mot de passe
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
      return;
    }

    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      res.status(400).json({
        success: false,
        error: 'Mot de passe actuel incorrect',
      });
      return;
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du changement de mot de passe',
    });
  }
};
