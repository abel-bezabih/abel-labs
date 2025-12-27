#!/usr/bin/env node
/**
 * Get Invoices Script
 * 
 * Lists all invoices so you can find the correct ID or invoice number
 */

const http = require('http');

const API_URL = 'http://localhost:3001';

// You need to login first and get a token
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('❌ Please provide your access token');
  console.log('\nUsage:');
  console.log('  node get-invoices.js YOUR_TOKEN');
  console.log('\nTo get a token, login first:');
  console.log('  curl -X POST http://localhost:3001/auth/login \\');
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"email":"admin@abellabs.ca","password":"admin123"}\'');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/invoices',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
};

console.log('📋 Fetching invoices...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const invoices = JSON.parse(data);
        
        if (invoices.length === 0) {
          console.log('⚠️  No invoices found.');
          console.log('\n💡 Create an invoice first via admin dashboard or API.');
        } else {
          console.log(`✅ Found ${invoices.length} invoice(s):\n`);
          invoices.forEach((invoice, index) => {
            console.log(`${index + 1}. Invoice Number: ${invoice.invoiceNumber}`);
            console.log(`   ID: ${invoice.id}`);
            console.log(`   Amount: ${invoice.amount} ${invoice.currency}`);
            console.log(`   Status: ${invoice.status}`);
            console.log(`   Project ID: ${invoice.projectId}`);
            console.log('');
          });
          
          console.log('💡 You can use either:');
          console.log('   - Invoice ID (e.g., ' + invoices[0].id + ')');
          console.log('   - Invoice Number (e.g., ' + invoices[0].invoiceNumber + ')');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', data);
      }
    } else {
      console.error('❌ Failed to fetch invoices');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('\n💡 Make sure the API server is running:');
  console.log('   yarn dev');
});

req.end();











