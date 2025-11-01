/**
 * Real-time Sync Service for User Devices
 * 
 * This service automatically polls JSON files for updates
 * so users see changes without manual refresh
 */

import { DATA_FILES } from './data-sync';
import { loadDataFromFile } from './data-sync';

// Polling interval in milliseconds (30 seconds)
const POLL_INTERVAL = 30000;

// Track last known data versions to detect changes
const lastDataVersions: Map<string, string> = new Map();

// Track if we've done an initial poll (to avoid false positives)
const hasInitialPolled: Map<string, boolean> = new Map();

/**
 * Initialize hash from initial data load (called from page components)
 * This ensures we have a baseline to compare against when polling starts
 */
export function initializeDataHash(key: string, data: any): void {
  if (!data) return;
  const hash = getDataHash(data);
  if (!lastDataVersions.has(key)) {
    lastDataVersions.set(key, hash);
    console.log(`📋 Initialized hash for ${key} from page load:`, hash.substring(0, 10) + '...');
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
 * Starts automatic polling for data updates
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
}) => void) {
  // Only poll if not in admin panel
  if (window.location.pathname.includes('/admin')) {
    console.log('🛑 Skipping real-time sync - admin panel detected');
    return () => {}; // Return no-op cleanup
  }

  console.log('🔄 Starting real-time sync - polling every 30 seconds for updates');

  const pollForUpdates = async (isInitialPoll: boolean = false) => {
    try {
      console.log('🔍 Polling for updates...', new Date().toLocaleTimeString());
      
      // Force refresh to bypass cache and get latest data from server
      const freshUserData = await loadDataFromFile(
        DATA_FILES.user,
        'portfolio_user_data',
        null,
        true // Force refresh to get latest from server
      );
      
      const freshStats = await loadDataFromFile(
        DATA_FILES.stats,
        'portfolio_stats',
        null,
        true // Force refresh
      );
      
      const freshSiteSettings = await loadDataFromFile(
        DATA_FILES.siteSettings,
        'portfolio_site_settings',
        null,
        true // Force refresh
      );

      // Debug: Log what we fetched
      console.log('📥 Fetched data:', {
        user: freshUserData ? `✅ ${freshUserData.name || 'Unknown'}` : '❌',
        stats: freshStats ? `✅ ${freshStats.length} items` : '❌',
        settings: freshSiteSettings ? '✅' : '❌'
      });

      // Check for changes
      const updates: any = {};
      let hasUpdates = false;

      if (freshUserData) {
        const userChanged = hasDataChanged('user', freshUserData, isInitialPoll);
        console.log('🔍 User data check:', userChanged ? '✅ CHANGED' : (isInitialPoll ? '📋 Initial load' : '⏸️ No change'));
        if (userChanged) {
          updates.user = freshUserData;
          hasUpdates = true;
          console.log('🔄 User data updated:', {
            name: freshUserData.name,
            title: freshUserData.title
          });
        }
      }

      if (freshStats) {
        const statsChanged = hasDataChanged('stats', freshStats, isInitialPoll);
        console.log('🔍 Stats check:', statsChanged ? '✅ CHANGED' : (isInitialPoll ? '📋 Initial load' : '⏸️ No change'));
        if (statsChanged) {
          updates.stats = freshStats;
          hasUpdates = true;
          console.log('🔄 Stats updated:', { count: freshStats.length });
        }
      }

      if (freshSiteSettings) {
        const settingsChanged = hasDataChanged('siteSettings', freshSiteSettings, isInitialPoll);
        console.log('🔍 Site settings check:', settingsChanged ? '✅ CHANGED' : (isInitialPoll ? '📋 Initial load' : '⏸️ No change'));
        if (settingsChanged) {
          updates.siteSettings = freshSiteSettings;
          hasUpdates = true;
          console.log('🔄 Site settings updated');
        }
      }

      // Only call callback if there are actual updates
      if (hasUpdates) {
        console.log('✅✅✅ Real-time update detected - refreshing UI', updates);
        callback(updates);
      } else {
        console.log('⏸️ No updates detected this poll');
      }
    } catch (error) {
      // Log errors for debugging
      console.error('❌ Real-time sync error:', error);
    }
  };

  // Wait a bit before first poll to let initial page load complete
  // Then poll immediately, then set interval
  let isFirstPoll = true;
  const initialPoll = async () => {
    console.log('⏰ Starting initial poll after page load...');
    await pollForUpdates(isFirstPoll);
    isFirstPoll = false;
  };
  
  setTimeout(initialPoll, 5000); // Wait 5 seconds after page load
  
  const intervalId = setInterval(() => pollForUpdates(false), POLL_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('🛑 Stopped real-time sync');
  };
}

/**
 * Quick check for specific data types (used by individual pages)
 */
export async function checkForUpdates(dataType: 'projects' | 'blogPosts' | 'skills' | 'experiences' | 'achievements') {
  const fileMap = {
    projects: DATA_FILES.projects,
    blogPosts: DATA_FILES.blogPosts,
    skills: DATA_FILES.skills,
    experiences: DATA_FILES.experiences,
    achievements: DATA_FILES.achievements
  };

  const keyMap = {
    projects: 'portfolio_projects',
    blogPosts: 'portfolio_blog_posts',
    skills: 'portfolio_skills',
    experiences: 'portfolio_experiences',
    achievements: 'portfolio_achievements'
  };

  try {
    const freshData = await loadDataFromFile(
      fileMap[dataType],
      keyMap[dataType],
      null,
      true // Force refresh to get latest from server
    );

    // Always check if we've polled before - if not, this is initialization
    const hasPolled = hasInitialPolled.get(dataType) || false;
    if (freshData && hasDataChanged(dataType, freshData, !hasPolled)) {
      console.log(`🔄 ${dataType} updated`);
      return freshData;
    }

    return null; // No changes
  } catch (error) {
    return null;
  }
}

