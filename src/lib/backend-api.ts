/**
 * Backend API Service - Complete rebuild
 * 
 * Handles all communication with backend server including:
 * - REST API calls with retry logic
 * - WebSocket connections for real-time updates
 * - Automatic error recovery
 */

// Configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get the backend API base URL (HTTP/HTTPS)
 */
function getApiBaseUrl(): string {
  // Development mode
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
  
  // Production mode
  return import.meta.env.VITE_API_URL || 'https://shadcn-ui-production-8f2d.up.railway.app';
}

/**
 * Get the WebSocket URL (WS/WSS)
 */
export function getWebSocketUrl(): string {
  const apiUrl = getApiBaseUrl();
  // Convert http(s):// to ws(s)://
  return apiUrl.replace(/^http/, 'ws');
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - backend took too long to respond');
    }
    throw error;
  }
}

export type DataType = 'user' | 'stats' | 'skills' | 'experiences' | 'achievements' | 'projects' | 'blog-posts' | 'site-settings';

/**
 * Get portfolio data from backend API with retry logic
 */
export async function getDataFromBackend<T>(type: DataType, retryCount: number = 0): Promise<T | null> {
  try {
    const baseUrl = getApiBaseUrl();
    // Add timestamp to force mobile browsers to bypass cache
    const timestamp = Date.now();
    const url = `${baseUrl}/api/data/${type}?_t=${timestamp}`;
    
    console.log(`🔗 Attempting to fetch ${type} from: ${url} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });

    console.log(`📡 Response status for ${type}:`, response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`📝 ${type} data not found in backend (404), returning null`);
        return null;
      }
      
      // Retry on 5xx server errors
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        console.log(`⚠️ Server error for ${type}, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return getDataFromBackend<T>(type, retryCount + 1);
      }
      
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ Backend API error for ${type}:`, response.status, errorText);
      throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`📦 Response data for ${type}:`, result.success ? '✅ Success' : '❌ Failed', result);
    
    if (result.success && result.data !== null) {
      console.log(`✅ Loaded ${type} from backend API (fresh from server)`);
      return result.data as T;
    }
    
    console.log(`⚠️ ${type} data is null or result.success is false`);
    return null;
  } catch (error: any) {
    // Retry on network errors
    if (retryCount < MAX_RETRIES && (error.message?.includes('Failed to fetch') || error.message?.includes('timeout') || error instanceof TypeError)) {
      console.log(`⚠️ Network error for ${type}, retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return getDataFromBackend<T>(type, retryCount + 1);
    }
    
    console.error(`❌ Failed to load ${type} from backend:`, {
      message: error.message,
      url: `${getApiBaseUrl()}/api/data/${type}`,
      error: error.name,
      retries: retryCount
    });
    return null;
  }
}

/**
 * Save portfolio data to backend API with retry logic
 */
export async function saveDataToBackend<T>(type: DataType, data: T, retryCount: number = 0): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    console.log(`💾 Saving ${type} to backend (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    
    const response = await fetchWithTimeout(`${baseUrl}/api/data/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      // Retry on 5xx server errors
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        console.log(`⚠️ Server error saving ${type}, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return saveDataToBackend<T>(type, data, retryCount + 1);
      }
      
      let errorMessage = 'Failed to save data';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `Backend API returned ${response.status}: ${response.statusText}`;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }

    const result = await response.json();
    console.log(`✅ Saved ${type} to backend successfully`);
    return {
      success: result.success !== false,
      message: result.message || `${type} data saved successfully`
    };
  } catch (error: any) {
    // Retry on network errors
    if (retryCount < MAX_RETRIES && (error.message?.includes('Failed to fetch') || error.message?.includes('timeout') || error instanceof TypeError)) {
      console.log(`⚠️ Network error saving ${type}, retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return saveDataToBackend<T>(type, data, retryCount + 1);
    }
    
    console.error(`❌ Failed to save ${type}:`, error.message);
    return {
      success: false,
      message: error.message || 'Failed to save data to backend'
    };
  }
}

/**
 * Save multiple data types to backend at once with retry logic
 */
export async function saveAllDataToBackend(data: Record<string, any>, retryCount: number = 0): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    console.log(`💾 Saving all data to backend (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    
    const response = await fetchWithTimeout(`${baseUrl}/api/data/save-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      // Retry on 5xx server errors
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        console.log(`⚠️ Server error saving all data, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return saveAllDataToBackend(data, retryCount + 1);
      }
      
      let errorMessage = 'Failed to save data';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `Backend API returned ${response.status}: ${response.statusText}`;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }

    const result = await response.json();
    console.log('✅ Saved all data to backend successfully');
    return {
      success: result.success !== false,
      message: result.message || 'Data saved successfully'
    };
  } catch (error: any) {
    // Retry on network errors
    if (retryCount < MAX_RETRIES && (error.message?.includes('Failed to fetch') || error.message?.includes('timeout') || error instanceof TypeError)) {
      console.log(`⚠️ Network error saving all data, retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return saveAllDataToBackend(data, retryCount + 1);
    }
    
    console.error('❌ Failed to save all data:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to save data to backend'
    };
  }
}

/**
 * Test backend connection
 */
export async function testBackendConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    console.log('🔌 Testing backend connection to:', baseUrl);
    
    const response = await fetchWithTimeout(`${baseUrl}/api/health`, {
      method: 'GET',
      cache: 'no-store'
    }, 5000); // 5 second timeout for health check

    if (response.ok) {
      console.log('✅ Backend API connection successful');
      return {
        success: true,
        message: 'Backend API is connected and running!'
      };
    } else {
      return {
        success: false,
        message: `Backend API returned ${response.status}: ${response.statusText}`
      };
    }
  } catch (error: any) {
    if (error.message?.includes('timeout')) {
      return {
        success: false,
        message: 'Backend API connection timeout. Please check if the server is running.'
      };
    }
    if (error.message?.includes('Failed to fetch') || error instanceof TypeError) {
      return {
        success: false,
        message: 'Cannot connect to backend API. Please ensure the backend server is running.'
      };
    }
    return {
      success: false,
      message: error.message || 'Failed to connect to backend API'
    };
  }
}

