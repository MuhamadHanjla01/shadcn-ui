# Automatic GitHub Sync - Complete Guide

## 🎉 What's New

The portfolio now has **automatic GitHub synchronization**! Once configured, all your admin changes are automatically published to GitHub and deployed. **No more manual exports or uploads!**

## How It Works

1. **Admin makes changes** in the admin panel (Settings, Projects, Blog, etc.)
2. **Click "Save"** → Data is saved to localStorage AND automatically committed to GitHub
3. **GitHub Actions** rebuilds and deploys (1-2 minutes)
4. **Users see updates** automatically!

## Setup Instructions

### Step 1: Get GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Portfolio Auto-Sync`
4. Set expiration: Choose your preferred duration (or "No expiration")
5. Select scope:
   - ✅ **repo** (Full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Configure Auto-Sync

1. Go to **Admin Panel** → **Settings** → **Advanced** tab
2. Scroll to **"GitHub Auto-Sync"** section
3. Fill in the form:
   - **GitHub Personal Access Token**: Paste your token
   - **Repository Owner**: `MuhamadHanjla01` (or your username)
   - **Repository Name**: `shadcn-ui` (or your repo name)
   - **Branch**: `main` (default)
   - **Data Folder Path**: `public/data` (default)
4. Click **"Test Connection"** to verify it works
5. Click **"Enable Auto-Sync"**

That's it! 🎉

## How to Use

### After Configuration

Once auto-sync is enabled:

1. **Make any changes** in admin panels (Home, About, Projects, Blog, Settings, etc.)
2. **Click "Save"** 
3. **Wait 2-3 seconds** - You'll see a success message: "Settings saved and published automatically!"
4. **That's it!** Changes are committed to GitHub automatically
5. **GitHub Actions** will deploy in 1-2 minutes
6. **Users see updates** (may need to hard refresh if cache is active)

### What Gets Auto-Published

When you save in any admin panel:
- ✅ **Settings** → Auto-commits `site-settings.json`
- ✅ **Home Editor** → Auto-commits `user.json` and `stats.json`
- ✅ **About Editor** → Auto-commits `skills.json`, `experiences.json`, `achievements.json`
- ✅ **Projects Manager** → Auto-commits `projects.json`
- ✅ **Blog Manager** → Auto-commits `blog-posts.json`

All files go to: `public/data/` folder in your repository.

## Troubleshooting

### "Failed to commit file" Error

**Possible causes:**
1. **Invalid token** → Regenerate and update in settings
2. **Token expired** → Generate new token
3. **Wrong repository** → Check owner/repo name
4. **No write access** → Ensure token has `repo` scope

**Solution:**
- Click **"Test Connection"** to diagnose the issue
- Check the error message for specific problems
- Verify your token has `repo` scope enabled

### "Repository not found" Error

**Possible causes:**
- Incorrect repository owner or name
- Repository is private and token doesn't have access

**Solution:**
- Verify repository owner (your GitHub username)
- Verify repository name (case-sensitive)
- Ensure token has `repo` scope for private repos

### "Invalid GitHub token" Error

**Possible causes:**
- Token was revoked or expired
- Token doesn't have required permissions

**Solution:**
- Generate a new token
- Ensure `repo` scope is selected
- Update token in Settings → Advanced → GitHub Auto-Sync

## Security Notes

### Token Storage
- Token is stored **encrypted** in your browser's localStorage
- Token is **only stored locally** (never sent to third parties)
- Token can be **cleared** by disabling auto-sync

### Token Security
- **Never share your token** publicly
- **Never commit tokens** to GitHub
- **Regenerate token** if you suspect it's compromised
- **Use minimal scopes** (only `repo` is needed)

## Disable Auto-Sync

If you want to go back to manual exports:

1. Go to **Settings** → **Advanced** → **GitHub Auto-Sync**
2. Scroll to bottom
3. Click **"Disable Auto-Sync"**
4. Token is removed from storage
5. Changes will only save to localStorage (not GitHub)

## Manual Export (Fallback)

If auto-sync fails or is disabled, you can still:
1. Use the **"Export"** buttons in each admin panel
2. Download JSON files manually
3. Upload to GitHub yourself

## Benefits

✅ **No manual steps** - Just click "Save"!
✅ **Instant publishing** - Changes go live automatically
✅ **Less errors** - No more forgetting to export/upload
✅ **Better workflow** - Focus on content, not deployment
✅ **Multiple users** - Any admin can publish (with their own token)

## Technical Details

### What Happens When You Save

1. Data saved to **localStorage** (instant, for admin preview)
2. Data **exported to JSON** (formatted, ready for GitHub)
3. GitHub API **commit request** sent
4. File **uploaded to GitHub** repository
5. GitHub Actions **triggered** (if workflow exists)
6. Site **rebuilt and deployed** (1-2 minutes)
7. Users see **updated content**!

### Files Created

All exported files are committed to: `public/data/`

- `site-settings.json` - Site configuration
- `user.json` - User profile data
- `stats.json` - Statistics
- `skills.json` - Skills list
- `experiences.json` - Work/Education history
- `achievements.json` - Achievements
- `projects.json` - Projects portfolio
- `blog-posts.json` - Blog posts

### Commit Messages

Auto-commits use descriptive messages:
- `Update site settings (automatic sync)`
- `Update user data (automatic sync)`
- `Update projects (automatic sync)`
- etc.

## Summary

**Before:** Make changes → Export files → Upload to GitHub → Commit → Push → Wait for deployment

**Now:** Make changes → Click Save → Done! ✨

The automatic sync feature makes updating your portfolio as easy as editing content in the admin panel!

