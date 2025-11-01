# Diagnose: Frontend Not Updating

Follow these steps to diagnose why the frontend isn't updating:

## Step 1: Check if GitHub Sync is Working

1. **Open Admin Panel**: https://MuhamadHanjla01.github.io/shadcn-ui/admin
2. **Open Browser DevTools**: Press F12
3. **Go to Network Tab**: Filter by "XHR" or "Fetch"
4. **Make a change** in Home Editor (e.g., change your name)
5. **Click "Save Changes"**
6. **Check Network Tab**: Look for request to `/api/github/commit-files`
   - If you see this request and it returns `success: true` → GitHub sync is working ✅
   - If you see error or no request → GitHub sync not configured ❌

## Step 2: Check if JSON Files are Being Created

1. **Go to GitHub**: https://github.com/MuhamadHanjla01/shadcn-ui/tree/main/public/data
2. **Check if files exist**: `user.json`, `stats.json`, `site-settings.json`
3. **Check last commit time**: Files should show recent update after you save

## Step 3: Test JSON File Access

Open these URLs directly in browser:
- https://MuhamadHanjla01.github.io/shadcn-ui/data/user.json
- https://MuhamadHanjla01.github.io/shadcn-ui/data/stats.json

**Expected**: Should show JSON data
**If 404**: Files aren't deployed (check GitHub Actions)

## Step 4: Check Console Logs

1. **Open Frontend**: https://MuhamadHanjla01.github.io/shadcn-ui
2. **Open DevTools**: Press F12 → Console tab
3. **Make a change and save** in admin
4. **Watch console** for these messages:
   - `🔄 Data update event received`
   - `📥 GitHub sync detected`
   - `📊 Reload attempt X`
   - `✅ Loaded ... from shared JSON file`

## Step 5: Check GitHub Actions

1. **Go to**: https://github.com/MuhamadHanjla01/shadcn-ui/actions
2. **Check latest workflow run**:
   - Is it running? ✅
   - Did it succeed? ✅
   - How long ago? (should be recent after save)

## Common Scenarios

### Scenario A: GitHub Sync Not Working
**Symptoms**: No request to `/api/github/commit-files` in Network tab
**Fix**: 
1. Go to Admin → Settings → GitHub Auto-Sync
2. Verify all fields are filled correctly
3. Click "Test Connection" - should succeed
4. Save settings

### Scenario B: JSON Files Not Being Created
**Symptoms**: GitHub shows no JSON files or old files
**Fix**:
1. Check Railway backend is running
2. Check Network tab for API errors
3. Try "Publish All Data" button in Admin Dashboard

### Scenario C: JSON Files Exist But Frontend Can't Access
**Symptoms**: Files exist on GitHub, but 404 when accessing directly
**Fix**:
1. Check GitHub Actions - is workflow succeeding?
2. Wait 2-3 minutes after save for rebuild
3. Check if files are in `public/data/` (should copy to `dist/data/` during build)

### Scenario D: Frontend Loads But Shows Old Data
**Symptoms**: JSON files accessible, but frontend shows old data
**Fix**:
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check console logs for reload attempts

## Quick Test

Run this in browser console on your frontend:

```javascript
// Test if JSON files are accessible
fetch('/shadcn-ui/data/user.json?t=' + Date.now())
  .then(r => r.json())
  .then(data => {
    console.log('✅ JSON file accessible:', data.name);
    console.log('Data:', data);
  })
  .catch(err => {
    console.error('❌ Cannot access JSON file:', err);
    console.log('💡 Check if files exist and GitHub Actions succeeded');
  });
```

## What to Share for Help

If still not working, share:
1. **Console logs** (copy all messages after saving)
2. **Network tab screenshot** (showing API requests)
3. **GitHub Actions status** (screenshot of workflow runs)
4. **JSON file URL test** (what you see when accessing directly)

This will help identify the exact issue!

