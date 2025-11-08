import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Track connected clients
const clients = new Set();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://MuhamadHanjla01.github.io',
  'https://muhamadhanjla01.github.io',
  'https://muhamadhanjla01.github.io/shadcn-ui',
  'https://muhamadhanjla01.github.io/shadcn-ui/',
  'https://MuhamadHanjla01.github.io/shadcn-ui',
  'https://MuhamadHanjla01.github.io/shadcn-ui/'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
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

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Normalize double slashes
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// Data storage directory
const DATA_DIR = join(__dirname, 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('✅ Data directory ready:', DATA_DIR);
  } catch (error) {
    console.error('⚠️ Error creating data directory:', error.message);
  }
}

await ensureDataDir();

// Data file mapping
const DATA_FILES = {
  'user': 'user.json',
  'stats': 'stats.json',
  'skills': 'skills.json',
  'experiences': 'experiences.json',
  'achievements': 'achievements.json',
  'projects': 'projects.json',
  'blog-posts': 'blog-posts.json',
  'site-settings': 'site-settings.json'
};

// Get data file path
function getDataFilePath(type) {
  const filename = DATA_FILES[type] || `${type}.json`;
  return join(DATA_DIR, filename);
}

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = Math.random().toString(36).substring(7);
  clients.add(ws);
  
  console.log(`🔌 Client connected: ${clientId} (Total: ${clients.size})`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Real-time sync enabled',
    clientId: clientId,
    timestamp: new Date().toISOString()
  }));
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`🔌 Client disconnected: ${clientId} (Total: ${clients.size})`);
  });
  
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error.message);
    clients.delete(ws);
  });
});

// Broadcast update to all connected clients
function broadcastUpdate(dataType, data) {
  const message = JSON.stringify({
    type: 'update',
    dataType: dataType,
    data: data,
    timestamp: new Date().toISOString()
  });
  
  let successCount = 0;
  let failCount = 0;
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
        successCount++;
      } catch (error) {
        console.error('❌ Failed to send to client:', error.message);
        failCount++;
      }
    }
  });
  
  console.log(`📡 Broadcast ${dataType} update: ${successCount} clients notified${failCount > 0 ? `, ${failCount} failed` : ''}`);
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Portfolio Backend API v2.0 - Real-time enabled',
    features: {
      dataStorage: 'Persistent JSON storage',
      realtime: 'WebSocket updates',
      githubSync: 'GitHub auto-commit'
    },
    endpoints: {
      health: 'GET /api/health',
      data: 'GET/POST /api/data/:type',
      saveAll: 'POST /api/data/save-all',
      websocket: 'WS /ws'
    },
    connections: clients.size
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  const dataStatus = {
    exists: false,
    writable: false,
    fileCount: 0
  };
  
  try {
    const stats = await fs.stat(DATA_DIR);
    dataStatus.exists = stats.isDirectory();
    
    // Count data files
    const files = await fs.readdir(DATA_DIR);
    dataStatus.fileCount = files.filter(f => f.endsWith('.json')).length;
    
    // Test write
    const testFile = join(DATA_DIR, '.test');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    dataStatus.writable = true;
  } catch (e) {
    // Directory not fully accessible
  }
  
  res.json({ 
    status: 'ok', 
    message: 'Backend API is running',
    version: '2.0.0',
    features: ['REST API', 'WebSocket', 'Real-time sync'],
    data: dataStatus,
    connections: clients.size,
    timestamp: new Date().toISOString()
  });
});

// POST save all (with real-time broadcast) - MUST be before /api/data/:type
app.post('/api/data/save-all', async (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid data object'
      });
    }
    
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const results = {};
    const errors = {};
    
    // Save each data type
    for (const [type, content] of Object.entries(data)) {
      if (DATA_FILES[type]) {
        try {
          const filePath = getDataFilePath(type);
          let fileContent;
          
          try {
            fileContent = JSON.stringify(content, null, 2);
          } catch (stringifyError) {
            throw new Error(`Invalid JSON for ${type}`);
          }
          
          // Atomic write
          const tempPath = `${filePath}.tmp`;
          try {
            await fs.writeFile(tempPath, fileContent, 'utf8');
            await fs.rename(tempPath, filePath);
            results[type] = 'saved';
            
            // Broadcast each update
            broadcastUpdate(type, content);
            
            console.log(`✅ Saved ${type} data`);
          } catch (writeError) {
            try {
              await fs.unlink(tempPath);
            } catch (e) {
              // Ignore
            }
            throw writeError;
          }
        } catch (error) {
          errors[type] = error.message;
          console.error(`❌ Error saving ${type}:`, error.message);
        }
      }
    }
    
    const successCount = Object.keys(results).length;
    const errorCount = Object.keys(errors).length;
    
    if (errorCount > 0) {
      res.status(207).json({
        success: false,
        message: `Saved ${successCount} file(s), ${errorCount} error(s)`,
        results: results,
        errors: errors,
        broadcast: clients.size > 0,
        clients: clients.size
      });
    } else {
      res.json({
        success: true,
        message: `Successfully saved ${successCount} file(s)`,
        results: results,
        broadcast: clients.size > 0,
        clients: clients.size,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Error saving all data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save data'
    });
  }
});

// GET data
app.get('/api/data/:type', async (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  try {
    const { type } = req.params;
    
    if (!DATA_FILES[type]) {
      return res.status(400).json({
        success: false,
        message: `Invalid data type: ${type}. Valid types: ${Object.keys(DATA_FILES).join(', ')}`
      });
    }
    
    const filePath = getDataFilePath(type);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        res.json({
          success: true,
          data: null,
          message: 'Data not found',
          timestamp: new Date().toISOString()
        });
      } else if (fileError instanceof SyntaxError) {
        res.status(500).json({
          success: false,
          message: `Invalid JSON in ${type} data file`
        });
      } else {
        throw fileError;
      }
    }
  } catch (error) {
    console.error('❌ Error getting data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get data'
    });
  }
});

// POST data (with real-time broadcast)
app.post('/api/data/:type', async (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const { type } = req.params;
    const { data } = req.body;
    
    if (!DATA_FILES[type]) {
      return res.status(400).json({
        success: false,
        message: `Invalid data type: ${type}`
      });
    }
    
    if (data === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing data in request body'
      });
    }
    
    // Validate JSON
    let fileContent;
    try {
      fileContent = JSON.stringify(data, null, 2);
    } catch (stringifyError) {
      return res.status(400).json({
        success: false,
        message: 'Data is not valid JSON'
      });
    }
    
    const filePath = getDataFilePath(type);
    
    // Atomic write
    const tempPath = `${filePath}.tmp`;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(tempPath, fileContent, 'utf8');
      await fs.rename(tempPath, filePath);
      
      console.log(`✅ Saved ${type} data`);
      
      // Broadcast to all connected clients
      broadcastUpdate(type, data);
      
      res.json({
        success: true,
        message: `${type} data saved successfully`,
        broadcast: clients.size > 0,
        clients: clients.size,
        timestamp: new Date().toISOString()
      });
    } catch (writeError) {
      try {
        await fs.unlink(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      throw writeError;
    }
  } catch (error) {
    console.error('❌ Error saving data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save data'
    });
  }
});

// GitHub sync helper
function btoa(str) {
  return Buffer.from(str).toString('base64');
}

// GitHub commit single file
async function commitFileToGitHub(config, filePath, content, commitMessage, retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  
  try {
    const branch = config.branch || 'main';
    const path = config.path || 'public/data';
    const fullPath = `${path}/${filePath}`;
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));
    
    const getFileUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}?ref=${branch}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
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
        throw new Error('Request timeout');
      }
      throw new Error(`GitHub API request failed: ${fetchError.message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    let sha;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}`;
    const putController = new AbortController();
    const putTimeoutId = setTimeout(() => putController.abort(), 30000);
    
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
        throw new Error('Request timeout');
      }
      throw new Error(`GitHub API request failed: ${fetchError.message}`);
    } finally {
      clearTimeout(putTimeoutId);
    }

    if (!putResponse.ok) {
      const error = await putResponse.json();
      
      if (error.message?.includes('does not match') && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return commitFileToGitHub(config, filePath, content, commitMessage, retryCount + 1);
      }
      
      if (putResponse.status === 401) {
        throw new Error('Invalid GitHub token');
      }
      
      throw new Error(error.message || 'Failed to commit file');
    }

    return true;
  } catch (error) {
    if (retryCount < MAX_RETRIES && error instanceof TypeError) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return commitFileToGitHub(config, filePath, content, commitMessage, retryCount + 1);
    }
    throw error;
  }
}

// GitHub test connection
app.post('/api/github/test', async (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const { token, owner, repo } = req.body;
    
    if (!token || !owner || !repo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, owner, or repo'
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const testUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMessage = 'Failed to connect to GitHub';
        
        if (response.status === 401) {
          errorMessage = 'Invalid GitHub token';
        } else if (response.status === 404) {
          errorMessage = 'Repository not found';
        } else if (response.status === 403) {
          errorMessage = 'GitHub API rate limit exceeded';
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
          message: 'Connection test timed out'
        });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('GitHub test error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Connection test failed'
    });
  }
});

// GitHub commit single file
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

// GitHub commit multiple files
app.post('/api/github/commit-files', async (req, res) => {
  try {
    const { token, owner, repo, branch, path, files, commitMessage } = req.body;
    
    if (!token || !owner || !repo || !files || !Array.isArray(files)) {
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

    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      try {
        await commitFileToGitHub(config, file.path, file.content, commitMessage || 'Update portfolio data');
        results.push({ status: 'fulfilled', value: true });
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
      }
    }

    const failed = results.filter(r => r.status === 'rejected');
    
    if (failed.length > 0) {
      return res.status(500).json({
        success: false,
        message: `Failed to commit ${failed.length} file(s)`
      });
    }

    res.json({
      success: true,
      message: `Successfully committed ${files.length} file(s)`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to commit files'
    });
  }
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      data: 'GET/POST /api/data/:type',
      saveAll: 'POST /api/data/save-all',
      githubTest: 'POST /api/github/test',
      githubCommitFile: 'POST /api/github/commit-file',
      githubCommitFiles: 'POST /api/github/commit-files'
    }
  });
});

// Start server
server.listen(PORT, async () => {
  console.log('');
  console.log('🚀 Portfolio Backend API v2.0');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
  console.log(`💾 Data Directory: ${DATA_DIR}`);
  console.log('');
  console.log('✨ Features:');
  console.log('  ✅ REST API for data management');
  console.log('  ✅ WebSocket real-time updates');
  console.log('  ✅ GitHub auto-sync');
  console.log('  ✅ Atomic file operations');
  console.log('  ✅ Auto-retry on failures');
  console.log('');
  console.log('📊 API Endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/data/:type');
  console.log('  POST /api/data/:type');
  console.log('  POST /api/data/save-all');
  console.log('  POST /api/github/test');
  console.log('  POST /api/github/commit-file');
  console.log('  POST /api/github/commit-files');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
