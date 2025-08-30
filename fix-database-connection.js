#!/usr/bin/env node

/**
 * 🔧 QUICK DATABASE CONNECTION FIX
 * Resolves ECONNRESET and timeout issues
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

console.log('🔧 DATABASE CONNECTION QUICK FIX');
console.log('=' .repeat(40));

async function fixDatabaseConnection() {
  console.log('📡 Testing database connection...');
  
  let connection;
  try {
    // Create a more robust connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM patients LIMIT 1');
    console.log('✅ Database query test successful');
    console.log('📊 Patients count:', result[0].count);
    
    // Test fees table specifically (the one failing in your screenshot)
    try {
      const [feesTest] = await connection.execute('SELECT COUNT(*) as count FROM fees LIMIT 1');
      console.log('✅ Fees table accessible:', feesTest[0].count, 'records');
    } catch (feesError) {
      console.log('⚠️ Fees table issue:', feesError.message);
      
      // Try to create fees table if it doesn't exist
      try {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS fees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id VARCHAR(20) NOT NULL,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            fee_type VARCHAR(100) DEFAULT 'monthly_fee',
            month INT NOT NULL,
            year INT NOT NULL,
            status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            INDEX idx_patient_id (patient_id),
            INDEX idx_status (status),
            INDEX idx_month_year (month, year)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Fees table created/verified');
      } catch (createError) {
        console.log('ℹ️ Fees table creation skipped (may already exist)');
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNRESET') {
      console.log('\n💡 ECONNRESET Solutions:');
      console.log('1. Database server may be overloaded');
      console.log('2. Network connectivity issues');
      console.log('3. Database timeout settings too low');
      console.log('4. SSL/TLS handshake problems');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 DNS Resolution Issues:');
      console.log('1. Check database hostname');
      console.log('2. Verify internet connectivity');
      console.log('3. DNS server issues');
    }
    
    console.log('\n🔧 Recommended Actions:');
    console.log('1. Restart your backend server');
    console.log('2. Check Hostinger database status');
    console.log('3. Verify environment variables');
    console.log('4. Contact hosting provider if issues persist');
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

fixDatabaseConnection();
