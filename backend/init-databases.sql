-- Create all databases for QuickBite microservices

CREATE DATABASE IF NOT EXISTS quickbite_auth;
CREATE DATABASE IF NOT EXISTS quickbite_restaurant;
CREATE DATABASE IF NOT EXISTS quickbite_menu;
CREATE DATABASE IF NOT EXISTS quickbite_cart;
CREATE DATABASE IF NOT EXISTS quickbite_order;
CREATE DATABASE IF NOT EXISTS quickbite_payment;
CREATE DATABASE IF NOT EXISTS quickbite_delivery;
CREATE DATABASE IF NOT EXISTS quickbite_review;
CREATE DATABASE IF NOT EXISTS quickbite_notification;

GRANT ALL PRIVILEGES ON quickbite_auth.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_restaurant.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_menu.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_cart.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_order.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_payment.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_delivery.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_review.* TO 'quickbite'@'%';
GRANT ALL PRIVILEGES ON quickbite_notification.* TO 'quickbite'@'%';
FLUSH PRIVILEGES;

-- Use auth database and create users table with OAuth support
USE quickbite_auth;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255) UNIQUE,
    profile_picture_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_oauth_id (oauth_id),
    INDEX idx_role (role)
);

-- Use restaurant database and create restaurant tables
USE quickbite_restaurant;

CREATE TABLE IF NOT EXISTS restaurants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    location POINT NOT NULL,
    rating DOUBLE DEFAULT 0,
    review_count INT DEFAULT 0,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    delivery_fee DOUBLE DEFAULT 0,
    min_delivery_time INT DEFAULT 30,
    max_delivery_time INT DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    image_url VARCHAR(500),
    opening_time TIME,
    closing_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    SPATIAL INDEX idx_location (location),
    INDEX idx_owner_id (owner_id),
    INDEX idx_city (city),
    INDEX idx_cuisine_type (cuisine_type)
);

CREATE TABLE IF NOT EXISTS restaurant_cuisines (
    restaurant_id BIGINT NOT NULL,
    cuisines VARCHAR(100) NOT NULL,
    PRIMARY KEY (restaurant_id, cuisines),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Use menu database and create menu tables
USE quickbite_menu;

CREATE TABLE IF NOT EXISTS menu_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurant_id (restaurant_id)
);

CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    discounted_price DOUBLE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    preparation_time INT NOT NULL,
    order_count INT DEFAULT 0,
    rating DOUBLE DEFAULT 0,
    is_vegetarian BOOLEAN NOT NULL,
    is_spicy BOOLEAN NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_category_id (category_id)
);

-- Use cart database
USE quickbite_cart;

CREATE TABLE IF NOT EXISTS shopping_carts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    total_price DOUBLE DEFAULT 0,
    total_items INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_restaurant_id (restaurant_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
    INDEX idx_cart_id (cart_id)
);

-- Use order database
USE quickbite_order;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    delivery_agent_id BIGINT,
    status VARCHAR(50) NOT NULL,
    total_amount DOUBLE NOT NULL,
    delivery_fee DOUBLE DEFAULT 0,
    estimated_delivery_time INT NOT NULL,
    delivery_address TEXT NOT NULL,
    special_instructions TEXT,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number)
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);

-- Use payment database
USE quickbite_payment;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    razorpay_payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    transaction_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
);

-- Use delivery database
USE quickbite_delivery;

CREATE TABLE IF NOT EXISTS delivery_agents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    current_latitude DOUBLE,
    current_longitude DOUBLE,
    total_deliveries INT DEFAULT 0,
    rating DOUBLE DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_available (is_available)
);

CREATE TABLE IF NOT EXISTS deliveries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    delivery_agent_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    pickup_latitude DOUBLE,
    pickup_longitude DOUBLE,
    delivery_latitude DOUBLE,
    delivery_longitude DOUBLE,
    estimated_delivery_time INT,
    actual_delivery_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_agent_id (delivery_agent_id),
    INDEX idx_status (status)
);

-- Use review database
USE quickbite_review;

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    food_rating INT NOT NULL,
    delivery_rating INT NOT NULL,
    food_comment TEXT,
    delivery_comment TEXT,
    is_helpful BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_id (order_id)
);

-- Use notification database
USE quickbite_notification;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    order_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    order_updates BOOLEAN DEFAULT true,
    promotional BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==================== Demo Seed Data (Idempotent) ====================

-- Auth users for customer/partner/agent/admin demo logins
USE quickbite_auth;

INSERT INTO users (id, email, password, full_name, phone, role, is_active, is_email_verified)
VALUES
  (1, 'aarti.customer@quickbite.in', '$2a$10$XQ5M6k8D3iNdh26fA4Y8xux5vFh6CFP9fPiN0eZZF9RnBbTK.jZ4C', 'Aarti Sharma', '+919876543210', 'CUSTOMER', true, true),
  (2, 'rahul.partner@quickbite.in', '$2a$10$XQ5M6k8D3iNdh26fA4Y8xux5vFh6CFP9fPiN0eZZF9RnBbTK.jZ4C', 'Rahul Verma', '+919800112233', 'RESTAURANT_OWNER', true, true),
  (3, 'vikram.agent@quickbite.in', '$2a$10$XQ5M6k8D3iNdh26fA4Y8xux5vFh6CFP9fPiN0eZZF9RnBbTK.jZ4C', 'Vikram Singh', '+919811223344', 'DELIVERY_AGENT', true, true),
  (4, 'neha.admin@quickbite.in', '$2a$10$XQ5M6k8D3iNdh26fA4Y8xux5vFh6CFP9fPiN0eZZF9RnBbTK.jZ4C', 'Neha Kapoor', '+919822334455', 'ADMIN', true, true)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  role = VALUES(role),
  is_active = VALUES(is_active),
  is_email_verified = VALUES(is_email_verified);

-- Restaurants seeded with Indian cuisine and INR-friendly delivery metadata
USE quickbite_restaurant;

INSERT INTO restaurants (
  id, owner_id, name, cuisine_type, description, address, city, state, pincode,
  location, rating, review_count, phone_number, email, delivery_fee,
  min_delivery_time, max_delivery_time, is_active, is_verified, image_url,
  opening_time, closing_time
)
VALUES
  (1, 2, 'Spice Route Kitchen', 'North Indian', 'Rich curries, tandoori platters, and biryani bowls.', '12 MG Road, Indiranagar', 'Bengaluru', 'Karnataka', '560038', ST_GeomFromText('POINT(77.6408 12.9716)'), 4.5, 214, '+918012345001', 'orders@spiceroute.in', 39, 25, 45, true, true, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', '11:00:00', '23:00:00'),
  (2, 2, 'Dosa Darbar', 'South Indian', 'Crispy dosas, filter coffee, and hearty tiffin combos.', '44 Cathedral Road', 'Chennai', 'Tamil Nadu', '600086', ST_GeomFromText('POINT(80.2707 13.0475)'), 4.3, 163, '+914412345002', 'hello@dosadarbar.in', 29, 20, 35, true, true, 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80', '07:30:00', '22:30:00'),
  (3, 2, 'Bombay Chaat Co.', 'Street Food', 'Mumbai-style chaat, pav bhaji, and kulfi desserts.', '8 Carter Road, Bandra', 'Mumbai', 'Maharashtra', '400050', ST_GeomFromText('POINT(72.8223 19.0596)'), 4.6, 301, '+912212345003', 'support@bombaychaat.in', 49, 30, 50, true, true, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', '10:30:00', '23:30:00')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  cuisine_type = VALUES(cuisine_type),
  description = VALUES(description),
  address = VALUES(address),
  city = VALUES(city),
  state = VALUES(state),
  pincode = VALUES(pincode),
  rating = VALUES(rating),
  review_count = VALUES(review_count),
  delivery_fee = VALUES(delivery_fee),
  min_delivery_time = VALUES(min_delivery_time),
  max_delivery_time = VALUES(max_delivery_time),
  is_active = VALUES(is_active),
  is_verified = VALUES(is_verified),
  opening_time = VALUES(opening_time),
  closing_time = VALUES(closing_time);

-- Menu categories and items with Indian pricing
USE quickbite_menu;

INSERT INTO menu_categories (id, restaurant_id, name, description, display_order, is_active, image_url)
VALUES
  (1, 1, 'Biryani & Rice', 'Dum biryani and rice specials.', 1, true, NULL),
  (2, 1, 'Curries', 'Paneer, chicken, and mutton curries.', 2, true, NULL),
  (3, 2, 'Dosas', 'Classic and fusion dosa varieties.', 1, true, NULL),
  (4, 2, 'Combos', 'Breakfast and mini meal combos.', 2, true, NULL),
  (5, 3, 'Chaat', 'Tangy and spicy street-style snacks.', 1, true, NULL),
  (6, 3, 'Mains', 'Pav bhaji and rolls.', 2, true, NULL)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active);

INSERT INTO menu_items (
  id, restaurant_id, category_id, name, description, price, discounted_price,
  is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url
)
VALUES
  (1, 1, 1, 'Hyderabadi Chicken Biryani', 'Fragrant basmati rice with slow-cooked chicken and saffron.', 329, 299, true, 30, 540, 4.6, false, true, 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80'),
  (2, 1, 2, 'Paneer Butter Masala', 'Creamy tomato gravy with soft paneer cubes.', 289, 259, true, 22, 388, 4.4, true, false, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80'),
  (3, 2, 3, 'Masala Dosa', 'Crispy dosa with potato masala, chutney, and sambar.', 149, 139, true, 15, 820, 4.5, true, false, 'https://images.unsplash.com/photo-1666190093229-ea40f4c45516?auto=format&fit=crop&w=800&q=80'),
  (4, 2, 4, 'Idli Vada Combo', 'Two idlis and one medu vada with chutneys.', 129, 119, true, 12, 610, 4.3, true, false, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80'),
  (5, 3, 5, 'Papdi Chaat', 'Crunchy papdi topped with yogurt, chutneys, and sev.', 119, 109, true, 10, 470, 4.4, true, true, 'https://images.unsplash.com/photo-1604908554027-3ac48f418f9e?auto=format&fit=crop&w=800&q=80'),
  (6, 3, 6, 'Pav Bhaji', 'Butter-toasted pav with spicy mashed vegetable bhaji.', 179, 169, true, 18, 690, 4.7, true, true, 'https://images.unsplash.com/photo-1596797038530-2c107aaab1d5?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price),
  discounted_price = VALUES(discounted_price),
  is_available = VALUES(is_available),
  preparation_time = VALUES(preparation_time),
  rating = VALUES(rating),
  order_count = VALUES(order_count),
  is_vegetarian = VALUES(is_vegetarian),
  is_spicy = VALUES(is_spicy),
  image_url = VALUES(image_url);

-- Orders for history/tracking demo
USE quickbite_order;

INSERT INTO orders (
  id, order_number, customer_id, restaurant_id, delivery_agent_id, status, total_amount,
  delivery_fee, estimated_delivery_time, delivery_address, special_instructions,
  payment_method, created_at, updated_at
)
VALUES
  (1, 'QB20260421A001', 1, 1, 3, 'IN_TRANSIT', 628, 39, NOW() + INTERVAL 25 MINUTE, 'Flat 4B, JP Nagar, Bengaluru', 'Ring the bell once', 'WALLET', NOW() - INTERVAL 35 MINUTE, NOW() - INTERVAL 5 MINUTE),
  (2, 'QB20260420A014', 1, 3, 3, 'DELIVERED', 288, 49, NOW() - INTERVAL 1 DAY + INTERVAL 30 MINUTE, 'Flat 4B, JP Nagar, Bengaluru', '', 'CASH_ON_DELIVERY', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
  (3, 'QB20260418A041', 1, 2, NULL, 'CANCELLED', 258, 29, NOW() - INTERVAL 3 DAY + INTERVAL 25 MINUTE, 'Flat 4B, JP Nagar, Bengaluru', 'No onions please', 'UPI', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  total_amount = VALUES(total_amount),
  delivery_fee = VALUES(delivery_fee),
  delivery_address = VALUES(delivery_address),
  payment_method = VALUES(payment_method),
  updated_at = VALUES(updated_at);

INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, special_instructions)
VALUES
  (1, 1, 1, 1, 299, ''),
  (2, 1, 2, 1, 259, ''),
  (3, 2, 6, 1, 169, ''),
  (4, 2, 5, 1, 109, ''),
  (5, 3, 3, 1, 139, 'No onions')
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity),
  price = VALUES(price),
  special_instructions = VALUES(special_instructions);

-- Payment wallet and statements for customer wallet view
USE quickbite_payment;

CREATE TABLE IF NOT EXISTS wallets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL UNIQUE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_statements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wallet_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_wallet_id (wallet_id)
);

INSERT INTO wallets (id, customer_id, balance, created_at, updated_at)
VALUES (1, 1, 2450.00, NOW() - INTERVAL 10 DAY, NOW())
ON DUPLICATE KEY UPDATE balance = VALUES(balance);

INSERT INTO wallet_statements (id, wallet_id, type, amount, description, created_at)
VALUES
  (1, 1, 'DEPOSIT', 2000.00, 'Wallet top-up via UPI', NOW() - INTERVAL 5 DAY),
  (2, 1, 'DEBIT', 628.00, 'Order payment QB20260421A001', NOW() - INTERVAL 35 MINUTE),
  (3, 1, 'DEPOSIT', 1200.00, 'Promotional cashback', NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  amount = VALUES(amount),
  description = VALUES(description),
  created_at = VALUES(created_at);

-- Notifications for customer feed
USE quickbite_notification;

INSERT INTO notifications (id, user_id, title, message, type, is_read, order_id, created_at)
VALUES
  (1, 1, 'Order on the way', 'Your order QB20260421A001 is in transit and arriving soon.', 'IN_APP', false, 1, NOW() - INTERVAL 8 MINUTE),
  (2, 1, 'Delivery completed', 'Order QB20260420A014 was delivered successfully.', 'IN_APP', true, 2, NOW() - INTERVAL 1 DAY),
  (3, 1, 'Weekend Offer', 'Get 20% OFF on biryani orders above Rs 499 this weekend.', 'IN_APP', false, NULL, NOW() - INTERVAL 2 HOUR)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  message = VALUES(message),
  is_read = VALUES(is_read),
  created_at = VALUES(created_at);

-- Reviews seed data (was missing entirely)
USE quickbite_review;

INSERT INTO reviews (
  id, order_id, customer_id, restaurant_id, food_rating, delivery_rating,
  food_comment, delivery_comment, is_helpful, helpful_count, created_at, updated_at
)
VALUES
  (1, 2, 1, 3, 5, 5, 'Best Pav Bhaji and Papdi Chaat! Arrived hot and fresh.', 'Super fast delivery, very polite delivery person.', true, 12, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
  (2, 1, 1, 1, 4, 5, 'Biryani was absolutely aromatic and flavorful. Paneer Butter Masala was a bit mild.', 'Delivered within the promised window. Great service!', false, 4, NOW() - INTERVAL 35 MINUTE, NOW() - INTERVAL 35 MINUTE)
ON DUPLICATE KEY UPDATE
  food_rating = VALUES(food_rating),
  delivery_rating = VALUES(delivery_rating),
  food_comment = VALUES(food_comment),
  delivery_comment = VALUES(delivery_comment),
  is_helpful = VALUES(is_helpful),
  helpful_count = VALUES(helpful_count);