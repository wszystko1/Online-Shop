CREATE DATABASE IF NOT EXISTS online_shop;
USE online_shop;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

INSERT INTO users (username, password, role) VALUES
('max', '1234', 'admin'),
('alex', '1234', 'user');

CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    product_desc TEXT,
    product_image VARCHAR(255),
    product_price DECIMAL(10,2) NOT NULL
);

INSERT INTO products 
(product_name, product_desc, product_image, product_price) 
VALUES
(
    'Charming Desert Cactus Small',
    'Add a touch of desert charm to your space with this low-maintenance cactus. Perfect for desks, shelves, or small corners. Ideal for beginners or busy plant lovers 🌵',
    'public/images/cactus_small.jpg',
    15.00
),
(
    'Charming Desert Cactus Big',
    'Add a touch of desert charm to your space with this low-maintenance cactus. Perfect for desks, shelves, or small corners. Ideal for beginners or busy plant lovers 🌵',
    'public/images/cactus_big.jpg',
    25.00
);
