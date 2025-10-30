# GitHub Deployment Guide

## 🚀 How to Host This Project on GitHub

Follow these steps to host your portfolio project on GitHub:

### Step 1: Initialize Git Repository (if not already done)

```powershell
git init
```

### Step 2: Add All Files to Git

```powershell
git add .
```

### Step 3: Create Initial Commit

```powershell
git commit -m "Initial commit - Portfolio with maintenance mode feature"
```

### Step 4: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `portfolio-website` (or your preferred name)
   - **Description**: "Modern portfolio website built with React, TypeScript, and shadcn/ui"
   - **Visibility**: Choose "Public" or "Private"
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 5: Connect Local Repository to GitHub

After creating the repository on GitHub, you'll see a page with instructions. Use these commands:

```powershell
# Add the remote repository
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace:**
- `YOUR-USERNAME` with your GitHub username
- `YOUR-REPO-NAME` with your repository name

### Step 6: Verify Upload

1. Go to your GitHub repository URL
2. You should see all your files uploaded
3. The README.md should be displayed on the main page

---

## 📋 Complete Command Reference

Here's the complete sequence of commands:

```powershell
# Navigate to project directory (if not already there)
cd "C:\Users\DELL\Desktop\shadcn-ui"

# Initialize git (if not done)
git init

# Configure git user (if not configured)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Commit
git commit -m "Initial commit - Portfolio with maintenance mode feature"

# Add remote (get this URL from GitHub after creating repo)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Deploy to GitHub Pages (Optional)

If you want to host your portfolio for free on GitHub Pages:

### Option 1: Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

2. Go to your GitHub repository
3. Click **Settings** → **Pages**
4. Under "Build and deployment", select:
   - **Source**: GitHub Actions
5. Push this workflow file to GitHub
6. Your site will be available at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

### Option 2: Manual Deployment

```powershell
# Build the project
pnpm build

# Install gh-pages package
pnpm add -D gh-pages

# Add deploy script to package.json
# Then run:
pnpm run deploy
```

---

## 🔧 Important Configuration for GitHub Pages

If deploying to GitHub Pages, update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/YOUR-REPO-NAME/', // Add this line
  plugins: [react()],
  // ... rest of config
});
```

---

## 📝 What Gets Uploaded

The `.gitignore` file ensures these are **NOT** uploaded:
- ✅ `node_modules/` (dependencies - excluded)
- ✅ `dist/` (build output - excluded)
- ✅ Log files
- ✅ Editor-specific files

What **WILL** be uploaded:
- ✅ All source code (`src/`)
- ✅ Configuration files
- ✅ Documentation files (README, guides)
- ✅ Package files (package.json, pnpm-lock.yaml)
- ✅ Public assets

---

## 🔐 Environment Variables (If Using Firebase)

If you're using Firebase and need to deploy with environment variables:

1. Create `.env.example` file with placeholder values
2. Add `.env` to `.gitignore` (if not already there)
3. **NEVER** commit actual API keys
4. Use GitHub Secrets for deployment

---

## 📱 Repository Settings Recommendations

After uploading, configure your repository:

### Topics
Add relevant topics for discoverability:
- `portfolio`
- `react`
- `typescript`
- `vite`
- `shadcn-ui`
- `tailwindcss`

### About Section
Add description and website URL

### Branch Protection (Optional)
For collaborative work:
- Settings → Branches → Add rule
- Require pull request reviews
- Require status checks

---

## 🆘 Troubleshooting

### Issue: "Permission denied"
**Solution:** Check your GitHub credentials or use SSH instead of HTTPS

### Issue: "Repository not found"
**Solution:** Verify the remote URL:
```powershell
git remote -v
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
```

### Issue: "Updates were rejected"
**Solution:** Pull first, then push:
```powershell
git pull origin main --rebase
git push origin main
```

### Issue: PowerShell script execution disabled
**Solution:** Use Git Bash or CMD instead, or run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## ✅ Success Checklist

- [ ] Git repository initialized
- [ ] All files committed
- [ ] GitHub repository created
- [ ] Remote added to local repo
- [ ] Code pushed to GitHub
- [ ] Repository is accessible online
- [ ] README displays correctly
- [ ] (Optional) GitHub Pages deployed

---

## 🎉 Next Steps After Upload

1. **Add a LICENSE** (MIT, Apache 2.0, etc.)
2. **Star your own repo** (why not? 😊)
3. **Share the link** in your social media
4. **Set up GitHub Pages** for live demo
5. **Add CI/CD** for automatic deployments
6. **Enable GitHub Discussions** for community

---

**Need Help?** Check [GitHub Docs](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github)

