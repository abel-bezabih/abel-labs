#!/usr/bin/env node
/**
 * Stripe Integration Test Script
 * Tests your Stripe configuration and integration
 */

const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '━'.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('━'.repeat(60) + '\n');
}

async function testAPIConnection() {
  logSection('1. Testing API Server Connection');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_URL}/health`);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.get(url, (res) => {
      if (res.statusCode === 200) {
        log('✅ API server is running and accessible', 'green');
        resolve(true);
      } else {
        log(`⚠️  API server responded with status ${res.statusCode}`, 'yellow');
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      log(`❌ Cannot connect to API server at ${API_URL}`, 'red');
      log(`   Error: ${err.message}`, 'red');
      log(`   Make sure your API server is running: yarn dev`, 'yellow');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      log(`❌ Connection timeout to ${API_URL}`, 'red');
      resolve(false);
    });
  });
}

async function testStripeSecretKey() {
  logSection('2. Testing Stripe Secret Key');
  
  // We can't directly test the secret key without making an API call
  // But we can check if the API endpoint exists and responds
  log('ℹ️  Note: Full Stripe key validation requires creating a test payment', 'yellow');
  log('   This will be tested when you create your first payment link\n', 'yellow');
  
  return true;
}

async function testWebhookEndpoint() {
  logSection('3. Testing Webhook Endpoint');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_URL}/payments/webhooks/stripe`);
    const protocol = url.protocol === 'https:' ? https : http;
    
    // Send a test POST request (will fail without signature, but endpoint should exist)
    const postData = JSON.stringify({ type: 'test' });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 400) {
          // 200 = success, 400 = missing signature (expected)
          log('✅ Webhook endpoint is accessible', 'green');
          if (res.statusCode === 400) {
            log('   (400 response is expected without valid signature)', 'yellow');
          }
          resolve(true);
        } else {
          log(`⚠️  Webhook endpoint returned status ${res.statusCode}`, 'yellow');
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      log(`❌ Cannot reach webhook endpoint`, 'red');
      log(`   Error: ${err.message}`, 'red');
      resolve(false);
    });
    
    req.write(postData);
    req.end();
    
    req.setTimeout(5000, () => {
      req.destroy();
      log(`❌ Connection timeout to webhook endpoint`, 'red');
      resolve(false);
    });
  });
}

function testEnvironmentVariables() {
  logSection('4. Checking Environment Variables');
  
  // Note: We can't read .env directly due to permissions
  // But we can provide guidance
  log('📋 Required Environment Variables:', 'blue');
  log('');
  log('   Backend (.env):', 'yellow');
  log('   - STRIPE_SECRET_KEY=sk_test_... or sk_live_...', 'yellow');
  log('   - STRIPE_WEBHOOK_SECRET=whsec_...', 'yellow');
  log('');
  log('   Frontend (.env or .env.local):', 'yellow');
  log('   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...', 'yellow');
  log('');
  log('💡 To verify your keys are loaded:', 'blue');
  log('   1. Check API server logs when it starts', 'yellow');
  log('   2. Look for any Stripe initialization errors', 'yellow');
  log('   3. Try creating a test payment link', 'yellow');
  log('');
  
  return true;
}

function printNextSteps() {
  logSection('Next Steps to Complete Stripe Integration');
  
  log('1. ✅ Verify Environment Variables', 'green');
  log('   Make sure all 3 Stripe keys are in your .env file\n', 'yellow');
  
  log('2. 🔄 Restart Your Servers', 'green');
  log('   Stop and restart: yarn dev\n', 'yellow');
  
  log('3. 🧪 Test Payment Link Creation', 'green');
  log('   Create a test invoice and payment link via API or admin dashboard\n', 'yellow');
  
  log('4. 🔗 Set Up Webhook (if not done)', 'green');
  log('   Local: stripe listen --forward-to localhost:3001/payments/webhooks/stripe', 'yellow');
  log('   Production: Add webhook endpoint in Stripe Dashboard\n', 'yellow');
  
  log('5. 💳 Test with Stripe Test Cards', 'green');
  log('   Success: 4242 4242 4242 4242', 'yellow');
  log('   Decline: 4000 0000 0000 0002\n', 'yellow');
  
  log('6. 📊 Monitor Stripe Dashboard', 'green');
  log('   Check: https://dashboard.stripe.com/test/payments\n', 'yellow');
}

async function runTests() {
  console.clear();
  log('\n🧪 Stripe Integration Test Suite', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = {
    apiConnection: false,
    webhookEndpoint: false,
  };
  
  // Test 1: API Connection
  results.apiConnection = await testAPIConnection();
  
  if (!results.apiConnection) {
    log('\n⚠️  Cannot proceed with other tests - API server is not running', 'yellow');
    log('   Please start your API server: yarn dev\n', 'yellow');
    printNextSteps();
    process.exit(1);
  }
  
  // Test 2: Stripe Secret Key (informational)
  await testStripeSecretKey();
  
  // Test 3: Webhook Endpoint
  results.webhookEndpoint = await testWebhookEndpoint();
  
  // Test 4: Environment Variables (informational)
  testEnvironmentVariables();
  
  // Summary
  logSection('Test Summary');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('✅ All connectivity tests passed!', 'green');
    log('   Your Stripe integration endpoints are accessible\n', 'green');
  } else {
    log('⚠️  Some tests failed', 'yellow');
    log('   Check the errors above and fix any issues\n', 'yellow');
  }
  
  printNextSteps();
  
  // Exit code
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});











