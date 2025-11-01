/**
 * Data Sync Service
 * 
 * This service handles syncing portfolio data between:
 * 1. Admin panel (localStorage) - for editing
 * 2. Shared JSON files (public/data/*.json) - for public access
 * 
 * When admin makes changes, they can export to JSON files.
 * When users visit the site, data loads from JSON files first,
 * then falls back to localStorage if files don't exist.
 */

import { User, Skill, Experience, Achievement, Project, BlogPost, Stat } from '@/types';
import { SiteSettings } from './storage';

// Use base path from vite config (for GitHub Pages subdirectory)
const BASE_PATH = import.meta.env.BASE_URL || '/shadcn-ui/';
const DATA_BASE_PATH = `${BASE_PATH.replace(/\/$/, '')}/data`;

// Get data file path with dynamic cache busting (called each time)
const getDataFilePath = (filename: string): string => {
  const timestamp = Date.now();
  return `${DATA_BASE_PATH}/${filename}?t=${timestamp}`;
};

// Data file paths - functions that return paths with fresh cache busting
export const DATA_FILES = {
  get user() { return getDataFilePath('user.json'); },
  get skills() { return getDataFilePath('skills.json'); },
  get experiences() { return getDataFilePath('experiences.json'); },
  get achievements() { return getDataFilePath('achievements.json'); },
  get projects() { return getDataFilePath('projects.json'); },
  get blogPosts() { return getDataFilePath('blog-posts.json'); },
  get stats() { return getDataFilePath('stats.json'); },
  get siteSettings() { return getDataFilePath('site-settings.json'); }
} as const;

/**
 * Loads data from shared JSON file, falls back to localStorage if file doesn't exist
 */
export async function loadDataFromFile<T>(
  filePath: string,
  localStorageKey: string,
  defaultValue: T,
  forceRefresh: boolean = false
): Promise<T> {
  try {
    // Try to fetch from JSON file first (for public users)
    // Use timestamp-based cache busting with additional force parameter if needed
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7); // Extra cache busting
    let urlWithCache = filePath.includes('?') 
      ? `${filePath}&t=${timestamp}&r=${random}` 
      : `${filePath}?t=${timestamp}&r=${random}`;
    
    // If force refresh is requested, add force parameter
    if (forceRefresh || filePath.includes('force=')) {
      urlWithCache = `${urlWithCache}&_=${Date.now()}`;
    }
    
    const response = await fetch(urlWithCache, {
      method: 'GET',
      cache: forceRefresh ? 'reload' : 'no-store', // Force reload if needed
      headers: {
        'Cache-Control': forceRefresh ? 'no-cache, no-store, must-revalidate, max-age=0, must-revalidate' : 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(forceRefresh && { 'X-Force-Refresh': 'true' })
      }
    });

    if (response.ok) {
      const data = await response.json();
      // Only update localStorage if data wasn't recently saved locally
      // This prevents overwriting fresh admin edits with potentially stale JSON data
      if (typeof window !== 'undefined') {
        // Check if this data was recently saved (within 5 minutes)
        const { isRecentlySaved } = await import('./storage');
        const recentlySaved = isRecentlySaved(localStorageKey, 5);
        
        if (!recentlySaved) {
          // Safe to update localStorage with JSON data
          localStorage.setItem(localStorageKey, JSON.stringify(data));
          console.log(`✅ Loaded ${filePath} from shared JSON file and updated localStorage`, {
            timestamp: new Date().toISOString(),
            forceRefresh: forceRefresh,
            dataPreview: typeof data === 'object' ? Object.keys(data).slice(0, 5) : 'N/A'
          });
        } else {
          // Data was recently saved - don't overwrite, use localStorage instead
          console.log(`📝 Skipping JSON update for ${filePath} - localStorage has recent saves`, {
            timestamp: new Date().toISOString()
          });
          const stored = localStorage.getItem(localStorageKey);
          if (stored) {
            try {
              return JSON.parse(stored);
            } catch (e) {
              // If localStorage parse fails, use JSON data
              localStorage.setItem(localStorageKey, JSON.stringify(data));
            }
          } else {
            // No localStorage but recently saved flag exists - use JSON data
            localStorage.setItem(localStorageKey, JSON.stringify(data));
          }
        }
      }
      console.log(`✅ Loaded ${filePath} from shared JSON file`, {
        timestamp: new Date().toISOString(),
        forceRefresh: forceRefresh,
        dataPreview: typeof data === 'object' ? Object.keys(data).slice(0, 5) : 'N/A'
      });
      return data;
    } else if (response.status === 404) {
      console.log(`📝 ${filePath} not found (404) - JSON files not created yet. Using localStorage fallback.`);
      console.log(`💡 Tip: Enable GitHub Auto-Sync in Settings to auto-publish changes!`);
    } else {
      console.log(`⚠️ ${filePath} returned ${response.status}, using localStorage fallback`);
    }
  } catch (error: any) {
    // File doesn't exist or network error - fall back to localStorage
    if (error.name !== 'TypeError') { // Ignore CORS/network errors in console spam
      console.log(`⚠️ Failed to load ${filePath}, using localStorage fallback:`, error.message);
    }
  }

  // Fallback to localStorage (for admin preview or when files don't exist)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
      }
    }
  }

  return defaultValue;
}

/**
 * Exports data to a downloadable JSON file
 * Admin can download and manually upload to public/data/ folder
 */
export function exportDataToFile<T>(data: T, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all portfolio data as a zip of JSON files
 * Admin can download, extract, and upload to public/data/ folder
 */
export function exportAllData(data: {
  user: User;
  skills: Skill[];
  experiences: Experience[];
  achievements: Achievement[];
  projects: Project[];
  blogPosts: BlogPost[];
  stats: Stat[];
  siteSettings: SiteSettings;
}): void {
  // Export each file individually
  exportDataToFile(data.user, 'user.json');
  setTimeout(() => exportDataToFile(data.skills, 'skills.json'), 100);
  setTimeout(() => exportDataToFile(data.experiences, 'experiences.json'), 200);
  setTimeout(() => exportDataToFile(data.achievements, 'achievements.json'), 300);
  setTimeout(() => exportDataToFile(data.projects, 'projects.json'), 400);
  setTimeout(() => exportDataToFile(data.blogPosts, 'blog-posts.json'), 500);
  setTimeout(() => exportDataToFile(data.stats, 'stats.json'), 600);
  setTimeout(() => exportDataToFile(data.siteSettings, 'site-settings.json'), 700);
}

/**
 * Checks if data files exist on the server
 */
export async function checkDataFilesExist(): Promise<{
  user: boolean;
  skills: boolean;
  experiences: boolean;
  achievements: boolean;
  projects: boolean;
  blogPosts: boolean;
  stats: boolean;
  siteSettings: boolean;
}> {
  const checks = await Promise.all([
    fetch(DATA_FILES.user, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
    fetch(DATA_FILES.skills, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
    fetch(DATA_FILES.experiences, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
    fetch(DATA_FILES.achievements, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
    fetch(DATA_FILES.projects, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
    fetch(DATA_FILES.blogPosts, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
    fetch(DATA_FILES.stats, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
    fetch(DATA_FILES.siteSettings, { method: 'HEAD' }).then(r => r.ok).catch(() => false)
  ]);

  return {
    user: checks[0],
    skills: checks[1],
    experiences: checks[2],
    achievements: checks[3],
    projects: checks[4],
    blogPosts: checks[5],
    stats: checks[6],
    siteSettings: checks[7]
  };
}

/**
 * Generates instructions for uploading exported files to GitHub
 */
export function getUploadInstructions(): string {
  return `
To make your changes visible to all users:

1. After exporting data files, upload them to:
   public/data/ folder in your GitHub repository

2. File structure:
   public/
     data/
       user.json
       skills.json
       experiences.json
       achievements.json
       projects.json
       blog-posts.json
       stats.json
       site-settings.json

3. Commit and push to GitHub:
   git add public/data/*.json
   git commit -m "Update portfolio data"
   git push origin main

4. GitHub Actions will rebuild and deploy automatically.
   Users will see updates within 1-2 minutes.

Note: Users need to hard refresh (Ctrl+Shift+R or Cmd+Shift+R) 
to see updates immediately, or wait for browser cache to expire.
  `.trim();
}

