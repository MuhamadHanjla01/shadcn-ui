# Backend API Setup Guide

This project now uses a backend API server to handle GitHub commits, avoiding CORS issues and improving reliability.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Start Backend Server

```bash
npm run dev:server
```

The backend will run on `http://localhost:3001`

### 3. Start Frontend (in a separate terminal)

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Start Both Together (Optional)

```bash
npm run dev:all
```

This runs both frontend and backend simultaneously using `concurrently`.

## 📡 API Endpoints

The backend provides the following endpoints:

### Health Check
- **GET** `/api/health`
- Returns: `{ status: 'ok', message: 'Backend API is running' }`

### Test GitHub Connection
- **POST** `/api/github/test`
- Body:
  ```json
  {
    "token": "your_github_token",
    "owner": "username",
    "repo": "repository-name"
  }
  ```
- Returns: `{ success: boolean, message: string }`

### Commit Single File
- **POST** `/api/github/commit-file`
- Body:
  ```json
  {
    "token": "your_github_token",
    "owner": "username",
    "repo": "repository-name",
    "branch": "main",
    "path": "public/data",
    "filePath": "user.json",
    "content": "{ ... }",
    "commitMessage": "Update user data"
  }
  ```
- Returns: `{ success: boolean, message: string }`

### Commit Multiple Files
- **POST** `/api/github/commit-files`
- Body:
  ```json
  {
    "token": "your_github_token",
    "owner": "username",
    "repo": "repository-name",
    "branch": "main",
    "path": "public/data",
    "files": [
      { "path": "user.json", "content": "{ ... }" },
      { "path": "projects.json", "content": "[ ... ]" }
    ],
    "commitMessage": "Update portfolio data"
  }
  ```
- Returns: `{ success: boolean, message: string }`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Server Port (default: 3001)
PORT=3001

# Frontend URL (for CORS, default: http://localhost:5173)
FRONTEND_URL=http://localhost:5173

# API URL (for frontend, default: http://localhost:3001 in dev, window.location.origin in prod)
VITE_API_URL=http://localhost:3001
```

### Production Deployment

For production, you'll need to:

1. **Deploy the backend** to a hosting service (Heroku, Railway, Render, etc.)
2. **Set the `VITE_API_URL`** environment variable to your backend URL
3. **Update CORS settings** in `server/index.js` to allow your frontend domain

Example for production `.env`:
```env
VITE_API_URL=https://your-backend-api.herokuapp.com
```

## 🔒 Security Notes

- GitHub tokens are sent from the frontend to the backend
- The backend makes the actual GitHub API calls (avoiding CORS)
- Tokens are base64 encoded (not encrypted) in localStorage
- In production, consider:
  - Using proper encryption for token storage
  - Adding authentication to backend endpoints
  - Using HTTPS only
  - Implementing rate limiting

## 🐛 Troubleshooting

### "Cannot connect to backend API"

1. Make sure the backend is running: `npm run dev:server`
2. Check the backend is on port 3001: `http://localhost:3001/api/health`
3. Verify CORS settings allow your frontend URL
4. Check browser console for CORS errors

### "Network error: Unable to connect to GitHub API"

1. Check your internet connection
2. Verify your GitHub token is valid
3. Ensure the token has `repo` scope
4. Check GitHub API status: https://www.githubstatus.com/

### Backend server won't start

1. Make sure Node.js 18+ is installed
2. Install dependencies: `npm install`
3. Check if port 3001 is already in use
4. Review error messages in the terminal

## 📦 Deployment Options

### Option 1: Separate Backend (Recommended)
- Deploy backend to a Node.js hosting service (Heroku, Railway, Render)
- Deploy frontend to GitHub Pages (static)
- Set `VITE_API_URL` to your backend URL

### Option 2: Combined Deployment
- Use a platform that supports both (Vercel, Netlify)
- Configure API routes
- Both frontend and backend on same domain

### Option 3: Serverless Functions
- Convert backend to serverless functions (Vercel Functions, AWS Lambda)
- Update API calls to use function endpoints
- No server to manage!

## 📝 Development Workflow

1. Start backend: `npm run dev:server` (terminal 1)
2. Start frontend: `npm run dev` (terminal 2)
3. Make changes in admin panel
4. Click "Publish All Data" or save individual items
5. Backend handles GitHub API calls automatically

## ✅ Benefits of Backend API

1. **No CORS issues** - Backend makes API calls server-side
2. **Better error handling** - Centralized error management
3. **More reliable** - No browser limitations
4. **Easier debugging** - Server-side logs
5. **Future extensibility** - Easy to add features (auth, caching, etc.)

