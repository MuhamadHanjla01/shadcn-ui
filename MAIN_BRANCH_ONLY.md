# Switch to Main Branch Only

This guide will help you configure GitHub Pages to use only the `main` branch.

## Steps to Complete

### 1. Change GitHub Pages Source

1. Go to your repository: https://github.com/MuhamadHanjla01/shadcn-ui
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click **Pages**
4. Under **Source**, change from **Deploy from a branch** → **gh-pages branch** to **GitHub Actions**
5. Click **Save**

### 2. Delete the gh-pages Branch

After changing the source to GitHub Actions, you can delete the `gh-pages` branch:

```bash
git push origin --delete gh-pages
```

Or delete it from GitHub:
1. Go to your repository
2. Click **branches**
3. Find `gh-pages` branch
4. Click the trash icon to delete it

### 3. Verify Deployment

Once you change the source to GitHub Actions:
- The workflow will automatically deploy whenever you push to `main`
- Your site will still be available at: https://MuhamadHanjla01.github.io/shadcn-ui/

## What Changed

- ✅ Removed `gh-pages` deployment script from `package.json`
- ✅ Created GitHub Actions workflow (`.github/workflows/deploy.yml`) to deploy from `main` branch
- ✅ All future deployments will happen automatically when you push to `main`

## Notes

- The GitHub Actions workflow will build and deploy your site automatically
- No need to run `npm run deploy` anymore - just push to `main`!
- The `dist` folder is still in `.gitignore` - GitHub Actions will build it during deployment

