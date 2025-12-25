# 📝 How to Create a Test Invoice (Step 1)

There are several ways to create a test invoice. Choose the easiest method for you:

## Method 1: Using the Script (Easiest) ⭐

I've created a simple script for you:

```bash
node create-test-invoice.js <projectId> <amount> <currency>
```

**Example:**
```bash
# Create a $100 CAD invoice
node create-test-invoice.js project_123 100 CAD

# Create a $50 USD invoice
node create-test-invoice.js project_123 50 USD

# Create a 5000 ETB invoice
node create-test-invoice.js project_123 5000 ETB
```

**What you need:**
1. A **Project ID** (from your database or create one first)
2. A **JWT token** (from login - the script will ask for it)

## Method 2: Using cURL (Command Line)

### Step 1: Login to get a token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@abellabs.ca",
    "password": "your_password"
  }'
```

**Copy the `accessToken` from the response.**

### Step 2: Create the invoice

```bash
curl -X POST http://localhost:3001/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "projectId": "your_project_id",
    "amount": 100.00,
    "currency": "CAD",
    "dueDate": "2024-12-31T00:00:00Z",
    "items": [
      {
        "description": "Test Payment",
        "quantity": 1,
        "unitPrice": 100.00,
        "total": 100.00
      }
    ]
  }'
```

**Copy the `id` from the response - that's your invoice ID!**

## Method 3: Using Browser Console

1. **Open your website** and login
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Get your token:**
   ```javascript
   localStorage.getItem('accessToken')
   ```
4. **Create invoice:**
   ```javascript
   const token = localStorage.getItem('accessToken');
   const response = await fetch('http://localhost:3001/invoices', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       projectId: 'your_project_id',
       amount: 100.00,
       currency: 'CAD',
       dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
       items: [{
         description: 'Test Payment',
         quantity: 1,
         unitPrice: 100.00,
         total: 100.00
       }]
     })
   });
   const invoice = await response.json();
   console.log('Invoice ID:', invoice.id);
   ```

## Method 4: Using Admin Dashboard

If you have an admin dashboard:
1. Go to Projects
2. Select a project
3. Create invoice for that project
4. Copy the invoice ID

## Getting a Project ID

If you don't have a project ID, you can:

### Option A: Check Existing Projects

```bash
# List all projects (requires auth)
curl -X GET http://localhost:3001/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option B: Create a Test Project First

```bash
curl -X POST http://localhost:3001/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Project",
    "description": "Test project for payment testing",
    "type": "WEBSITE",
    "budget": 1000.00,
    "currency": "CAD"
  }'
```

**Copy the `id` from response - that's your project ID!**

## Quick Test (No Project Needed)

If you just want to test quickly and have access to your database, you can:

1. **Find any existing project** in your database
2. **Use that project ID** to create an invoice
3. **Or create a minimal project** via API first

## What You'll Get

After creating an invoice, you'll get a response like:

```json
{
  "id": "invoice_abc123",
  "invoiceNumber": "INV-2024-001",
  "amount": 100.00,
  "currency": "CAD",
  "status": "DRAFT",
  "projectId": "project_123",
  ...
}
```

**Copy the `id` field** - that's what you'll use in the test payment page!

## Next Steps

Once you have the invoice ID:

1. ✅ Go to: `http://localhost:3000/test-payment`
2. ✅ Enter the invoice ID
3. ✅ Click "Create Payment Checkout"
4. ✅ Test payment!

---

**Need help?** Check the API docs at `http://localhost:3001/api/docs` (Swagger UI)











