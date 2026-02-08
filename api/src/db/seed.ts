import dotenv from 'dotenv';
dotenv.config();

import { createId } from '@paralleldrive/cuid2';
import { db, poolConnection } from './index';
import { users, producerProfiles, categories, products, productImages, addresses } from './schema';
import { hashPassword, slugify } from '../utils';

const seedData = async () => {
  console.log('🌱 Début du seeding de la base de données...\n');

  try {
    // ============== UTILISATEURS ==============
    console.log('👥 Création des utilisateurs...');

    const adminPasswordHash = await hashPassword('admin123');
    const clientPasswordHash = await hashPassword('client123');
    const producerPasswordHash = await hashPassword('producteur123');
    const deliveryPasswordHash = await hashPassword('livreur123');

    // Admin
    const adminId = createId();
    await db.insert(users).values({
      id: adminId,
      email: 'admin@kibboutz.com',
      phone: '+237600000000',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Kibboutz',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    const admin = { id: adminId };

    // Client
    const clientId = createId();
    await db.insert(users).values({
      id: clientId,
      email: 'client@kibboutz.com',
      phone: '+237611111111',
      passwordHash: clientPasswordHash,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'CLIENT',
      status: 'ACTIVE',
    });
    const client = { id: clientId };

    // Producteur 1
    const producer1Id = createId();
    await db.insert(users).values({
      id: producer1Id,
      email: 'producteur@kibboutz.com',
      phone: '+237622222222',
      passwordHash: producerPasswordHash,
      firstName: 'Marie',
      lastName: 'Agricole',
      role: 'PRODUCER',
      status: 'ACTIVE',
    });
    const producer1 = { id: producer1Id };

    // Producteur 2
    const producer2Id = createId();
    await db.insert(users).values({
      id: producer2Id,
      email: 'ferme@kibboutz.com',
      phone: '+237633333333',
      passwordHash: producerPasswordHash,
      firstName: 'Paul',
      lastName: 'Fermier',
      role: 'PRODUCER',
      status: 'ACTIVE',
    });
    const producer2 = { id: producer2Id };

    // Livreur
    const deliveryId = createId();
    await db.insert(users).values({
      id: deliveryId,
      email: 'livreur@kibboutz.com',
      phone: '+237644444444',
      passwordHash: deliveryPasswordHash,
      firstName: 'Pierre',
      lastName: 'Rapide',
      role: 'DELIVERY',
      status: 'ACTIVE',
    });
    const delivery = { id: deliveryId };

    console.log('  ✓ 5 utilisateurs créés');

    // ============== PROFILS PRODUCTEURS ==============
    console.log('🏪 Création des profils producteurs...');

    await db.insert(producerProfiles).values([
      {
        userId: producer1.id,
        businessName: 'Ferme du Soleil',
        description: 'Producteur de fruits et légumes bio depuis 10 ans. Nous cultivons avec amour et respect de la nature.',
        location: 'Douala, Cameroun',
        verified: true,
        verifiedAt: new Date(),
      },
      {
        userId: producer2.id,
        businessName: 'Les Jardins de Paul',
        description: 'Spécialiste des tubercules et céréales locales. Qualité garantie du champ à votre table.',
        location: 'Yaoundé, Cameroun',
        verified: true,
        verifiedAt: new Date(),
      },
    ]);

    console.log('  ✓ 2 profils producteurs créés');

    // ============== CATÉGORIES ==============
    console.log('📂 Création des catégories...');

    const categoriesData = [
      { name: 'Fruits', slug: 'fruits', icon: '🍎', sortOrder: 1 },
      { name: 'Légumes', slug: 'legumes', icon: '🥬', sortOrder: 2 },
      { name: 'Céréales & Tubercules', slug: 'cereales-tubercules', icon: '🌾', sortOrder: 3 },
      { name: 'Produits d\'élevage', slug: 'elevage', icon: '🥚', sortOrder: 4 },
      { name: 'Épices & Condiments', slug: 'epices', icon: '🌶️', sortOrder: 5 },
    ];

    const insertedCategories: { id: string; slug: string }[] = [];

    for (const cat of categoriesData) {
      const catId = createId();
      await db.insert(categories).values({ ...cat, id: catId });
      insertedCategories.push({ id: catId, slug: cat.slug });
    }

    console.log('  ✓ 5 catégories créées');

    // ============== PRODUITS ==============
    console.log('📦 Création des produits...');

    const getCategoryId = (slug: string) => insertedCategories.find(c => c.slug === slug)?.id;

    const productsData = [
      // Fruits
      {
        producerId: producer1.id,
        categoryId: getCategoryId('fruits')!,
        name: 'Mangues Kent',
        description: 'Mangues juteuses et sucrées, parfaites pour les desserts ou à déguster nature.',
        price: 2500,
        unit: 'KG' as const,
        stock: 50,
        origin: 'Douala',
      },
      {
        producerId: producer1.id,
        categoryId: getCategoryId('fruits')!,
        name: 'Bananes plantain',
        description: 'Bananes plantain mûres, idéales pour le fry ou le pilé.',
        price: 1000,
        unit: 'TAS' as const,
        stock: 100,
        origin: 'Douala',
      },
      {
        producerId: producer2.id,
        categoryId: getCategoryId('fruits')!,
        name: 'Papayes solo',
        description: 'Papayes douces et parfumées, riches en vitamines.',
        price: 1500,
        unit: 'UNIT' as const,
        stock: 30,
        origin: 'Yaoundé',
      },
      {
        producerId: producer1.id,
        categoryId: getCategoryId('fruits')!,
        name: 'Ananas pain de sucre',
        description: 'Ananas extra doux, sans acidité. Un délice tropical!',
        price: 2000,
        unit: 'UNIT' as const,
        stock: 25,
        origin: 'Douala',
      },
      // Légumes
      {
        producerId: producer1.id,
        categoryId: getCategoryId('legumes')!,
        name: 'Tomates fraîches',
        description: 'Tomates locales bien rouges, parfaites pour vos sauces.',
        price: 1500,
        unit: 'KG' as const,
        stock: 80,
        origin: 'Douala',
      },
      {
        producerId: producer2.id,
        categoryId: getCategoryId('legumes')!,
        name: 'Oignons',
        description: 'Oignons frais du marché, savoureux et croquants.',
        price: 800,
        unit: 'KG' as const,
        stock: 150,
        origin: 'Yaoundé',
      },
      {
        producerId: producer1.id,
        categoryId: getCategoryId('legumes')!,
        name: 'Piments rouges',
        description: 'Piments locaux très piquants pour relever vos plats.',
        price: 500,
        unit: 'TAS' as const,
        stock: 60,
        origin: 'Douala',
      },
      {
        producerId: producer2.id,
        categoryId: getCategoryId('legumes')!,
        name: 'Gombo frais',
        description: 'Gombos tendres pour votre sauce gombo traditionnelle.',
        price: 1200,
        unit: 'KG' as const,
        stock: 40,
        origin: 'Yaoundé',
      },
      // Céréales & Tubercules
      {
        producerId: producer2.id,
        categoryId: getCategoryId('cereales-tubercules')!,
        name: 'Riz local',
        description: 'Riz camerounais de première qualité, grain long.',
        price: 12000,
        unit: 'KG' as const,
        minQuantity: 5,
        stock: 200,
        origin: 'Ndop',
      },
      {
        producerId: producer2.id,
        categoryId: getCategoryId('cereales-tubercules')!,
        name: 'Manioc frais',
        description: 'Manioc doux, parfait pour le tapioca ou le bâton.',
        price: 500,
        unit: 'KG' as const,
        stock: 100,
        origin: 'Yaoundé',
      },
      {
        producerId: producer1.id,
        categoryId: getCategoryId('cereales-tubercules')!,
        name: 'Ignames',
        description: 'Ignames blanches de qualité supérieure.',
        price: 1500,
        unit: 'KG' as const,
        stock: 70,
        origin: 'Douala',
      },
      {
        producerId: producer2.id,
        categoryId: getCategoryId('cereales-tubercules')!,
        name: 'Maïs frais',
        description: 'Épis de maïs frais, parfaits pour griller ou bouillir.',
        price: 200,
        unit: 'UNIT' as const,
        stock: 150,
        origin: 'Yaoundé',
      },
      // Produits d'élevage
      {
        producerId: producer1.id,
        categoryId: getCategoryId('elevage')!,
        name: 'Oeufs de ferme',
        description: 'Oeufs frais de poules élevées en plein air.',
        price: 100,
        unit: 'UNIT' as const,
        minQuantity: 6,
        stock: 500,
        origin: 'Douala',
      },
      {
        producerId: producer2.id,
        categoryId: getCategoryId('elevage')!,
        name: 'Poulet de chair',
        description: 'Poulet élevé naturellement, sans hormones.',
        price: 4500,
        unit: 'UNIT' as const,
        stock: 20,
        origin: 'Yaoundé',
      },
      // Épices & Condiments
      {
        producerId: producer1.id,
        categoryId: getCategoryId('epices')!,
        name: 'Gingembre frais',
        description: 'Gingembre bio pour vos tisanes et plats.',
        price: 2000,
        unit: 'KG' as const,
        stock: 30,
        origin: 'Douala',
      },
      {
        producerId: producer2.id,
        categoryId: getCategoryId('epices')!,
        name: 'Ail local',
        description: 'Ail parfumé pour relever tous vos plats.',
        price: 3000,
        unit: 'KG' as const,
        stock: 25,
        origin: 'Yaoundé',
      },
    ];

    const insertedProducts: { id: string }[] = [];

    for (const prod of productsData) {
      const prodId = createId();
      await db.insert(products).values({ ...prod, id: prodId });
      insertedProducts.push({ id: prodId });
    }

    console.log('  ✓ 16 produits créés');

    // ============== IMAGES PRODUITS ==============
    console.log('🖼️ Ajout des images placeholder...');

    // Ajouter une image placeholder pour chaque produit
    for (const prod of insertedProducts) {
      await db.insert(productImages).values({
        productId: prod.id,
        url: `https://placehold.co/400x400/22c55e/white?text=Kibboutz`,
        isPrimary: true,
      });
    }

    console.log('  ✓ Images ajoutées');

    // ============== ADRESSES ==============
    console.log('📍 Création des adresses...');

    await db.insert(addresses).values([
      {
        userId: client.id,
        label: 'Maison',
        fullAddress: '123 Rue de la Paix, Akwa',
        city: 'Douala',
        quarter: 'Akwa',
        isDefault: true,
      },
      {
        userId: client.id,
        label: 'Bureau',
        fullAddress: '45 Boulevard de la Liberté, Bonanjo',
        city: 'Douala',
        quarter: 'Bonanjo',
        isDefault: false,
      },
    ]);

    console.log('  ✓ 2 adresses créées');

    // ============== FIN ==============
    console.log('\n✅ Seeding terminé avec succès!');
    console.log('\n📋 Comptes de test:');
    console.log('  Admin:      admin@kibboutz.com / admin123');
    console.log('  Client:     client@kibboutz.com / client123');
    console.log('  Producteur: producteur@kibboutz.com / producteur123');
    console.log('  Livreur:    livreur@kibboutz.com / livreur123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await poolConnection.end();
    process.exit(0);
  }
};

seedData();
