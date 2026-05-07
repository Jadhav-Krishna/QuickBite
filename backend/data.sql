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

USE quickbite_menu;

-- Create categories for all restaurants
INSERT INTO menu_categories (restaurant_id, name, description, display_order, is_active) VALUES
-- Bapu Ki Kutia (25) - North Indian - already has categories
-- Manohar Dairy (26) - Fast Food - already has categories
-- Indian Coffee House (27) - Cafe
(27, 'Beverages', 'Hot and Cold Drinks', 1, 1),
(27, 'Snacks', 'Light Bites', 2, 1),
-- Winds N Waves (28) - Multi-Cuisine
(28, 'Starters', 'Appetizers', 1, 1),
(28, 'Main Course', 'Main Dishes', 2, 1),
(28, 'Desserts', 'Sweet Treats', 3, 1),
-- Kwality Restaurant (29) - North Indian
(29, 'Starters', 'Appetizers', 1, 1),
(29, 'Main Course', 'Main Dishes', 2, 1),
(29, 'Breads', 'Indian Breads', 3, 1),
-- Jehan Numa Palace Hotel (30) - Fine Dining
(30, 'Appetizers', 'Starters', 1, 1),
(30, 'Main Course', 'Main Dishes', 2, 1),
(30, 'Desserts', 'Sweet Delights', 3, 1),
-- Panchavati Gaurav (31) - Vegetarian
(31, 'Starters', 'Appetizers', 1, 1),
(31, 'Main Course', 'Main Dishes', 2, 1),
(31, 'Thali', 'Complete Meals', 3, 1),
-- Sagar Gaire (32) - South Indian
(32, 'Breakfast', 'South Indian Breakfast', 1, 1),
(32, 'Dosa Varieties', 'Dosas', 2, 1),
(32, 'Rice Items', 'Rice Dishes', 3, 1),
-- Firangi Bake (33) - Italian
(33, 'Pasta', 'Italian Pasta', 1, 1),
(33, 'Lasagna', 'Baked Lasagna', 2, 1),
(33, 'Desserts', 'Sweet Treats', 3, 1),
-- Biryani By Kilo (34) - Biryani
(34, 'Biryani', 'Authentic Biryani', 1, 1),
(34, 'Kebabs', 'Grilled Kebabs', 2, 1),
(34, 'Desserts', 'Sweet Delights', 3, 1),
-- The Yellow Chilli (35) - North Indian
(35, 'Starters', 'Appetizers', 1, 1),
(35, 'Main Course', 'Main Dishes', 2, 1),
(35, 'Breads', 'Indian Breads', 3, 1),
-- Dominos Pizza (36) - Pizza
(36, 'Veg Pizza', 'Vegetarian Pizzas', 1, 1),
(36, 'Non-Veg Pizza', 'Non-Vegetarian Pizzas', 2, 1),
(36, 'Sides', 'Side Orders', 3, 1);

-- Add dishes for Bapu Ki Kutia (25) - North Indian
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(25, 21, 'Paneer Tikka', 'Grilled cottage cheese with spices', 280, 250, 1, 20, 150, 4.5, 1, 1, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7'),
(25, 21, 'Hara Bhara Kabab', 'Spinach and potato patties', 220, 200, 1, 15, 120, 4.3, 1, 0, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84'),
(25, 22, 'Dal Makhani', 'Creamy black lentils', 280, 260, 1, 30, 200, 4.7, 1, 0, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d'),
(25, 22, 'Butter Chicken', 'Creamy tomato chicken curry', 380, 350, 1, 35, 300, 4.8, 0, 1, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398'),
(25, 22, 'Palak Paneer', 'Cottage cheese in spinach gravy', 300, 280, 1, 25, 180, 4.6, 1, 0, 'https://images.unsplash.com/photo-1601050690597-df0568f70950'),
(25, 23, 'Butter Naan', 'Soft butter naan', 50, 45, 1, 10, 250, 4.5, 1, 0, 'https://images.unsplash.com/photo-1628840042765-356cda07504e'),
(25, 23, 'Garlic Naan', 'Naan with garlic', 60, 55, 1, 10, 220, 4.6, 1, 0, 'https://images.unsplash.com/photo-1619365726535-e9c6f0f5e8e0');

-- Add dishes for Manohar Dairy (26) - Fast Food
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(26, 24, 'Poha', 'Flattened rice with spices', 80, 70, 1, 15, 180, 4.4, 1, 0, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc'),
(26, 24, 'Upma', 'Semolina breakfast dish', 90, 80, 1, 15, 150, 4.2, 1, 0, 'https://images.unsplash.com/photo-1630383249896-424e482df921'),
(26, 25, 'Samosa', 'Crispy potato samosa', 30, 25, 1, 10, 300, 4.6, 1, 1, 'https://images.unsplash.com/photo-1601050690597-df0568f70950'),
(26, 25, 'Kachori', 'Spicy lentil kachori', 35, 30, 1, 10, 250, 4.5, 1, 1, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027'),
(26, 25, 'Vada Pav', 'Mumbai street food', 40, 35, 1, 10, 280, 4.7, 1, 1, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84');

-- Add dishes for Indian Coffee House (27) - Cafe
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(27, (SELECT id FROM menu_categories WHERE restaurant_id=27 AND name='Beverages' LIMIT 1), 'Filter Coffee', 'South Indian filter coffee', 60, 50, 1, 5, 400, 4.8, 1, 0, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'),
(27, (SELECT id FROM menu_categories WHERE restaurant_id=27 AND name='Beverages' LIMIT 1), 'Masala Chai', 'Indian spiced tea', 40, 35, 1, 5, 350, 4.6, 1, 0, 'https://images.unsplash.com/photo-1597318181274-c6f1a4e8d1a3'),
(27, (SELECT id FROM menu_categories WHERE restaurant_id=27 AND name='Snacks' LIMIT 1), 'Veg Sandwich', 'Grilled vegetable sandwich', 120, 100, 1, 15, 200, 4.4, 1, 0, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af'),
(27, (SELECT id FROM menu_categories WHERE restaurant_id=27 AND name='Snacks' LIMIT 1), 'Masala Dosa', 'Crispy dosa with potato filling', 150, 130, 1, 20, 250, 4.7, 1, 1, 'https://images.unsplash.com/photo-1630383249896-424e482df921');

-- Add dishes for Sagar Gaire (32) - South Indian
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(32, (SELECT id FROM menu_categories WHERE restaurant_id=32 AND name='Breakfast' LIMIT 1), 'Idli Sambar', '3 soft idlis with sambar', 80, 70, 1, 15, 300, 4.7, 1, 0, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc'),
(32, (SELECT id FROM menu_categories WHERE restaurant_id=32 AND name='Breakfast' LIMIT 1), 'Medu Vada', 'Crispy lentil donuts', 90, 80, 1, 15, 250, 4.5, 1, 1, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027'),
(32, (SELECT id FROM menu_categories WHERE restaurant_id=32 AND name='Dosa Varieties' LIMIT 1), 'Plain Dosa', 'Crispy rice crepe', 100, 90, 1, 15, 280, 4.6, 1, 0, 'https://images.unsplash.com/photo-1630383249896-424e482df921'),
(32, (SELECT id FROM menu_categories WHERE restaurant_id=32 AND name='Dosa Varieties' LIMIT 1), 'Masala Dosa', 'Dosa with potato filling', 130, 120, 1, 20, 350, 4.8, 1, 1, 'https://images.unsplash.com/photo-1630383249896-424e482df921'),
(32, (SELECT id FROM menu_categories WHERE restaurant_id=32 AND name='Dosa Varieties' LIMIT 1), 'Rava Dosa', 'Crispy semolina dosa', 140, 130, 1, 20, 200, 4.5, 1, 0, 'https://images.unsplash.com/photo-1630383249896-424e482df921'),
(32, (SELECT id FROM menu_categories WHERE restaurant_id=32 AND name='Rice Items' LIMIT 1), 'Curd Rice', 'Rice with yogurt', 110, 100, 1, 10, 180, 4.4, 1, 0, 'https://images.unsplash.com/photo-1596797038530-2c107229654b'),
(32, (SELECT id FROM menu_categories WHERE restaurant_id=32 AND name='Rice Items' LIMIT 1), 'Lemon Rice', 'Tangy lemon rice', 120, 110, 1, 15, 200, 4.5, 1, 0, 'https://images.unsplash.com/photo-1596797038530-2c107229654b');

-- Add dishes for Firangi Bake (33) - Italian
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(33, (SELECT id FROM menu_categories WHERE restaurant_id=33 AND name='Pasta' LIMIT 1), 'Alfredo Pasta', 'Creamy white sauce pasta', 280, 250, 1, 25, 220, 4.6, 1, 0, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9'),
(33, (SELECT id FROM menu_categories WHERE restaurant_id=33 AND name='Pasta' LIMIT 1), 'Arrabiata Pasta', 'Spicy tomato pasta', 260, 240, 1, 25, 200, 4.5, 1, 1, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9'),
(33, (SELECT id FROM menu_categories WHERE restaurant_id=33 AND name='Lasagna' LIMIT 1), 'Veg Lasagna', 'Layered vegetable lasagna', 320, 300, 1, 30, 180, 4.7, 1, 0, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3'),
(33, (SELECT id FROM menu_categories WHERE restaurant_id=33 AND name='Lasagna' LIMIT 1), 'Chicken Lasagna', 'Layered chicken lasagna', 380, 350, 1, 30, 250, 4.8, 0, 0, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3'),
(33, (SELECT id FROM menu_categories WHERE restaurant_id=33 AND name='Desserts' LIMIT 1), 'Tiramisu', 'Classic Italian dessert', 180, 160, 1, 10, 150, 4.6, 1, 0, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9');

-- Add dishes for Biryani By Kilo (34) - Biryani
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(34, (SELECT id FROM menu_categories WHERE restaurant_id=34 AND name='Biryani' LIMIT 1), 'Veg Biryani', 'Aromatic vegetable biryani', 280, 250, 1, 35, 300, 4.6, 1, 1, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8'),
(34, (SELECT id FROM menu_categories WHERE restaurant_id=34 AND name='Biryani' LIMIT 1), 'Chicken Biryani', 'Hyderabadi chicken biryani', 350, 320, 1, 40, 500, 4.8, 0, 1, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8'),
(34, (SELECT id FROM menu_categories WHERE restaurant_id=34 AND name='Biryani' LIMIT 1), 'Mutton Biryani', 'Tender mutton biryani', 450, 420, 1, 45, 400, 4.9, 0, 1, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8'),
(34, (SELECT id FROM menu_categories WHERE restaurant_id=34 AND name='Kebabs' LIMIT 1), 'Chicken Seekh Kebab', 'Grilled chicken kebabs', 280, 260, 1, 25, 250, 4.7, 0, 1, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0'),
(34, (SELECT id FROM menu_categories WHERE restaurant_id=34 AND name='Kebabs' LIMIT 1), 'Paneer Tikka', 'Grilled paneer tikka', 250, 230, 1, 20, 200, 4.5, 1, 1, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7');

-- Add dishes for The Yellow Chilli (35) - North Indian
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(35, (SELECT id FROM menu_categories WHERE restaurant_id=35 AND name='Starters' LIMIT 1), 'Tandoori Chicken', 'Grilled chicken in tandoor', 380, 350, 1, 30, 280, 4.8, 0, 1, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0'),
(35, (SELECT id FROM menu_categories WHERE restaurant_id=35 AND name='Starters' LIMIT 1), 'Paneer Tikka', 'Grilled cottage cheese', 280, 260, 1, 20, 220, 4.6, 1, 1, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7'),
(35, (SELECT id FROM menu_categories WHERE restaurant_id=35 AND name='Main Course' LIMIT 1), 'Rogan Josh', 'Kashmiri mutton curry', 480, 450, 1, 40, 200, 4.9, 0, 1, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398'),
(35, (SELECT id FROM menu_categories WHERE restaurant_id=35 AND name='Main Course' LIMIT 1), 'Paneer Butter Masala', 'Cottage cheese in butter gravy', 320, 300, 1, 25, 300, 4.7, 1, 0, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7'),
(35, (SELECT id FROM menu_categories WHERE restaurant_id=35 AND name='Breads' LIMIT 1), 'Tandoori Roti', 'Whole wheat tandoori roti', 40, 35, 1, 10, 250, 4.5, 1, 0, 'https://images.unsplash.com/photo-1628840042765-356cda07504e');

-- Add dishes for Dominos Pizza (36) - Pizza
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(36, (SELECT id FROM menu_categories WHERE restaurant_id=36 AND name='Veg Pizza' LIMIT 1), 'Margherita Pizza', 'Classic cheese pizza', 299, 249, 1, 20, 400, 4.5, 1, 0, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'),
(36, (SELECT id FROM menu_categories WHERE restaurant_id=36 AND name='Veg Pizza' LIMIT 1), 'Farmhouse Pizza', 'Loaded with vegetables', 399, 349, 1, 25, 350, 4.6, 1, 0, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'),
(36, (SELECT id FROM menu_categories WHERE restaurant_id=36 AND name='Veg Pizza' LIMIT 1), 'Paneer Tikka Pizza', 'Paneer tikka topping', 449, 399, 1, 25, 300, 4.7, 1, 1, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'),
(36, (SELECT id FROM menu_categories WHERE restaurant_id=36 AND name='Non-Veg Pizza' LIMIT 1), 'Chicken Dominator', 'Loaded chicken pizza', 549, 499, 1, 30, 450, 4.8, 0, 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'),
(36, (SELECT id FROM menu_categories WHERE restaurant_id=36 AND name='Non-Veg Pizza' LIMIT 1), 'Pepperoni Pizza', 'Classic pepperoni', 499, 449, 1, 25, 380, 4.7, 0, 0, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'),
(36, (SELECT id FROM menu_categories WHERE restaurant_id=36 AND name='Sides' LIMIT 1), 'Garlic Breadsticks', 'Cheesy garlic breadsticks', 149, 129, 1, 15, 300, 4.5, 1, 0, 'https://images.unsplash.com/photo-1619365726535-e9c6f0f5e8e0');

-- Add dishes for Kwality Restaurant (29) - North Indian
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(29, (SELECT id FROM menu_categories WHERE restaurant_id=29 AND name='Starters' LIMIT 1), 'Veg Manchurian', 'Indo-Chinese starter', 180, 160, 1, 20, 200, 4.4, 1, 1, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84'),
(29, (SELECT id FROM menu_categories WHERE restaurant_id=29 AND name='Starters' LIMIT 1), 'Chicken 65', 'Spicy fried chicken', 250, 230, 1, 25, 280, 4.6, 0, 1, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0'),
(29, (SELECT id FROM menu_categories WHERE restaurant_id=29 AND name='Main Course' LIMIT 1), 'Kadai Paneer', 'Cottage cheese in kadai gravy', 280, 260, 1, 25, 220, 4.5, 1, 1, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7'),
(29, (SELECT id FROM menu_categories WHERE restaurant_id=29 AND name='Main Course' LIMIT 1), 'Chicken Curry', 'Traditional chicken curry', 320, 300, 1, 30, 300, 4.7, 0, 1, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398'),
(29, (SELECT id FROM menu_categories WHERE restaurant_id=29 AND name='Breads' LIMIT 1), 'Laccha Paratha', 'Layered wheat paratha', 50, 45, 1, 10, 180, 4.4, 1, 0, 'https://images.unsplash.com/photo-1628840042765-356cda07504e');

-- Add dishes for Panchavati Gaurav (31) - Vegetarian
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(31, (SELECT id FROM menu_categories WHERE restaurant_id=31 AND name='Starters' LIMIT 1), 'Paneer Pakora', 'Fried cottage cheese fritters', 180, 160, 1, 15, 200, 4.5, 1, 0, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84'),
(31, (SELECT id FROM menu_categories WHERE restaurant_id=31 AND name='Main Course' LIMIT 1), 'Rajma Chawal', 'Kidney beans with rice', 180, 160, 1, 25, 250, 4.6, 1, 0, 'https://images.unsplash.com/photo-1596797038530-2c107229654b'),
(31, (SELECT id FROM menu_categories WHERE restaurant_id=31 AND name='Main Course' LIMIT 1), 'Chole Bhature', 'Chickpeas with fried bread', 150, 130, 1, 25, 300, 4.7, 1, 1, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027'),
(31, (SELECT id FROM menu_categories WHERE restaurant_id=31 AND name='Thali' LIMIT 1), 'Gujarati Thali', 'Complete Gujarati meal', 280, 250, 1, 30, 280, 4.8, 1, 0, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d'),
(31, (SELECT id FROM menu_categories WHERE restaurant_id=31 AND name='Thali' LIMIT 1), 'Rajasthani Thali', 'Complete Rajasthani meal', 320, 300, 1, 35, 250, 4.9, 1, 1, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d');

-- Add more dishes for Winds N Waves (28) - Multi-Cuisine
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(28, (SELECT id FROM menu_categories WHERE restaurant_id=28 AND name='Starters' LIMIT 1), 'Spring Rolls', 'Crispy vegetable spring rolls', 180, 160, 1, 20, 200, 4.4, 1, 0, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84'),
(28, (SELECT id FROM menu_categories WHERE restaurant_id=28 AND name='Starters' LIMIT 1), 'Fish Fingers', 'Crispy fried fish fingers', 280, 260, 1, 25, 180, 4.5, 0, 0, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0'),
(28, (SELECT id FROM menu_categories WHERE restaurant_id=28 AND name='Main Course' LIMIT 1), 'Hakka Noodles', 'Stir-fried noodles', 220, 200, 1, 20, 250, 4.5, 1, 1, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841'),
(28, (SELECT id FROM menu_categories WHERE restaurant_id=28 AND name='Main Course' LIMIT 1), 'Fried Rice', 'Chinese fried rice', 200, 180, 1, 20, 280, 4.4, 1, 0, 'https://images.unsplash.com/photo-1596797038530-2c107229654b'),
(28, (SELECT id FROM menu_categories WHERE restaurant_id=28 AND name='Desserts' LIMIT 1), 'Brownie with Ice Cream', 'Chocolate brownie with vanilla ice cream', 180, 160, 1, 15, 200, 4.7, 1, 0, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9');

-- Add dishes for Jehan Numa Palace Hotel (30) - Fine Dining
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url) VALUES
(30, (SELECT id FROM menu_categories WHERE restaurant_id=30 AND name='Appetizers' LIMIT 1), 'Mushroom Soup', 'Creamy mushroom soup', 220, 200, 1, 20, 150, 4.6, 1, 0, 'https://images.unsplash.com/photo-1547592166-23ac45744acd'),
(30, (SELECT id FROM menu_categories WHERE restaurant_id=30 AND name='Appetizers' LIMIT 1), 'Caesar Salad', 'Classic caesar salad', 280, 260, 1, 15, 180, 4.5, 1, 0, 'https://images.unsplash.com/photo-1546793665-c74683f339c1'),
(30, (SELECT id FROM menu_categories WHERE restaurant_id=30 AND name='Main Course' LIMIT 1), 'Grilled Salmon', 'Pan-seared salmon with vegetables', 680, 650, 1, 35, 120, 4.9, 0, 0, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288'),
(30, (SELECT id FROM menu_categories WHERE restaurant_id=30 AND name='Main Course' LIMIT 1), 'Lamb Chops', 'Grilled lamb chops', 780, 750, 1, 40, 100, 4.9, 0, 0, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0'),
(30, (SELECT id FROM menu_categories WHERE restaurant_id=30 AND name='Desserts' LIMIT 1), 'Chocolate Fondant', 'Molten chocolate cake', 280, 260, 1, 20, 150, 4.8, 1, 0, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9');


-- Sample data for Menu Service

-- Clear existing data (optional - use with caution in production)
-- DELETE FROM menu_items;
-- DELETE FROM menu_categories;

-- ==================== CATEGORIES ====================

-- Restaurant 1 Categories (Italian Restaurant)
INSERT INTO menu_categories (restaurant_id, name, description, display_order, is_active, image_url, created_at, updated_at) VALUES
(1, 'Appetizers', 'Start your meal with our delicious appetizers', 1, true, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 'Pizza', 'Authentic Italian pizzas with fresh ingredients', 2, true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 'Pasta', 'Homemade pasta dishes with traditional sauces', 3, true, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 'Desserts', 'Sweet endings to your perfect meal', 4, true, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 'Beverages', 'Refreshing drinks and beverages', 5, true, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', NOW(), NOW());

-- Restaurant 2 Categories (Indian Restaurant)
INSERT INTO menu_categories (restaurant_id, name, description, display_order, is_active, image_url, created_at, updated_at) VALUES
(2, 'Starters', 'Spicy and flavorful Indian starters', 1, true, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 'Main Course', 'Traditional Indian curries and dishes', 2, true, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 'Breads', 'Freshly baked Indian breads', 3, true, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 'Rice & Biryani', 'Aromatic rice dishes and biryanis', 4, true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 'Desserts', 'Traditional Indian sweets', 5, true, 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&h=300&fit=crop', NOW(), NOW());

-- Restaurant 3 Categories (Chinese Restaurant)
INSERT INTO menu_categories (restaurant_id, name, description, display_order, is_active, image_url, created_at, updated_at) VALUES
(3, 'Dim Sum', 'Steamed and fried dumplings', 1, true, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 'Noodles', 'Stir-fried and soup noodles', 2, true, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 'Main Course', 'Authentic Chinese main dishes', 3, true, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 'Soups', 'Hot and flavorful soups', 4, true, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', NOW(), NOW());

-- ==================== MENU ITEMS ====================

-- Restaurant 1 - Italian Restaurant Items

-- Appetizers (Category 1)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(1, 1, 'Bruschetta', 'Grilled bread topped with fresh tomatoes, garlic, and basil', 8.99, 8.99, true, 10, 45, 4.5, true, false, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 1, 'Garlic Bread', 'Toasted bread with garlic butter and herbs', 5.99, 4.99, true, 8, 120, 4.7, true, false, 'https://images.unsplash.com/photo-1573140401552-388e3c0b1f6e?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 1, 'Caprese Salad', 'Fresh mozzarella, tomatoes, and basil with balsamic glaze', 9.99, 9.99, true, 12, 67, 4.6, true, false, 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop', NOW(), NOW());

-- Pizza (Category 2)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(1, 2, 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and fresh basil', 12.99, 11.99, true, 20, 250, 4.8, true, false, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 2, 'Pepperoni Pizza', 'Loaded with pepperoni and mozzarella cheese', 14.99, 14.99, true, 20, 180, 4.7, false, false, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 2, 'Vegetarian Supreme', 'Bell peppers, mushrooms, olives, onions, and tomatoes', 13.99, 12.99, true, 22, 95, 4.5, true, false, 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 2, 'BBQ Chicken Pizza', 'Grilled chicken with BBQ sauce and red onions', 15.99, 15.99, true, 25, 110, 4.6, false, false, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', NOW(), NOW());

-- Pasta (Category 3)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(1, 3, 'Spaghetti Carbonara', 'Creamy pasta with bacon, eggs, and parmesan', 13.99, 13.99, true, 18, 145, 4.7, false, false, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 3, 'Penne Arrabbiata', 'Spicy tomato sauce with garlic and red chili', 11.99, 10.99, true, 15, 88, 4.4, true, true, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 3, 'Fettuccine Alfredo', 'Rich and creamy white sauce with parmesan', 12.99, 12.99, true, 16, 102, 4.6, true, false, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 3, 'Lasagna', 'Layered pasta with meat sauce and cheese', 14.99, 13.99, true, 30, 76, 4.8, false, false, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop', NOW(), NOW());

-- Desserts (Category 4)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(1, 4, 'Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 6.99, 6.99, true, 10, 134, 4.9, true, false, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 4, 'Panna Cotta', 'Creamy vanilla dessert with berry compote', 5.99, 5.99, true, 8, 89, 4.5, true, false, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 4, 'Gelato', 'Italian ice cream - various flavors', 4.99, 4.99, true, 5, 156, 4.7, true, false, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', NOW(), NOW());

-- Beverages (Category 5)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(1, 5, 'Italian Soda', 'Sparkling water with fruit syrup', 3.99, 3.99, true, 5, 98, 4.3, true, false, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 5, 'Espresso', 'Strong Italian coffee', 2.99, 2.99, true, 3, 210, 4.6, true, false, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop', NOW(), NOW()),
(1, 5, 'Fresh Lemonade', 'Homemade lemonade with mint', 3.49, 3.49, true, 5, 145, 4.4, true, false, 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400&h=300&fit=crop', NOW(), NOW());

-- Restaurant 2 - Indian Restaurant Items

-- Starters (Category 6)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(2, 6, 'Samosa', 'Crispy pastry filled with spiced potatoes and peas', 4.99, 4.99, true, 12, 189, 4.6, true, true, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 6, 'Paneer Tikka', 'Grilled cottage cheese marinated in spices', 8.99, 7.99, true, 18, 156, 4.7, true, true, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 6, 'Chicken 65', 'Spicy fried chicken with curry leaves', 9.99, 9.99, true, 20, 134, 4.8, false, true, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 6, 'Vegetable Pakora', 'Mixed vegetable fritters with mint chutney', 5.99, 5.99, true, 15, 112, 4.4, true, true, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop', NOW(), NOW());

-- Main Course (Category 7)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(2, 7, 'Butter Chicken', 'Tender chicken in creamy tomato sauce', 13.99, 13.99, true, 25, 298, 4.9, false, true, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 7, 'Palak Paneer', 'Cottage cheese in spinach gravy', 11.99, 11.99, true, 22, 167, 4.6, true, true, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 7, 'Dal Makhani', 'Black lentils cooked with butter and cream', 10.99, 9.99, true, 20, 145, 4.7, true, false, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 7, 'Chicken Tikka Masala', 'Grilled chicken in spiced curry sauce', 14.99, 14.99, true, 28, 223, 4.8, false, true, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 7, 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy', 12.99, 12.99, true, 23, 189, 4.7, true, true, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop', NOW(), NOW());

-- Breads (Category 8)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(2, 8, 'Butter Naan', 'Soft leavened bread with butter', 2.99, 2.99, true, 8, 345, 4.8, true, false, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 8, 'Garlic Naan', 'Naan topped with garlic and cilantro', 3.49, 3.49, true, 8, 289, 4.7, true, false, 'https://images.unsplash.com/photo-1619888312680-8e0b9e1e8e3f?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 8, 'Tandoori Roti', 'Whole wheat flatbread from tandoor', 2.49, 2.49, true, 7, 234, 4.5, true, false, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 8, 'Cheese Naan', 'Naan stuffed with cheese', 4.49, 4.49, true, 10, 178, 4.6, true, false, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', NOW(), NOW());

-- Rice & Biryani (Category 9)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(2, 9, 'Chicken Biryani', 'Aromatic basmati rice with spiced chicken', 14.99, 13.99, true, 35, 267, 4.9, false, true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 9, 'Vegetable Biryani', 'Fragrant rice with mixed vegetables', 11.99, 11.99, true, 30, 198, 4.6, true, true, 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 9, 'Jeera Rice', 'Basmati rice tempered with cumin', 5.99, 5.99, true, 15, 156, 4.4, true, false, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 9, 'Mutton Biryani', 'Tender mutton with aromatic rice', 16.99, 16.99, true, 40, 145, 4.8, false, true, 'https://images.unsplash.com/photo-1633945274309-2c8c2b0e3b6f?w=400&h=300&fit=crop', NOW(), NOW());

-- Desserts (Category 10)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(2, 10, 'Gulab Jamun', 'Sweet milk dumplings in sugar syrup', 4.99, 4.99, true, 5, 234, 4.7, true, false, 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 10, 'Rasmalai', 'Soft cheese patties in sweet milk', 5.99, 5.99, true, 8, 189, 4.8, true, false, 'https://images.unsplash.com/photo-1589119908995-c6c8f7a96a01?w=400&h=300&fit=crop', NOW(), NOW()),
(2, 10, 'Kulfi', 'Traditional Indian ice cream', 4.49, 4.49, true, 5, 167, 4.5, true, false, 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=400&h=300&fit=crop', NOW(), NOW());

-- Restaurant 3 - Chinese Restaurant Items

-- Dim Sum (Category 11)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(3, 11, 'Vegetable Dumplings', 'Steamed dumplings with mixed vegetables', 7.99, 7.99, true, 15, 145, 4.5, true, false, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 11, 'Chicken Dumplings', 'Steamed dumplings with chicken filling', 8.99, 8.99, true, 15, 178, 4.6, false, false, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 11, 'Pork Buns', 'Steamed buns with BBQ pork filling', 9.99, 9.99, true, 18, 134, 4.7, false, false, 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 11, 'Spring Rolls', 'Crispy rolls with vegetable filling', 6.99, 6.99, true, 12, 189, 4.4, true, false, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop', NOW(), NOW());

-- Noodles (Category 12)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(3, 12, 'Hakka Noodles', 'Stir-fried noodles with vegetables', 10.99, 10.99, true, 18, 223, 4.6, true, false, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 12, 'Chicken Chow Mein', 'Noodles with chicken and vegetables', 12.99, 12.99, true, 20, 198, 4.7, false, false, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 12, 'Singapore Noodles', 'Spicy curry noodles with shrimp', 13.99, 13.99, true, 22, 167, 4.5, false, true, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 12, 'Dan Dan Noodles', 'Spicy Sichuan noodles with pork', 11.99, 11.99, true, 18, 145, 4.8, false, true, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop', NOW(), NOW());

-- Main Course (Category 13)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(3, 13, 'Kung Pao Chicken', 'Spicy stir-fried chicken with peanuts', 13.99, 13.99, true, 22, 234, 4.7, false, true, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 13, 'Sweet and Sour Pork', 'Crispy pork in tangy sauce', 14.99, 14.99, true, 25, 189, 4.6, false, false, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 13, 'Mapo Tofu', 'Spicy tofu with minced pork', 11.99, 11.99, true, 20, 156, 4.5, false, true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 13, 'General Tso Chicken', 'Crispy chicken in sweet spicy sauce', 14.99, 13.99, true, 23, 212, 4.8, false, true, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 13, 'Vegetable Manchurian', 'Fried vegetable balls in spicy sauce', 10.99, 10.99, true, 20, 178, 4.4, true, true, 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop', NOW(), NOW());

-- Soups (Category 14)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discounted_price, is_available, preparation_time, order_count, rating, is_vegetarian, is_spicy, image_url, created_at, updated_at) VALUES
(3, 14, 'Hot and Sour Soup', 'Spicy and tangy soup with vegetables', 5.99, 5.99, true, 12, 198, 4.6, true, true, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 14, 'Wonton Soup', 'Clear soup with pork wontons', 6.99, 6.99, true, 15, 167, 4.5, false, false, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 14, 'Corn Soup', 'Creamy sweet corn soup', 4.99, 4.99, true, 10, 145, 4.4, true, false, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop', NOW(), NOW()),
(3, 14, 'Tom Yum Soup', 'Spicy Thai soup with shrimp', 7.99, 7.99, true, 15, 134, 4.7, false, true, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop', NOW(), NOW());
