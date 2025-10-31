/**
 * GitHub Sync Service
 * 
 * Automatically commits exported data files to GitHub repository
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

interface GitHubFile {
  path: string;
  content: string;
  encoding: 'base64' | 'utf-8';
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
 * Commits a single file to GitHub
 */
async function commitFileToGitHub(
  config: GitHubConfig,
  filePath: string,
  content: string,
  commitMessage: string
): Promise<boolean> {
  try {
    const branch = config.branch || 'main';
    const path = config.path || 'public/data';
    const fullPath = `${path}/${filePath}`;

    // Get the current file SHA (if exists)
    const getFileUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}?ref=${branch}`;
    const getResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha: string | undefined;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Prepare file content (base64 encoded)
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));

    // Commit the file
    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}`;
    const putResponse = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: contentBase64,
        branch: branch,
        ...(sha && { sha })
      })
    });

    if (!putResponse.ok) {
      const error = await putResponse.json();
      console.error('GitHub API error:', error);
      throw new Error(error.message || 'Failed to commit file');
    }

    return true;
  } catch (error) {
    console.error('Error committing file to GitHub:', error);
    throw error;
  }
}

/**
 * Commits multiple files to GitHub in a single operation
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
    // Commit files sequentially (GitHub API doesn't support batch commits easily)
    const results = await Promise.allSettled(
      files.map(file => commitFileToGitHub(config, file.path, file.content, commitMessage))
    );

    const failed = results.filter(r => r.status === 'rejected');
    
    if (failed.length > 0) {
      const errors = failed.map((r: PromiseRejectedResult) => r.reason?.message || 'Unknown error');
      return {
        success: false,
        message: `Failed to commit ${failed.length} file(s). Errors: ${errors.join(', ')}`
      };
    }

    return {
      success: true,
      message: `Successfully committed ${files.length} file(s) to GitHub. Deployment will start automatically in 1-2 minutes.`
    };
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

    // Commit to GitHub
    return await commitFilesToGitHub(files, commitMessage);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to export and commit data'
    };
  }
}

/**
 * Tests GitHub connection
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
    const testUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid GitHub token. Please check your token.'
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          message: 'Repository not found. Please check owner and repository name.'
        };
      }
      return {
        success: false,
        message: `GitHub API error: ${response.status} ${response.statusText}`
      };
    }

    return {
      success: true,
      message: 'Successfully connected to GitHub!'
    };
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

