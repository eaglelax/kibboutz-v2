import dotenv from 'dotenv';
dotenv.config();

import { db, poolConnection } from './index';
import { users, products, categories } from './schema';

async function showData() {
  console.log('Connecte a:', process.env.DB_HOST);

  const u = await db.select({ email: users.email, role: users.role, name: users.firstName }).from(users);
  console.log('\n=== UTILISATEURS ===');
  console.table(u);

  const c = await db.select({ name: categories.name }).from(categories);
  console.log('\n=== CATEGORIES ===');
  console.table(c);

  const p = await db.select({ name: products.name, price: products.price }).from(products);
  console.log('\n=== PRODUITS ===');
  console.table(p);

  await poolConnection.end();
}

showData();
