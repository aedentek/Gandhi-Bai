#!/usr/bin/env node

/**
 * 🔧 CRM API Connection & Performance Tester
 * This script diagnoses and fixes common API and CORS issues
 */

import fetch from 'node-fetch';

console.log('🔧 CRM API Connection Tester');
console.log('=' .repeat(50));

async function testAPIConnections() {
  const tests = [
    {
      name: 'Local Backend Health',
      url: 'http://localhost:4000/api/health',
      description: 'Testing local backend server'
    },
    {
      name: 'Local Backend Root',
      url: 'http://localhost:4000/',
      description: 'Testing local backend root endpoint'
    },
    {
      name: 'Production API Health (if accessible)',
      url: 'https://gandhi-bai.onrender.com/api/health',
      description: 'Testing production API server'
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 ${test.name}`);
    console.log(`📡 URL: ${test.url}`);
    
    try {
      const start = Date.now();
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CRM-API-Tester/1.0'
        },
        timeout: 10000
      });
      
      const responseTime = Date.now() - start;
      const data = await response.json();
      
      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      console.log(`⏱️ Response Time: ${responseTime}ms`);
      console.log(`📊 Response:`, JSON.stringify(data, null, 2));
      
      if (responseTime > 5000) {
        console.log(`⚠️ Slow response detected: ${responseTime}ms`);
      }
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Solution: Make sure the server is running on the specified port');
      } else if (error.code === 'ENOTFOUND') {
        console.log('💡 Solution: Check the hostname/URL spelling');
      } else if (error.message.includes('timeout')) {
        console.log('💡 Solution: Server may be slow or overloaded');
      }
    }
  }
  
  console.log('\n🔍 Environment Configuration:');
  console.log('VITE_API_URL should point to: https://gandhi-bai.onrender.com/api');
  console.log('VITE_BASE_URL should point to: https://crm.gandhibaideaddictioncenter.com');
  console.log('\n💡 Common Issues & Solutions:');
  console.log('1. CORS Error: Update server CORS configuration');
  console.log('2. 404 Error: Check API endpoint URLs');
  console.log('3. Timeout: Optimize database queries');
  console.log('4. 500 Error: Check server logs for database errors');
}

testAPIConnections();
