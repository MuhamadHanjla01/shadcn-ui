# Restore Old GitHub Pages Deployment

## What Changed

We've restored the old `gh-pages` branch deployment method and removed the GitHub Actions workflow.

## Steps to Complete

### 1. Change GitHub Pages Source Back to Branch

1. Go to your repository: https://github.com/MuhamadHanjla01/shadcn-ui
2. Click **Settings** (top navigation)
3. Click **Pages** in the left sidebar
4. Under **Source**, change from **GitHub Actions** to **Deploy from a branch**
5. Select **Branch**: `gh-pages`
6. Select **Folder**: `/ (root)`
7. Click **Save**

### 2. Deploy Using Old Method

After changing the source back to `gh-pages` branch, deploy:

```bash
pnpm run deploy
```

Or if using npm:
```bash
npm run deploy
```

This will:
- Build your site
- Push the `dist` folder to the `gh-pages` branch
- GitHub Pages will automatically deploy from that branch

### 3. Verify Deployment

- Wait 1-2 minutes for GitHub Pages to rebuild
- Visit: https://MuhamadHanjla01.github.io/shadcn-ui/
- Check repository Settings → Pages to see deployment status

## Files Changed

- ✅ **package.json**: Restored `deploy` and `predeploy` scripts
- ✅ **.github/workflows/deploy.yml**: Removed (old method doesn't use GitHub Actions)

## Why This Was Done

The GitHub Actions deployment was failing. The old `gh-pages` branch method is more reliable and simpler. It directly deploys the `dist` folder to a dedicated branch that GitHub Pages reads from.

## Future Deployments

Whenever you want to deploy changes:

```bash
pnpm run deploy
```

That's it! No need for GitHub Actions configuration.

