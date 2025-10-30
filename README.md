# Portfolio Website with Admin Panel

A modern, fully-featured portfolio website built with React, TypeScript, and Tailwind CSS. Includes a powerful admin panel for complete content management.

## ✨ Features

### Frontend
- 🎨 Modern responsive design with dark mode support
- 📱 Mobile-first approach
- ⚡ Fast performance with Vite
- 🎭 Smooth animations with Framer Motion
- 📊 Project showcase with filtering
- 📝 Blog system with search and tags
- 📬 Contact form with validation
- 🔍 SEO optimized

### Admin Panel
- 🔐 Secure authentication (Firebase or Local)
- 📊 Real-time dashboard with analytics
- ✏️ Complete content management
- 🎨 Theme customization
- 🖼️ Media library
- 📧 Message management
- 👥 User management
- ⚙️ Site settings (Favicon, Meta tags, Footer, etc.)
- 🔔 Notification system
- 📈 Analytics tracking

## 🛠️ Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Firebase** - Authentication (optional)
- **Framer Motion** - Animations
- **Recharts** - Charts and analytics

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm 8.10.0+

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start development server**
```bash
pnpm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

## 🚀 Deployment to GitHub Pages

### Method 1: Automatic Deployment (GitHub Actions)

1. **Push your code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Configure base path (if needed)**
   
   The workflow automatically sets the base path to your repository name. If you're using a custom domain or root domain, set the environment variable:
   
   ```bash
   # In your GitHub repository settings → Secrets and variables → Actions
   # Add a repository variable:
   VITE_BASE_PATH=/
   ```

4. **Deploy**
   
   The site will automatically deploy on every push to the `main` branch!
   
   Your site will be available at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

### Method 2: Manual Deployment

1. **Install gh-pages** (if not already installed)
```bash
pnpm install
```

2. **Update base path in vite.config.ts**
```typescript
base: '/YOUR-REPO-NAME/',
```

3. **Deploy**
```bash
pnpm run deploy
```

Your site will be available at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## 🌐 Alternative Hosting Options

### Vercel (Recommended - Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Select your repository
5. Click **Deploy**

Your site will be live at: `https://your-project.vercel.app`

### Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose your repository
5. Build settings:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
6. Click **Deploy**

## 📝 Available Scripts

```bash
# Development
pnpm run dev          # Start development server

# Production
pnpm run build        # Build for production
pnpm run preview      # Preview production build

# Code Quality
pnpm run lint         # Run ESLint

# Deployment
pnpm run predeploy    # Build before deploy (runs automatically)
pnpm run deploy       # Deploy to GitHub Pages
```

## 🔧 Configuration

### Base Path Configuration

For GitHub Pages deployment, the base path is automatically configured:

- **Root domain or custom domain**: Set `VITE_BASE_PATH=/`
- **GitHub Pages (username.github.io/repo-name)**: Uses `/repo-name/` automatically

### Admin Panel Access

Default admin credentials (for local authentication):
- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials immediately after first login in the admin panel!

### Firebase Configuration (Optional)

If you want to use Firebase Authentication:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password)
3. Copy your Firebase config
4. Update `src/lib/firebase.ts` with your credentials

## 📂 Project Structure

```
shadcn-ui/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── admin/            # Admin panel components
│   │   └── ui/               # shadcn/ui components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities and services
│   ├── pages/                # Page components
│   │   ├── admin/           # Admin pages
│   │   └── ...              # Public pages
│   ├── types/                # TypeScript types
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html                 # HTML template
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
└── tailwind.config.ts        # Tailwind configuration
```

## 🎨 Customization

### Theme Settings
Access the admin panel at `/admin/login` and navigate to:
- **Theme Settings**: Configure colors, fonts, and logo
- **Settings**: Update site information, favicon, meta tags
- **Home Editor**: Edit homepage content and statistics

### Content Management
- **Projects**: Add/edit/delete projects
- **Blog**: Manage blog posts
- **Messages**: View contact form submissions
- **Media**: Upload and manage images

## 🔐 Security Notes

- Always change default admin credentials
- Use environment variables for sensitive data
- Enable Firebase Authentication for production
- Keep dependencies updated
- Review and configure `.gitignore` to exclude sensitive files

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/issues) page
2. Create a new issue with detailed description
3. Review the documentation

## 🎉 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Vite](https://vitejs.dev/) for the fast build tool
- [React](https://react.dev/) for the powerful UI library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

Made with ❤️ using React, TypeScript, and Tailwind CSS
