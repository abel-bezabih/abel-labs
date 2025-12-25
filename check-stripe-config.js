#!/usr/bin/env node
/**
 * Stripe Configuration Validator
 * Checks if all required Stripe environment variables are set
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

// Required Stripe variables
const requiredVars = {
  'STRIPE_SECRET_KEY': {
    pattern: /^sk_(test|live)_/,
    description: 'Backend secret key (starts with sk_test_ or sk_live_)',
    required: true
  },
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
    pattern: /^pk_(test|live)_/,
    description: 'Frontend publishable key (starts with pk_test_ or pk_live_)',
    required: true
  },
  'STRIPE_WEBHOOK_SECRET': {
    pattern: /^whsec_/,
    description: 'Webhook signing secret (starts with whsec_)',
    required: true
  }
};

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        vars[key] = value;
      }
    }
  });
  
  return vars;
}

function validateStripeConfig() {
  console.log('🔍 Checking Stripe Configuration...\n');
  
  // Read both .env and .env.local (Next.js checks both)
  const envVars = { ...readEnvFile(envPath), ...readEnvFile(envLocalPath) };
  
  let allValid = true;
  const results = [];
  
  for (const [varName, config] of Object.entries(requiredVars)) {
    const value = envVars[varName];
    const exists = value !== undefined && value !== '';
    const isValid = exists && config.pattern.test(value);
    
    results.push({
      name: varName,
      exists,
      isValid,
      value: exists ? (value.substring(0, 20) + '...') : 'NOT SET',
      description: config.description
    });
    
    if (!exists || !isValid) {
      allValid = false;
    }
  }
  
  // Display results
  console.log('📋 Stripe Configuration Status:\n');
  
  results.forEach(({ name, exists, isValid, value, description }) => {
    const status = exists && isValid ? '✅' : '❌';
    const statusText = exists && isValid ? 'VALID' : exists ? 'INVALID FORMAT' : 'MISSING';
    
    console.log(`${status} ${name}`);
    console.log(`   Status: ${statusText}`);
    console.log(`   Description: ${description}`);
    if (exists) {
      console.log(`   Value: ${value}`);
    }
    console.log('');
  });
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allValid) {
    console.log('✅ All Stripe configuration variables are set correctly!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your API server: yarn dev');
    console.log('   2. Test payment link creation');
    console.log('   3. Test webhook endpoint');
  } else {
    console.log('❌ Some Stripe configuration is missing or invalid');
    console.log('\n📝 Required variables:');
    Object.entries(requiredVars).forEach(([name, config]) => {
      console.log(`   - ${name}: ${config.description}`);
    });
    console.log('\n💡 Add these to your .env file in the project root');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return allValid;
}

// Run validation
const isValid = validateStripeConfig();
process.exit(isValid ? 0 : 1);











