# Fix 500 Error - GitHub Test Connection

## Steps to Debug

### Step 1: Check Railway Logs

1. Go to **Railway Dashboard**: https://railway.app
2. Click on your `shadcn-ui` service
3. Go to **Logs** tab
4. Look for error messages when you click "Test Connection"
5. Copy the error message and stack trace

### Step 2: Verify Node.js Version

Railway needs Node.js 18+ for native `fetch` support. Check:

1. In Railway → Settings → Variables
2. Check if there's a `NODE_VERSION` variable
3. If not, Railway auto-detects from `package.json` (should be 18+)

### Step 3: Check Request Data

The error might be due to:
- Missing request body
- Invalid token format
- CORS issues

### Step 4: Test Endpoint Directly

Open browser console and run:

```javascript
fetch('https://shadcn-ui-production-8f2d.up.railway.app/api/github/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'your-token-here',
    owner: 'MuhamadHanjla01',
    repo: 'shadcn-ui'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Common Issues

### Issue 1: Node.js Version Too Old
**Fix**: Ensure Railway is using Node.js 18+ (already set in `package.json`)

### Issue 2: Fetch Not Available
**Fix**: Railway should have Node 18+, but if not, we might need to add `node-fetch` package

### Issue 3: Request Body Not Parsed
**Fix**: Check if `express.json()` middleware is working (already added)

### Issue 4: GitHub Token Issues
**Fix**: Make sure your GitHub token:
- Has `repo` scope/permission
- Is not expired
- Is correctly copied (no extra spaces)

## Quick Fix

After Railway redeploys with the improved logging:

1. Click "Test Connection" again
2. Check Railway logs for the actual error
3. Share the error message from logs

The updated code will show detailed error messages in Railway logs.

