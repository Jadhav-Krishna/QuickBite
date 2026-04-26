-- Additional test users with different profiles for application testing
USE quickbite_auth;

-- More Customers with different profiles
INSERT INTO users (email, password, full_name, phone, role, is_active, is_email_verified) VALUES
('riya.kapoor@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Riya Kapoor', '9876543240', 'CUSTOMER', true, true),
('aditya.singh@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Aditya Singh', '9876543241', 'CUSTOMER', true, false),
('sneha.reddy@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Sneha Reddy', '9876543242', 'CUSTOMER', true, true),
('varun.malhotra@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Varun Malhotra', '9876543243', 'CUSTOMER', false, true),
('ishita.joshi@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Ishita Joshi', '9876543244', 'CUSTOMER', true, true),
('karthik.nair@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Karthik Nair', '9876543245', 'CUSTOMER', true, false),
('tanvi.agarwal@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Tanvi Agarwal', '9876543246', 'CUSTOMER', true, true),
('harsh.pandey@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Harsh Pandey', '9876543247', 'CUSTOMER', true, true),
('simran.kaur@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Simran Kaur', '9876543248', 'CUSTOMER', true, true),
('dev.sharma@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Dev Sharma', '9876543249', 'CUSTOMER', true, true);

-- More Restaurant Owners
INSERT INTO users (email, password, full_name, phone, role, is_active, is_email_verified) VALUES
('owner9@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Anita Desai', '9876543250', 'RESTAURANT_OWNER', true, true),
('owner10@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Karan Malhotra', '9876543251', 'RESTAURANT_OWNER', true, true),
('owner11@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Divya Reddy', '9876543252', 'RESTAURANT_OWNER', false, true),
('owner12@gmail.com', '$2a$10$nTuKUheUhBe65UMA2KVBK.URjZbgT79m0Ifqdc0../ij.jLqPutaO', 'Nikhil Chopra', '9876543253', 'RESTAURANT_OWNER', true, false);

-- Customer Addresses for new users (starting from user_id 122)
INSERT INTO addresses (user_id, label, address_line1, address_line2, city, state, pincode, latitude, longitude, is_default) VALUES
(122, 'Home', 'Koh-e-Fiza', 'Near Bhopal Talkies', 'Bhopal', 'Madhya Pradesh', '462001', 23.2700, 77.4100, true),
(122, 'Office', 'Bittan Market', 'Above SBI Bank', 'Bhopal', 'Madhya Pradesh', '462016', 23.2180, 77.4280, false),
(123, 'Home', 'Shahpura', 'Lake View Road', 'Bhopal', 'Madhya Pradesh', '462039', 23.1950, 77.4450, true),
(124, 'Home', 'Bairagarh', 'Main Road', 'Bhopal', 'Madhya Pradesh', '462030', 23.2650, 77.3450, true),
(124, 'Work', 'DB City Mall', 'Zone 2', 'Bhopal', 'Madhya Pradesh', '462023', 23.2295, 77.4125, false),
(126, 'Home', 'Ayodhya Nagar', 'Sector A', 'Bhopal', 'Madhya Pradesh', '462041', 23.1850, 77.4650, true),
(127, 'Home', 'Govindpura', 'Near Railway Station', 'Bhopal', 'Madhya Pradesh', '462023', 23.2650, 77.4250, true),
(127, 'Office', 'MP Nagar Zone 2', 'Commercial Complex', 'Bhopal', 'Madhya Pradesh', '462011', 23.2360, 77.4200, false),
(128, 'Home', 'Berasia Road', 'Chuna Bhatti', 'Bhopal', 'Madhya Pradesh', '462016', 23.2550, 77.4350, true),
(129, 'Home', 'Hoshangabad Road', 'Near AIIMS', 'Bhopal', 'Madhya Pradesh', '462026', 23.2150, 77.3950, true),
(129, 'Office', 'Arera Colony', 'E-8 Extension', 'Bhopal', 'Madhya Pradesh', '462016', 23.2170, 77.4320, false),
(130, 'Home', 'Kolar Road', 'Ashoka Garden', 'Bhopal', 'Madhya Pradesh', '462042', 23.1750, 77.4550, true),
(131, 'Home', 'Indrapuri', 'Sector B', 'Bhopal', 'Madhya Pradesh', '462022', 23.2050, 77.4750, true);

-- Notification Preferences for new users (starting from user_id 122)
USE quickbite_notification;

INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, push_notifications, order_updates, promotional) VALUES
(122, true, true, true, true, true),
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
