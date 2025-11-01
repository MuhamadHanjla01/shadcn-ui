/**
 * Backend API Service
 * 
 * Direct connection to backend for saving and loading portfolio data
 * This replaces GitHub sync for faster, real-time updates
 */

/**
 * Get the backend API base URL
 */
function getApiBaseUrl(): string {
  let baseUrl: string;
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  } else {
    // In production, use environment variable or fallback to Railway URL
    baseUrl = import.meta.env.VITE_API_URL || 'https://shadcn-ui-production-8f2d.up.railway.app';
  }
  
  // Remove trailing slash
  return baseUrl.replace(/\/+$/, '');
}

export type DataType = 'user' | 'stats' | 'skills' | 'experiences' | 'achievements' | 'projects' | 'blog-posts' | 'site-settings';

/**
 * Get portfolio data from backend API
 */
export async function getDataFromBackend<T>(type: DataType): Promise<T | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/data/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`📝 ${type} data not found in backend, returning null`);
        return null;
      }
      throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data !== null) {
      console.log(`✅ Loaded ${type} from backend API`);
      return result.data as T;
    }
    
    return null;
  } catch (error: any) {
    console.warn(`⚠️ Failed to load ${type} from backend:`, error.message);
    return null;
  }
}

/**
 * Save portfolio data to backend API
 */
export async function saveDataToBackend<T>(type: DataType, data: T): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/data/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
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
    return {
      success: result.success !== false,
      message: result.message || `${type} data saved successfully`
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to save data to backend'
    };
  }
}

/**
 * Save multiple data types to backend at once
 */
export async function saveAllDataToBackend(data: Record<string, any>): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/data/save-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
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
    return {
      success: result.success !== false,
      message: result.message || 'Data saved successfully'
    };
  } catch (error: any) {
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
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (response.ok) {
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

