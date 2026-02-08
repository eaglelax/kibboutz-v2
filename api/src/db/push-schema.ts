import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kibboutz',
    multipleStatements: true,
  });

  console.log('Connected to MySQL. Creating tables...\n');

  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(128) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role ENUM('CLIENT','PRODUCER','DELIVERY','ADMIN') NOT NULL DEFAULT 'CLIENT',
      status ENUM('PENDING','ACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX email_idx (email),
      INDEX role_idx (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS producer_profiles (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL UNIQUE,
      business_name VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255) NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      verified_at DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS addresses (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      label VARCHAR(50) NOT NULL,
      full_address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      quarter VARCHAR(100),
      latitude FLOAT,
      longitude FLOAT,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      INDEX address_user_idx (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      icon VARCHAR(50),
      parent_id VARCHAR(128),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      UNIQUE INDEX slug_idx (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(128) PRIMARY KEY,
      producer_id VARCHAR(128) NOT NULL,
      category_id VARCHAR(128) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price INT NOT NULL,
      unit ENUM('KG','GRAM','UNIT','LITER','TAS','BUNCH') NOT NULL,
      min_quantity FLOAT NOT NULL DEFAULT 1,
      stock FLOAT NOT NULL,
      origin VARCHAR(100),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX product_producer_idx (producer_id),
      INDEX product_category_idx (category_id),
      INDEX product_name_idx (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS product_images (
      id VARCHAR(128) PRIMARY KEY,
      product_id VARCHAR(128) NOT NULL,
      url VARCHAR(500) NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      INDEX image_product_idx (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS cart_items (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      product_id VARCHAR(128) NOT NULL,
      quantity FLOAT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE INDEX cart_user_product_idx (user_id, product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(128) PRIMARY KEY,
      order_number VARCHAR(50) NOT NULL UNIQUE,
      user_id VARCHAR(128) NOT NULL,
      address_id VARCHAR(128) NOT NULL,
      status ENUM('PENDING','CONFIRMED','PREPARING','READY','IN_DELIVERY','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
      subtotal INT NOT NULL,
      delivery_fee INT NOT NULL,
      total INT NOT NULL,
      payment_method ENUM('COD','MOBILE_MONEY','WALLET') NOT NULL DEFAULT 'COD',
      payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      delivery_person_id VARCHAR(128),
      estimated_delivery DATETIME,
      delivered_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX order_user_idx (user_id),
      INDEX order_status_idx (status),
      UNIQUE INDEX order_number_idx (order_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(128) PRIMARY KEY,
      order_id VARCHAR(128) NOT NULL,
      product_id VARCHAR(128) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity FLOAT NOT NULL,
      unit_price INT NOT NULL,
      subtotal INT NOT NULL,
      INDEX order_item_order_idx (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await connection.query(sql);
  console.log('All tables created successfully!');

  await connection.end();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
