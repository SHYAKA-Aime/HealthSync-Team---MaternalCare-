-- MaternalCare+ Database Schema
-- MySQL Database

CREATE DATABASE IF NOT EXISTS mcht_db;
USE mcht_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS vaccinations;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS children;
DROP TABLE IF EXISTS mothers;
DROP TABLE IF EXISTS health_workers;
DROP TABLE IF EXISTS clinics;
DROP TABLE IF EXISTS users;

-- Users Table (Core authentication)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('mother', 'health_worker', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clinics Table
CREATE TABLE clinics (
    clinic_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Health Workers Table
CREATE TABLE health_workers (
    hw_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    clinic_id INT,
    position VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON DELETE SET NULL
);

-- Mothers Table
CREATE TABLE mothers (
    mother_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    age INT,
    blood_group VARCHAR(10),
    pregnancy_stage VARCHAR(50),
    expected_delivery DATE,
    location VARCHAR(255),
    medical_conditions TEXT,
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Children Table
CREATE TABLE children (
    child_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    birth_weight DECIMAL(5,2),
    birth_height DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES mothers(mother_id) ON DELETE CASCADE
);

-- Visits Table
CREATE TABLE visits (
    visit_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    hw_id INT,
    visit_date DATE NOT NULL,
    visit_type ENUM('antenatal', 'postnatal', 'general') NOT NULL,
    weight DECIMAL(5,2),
    blood_pressure VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES mothers(mother_id) ON DELETE CASCADE,
    FOREIGN KEY (hw_id) REFERENCES health_workers(hw_id) ON DELETE SET NULL
);

-- Vaccinations Table
CREATE TABLE vaccinations (
    vaccine_id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    hw_id INT,
    vaccine_name VARCHAR(100) NOT NULL,
    date_given DATE NOT NULL,
    next_due_date DATE,
    administered_by VARCHAR(255),
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
    FOREIGN KEY (hw_id) REFERENCES health_workers(hw_id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_mother_user ON mothers(user_id);
CREATE INDEX idx_hw_user ON health_workers(user_id);
CREATE INDEX idx_hw_clinic ON health_workers(clinic_id);
CREATE INDEX idx_child_mother ON children(mother_id);
CREATE INDEX idx_visit_mother ON visits(mother_id);
CREATE INDEX idx_visit_date ON visits(visit_date);
CREATE INDEX idx_vaccination_child ON vaccinations(child_id);
CREATE INDEX idx_vaccination_date ON vaccinations(date_given);

-- Insert sample data for testing

-- Sample clinic
INSERT INTO clinics (name, location, contact) VALUES
('Kigali Health Center', 'Kigali, Gasabo District', '+250788123456');

-- Sample users
INSERT INTO users (full_name, email, phone, password_hash, role) VALUES
('Jane Doe', 'jane@example.com', '+250788111111', '$2b$12$sample_hash_will_be_replaced', 'mother'),
('Dr. John Smith', 'doctor@example.com', '+250788222222', '$2b$12$sample_hash_will_be_replaced', 'health_worker'),
('Admin User', 'admin@example.com', '+250788333333', '$2b$12$sample_hash_will_be_replaced', 'admin');

-- Sample health worker
INSERT INTO health_workers (user_id, clinic_id, position, department) VALUES
(2, 1, 'Nurse', 'Maternal Health');

-- Sample mother
INSERT INTO mothers (user_id, age, blood_group, pregnancy_stage, expected_delivery, location, emergency_contact) VALUES
(1, 28, 'O+', 'Second Trimester', '2025-06-15', 'Kigali, Gasabo', '+250788444444');

-- Sample child
INSERT INTO children (mother_id, full_name, dob, gender, birth_weight, birth_height) VALUES
(1, 'Baby Doe', '2024-01-15', 'female', 3.2, 48.5);

-- Sample visit
INSERT INTO visits (mother_id, hw_id, visit_date, visit_type, weight, blood_pressure, notes) VALUES
(1, 1, '2025-01-15', 'antenatal', 65.5, '120/80', 'Regular checkup - all vital signs normal');

-- Sample vaccination
INSERT INTO vaccinations (child_id, hw_id, vaccine_name, date_given, next_due_date, administered_by, batch_number) VALUES
(1, 1, 'BCG', '2024-01-16', NULL, 'Dr. John Smith', 'BCG2024-001');

-- Verification queries
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_mothers FROM mothers;
SELECT COUNT(*) as total_children FROM children;
