#!/usr/bin/env node
/**
 * API Server Diagnostic Tool
 * Checks what might be preventing the server from starting
 */

const http = require('http');
const { execSync } = require('child_process');

const API_URL = 'http://localhost:3001';

console.log('🔍 API Server Diagnostic Tool\n');
console.log('='.repeat(60) + '\n');

// Check 1: Is server running?
console.log('1️⃣  Checking if server is running...');
try {
  const response = http.get(API_URL, (res) => {
    console.log('   ✅ Server is running!');
    console.log(`   Status: ${res.statusCode}`);
    process.exit(0);
  });
  
  response.on('error', () => {
    console.log('   ❌ Server is NOT running\n');
    runDiagnostics();
  });
  
  response.setTimeout(2000, () => {
    console.log('   ❌ Server is NOT running (timeout)\n');
    response.destroy();
    runDiagnostics();
  });
} catch (error) {
  console.log('   ❌ Server is NOT running\n');
  runDiagnostics();
}

function runDiagnostics() {
  console.log('2️⃣  Checking port 3001...');
  try {
    const result = execSync('lsof -ti:3001 2>/dev/null || echo "free"', { encoding: 'utf8' }).trim();
    if (result === 'free') {
      console.log('   ✅ Port 3001 is free\n');
    } else {
      console.log(`   ⚠️  Port 3001 is in use by process: ${result}`);
      console.log('   💡 Kill it with: kill -9 ' + result + '\n');
    }
  } catch (error) {
    console.log('   ⚠️  Could not check port\n');
  }

  console.log('3️⃣  Checking Docker services...');
  try {
    const dockerPs = execSync('docker ps --format "{{.Names}}" 2>/dev/null || echo ""', { encoding: 'utf8' });
    if (dockerPs.includes('postgres') || dockerPs.includes('redis')) {
      console.log('   ✅ Docker services are running');
      console.log('   Services:', dockerPs.trim().split('\n').filter(Boolean).join(', '));
    } else {
      console.log('   ⚠️  Docker services might not be running');
      console.log('   💡 Start with: docker-compose up -d\n');
    }
  } catch (error) {
    console.log('   ⚠️  Could not check Docker (might not be installed)\n');
  }

  console.log('4️⃣  Checking environment variables...');
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];
  
  const optionalVars = [
    'STRIPE_SECRET_KEY',
    'GROQ_API_KEY',
    'REDIS_HOST',
    'REDIS_PORT',
  ];

  console.log('   Required variables:');
  requiredVars.forEach(varName => {
    // Can't read .env directly, but we can check if it's mentioned
    console.log(`   - ${varName}: ${process.env[varName] ? '✅ Set' : '❌ Not set (check .env file)'}`);
  });

  console.log('\n   Optional variables:');
  optionalVars.forEach(varName => {
    console.log(`   - ${varName}: ${process.env[varName] ? '✅ Set' : '⚠️  Not set (may cause issues)'}`);
  });

  console.log('\n5️⃣  Next Steps:');
  console.log('   📝 To start the server:');
  console.log('      cd "/Users/user/Desktop/Abel Labs"');
  console.log('      yarn dev');
  console.log('\n   📝 If server fails to start, check:');
  console.log('      - Error messages in terminal');
  console.log('      - Database connection (Docker running?)');
  console.log('      - Redis connection (Docker running?)');
  console.log('      - Environment variables in .env file');
  console.log('      - TypeScript compilation errors');
  console.log('\n   📝 Common fixes:');
  console.log('      - Start Docker: docker-compose up -d');
  console.log('      - Install dependencies: yarn install');
  console.log('      - Check .env file exists and has required variables');
  console.log('\n');
}











