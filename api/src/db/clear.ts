import dotenv from 'dotenv';
dotenv.config();

import { db, poolConnection } from './index';
import { sql } from 'drizzle-orm';

async function clearAll() {
  try {
    console.log('Connexion a:', process.env.DB_HOST, ':', process.env.DB_PORT);

    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    await db.execute(sql`TRUNCATE TABLE product_images`);
    await db.execute(sql`TRUNCATE TABLE order_items`);
    await db.execute(sql`TRUNCATE TABLE cart_items`);
    await db.execute(sql`TRUNCATE TABLE orders`);
    await db.execute(sql`TRUNCATE TABLE products`);
    await db.execute(sql`TRUNCATE TABLE producer_profiles`);
    await db.execute(sql`TRUNCATE TABLE addresses`);
    await db.execute(sql`TRUNCATE TABLE categories`);
    await db.execute(sql`TRUNCATE TABLE users`);
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    console.log('Toutes les tables ont ete videes !');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await poolConnection.end();
  }
}

clearAll();
