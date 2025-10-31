# Portfolio Backend API

Backend server for handling GitHub API calls, avoiding CORS issues.

## Quick Start

```bash
npm install
npm start
```

Server runs on port 3001 (or PORT environment variable).

## Environment Variables

```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://MuhamadHanjla01.github.io
```

## Deployment

### Railway
- Just connect your GitHub repo
- Railway auto-detects Node.js
- Add environment variables in dashboard

### Render
- Create "Web Service"
- Set Start Command: `node index.js`
- Add environment variables

See `../DEPLOY_BACKEND_RAILWAY.md` for detailed instructions.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/github/test` - Test GitHub connection
- `POST /api/github/commit-files` - Commit multiple files to GitHub

