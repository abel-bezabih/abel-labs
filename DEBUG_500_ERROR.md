# 🔍 Debugging "Internal Server Error" (500)

## Quick Checks

### 1. Check API Server Logs

**Look at your terminal where the API is running.** You should see detailed error messages now with the new exception filter.

### 2. Check Database Connection

```bash
# Test database connection
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

**If database is disconnected:**
- Check if PostgreSQL is running: `docker ps`
- Check `DATABASE_URL` in your `.env` file
- Start database: `docker-compose up -d postgres`

### 3. Check Environment Variables

Make sure these are set in your `.env` file:

```bash
# Required
DATABASE_URL="postgresql://abellabs:abellabs123@localhost:5433/abellabs?schema=public"
JWT_SECRET="your-secret-key"
GROQ_API_KEY="your-groq-key"

# Optional but recommended
REDIS_HOST="localhost"
REDIS_PORT="6380"
NODE_ENV="development"
```

### 4. Check Which Endpoint is Failing

**Open browser console (F12) and check:**
- Which API endpoint is returning 500
- What the error message says (should be more detailed now)
- Check the Network tab for the failed request

### 5. Common Causes

#### Database Not Running
```bash
# Start database
docker-compose up -d postgres

# Check if it's running
docker ps | grep postgres
```

#### Missing Environment Variables
- Check `.env` file exists in `apps/api/` or root directory
- Verify all required variables are set

#### Redis Connection Issues
- Redis errors won't crash the server, but check logs
- Start Redis: `docker-compose up -d redis`

#### Prisma Client Not Generated
```bash
# Generate Prisma client
yarn db:generate
```

#### Database Migrations Not Run
```bash
# Run migrations
yarn db:migrate
```

### 6. Test Specific Endpoints

**Health Check:**
```bash
curl http://localhost:3001/health
```

**API Docs:**
```bash
# Open in browser
http://localhost:3001/api/docs
```

**Test Authentication:**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

### 7. Check Browser Console

**In your browser (F12 → Console):**
- Look for red error messages
- Check Network tab for failed requests
- Look at the response body for detailed error messages

### 8. Enable Detailed Logging

The new exception filter will now show:
- Full error messages
- Stack traces (in development)
- Request path and method
- Timestamp

**Check your API server terminal for these logs.**

## Still Getting 500 Error?

**Please provide:**
1. Which page/action triggers the error?
2. What does the browser console show?
3. What do the API server logs show?
4. What endpoint is failing? (check Network tab)

## Quick Fix Commands

```bash
# Restart everything
docker-compose down
docker-compose up -d
yarn db:generate
yarn db:migrate

# Restart API
cd apps/api && yarn dev
```
