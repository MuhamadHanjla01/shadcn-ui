# 🚀 Deployment Guide

Complete guide for deploying your portfolio website to various hosting platforms.

## 📋 Table of Contents

1. [GitHub Pages (Free)](#github-pages-free)
2. [Vercel (Recommended)](#vercel-recommended)
3. [Netlify](#netlify)
4. [Custom Domain Setup](#custom-domain-setup)
5. [Troubleshooting](#troubleshooting)

---

## 🆓 GitHub Pages (Free)

GitHub Pages is a free hosting service perfect for static sites.

### ✅ Prerequisites
- GitHub account
- Git installed locally
- Project pushed to GitHub repository

### 🔧 Setup Steps

#### Option A: Automatic Deployment (GitHub Actions) - Recommended

1. **Push your code to GitHub**
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to main branch
git branch -M main
git push -u origin main
```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Configure (Optional)**
   
   The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
   - Builds your project on every push to `main`
   - Sets the correct base path
   - Deploys to GitHub Pages
   
   **For custom domain or root deployment:**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add a repository variable: `VITE_BASE_PATH` with value `/`

4. **Access your site**
   
   Your site will be available at:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```

#### Option B: Manual Deployment (gh-pages package)

1. **Install dependencies**
```bash
pnpm install
```

2. **Update vite.config.ts**
   
   Change the base path to match your repository name:
   ```typescript
   base: '/YOUR-REPO-NAME/',
   ```

3. **Deploy**
```bash
pnpm run deploy
```

4. **Configure GitHub Pages**
   - Go to **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select branch: `gh-pages`
   - Click **Save**

### 🔄 Updating Your Site

**Automatic (GitHub Actions):**
```bash
git add .
git commit -m "Update content"
git push
```

**Manual (gh-pages):**
```bash
pnpm run deploy
```

---

## ⚡ Vercel (Recommended)

Vercel offers the easiest deployment with automatic CI/CD and excellent performance.

### ✅ Why Vercel?
- ✨ Zero configuration
- 🚀 Lightning fast CDN
- 🔄 Automatic deployments on git push
- 📊 Built-in analytics
- 🌐 Free SSL certificate
- 🎯 Excellent for React apps

### 🔧 Setup Steps

1. **Push your code to GitHub** (if not already done)
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **Sign Up** and choose "Continue with GitHub"
   - Click **"Add New Project"**
   - Import your repository
   - Vercel auto-detects the configuration ✨
   - Click **Deploy**

3. **Configuration** (Optional)
   
   Vercel automatically detects:
   - Framework: Vite
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

4. **Access your site**
   
   Your site will be live at:
   ```
   https://your-project-name.vercel.app
   ```

### 🔄 Automatic Updates

Every push to your main branch automatically triggers a new deployment!

### 🌐 Custom Domain

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain
4. Follow the DNS configuration instructions

---

## 🎯 Netlify

Netlify is another excellent option with great features.

### 🔧 Setup Steps

1. **Push your code to GitHub** (if not already done)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up and click **"Add new site"**
   - Select **"Import an existing project"**
   - Choose **GitHub** and select your repository
   - Configure build settings:
     ```
     Build command: pnpm run build
     Publish directory: dist
     ```
   - Click **Deploy site**

3. **Access your site**
   
   Your site will be live at:
   ```
   https://random-name-123.netlify.app
   ```

### 🔄 Automatic Updates

Every push automatically deploys!

### 🌐 Custom Domain

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow the DNS configuration

---

## 🌐 Custom Domain Setup

### For GitHub Pages

1. **Add CNAME file to your repository**
```bash
echo "yourdomain.com" > public/CNAME
git add public/CNAME
git commit -m "Add custom domain"
git push
```

2. **Configure DNS**
   
   Add these records to your domain provider:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   
   Type: A
   Name: @
   Value: 185.199.109.153
   
   Type: A
   Name: @
   Value: 185.199.110.153
   
   Type: A
   Name: @
   Value: 185.199.111.153
   ```
   
   For subdomain (www):
   ```
   Type: CNAME
   Name: www
   Value: YOUR-USERNAME.github.io
   ```

3. **Enable custom domain in GitHub**
   - Go to **Settings** → **Pages**
   - Enter your domain
   - Check **Enforce HTTPS**

### For Vercel/Netlify

Follow the platform's instructions in the dashboard - they provide automatic DNS configuration!

---

## 🔧 Troubleshooting

### Issue: 404 Error on Page Refresh

**Problem**: Page not found when refreshing on a route other than home.

**Solution**: This is handled automatically by our configuration. If you still face issues:

For GitHub Pages, add a `404.html` that redirects to `index.html`:
```bash
cp dist/index.html dist/404.html
```

For Vercel/Netlify, they handle this automatically.

### Issue: Assets Not Loading

**Problem**: CSS/JS files return 404 errors.

**Solution**: Check your `base` path in `vite.config.ts`:
- GitHub Pages with repo name: `base: '/repo-name/'`
- Custom domain or root: `base: '/'`

### Issue: Build Fails

**Problem**: Deployment fails during build.

**Solutions**:
1. Check for TypeScript errors: `pnpm run lint`
2. Ensure all dependencies are installed: `pnpm install`
3. Test build locally: `pnpm run build`
4. Check build logs for specific errors

### Issue: Environment Variables Not Working

**Solution**: 
- GitHub Actions: Add in **Settings** → **Secrets and variables** → **Actions**
- Vercel: Add in **Settings** → **Environment Variables**
- Netlify: Add in **Site settings** → **Environment variables**

Prefix with `VITE_` for Vite to recognize them: `VITE_API_KEY`

### Issue: Old Version Showing After Deploy

**Solution**:
1. Clear browser cache (Ctrl + Shift + R / Cmd + Shift + R)
2. Wait a few minutes for CDN cache to clear
3. Check if deployment succeeded in platform dashboard

---

## 📊 Performance Tips

1. **Enable compression** - Done automatically by hosting platforms
2. **Use CDN** - Included with Vercel/Netlify
3. **Optimize images** - Use WebP format when possible
4. **Enable caching** - Configured in build settings
5. **Monitor performance** - Use built-in analytics

---

## 🔐 Security Best Practices

1. ✅ Always use HTTPS (enabled by default on all platforms)
2. ✅ Change default admin credentials immediately
3. ✅ Use environment variables for sensitive data
4. ✅ Keep dependencies updated: `pnpm update`
5. ✅ Review security advisories: `pnpm audit`

---

## 📝 Quick Reference

### GitHub Pages
```bash
# Deploy
pnpm run deploy

# With Actions - just push
git push origin main
```

### Vercel
```bash
# Install Vercel CLI (optional)
pnpm add -g vercel

# Deploy from CLI
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI (optional)
pnpm add -g netlify-cli

# Deploy from CLI
netlify deploy --prod
```

---

## 🎉 Success!

Your portfolio is now live! Share it with the world! 🌍

**Next Steps:**
1. ⚙️ Configure admin panel at `/admin/login`
2. 🎨 Customize theme and content
3. 📊 Set up analytics
4. 🔍 Submit to search engines
5. 📱 Test on different devices

---

## 🆘 Need Help?

- 📖 Check the [main README](README.md)
- 🐛 [Report an issue](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/issues)
- 💬 Community support in Discussions

Happy deploying! 🚀

