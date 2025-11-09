/**
 * Real-time Sync Service - Complete rebuild
 * 
 * Provides real-time updates via WebSocket with polling fallback
 * Automatically reconnects and handles errors gracefully
 */

import { getDataFromBackend, getWebSocketUrl } from './backend-api';

// Configuration
const POLL_INTERVAL = 10000; // 10 seconds (fallback only)
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

// State tracking
const lastDataVersions: Map<string, string> = new Map();
const hasInitialPolled: Map<string, boolean> = new Map();
let isPolling = false;

// WebSocket state
let ws: WebSocket | null = null;
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wsReconnectAttempts = 0;
let wsEnabled = true;

/**
 * Initialize hash from initial data load
 */
export function initializeDataHash(key: string, data: any): void {
  if (!data) return;
  const hash = getDataHash(data);
  if (!lastDataVersions.has(key)) {
    lastDataVersions.set(key, hash);
    console.log(`📋 Initialized hash for ${key}:`, hash.substring(0, 10) + '...');
  }
}

/**
 * Gets a hash of data for change detection (without timestamps)
 */
function getDataHash(data: any): string {
  // Use a simple hash of the stringified data
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Checks if data has changed by comparing hashes
 */
function hasDataChanged(key: string, currentData: any, isInitialPoll: boolean = false): boolean {
  if (!currentData) return false;
  
  const currentHash = getDataHash(currentData);
  const lastHash = lastDataVersions.get(key);
  const hasPolled = hasInitialPolled.get(key) || false;
  
  if (lastHash === undefined || (isInitialPoll && !hasPolled)) {
    // First poll - store hash but don't trigger update
    lastDataVersions.set(key, currentHash);
    hasInitialPolled.set(key, true);
    console.log(`📋 Initial hash set for ${key}:`, currentHash.substring(0, 10) + '...');
    return false;
  }
  
  if (lastHash !== currentHash) {
    // Data changed - update hash and return true
    lastDataVersions.set(key, currentHash);
    console.log(`📊 Data changed detected for ${key}:`, {
      oldHash: lastHash.substring(0, 10) + '...',
      newHash: currentHash.substring(0, 10) + '...',
      dataPreview: typeof currentData === 'object' ? Object.keys(currentData).slice(0, 3) : 'N/A'
    });
    return true;
  }
  
  return false; // No change
}

/**
 * Connect to WebSocket for real-time updates
 */
function connectWebSocket(callback: (updates: any) => void): () => void {
  const wsUrl = getWebSocketUrl();
  
  console.log('🔌 Connecting to WebSocket...');
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      wsReconnectAttempts = 0;
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'connected') {
          // Silent - already logged in onopen
        } else if (message.type === 'update') {
          console.log('📡 Update:', message.dataType);
          
          // Clear cache for fresh data
          const dataType = message.dataType;
          lastDataVersions.delete(dataType);
          hasInitialPolled.delete(dataType);
          
          // Map backend data types to frontend
          const updates: any = {};
          
          if (dataType === 'user') updates.user = message.data;
          else if (dataType === 'stats') updates.stats = message.data;
          else if (dataType === 'site-settings') updates.siteSettings = message.data;
          else if (dataType === 'projects') updates.projects = message.data;
          else if (dataType === 'blog-posts') updates.blogPosts = message.data;
          else if (dataType === 'skills') updates.skills = message.data;
          else if (dataType === 'experiences') updates.experiences = message.data;
          else if (dataType === 'achievements') updates.achievements = message.data;
          else if (dataType === 'messages') updates.messages = message.data;
          
          if (Object.keys(updates).length > 0) {
            // Update hash with new data
            if (message.data) {
              const newHash = getDataHash(message.data);
              lastDataVersions.set(dataType, newHash);
              hasInitialPolled.set(dataType, true);
            }
            callback(updates);
          }
        }
      } catch (error) {
        console.error('❌ WebSocket parse error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error');
    };
    
    ws.onclose = () => {
      ws = null;
      
      // Try to reconnect
      if (wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        wsReconnectAttempts++;
        wsReconnectTimer = setTimeout(() => {
          connectWebSocket(callback);
        }, RECONNECT_DELAY);
      }
    };
    
    return () => {
      if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer);
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  } catch (error) {
    console.error('❌ Failed to create WebSocket:', error);
    return () => {};
  }
}

/**
 * Starts real-time sync with WebSocket + polling fallback
 * Only runs on user-facing pages (not admin)
 */
export function startRealtimeSync(callback: (updates: {
  user?: any;
  stats?: any;
  siteSettings?: any;
  projects?: any;
  blogPosts?: any;
  skills?: any;
  experiences?: any;
  achievements?: any;
  messages?: any;
}) => void) {
  if (window.location.pathname.includes('/admin')) {
    console.log('🛑 Skipping real-time sync - admin panel detected');
    return () => {};
  }

  console.log('🚀 Starting real-time sync with WebSocket + polling fallback');

  // Connect WebSocket for instant updates
  const wsCleanup = connectWebSocket(callback);
  
  // Polling fallback (runs less frequently when WebSocket is active)
  const pollForUpdates = async (isInitialPoll: boolean = false) => {
    // Skip polling if WebSocket is connected
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('⏭️ Skipping poll - WebSocket active');
      return;
    }
    
    if (isPolling) {
      console.log('⏸️ Skipping poll - another poll in progress');
      return;
    }
    
    isPolling = true;
    
    try {
      console.log('🔍 Polling fallback active (WebSocket unavailable)...');
      
      const results = await Promise.allSettled([
        getDataFromBackend('user'),
        getDataFromBackend('stats'),
        getDataFromBackend('site-settings')
      ]);
      
      const freshUserData = results[0].status === 'fulfilled' ? results[0].value : null;
      const freshStats = results[1].status === 'fulfilled' ? results[1].value : null;
      const freshSiteSettings = results[2].status === 'fulfilled' ? results[2].value : null;

      const updates: any = {};
      let hasUpdates = false;

      if (freshUserData && hasDataChanged('user', freshUserData, isInitialPoll)) {
        updates.user = freshUserData;
        hasUpdates = true;
      }

      if (freshStats && hasDataChanged('stats', freshStats, isInitialPoll)) {
        updates.stats = freshStats;
        hasUpdates = true;
      }

      if (freshSiteSettings && hasDataChanged('siteSettings', freshSiteSettings, isInitialPoll)) {
        updates.siteSettings = freshSiteSettings;
        hasUpdates = true;
      }

      if (hasUpdates) {
        console.log('✅ Polling update detected:', updates);
        callback(updates);
      }
    } catch (error) {
      console.error('❌ Polling error:', error);
    } finally {
      isPolling = false;
    }
  };

  // Initial poll after delay
  let isFirstPoll = true;
  const initialPoll = async () => {
    await pollForUpdates(isFirstPoll);
    isFirstPoll = false;
  };
  
  setTimeout(initialPoll, 5000);
  
  // Polling interval (fallback)
  const intervalId = setInterval(() => {
    if (!isPolling) {
      pollForUpdates(false);
    }
  }, POLL_INTERVAL);

  // Cleanup function
  return () => {
    wsCleanup();
    clearInterval(intervalId);
    isPolling = false;
    console.log('🛑 Stopped real-time sync');
  };
}

/**
 * Quick check for specific data types (used by individual pages)
 * Prevents duplicate polling and race conditions
 */
export async function checkForUpdates(dataType: 'projects' | 'blogPosts' | 'skills' | 'experiences' | 'achievements' | 'user') {
  // Map frontend names to backend API names
  const backendTypeMap: Record<string, string> = {
    'projects': 'projects',
    'blogPosts': 'blog-posts',
    'skills': 'skills',
    'experiences': 'experiences',
    'achievements': 'achievements',
    'user': 'user'
  };

  try {
    const backendType = backendTypeMap[dataType] || dataType;
    
    // Use backend API for direct, fast updates
    const freshData = await getDataFromBackend(backendType as any);

    if (!freshData) {
      return null; // No data available
    }

    // Always check if we've polled before - if not, this is initialization
    const hasPolled = hasInitialPolled.get(dataType) || false;
    if (hasDataChanged(dataType, freshData, !hasPolled)) {
      console.log(`🔄 ${dataType} updated from backend`);
      return freshData;
    }

    return null; // No changes
  } catch (error) {
    console.error(`❌ Error checking for ${dataType} updates:`, error);
    return null;
  }
}

