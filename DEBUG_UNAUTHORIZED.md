# 🔍 Debug "Unauthorized" Error

## Quick Checks

### 1. Verify Token is in localStorage

Open browser console and run:
```javascript
localStorage.getItem('accessToken')
```

**Expected:** Should return your token string  
**If null/undefined:** Token wasn't set correctly

### 2. Check Token Format

The token should look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFiZWxsYWJzLmNhIiwic3ViIjoiY21qNWlxYm5vMDAwMGMwdmZja2h0dXNkdSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTcwNDQ4MywiZXhwIjoxNzY1NzA1MzgzfQ.7snAvKEX27LxdH68dtpN4f4zxeY32gHD75eKAttk_ls
```

**Common issues:**
- Extra quotes: `"token"` instead of `token`
- Extra spaces: ` token ` instead of `token`
- Missing parts: Token should have 3 parts separated by dots

### 3. Check if Token Expired

JWT tokens expire after 15 minutes by default. If you logged in a while ago, login again:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@abellabs.ca",
    "password": "admin123"
  }'
```

### 4. Set Token Correctly

In browser console:
```javascript
// First, remove any old token
localStorage.removeItem('accessToken');

// Then set the new one (replace with your actual token)
localStorage.setItem('accessToken', 'YOUR_TOKEN_HERE');

// Verify it's set
console.log('Token:', localStorage.getItem('accessToken'));
```

### 5. Check Browser Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Try to create payment checkout
4. Click on the `/payments/checkout` request
5. Check "Headers" → "Request Headers"
6. Look for: `Authorization: Bearer YOUR_TOKEN`

**If missing:** Token isn't being sent  
**If present but wrong:** Token format issue

### 6. Check API Logs

Look at your API server terminal for:
- Authentication errors
- JWT validation errors
- Token expiration messages

## Quick Fix: Re-login and Set Token

1. **Get fresh token:**
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@abellabs.ca","password":"admin123"}'
   ```

2. **Copy the `accessToken` from response**

3. **In browser console:**
   ```javascript
   localStorage.setItem('accessToken', 'PASTE_TOKEN_HERE');
   ```

4. **Refresh page and try again**

## Still Not Working?

Check:
- ✅ API server is running
- ✅ Token is in localStorage (not null)
- ✅ Token is fresh (just logged in)
- ✅ No extra quotes/spaces in token
- ✅ Network tab shows Authorization header











