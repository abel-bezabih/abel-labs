# 🔧 Debug API Server Issues

## Common Issues & Solutions

### Issue 1: Server Won't Start

**Check if server is already running:**
```bash
lsof -i :3001
```

**Kill existing process:**
```bash
kill -9 $(lsof -ti:3001)
```

### Issue 2: TypeScript Compilation Errors

**Check for errors:**
```bash
cd apps/api
yarn type-check
```

**Common fixes:**
- Missing imports
- Type mismatches
- Module dependency issues

### Issue 3: Missing Dependencies

**Install dependencies:**
```bash
cd "/Users/user/Desktop/Abel Labs"
yarn install
```

### Issue 4: Database Connection

**Check if PostgreSQL is running:**
```bash
# Check Docker
docker ps

# Start Docker services
docker-compose up -d
```

### Issue 5: Redis Connection

**Check if Redis is running:**
```bash
# Redis should be on port 6380 (check docker-compose.yml)
docker ps | grep redis
```

### Issue 6: Environment Variables

**Check required variables:**
- `DATABASE_URL`
- `REDIS_HOST` (default: localhost)
- `REDIS_PORT` (default: 6380)
- `JWT_SECRET`
- `STRIPE_SECRET_KEY` (optional for startup, but needed for payments)

### Issue 7: Module Dependency Issues

If you see errors about providers not being found:

1. **Check imports** in `payments.module.ts`
2. **Verify providers** are correctly registered
3. **Check circular dependencies**

## Quick Diagnostic Commands

```bash
# 1. Check if port is in use
lsof -i :3001

# 2. Check database connection
psql $DATABASE_URL -c "SELECT 1"

# 3. Check Redis connection
redis-cli -h localhost -p 6380 ping

# 4. Check TypeScript errors
cd apps/api && yarn type-check

# 5. Check for missing dependencies
cd "/Users/user/Desktop/Abel Labs" && yarn install
```

## Start Server with Debug Logging

```bash
cd "/Users/user/Desktop/Abel Labs"
DEBUG=* yarn dev
```

This will show detailed logs of what's happening.

## Check Server Logs

When you run `yarn dev`, look for:
- ✅ "API server running on http://localhost:3001"
- ❌ Any error messages
- ⚠️  Warnings about missing environment variables

## Common Error Messages

### "Cannot find module"
**Solution:** Run `yarn install`

### "Port 3001 already in use"
**Solution:** Kill the process or use a different port

### "Can't reach database server"
**Solution:** Start Docker: `docker-compose up -d`

### "Redis connection failed"
**Solution:** Check Redis is running on port 6380

### "GROQ_API_KEY is required"
**Solution:** Add to `.env` file (but server should still start)

---

**If server still won't start, share the error message and I'll help fix it!**











