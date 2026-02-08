# PLAN DE SPRINT - 1 SEMAINE
## Livrable : MVP Kibboutz Fonctionnel (Sans Validation Paiement)

---

## 1. PÉRIMÈTRE DU SPRINT

### 1.1 Ce qui sera livré

| Module | Fonctionnalités incluses |
|--------|--------------------------|
| **Auth** | Inscription, connexion, profils (Client, Producteur, Admin) |
| **Catalogue** | Catégories, produits, recherche, filtres |
| **Commandes** | Panier, validation, suivi statuts |
| **Livraison** | Attribution manuelle, suivi simplifié |
| **Paiement** | Mode "À la livraison" uniquement (COD) |
| **Admin** | Dashboard basique, gestion utilisateurs/commandes |

### 1.2 Ce qui est EXCLU (V2+)

- ❌ Intégration Mobile Money (Orange/MTN)
- ❌ Application livreur dédiée (gestion via admin)
- ❌ Notifications push/SMS automatiques
- ❌ Suivi GPS temps réel
- ❌ Système de notation/avis
- ❌ Programme fidélité
- ❌ Recherche Elasticsearch (recherche SQL simple)

### 1.3 Stack technique retenue (Rapidité)

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend Web** | Next.js 14 (App Router) | SSR, rapidité dev, TypeScript |
| **Mobile** | React Native Expo | Build rapide, cross-platform |
| **Backend** | Next.js API Routes + Drizzle ORM | Fullstack, léger, déploiement facile |
| **BDD** | MySQL (XAMPP local / PlanetScale prod) | Compatible XAMPP, gratuit |
| **Auth** | NextAuth.js | Intégration native Next.js |
| **Stockage images** | Cloudinary | Upload simple, gratuit tier |
| **Hébergement** | Vercel (web) + Expo EAS (mobile) | Déploiement instantané |

---

## 2. ORGANISATION DE L'ÉQUIPE

### 2.1 Répartition des rôles

| Personne | Responsabilités |
|----------|-----------------|
| **Dev 1 (Backend Lead)** | API, BDD, Auth, logique métier |
| **Dev 2 (Frontend/Mobile)** | Apps client/producteur, UI |
| **Ensemble** | Tests, debug, déploiement |

### 2.2 Outils de collaboration

- **Code** : GitHub (repo unique monorepo)
- **Communication** : WhatsApp/Discord
- **Tâches** : Ce document + GitHub Issues
- **Design** : Composants UI prêts (shadcn/ui, NativeBase)

---

## 3. PLANNING JOUR PAR JOUR

```
SEMAINE DE SPRINT
═══════════════════════════════════════════════════════════════════

JOUR 1 (Lundi) ──────────────────────────────────────────────────
   │
   ├── SETUP & FONDATIONS
   │
   └── Objectif: Infrastructure prête, auth fonctionnelle

JOUR 2 (Mardi) ──────────────────────────────────────────────────
   │
   ├── CATALOGUE & PRODUITS
   │
   └── Objectif: CRUD produits complet, catégories

JOUR 3 (Mercredi) ───────────────────────────────────────────────
   │
   ├── COMMANDES & PANIER
   │
   └── Objectif: Flux commande complet côté client

JOUR 4 (Jeudi) ──────────────────────────────────────────────────
   │
   ├── ADMIN & GESTION
   │
   └── Objectif: Dashboard admin, gestion commandes/livraisons

JOUR 5 (Vendredi) ───────────────────────────────────────────────
   │
   ├── MOBILE & INTÉGRATION
   │
   └── Objectif: Apps mobiles connectées à l'API

JOUR 6 (Samedi) ─────────────────────────────────────────────────
   │
   ├── TESTS & CORRECTIONS
   │
   └── Objectif: Parcours utilisateur sans bugs

JOUR 7 (Dimanche) ───────────────────────────────────────────────
   │
   ├── DÉPLOIEMENT & DÉMO
   │
   └── Objectif: Production live, documentation
```

---

## 4. TÂCHES DÉTAILLÉES PAR JOUR

### JOUR 1 - SETUP & FONDATIONS

#### Matin (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 1.1 | Créer repo GitHub monorepo | Dev 1 | 30min | Repo initialisé |
| 1.2 | Setup projet Next.js + TypeScript | Dev 1 | 30min | `/apps/web` |
| 1.3 | Setup Expo React Native | Dev 2 | 30min | `/apps/mobile` |
| 1.4 | Configurer Drizzle ORM + schéma BDD | Dev 1 | 1h30 | `db/schema.ts` |
| 1.5 | Créer BDD MySQL (XAMPP) | Dev 1 | 30min | BDD locale prête |
| 1.6 | Installer dépendances UI (shadcn) | Dev 2 | 30min | Composants prêts |

#### Après-midi (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 1.7 | Implémenter NextAuth (credentials) | Dev 1 | 2h | Auth fonctionnelle |
| 1.8 | Pages inscription/connexion web | Dev 2 | 2h | UI auth web |
| 1.9 | Migration BDD initiale (drizzle-kit push) | Dev 1 | 30min | Tables créées |
| 1.10 | Seed données de test | Dev 1 | 30min | Données démo |
| 1.11 | Test auth bout-en-bout | Ensemble | 30min | ✓ Validé |

#### Livrables Jour 1
```
✓ Repo GitHub structuré
✓ Projets web + mobile initialisés
✓ BDD MySQL (XAMPP) avec tables via Drizzle ORM
✓ Authentification fonctionnelle (inscription/connexion)
✓ 3 rôles : Client, Producteur, Admin
```

---

### JOUR 2 - CATALOGUE & PRODUITS

#### Matin (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 2.1 | API CRUD catégories | Dev 1 | 1h | Endpoints `/api/categories` |
| 2.2 | API CRUD produits | Dev 1 | 2h | Endpoints `/api/products` |
| 2.3 | Upload images produits | Dev 1 | 1h | Intégration Cloudinary |

#### Après-midi (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 2.4 | Page liste catégories | Dev 2 | 1h | UI grille catégories |
| 2.5 | Page liste produits | Dev 2 | 1h30 | UI liste + filtres |
| 2.6 | Page détail produit | Dev 2 | 1h | UI fiche produit |
| 2.7 | Dashboard producteur - Mes produits | Dev 2 | 1h30 | CRUD produits UI |
| 2.8 | Test catalogue complet | Ensemble | 30min | ✓ Validé |

#### Livrables Jour 2
```
✓ API catalogue complète
✓ Gestion catégories (admin)
✓ Producteur peut ajouter/modifier/supprimer ses produits
✓ Client peut voir catalogue et détails produits
✓ Upload images fonctionnel
```

---

### JOUR 3 - COMMANDES & PANIER

#### Matin (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 3.1 | API panier (cart) | Dev 1 | 1h30 | Endpoints `/api/cart` |
| 3.2 | API commandes | Dev 1 | 2h | Endpoints `/api/orders` |
| 3.3 | Logique calcul prix/frais livraison | Dev 1 | 30min | Fonction calcul |

#### Après-midi (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 3.4 | Composant panier (drawer/modal) | Dev 2 | 1h30 | UI panier |
| 3.5 | Page checkout (adresse + récap) | Dev 2 | 1h30 | Tunnel commande |
| 3.6 | Page confirmation commande | Dev 2 | 30min | UI confirmation |
| 3.7 | Page mes commandes (client) | Dev 2 | 1h | Historique + statuts |
| 3.8 | Test parcours commande | Ensemble | 30min | ✓ Validé |

#### Livrables Jour 3
```
✓ Panier fonctionnel (ajout, modif, suppression)
✓ Tunnel de commande complet
✓ Gestion adresses de livraison
✓ Calcul automatique frais de livraison
✓ Historique commandes client
✓ Mode paiement : À la livraison (COD)
```

---

### JOUR 4 - ADMIN & GESTION

#### Matin (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 4.1 | Layout admin (sidebar, header) | Dev 2 | 1h | Structure admin |
| 4.2 | Dashboard stats (KPIs) | Dev 1 + Dev 2 | 1h30 | Widgets stats |
| 4.3 | Liste/gestion utilisateurs | Dev 1 + Dev 2 | 1h30 | CRUD users admin |

#### Après-midi (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 4.4 | Liste commandes admin | Dev 2 | 1h | Tableau commandes |
| 4.5 | Détail commande + changement statut | Dev 1 + Dev 2 | 1h30 | Gestion statuts |
| 4.6 | Attribution livreur (manuel) | Dev 1 | 1h | Assign delivery |
| 4.7 | Vue producteur - Commandes reçues | Dev 2 | 1h | Liste pour producteur |
| 4.8 | Test flux admin | Ensemble | 30min | ✓ Validé |

#### Livrables Jour 4
```
✓ Dashboard admin avec statistiques
✓ Gestion des utilisateurs (validation producteurs)
✓ Gestion des commandes (voir, modifier statut)
✓ Attribution manuelle des livreurs
✓ Producteur voit ses commandes à préparer
```

---

### JOUR 5 - MOBILE & INTÉGRATION

#### Matin (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 5.1 | Config API client mobile (axios) | Dev 2 | 30min | Service API |
| 5.2 | Écrans auth mobile | Dev 2 | 1h30 | Login/Register |
| 5.3 | Navigation mobile (tabs + stack) | Dev 2 | 1h | Structure nav |
| 5.4 | Écran accueil + catégories | Dev 2 | 1h | Home screen |

#### Après-midi (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 5.5 | Écran liste produits mobile | Dev 2 | 1h | Products list |
| 5.6 | Écran détail produit mobile | Dev 2 | 45min | Product detail |
| 5.7 | Panier mobile | Dev 2 | 1h | Cart screen |
| 5.8 | Checkout mobile | Dev 2 | 1h | Order flow |
| 5.9 | Mes commandes mobile | Dev 2 | 45min | Orders history |
| 5.10 | Sync Dev 1 - corrections API | Dev 1 | 4h | Fixes + optimisations |

#### Livrables Jour 5
```
✓ App mobile client fonctionnelle
✓ Parcours complet : navigation → commande
✓ Synchronisation avec API
✓ Auth persistante mobile
```

---

### JOUR 6 - TESTS & CORRECTIONS

#### Matin (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 6.1 | Tests parcours client web | Ensemble | 1h30 | Liste bugs |
| 6.2 | Tests parcours producteur | Ensemble | 1h | Liste bugs |
| 6.3 | Tests parcours admin | Ensemble | 1h | Liste bugs |
| 6.4 | Tests app mobile | Ensemble | 1h | Liste bugs |

#### Après-midi (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 6.5 | Correction bugs critiques | Dev 1 + Dev 2 | 3h | Bugs fixés |
| 6.6 | Optimisation UX (feedbacks) | Dev 2 | 1h | UX améliorée |
| 6.7 | Ajout données réalistes | Dev 1 | 30min | Seed production |
| 6.8 | Test final bout-en-bout | Ensemble | 30min | ✓ Validé |

#### Livrables Jour 6
```
✓ 0 bugs bloquants
✓ Parcours utilisateur fluide
✓ Données de démonstration réalistes
✓ Performance acceptable
```

---

### JOUR 7 - DÉPLOIEMENT & DOCUMENTATION

#### Matin (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 7.1 | Déploiement web sur Vercel | Dev 1 | 1h | URL production |
| 7.2 | Config variables environnement | Dev 1 | 30min | Secrets configurés |
| 7.3 | Build APK Android (Expo) | Dev 2 | 1h30 | Fichier APK |
| 7.4 | Tests sur environnement prod | Ensemble | 1h | ✓ Validé |

#### Après-midi (4h)

| # | Tâche | Responsable | Durée | Livrable |
|---|-------|-------------|-------|----------|
| 7.5 | Documentation utilisateur | Dev 2 | 1h30 | Guide utilisateur |
| 7.6 | Documentation technique | Dev 1 | 1h30 | README + setup |
| 7.7 | Création comptes démo | Ensemble | 30min | Accès test |
| 7.8 | Préparation démo | Ensemble | 30min | Script démo |

#### Livrables Jour 7
```
✓ Application web en production
✓ APK Android installable
✓ Documentation complète
✓ Comptes de démonstration
✓ MVP prêt pour présentation
```

---

## 5. SCHÉMA DE BASE DE DONNÉES (Drizzle ORM + MySQL)

```typescript
// db/schema.ts
import { mysqlTable, varchar, text, int, float, boolean, datetime, mysqlEnum, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ============== ENUMS ==============

export const roleEnum = mysqlEnum('role', ['CLIENT', 'PRODUCER', 'DELIVERY', 'ADMIN']);
export const userStatusEnum = mysqlEnum('user_status', ['PENDING', 'ACTIVE', 'SUSPENDED']);
export const productUnitEnum = mysqlEnum('product_unit', ['KG', 'GRAM', 'UNIT', 'LITER', 'TAS', 'BUNCH']);
export const orderStatusEnum = mysqlEnum('order_status', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED']);
export const paymentMethodEnum = mysqlEnum('payment_method', ['COD', 'MOBILE_MONEY', 'WALLET']);
export const paymentStatusEnum = mysqlEnum('payment_status', ['PENDING', 'PAID', 'FAILED', 'REFUNDED']);

// ============== UTILISATEURS ==============

export const users = mysqlTable('users', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: roleEnum.default('CLIENT').notNull(),
  status: userStatusEnum.default('ACTIVE').notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
});

export const producerProfiles = mysqlTable('producer_profiles', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }).notNull(),
  verified: boolean('verified').default(false).notNull(),
  verifiedAt: datetime('verified_at'),
});

export const addresses = mysqlTable('addresses', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).notNull(),
  label: varchar('label', { length: 50 }).notNull(), // "Maison", "Bureau"
  fullAddress: text('full_address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  quarter: varchar('quarter', { length: 100 }),
  latitude: float('latitude'),
  longitude: float('longitude'),
  isDefault: boolean('is_default').default(false).notNull(),
});

// ============== CATALOGUE ==============

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }),
  parentId: varchar('parent_id', { length: 128 }),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
});

export const products = mysqlTable('products', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  producerId: varchar('producer_id', { length: 128 }).notNull(),
  categoryId: varchar('category_id', { length: 128 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: int('price').notNull(), // Prix en FCFA
  unit: productUnitEnum.notNull(),
  minQuantity: float('min_quantity').default(1).notNull(),
  stock: float('stock').notNull(),
  origin: varchar('origin', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
});

export const productImages = mysqlTable('product_images', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  productId: varchar('product_id', { length: 128 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
});

// ============== PANIER ==============

export const cartItems = mysqlTable('cart_items', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).notNull(),
  productId: varchar('product_id', { length: 128 }).notNull(),
  quantity: float('quantity').notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userProductUnique: uniqueIndex('user_product_unique').on(table.userId, table.productId),
}));

// ============== COMMANDES ==============

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(), // KIB-20260129-001
  userId: varchar('user_id', { length: 128 }).notNull(),
  addressId: varchar('address_id', { length: 128 }).notNull(),
  status: orderStatusEnum.default('PENDING').notNull(),
  subtotal: int('subtotal').notNull(),
  deliveryFee: int('delivery_fee').notNull(),
  total: int('total').notNull(),
  paymentMethod: paymentMethodEnum.default('COD').notNull(),
  paymentStatus: paymentStatusEnum.default('PENDING').notNull(),
  notes: text('notes'),
  deliveryPersonId: varchar('delivery_person_id', { length: 128 }),
  estimatedDelivery: datetime('estimated_delivery'),
  deliveredAt: datetime('delivered_at'),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
});

export const orderItems = mysqlTable('order_items', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  orderId: varchar('order_id', { length: 128 }).notNull(),
  productId: varchar('product_id', { length: 128 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(), // Snapshot
  quantity: float('quantity').notNull(),
  unitPrice: int('unit_price').notNull(),
  subtotal: int('subtotal').notNull(),
});

// ============== RELATIONS ==============

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(producerProfiles, { fields: [users.id], references: [producerProfiles.userId] }),
  addresses: many(addresses),
  products: many(products),
  orders: many(orders),
  cartItems: many(cartItems),
}));

export const producerProfilesRelations = relations(producerProfiles, ({ one }) => ({
  user: one(users, { fields: [producerProfiles.userId], references: [users.id] }),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'hierarchy' }),
  children: many(categories, { relationName: 'hierarchy' }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  producer: one(users, { fields: [products.producerId], references: [users.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
```

### Configuration Drizzle (drizzle.config.ts)

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kibboutz',
  },
} satisfies Config;
```

### Connexion BDD (db/index.ts)

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kibboutz',
});

export const db = drizzle(connection, { schema, mode: 'default' });
```

---

## 6. STRUCTURE DU PROJET (Monorepo)

```
kibboutz/
├── apps/
│   ├── web/                    # Next.js App
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (client)/
│   │   │   │   ├── page.tsx           # Accueil
│   │   │   │   ├── categories/
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   └── orders/
│   │   │   ├── (producer)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   └── orders/
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── orders/
│   │   │   │   └── categories/
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── users/
│   │   │       ├── categories/
│   │   │       ├── products/
│   │   │       ├── cart/
│   │   │       └── orders/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn components
│   │   │   ├── layout/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── lib/
│   │   │   ├── db.ts           # Connexion Drizzle
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   └── ...
│   │
│   └── mobile/                 # Expo React Native
│       ├── app/                # Expo Router
│       │   ├── (auth)/
│       │   ├── (tabs)/
│       │   │   ├── index.tsx          # Accueil
│       │   │   ├── categories.tsx
│       │   │   ├── cart.tsx
│       │   │   ├── orders.tsx
│       │   │   └── profile.tsx
│       │   └── product/[id].tsx
│       ├── components/
│       ├── services/
│       │   └── api.ts
│       └── ...
│
├── packages/
│   └── shared/                 # Types partagés
│       └── types/
│
├── db/
│   ├── schema.ts              # Schéma Drizzle
│   ├── index.ts               # Connexion BDD
│   ├── seed.ts                # Données de test
│   └── migrations/            # Migrations Drizzle
│
├── package.json
├── turbo.json                  # Turborepo config
└── README.md
```

---

## 7. ENDPOINTS API ESSENTIELS

### Authentication
```
POST   /api/auth/register       # Inscription
POST   /api/auth/login          # Connexion
POST   /api/auth/logout         # Déconnexion
GET    /api/auth/me             # Profil connecté
```

### Categories
```
GET    /api/categories          # Liste catégories
GET    /api/categories/:id      # Détail catégorie
POST   /api/categories          # Créer (admin)
PUT    /api/categories/:id      # Modifier (admin)
DELETE /api/categories/:id      # Supprimer (admin)
```

### Products
```
GET    /api/products            # Liste (filtres: category, search, producer)
GET    /api/products/:id        # Détail produit
POST   /api/products            # Créer (producer)
PUT    /api/products/:id        # Modifier (producer/admin)
DELETE /api/products/:id        # Supprimer (producer/admin)
POST   /api/products/:id/images # Upload image
```

### Cart
```
GET    /api/cart                # Mon panier
POST   /api/cart                # Ajouter au panier
PUT    /api/cart/:itemId        # Modifier quantité
DELETE /api/cart/:itemId        # Retirer du panier
DELETE /api/cart                # Vider le panier
```

### Orders
```
GET    /api/orders              # Mes commandes (client) / Toutes (admin)
GET    /api/orders/:id          # Détail commande
POST   /api/orders              # Créer commande
PUT    /api/orders/:id/status   # Changer statut (admin/producer)
PUT    /api/orders/:id/assign   # Assigner livreur (admin)
```

### Users (Admin)
```
GET    /api/users               # Liste utilisateurs
GET    /api/users/:id           # Détail utilisateur
PUT    /api/users/:id           # Modifier
PUT    /api/users/:id/verify    # Vérifier producteur
```

### Addresses
```
GET    /api/addresses           # Mes adresses
POST   /api/addresses           # Ajouter adresse
PUT    /api/addresses/:id       # Modifier
DELETE /api/addresses/:id       # Supprimer
```

---

## 8. CHECKLIST DE VALIDATION FINALE

### Parcours Client
- [ ] Inscription avec email/téléphone
- [ ] Connexion / Déconnexion
- [ ] Voir les catégories
- [ ] Voir les produits par catégorie
- [ ] Rechercher un produit
- [ ] Voir le détail d'un produit
- [ ] Ajouter au panier
- [ ] Modifier quantité dans le panier
- [ ] Supprimer du panier
- [ ] Ajouter une adresse de livraison
- [ ] Passer une commande (COD)
- [ ] Voir mes commandes
- [ ] Voir le détail d'une commande
- [ ] Voir le statut de livraison

### Parcours Producteur
- [ ] Inscription en tant que producteur
- [ ] Compléter profil producteur
- [ ] Ajouter un produit avec images
- [ ] Modifier un produit
- [ ] Supprimer un produit
- [ ] Gérer le stock
- [ ] Voir les commandes reçues
- [ ] Marquer une commande comme "Prête"

### Parcours Admin
- [ ] Accéder au dashboard
- [ ] Voir les statistiques (commandes, CA, users)
- [ ] Gérer les catégories (CRUD)
- [ ] Voir la liste des utilisateurs
- [ ] Valider un producteur
- [ ] Suspendre un utilisateur
- [ ] Voir toutes les commandes
- [ ] Changer le statut d'une commande
- [ ] Assigner un livreur

### Mobile (Client)
- [ ] Inscription / Connexion
- [ ] Navigation par catégories
- [ ] Liste des produits
- [ ] Détail produit
- [ ] Ajout au panier
- [ ] Checkout
- [ ] Historique commandes

### Technique
- [ ] Déploiement web fonctionnel
- [ ] APK Android installable
- [ ] Base de données en production
- [ ] Pas d'erreurs console critiques
- [ ] Temps de chargement < 3s
- [ ] Responsive design web

---

## 9. DONNÉES DE SEED (Démonstration)

### Catégories
```javascript
const categories = [
  { name: "Fruits", slug: "fruits", icon: "🍎" },
  { name: "Légumes", slug: "legumes", icon: "🥬" },
  { name: "Céréales & Tubercules", slug: "cereales-tubercules", icon: "🌾" },
  { name: "Produits d'élevage", slug: "elevage", icon: "🥚" },
  { name: "Épices & Condiments", slug: "epices", icon: "🌶️" },
];
```

### Utilisateurs de test
```javascript
const users = [
  { email: "client@kibboutz.com", password: "client123", role: "CLIENT" },
  { email: "producteur@kibboutz.com", password: "producteur123", role: "PRODUCER" },
  { email: "admin@kibboutz.com", password: "admin123", role: "ADMIN" },
];
```

### Produits exemples
```javascript
const products = [
  { name: "Tomates fraîches", price: 1500, unit: "KG", stock: 100 },
  { name: "Oignons", price: 800, unit: "KG", stock: 150 },
  { name: "Mangues Kent", price: 2500, unit: "KG", stock: 50 },
  { name: "Bananes plantain", price: 1000, unit: "TAS", stock: 80 },
  { name: "Riz local", price: 12000, unit: "KG", stock: 200 },
  // ...
];
```

---

## 10. RISQUES & CONTINGENCES

| Risque | Impact | Contingence |
|--------|--------|-------------|
| Retard setup initial | Bloque tout | Préparer templates à l'avance |
| Problèmes auth complexes | 1 jour perdu | Utiliser auth simple (credentials) |
| Upload images lent | UX dégradée | Compression côté client |
| Build mobile échoue | Pas de mobile | Se concentrer sur web responsive |
| Bugs critiques J6 | Livrable instable | Liste de priorité, fixer le critique |

---

## 11. CONTACTS & SUPPORT

| Ressource | Lien |
|-----------|------|
| Next.js Docs | https://nextjs.org/docs |
| Drizzle ORM Docs | https://orm.drizzle.team/docs/overview |
| Expo Docs | https://docs.expo.dev |
| shadcn/ui | https://ui.shadcn.com |
| XAMPP | https://www.apachefriends.org |
| Cloudinary | https://cloudinary.com/documentation |

---

## 12. DÉFINITION DU "DONE"

Le sprint est considéré **terminé** quand :

1. ✅ Un client peut commander des produits et voir ses commandes
2. ✅ Un producteur peut gérer ses produits et voir ses commandes
3. ✅ Un admin peut gérer la plateforme et les commandes
4. ✅ L'application web est accessible en ligne
5. ✅ L'APK Android est installable et fonctionnel
6. ✅ Aucun bug bloquant n'empêche les parcours principaux

---

**Début du sprint** : _____________
**Fin du sprint** : _____________
**Équipe** : _____________

---

*Bonne chance ! 🚀*
