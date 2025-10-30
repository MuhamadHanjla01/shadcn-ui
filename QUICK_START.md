# 🚀 Quick Start Guide

Get your portfolio website up and running in minutes!

## ⚡ Super Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```bash
pnpm install
```

### 2️⃣ Start Development Server
```bash
pnpm run dev
```

### 3️⃣ Open Your Browser
Navigate to `http://localhost:5173`

🎉 **Done!** Your portfolio is running locally!

---

## 🌐 Deploy to GitHub Pages (5 Minutes)

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and create a new repository
2. Name it anything you want (e.g., `my-portfolio`)
3. Don't initialize with README

### Step 2: Push Your Code
```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace YOUR-USERNAME and YOUR-REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### Step 4: Wait for Deployment
- GitHub Actions will automatically build and deploy your site
- Check the **Actions** tab to see progress
- Usually takes 2-3 minutes

### Step 5: Access Your Site
Your portfolio is now live at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

🎊 **Congratulations!** Your portfolio is now live on the internet!

---

## 🔐 Access Admin Panel

### Default Credentials
- **URL**: `http://localhost:5173/admin/login` (or your deployed URL + `/admin/login`)
- **Email**: `admin@example.com`
- **Password**: `admin123`

### ⚠️ Important: Change Credentials Immediately!
1. Login to admin panel
2. Click your profile icon (top right)
3. Update email and password
4. Save changes

---

## 🎨 Customize Your Portfolio

### 1. Update Home Page
- Go to **Admin Panel** → **Home Editor**
- Update your name, title, tagline
- Upload profile photo
- Add social media links
- Edit statistics (Years Experience, Projects, etc.)

### 2. Theme Settings
- Go to **Admin Panel** → **Theme Settings**
- Upload logo or use text initials
- Choose color scheme
- Configure dark mode

### 3. Site Settings
- Go to **Admin Panel** → **Settings**
- Update site title and description
- Configure favicon (uses logo by default)
- Add meta tags for SEO
- Setup footer

### 4. Add Projects
- Go to **Admin Panel** → **Projects Manager**
- Click "Add Project"
- Fill in details and upload images
- Publish!

### 5. Write Blog Posts
- Go to **Admin Panel** → **Blog Manager**
- Create your first post
- Add tags and categories

---

## 📝 Common Commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run preview          # Preview production build

# Code Quality
pnpm run lint             # Run linter

# Deployment
pnpm run deploy           # Deploy to GitHub Pages (manual method)

# Package Management
pnpm install              # Install dependencies
pnpm add <package>        # Add new package
pnpm update              # Update all packages
```

---

## 🐛 Troubleshooting

### Issue: Port 5173 is already in use
**Solution**: Kill the process or use a different port
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5173 | xargs kill
```

### Issue: pnpm command not found
**Solution**: Install pnpm globally
```bash
npm install -g pnpm
```

### Issue: Can't access admin panel after deployment
**Solution**: Make sure you're accessing:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/admin/login
```

### Issue: Changes not showing after deployment
**Solution**: 
1. Clear browser cache (Ctrl + Shift + R)
2. Wait 1-2 minutes for deployment to complete
3. Check Actions tab on GitHub for deployment status

---

## 📚 Next Steps

1. ✅ Complete your profile in admin panel
2. 📸 Add your projects with images
3. ✍️ Write your first blog post
4. 🎨 Customize theme colors
5. 🔍 Add SEO meta tags
6. 📊 Setup Google Analytics (optional)
7. 🌐 Add custom domain (optional)

---

## 🆘 Need More Help?

- 📖 Read the [Full README](README.md)
- 🚀 Check [Deployment Guide](DEPLOYMENT.md)
- 🐛 [Report Issues](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/issues)

---

## 💡 Pro Tips

1. **Keep it Simple**: Start with basic content, improve gradually
2. **Regular Backups**: Export your data from admin panel regularly
3. **Test Locally**: Always test changes locally before deploying
4. **Mobile First**: Check how it looks on mobile devices
5. **SEO Matters**: Fill in all meta tags and descriptions

---

**Ready to build something amazing? Let's go! 🚀**

