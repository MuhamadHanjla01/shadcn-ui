import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://MuhamadHanjla01.github.io',
  'https://muhamadhanjla01.github.io'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow if origin is in allowed list or matches GitHub Pages pattern
    if (allowedOrigins.includes(origin) || 
        origin.includes('github.io') ||
        origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());

// Helper to encode content to base64
function btoa(str) {
  return Buffer.from(str).toString('base64');
}

// Helper to decode base64 content
function atob(b64) {
  return Buffer.from(b64, 'base64').toString('utf8');
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Commits a single file to GitHub
 */
async function commitFileToGitHub(
  config,
  filePath,
  content,
  commitMessage,
  retryCount = 0
) {
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
    } catch (fetchError) {
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

    let sha;
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
    } catch (fetchError) {
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
      } catch (jsonError) {
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

// API Routes

// Health check - allow GET and OPTIONS
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

app.options('/api/health', (req, res) => {
  res.sendStatus(200);
});

// Test GitHub connection - allow POST and OPTIONS
app.options('/api/github/test', (req, res) => {
  res.sendStatus(200);
});

app.post('/api/github/test', async (req, res) => {
  try {
    const { token, owner, repo } = req.body;
    
    if (!token || !owner || !repo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, owner, or repo'
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const testUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMessage = 'Failed to connect to GitHub. Please check your configuration.';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
          
          if (response.status === 401) {
            errorMessage = 'Invalid GitHub token. Please check your token.';
          } else if (response.status === 404) {
            errorMessage = 'Repository not found. Please check owner and repository name.';
          } else if (response.status === 403) {
            errorMessage = 'GitHub API rate limit exceeded or insufficient permissions. Please try again later.';
          }
        } catch (jsonError) {
          errorMessage = `GitHub API returned error: ${response.status} ${response.statusText}`;
        }
        return res.status(response.status).json({
          success: false,
          message: errorMessage
        });
      }

      res.json({
        success: true,
        message: 'GitHub connection successful!'
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return res.status(408).json({
          success: false,
          message: 'Connection test timed out. Please check your internet connection.'
        });
      }
      if (error.message?.includes('Failed to fetch') || error instanceof TypeError) {
        return res.status(503).json({
          success: false,
          message: 'Network error: Unable to connect to GitHub API. Please check your internet connection.'
        });
      }
      return res.status(500).json({
        success: false,
        message: `Connection test failed: ${error.message || 'Unknown error'}`
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Commit single file to GitHub - allow POST and OPTIONS
app.options('/api/github/commit-file', (req, res) => {
  res.sendStatus(200);
});

app.post('/api/github/commit-file', async (req, res) => {
  try {
    const { token, owner, repo, branch, path, filePath, content, commitMessage } = req.body;
    
    if (!token || !owner || !repo || !filePath || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const config = {
      token,
      owner,
      repo,
      branch: branch || 'main',
      path: path || 'public/data'
    };

    await commitFileToGitHub(config, filePath, content, commitMessage || 'Update portfolio data');
    
    res.json({
      success: true,
      message: 'File committed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to commit file'
    });
  }
});

// Commit multiple files to GitHub - allow POST and OPTIONS
app.options('/api/github/commit-files', (req, res) => {
  res.sendStatus(200);
});

app.post('/api/github/commit-files', async (req, res) => {
  try {
    const { token, owner, repo, branch, path, files, commitMessage } = req.body;
    
    if (!token || !owner || !repo || !files || !Array.isArray(files)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, owner, repo, or files array'
      });
    }

    const config = {
      token,
      owner,
      repo,
      branch: branch || 'main',
      path: path || 'public/data'
    };

    const commitDelay = 1000; // 1 second delay between commits
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Add delay between commits (except for the first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, commitDelay));
      }
      
      // Retry each file commit up to 3 times on network errors
      let success = false;
      let lastError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          console.log(`Retrying commit for ${file.path} (attempt ${attempt + 1}/3)`);
        }
        
        try {
          await commitFileToGitHub(config, file.path, file.content, commitMessage || 'Update portfolio data');
          results.push({ status: 'fulfilled', value: true });
          success = true;
          break; // Success, move to next file
        } catch (error) {
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
      const errors = failed.map((r) => {
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
      
      return res.status(500).json({
        success: false,
        message: message
      });
    }

    res.json({
      success: true,
      message: `Successfully committed ${files.length} file(s) to GitHub. Deployment will start automatically in 1-2 minutes.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to commit files to GitHub'
    });
  }
});

// 404 handler for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.path}`
  });
});

// Serve static files in production (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

