# Fix GitHub Pages Deployment

The deployment is now configured to use **GitHub Actions** which automatically deploys from the `main` branch.

## ✅ What's Fixed

1. **GitHub Actions Workflow** - Automatic deployment on every push to `main`
2. **Uses Main Branch** - No need for `gh-pages` branch
3. **Automatic Build** - Builds and deploys automatically

## 📋 Setup Steps

### Step 1: Enable GitHub Pages (if not already done)

1. Go to your repository: https://github.com/MuhamadHanjla01/shadcn-ui
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Branch**: `gh-pages` (keep this for now)
   - **Folder**: `/ (root)`
4. **OR** switch to GitHub Actions:
   - **Source**: `GitHub Actions`

### Step 2: GitHub Pages Settings

If you see "Switch to main branch only - use GitHub Actions":
1. Go to **Settings** → **Pages**
2. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**

### Step 3: Push the Workflow

The `.github/workflows/deploy.yml` file is already created. Just push to trigger deployment:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### Step 4: Verify Deployment

1. Go to **Actions** tab in your GitHub repository
2. You should see "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually 2-3 minutes)
4. Your site will be live at: https://muhamadhanjla01.github.io/shadcn-ui/

## 🔄 Automatic Deployment

Now, every time you push to `main`:
1. GitHub Actions automatically builds your site
2. Deploys to GitHub Pages
3. Your site updates within 2-3 minutes

## 🆘 Troubleshooting

### If deployment fails:

1. Check **Actions** tab for error messages
2. Common issues:
   - **pnpm not found**: The workflow uses pnpm, make sure `pnpm-lock.yaml` exists
   - **Build fails**: Check build errors in Actions log
   - **Permission errors**: Make sure GitHub Pages has write permissions

### To manually trigger deployment:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

## 📝 Notes

- The workflow builds using `pnpm` (matches your package.json)
- Base path is set to `/shadcn-ui/` (for GitHub Pages subdirectory)
- The `gh-pages` package is still available if needed, but GitHub Actions is preferred

