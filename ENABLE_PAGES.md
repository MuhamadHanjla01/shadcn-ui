# Fix 404 Error - Enable GitHub Pages

## 🎯 Follow These Exact Steps:

### 1. Go to Repository Settings
Visit: https://github.com/MuhamadHanjla01/shadcn-ui/settings/pages

### 2. Configure GitHub Pages

Look for the **"Build and deployment"** section:

**Source**: 
- Click the dropdown
- Select: **"GitHub Actions"** (NOT "Deploy from a branch")
- Make sure it says "GitHub Actions" and NOT "main branch"

### 3. Save (if button appears)

### 4. Trigger a New Deployment

Go back to your project folder and run:

```bash
git commit --allow-empty -m "Trigger GitHub Pages deployment"
git push
```

This creates an empty commit to trigger the workflow again.

### 5. Wait 2-3 Minutes

- Go to: https://github.com/MuhamadHanjla01/shadcn-ui/actions
- Watch for the new workflow to complete
- Look for green checkmark ✓

### 6. Check Your Site

Visit: https://MuhamadHanjla01.github.io/shadcn-ui/

---

## 🔍 Common Issues:

### Issue: Still seeing "Deploy from a branch"
**Fix**: Make sure you select "GitHub Actions" not branch deployment

### Issue: No "GitHub Actions" option
**Fix**: 
1. Go to Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Save
4. Go back to Pages settings

### Issue: Workflow runs but still 404
**Fix**: Check that the workflow completed successfully in the Actions tab

---

## ✅ Success Indicators:

When it's working, you'll see in Settings → Pages:
```
✓ Your site is live at https://MuhamadHanjla01.github.io/shadcn-ui/
```

---

**Need more help? Check the Actions tab for any error messages.**

