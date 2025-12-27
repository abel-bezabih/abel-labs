# 🔧 Fix CAD Invoice Creation Error

## The Problem

You're getting a 500 error because the database `Currency` enum doesn't have `CAD` yet.

## Solution: Run Migration

### Step 1: Run the Migration

```bash
cd packages/database
yarn db:migrate
```

This will:
- Add `CAD` to the Currency enum in your database
- Update the Prisma client

### Step 2: Regenerate Prisma Client

```bash
yarn db:generate
```

### Step 3: Restart API Server

Stop and restart your API server:
```bash
# Stop server (Ctrl+C)
# Then restart:
yarn dev
```

### Step 4: Try Creating Invoice Again

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abellabs.ca","password":"admin123"}' | jq -r '.accessToken')

# Create CAD invoice
node create-cad-invoice.js $TOKEN
```

## Alternative: Use USD Instead

If you want to test quickly without running migration, use USD:

```bash
# Create USD invoice instead
curl -X POST http://localhost:3001/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "amount": 100.00,
    "currency": "USD",
    "dueDate": "2024-12-31",
    "items": [{
      "description": "Test Payment",
      "quantity": 1,
      "unitPrice": 100.00,
      "total": 100.00
    }]
  }'
```

USD will also route to Stripe!

## Check API Logs

If migration doesn't fix it, check your API server terminal for the actual error message. It will tell you exactly what's wrong.











