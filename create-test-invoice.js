#!/usr/bin/env node
/**
 * Quick Script to Create a Test Invoice
 * 
 * Usage:
 *   node create-test-invoice.js [projectId] [amount] [currency]
 * 
 * Example:
 *   node create-test-invoice.js project_123 100 CAD
 */

const http = require('http');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Get command line arguments
const projectId = process.argv[2];
const amount = parseFloat(process.argv[3]) || 100.00;
const currency = (process.argv[4] || 'CAD').toUpperCase();

if (!projectId) {
  console.log('❌ Error: Project ID is required');
  console.log('\nUsage:');
  console.log('  node create-test-invoice.js <projectId> [amount] [currency]');
  console.log('\nExample:');
  console.log('  node create-test-invoice.js project_123 100 CAD');
  console.log('  node create-test-invoice.js project_123 50 USD');
  console.log('  node create-test-invoice.js project_123 5000 ETB');
  console.log('\n💡 To get a project ID:');
  console.log('  1. Check your database');
  console.log('  2. Or create a project first via API');
  console.log('  3. Or use the admin dashboard');
  process.exit(1);
}

// Get auth token from user
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createInvoice() {
  try {
    console.log('\n🔐 Authentication Required');
    console.log('You need a JWT token to create an invoice.');
    console.log('Get it from: localStorage.getItem("accessToken") in browser, or login via API\n');
    
    const token = await askQuestion('Enter your JWT token (or press Enter to skip): ');
    
    if (!token || token.trim() === '') {
      console.log('\n⚠️  No token provided. Creating invoice without auth (will fail if auth is required).');
      console.log('💡 Tip: Login via API first to get a token:\n');
      console.log('   curl -X POST http://localhost:3001/auth/login \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"email":"admin@abellabs.ca","password":"your_password"}\'\n');
    }

    const invoiceData = {
      projectId: projectId,
      amount: amount,
      currency: currency,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      items: [
        {
          description: `Test Invoice - ${currency} ${amount}`,
          quantity: 1,
          unitPrice: amount,
          total: amount,
        },
      ],
    };

    console.log('\n📝 Creating invoice...');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Amount: ${currency} ${amount}`);
    console.log(`   Currency: ${currency}`);

    const url = new URL(`${API_URL}/invoices`);
    const protocol = url.protocol === 'https:' ? https : http;

    const postData = JSON.stringify(invoiceData);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token && token.trim() ? { 'Authorization': `Bearer ${token.trim()}` } : {}),
      },
    };

    const req = protocol.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          const invoice = JSON.parse(data);
          console.log('\n✅ Invoice created successfully!');
          console.log('\n📋 Invoice Details:');
          console.log(`   ID: ${invoice.id}`);
          console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
          console.log(`   Amount: ${invoice.currency} ${invoice.amount}`);
          console.log(`   Status: ${invoice.status}`);
          console.log(`   Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
          console.log('\n🎯 Next Steps:');
          console.log(`   1. Go to: http://localhost:3000/test-payment`);
          console.log(`   2. Enter Invoice ID: ${invoice.id}`);
          console.log(`   3. Click "Create Payment Checkout"`);
          console.log(`   4. Test payment with card: 4242 4242 4242 4242\n`);
        } else if (res.statusCode === 401) {
          console.log('\n❌ Authentication failed');
          console.log('   Please login first to get a valid token.');
          console.log('\n   Try:');
          console.log('   curl -X POST http://localhost:3001/auth/login \\');
          console.log('     -H "Content-Type: application/json" \\');
          console.log('     -d \'{"email":"admin@abellabs.ca","password":"your_password"}\'\n');
        } else if (res.statusCode === 404) {
          console.log('\n❌ Project not found');
          console.log(`   Project ID "${projectId}" does not exist.`);
          console.log('   Please check your project ID or create a project first.\n');
        } else {
          console.log(`\n❌ Error: ${res.statusCode}`);
          console.log('Response:', data);
        }
        rl.close();
      });
    });

    req.on('error', (error) => {
      console.log(`\n❌ Connection error: ${error.message}`);
      console.log(`   Make sure your API server is running at ${API_URL}\n`);
      rl.close();
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
  }
}

createInvoice();












