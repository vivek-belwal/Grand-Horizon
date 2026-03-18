-- ============================================================
--   HOTEL MANAGEMENT SYSTEM — DATABASE
--   Database: hotel_management
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- ============================================================
-- TABLE: rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  room_id        INT AUTO_INCREMENT PRIMARY KEY,
  room_number    VARCHAR(10)  NOT NULL UNIQUE,
  type           ENUM('Single','Double','Suite','Deluxe','Presidential') NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  status         ENUM('Available','Booked','Maintenance') DEFAULT 'Available',
  floor          INT NOT NULL,
  max_occupancy  INT NOT NULL,
  description    TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: guests
-- ============================================================
CREATE TABLE IF NOT EXISTS guests (
  guest_id    INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(50)  NOT NULL,
  last_name   VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  phone       VARCHAR(20)  NOT NULL,
  address     TEXT,
  id_proof    VARCHAR(100),
  nationality VARCHAR(50),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  booking_id      INT AUTO_INCREMENT PRIMARY KEY,
  guest_id        INT NOT NULL,
  room_id         INT NOT NULL,
  check_in        DATE NOT NULL,
  check_out       DATE NOT NULL,
  total_amount    DECIMAL(10,2),
  payment_status  ENUM('Pending','Paid','Refunded') DEFAULT 'Pending',
  booking_status  ENUM('Confirmed','Checked-In','Checked-Out','Cancelled') DEFAULT 'Confirmed',
  special_request TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id)  REFERENCES rooms(room_id)   ON DELETE CASCADE
);

-- ============================================================
-- TABLE: staff
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  staff_id   INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  role       ENUM('Manager','Receptionist','Housekeeping','Security','Chef','Maintenance') NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(20)  NOT NULL,
  salary     DECIMAL(10,2) NOT NULL,
  join_date  DATE NOT NULL,
  status     ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  payment_id     INT AUTO_INCREMENT PRIMARY KEY,
  booking_id     INT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method ENUM('Cash','Credit Card','Debit Card','UPI','Net Banking') NOT NULL,
  transaction_id VARCHAR(100),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- ============================================================
-- SAMPLE DATA: rooms
-- ============================================================
INSERT INTO rooms (room_number, type, price_per_night, status, floor, max_occupancy, description) VALUES
('101', 'Single',       1500.00, 'Available',   1, 1, 'Cozy single room with garden view'),
('102', 'Single',       1500.00, 'Booked',      1, 1, 'Cozy single room with garden view'),
('103', 'Double',       2500.00, 'Available',   1, 2, 'Spacious double room with twin beds'),
('201', 'Double',       2500.00, 'Available',   2, 2, 'Double room with city view'),
('202', 'Deluxe',       4000.00, 'Maintenance', 2, 3, 'Deluxe room with king bed and balcony'),
('203', 'Deluxe',       4000.00, 'Available',   2, 3, 'Deluxe room with sea view'),
('301', 'Suite',        7000.00, 'Booked',      3, 4, 'Luxury suite with living area'),
('302', 'Suite',        7000.00, 'Available',   3, 4, 'Suite with private jacuzzi'),
('401', 'Presidential', 15000.00,'Available',   4, 6, 'Presidential suite with panoramic view'),
('402', 'Presidential', 15000.00,'Booked',      4, 6, 'Presidential suite with private pool');

-- ============================================================
-- SAMPLE DATA: guests
-- ============================================================
INSERT INTO guests (first_name, last_name, email, phone, address, id_proof, nationality) VALUES
('Rahul',   'Sharma',   'rahul.sharma@email.com',   '9876543210', 'Delhi, India',        'Aadhaar-1234', 'Indian'),
('Priya',   'Singh',    'priya.singh@email.com',    '9876543211', 'Mumbai, India',       'Passport-A001','Indian'),
('Amit',    'Verma',    'amit.verma@email.com',     '9876543212', 'Bangalore, India',    'Aadhaar-5678', 'Indian'),
('Sneha',   'Patel',    'sneha.patel@email.com',    '9876543213', 'Ahmedabad, India',    'DL-MH001',     'Indian'),
('John',    'Smith',    'john.smith@email.com',     '9876543214', 'New York, USA',       'Passport-US01','American'),
('Emily',   'Johnson',  'emily.j@email.com',        '9876543215', 'London, UK',          'Passport-UK01','British'),
('Vikram',  'Nair',     'vikram.nair@email.com',    '9876543216', 'Chennai, India',      'Aadhaar-9012', 'Indian'),
('Anjali',  'Gupta',    'anjali.gupta@email.com',   '9876543217', 'Kolkata, India',      'Passport-A002','Indian'),
('Carlos',  'Garcia',   'carlos.g@email.com',       '9876543218', 'Madrid, Spain',       'Passport-SP01','Spanish'),
('Meera',   'Reddy',    'meera.reddy@email.com',    '9876543219', 'Hyderabad, India',    'Aadhaar-3456', 'Indian');

-- ============================================================
-- SAMPLE DATA: bookings
-- ============================================================
INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount, payment_status, booking_status, special_request) VALUES
(1,  2,  '2025-03-01', '2025-03-05', 6000.00,  'Paid',    'Checked-Out', 'Early check-in requested'),
(2,  7,  '2025-03-10', '2025-03-15', 35000.00, 'Paid',    'Checked-Out', 'Honeymoon decoration'),
(3,  1,  '2025-04-01', '2025-04-03', 3000.00,  'Pending', 'Confirmed',   NULL),
(4,  4,  '2025-04-05', '2025-04-08', 7500.00,  'Paid',    'Confirmed',   'Extra pillows'),
(5,  9,  '2025-04-10', '2025-04-14', 60000.00, 'Paid',    'Checked-In',  'Airport pickup needed'),
(6,  3,  '2025-04-12', '2025-04-15', 7500.00,  'Pending', 'Confirmed',   NULL),
(7,  5,  '2025-04-15', '2025-04-18', 12000.00, 'Paid',    'Confirmed',   'Vegetarian meals only'),
(8,  8,  '2025-04-20', '2025-04-25', 35000.00, 'Pending', 'Confirmed',   'Birthday surprise setup'),
(9,  10, '2025-04-22', '2025-04-26', 60000.00, 'Paid',    'Checked-In',  NULL),
(10, 6,  '2025-04-25', '2025-04-28', 12000.00, 'Pending', 'Confirmed',   'Late check-out needed');

-- ============================================================
-- SAMPLE DATA: staff
-- ============================================================
INSERT INTO staff (name, role, email, phone, salary, join_date, status) VALUES
('Rajesh Kumar',    'Manager',       'rajesh.k@hotel.com',   '9800000001', 75000.00, '2020-01-15', 'Active'),
('Sunita Devi',     'Receptionist',  'sunita.d@hotel.com',   '9800000002', 30000.00, '2021-03-10', 'Active'),
('Mohan Lal',       'Housekeeping',  'mohan.l@hotel.com',    '9800000003', 22000.00, '2021-06-01', 'Active'),
('Geeta Sharma',    'Housekeeping',  'geeta.s@hotel.com',    '9800000004', 22000.00, '2022-01-20', 'Active'),
('Arjun Mehta',     'Security',      'arjun.m@hotel.com',    '9800000005', 28000.00, '2020-11-05', 'Active'),
('Kavita Rao',      'Receptionist',  'kavita.r@hotel.com',   '9800000006', 30000.00, '2022-07-15', 'Active'),
('Deepak Joshi',    'Chef',          'deepak.j@hotel.com',   '9800000007', 45000.00, '2019-08-01', 'Active'),
('Pooja Mishra',    'Maintenance',   'pooja.m@hotel.com',    '9800000008', 25000.00, '2023-02-10', 'Active'),
('Sanjay Tiwari',   'Security',      'sanjay.t@hotel.com',   '9800000009', 28000.00, '2021-09-15', 'Active'),
('Ritu Agarwal',    'Manager',       'ritu.a@hotel.com',     '9800000010', 70000.00, '2020-04-01', 'Active');

-- ============================================================
-- SAMPLE DATA: payments
-- ============================================================
INSERT INTO payments (booking_id, amount, payment_method, transaction_id) VALUES
(1,  6000.00,  'UPI',         'UPI-TXN-001'),
(2,  35000.00, 'Credit Card', 'CC-TXN-002'),
(4,  7500.00,  'Net Banking', 'NB-TXN-004'),
(5,  60000.00, 'Credit Card', 'CC-TXN-005'),
(7,  12000.00, 'Cash',        NULL),
(9,  60000.00, 'Debit Card',  'DC-TXN-009');

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- View: All bookings with guest and room details
CREATE OR REPLACE VIEW booking_details AS
SELECT
  b.booking_id,
  CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
  g.email, g.phone,
  r.room_number, r.type AS room_type,
  b.check_in, b.check_out,
  DATEDIFF(b.check_out, b.check_in) AS nights,
  b.total_amount, b.payment_status, b.booking_status
FROM bookings b
JOIN guests  g ON b.guest_id = g.guest_id
JOIN rooms   r ON b.room_id  = r.room_id;

-- View: Room availability summary
CREATE OR REPLACE VIEW room_summary AS
SELECT
  type,
  COUNT(*) AS total_rooms,
  SUM(status = 'Available')   AS available,
  SUM(status = 'Booked')      AS booked,
  SUM(status = 'Maintenance') AS maintenance
FROM rooms
GROUP BY type;

-- View: Revenue by month
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  DATE_FORMAT(payment_date, '%Y-%m') AS month,
  SUM(amount)                        AS total_revenue,
  COUNT(*)                           AS total_transactions
FROM payments
GROUP BY DATE_FORMAT(payment_date, '%Y-%m');

-- ============================================================
-- USEFUL QUERIES (for reference)
-- ============================================================

-- Available rooms:
-- SELECT * FROM rooms WHERE status = 'Available';

-- Current checked-in guests:
-- SELECT * FROM booking_details WHERE booking_status = 'Checked-In';

-- Revenue summary:
-- SELECT * FROM monthly_revenue;

-- Room occupancy:
-- SELECT * FROM room_summary;
