#!/usr/bin/env node
/**
 * Quick Login and Test Payment Script
 * 
 * This script will:
 * 1. Login to get an access token
 * 2. Save the token to localStorage (via instructions)
 * 3. Show you how to test payments
 */

const http = require('http');

const API_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@abellabs.ca';
const ADMIN_PASSWORD = 'admin123'; // Default from seed

console.log('🔐 Login and Payment Test Helper\n');
console.log('='.repeat(60) + '\n');

// Step 1: Login
console.log('Step 1: Logging in...\n');

const loginData = JSON.stringify({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length,
  },
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        const token = response.accessToken;

        console.log('✅ Login successful!\n');
        console.log('📋 Your Access Token:');
        console.log(token);
        console.log('\n' + '='.repeat(60) + '\n');

        console.log('Step 2: Set Token in Browser\n');
        console.log('Open your browser console (F12) and run:');
        console.log('\n');
        console.log(`localStorage.setItem('accessToken', '${token}');`);
        console.log('\n');
        console.log('Or copy this entire line and paste it in the console:\n');
        console.log(`localStorage.setItem('accessToken', '${token}');`);
        console.log('\n' + '='.repeat(60) + '\n');

        console.log('Step 3: Test Payment\n');
        console.log('Now you can:');
        console.log('1. Go to: http://localhost:3000/test-payment');
        console.log('2. Enter an invoice ID');
        console.log('3. Click "Create Payment Checkout"');
        console.log('\n');
        console.log('Or use the API directly:');
        console.log('\n');
        console.log(`curl -X POST http://localhost:3001/payments/checkout \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -H "Authorization: Bearer ${token}" \\`);
        console.log(`  -d '{`);
        console.log(`    "invoiceId": "your_invoice_id_here",`);
        console.log(`    "successUrl": "http://localhost:3000/payment/success",`);
        console.log(`    "cancelUrl": "http://localhost:3000/payment/cancel"`);
        console.log(`  }'`);
        console.log('\n');

      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', data);
      }
    } else {
      console.error('❌ Login failed!');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      console.log('\n');
      console.log('💡 Make sure:');
      console.log('   - API server is running (http://localhost:3001)');
      console.log('   - Database is seeded (run: yarn db:seed)');
      console.log('   - Default credentials: admin@abellabs.ca / admin123');
    }
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('\n');
  console.log('💡 Make sure the API server is running:');
  console.log('   yarn dev');
});

loginReq.write(loginData);
loginReq.end();











