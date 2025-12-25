#!/bin/bash
# Quick script to create a test invoice

echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abellabs.ca","password":"admin123"}' | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Logged in!"
echo ""

echo "📋 Getting projects..."
PROJECT_ID=$(curl -s -X GET http://localhost:3001/projects \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
  echo "❌ No projects found!"
  exit 1
fi

echo "✅ Found project: $PROJECT_ID"
echo ""

echo "💰 Creating CAD invoice..."
INVOICE=$(curl -s -X POST http://localhost:3001/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"amount\": 100.00,
    \"currency\": \"CAD\",
    \"dueDate\": \"2024-12-31\",
    \"items\": [{
      \"description\": \"Test Payment - Stripe Integration\",
      \"quantity\": 1,
      \"unitPrice\": 100.00,
      \"total\": 100.00
    }]
  }")

INVOICE_NUMBER=$(echo $INVOICE | jq -r '.invoiceNumber')
INVOICE_ID=$(echo $INVOICE | jq -r '.id')

if [ "$INVOICE_NUMBER" == "null" ] || [ -z "$INVOICE_NUMBER" ]; then
  echo "❌ Failed to create invoice!"
  echo "Response: $INVOICE"
  exit 1
fi

echo "✅ Invoice created successfully!"
echo ""
echo "📄 Invoice Details:"
echo "   Invoice Number: $INVOICE_NUMBER"
echo "   Invoice ID: $INVOICE_ID"
echo "   Amount: 100.00 CAD"
echo ""
echo "💡 Use this to test payment:"
echo "   Invoice Number: $INVOICE_NUMBER"
echo "   Or Invoice ID: $INVOICE_ID"










