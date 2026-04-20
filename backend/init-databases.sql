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