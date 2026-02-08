-- Synchronisation de la base de données Kibboutz

SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer toutes les tables Kibboutz
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS producer_profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Table des utilisateurs
CREATE TABLE users (
  id VARCHAR(128) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('CLIENT', 'PRODUCER', 'DELIVERY', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
  status ENUM('PENDING', 'ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX email_idx (email),
  INDEX role_idx (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Profils producteurs
CREATE TABLE producer_profiles (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Adresses
CREATE TABLE addresses (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  label VARCHAR(50) NOT NULL,
  full_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  quarter VARCHAR(100),
  latitude FLOAT,
  longitude FLOAT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX address_user_idx (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Catégories
CREATE TABLE categories (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  parent_id VARCHAR(128),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE INDEX slug_idx (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Produits
CREATE TABLE products (
  id VARCHAR(128) PRIMARY KEY,
  producer_id VARCHAR(128) NOT NULL,
  category_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price INT NOT NULL,
  unit ENUM('KG', 'GRAM', 'UNIT', 'LITER', 'TAS', 'BUNCH') NOT NULL,
  min_quantity FLOAT NOT NULL DEFAULT 1,
  stock FLOAT NOT NULL,
  origin VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX product_producer_idx (producer_id),
  INDEX product_category_idx (category_id),
  INDEX product_name_idx (name),
  FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Images produits
CREATE TABLE product_images (
  id VARCHAR(128) PRIMARY KEY,
  product_id VARCHAR(128) NOT NULL,
  url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX image_product_idx (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Panier
CREATE TABLE cart_items (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  product_id VARCHAR(128) NOT NULL,
  quantity FLOAT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE INDEX cart_user_product_idx (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Commandes
CREATE TABLE orders (
  id VARCHAR(128) PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id VARCHAR(128) NOT NULL,
  address_id VARCHAR(128) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  subtotal INT NOT NULL,
  delivery_fee INT NOT NULL,
  total INT NOT NULL,
  payment_method ENUM('COD', 'MOBILE_MONEY', 'WALLET') NOT NULL DEFAULT 'COD',
  payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  delivery_person_id VARCHAR(128),
  estimated_delivery DATETIME,
  delivered_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX order_user_idx (user_id),
  INDEX order_status_idx (status),
  UNIQUE INDEX order_number_idx (order_number),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES addresses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Items de commande
CREATE TABLE order_items (
  id VARCHAR(128) PRIMARY KEY,
  order_id VARCHAR(128) NOT NULL,
  product_id VARCHAR(128) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity FLOAT NOT NULL,
  unit_price INT NOT NULL,
  subtotal INT NOT NULL,
  INDEX order_item_order_idx (order_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Tables creees avec succes!' AS message;
