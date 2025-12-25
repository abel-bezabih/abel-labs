#!/usr/bin/env node

/**
 * Verify Stripe API Key
 * 
 * This script checks if your STRIPE_SECRET_KEY is correctly configured
 * and can connect to Stripe's API.
 */

require('dotenv').config();
const Stripe = require('stripe');

console.log('\n🔍 Verifying Stripe API Key Configuration\n');
console.log('='.repeat(60));

const secretKey = process.env.STRIPE_SECRET_KEY;

// Check if key exists
if (!secretKey) {
  console.error('\n❌ STRIPE_SECRET_KEY is not set in your .env file');
  console.error('\n💡 Add this to your .env file:');
  console.error('   STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

console.log(`\n✅ STRIPE_SECRET_KEY is set`);
console.log(`   Key preview: ${secretKey.substring(0, 10)}...${secretKey.substring(secretKey.length - 4)}`);

// Check key format
if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
  console.error('\n❌ Invalid key format!');
  console.error(`   Key must start with 'sk_test_' or 'sk_live_'`);
  console.error(`   Your key starts with: ${secretKey.substring(0, 10)}...`);
  console.error('\n💡 Get your key from: https://dashboard.stripe.com/apikeys');
  process.exit(1);
}

console.log(`\n✅ Key format is valid (${secretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE'} mode)`);

// Test the key by making a simple API call
console.log('\n🧪 Testing API connection...');

try {
  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });

  // Try to retrieve account info (lightweight API call)
  stripe.accounts.retrieve()
    .then((account) => {
      console.log('\n✅ Stripe API connection successful!');
      console.log(`   Account ID: ${account.id}`);
      console.log(`   Account type: ${account.type || 'standard'}`);
      console.log(`   Country: ${account.country || 'N/A'}`);
      console.log('\n🎉 Your Stripe key is working correctly!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Stripe API connection failed!');
      console.error(`   Error: ${error.message}`);
      
      if (error.message.includes('Invalid API Key')) {
        console.error('\n💡 Your key appears to be invalid.');
        console.error('   Get a new key from: https://dashboard.stripe.com/apikeys');
        console.error('   Make sure you copy the SECRET key (starts with sk_test_ or sk_live_)');
      } else if (error.message.includes('No such account')) {
        console.error('\n⚠️  Key format is correct but account not found.');
        console.error('   This might be a test key issue. Try getting a fresh key.');
      } else {
        console.error('\n💡 Check your internet connection and try again.');
      }
      
      process.exit(1);
    });
} catch (error) {
  console.error('\n❌ Failed to initialize Stripe SDK');
  console.error(`   Error: ${error.message}`);
  process.exit(1);
}









