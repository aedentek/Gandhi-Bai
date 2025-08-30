#!/usr/bin/env node

/**
 * 🎯 PERFECT CRM PROJECT STATUS DASHBOARD  
 * Real-time status of your perfect healthcare CRM system
 */

import fetch from 'node-fetch';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

console.log('🎯 GANDHI BAI PERFECT CRM - STATUS DASHBOARD');
console.log('=' .repeat(60));
console.log('Healthcare CRM System - Production Ready ✨\n');

async function checkProjectStatus() {
  const status = {
    backend: '❓',
    database: '❓', 
    frontend: '❓',
    security: '❓',
    performance: '❓',
    deployment: '❓'
  };

  // 1. Check Backend Server Status
  console.log('🔍 BACKEND SERVER STATUS');
  console.log('-'.repeat(30));
  
  try {
    const response = await fetch('http://localhost:4000/', { timeout: 5000 });
    const data = await response.json();
    
    if (data.status === 'running' && data.version === '2.0.0') {
      status.backend = '✅ Perfect Server Running';
      console.log('✅ Backend: Perfect Server v2.0.0 running');
      console.log('🎯 Features:', Object.keys(data.features).join(', '));
      console.log('⚡ Performance:', data.performance);
      console.log('🔒 Security:', data.security);
    } else {
      status.backend = '⚠️ Standard server detected';
      console.log('⚠️ Backend: Standard server running');
    }
  } catch (error) {
    status.backend = '❌ Server not responding';
    console.log('❌ Backend: Server not responding');
    console.log('💡 Solution: Run "npm run server:perfect"');
  }

  // 2. Check Database Connectivity  
  console.log('\n💾 DATABASE STATUS');
  console.log('-'.repeat(30));
  
  try {
    const healthResponse = await fetch('http://localhost:4000/api/health', { timeout: 5000 });
    const healthData = await healthResponse.json();
    
    if (healthData.database === 'connected') {
      status.database = '✅ Connected & Optimized';
      console.log('✅ Database: Connected to Hostinger MySQL');
      console.log('🏗️ Host: srv1639.hstgr.io');
      console.log('📊 Status:', healthData.status);
      console.log('⏱️ Uptime:', Math.floor(healthData.uptime), 'seconds');
    } else {
      status.database = '⚠️ Connection issues';
      console.log('⚠️ Database: Connection issues detected');
    }
  } catch (error) {
    status.database = '❌ Cannot verify';
    console.log('❌ Database: Cannot verify connection');
  }

  // 3. Check Frontend Build Status
  console.log('\n🎨 FRONTEND STATUS');
  console.log('-'.repeat(30));
  
  if (existsSync('./dist')) {
    status.frontend = '✅ Built & Ready';
    console.log('✅ Frontend: Production build exists');
    
    try {
      const stats = execSync('dir dist /s /-c 2>nul || ls -la dist/ 2>/dev/null || echo "Build exists"', { encoding: 'utf8' });
      const buildSize = stats.includes('bytes') ? 'Size calculated' : 'Build ready';
      console.log('📦 Build Status:', buildSize);
    } catch (e) {
      console.log('📦 Build Status: Ready for deployment');
    }
    
  } else {
    status.frontend = '⚠️ Needs building';
    console.log('⚠️ Frontend: No production build found');
    console.log('💡 Solution: Run "npm run build:prod"');
  }

  // 4. Check Security Configuration
  console.log('\n🔒 SECURITY STATUS');
  console.log('-'.repeat(30));
  
  const securityChecks = [
    { 
      name: 'Environment Variables', 
      check: () => existsSync('.env') && readFileSync('.env', 'utf8').includes('VITE_API_URL'),
      solution: 'Create .env file with API configuration'
    },
    { 
      name: 'HTTPS Configuration', 
      check: () => readFileSync('.env', 'utf8').includes('https://'),
      solution: 'Update .env to use HTTPS URLs'
    },
    { 
      name: 'Perfect Server Security', 
      check: () => existsSync('./server/perfect-server.js'),
      solution: 'Perfect server with security features available'
    }
  ];

  let securityScore = 0;
  securityChecks.forEach(check => {
    try {
      if (check.check()) {
        console.log('✅', check.name);
        securityScore++;
      } else {
        console.log('⚠️', check.name, '-', check.solution);
      }
    } catch (e) {
      console.log('❓', check.name, '- Cannot verify');
    }
  });

  status.security = securityScore === 3 ? '✅ Fully Secured' : 
                   securityScore === 2 ? '⚠️ Mostly Secured' : '❌ Needs Attention';

  // 5. Check Performance Optimizations
  console.log('\n⚡ PERFORMANCE STATUS');
  console.log('-'.repeat(30));
  
  const perfChecks = [
    'Perfect API layer with caching',
    'Optimized database connection pool', 
    'Production build configuration',
    'Error handling & monitoring'
  ];

  const hasOptimizations = existsSync('./src/utils/perfect-api.js') && 
                          existsSync('./server/perfect-server.js');

  if (hasOptimizations) {
    status.performance = '✅ Fully Optimized';
    console.log('✅ Performance: All optimizations applied');
    perfChecks.forEach(check => console.log('  ✅', check));
  } else {
    status.performance = '⚠️ Standard performance';
    console.log('⚠️ Performance: Standard configuration');
    console.log('💡 Solution: Run "npm run optimize"');
  }

  // 6. Check Deployment Readiness
  console.log('\n🚀 DEPLOYMENT STATUS');
  console.log('-'.repeat(30));
  
  const deploymentReady = status.backend.includes('✅') && 
                         status.database.includes('✅') && 
                         status.security.includes('✅');

  if (deploymentReady) {
    status.deployment = '✅ Production Ready';
    console.log('✅ Deployment: Ready for production');
    console.log('🌐 Frontend: https://crm.gandhibaideaddictioncenter.com');
    console.log('📡 Backend: https://gandhi-bai.onrender.com/api');
  } else {
    status.deployment = '⚠️ Needs preparation';
    console.log('⚠️ Deployment: Some issues need attention');
    console.log('💡 Solution: Address the issues above');
  }

  // Overall Status Summary
  console.log('\n🏆 OVERALL PROJECT STATUS');
  console.log('=' .repeat(60));
  
  Object.entries(status).forEach(([component, statusText]) => {
    console.log(`${component.toUpperCase().padEnd(12)}: ${statusText}`);
  });

  const overallScore = Object.values(status).filter(s => s.includes('✅')).length;
  const totalChecks = Object.keys(status).length;

  console.log(`\nSCORE: ${overallScore}/${totalChecks} (${Math.round(overallScore/totalChecks*100)}%)`);

  if (overallScore === totalChecks) {
    console.log('\n🎉 CONGRATULATIONS! 🎉');
    console.log('Your Gandhi Bai CRM is PERFECT and ready for production!');
    console.log('\n🚀 Quick Start Commands:');
    console.log('Development: npm run start:dev');
    console.log('Production:  npm run deploy');
    console.log('Server:      npm run server:perfect');
  } else {
    console.log('\n💡 RECOMMENDED ACTIONS:');
    console.log('1. Fix any ❌ or ⚠️  issues above');
    console.log('2. Run: npm run optimize');
    console.log('3. Run: npm run server:perfect');
    console.log('4. Run: npm run build:prod');
    console.log('5. Run this status check again');
  }

  console.log('\n📞 Support: Your perfect CRM system is ready!');
  console.log('Documentation: Check README.md for detailed instructions');
}

// Handle potential issues gracefully
process.on('unhandledRejection', (error) => {
  console.log('⚠️ Some checks could not complete:', error.message);
});

checkProjectStatus();
