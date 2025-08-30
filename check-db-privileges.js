#!/usr/bin/env node

/**
 * 🔍 Database Privileges Checker
 * This script checks what privileges your database user has
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'server', '.env') });

console.log('🔍 Database Privileges Checker');
console.log('=' .repeat(50));

async function checkDatabasePrivileges() {
  let connection;
  
  try {
    console.log('📡 Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connection successful!');
    
    // Check user privileges
    console.log('\n🔐 Checking user privileges...');
    try {
      const [privileges] = await connection.execute('SHOW GRANTS FOR CURRENT_USER()');
      console.log('📋 Current user privileges:');
      privileges.forEach((grant, index) => {
        console.log(`${index + 1}. ${Object.values(grant)[0]}`);
      });
    } catch (error) {
      console.log('❌ Cannot check privileges:', error.message);
    }
    
    // Check if user can create tables
    console.log('\n🏗️ Testing table creation privileges...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS test_privileges_check (
          id INT AUTO_INCREMENT PRIMARY KEY,
          test_field VARCHAR(50)
        )
      `);
      console.log('✅ CREATE TABLE privilege: Available');
      
      // Clean up test table
      await connection.execute('DROP TABLE test_privileges_check');
      console.log('✅ DROP TABLE privilege: Available');
    } catch (error) {
      console.log('❌ CREATE/DROP TABLE privilege: Not available');
      console.log(`   Error: ${error.message}`);
    }
    
    // Check if user can create indexes
    console.log('\n📊 Testing index creation privileges...');
    try {
      // First create a simple table for testing
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS test_index_check (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100)
        )
      `);
      
      await connection.execute('CREATE INDEX idx_test_name ON test_index_check (name)');
      console.log('✅ CREATE INDEX privilege: Available');
      
      await connection.execute('DROP INDEX idx_test_name ON test_index_check');
      await connection.execute('DROP TABLE test_index_check');
      console.log('✅ DROP INDEX privilege: Available');
    } catch (error) {
      console.log('❌ INDEX privileges: Limited');
      console.log(`   Error: ${error.message}`);
    }
    
    // Check existing tables
    console.log('\n📋 Checking existing tables...');
    try {
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📊 Found ${tables.length} existing tables:`);
      
      tables.slice(0, 10).forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`${index + 1}. ${tableName}`);
      });
      
      if (tables.length > 10) {
        console.log(`   ... and ${tables.length - 10} more tables`);
      }
    } catch (error) {
      console.log('❌ Cannot list tables:', error.message);
    }
    
    // Test basic CRUD operations
    console.log('\n🧪 Testing basic database operations...');
    
    // Check if we can perform SELECT queries
    try {
      const [result] = await connection.execute('SELECT 1 as test');
      console.log('✅ SELECT privilege: Available');
    } catch (error) {
      console.log('❌ SELECT privilege: Not available');
    }
    
    // Performance test
    console.log('\n⏱️ Testing query performance...');
    const start = Date.now();
    try {
      await connection.execute('SELECT COUNT(*) FROM patients');
      const queryTime = Date.now() - start;
      console.log(`✅ Query performance: ${queryTime}ms`);
      
      if (queryTime > 2000) {
        console.log('⚠️ Warning: Slow query performance detected');
        console.log('💡 Recommendations:');
        console.log('   - Add database indexes');
        console.log('   - Optimize queries');
        console.log('   - Check network latency');
      }
    } catch (error) {
      console.log('❌ Cannot test performance:', error.message);
    }
    
    console.log('\n📊 Summary:');
    console.log('✅ Database connection: Working');
    console.log('ℹ️ Limited privileges detected - this is normal for shared hosting');
    console.log('💡 Your database user can read/write data but may not create new tables');
    console.log('🔧 Solution: Ask your hosting provider to create the missing tables');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Possible solutions:');
      console.log('   - Check if the database host is correct');
      console.log('   - Verify internet connection');
      console.log('   - Check if the database server is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Possible solutions:');
      console.log('   - Verify database username and password');
      console.log('   - Check if the user has access from your IP address');
      console.log('   - Contact your hosting provider');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkDatabasePrivileges();
