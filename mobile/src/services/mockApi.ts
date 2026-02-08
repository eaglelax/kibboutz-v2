/**
 * Mock API - Remplace les appels HTTP par des données locales en mémoire.
 * Toutes les fonctionnalités marchent offline, sans serveur API.
 * Pour revenir à l'API réelle, changer l'export dans api.ts.
 */

import {
  ApiResponse,
  AuthResponse,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Address,
  ProductImage,
} from '../types';

let idCounter = 1000;
const nextId = () => `mock_${++idCounter}`;

// ============== DONNÉES DE TEST ==============

const USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user_client',
    email: 'client@kibboutz.com',
    phone: '+237611111111',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'CLIENT',
    status: 'ACTIVE',
    passwordHash: 'client123',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'user_producer1',
    email: 'producteur@kibboutz.com',
    phone: '+237622222222',
    firstName: 'Paul',
    lastName: 'Fermier',
    role: 'PRODUCER',
    status: 'ACTIVE',
    passwordHash: 'producteur123',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
    profile: {
      id: 'prof_1',
      userId: 'user_producer1',
      businessName: 'Ferme du Soleil',
      description: 'Producteur bio depuis 10 ans à Yaoundé',
      location: 'Yaoundé, Cameroun',
      verified: true,
      verifiedAt: '2026-01-12T10:00:00.000Z',
    },
  },
  {
    id: 'user_producer2',
    email: 'marie@kibboutz.com',
    phone: '+237633333333',
    firstName: 'Marie',
    lastName: 'Agricole',
    role: 'PRODUCER',
    status: 'ACTIVE',
    passwordHash: 'marie123',
    createdAt: '2026-01-08T10:00:00.000Z',
    updatedAt: '2026-01-08T10:00:00.000Z',
    profile: {
      id: 'prof_2',
      userId: 'user_producer2',
      businessName: 'Les Jardins de Marie',
      description: 'Fruits et légumes frais de Douala',
      location: 'Douala, Cameroun',
      verified: true,
      verifiedAt: '2026-01-10T10:00:00.000Z',
    },
  },
  {
    id: 'user_admin',
    email: 'admin@kibboutz.com',
    phone: '+237644444444',
    firstName: 'Admin',
    lastName: 'Kibboutz',
    role: 'ADMIN',
    status: 'ACTIVE',
    passwordHash: 'admin123',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'user_livreur',
    email: 'livreur@kibboutz.com',
    phone: '+237655555555',
    firstName: 'Amadou',
    lastName: 'Express',
    role: 'DELIVERY',
    status: 'ACTIVE',
    passwordHash: 'livreur123',
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-01-05T10:00:00.000Z',
  },
];

const CATEGORIES: Category[] = [
  { id: 'cat_fruits', name: 'Fruits', slug: 'fruits', icon: '🍎', isActive: true, sortOrder: 1, children: [] },
  { id: 'cat_legumes', name: 'Légumes', slug: 'legumes', icon: '🥬', isActive: true, sortOrder: 2, children: [] },
  { id: 'cat_cereales', name: 'Céréales & Tubercules', slug: 'cereales-tubercules', icon: '🌾', isActive: true, sortOrder: 3, children: [] },
  { id: 'cat_elevage', name: "Produits d'élevage", slug: 'elevage', icon: '🥚', isActive: true, sortOrder: 4, children: [] },
  { id: 'cat_epices', name: 'Épices & Condiments', slug: 'epices', icon: '🌶️', isActive: true, sortOrder: 5, children: [] },
];

const PRODUCTS: Product[] = [
  {
    id: 'prod_1', producerId: 'user_producer2', categoryId: 'cat_fruits',
    name: 'Mangues Kent', description: 'Mangues juteuses et sucrées, parfaites pour les desserts ou à déguster nature.',
    price: 2500, unit: 'KG', minQuantity: 1, stock: 50, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_1', productId: 'prod_1', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', isPrimary: true }],
    category: CATEGORIES[0],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_2', producerId: 'user_producer2', categoryId: 'cat_fruits',
    name: 'Bananes plantain', description: 'Bananes plantain mûres, idéales pour le fry ou le pilé.',
    price: 1000, unit: 'TAS', minQuantity: 1, stock: 100, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_2', productId: 'prod_2', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', isPrimary: true }],
    category: CATEGORIES[0],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_3', producerId: 'user_producer2', categoryId: 'cat_fruits',
    name: 'Ananas pain de sucre', description: 'Ananas extra doux, sans acidité. Un délice tropical!',
    price: 2000, unit: 'UNIT', minQuantity: 1, stock: 25, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_3', productId: 'prod_3', url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400', isPrimary: true }],
    category: CATEGORIES[0],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_4', producerId: 'user_producer1', categoryId: 'cat_fruits',
    name: 'Papayes solo', description: 'Papayes douces et parfumées, riches en vitamines.',
    price: 1500, unit: 'UNIT', minQuantity: 1, stock: 30, origin: 'Yaoundé', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_4', productId: 'prod_4', url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400', isPrimary: true }],
    category: CATEGORIES[0],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
  {
    id: 'prod_5', producerId: 'user_producer2', categoryId: 'cat_legumes',
    name: 'Tomates fraîches', description: 'Tomates locales bien rouges, parfaites pour vos sauces.',
    price: 1500, unit: 'KG', minQuantity: 1, stock: 80, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_5', productId: 'prod_5', url: 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=400', isPrimary: true }],
    category: CATEGORIES[1],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_6', producerId: 'user_producer1', categoryId: 'cat_legumes',
    name: 'Oignons', description: 'Oignons frais du marché, savoureux et croquants.',
    price: 800, unit: 'KG', minQuantity: 1, stock: 150, origin: 'Yaoundé', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_6', productId: 'prod_6', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400', isPrimary: true }],
    category: CATEGORIES[1],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
  {
    id: 'prod_7', producerId: 'user_producer1', categoryId: 'cat_legumes',
    name: 'Gombo frais', description: 'Gombos tendres pour votre sauce gombo traditionnelle.',
    price: 1200, unit: 'KG', minQuantity: 1, stock: 40, origin: 'Yaoundé', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_7', productId: 'prod_7', url: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400', isPrimary: true }],
    category: CATEGORIES[1],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
  {
    id: 'prod_8', producerId: 'user_producer2', categoryId: 'cat_legumes',
    name: 'Piments rouges', description: 'Piments locaux très piquants pour relever vos plats.',
    price: 500, unit: 'TAS', minQuantity: 1, stock: 60, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_8', productId: 'prod_8', url: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400', isPrimary: true }],
    category: CATEGORIES[1],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_9', producerId: 'user_producer1', categoryId: 'cat_cereales',
    name: 'Riz local', description: 'Riz camerounais de première qualité, grain long.',
    price: 12000, unit: 'KG', minQuantity: 5, stock: 200, origin: 'Ndop', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_9', productId: 'prod_9', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', isPrimary: true }],
    category: CATEGORIES[2],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
  {
    id: 'prod_10', producerId: 'user_producer1', categoryId: 'cat_cereales',
    name: 'Manioc frais', description: 'Manioc doux, parfait pour le tapioca ou le bâton.',
    price: 500, unit: 'KG', minQuantity: 1, stock: 100, origin: 'Yaoundé', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_10', productId: 'prod_10', url: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=400', isPrimary: true }],
    category: CATEGORIES[2],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
  {
    id: 'prod_11', producerId: 'user_producer2', categoryId: 'cat_cereales',
    name: 'Ignames', description: 'Ignames blanches de qualité supérieure.',
    price: 1500, unit: 'KG', minQuantity: 1, stock: 70, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_11', productId: 'prod_11', url: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400', isPrimary: true }],
    category: CATEGORIES[2],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_12', producerId: 'user_producer1', categoryId: 'cat_cereales',
    name: 'Maïs frais', description: 'Épis de maïs frais, parfaits pour griller ou bouillir.',
    price: 200, unit: 'UNIT', minQuantity: 1, stock: 150, origin: 'Yaoundé', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_12', productId: 'prod_12', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400', isPrimary: true }],
    category: CATEGORIES[2],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
  {
    id: 'prod_13', producerId: 'user_producer1', categoryId: 'cat_elevage',
    name: 'Poulet de chair', description: 'Poulet élevé naturellement, sans hormones.',
    price: 4500, unit: 'UNIT', minQuantity: 1, stock: 20, origin: 'Yaoundé', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_13', productId: 'prod_13', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400', isPrimary: true }],
    category: CATEGORIES[3],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
  {
    id: 'prod_14', producerId: 'user_producer2', categoryId: 'cat_elevage',
    name: 'Oeufs de ferme', description: 'Oeufs frais de poules élevées en plein air.',
    price: 100, unit: 'UNIT', minQuantity: 6, stock: 500, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_14', productId: 'prod_14', url: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=400', isPrimary: true }],
    category: CATEGORIES[3],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_15', producerId: 'user_producer2', categoryId: 'cat_epices',
    name: 'Gingembre frais', description: 'Gingembre bio pour vos tisanes et plats.',
    price: 2000, unit: 'KG', minQuantity: 1, stock: 30, origin: 'Douala', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_15', productId: 'prod_15', url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400', isPrimary: true }],
    category: CATEGORIES[4],
    producer: { id: 'user_producer2', firstName: 'Marie', lastName: 'Agricole' },
  },
  {
    id: 'prod_16', producerId: 'user_producer1', categoryId: 'cat_epices',
    name: 'Ail local', description: 'Ail parfumé pour relever tous vos plats.',
    price: 3000, unit: 'KG', minQuantity: 1, stock: 25, origin: 'Yaoundé', isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z', updatedAt: '2026-02-01T10:00:00.000Z',
    images: [{ id: 'img_16', productId: 'prod_16', url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=400', isPrimary: true }],
    category: CATEGORIES[4],
    producer: { id: 'user_producer1', firstName: 'Paul', lastName: 'Fermier' },
  },
];

let ADDRESSES: Address[] = [
  {
    id: 'addr_1', userId: 'user_client', label: 'Maison', street: '123 Rue de la Paix',
    fullAddress: '123 Rue de la Paix, Akwa', city: 'Douala', country: 'Cameroun',
    quarter: 'Akwa', isDefault: true,
  },
  {
    id: 'addr_2', userId: 'user_client', label: 'Bureau', street: '45 Boulevard de la Liberté',
    fullAddress: '45 Boulevard de la Liberté, Bonanjo', city: 'Douala', country: 'Cameroun',
    quarter: 'Bonanjo', isDefault: false,
  },
];

let CART_ITEMS: CartItem[] = [];
let ORDERS: Order[] = [
  {
    id: 'order_1', orderNumber: 'KBZ-20260201-001', userId: 'user_client', addressId: 'addr_1',
    status: 'DELIVERED', subtotal: 5000, deliveryFee: 500, total: 5500,
    paymentMethod: 'CASH_ON_DELIVERY', paymentStatus: 'PAID',
    createdAt: '2026-02-01T14:00:00.000Z', updatedAt: '2026-02-02T10:00:00.000Z',
    items: [
      { id: 'oi_1', orderId: 'order_1', productId: 'prod_1', productName: 'Mangues Kent', quantity: 2, price: 2500, unitPrice: 2500, subtotal: 5000 },
    ],
    address: ADDRESSES[0],
  },
  {
    id: 'order_2', orderNumber: 'KBZ-20260205-002', userId: 'user_client', addressId: 'addr_1',
    status: 'PREPARING', subtotal: 3500, deliveryFee: 500, total: 4000,
    paymentMethod: 'CASH_ON_DELIVERY', paymentStatus: 'PENDING',
    createdAt: '2026-02-05T09:00:00.000Z', updatedAt: '2026-02-05T11:00:00.000Z',
    items: [
      { id: 'oi_2', orderId: 'order_2', productId: 'prod_5', productName: 'Tomates fraîches', quantity: 1, price: 1500, unitPrice: 1500, subtotal: 1500 },
      { id: 'oi_3', orderId: 'order_2', productId: 'prod_3', productName: 'Ananas pain de sucre', quantity: 1, price: 2000, unitPrice: 2000, subtotal: 2000 },
    ],
    address: ADDRESSES[0],
  },
];

// ============== ÉTAT LOCAL ==============

let currentUser: User | null = null;
let currentToken: string | null = null;

// Simuler un délai réseau
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============== MOCK API CLIENT ==============

class MockApiClient {
  async setToken(token: string | null): Promise<void> {
    currentToken = token;
  }

  async clearToken(): Promise<void> {
    currentToken = null;
    currentUser = null;
  }

  async getToken(): Promise<string | null> {
    return currentToken;
  }

  // ============== AUTH ==============

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'CLIENT' | 'PRODUCER';
  }): Promise<ApiResponse<AuthResponse>> {
    await delay();

    const exists = USERS.find(u => u.email === data.email);
    if (exists) {
      return { success: false, error: 'Un compte avec cet email existe déjà' };
    }

    const newUser: User & { passwordHash: string } = {
      id: nextId(),
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'CLIENT',
      status: 'ACTIVE',
      passwordHash: data.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    USERS.push(newUser);
    const token = `mock_token_${newUser.id}`;
    currentToken = token;
    currentUser = { ...newUser, passwordHash: undefined } as any;

    const { passwordHash, ...user } = newUser;
    return {
      success: true,
      data: { user, token },
      message: 'Compte créé avec succès',
    };
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    await delay();

    const user = USERS.find(u => u.email === email && u.passwordHash === password);

    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    if (user.status === 'SUSPENDED') {
      return { success: false, error: 'Votre compte a été suspendu' };
    }

    const token = `mock_token_${user.id}`;
    currentToken = token;
    const { passwordHash, ...userData } = user;
    currentUser = userData;

    return {
      success: true,
      data: {
        user: userData,
        token,
      },
    };
  }

  async logout(): Promise<void> {
    currentToken = null;
    currentUser = null;
  }

  async getMe(): Promise<ApiResponse<User>> {
    await delay(100);

    if (!currentToken || !currentUser) {
      return { success: false, error: 'Non authentifié' };
    }

    const user = USERS.find(u => u.id === currentUser!.id);
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    const { passwordHash, ...userData } = user;
    const userAddresses = ADDRESSES.filter(a => a.userId === user.id);

    return {
      success: true,
      data: { ...userData, addresses: userAddresses },
    };
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    await delay();

    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const userIdx = USERS.findIndex(u => u.id === currentUser!.id);
    if (userIdx === -1) return { success: false, error: 'Utilisateur non trouvé' };

    if (data.firstName) USERS[userIdx].firstName = data.firstName;
    if (data.lastName) USERS[userIdx].lastName = data.lastName;
    if (data.phone) USERS[userIdx].phone = data.phone;

    const { passwordHash, ...userData } = USERS[userIdx];
    currentUser = userData;

    return { success: true, data: userData, message: 'Profil mis à jour' };
  }

  // ============== CATEGORIES ==============

  async getCategories(): Promise<ApiResponse<Category[]>> {
    await delay(100);
    return { success: true, data: CATEGORIES };
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    await delay(100);
    const cat = CATEGORIES.find(c => c.id === id);
    if (!cat) return { success: false, error: 'Catégorie non trouvée' };

    const catProducts = PRODUCTS.filter(p => p.categoryId === id && p.isActive);
    return { success: true, data: { ...cat, products: catProducts } as any };
  }

  // ============== PRODUCTS ==============

  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    await delay(200);

    let filtered = PRODUCTS.filter(p => p.isActive);

    if (params?.category) {
      filtered = filtered.filter(p => p.categoryId === params.category);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    await delay(100);
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return { success: false, error: 'Produit non trouvé' };
    return { success: true, data: product };
  }

  // ============== PRODUCER PRODUCTS ==============

  async getMyProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    await delay(200);
    if (!currentUser) return { success: false, error: 'Non authentifié' };
    if (currentUser.role !== 'PRODUCER') return { success: false, error: 'Accès réservé aux producteurs' };

    let filtered = PRODUCTS.filter(p => p.producerId === currentUser!.id);

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    return {
      success: true,
      data: filtered.slice(offset, offset + limit),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    unit: string;
    categoryId: string;
    stock: number;
    minQuantity?: number;
    origin?: string;
  }): Promise<ApiResponse<Product>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };
    if (currentUser.role !== 'PRODUCER') return { success: false, error: 'Accès réservé aux producteurs' };

    const category = CATEGORIES.find(c => c.id === data.categoryId);

    const product: Product = {
      id: nextId(),
      producerId: currentUser.id,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      unit: data.unit as any,
      minQuantity: data.minQuantity || 1,
      stock: data.stock,
      origin: data.origin,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [],
      category,
      producer: { id: currentUser.id, firstName: currentUser.firstName, lastName: currentUser.lastName },
    };

    PRODUCTS.push(product);
    return { success: true, data: product, message: 'Produit créé avec succès' };
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return { success: false, error: 'Produit non trouvé' };
    if (product.producerId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' };
    }

    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.unit !== undefined) product.unit = data.unit;
    if (data.categoryId !== undefined) {
      product.categoryId = data.categoryId;
      product.category = CATEGORIES.find(c => c.id === data.categoryId);
    }
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.minQuantity !== undefined) product.minQuantity = data.minQuantity;
    if (data.origin !== undefined) product.origin = data.origin;
    if (data.isActive !== undefined) product.isActive = data.isActive;
    product.updatedAt = new Date().toISOString();

    return { success: true, data: product, message: 'Produit mis à jour' };
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const idx = PRODUCTS.findIndex(p => p.id === id);
    if (idx === -1) return { success: false, error: 'Produit non trouvé' };
    if (PRODUCTS[idx].producerId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' };
    }

    PRODUCTS.splice(idx, 1);
    return { success: true, message: 'Produit supprimé' };
  }

  async addProductImage(productId: string, data: { url: string; isPrimary?: boolean }): Promise<ApiResponse<ProductImage>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return { success: false, error: 'Produit non trouvé' };

    const image: ProductImage = {
      id: nextId(),
      productId,
      url: data.url,
      isPrimary: data.isPrimary || !product.images?.length,
    };

    if (!product.images) product.images = [];
    product.images.push(image);

    return { success: true, data: image, message: 'Image ajoutée' };
  }

  async deleteProductImage(productId: string, imageId: string): Promise<ApiResponse> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product || !product.images) return { success: false, error: 'Produit non trouvé' };

    product.images = product.images.filter(img => img.id !== imageId);
    return { success: true, message: 'Image supprimée' };
  }

  async uploadImage(_uri: string): Promise<ApiResponse<{ url: string }>> {
    await delay(500);
    // En mode mock, on retourne un placeholder
    return {
      success: true,
      data: { url: `https://via.placeholder.com/400x400?text=Product` },
      message: 'Image uploadée avec succès',
    };
  }

  // ============== CART ==============

  private getCartResponse(): Cart {
    const items = CART_ITEMS.filter(i => currentUser && i.userId === currentUser.id);
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return { items, subtotal, itemCount: items.length };
  }

  async getCart(): Promise<ApiResponse<Cart>> {
    await delay(100);
    if (!currentUser) return { success: false, error: 'Non authentifié' };
    return { success: true, data: this.getCartResponse() };
  }

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const product = PRODUCTS.find(p => p.id === productId && p.isActive);
    if (!product) return { success: false, error: 'Produit non trouvé' };
    if (product.stock < quantity) return { success: false, error: `Stock insuffisant. Disponible: ${product.stock}` };

    const existing = CART_ITEMS.find(i => i.userId === currentUser!.id && i.productId === productId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) return { success: false, error: `Stock insuffisant. Disponible: ${product.stock}` };
      existing.quantity = newQty;
    } else {
      CART_ITEMS.push({
        id: nextId(),
        userId: currentUser.id,
        productId,
        quantity,
        product,
      });
    }

    return { success: true, data: this.getCartResponse(), message: 'Produit ajouté au panier' };
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const item = CART_ITEMS.find(i => i.id === itemId && i.userId === currentUser!.id);
    if (!item) return { success: false, error: 'Item non trouvé' };

    if (item.product.stock < quantity) {
      return { success: false, error: `Stock insuffisant. Disponible: ${item.product.stock}` };
    }

    item.quantity = quantity;
    return { success: true, data: this.getCartResponse(), message: 'Quantité mise à jour' };
  }

  async removeFromCart(itemId: string): Promise<ApiResponse> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    CART_ITEMS = CART_ITEMS.filter(i => !(i.id === itemId && i.userId === currentUser!.id));
    return { success: true, message: 'Produit retiré du panier' };
  }

  async clearCart(): Promise<ApiResponse> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    CART_ITEMS = CART_ITEMS.filter(i => i.userId !== currentUser!.id);
    return { success: true, message: 'Panier vidé' };
  }

  // ============== ORDERS ==============

  async createOrder(data: { addressId: string; notes?: string }): Promise<ApiResponse<Order>> {
    await delay(500);
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const address = ADDRESSES.find(a => a.id === data.addressId && a.userId === currentUser!.id);
    if (!address) return { success: false, error: 'Adresse non trouvée' };

    const cartItems = CART_ITEMS.filter(i => i.userId === currentUser!.id);
    if (cartItems.length === 0) return { success: false, error: 'Le panier est vide' };

    const subtotal = cartItems.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    const deliveryFee = subtotal > 10000 ? 0 : 500;

    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: nextId(),
      orderId: '',
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      unitPrice: item.product.price,
      subtotal: item.product.price * item.quantity,
      product: item.product,
    }));

    const order: Order = {
      id: nextId(),
      orderNumber: `KBZ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(ORDERS.length + 1).padStart(3, '0')}`,
      userId: currentUser.id,
      addressId: data.addressId,
      status: 'PENDING',
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems,
      address,
    };

    orderItems.forEach(i => i.orderId = order.id);
    ORDERS.push(order);

    // Vider le panier
    CART_ITEMS = CART_ITEMS.filter(i => i.userId !== currentUser!.id);

    return { success: true, data: order, message: 'Commande créée avec succès' };
  }

  async getMyOrders(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<Order[]>> {
    await delay(200);
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    let filtered = ORDERS.filter(o => o.userId === currentUser!.id);

    if (params?.status) {
      filtered = filtered.filter(o => o.status === params.status);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    return {
      success: true,
      data: filtered.slice(offset, offset + limit),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  async getProducerOrders(params?: { page?: number; limit?: number }): Promise<ApiResponse<Order[]>> {
    await delay(200);
    if (!currentUser) return { success: false, error: 'Non authentifié' };
    if (currentUser.role !== 'PRODUCER') return { success: false, error: 'Accès réservé aux producteurs' };

    const myProductIds = PRODUCTS.filter(p => p.producerId === currentUser!.id).map(p => p.id);
    const filtered = ORDERS.filter(o =>
      o.items?.some(item => myProductIds.includes(item.productId))
    );

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    return {
      success: true,
      data: filtered.slice(offset, offset + limit),
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    };
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    await delay(100);
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const order = ORDERS.find(o => o.id === id);
    if (!order) return { success: false, error: 'Commande non trouvée' };

    return { success: true, data: order };
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const order = ORDERS.find(o => o.id === id && o.userId === currentUser!.id);
    if (!order) return { success: false, error: 'Commande non trouvée' };

    if (order.status !== 'PENDING') {
      return { success: false, error: 'Seules les commandes en attente peuvent être annulées' };
    }

    order.status = 'CANCELLED';
    order.updatedAt = new Date().toISOString();

    return { success: true, data: order, message: 'Commande annulée' };
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const order = ORDERS.find(o => o.id === id);
    if (!order) return { success: false, error: 'Commande non trouvée' };

    order.status = status as any;
    order.updatedAt = new Date().toISOString();

    return { success: true, data: order, message: 'Statut mis à jour' };
  }

  // ============== ADDRESSES ==============

  async getAddresses(): Promise<ApiResponse<Address[]>> {
    await delay(100);
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const userAddresses = ADDRESSES.filter(a => a.userId === currentUser!.id);
    return { success: true, data: userAddresses };
  }

  async createAddress(data: {
    label: string;
    fullAddress: string;
    city: string;
    quarter?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<Address>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    if (data.isDefault) {
      ADDRESSES.forEach(a => {
        if (a.userId === currentUser!.id) a.isDefault = false;
      });
    }

    const userAddresses = ADDRESSES.filter(a => a.userId === currentUser!.id);
    const shouldBeDefault = data.isDefault || userAddresses.length === 0;

    const address: Address = {
      id: nextId(),
      userId: currentUser.id,
      label: data.label,
      street: data.fullAddress,
      fullAddress: data.fullAddress,
      city: data.city,
      country: 'Cameroun',
      quarter: data.quarter,
      isDefault: shouldBeDefault,
    };

    ADDRESSES.push(address);
    return { success: true, data: address, message: 'Adresse créée' };
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<ApiResponse<Address>> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const addr = ADDRESSES.find(a => a.id === id && a.userId === currentUser!.id);
    if (!addr) return { success: false, error: 'Adresse non trouvée' };

    Object.assign(addr, data);
    return { success: true, data: addr, message: 'Adresse mise à jour' };
  }

  async deleteAddress(id: string): Promise<ApiResponse> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const addr = ADDRESSES.find(a => a.id === id && a.userId === currentUser!.id);
    if (!addr) return { success: false, error: 'Adresse non trouvée' };

    ADDRESSES = ADDRESSES.filter(a => a.id !== id);

    if (addr.isDefault) {
      const remaining = ADDRESSES.filter(a => a.userId === currentUser!.id);
      if (remaining.length > 0) remaining[0].isDefault = true;
    }

    return { success: true, message: 'Adresse supprimée' };
  }

  async setDefaultAddress(id: string): Promise<ApiResponse> {
    await delay();
    if (!currentUser) return { success: false, error: 'Non authentifié' };

    const addr = ADDRESSES.find(a => a.id === id && a.userId === currentUser!.id);
    if (!addr) return { success: false, error: 'Adresse non trouvée' };

    ADDRESSES.forEach(a => {
      if (a.userId === currentUser!.id) a.isDefault = (a.id === id);
    });

    return { success: true, message: 'Adresse définie par défaut' };
  }
}

export const mockApi = new MockApiClient();
export default mockApi;
