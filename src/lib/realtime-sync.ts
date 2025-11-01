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
function hasDataChanged(key: string, currentData: any): boolean {
  if (!currentData) return false;
  
  const currentHash = getDataHash(currentData);
  const lastHash = lastDataVersions.get(key);
  
  if (lastHash === undefined) {
    // First load - store hash but don't trigger update
    lastDataVersions.set(key, currentHash);
    return false;
  }
  
  if (lastHash !== currentHash) {
    // Data changed - update hash and return true
    lastDataVersions.set(key, currentHash);
    console.log(`📊 Data changed detected for ${key}:`, {
      oldHash: lastHash,
      newHash: currentHash,
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

  const pollForUpdates = async () => {
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

      // Check for changes
      const updates: any = {};
      let hasUpdates = false;

      if (freshUserData && hasDataChanged('user', freshUserData)) {
        updates.user = freshUserData;
        hasUpdates = true;
        console.log('🔄 User data updated');
      }

      if (freshStats && hasDataChanged('stats', freshStats)) {
        updates.stats = freshStats;
        hasUpdates = true;
        console.log('🔄 Stats updated');
      }

      if (freshSiteSettings && hasDataChanged('siteSettings', freshSiteSettings)) {
        updates.siteSettings = freshSiteSettings;
        hasUpdates = true;
        console.log('🔄 Site settings updated');
      }

      // Only call callback if there are actual updates
      if (hasUpdates) {
        console.log('✅ Real-time update detected - refreshing UI');
        callback(updates);
      }
    } catch (error) {
      // Silently handle errors - don't spam console
      console.debug('Real-time sync check:', error);
    }
  };

  // Poll immediately, then set interval
  pollForUpdates();
  const intervalId = setInterval(pollForUpdates, POLL_INTERVAL);

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

    if (freshData && hasDataChanged(dataType, freshData)) {
      console.log(`🔄 ${dataType} updated`);
      return freshData;
    }

    return null; // No changes
  } catch (error) {
    return null;
  }
}

