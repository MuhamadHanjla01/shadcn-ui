# 🚀 Quick Railway Deployment Guide

Follow these steps to deploy your backend and enable automatic GitHub sync!

## ✅ Step-by-Step Instructions

### 1. Sign Up & Deploy (5 minutes)

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub (click "Login with GitHub")
3. **New Project** → **"Deploy from GitHub repo"**
4. **Select** your `shadcn-ui` repository
5. **Click** "Deploy Now"

### 2. Configure the Service

1. Railway will create a service - **click on it**
2. Go to **Settings** tab
3. Find **"Root Directory"** → Set to: `server`
4. Find **"Start Command"** → Set to: `node index.js`
5. **Save** settings

### 3. Set Environment Variables

Still in **Settings** → Go to **Variables** tab → Add these:

```
PORT = 3001
```

```
NODE_ENV = production
```

```
FRONTEND_URL = https://MuhamadHanjla01.github.io
```

### 4. Get Your Backend URL

1. In Railway, go to **Settings** → **Domains**
2. Click **"Generate Domain"** (if needed)
3. **Copy** your Railway URL (e.g., `https://your-app.up.railway.app`)
4. **Save this URL** - you'll need it next!

### 5. Update Frontend Code

1. Open `src/lib/github-sync.ts` in your editor
2. Find line 29: `return import.meta.env.VITE_API_URL || 'https://your-railway-app.up.railway.app';`
3. **Replace** `https://your-railway-app.up.railway.app` with your actual Railway URL
4. Save the file

### 6. Deploy Frontend

```bash
# Build frontend
pnpm run build

# Deploy to GitHub Pages
pnpm run deploy
```

### 7. Test It! 🎉

1. Go to: https://MuhamadHanjla01.github.io/shadcn-ui
2. Login to Admin Panel
3. Make a change (e.g., update your name)
4. Click "Save Changes"
5. You should see: **"Changes saved and published!"**
6. Check GitHub - your changes should be automatically committed!

---

## ✅ That's It!

Your backend is now live and automatic GitHub sync is working!

## 🆘 Troubleshooting

**Backend not starting?**
- Check Railway **Logs** tab for errors
- Verify `Root Directory` is set to `server`
- Make sure all environment variables are set

**CORS errors?**
- Verify `FRONTEND_URL` is exactly: `https://MuhamadHanjla01.github.io`
- Make sure it starts with `https://` (not `http://`)

**Frontend can't connect?**
- Verify Railway URL is correct in `src/lib/github-sync.ts`
- Test backend health: Open `https://your-railway-url/api/health` in browser
- Should see: `{"status":"ok","message":"Backend API is running"}`

---

## 📚 More Details

- **Full instructions**: See `RAILWAY_DEPLOYMENT_STEPS.md`
- **After deployment**: See `UPDATE_AFTER_RAILWAY.md`

---

**Ready?** Start with Step 1 and follow along! 🚂

