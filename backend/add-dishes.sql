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
