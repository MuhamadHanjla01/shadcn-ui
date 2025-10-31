/**
 * Debug utility for data sync
 * Helps diagnose why users don't see updates
 */

import { DATA_FILES } from './data-sync';

export async function checkDataFilesStatus(): Promise<{
  [key: string]: { exists: boolean; url: string; error?: string }
}> {
  const status: { [key: string]: { exists: boolean; url: string; error?: string } } = {};
  
  const files = [
    { key: 'user', url: DATA_FILES.user },
    { key: 'skills', url: DATA_FILES.skills },
    { key: 'experiences', url: DATA_FILES.experiences },
    { key: 'achievements', url: DATA_FILES.achievements },
    { key: 'projects', url: DATA_FILES.projects },
    { key: 'blogPosts', url: DATA_FILES.blogPosts },
    { key: 'stats', url: DATA_FILES.stats },
    { key: 'siteSettings', url: DATA_FILES.siteSettings }
  ];

  for (const file of files) {
    try {
      const response = await fetch(file.url, {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      status[file.key] = {
        exists: response.ok,
        url: file.url,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error: any) {
      status[file.key] = {
        exists: false,
        url: file.url,
        error: error.message || 'Network error'
      };
    }
  }

  return status;
}

export function logDataSyncStatus() {
  checkDataFilesStatus().then(status => {
    console.group('📊 Data Sync Status');
    Object.entries(status).forEach(([key, info]) => {
      if (info.exists) {
        console.log(`✅ ${key}: Available at ${info.url}`);
      } else {
        console.warn(`❌ ${key}: Missing - ${info.error || 'File not found'}`);
        console.log(`   URL: ${info.url}`);
      }
    });
    console.groupEnd();
  });
}

