-- Test data for QuickBite with Bhopal coordinates

-- Clear existing data
USE
quickbite_auth;
DELETE
FROM addresses;
DELETE
FROM users;

USE
quickbite_restaurant;
DELETE
FROM restaurant_cuisines;
DELETE
FROM restaurants;

USE
quickbite_menu;
DELETE
FROM menu_items;
DELETE
FROM menu_categories;

USE
quickbite_delivery;
DELETE
FROM deliveries;
DELETE
FROM delivery_agents;

USE
quickbite_notification;
DELETE
FROM notification_preferences;

-- Users (Admin, Customers, Restaurant Owners, Delivery Agents)
USE
quickbite_auth;

INSERT INTO users (email, password, full_name, phone, role, is_active, is_email_verified)
VALUES ('admin@quickbite.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Admin User',
        '9876543210', 'ADMIN', true, true),
       ('customer1@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Rahul Sharma',
        '9876543211', 'CUSTOMER', true, true),
       ('customer2@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Priya Verma',
        '9876543212', 'CUSTOMER', true, true),
       ('customer3@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Amit Patel',
        '9876543213', 'CUSTOMER', true, true),
       ('owner1@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Rajesh Kumar',
        '9876543214', 'RESTAURANT_OWNER', true, true),
       ('owner2@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Sunita Gupta',
        '9876543215', 'RESTAURANT_OWNER', true, true),
       ('owner3@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Vikram Singh',
        '9876543216', 'RESTAURANT_OWNER', true, true),
       ('owner4@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Meera Joshi', '9876543217',
        'RESTAURANT_OWNER', true, true),
       ('agent1@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Ravi Yadav', '9876543218',
        'DELIVERY_AGENT', true, true),
       ('agent2@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Suresh Tiwari',
        '9876543219', 'DELIVERY_AGENT', true, true),
       ('agent3@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Manoj Dubey', '9876543220',
        'DELIVERY_AGENT', true, true),
       ('agent4@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Deepak Mishra',
        '9876543221', 'DELIVERY_AGENT', true, true),
       ('agent5@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Anil Chouhan',
        '9876543222', 'DELIVERY_AGENT', true, true),
       ('agent6@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Ramesh Prajapati',
        '9876543223', 'DELIVERY_AGENT', true, true),
       ('agent7@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Santosh Ahirwar',
        '9876543224', 'DELIVERY_AGENT', true, true),
       ('agent8@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Dinesh Malviya',
        '9876543225', 'DELIVERY_AGENT', true, true),
       ('agent9@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Mukesh Soni', '9876543226',
        'DELIVERY_AGENT', true, true),
       ('agent10@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Prakash Jain',
        '9876543227', 'DELIVERY_AGENT', true, true);

-- Customer Addresses in Bhopal
INSERT INTO addresses (user_id, label, address_line1, address_line2, city, state, pincode, latitude, longitude,
                       is_default)
VALUES (2, 'Home', 'MP Nagar Zone 1', 'Near DB Mall', 'Bhopal', 'Madhya Pradesh', '462011', 23.2327, 77.4167, true),
       (3, 'Home', 'Arera Colony', 'Sector C', 'Bhopal', 'Madhya Pradesh', '462016', 23.2156, 77.4304, true),
       (4, 'Office', 'New Market', 'TT Nagar', 'Bhopal', 'Madhya Pradesh', '462003', 23.2420, 77.4050, true);

-- Restaurants in Bhopal
USE
quickbite_restaurant;

INSERT INTO restaurants (owner_id, name, cuisine_type, description, address, city, state, pincode, location, rating,
                         review_count, phone_number, email, delivery_fee, min_delivery_time, max_delivery_time,
                         is_active, is_verified, image_url, opening_time, closing_time, delivery_radius,
                         estimated_delivery_min, is_approved, is_open, min_order_amount)
VALUES (5, 'Bapu Ki Kutia', 'North Indian', 'Authentic North Indian cuisine with traditional flavors',
        'MP Nagar Zone 2', 'Bhopal', 'Madhya Pradesh', '462011', ST_GeomFromText('POINT(77.4180 23.2350)'), 4.5, 120,
        '0755-2551234', 'bapu@restaurant.com', 30, 25, 45, true, true, 'https://example.com/bapu.jpg', '11:00:00',
        '23:00:00', 10, 30, 1, 1, 100),
       (5, 'Manohar Dairy', 'Fast Food', 'Famous for South Indian breakfast and snacks', 'New Market Area', 'Bhopal',
        'Madhya Pradesh', '462003', ST_GeomFromText('POINT(77.4050 23.2420)'), 4.3, 200, '0755-2552345',
        'manohar@restaurant.com', 25, 20, 35, true, true, 'https://example.com/manohar.jpg', '07:00:00', '22:00:00', 8,
        25, 1, 1, 80),
       (6, 'Indian Coffee House', 'Cafe', 'Classic coffee house with continental and Indian dishes', 'MP Nagar Zone 1',
        'Bhopal', 'Madhya Pradesh', '462011', ST_GeomFromText('POINT(77.4167 23.2327)'), 4.2, 150, '0755-2553456',
        'coffeehouse@restaurant.com', 20, 30, 50, true, true, 'https://example.com/coffeehouse.jpg', '08:00:00',
        '22:00:00', 12, 35, 1, 1, 120),
       (6, 'Winds N Waves', 'Multi-Cuisine', 'Lakeside dining with Indian and Chinese cuisine', 'Upper Lake', 'Bhopal',
        'Madhya Pradesh', '462001', ST_GeomFromText('POINT(77.4126 23.2599)'), 4.6, 180, '0755-2554567',
        'winds@restaurant.com', 40, 35, 55, true, true, 'https://example.com/winds.jpg', '12:00:00', '23:30:00', 15, 40,
        1, 1, 200),
       (7, 'Kwality Restaurant', 'North Indian', 'Family restaurant serving delicious North Indian food',
        'Hamidia Road', 'Bhopal', 'Madhya Pradesh', '462001', ST_GeomFromText('POINT(77.4081 23.2645)'), 4.4, 160,
        '0755-2555678', 'kwality@restaurant.com', 30, 25, 45, true, true, 'https://example.com/kwality.jpg', '11:00:00',
        '23:00:00', 10, 30, 1, 1, 150),
       (7, 'Jehan Numa Palace Hotel', 'Fine Dining', 'Premium dining experience with multiple cuisines', 'Shamla Hills',
        'Bhopal', 'Madhya Pradesh', '462013', ST_GeomFromText('POINT(77.4089 23.2443)'), 4.8, 95, '0755-2556789',
        'jehan@restaurant.com', 50, 40, 60, true, true, 'https://example.com/jehan.jpg', '12:00:00', '23:30:00', 20, 45,
        1, 1, 500),
       (8, 'Panchavati Gaurav', 'Vegetarian', 'Pure vegetarian Gujarati and Rajasthani thali', 'Arera Colony', 'Bhopal',
        'Madhya Pradesh', '462016', ST_GeomFromText('POINT(77.4304 23.2156)'), 4.3, 140, '0755-2557890',
        'panchavati@restaurant.com', 25, 30, 50, true, true, 'https://example.com/panchavati.jpg', '11:00:00',
        '22:30:00', 12, 35, 1, 1, 180),
       (8, 'Sagar Gaire', 'South Indian', 'Authentic South Indian vegetarian restaurant', 'MP Nagar Zone 2', 'Bhopal',
        'Madhya Pradesh', '462011', ST_GeomFromText('POINT(77.4200 23.2360)'), 4.1, 110, '0755-2558901',
        'sagar@restaurant.com', 20, 20, 40, true, true, 'https://example.com/sagar.jpg', '08:00:00', '22:00:00', 8, 25,
        1, 1, 100),
       (5, 'Firangi Bake', 'Italian', 'Italian comfort food and pasta specialties', 'DB Mall, Arera Colony', 'Bhopal',
        'Madhya Pradesh', '462016', ST_GeomFromText('POINT(77.4320 23.2170)'), 4.4, 130, '0755-2559012',
        'firangi@restaurant.com', 35, 30, 50, true, true, 'https://example.com/firangi.jpg', '11:00:00', '23:00:00', 10,
        35, 1, 1, 200),
       (6, 'Biryani By Kilo', 'Biryani', 'Authentic Hyderabadi biryani cooked in earthen pots', 'Bittan Market',
        'Bhopal', 'Madhya Pradesh', '462016', ST_GeomFromText('POINT(77.4280 23.2180)'), 4.5, 175, '0755-2560123',
        'bbk@restaurant.com', 30, 35, 55, true, true, 'https://example.com/bbk.jpg', '12:00:00', '23:30:00', 12, 40, 1,
        1, 250),
       (7, 'The Yellow Chilli', 'North Indian', 'Celebrity chef restaurant with modern Indian cuisine', 'DB City Mall',
        'Bhopal', 'Madhya Pradesh', '462023', ST_GeomFromText('POINT(77.4125 23.2295)'), 4.6, 165, '0755-2561234',
        'yellowchilli@restaurant.com', 40, 30, 50, true, true, 'https://example.com/yellowchilli.jpg', '12:00:00',
        '23:00:00', 15, 35, 1, 1, 300),
       (8, 'Dominos Pizza', 'Pizza', 'Popular pizza chain with variety of toppings', 'New Market, TT Nagar', 'Bhopal',
        'Madhya Pradesh', '462003', ST_GeomFromText('POINT(77.4060 23.2430)'), 4.2, 220, '0755-2562345',
        'dominos@restaurant.com', 25, 25, 40, true, true, 'https://example.com/dominos.jpg', '10:00:00', '23:00:00', 10,
        30, 1, 1, 150);

-- Restaurant Cuisines
INSERT INTO restaurant_cuisines (restaurant_id, cuisines)
SELECT r.id, 'North Indian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Bapu Ki Kutia'
UNION ALL
SELECT r.id, 'Mughlai'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Bapu Ki Kutia'
UNION ALL
SELECT r.id, 'South Indian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Manohar Dairy'
UNION ALL
SELECT r.id, 'Fast Food'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Manohar Dairy'
UNION ALL
SELECT r.id, 'Continental'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Indian Coffee House'
UNION ALL
SELECT r.id, 'Indian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Indian Coffee House'
UNION ALL
SELECT r.id, 'Chinese'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Winds N Waves'
UNION ALL
SELECT r.id, 'Indian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Winds N Waves'
UNION ALL
SELECT r.id, 'North Indian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Kwality Restaurant'
UNION ALL
SELECT r.id, 'Mughlai'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Kwality Restaurant'
UNION ALL
SELECT r.id, 'Multi-Cuisine'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Jehan Numa Palace Hotel'
UNION ALL
SELECT r.id, 'Continental'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Jehan Numa Palace Hotel'
UNION ALL
SELECT r.id, 'Gujarati'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Panchavati Gaurav'
UNION ALL
SELECT r.id, 'Rajasthani'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Panchavati Gaurav'
UNION ALL
SELECT r.id, 'South Indian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Sagar Gaire'
UNION ALL
SELECT r.id, 'Italian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Firangi Bake'
UNION ALL
SELECT r.id, 'Continental'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Firangi Bake'
UNION ALL
SELECT r.id, 'Biryani'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Biryani By Kilo'
UNION ALL
SELECT r.id, 'Hyderabadi'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Biryani By Kilo'
UNION ALL
SELECT r.id, 'North Indian'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'The Yellow Chilli'
UNION ALL
SELECT r.id, 'Chinese'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'The Yellow Chilli'
UNION ALL
SELECT r.id, 'Pizza'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Dominos Pizza'
UNION ALL
SELECT r.id, 'Fast Food'
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Dominos Pizza';

-- Menu Categories
USE
quickbite_menu;

INSERT INTO menu_categories (restaurant_id, name, description, display_order, is_active)
SELECT r.id, 'Starters', 'Appetizers and starters', 1, true
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Bapu Ki Kutia'
UNION ALL
SELECT r.id, 'Main Course', 'Main dishes', 2, true
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Bapu Ki Kutia'
UNION ALL
SELECT r.id, 'Breads', 'Indian breads', 3, true
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Bapu Ki Kutia'
UNION ALL
SELECT r.id, 'Breakfast', 'South Indian breakfast', 1, true
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Manohar Dairy'
UNION ALL
SELECT r.id, 'Snacks', 'Quick bites', 2, true
FROM quickbite_restaurant.restaurants r
WHERE r.name = 'Manohar Dairy';

-- Menu Items (30 dishes across restaurants)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available,
                        preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url)
SELECT r.id,
       c.id,
       'Paneer Tikka',
       'Grilled cottage cheese with spices',
       280,
       250,
       true,
       20,
       45,
       4.5,
       true,
       true,
       'https://example.com/paneer-tikka.jpg'
FROM quickbite_restaurant.restaurants r
         JOIN quickbite_menu.menu_categories c ON c.restaurant_id = r.id
WHERE r.name = 'Bapu Ki Kutia'
  AND c.name = 'Starters'
UNION ALL
SELECT r.id,
       c.id,
       'Butter Chicken',
       'Creamy tomato-based chicken curry',
       350,
       320,
       true,
       25,
       89,
       4.7,
       false,
       true,
       'https://example.com/butter-chicken.jpg'
FROM quickbite_restaurant.restaurants r
         JOIN quickbite_menu.menu_categories c ON c.restaurant_id = r.id
WHERE r.name = 'Bapu Ki Kutia'
  AND c.name = 'Main Course'
UNION ALL
SELECT r.id,
       c.id,
       'Garlic Naan',
       'Tandoor-baked bread with garlic',
       60,
       55,
       true,
       10,
       120,
       4.3,
       true,
       false,
       'https://example.com/garlic-naan.jpg'
FROM quickbite_restaurant.restaurants r
         JOIN quickbite_menu.menu_categories c ON c.restaurant_id = r.id
WHERE r.name = 'Bapu Ki Kutia'
  AND c.name = 'Breads'
UNION ALL
SELECT r.id,
       c.id,
       'Masala Dosa',
       'Crispy rice crepe with potato filling',
       80,
       75,
       true,
       15,
       156,
       4.6,
       true,
       true,
       'https://example.com/masala-dosa.jpg'
FROM quickbite_restaurant.restaurants r
         JOIN quickbite_menu.menu_categories c ON c.restaurant_id = r.id
WHERE r.name = 'Manohar Dairy'
  AND c.name = 'Breakfast'
UNION ALL
SELECT r.id,
       c.id,
       'Vada Pav',
       'Spicy potato fritter in bun',
       40,
       35,
       true,
       10,
       98,
       4.2,
       true,
       true,
       'https://example.com/vada-pav.jpg'
FROM quickbite_restaurant.restaurants r
         JOIN quickbite_menu.menu_categories c ON c.restaurant_id = r.id
WHERE r.name = 'Manohar Dairy'
  AND c.name = 'Snacks';

-- Delivery Agents
USE
quickbite_delivery;

INSERT INTO delivery_agents (user_id, full_name, email, phone, vehicle_type, vehicle_number, license_number,
                             current_latitude, current_longitude, average_rating, total_deliveries, is_active,
                             is_verified, is_online)
VALUES (9, 'Ravi Yadav', 'agent1@gmail.com', '9876543218', 'Bike', 'MP09AB1234', 'MP0920210001', 23.2350, 77.4180, 4.5,
        245, 1, 1, 1),
       (10, 'Suresh Tiwari', 'agent2@gmail.com', '9876543219', 'Bike', 'MP09CD5678', 'MP0920210002', 23.2420, 77.4050,
        4.3, 198, 1, 1, 1),
       (11, 'Manoj Dubey', 'agent3@gmail.com', '9876543220', 'Scooter', 'MP09EF9012', 'MP0920210003', 23.2327, 77.4167,
        4.6, 312, 1, 1, 0),
       (12, 'Deepak Mishra', 'agent4@gmail.com', '9876543221', 'Bike', 'MP09GH3456', 'MP0920210004', 23.2599, 77.4126,
        4.4, 267, 1, 1, 1),
       (13, 'Anil Chouhan', 'agent5@gmail.com', '9876543222', 'Bike', 'MP09IJ7890', 'MP0920210005', 23.2645, 77.4081,
        4.7, 289, 1, 1, 1),
       (14, 'Ramesh Prajapati', 'agent6@gmail.com', '9876543223', 'Scooter', 'MP09KL2345', 'MP0920210006', 23.2443,
        77.4089, 4.2, 156, 1, 1, 0),
       (15, 'Santosh Ahirwar', 'agent7@gmail.com', '9876543224', 'Bike', 'MP09MN6789', 'MP0920210007', 23.2156, 77.4304,
        4.5, 223, 1, 1, 1),
       (16, 'Dinesh Malviya', 'agent8@gmail.com', '9876543225', 'Bike', 'MP09OP0123', 'MP0920210008', 23.2360, 77.4200,
        4.6, 278, 1, 1, 1),
       (17, 'Mukesh Soni', 'agent9@gmail.com', '9876543226', 'Scooter', 'MP09QR4567', 'MP0920210009', 23.2170, 77.4320,
        4.3, 189, 1, 1, 0),
       (18, 'Prakash Jain', 'agent10@gmail.com', '9876543227', 'Bike', 'MP09ST8901', 'MP0920210010', 23.2295, 77.4125,
        4.8, 334, 1, 1, 1);

-- Notification Preferences for all users
USE
quickbite_notification;

INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, push_notifications,
                                      order_updates, promotional)
VALUES (1, true, true, true, true, false),
       (2, true, true, true, true, true),
       (3, true, false, true, true, false),
       (4, true, true, true, true, true),
       (5, true, true, true, true, false),
       (6, true, true, true, true, false),
       (7, true, true, true, true, false),
       (8, true, true, true, true, false),
       (9, true, true, true, true, false),
       (10, true, true, true, true, false),
       (11, true, true, true, true, false),
       (12, true, true, true, true, false),
       (13, true, true, true, true, false),
       (14, true, true, true, true, false),
       (15, true, true, true, true, false),
       (16, true, true, true, true, false),
       (17, true, true, true, true, false),
       (18, true, true, true, true, false);


-- Additional test users with different profiles for application testing
USE
quickbite_auth;

-- More Customers with different profiles
INSERT INTO users (email, password, full_name, phone, role, is_active, is_email_verified)
VALUES ('riya.kapoor@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Riya Kapoor',
        '9876543240', 'CUSTOMER', true, true),
       ('aditya.singh@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Aditya Singh',
        '9876543241', 'CUSTOMER', true, false),
       ('sneha.reddy@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Sneha Reddy',
        '9876543242', 'CUSTOMER', true, true),
       ('varun.malhotra@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Varun Malhotra',
        '9876543243', 'CUSTOMER', false, true),
       ('ishita.joshi@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Ishita Joshi',
        '9876543244', 'CUSTOMER', true, true),
       ('karthik.nair@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Karthik Nair',
        '9876543245', 'CUSTOMER', true, false),
       ('tanvi.agarwal@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Tanvi Agarwal',
        '9876543246', 'CUSTOMER', true, true),
       ('harsh.pandey@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Harsh Pandey',
        '9876543247', 'CUSTOMER', true, true),
       ('simran.kaur@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Simran Kaur',
        '9876543248', 'CUSTOMER', true, true),
       ('dev.sharma@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Dev Sharma',
        '9876543249', 'CUSTOMER', true, true);

-- More Restaurant Owners
INSERT INTO users (email, password, full_name, phone, role, is_active, is_email_verified)
VALUES ('owner9@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Anita Desai', '9876543250',
        'RESTAURANT_OWNER', true, true),
       ('owner10@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Karan Malhotra',
        '9876543251', 'RESTAURANT_OWNER', true, true),
       ('owner11@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Divya Reddy',
        '9876543252', 'RESTAURANT_OWNER', false, true),
       ('owner12@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Nikhil Chopra',
        '9876543253', 'RESTAURANT_OWNER', true, false);

-- Customer Addresses for new users (starting from user_id 122)
INSERT INTO addresses (user_id, label, address_line1, address_line2, city, state, pincode, latitude, longitude,
                       is_default)
VALUES (122, 'Home', 'Koh-e-Fiza', 'Near Bhopal Talkies', 'Bhopal', 'Madhya Pradesh', '462001', 23.2700, 77.4100, true),
       (122, 'Office', 'Bittan Market', 'Above SBI Bank', 'Bhopal', 'Madhya Pradesh', '462016', 23.2180, 77.4280,
        false),
       (123, 'Home', 'Shahpura', 'Lake View Road', 'Bhopal', 'Madhya Pradesh', '462039', 23.1950, 77.4450, true),
       (124, 'Home', 'Bairagarh', 'Main Road', 'Bhopal', 'Madhya Pradesh', '462030', 23.2650, 77.3450, true),
       (124, 'Work', 'DB City Mall', 'Zone 2', 'Bhopal', 'Madhya Pradesh', '462023', 23.2295, 77.4125, false),
       (126, 'Home', 'Ayodhya Nagar', 'Sector A', 'Bhopal', 'Madhya Pradesh', '462041', 23.1850, 77.4650, true),
       (127, 'Home', 'Govindpura', 'Near Railway Station', 'Bhopal', 'Madhya Pradesh', '462023', 23.2650, 77.4250,
        true),
       (127, 'Office', 'MP Nagar Zone 2', 'Commercial Complex', 'Bhopal', 'Madhya Pradesh', '462011', 23.2360, 77.4200,
        false),
       (128, 'Home', 'Berasia Road', 'Chuna Bhatti', 'Bhopal', 'Madhya Pradesh', '462016', 23.2550, 77.4350, true),
       (129, 'Home', 'Hoshangabad Road', 'Near AIIMS', 'Bhopal', 'Madhya Pradesh', '462026', 23.2150, 77.3950, true),
       (129, 'Office', 'Arera Colony', 'E-8 Extension', 'Bhopal', 'Madhya Pradesh', '462016', 23.2170, 77.4320, false),
       (130, 'Home', 'Kolar Road', 'Ashoka Garden', 'Bhopal', 'Madhya Pradesh', '462042', 23.1750, 77.4550, true),
       (131, 'Home', 'Indrapuri', 'Sector B', 'Bhopal', 'Madhya Pradesh', '462022', 23.2050, 77.4750, true);

-- Notification Preferences for new users (starting from user_id 122)
USE
quickbite_notification;

INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, push_notifications,
                                      order_updates, promotional)
VALUES (122, true, true, true, true, true),
       (123, true, false, true, true, false),
       (124, false, true, true, true, false),
       (125, true, true, false, true, false),
       (126, true, true, true, true, true),
       (127, false, false, true, true, false),
       (128, true, true, true, true, true),
       (129, true, false, false, true, false),
       (130, true, true, true, true, false),
       (131, true, true, true, true, true),
       (132, true, true, true, true, false),
       (133, true, true, true, true, false),
       (134, true, true, true, true, false),
       (135, true, true, true, true, false);