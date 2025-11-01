/**
 * GitHub Sync Service
 * 
 * Automatically commits exported data files to GitHub repository via backend API
 * This eliminates the manual upload step - changes are published automatically!
 */

import { exportDataToFile, getUploadInstructions } from './data-sync';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

/**
 * Get the backend API base URL
 * Always returns URL without trailing slash to prevent double slashes
 */
function getApiBaseUrl(): string {
  let baseUrl: string;
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  } else {
    // In production, use environment variable or fallback to Railway URL
    // Get this from Railway dashboard → Settings → Domains
    baseUrl = import.meta.env.VITE_API_URL || 'https://shadcn-ui-production-8f2d.up.railway.app';
  }
  
  // Remove trailing slash if present to prevent double slashes in URLs
  return baseUrl.replace(/\/+$/, '');
}

/**
 * Encrypts sensitive data (like GitHub token) before storing
 */
function encryptToken(token: string): string {
  // Simple base64 encoding (in production, use proper encryption)
  return btoa(token);
}

/**
 * Decrypts sensitive data
 */
function decryptToken(encrypted: string): string {
  try {
    return atob(encrypted);
  } catch {
    return '';
  }
}

/**
 * Stores GitHub configuration securely
 */
export function saveGitHubConfig(config: GitHubConfig): void {
  const configToSave = {
    ...config,
    token: encryptToken(config.token)
  };
  localStorage.setItem('github_sync_config', JSON.stringify(configToSave));
}

/**
 * Loads GitHub configuration
 */
export function loadGitHubConfig(): GitHubConfig | null {
  try {
    const stored = localStorage.getItem('github_sync_config');
    if (!stored) return null;
    
    const config = JSON.parse(stored);
    return {
      ...config,
      token: decryptToken(config.token)
    };
  } catch {
    return null;
  }
}

/**
 * Checks if GitHub sync is configured
 */
export function isGitHubSyncConfigured(): boolean {
  const config = loadGitHubConfig();
  return !!(config && config.token && config.owner && config.repo);
}

/**
 * Commits multiple files to GitHub via backend API
 */
export async function commitFilesToGitHub(
  files: Array<{ path: string; content: string }>,
  commitMessage: string = 'Update portfolio data'
): Promise<{ success: boolean; message: string }> {
  const config = loadGitHubConfig();
  
  if (!config) {
    return {
      success: false,
      message: 'GitHub sync not configured. Please set up GitHub integration first.'
    };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const apiUrl = `${baseUrl}/api/github/commit-files`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for bulk operations
    
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: config.token,
          owner: config.owner,
          repo: config.repo,
          branch: config.branch || 'main',
          path: config.path || 'public/data',
          files: files,
          commitMessage: commitMessage
        }),
        signal: controller.signal
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout: Backend API took too long to respond. Please check your internet connection.'
        };
      }
      if (fetchError.message?.includes('Failed to fetch') || fetchError instanceof TypeError) {
        return {
          success: false,
          message: 'Cannot connect to backend API. Please ensure the backend server is running on port 3001.'
        };
      }
      return {
        success: false,
        message: `Network error: ${fetchError.message || 'Unknown error'}`
      };
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorMessage = 'Failed to commit files';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `Backend API returned error: ${response.status} ${response.statusText}`;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to commit files to GitHub'
    };
  }
}

/**
 * Exports data and automatically commits to GitHub
 */
export async function exportAndCommitToGitHub(
  data: {
    [key: string]: any;
  },
  commitMessage: string = 'Update portfolio data'
): Promise<{ success: boolean; message: string }> {
  try {
    // Convert data to JSON files with correct filenames
    const fileMap: { [key: string]: string } = {
      'user': 'user.json',
      'skills': 'skills.json',
      'experiences': 'experiences.json',
      'achievements': 'achievements.json',
      'projects': 'projects.json',
      'blog-posts': 'blog-posts.json',
      'stats': 'stats.json',
      'site-settings': 'site-settings.json'
    };
    
    const files = Object.entries(data).map(([key, value]) => ({
      path: fileMap[key] || `${key}.json`, // Use mapped filename or fallback
      content: JSON.stringify(value, null, 2)
    }));

    // Commit to GitHub via backend API
    return await commitFilesToGitHub(files, commitMessage);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to export and commit data'
    };
  }
}

/**
 * Tests GitHub connection via backend API
 */
export async function testGitHubConnection(): Promise<{ success: boolean; message: string }> {
  const config = loadGitHubConfig();
  
  if (!config) {
    return {
      success: false,
      message: 'GitHub sync not configured'
    };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const apiUrl = `${baseUrl}/api/github/test`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: config.token,
          owner: config.owner,
          repo: config.repo
        }),
        signal: controller.signal
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          message: 'Connection test timed out. Please check your internet connection and ensure the backend server is running.'
        };
      }
      if (fetchError.message?.includes('Failed to fetch') || fetchError instanceof TypeError) {
        return {
          success: false,
          message: 'Cannot connect to backend API. Please ensure the backend server is running on port 3001. Run: npm run dev:server'
        };
      }
      return {
        success: false,
        message: `Connection test failed: ${fetchError.message || 'Unknown error'}`
      };
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorMessage = 'Failed to connect to GitHub';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `Backend API returned error: ${response.status} ${response.statusText}`;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to connect to GitHub'
    };
  }
}

/**
 * Gets GitHub repository URL for instructions
 */
export function getGitHubRepoUrl(): string {
  const config = loadGitHubConfig();
  if (!config) return '';
  return `https://github.com/${config.owner}/${config.repo}`;
}

/**
 * Gets GitHub file URL for uploaded data files
 */
export function getGitHubFileUrl(fileName: string): string {
  const config = loadGitHubConfig();
  if (!config) return '';
  const path = config.path || 'public/data';
  const branch = config.branch || 'main';
  return `https://github.com/${config.owner}/${config.repo}/blob/${branch}/${path}/${fileName}`;
}

/**
 * Instructions for setting up GitHub Personal Access Token
 */
export function getGitHubTokenInstructions(): string {
  return `
To enable automatic GitHub sync:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Portfolio Auto-Sync"
4. Select scopes:
   ✓ repo (Full control of private repositories)
5. Click "Generate token"
6. Copy the token and paste it in the GitHub Sync settings

⚠️ Keep your token secret! Never share it publicly.

The token will be stored encrypted in your browser's localStorage.
  `.trim();
}
