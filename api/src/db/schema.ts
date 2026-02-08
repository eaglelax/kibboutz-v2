import {
  mysqlTable,
  varchar,
  text,
  int,
  float,
  boolean,
  datetime,
  mysqlEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ============== UTILISATEURS ==============

export const users = mysqlTable('users', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: mysqlEnum('role', ['CLIENT', 'PRODUCER', 'DELIVERY', 'ADMIN']).default('CLIENT').notNull(),
  status: mysqlEnum('status', ['PENDING', 'ACTIVE', 'SUSPENDED']).default('ACTIVE').notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  roleIdx: index('role_idx').on(table.role),
}));

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
  label: varchar('label', { length: 50 }).notNull(),
  fullAddress: text('full_address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  quarter: varchar('quarter', { length: 100 }),
  latitude: float('latitude'),
  longitude: float('longitude'),
  isDefault: boolean('is_default').default(false).notNull(),
}, (table) => ({
  userIdIdx: index('address_user_idx').on(table.userId),
}));

// ============== CATALOGUE ==============

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }),
  parentId: varchar('parent_id', { length: 128 }),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const products = mysqlTable('products', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  producerId: varchar('producer_id', { length: 128 }).notNull(),
  categoryId: varchar('category_id', { length: 128 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: int('price').notNull(),
  unit: mysqlEnum('unit', ['KG', 'GRAM', 'UNIT', 'LITER', 'TAS', 'BUNCH']).notNull(),
  minQuantity: float('min_quantity').default(1).notNull(),
  stock: float('stock').notNull(),
  origin: varchar('origin', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
}, (table) => ({
  producerIdx: index('product_producer_idx').on(table.producerId),
  categoryIdx: index('product_category_idx').on(table.categoryId),
  nameIdx: index('product_name_idx').on(table.name),
}));

export const productImages = mysqlTable('product_images', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  productId: varchar('product_id', { length: 128 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
}, (table) => ({
  productIdx: index('image_product_idx').on(table.productId),
}));

// ============== PANIER ==============

export const cartItems = mysqlTable('cart_items', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).notNull(),
  productId: varchar('product_id', { length: 128 }).notNull(),
  quantity: float('quantity').notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userProductUnique: uniqueIndex('cart_user_product_idx').on(table.userId, table.productId),
}));

// ============== COMMANDES ==============

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  addressId: varchar('address_id', { length: 128 }).notNull(),
  status: mysqlEnum('status', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED']).default('PENDING').notNull(),
  subtotal: int('subtotal').notNull(),
  deliveryFee: int('delivery_fee').notNull(),
  total: int('total').notNull(),
  paymentMethod: mysqlEnum('payment_method', ['COD', 'MOBILE_MONEY', 'WALLET']).default('COD').notNull(),
  paymentStatus: mysqlEnum('payment_status', ['PENDING', 'PAID', 'FAILED', 'REFUNDED']).default('PENDING').notNull(),
  notes: text('notes'),
  deliveryPersonId: varchar('delivery_person_id', { length: 128 }),
  estimatedDelivery: datetime('estimated_delivery'),
  deliveredAt: datetime('delivered_at'),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userIdx: index('order_user_idx').on(table.userId),
  statusIdx: index('order_status_idx').on(table.status),
  orderNumberIdx: uniqueIndex('order_number_idx').on(table.orderNumber),
}));

export const orderItems = mysqlTable('order_items', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  orderId: varchar('order_id', { length: 128 }).notNull(),
  productId: varchar('product_id', { length: 128 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: float('quantity').notNull(),
  unitPrice: int('unit_price').notNull(),
  subtotal: int('subtotal').notNull(),
}, (table) => ({
  orderIdx: index('order_item_order_idx').on(table.orderId),
}));

// ============== RELATIONS ==============

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(producerProfiles, {
    fields: [users.id],
    references: [producerProfiles.userId],
  }),
  addresses: many(addresses),
  products: many(products),
  orders: many(orders),
  cartItems: many(cartItems),
}));

export const producerProfilesRelations = relations(producerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [producerProfiles.userId],
    references: [users.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'hierarchy',
  }),
  children: many(categories, { relationName: 'hierarchy' }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  producer: one(users, {
    fields: [products.producerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  deliveryPerson: one(users, {
    fields: [orders.deliveryPersonId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ============== TYPES EXPORTÉS ==============

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ProducerProfile = typeof producerProfiles.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
