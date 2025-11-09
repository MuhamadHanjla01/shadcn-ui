/**
 * Data Sync Service - DEPRECATED
 * 
 * All data now comes from backend API only.
 * JSON file loading is no longer used.
 */

import { User, Skill, Experience, Achievement, Project, BlogPost, Stat } from '@/types';
import { SiteSettings } from './storage';

// DEPRECATED - kept for backward compatibility
const BASE_PATH = import.meta.env.BASE_URL || '/shadcn-ui/';
const DATA_BASE_PATH = `${BASE_PATH.replace(/\/$/, '')}/data`;

const getDataFilePath = (filename: string): string => {
  const timestamp = Date.now();
  return `${DATA_BASE_PATH}/${filename}?t=${timestamp}`;
};

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
 * DEPRECATED - Use getDataFromBackend() instead
 */
export async function loadDataFromFile<T>(
  filePath: string,
  localStorageKey: string,
  defaultValue: T,
  forceRefresh: boolean = false
): Promise<T> {
  console.warn('loadDataFromFile is deprecated - use getDataFromBackend() instead');
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

