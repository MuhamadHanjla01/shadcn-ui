import { User, Skill, Experience, Achievement, Project, BlogPost, Stat } from '@/types';
import { getDataFromBackend } from './backend-api';

// Legacy storage keys - kept for reference only (NOT USED)
const STORAGE_KEYS = {
  USER_DATA: 'portfolio_user_data',
  SKILLS: 'portfolio_skills',
  EXPERIENCES: 'portfolio_experiences',
  ACHIEVEMENTS: 'portfolio_achievements',
  PROJECTS: 'portfolio_projects',
  BLOG_POSTS: 'portfolio_blog_posts',
  MESSAGES: 'portfolio_messages',
  THEME_SETTINGS: 'portfolio_theme_settings',
  ANALYTICS: 'portfolio_analytics',
  SITE_SETTINGS: 'portfolio_site_settings',
  STATS: 'portfolio_stats'
} as const;

// DEPRECATED: All save/load functions now use backend API only
// These are kept for backward compatibility but do nothing
export const saveToStorage = <T>(key: string, data: T): void => {
  console.warn('saveToStorage is deprecated - all data now saved to backend');
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: { key, data } }));
};

export const isRecentlySaved = (key: string, maxAgeMinutes: number = 5): boolean => {
  // Always return false - no localStorage
  return false;
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  console.warn('loadFromStorage is deprecated - use backend API instead');
  return defaultValue;
};

// User Data - DEPRECATED (use backend-api.ts instead)
export const saveUserData = (data: User) => {
  console.warn('saveUserData is deprecated - use saveDataToBackend instead');
};

export const loadUserData = (defaultData: User) => {
  console.warn('loadUserData is deprecated - use getDataFromBackend instead');
  return defaultData;
};

// Skills - DEPRECATED
export const saveSkills = (data: Skill[]) => {
  console.warn('saveSkills is deprecated');
};

export const loadSkills = (defaultData: Skill[]) => {
  console.warn('loadSkills is deprecated');
  return defaultData;
};

// Experiences - DEPRECATED
export const saveExperiences = (data: Experience[]) => {
  console.warn('saveExperiences is deprecated');
};

export const loadExperiences = (defaultData: Experience[]) => {
  console.warn('loadExperiences is deprecated');
  return defaultData;
};

// Achievements - DEPRECATED
export const saveAchievements = (data: Achievement[]) => {
  console.warn('saveAchievements is deprecated');
};

export const loadAchievements = (defaultData: Achievement[]) => {
  console.warn('loadAchievements is deprecated');
  return defaultData;
};

// Projects - DEPRECATED
export const saveProjects = (data: Project[]) => {
  console.warn('saveProjects is deprecated');
};

export const loadProjects = (defaultData: Project[]) => {
  console.warn('loadProjects is deprecated');
  return defaultData;
};

// Blog Posts - DEPRECATED
export const saveBlogPosts = (data: BlogPost[]) => {
  console.warn('saveBlogPosts is deprecated');
};

export const loadBlogPosts = (defaultData: BlogPost[]) => {
  console.warn('loadBlogPosts is deprecated');
  return defaultData;
};

// Stats - DEPRECATED
export const saveStats = (data: Stat[]) => {
  console.warn('saveStats is deprecated');
};

export const loadStats = (defaultData: Stat[]) => {
  console.warn('loadStats is deprecated');
  return defaultData;
};

// Messages/Contact Forms
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

// Messages - DEPRECATED (messages now handled by backend)
export const saveMessages = (data: ContactMessage[]) => {
  console.warn('saveMessages is deprecated');
};

export const loadMessages = (): ContactMessage[] => {
  console.warn('loadMessages is deprecated - messages are on backend');
  return [];
};

export const addMessage = (message: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
  console.warn('addMessage is deprecated - use POST /api/contact instead');
  return {
    ...message,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    read: false
  };
};

// Theme Settings
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  darkMode: boolean;
}

// Theme Settings - DEPRECATED
export const saveThemeSettings = (data: ThemeSettings) => {
  console.warn('saveThemeSettings is deprecated');
};

/**
 * Loads theme settings - returns defaults only
 * Theme functionality removed
 */
export const loadThemeSettings = async (): Promise<ThemeSettings> => {
  const defaultSettings: ThemeSettings = {
    primaryColor: '#2563eb',
    secondaryColor: '#4f46e5',
    fontFamily: 'system-ui',
    darkMode: false
  };
  return defaultSettings;
};

/**
 * Synchronous version - returns defaults only
 */
export const loadThemeSettingsSync = (): ThemeSettings => {
  return {
    primaryColor: '#2563eb',
    secondaryColor: '#4f46e5',
    fontFamily: 'system-ui',
    darkMode: false
  };
};

/**
 * Exports theme settings to a downloadable JSON file
 * This file can be uploaded to public/theme.json in the GitHub repo
 */
export const exportThemeSettings = (settings: ThemeSettings): void => {
  const jsonString = JSON.stringify(settings, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'theme.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Analytics
export interface AnalyticsData {
  pageViews: { [key: string]: number };
  projectViews: { [key: string]: number };
  blogViews: { [key: string]: number };
  totalVisits: number;
  lastUpdated: string;
}

// Analytics - DEPRECATED (not implemented on backend)
export const saveAnalytics = (data: AnalyticsData) => {
  console.warn('saveAnalytics is deprecated');
};

export const loadAnalytics = (): AnalyticsData => {
  return {
    pageViews: { home: 0, about: 0, projects: 0, blog: 0, contact: 0 },
    projectViews: {},
    blogViews: {},
    totalVisits: 0,
    lastUpdated: new Date().toISOString()
  };
};

export const trackPageView = (page: string) => {
  // Analytics tracking disabled (was localStorage-based)
  console.log(`Page view: ${page}`);
};

// Site Settings
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  seoKeywords: string[];
  googleAnalyticsId: string;
  maintenanceMode: boolean;
  logo?: string; // data URL or http(s) URL
  logoMode?: 'image' | 'text';
  logoText?: string; // shown in logo square when logoMode is 'text'
  heroLayout?: 'left' | 'center' | 'right';
  socialVisibility?: {
    github: boolean;
    linkedin: boolean;
    twitter: boolean;
    email: boolean;
  };
  favicon?: string; // data URL or http(s) URL for favicon
  footerText?: string; // Copyright text in footer
  footerLinks?: Array<{ label: string; url: string }>;
  footerEnabled?: boolean; // Enable/disable footer display
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  metaTitle?: string; // Page title shown in browser tab
  metaDescription?: string; // Meta description for SEO
  metaKeywords?: string; // Meta keywords for SEO
  ogImage?: string; // Open Graph image for social sharing
  twitterHandle?: string; // Twitter handle for cards
}

// Site Settings - DEPRECATED
export const saveSiteSettings = (data: SiteSettings) => {
  console.warn('saveSiteSettings is deprecated');
};

export const loadSiteSettings = (): SiteSettings => {
  console.warn('loadSiteSettings is deprecated - use backend API');
  return {
    siteName: 'Portfolio',
    siteDescription: 'Personal portfolio website',
    seoKeywords: ['portfolio', 'developer', 'web development'],
    googleAnalyticsId: '',
    maintenanceMode: false,
    logo: '',
    logoMode: 'text',
    logoText: 'MH',
    heroLayout: 'center',
    socialVisibility: {
      github: true,
      linkedin: true,
      twitter: true,
      email: true
    },
    favicon: '',
    footerText: '© 2024 All rights reserved.',
    footerLinks: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' }
    ],
    footerEnabled: true,
    contactEmail: 'contact@example.com',
    contactPhone: '',
    contactAddress: '',
    metaTitle: 'My Portfolio - Full Stack Developer',
    metaDescription: 'Professional portfolio showcasing my projects, skills, and experience in web development.',
    metaKeywords: 'portfolio, web developer, full stack, react, typescript',
    ogImage: '',
    twitterHandle: ''
  };
};

// Clear all stored data - DEPRECATED
export const clearAllStorage = () => {
  console.warn('clearAllStorage is deprecated - no localStorage used');
  window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
};