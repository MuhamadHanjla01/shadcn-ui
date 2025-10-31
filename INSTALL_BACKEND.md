# Install Backend Dependencies

Due to PowerShell execution policy restrictions, you need to install the backend dependencies manually.

## Option 1: Install via Command Prompt (CMD)

1. Open **Command Prompt** (not PowerShell)
2. Navigate to the project directory:
   ```
   cd C:\Users\DELL\Desktop\shadcn-ui
   ```
3. Install dependencies:
   ```
   npm install express cors concurrently
   ```
   OR using pnpm:
   ```
   pnpm add express cors concurrently
   ```

## Option 2: Install via Git Bash

1. Open **Git Bash**
2. Navigate to the project directory:
   ```
   cd /c/Users/DELL/Desktop/shadcn-ui
   ```
3. Install dependencies:
   ```
   npm install express cors concurrently
   ```
   OR using pnpm:
   ```
   pnpm add express cors concurrently
   ```

## Option 3: Change PowerShell Execution Policy (Admin Required)

1. Open PowerShell **as Administrator**
2. Run:
   ```
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Then install:
   ```
   pnpm add express cors concurrently
   ```

## After Installation

Once dependencies are installed, you can start the backend:

```bash
npm run dev:server
```

Or start both frontend and backend:

```bash
npm run dev:all
```

## What These Packages Do

- **express**: Web server framework for the backend API
- **cors**: Enables Cross-Origin Resource Sharing (CORS) for API calls
- **concurrently**: Allows running multiple commands simultaneously (frontend + backend)

