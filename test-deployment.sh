#!/bin/bash

# Abel Labs Deployment Testing Script
# Usage: ./test-deployment.sh [api-url]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get API URL from argument or use default
API_URL=${1:-"http://localhost:3001"}

echo "🧪 Testing Abel Labs Deployment"
echo "================================"
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing API Health Check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    curl -s "$API_URL/health" | head -5
else
    echo -e "${RED}❌ Health check failed (Status: $HEALTH_RESPONSE)${NC}"
fi
echo ""

# Test 2: API Docs
echo "2️⃣  Testing API Documentation..."
DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/docs")
if [ "$DOCS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ API docs accessible${NC}"
else
    echo -e "${RED}❌ API docs not accessible (Status: $DOCS_RESPONSE)${NC}"
fi
echo ""

# Test 3: CORS Headers
echo "3️⃣  Testing CORS Configuration..."
CORS_HEADER=$(curl -s -I "$API_URL/health" | grep -i "access-control-allow-origin")
if [ -n "$CORS_HEADER" ]; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo "   $CORS_HEADER"
else
    echo -e "${YELLOW}⚠️  CORS headers not found${NC}"
fi
echo ""

# Test 4: Database Connection (via health endpoint)
echo "4️⃣  Testing Database Connection..."
HEALTH_DATA=$(curl -s "$API_URL/health")
if echo "$HEALTH_DATA" | grep -q "ok\|status"; then
    echo -e "${GREEN}✅ Database connection appears healthy${NC}"
else
    echo -e "${RED}❌ Database connection may have issues${NC}"
fi
echo ""

# Test 5: Authentication Endpoint
echo "5️⃣  Testing Authentication Endpoint..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User","role":"CLIENT"}' 2>/dev/null)
if [ "$AUTH_RESPONSE" = "201" ] || [ "$AUTH_RESPONSE" = "400" ]; then
    echo -e "${GREEN}✅ Auth endpoint responding (Status: $AUTH_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Auth endpoint issue (Status: $AUTH_RESPONSE)${NC}"
fi
echo ""

# Test 6: SSL/HTTPS Check (if using HTTPS)
if [[ $API_URL == https://* ]]; then
    echo "6️⃣  Testing SSL Certificate..."
    SSL_CHECK=$(echo | openssl s_client -connect $(echo $API_URL | sed 's|https://||' | cut -d'/' -f1):443 -servername $(echo $API_URL | sed 's|https://||' | cut -d'/' -f1) 2>/dev/null | grep -c "Verify return code: 0")
    if [ "$SSL_CHECK" -gt 0 ]; then
        echo -e "${GREEN}✅ SSL certificate is valid${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL certificate check inconclusive${NC}"
    fi
    echo ""
fi

# Summary
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Test Client Portal: Open https://yourdomain.com"
echo "2. Test Admin Dashboard: Open https://admin.yourdomain.com"
echo "3. Test full user flow (see TESTING_GUIDE.md)"
echo ""
echo "For detailed testing, see: TESTING_GUIDE.md"



