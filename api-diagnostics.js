// API Diagnostic Test Script
console.log('🔍 Testing Gandhi Bai CRM API Endpoints...');

const API_BASE = 'https://gandhi-bai.onrender.com/api';

const endpoints = [
    '/health',
    '/settings',
    '/management-users',
    '/login'
];

async function testEndpoint(endpoint, method = 'GET', body = null) {
    try {
        console.log(`\n📡 Testing ${method} ${endpoint}...`);
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://crm.gandhibaideaddictioncenter.com'
            }
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(API_BASE + endpoint, options);
        
        console.log(`✅ Status: ${response.status} ${response.statusText}`);
        console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log(`📄 Response:`, data);
            } catch (e) {
                console.log(`📄 Response: (Non-JSON content)`);
            }
        } else {
            console.log(`❌ Error response: ${response.status}`);
            try {
                const errorText = await response.text();
                console.log(`📄 Error details:`, errorText);
            } catch (e) {
                console.log(`❌ Could not read error details`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Network Error for ${endpoint}:`, error.message);
    }
}

async function runDiagnostics() {
    console.log(`🚀 Starting API diagnostics at ${new Date().toISOString()}`);
    
    // Test basic endpoints
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
    }
    
    // Test login with credentials
    console.log(`\n🔐 Testing login with admin credentials...`);
    await testEndpoint('/login', 'POST', {
        email: 'admin@aedentek.com',
        password: 'admin123'
    });
    
    console.log(`\n✅ Diagnostics complete!`);
}

runDiagnostics().catch(console.error);
