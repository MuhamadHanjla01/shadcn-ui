# Deploy Backend to Railway (Recommended - Free Tier)

Railway is the easiest way to deploy the backend API. Free tier includes $5 credit monthly.

## 🚀 Quick Deploy

### Step 1: Sign up for Railway
1. Go to https://railway.app
2. Sign up with GitHub (recommended)

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `shadcn-ui` repository
4. Railway will detect it's a Node.js project

### Step 3: Configure Deployment
1. Railway will auto-detect `server/index.js`
2. If not, set:
   - **Root Directory**: `/server` (or `/`)
   - **Start Command**: `node index.js`
   - **Port**: Railway will set automatically

### Step 4: Set Environment Variables
In Railway dashboard → Variables tab, add:
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://MuhamadHanjla01.github.io
```

### Step 5: Get Your Backend URL
1. Railway will provide a URL like: `https://your-app-name.up.railway.app`
2. Copy this URL

### Step 6: Update Frontend Configuration
Add this to your `.env` file (or set in GitHub Pages):
```
VITE_API_URL=https://your-app-name.up.railway.app
```

Or update `vite.config.ts` to use environment variable (already done).

### Step 7: Redeploy Frontend
```bash
npm run build
npm run deploy
```

## ✅ That's It!

Your backend API will be live at `https://your-app-name.up.railway.app`

Update the `VITE_API_URL` in your frontend build to point to this URL.

## 🔧 Troubleshooting

- **502 Bad Gateway**: Check Railway logs for errors
- **CORS errors**: Make sure `FRONTEND_URL` includes your GitHub Pages URL
- **Connection refused**: Ensure backend is running (check Railway dashboard)

## 💡 Pro Tips

- Railway auto-deploys on every push to main
- You can add a custom domain later
- Monitor usage in Railway dashboard
- Free tier is generous for personal projects

