#!/usr/bin/env node

/**
 * 🚀 DEPLOYMENT-SAFE SERVER STARTER
 * Tries perfect server first, falls back to standard server if needed
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Starting Gandhi Bai CRM Server...');

// Check which server files exist
const perfectServerExists = existsSync('./server/perfect-server.js');
const standardServerExists = existsSync('./server/index.js');

console.log('📋 Server availability:');
console.log(`   Perfect Server: ${perfectServerExists ? '✅' : '❌'}`);
console.log(`   Standard Server: ${standardServerExists ? '✅' : '❌'}`);

async function startServer() {
  // Try perfect server first
  if (perfectServerExists) {
    console.log('\n🎯 Attempting to start Perfect Server...');
    
    const perfectServer = spawn('node', ['server/perfect-server.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Give it a few seconds to start
    const startTimeout = setTimeout(() => {
      console.log('⚠️ Perfect server taking too long, trying standard server...');
      perfectServer.kill();
      startStandardServer();
    }, 10000);
    
    perfectServer.on('error', (error) => {
      clearTimeout(startTimeout);
      console.log('❌ Perfect server failed:', error.message);
      console.log('🔄 Falling back to standard server...');
      startStandardServer();
    });
    
    perfectServer.on('exit', (code) => {
      clearTimeout(startTimeout);
      if (code !== 0) {
        console.log('❌ Perfect server exited with code:', code);
        console.log('🔄 Falling back to standard server...');
        startStandardServer();
      }
    });
    
    // If we get here, perfect server is running
    process.on('SIGTERM', () => perfectServer.kill());
    process.on('SIGINT', () => perfectServer.kill());
    
  } else {
    console.log('⚠️ Perfect server not found, starting standard server...');
    startStandardServer();
  }
}

function startStandardServer() {
  if (!standardServerExists) {
    console.error('❌ No server files found! Cannot start application.');
    process.exit(1);
  }
  
  console.log('\n🏥 Starting Standard CRM Server...');
  
  const standardServer = spawn('node', ['server/index.js'], {
    stdio: 'inherit',
    env: process.env
  });
  
  standardServer.on('error', (error) => {
    console.error('❌ Standard server failed:', error.message);
    process.exit(1);
  });
  
  standardServer.on('exit', (code) => {
    console.log(`📊 Server exited with code: ${code}`);
    process.exit(code);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => standardServer.kill());
  process.on('SIGINT', () => standardServer.kill());
}

// Start the server
startServer();
