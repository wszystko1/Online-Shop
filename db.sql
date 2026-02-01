CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    product_desc TEXT,
    product_image VARCHAR(255),
    product_price DECIMAL(10,2) NOT NULL,
    product_quantity INT
);

CREATE TABLE IF NOT EXISTS orders_list (
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    order_date DATE,
    paid ENUM('yes', 'no') NOT NULL DEFAULT 'yes'
);

INSERT INTO users (username, password, role) VALUES
('max', '1234', 'admin'),
('alex', '1234', 'user');

INSERT INTO products 
(product_name, product_desc, product_image, product_price, product_quantity)
VALUES
(
    'Charming Desert Cactus Small',
    'Add a touch of desert charm to your space with this low-maintenance cactus. Perfect for desks, shelves, or small corners. Ideal for beginners or busy plant lovers 🌵',
    '/images/cactus.png',
    15.00,
    5
),
(
    'Charming Desert Cactus Big',
    'Add a touch of desert charm to your space with this low-maintenance cactus. Perfect for desks, shelves, or small corners. Ideal for beginners or busy plant lovers 🌵',
    '/images/cactus.png',
    25.00,
    10
);

INSERT INTO orders_list
(order_id, user_id, product_id, quantity, order_date, paid) 
VALUES
(1, 2, 1, 2, '2023-10-27', 'yes'),
(1, 2, 1, 1, '2023-10-27', 'yes'),
(2, 2, 1, 5, '2023-10-28', 'no');