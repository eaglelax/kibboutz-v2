import { Response } from 'express';
import { eq, and, like, sql, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../db';
import { users, producerProfiles, orders } from '../db/schema';
import { AuthRequest, Role, UserStatus } from '../types';
import { getPaginationParams, getTotalPages, hashPassword } from '../utils';

// Obtenir tous les utilisateurs (Admin)
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query as { page?: string; limit?: string });
    const { role, status, search } = req.query;

    const conditions = [];

    if (role) {
      conditions.push(eq(users.role, role as Role));
    }

    if (status) {
      conditions.push(eq(users.status, status as UserStatus));
    }

    if (search) {
      conditions.push(
        sql`(${users.email} LIKE ${`%${search}%`} OR ${users.firstName} LIKE ${`%${search}%`} OR ${users.lastName} LIKE ${`%${search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const total = Number(count);

    const userList = await db.query.users.findMany({
      where: whereClause,
      columns: {
        passwordHash: false,
      },
      with: {
        profile: true,
      },
      orderBy: [desc(users.createdAt)],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: userList,
      pagination: {
        page,
        limit,
        total,
        totalPages: getTotalPages(total, limit),
      },
    });
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs',
    });
  }
};

// Obtenir un utilisateur par ID (Admin)
export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false,
      },
      with: {
        profile: true,
        addresses: true,
        orders: {
          limit: 10,
          orderBy: [desc(orders.createdAt)],
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('GetUser error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'utilisateur',
    });
  }
};

// Valider un producteur (Admin)
export const verifyProducer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const user = await db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.role, 'PRODUCER')),
      with: {
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Producteur non trouvé',
      });
      return;
    }

    if (user.status === 'ACTIVE') {
      res.status(400).json({
        success: false,
        error: 'Ce producteur est déjà validé',
      });
      return;
    }

    // Activer le compte
    await db.update(users)
      .set({
        status: 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Marquer le profil comme vérifié
    if (user.profile) {
      await db.update(producerProfiles)
        .set({
          verified: true,
          verifiedAt: new Date(),
        })
        .where(eq(producerProfiles.userId, id));
    }

    res.json({
      success: true,
      message: 'Producteur validé avec succès',
    });
  } catch (error) {
    console.error('VerifyProducer error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la validation du producteur',
    });
  }
};

// Suspendre un utilisateur (Admin)
export const suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
      return;
    }

    if (user.role === 'ADMIN') {
      res.status(400).json({
        success: false,
        error: 'Impossible de suspendre un administrateur',
      });
      return;
    }

    await db.update(users)
      .set({
        status: 'SUSPENDED',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    res.json({
      success: true,
      message: 'Utilisateur suspendu',
    });
  } catch (error) {
    console.error('SuspendUser error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suspension de l\'utilisateur',
    });
  }
};

// Réactiver un utilisateur (Admin)
export const activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
      return;
    }

    await db.update(users)
      .set({
        status: 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    res.json({
      success: true,
      message: 'Utilisateur réactivé',
    });
  } catch (error) {
    console.error('ActivateUser error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réactivation de l\'utilisateur',
    });
  }
};

// Créer un livreur (Admin)
export const createDeliveryPerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Un compte avec cet email existe déjà',
      });
      return;
    }

    const passwordHash = await hashPassword(password);

    const newUserId = createId();
    await db.insert(users).values({
      id: newUserId,
      email,
      phone: phone || null,
      passwordHash,
      firstName,
      lastName,
      role: 'DELIVERY',
      status: 'ACTIVE',
    });

    const user = await db.query.users.findFirst({
      where: eq(users.id, newUserId),
      columns: {
        passwordHash: false,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Compte livreur créé avec succès',
    });
  } catch (error) {
    console.error('CreateDeliveryPerson error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du compte livreur',
    });
  }
};

// Obtenir les livreurs (Admin)
export const getDeliveryPersons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deliveryPersons = await db.query.users.findMany({
      where: eq(users.role, 'DELIVERY'),
      columns: {
        passwordHash: false,
      },
      orderBy: [desc(users.createdAt)],
    });

    res.json({
      success: true,
      data: deliveryPersons,
    });
  } catch (error) {
    console.error('GetDeliveryPersons error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des livreurs',
    });
  }
};

// Obtenir les statistiques (Admin Dashboard)
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Compter les utilisateurs par rôle
    const [clientCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'CLIENT'));
    const [producerCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'PRODUCER'));
    const [pendingProducers] = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.role, 'PRODUCER'), eq(users.status, 'PENDING')));

    // Compter les commandes par statut
    const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [pendingOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'PENDING'));
    const [deliveredOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'DELIVERED'));

    // Calculer le CA total
    const [revenue] = await db.select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)` }).from(orders).where(eq(orders.status, 'DELIVERED'));

    // Commandes récentes
    const recentOrders = await db.query.orders.findMany({
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        users: {
          clients: Number(clientCount.count),
          producers: Number(producerCount.count),
          pendingProducers: Number(pendingProducers.count),
        },
        orders: {
          total: Number(totalOrders.count),
          pending: Number(pendingOrders.count),
          delivered: Number(deliveredOrders.count),
        },
        revenue: Number(revenue.total),
        recentOrders,
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
    });
  }
};
