# 📝 Update Frontend After Railway Deployment

After deploying your backend to Railway, you need to update your frontend to use the Railway backend URL.

## Step 1: Get Your Railway Backend URL

1. Go to Railway dashboard: https://railway.app
2. Click on your deployed service
3. Go to **Settings** → **Domains** section
4. Copy your Railway URL (e.g., `https://your-app-name.up.railway.app`)

## Step 2: Update Frontend Configuration

You have two options:

### Option A: Set Environment Variable (Recommended)

Since GitHub Pages doesn't support environment variables during build, we'll set it in the code:

1. Open `src/lib/github-sync.ts`
2. Find the `getApiBaseUrl()` function (around line 21)
3. Update it to use your Railway URL:

```typescript
function getApiBaseUrl(): string {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
  // In production, use Railway URL
  return import.meta.env.VITE_API_URL || 'https://your-railway-app.up.railway.app';
}
```

Replace `https://your-railway-app.up.railway.app` with your actual Railway URL.

### Option B: Use Environment Variable (For Local Builds)

1. Create `.env.production` file in root directory:
```
VITE_API_URL=https://your-railway-app.up.railway.app
```

2. Build with: `pnpm run build`
3. Deploy with: `pnpm run deploy`

## Step 3: Rebuild and Deploy Frontend

```bash
# Build the frontend
pnpm run build

# Deploy to GitHub Pages
pnpm run deploy
```

## Step 4: Test It!

1. Go to your portfolio: https://MuhamadHanjla01.github.io/shadcn-ui
2. Open Admin Panel
3. Make a change and click "Save"
4. You should see "Changes saved and published!" message
5. Check your GitHub repo - changes should be automatically committed!

## ✅ Done!

Your automatic GitHub sync should now work! Every time you save in the admin panel, changes are automatically committed to GitHub and deployed.

