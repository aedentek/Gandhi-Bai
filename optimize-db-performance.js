#!/usr/bin/env node

/**
 * 🚀 Database Performance Improvement Script
 * This script diagnoses and fixes common database performance issues
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'server', '.env') });

console.log('🔧 CRM Database Performance Optimizer');
console.log('=' .repeat(50));

async function optimizeDatabase() {
  let connection;
  
  try {
    // Create connection with improved configuration
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      },
      timeout: 60000,
      acquireTimeout: 60000
    });
    
    console.log('✅ Connected to database successfully');
    
    // Test connection speed
    console.log('\n🏃‍♂️ Testing connection speed...');
    const start = Date.now();
    await connection.execute('SELECT 1');
    const connectionTime = Date.now() - start;
    console.log(`⏱️ Connection response time: ${connectionTime}ms`);
    
    if (connectionTime > 2000) {
      console.log('⚠️ Slow connection detected. This may cause performance issues.');
    }
    
    // Check database version
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 Database version: ${version[0].version}`);
    
    // Check existing tables
    console.log('\n📋 Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📦 Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]).join(', '));
    
    // Check for missing indexes
    console.log('\n🔍 Analyzing table performance...');
    
    const importantTables = ['patients', 'staff', 'doctors', 'medical_records', 'app_settings'];
    
    for (const tableName of importantTables) {
      try {
        // Check if table exists
        const [tableExists] = await connection.execute(
          'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
          [process.env.DB_NAME, tableName]
        );
        
        if (tableExists[0].count === 0) {
          console.log(`❌ Table '${tableName}' does not exist`);
          continue;
        }
        
        // Get table row count
        const [rowCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        // Check indexes
        const [indexes] = await connection.execute(`SHOW INDEX FROM ${tableName}`);
        
        console.log(`📊 ${tableName}: ${rowCount[0].count} rows, ${indexes.length} indexes`);
        
        // Test query performance
        const queryStart = Date.now();
        await connection.execute(`SELECT * FROM ${tableName} LIMIT 10`);
        const queryTime = Date.now() - queryStart;
        
        if (queryTime > 1000) {
          console.log(`⚠️ Slow query on ${tableName}: ${queryTime}ms`);
        } else {
          console.log(`✅ ${tableName} performance: ${queryTime}ms`);
        }
        
      } catch (error) {
        console.log(`❌ Error checking ${tableName}:`, error.message);
      }
    }
    
    // Apply performance optimizations
    console.log('\n🚀 Applying performance optimizations...');
    
    try {
      // Read and execute the optimization SQL
      const optimizationSQL = readFileSync(join(__dirname, 'optimize-database-performance.sql'), 'utf8');
      const statements = optimizationSQL.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim().startsWith('--') || statement.trim().length === 0) continue;
        
        try {
          await connection.execute(statement);
          console.log('✅ Applied optimization:', statement.split('\n')[0].substring(0, 50) + '...');
        } catch (error) {
          console.log('⚠️ Optimization warning:', error.message.substring(0, 100));
        }
      }
      
    } catch (error) {
      console.log('❌ Error applying optimizations:', error.message);
    }
    
    // Final performance test
    console.log('\n🎯 Running final performance test...');
    
    const finalStart = Date.now();
    await connection.execute('SELECT COUNT(*) FROM patients UNION ALL SELECT COUNT(*) FROM staff');
    const finalTime = Date.now() - finalStart;
    
    console.log(`📈 Final performance test: ${finalTime}ms`);
    
    console.log('\n✅ Database optimization completed!');
    console.log('💡 Recommendations:');
    console.log('   - Restart your backend server to apply connection optimizations');
    console.log('   - Monitor query performance in production');
    console.log('   - Consider enabling query caching if supported');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    console.error('🔧 Possible solutions:');
    console.error('   - Check database credentials in .env file');
    console.error('   - Verify database server is running');
    console.error('   - Check network connectivity to database');
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run optimization
optimizeDatabase();
