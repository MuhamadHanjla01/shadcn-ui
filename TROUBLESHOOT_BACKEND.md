# Troubleshooting: Backend API Not Working

If user devices are not showing updates, follow these steps:

## Step 1: Check Backend is Running

1. **Check Railway Dashboard:**
   - Go to https://railway.app
   - Find your backend service
   - Check if it's running (should show "Active")
   - Check the logs for any errors

2. **Test Backend URL:**
   - Open: `https://shadcn-ui-production-8f2d.up.railway.app/api/health`
   - Should return: `{"status":"ok","message":"Backend API is running"}`

## Step 2: Check Browser Console

1. **Open browser console** (F12)
2. **Look for these logs:**
   - `🔗 Attempting to fetch ... from: ...`
   - `📡 Response status for ...: ...`
   - `✅ Loaded ... from backend API` (success)
   - `❌ Failed to load ... from backend: ...` (error)

3. **Common errors:**
   - `Failed to fetch` → Backend is not reachable (CORS or network issue)
   - `404` → Backend endpoint doesn't exist
   - `500` → Backend server error

## Step 3: Test Backend Connection

1. **Open browser console** on your site
2. **Run this command:**
   ```javascript
   fetch('https://shadcn-ui-production-8f2d.up.railway.app/api/health')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

3. **Expected result:**
   ```json
   {"status":"ok","message":"Backend API is running"}
   ```

## Step 4: Check CORS Configuration

The backend should allow requests from GitHub Pages. Check `server/index.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://MuhamadHanjla01.github.io',
  'https://muhamadhanjla01.github.io'
];
```

## Step 5: Verify Data is Saved

1. **Check Railway logs** when you save in admin panel
2. **Should see:** `✅ Saved user data to ...`
3. **If not, the save is failing**

## Step 6: Check Frontend Build

The frontend needs the correct API URL. Currently it uses:
- Development: `http://localhost:3001`
- Production: `https://shadcn-ui-production-8f2d.up.railway.app`

If your Railway URL is different, update `src/lib/backend-api.ts` line 19.

## Step 7: Test Manual Save/Load

**Test in browser console:**

```javascript
// Test save
fetch('https://shadcn-ui-production-8f2d.up.railway.app/api/data/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: { name: 'Test User', title: 'Test Title' }
  })
})
.then(r => r.json())
.then(console.log);

// Test load
fetch('https://shadcn-ui-production-8f2d.up.railway.app/api/data/user')
  .then(r => r.json())
  .then(console.log);
```

## Common Issues

### Issue: "Failed to fetch"
**Solution:** Backend is not running or not accessible. Check Railway.

### Issue: "CORS error"
**Solution:** Update CORS settings in `server/index.js` to include your GitHub Pages URL.

### Issue: "404 Not Found"
**Solution:** Backend endpoints might not be deployed. Redeploy backend.

### Issue: Data saves but doesn't load
**Solution:** Check Railway logs - files might not be persisting. Railway uses ephemeral storage by default - consider using Railway's persistent volumes or a database.

## Quick Fix: Enable Debugging

Add this to browser console to see all API calls:

```javascript
// Log all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('📡 Response:', args[0], response.status);
      return response;
    })
    .catch(error => {
      console.error('❌ Fetch Error:', args[0], error);
      throw error;
    });
};
```

