#!/bin/bash
# Quick test script to check if API server is responding

echo "🔍 Testing API Server..."
echo ""

# Test health endpoint
echo "1. Testing /health endpoint..."
HEALTH=$(curl -s http://localhost:3001/health 2>&1)
if [[ $HEALTH == *"ok"* ]] || [[ $HEALTH == *"status"* ]]; then
  echo "   ✅ API server is responding!"
  echo "   Response: $HEALTH"
else
  echo "   ❌ API server is NOT responding"
  echo "   Error: $HEALTH"
fi

echo ""
echo "2. Checking if port 3001 is listening..."
if lsof -i :3001 > /dev/null 2>&1; then
  echo "   ✅ Port 3001 is in use"
  lsof -i :3001
else
  echo "   ❌ Port 3001 is NOT in use"
fi

echo ""
echo "3. Checking Docker services..."
if docker ps | grep -q postgres; then
  echo "   ✅ PostgreSQL is running"
else
  echo "   ❌ PostgreSQL is NOT running"
  echo "   💡 Start with: docker-compose up -d"
fi

if docker ps | grep -q redis; then
  echo "   ✅ Redis is running"
else
  echo "   ❌ Redis is NOT running"
  echo "   💡 Start with: docker-compose up -d"
fi











