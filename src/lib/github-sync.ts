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
  commitMessage: string,
  retryCount: number = 0
): Promise<boolean> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  
  try {
    const branch = config.branch || 'main';
    const path = config.path || 'public/data';
    const fullPath = `${path}/${filePath}`;

    // Prepare file content (base64 encoded)
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));

    // Fetch the latest SHA right before committing (not cached)
    const getFileUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}?ref=${branch}`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let getResponse;
    try {
      getResponse = await fetch(getFileUrl, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: GitHub API took too long to respond. Please check your internet connection.');
      }
      if (fetchError.message?.includes('Failed to fetch') || fetchError instanceof TypeError) {
        throw new Error('Network error: Unable to connect to GitHub API. Please check your internet connection and try again.');
      }
      throw new Error(`GitHub API request failed: ${fetchError.message || 'Unknown error'}`);
    } finally {
      clearTimeout(timeoutId);
    }

    let sha: string | undefined;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Commit the file
    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}`;
    
    // Create AbortController for timeout
    const putController = new AbortController();
    const putTimeoutId = setTimeout(() => putController.abort(), 30000); // 30 second timeout
    
    let putResponse;
    try {
      putResponse = await fetch(putUrl, {
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
        }),
        signal: putController.signal
      });
    } catch (fetchError: any) {
      clearTimeout(putTimeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: GitHub API took too long to respond. Please check your internet connection.');
      }
      if (fetchError.message?.includes('Failed to fetch') || fetchError instanceof TypeError) {
        throw new Error('Network error: Unable to connect to GitHub API. Please check your internet connection and try again.');
      }
      throw new Error(`GitHub API request failed: ${fetchError.message || 'Unknown error'}`);
    } finally {
      clearTimeout(putTimeoutId);
    }

    if (!putResponse.ok) {
      let errorMessage = 'Failed to commit file';
      try {
        const error = await putResponse.json();
        errorMessage = error.message || errorMessage;
        
        // Handle specific GitHub API errors
        if (error.message?.includes('does not match')) {
          // Handle SHA mismatch error with retry
          if (retryCount < MAX_RETRIES) {
            console.log(`SHA mismatch for ${filePath}, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
            return commitFileToGitHub(config, filePath, content, commitMessage, retryCount + 1);
          }
          throw new Error('File was modified. Please try again.');
        }
        
        if (error.message?.includes('Bad credentials') || putResponse.status === 401) {
          throw new Error('Invalid GitHub token. Please check your token in Settings → General → GitHub Auto-Sync.');
        }
        
        if (putResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded or insufficient permissions. Please try again later.');
        }
        
        if (putResponse.status === 404) {
          throw new Error('Repository or file path not found. Please check your GitHub configuration.');
        }
        
        console.error('GitHub API error:', error);
        throw new Error(errorMessage);
      } catch (jsonError: any) {
        // If JSON parsing fails, use status text
        if (jsonError instanceof SyntaxError) {
          throw new Error(`GitHub API returned error: ${putResponse.status} ${putResponse.statusText}`);
        }
        throw jsonError;
      }
    }

    return true;
  } catch (error) {
    // Only throw if we've exhausted retries
    if (retryCount >= MAX_RETRIES) {
      console.error('Error committing file to GitHub after retries:', error);
      throw error;
    }
    // Retry on network errors
    if (error instanceof TypeError && retryCount < MAX_RETRIES) {
      console.log(`Network error for ${filePath}, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return commitFileToGitHub(config, filePath, content, commitMessage, retryCount + 1);
    }
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
    // Commit files sequentially to avoid SHA conflicts
    // Increased delay to avoid rate limiting and ensure GitHub processes each commit
    const commitDelay = 1000; // 1 second delay between commits
    const results: PromiseSettledResult<boolean>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Add delay between commits (except for the first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, commitDelay));
      }
      
      // Retry each file commit up to 3 times on network errors
      let success = false;
      let lastError: any = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          console.log(`Retrying commit for ${file.path} (attempt ${attempt + 1}/3)`);
        }
        
        try {
          await commitFileToGitHub(config, file.path, file.content, commitMessage);
          results.push({ status: 'fulfilled', value: true });
          success = true;
          break; // Success, move to next file
        } catch (error: any) {
          lastError = error;
          // If it's a network error, retry
          if (error.message?.includes('Network error') || error.message?.includes('Unable to connect') || error instanceof TypeError) {
            if (attempt < 2) {
              continue; // Retry
            }
          }
          // If it's not a network error or we've exhausted retries, fail
          if (attempt === 2 || !error.message?.includes('Network error')) {
            results.push({ 
              status: 'rejected', 
              reason: error 
            });
            break;
          }
        }
      }
      
      if (!success && lastError) {
        results.push({ 
          status: 'rejected', 
          reason: lastError 
        });
      }
    }

    const failed = results.filter(r => r.status === 'rejected');
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    
    if (failed.length > 0) {
      const errors = failed.map((r: PromiseRejectedResult) => {
        const error = r.reason;
        if (error?.message?.includes('does not match')) {
          return 'File was modified';
        }
        if (error?.message?.includes('Network error') || error?.message?.includes('Unable to connect')) {
          return 'Network connection failed';
        }
        if (error?.message?.includes('Invalid GitHub token')) {
          return 'Invalid token';
        }
        return error?.message || 'Unknown error';
      });
      
      // Remove duplicate error messages
      const uniqueErrors = [...new Set(errors)];
      
      let message = `Failed to commit ${failed.length} file(s)`;
      if (succeeded > 0) {
        message += ` (${succeeded} succeeded, ${failed.length} failed)`;
      }
      
      if (uniqueErrors.length === 1 && uniqueErrors[0] === 'Network connection failed') {
        message += `. Error: ${uniqueErrors[0]}. Please check your internet connection and try again.`;
      } else {
        message += `. Errors: ${uniqueErrors.join(', ')}`;
      }
      
      return {
        success: false,
        message: message
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

