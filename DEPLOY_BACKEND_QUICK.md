# Quick Backend Deployment Guide

Since your frontend is on GitHub Pages (static hosting), you need to deploy the backend separately.

## 🎯 Best Option: Railway (Recommended)

**Why Railway?**
- ✅ Free tier ($5/month credit)
- ✅ No cold starts (always running)
- ✅ Easy GitHub integration
- ✅ Auto-deploys on push

**Deploy in 5 minutes:**
1. Go to https://railway.app → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `shadcn-ui` repo
4. Railway auto-detects Node.js
5. Add environment variable: `FRONTEND_URL=https://MuhamadHanjla01.github.io`
6. Copy the provided URL (e.g., `https://your-app.up.railway.app`)
7. Add to frontend `.env`: `VITE_API_URL=https://your-app.up.railway.app`
8. Rebuild frontend: `npm run build && npm run deploy`

**Done!** Your backend API is live.

## 🔄 Alternative Options

### Render (Free, but spins down)
- Sign up at https://render.com
- Create "Web Service"
- Set Start Command: `node server/index.js`
- ⚠️ Free tier has 15-min inactivity timeout

### Fly.io (Free tier available)
- Install Fly CLI
- Run `fly launch` in project directory
- More technical setup required

## 📝 After Deployment

Once backend is deployed, update your frontend:

1. **Set API URL**:
   - Create `.env.production`:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   
2. **Rebuild and deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

3. **Test in admin panel**:
   - Go to Settings → General → GitHub Auto-Sync
   - Click "Test Connection"
   - Should work now! ✅

## 🆘 Need Help?

See detailed guides:
- `DEPLOY_BACKEND_RAILWAY.md` - Railway step-by-step
- `DEPLOY_BACKEND_RENDER.md` - Render step-by-step

