#!/usr/bin/env node
/**
 * Create CAD Invoice for Stripe Testing
 * 
 * Creates a test invoice with CAD currency so you can test Stripe payments
 */

const http = require('http');

const API_URL = 'http://localhost:3001';
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('❌ Please provide your access token');
  console.log('\nUsage:');
  console.log('  node create-cad-invoice.js YOUR_TOKEN');
  process.exit(1);
}

// First, get a project ID (we'll use the first project)
console.log('📋 Getting projects...\n');

const getProjectsOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/projects',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
};

const getProjectsReq = http.request(getProjectsOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const projects = JSON.parse(data);
        
        if (projects.length === 0) {
          console.log('⚠️  No projects found. Creating a test project first...');
          // We'll need to create a project, but for now, let's just create invoice with a placeholder
          createInvoice('test-project-id', TOKEN);
        } else {
          const project = projects[0];
          console.log(`✅ Found project: ${project.title} (ID: ${project.id})\n`);
          createInvoice(project.id, TOKEN);
        }
      } catch (error) {
        console.error('❌ Error parsing projects:', error);
        console.log('Raw response:', data);
      }
    } else {
      console.error('❌ Failed to get projects');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

getProjectsReq.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
});

getProjectsReq.end();

function createInvoice(projectId, token) {
  console.log('💰 Creating CAD invoice...\n');

  const invoiceData = JSON.stringify({
    projectId: projectId,
    amount: 100.00,
    currency: 'CAD',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    items: [
      {
        description: 'Test Payment - Stripe Integration',
        quantity: 1,
        unitPrice: 100.00,
        total: 100.00,
      },
    ],
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/invoices',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': invoiceData.length,
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 201 || res.statusCode === 200) {
        try {
          const invoice = JSON.parse(data);
          console.log('✅ Invoice created successfully!\n');
          console.log('📄 Invoice Details:');
          console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
          console.log(`   Invoice ID: ${invoice.id}`);
          console.log(`   Amount: ${invoice.amount} ${invoice.currency}`);
          console.log(`   Status: ${invoice.status}`);
          console.log('\n💡 Use this invoice number to test payments:');
          console.log(`   ${invoice.invoiceNumber}`);
          console.log('\n   Or use the invoice ID:');
          console.log(`   ${invoice.id}`);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
        }
      } else {
        console.error('❌ Failed to create invoice');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  req.write(invoiceData);
  req.end();
}











