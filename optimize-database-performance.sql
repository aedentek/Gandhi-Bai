-- 🚀 Database Performance Optimization Script
-- This script adds missing indexes to improve query performance

-- Patients table indexes
ALTER TABLE patients 
ADD INDEX IF NOT EXISTS idx_patient_id (patient_id),
ADD INDEX IF NOT EXISTS idx_phone (phone_number),
ADD INDEX IF NOT EXISTS idx_created_date (created_at);

-- Staff table indexes  
ALTER TABLE staff
ADD INDEX IF NOT EXISTS idx_staff_id (staff_id),
ADD INDEX IF NOT EXISTS idx_phone (phone_number),
ADD INDEX IF NOT EXISTS idx_category (category);

-- Doctors table indexes
ALTER TABLE doctors
ADD INDEX IF NOT EXISTS idx_doctor_id (doctor_id),
ADD INDEX IF NOT EXISTS idx_name (full_name),
ADD INDEX IF NOT EXISTS idx_specialization (specialization);

-- Medical records indexes
ALTER TABLE medical_records
ADD INDEX IF NOT EXISTS idx_patient_id (patient_id),
ADD INDEX IF NOT EXISTS idx_date (visit_date),
ADD INDEX IF NOT EXISTS idx_doctor (doctor_name);

-- Medicine products indexes
ALTER TABLE medicine_products
ADD INDEX IF NOT EXISTS idx_name (name),
ADD INDEX IF NOT EXISTS idx_category (category),
ADD INDEX IF NOT EXISTS idx_supplier (supplier);

-- Settings table indexes
ALTER TABLE app_settings
ADD INDEX IF NOT EXISTS idx_setting_key (setting_key),
ADD INDEX IF NOT EXISTS idx_category (category);

-- Test reports indexes (if exists)
CREATE TABLE IF NOT EXISTS test_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_test_date (test_date),
    INDEX idx_status (status),
    INDEX idx_patient_date (patient_id, test_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fees table optimization
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    payment_date DATE,
    status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_patient_status (patient_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
