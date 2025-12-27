# 🚀 Start API Server

## Quick Start

The API server needs to be running. Start it with:

```bash
cd "/Users/user/Desktop/Abel Labs"
yarn dev
```

This will start all services including the API server.

## If it fails to start

### Check 1: Is Docker running?

The API needs PostgreSQL and Redis:

```bash
# Start Docker services
docker-compose up -d

# Check if running
docker-compose ps
```

### Check 2: Environment variables

Make sure your `.env` file has:
- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY` (for payments)

### Check 3: Port 3001 in use?

```bash
# Check if port is in use
lsof -i :3001

# Kill if needed
kill -9 $(lsof -ti:3001)
```

## Wait for server to start

Look for this message:
```
🚀 API server running on http://localhost:3001
```

Then test:
```bash
curl http://localhost:3001/health
```

You should get: `{"status":"ok","database":"connected"}`











