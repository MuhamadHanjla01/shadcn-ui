# Deploy Backend to Render (Free Tier)

Render offers a free tier with some limitations (spins down after inactivity).

## 🚀 Quick Deploy

### Step 1: Sign up for Render
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create New Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select `shadcn-ui`

### Step 3: Configure Service
- **Name**: `portfolio-backend` (or any name)
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `server` (or leave blank if root)
- **Build Command**: (leave empty - not needed for simple Node.js)
- **Start Command**: `node index.js`
- **Plan**: `Free` (auto-spins down after 15 min inactivity)

### Step 4: Set Environment Variables
Click "Environment" tab, add:
```
NODE_ENV=production
FRONTEND_URL=https://MuhamadHanjla01.github.io
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (takes 2-3 minutes)
3. Render will provide URL: `https://portfolio-backend.onrender.com`

### Step 6: Update Frontend
Set `VITE_API_URL=https://portfolio-backend.onrender.com` in your frontend.

## ⚠️ Important Notes

- **Free tier spins down** after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Upgrade to paid plan for always-on service

## ✅ Alternative: Always-On Option

If you want the backend always available:
1. Upgrade to **Starter** plan ($7/month)
2. Or use Railway (free tier doesn't spin down)

