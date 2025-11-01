# 🚂 Deploy Backend to Railway - Step by Step Guide

Follow these steps to deploy your backend to Railway so automatic GitHub sync works!

## ✅ Prerequisites
- GitHub account (you already have this)
- 5 minutes of time

---

## Step 1: Sign up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Choose **"Login with GitHub"** (recommended)
4. Authorize Railway to access your GitHub account

---

## Step 2: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your `shadcn-ui` repository
4. Click **"Deploy Now"**

---

## Step 3: Configure the Service

Railway will try to auto-detect your project. We need to tell it to use the `server` folder:

1. Click on your new service/project
2. Go to **Settings** tab
3. Scroll down to **Build & Deploy Settings**
4. Set the following:
   - **Root Directory**: `server`
   - **Build Command**: Leave empty (Railway will auto-detect)
   - **Start Command**: `node index.js`

---

## Step 4: Set Environment Variables

1. In Railway, go to your service → **Variables** tab
2. Click **"New Variable"** and add these one by one:

```
Variable Name: PORT
Value: 3001
```

```
Variable Name: NODE_ENV
Value: production
```

```
Variable Name: FRONTEND_URL
Value: https://MuhamadHanjla01.github.io
```

3. Click **"Save"** after adding each variable

---

## Step 5: Wait for Deployment

1. Railway will automatically:
   - Install dependencies (`npm install` in server folder)
   - Start your backend server
   - Generate a public URL

2. Wait 2-3 minutes for deployment to complete
3. Check the **Deployments** tab to see build progress
4. Once deployed, you'll see a green "Deployed" status

---

## Step 6: Get Your Backend URL

1. In Railway, go to **Settings** tab
2. Scroll to **Domains** section
3. You'll see a URL like: `https://your-app-name.up.railway.app`
4. **Copy this URL** - you'll need it in the next step!

Alternatively:
- Click on your service
- Look at the top right - there's a **"Generate Domain"** button
- Railway will give you a URL like: `your-service-name-production.up.railway.app`

---

## Step 7: Update Frontend to Use Backend URL

Now we need to tell your frontend where the backend is:

### Option A: Update vite.config.ts (Recommended)

1. Edit `vite.config.ts` in your project
2. Add or update the build configuration to include the backend URL
3. Or create a `.env.production` file with:
   ```
   VITE_API_URL=https://your-app-name.up.railway.app
   ```

### Option B: Set Environment Variable in Railway (If deploying frontend to Railway)

If you're deploying frontend elsewhere, set the environment variable in that platform.

---

## Step 8: Test the Backend

1. Open your Railway backend URL in browser: `https://your-app-name.up.railway.app/api/health`
2. You should see: `{"status":"ok","message":"Backend API is running"}`
3. If you see this, your backend is working! ✅

---

## Step 9: Update and Redeploy Frontend

1. Update your frontend code to use the Railway backend URL
2. Build and deploy your frontend:
   ```bash
   pnpm run build
   pnpm run deploy
   ```

---

## ✅ You're Done!

Now when you:
1. Make changes in the admin panel
2. Click "Save Changes"
3. Your backend (Railway) will automatically commit to GitHub
4. GitHub Pages will rebuild
5. Users see your changes in 1-2 minutes!

---

## 🔧 Troubleshooting

### Backend not starting?
- Check **Logs** tab in Railway
- Make sure `server/index.js` exists
- Verify environment variables are set correctly

### CORS errors?
- Check that `FRONTEND_URL` is set to: `https://MuhamadHanjla01.github.io`
- Make sure it includes `https://` (not `http://`)

### 502 Bad Gateway?
- Check Railway logs for errors
- Verify Node.js version (Railway auto-detects, but check if needed)
- Make sure all dependencies are in `server/package.json`

### Frontend can't connect?
- Verify backend URL is correct
- Check Railway dashboard - is service running?
- Test backend health endpoint in browser

---

## 💡 Pro Tips

- **Auto-deployment**: Railway auto-deploys on every push to main branch
- **Custom domain**: You can add a custom domain later in Railway Settings
- **Monitoring**: Check Railway dashboard for usage stats
- **Logs**: View real-time logs in Railway dashboard → Logs tab

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Next Step**: Once your backend is deployed, come back and we'll update the frontend configuration!

