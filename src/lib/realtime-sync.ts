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
 * Gets a hash/version of data for change detection
 */
function getDataVersion(data: any): string {
  return JSON.stringify(data).substring(0, 100) + '...' + Date.now().toString().slice(-6);
}

/**
 * Checks if data has changed by comparing versions
 */
function hasDataChanged(key: string, currentData: any): boolean {
  const currentVersion = getDataVersion(currentData);
  const lastVersion = lastDataVersions.get(key);
  
  if (!lastVersion || lastVersion !== currentVersion) {
    lastDataVersions.set(key, currentVersion);
    return lastVersion !== undefined; // true if changed (not first load)
  }
  
  return false;
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
      // Check if user data changed
      const freshUserData = await loadDataFromFile(
        DATA_FILES.user,
        'portfolio_user_data',
        null,
        false // Don't force refresh to avoid unnecessary network calls
      );
      
      const freshStats = await loadDataFromFile(
        DATA_FILES.stats,
        'portfolio_stats',
        null,
        false
      );
      
      const freshSiteSettings = await loadDataFromFile(
        DATA_FILES.siteSettings,
        'portfolio_site_settings',
        null,
        false
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
      false
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

