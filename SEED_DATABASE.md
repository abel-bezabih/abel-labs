# 🌱 Seed Database - Quick Guide

## The Problem

You're getting "Invalid credentials" because the database hasn't been seeded yet. The admin user doesn't exist!

## Solution: Seed the Database

Run this command:

```bash
cd packages/database
yarn db:seed
```

Or from the root:

```bash
yarn workspace @abel-labs/database db:seed
```

## What Gets Created

After seeding, you'll have:

1. **Admin User**
   - Email: `admin@abellabs.ca`
   - Password: `admin123`

2. **Developer User**
   - Email: `dev@abellabs.ca`
   - Password: `dev123`

3. **Client User**
   - Email: `client@example.com`
   - Password: `client123`

4. **Sample Data**
   - Sample project
   - Sample invoice (for testing payments)
   - Sample conversation

## After Seeding

Once seeded, try logging in again:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@abellabs.ca",
    "password": "admin123"
  }'
```

You should get an `accessToken` back!

## If Seeding Fails

Make sure:
- ✅ Docker is running (PostgreSQL needs to be up)
- ✅ Database connection is working
- ✅ Migrations are applied: `yarn workspace @abel-labs/database db:migrate`










