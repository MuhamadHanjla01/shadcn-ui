# ⚡ Quick Backend Deployment

**Your frontend is on GitHub Pages, now deploy the backend!**

## 🚀 Railway (Easiest - 2 minutes)

1. **Sign up**: https://railway.app (use GitHub login)

2. **Deploy**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `shadcn-ui`

3. **Configure**:
   - Railway auto-detects Node.js ✅
   - Set **Root Directory**: `server`
   - Add environment variable:
     ```
     FRONTEND_URL=https://MuhamadHanjla01.github.io
     ```

4. **Get URL**: Railway gives you a URL like:
   ```
   https://your-app.up.railway.app
   ```

5. **Update Frontend**:
   - Create `.env.production`:
     ```
     VITE_API_URL=https://your-app.up.railway.app
     ```
   - Rebuild: `npm run build && npm run deploy`

**Done!** ✅

## 📱 Test It

1. Go to your live site: https://MuhamadHanjla01.github.io/shadcn-ui
2. Login to Admin
3. Settings → General → GitHub Auto-Sync
4. Click "Test Connection"
5. Should work! 🎉

## ❓ Issues?

- **502 Error**: Check Railway logs
- **CORS Error**: Make sure `FRONTEND_URL` matches your GitHub Pages URL
- **Can't connect**: Verify backend URL is correct in `.env.production`

## 🔄 Alternative: Render

If Railway doesn't work:
- Use Render: https://render.com
- See `DEPLOY_BACKEND_RENDER.md` for details
- ⚠️ Free tier spins down after 15 min inactivity

