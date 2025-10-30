# 🚀 Quick GitHub Setup (5 Minutes)

## Prerequisites
- Git installed on your computer
- GitHub account created

---

## Step-by-Step Commands

### 1. Open PowerShell/Terminal in your project folder
```powershell
cd "C:\Users\DELL\Desktop\shadcn-ui"
```

### 2. Initialize Git (if needed)
```powershell
git init
```

### 3. Configure Git (first time only)
```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 4. Add all files
```powershell
git add .
```

### 5. Create first commit
```powershell
git commit -m "Initial commit - Modern portfolio with maintenance mode"
```

### 6. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `portfolio-website` (or any name you like)
3. Keep it **Public** (or Private if you prefer)
4. **DO NOT** check any boxes (no README, no .gitignore, no license)
5. Click **Create repository**

### 7. Connect and Push
GitHub will show you commands. Use these with your details:

```powershell
# Add your GitHub repository
git remote add origin https://github.com/MuhamadHanjla01/shadcn-ui.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

Or if remote already exists, update it:
```powershell
git remote set-url origin https://github.com/MuhamadHanjla01/shadcn-ui.git
git branch -M main
git push -u origin main
```

---

## ✅ Done! Your Code is on GitHub

Visit: `https://github.com/MuhamadHanjla01/shadcn-ui`

---

## 🌐 Deploy to GitHub Pages (Optional - Free Hosting)

### Enable GitHub Pages:

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
5. Go back to **Actions** tab
6. You should see a deployment running
7. Once complete, your site will be live at:
   ```
   https://MuhamadHanjla01.github.io/shadcn-ui/
   ```

### Base Path Already Configured! ✅

The GitHub Actions workflow is already configured with:

```yaml
- name: Build
  run: pnpm build
  env:
    VITE_BASE_PATH: /shadcn-ui/
```

Your site will deploy to: `https://MuhamadHanjla01.github.io/shadcn-ui/`

No changes needed!

---

## 🔄 Update Your Code Later

When you make changes and want to upload them:

```powershell
git add .
git commit -m "Description of changes"
git push
```

That's it! GitHub Actions will automatically rebuild and deploy your site.

---

## 📱 Making it Look Professional

### Add a nice README badge:
Add this to the top of your README.md:

```markdown
![Deploy Status](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/actions/workflows/deploy.yml/badge.svg)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/)
```

### Add topics to your repository:
Go to your repo → Click the ⚙️ gear icon next to "About" → Add topics:
- `portfolio`
- `react`
- `typescript`
- `vite`
- `shadcn-ui`
- `tailwindcss`

---

## 🆘 Common Issues

### "Permission denied (publickey)"
**Solution:** Use HTTPS instead of SSH for the remote URL

### "Failed to push some refs"
**Solution:** Pull first:
```powershell
git pull origin main --rebase
git push origin main
```

### "PowerShell scripts disabled"
**Solution:** Use Git Bash instead, or change directory to CMD:
```powershell
cmd
# Then run git commands
```

### 404 Error on GitHub Pages
**Solution:** Make sure you've set the correct `VITE_BASE_PATH` in the deploy workflow

---

## 🎯 Pro Tips

1. **Custom Domain**: Add a CNAME file to `public/` folder with your domain
2. **SSL Certificate**: Automatic with GitHub Pages (enable in Settings → Pages)
3. **Analytics**: Your Google Analytics ID is already configured in settings
4. **SEO**: Your meta tags are already set up in the admin panel

---

## 📚 Full Documentation

For more details, see `GITHUB_DEPLOYMENT.md`

---

**Estimated Time:** 5-10 minutes for first upload  
**Next Uploads:** < 1 minute

Good luck! 🚀

