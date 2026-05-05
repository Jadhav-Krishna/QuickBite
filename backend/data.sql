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
