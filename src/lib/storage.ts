import { User, Skill, Experience, Achievement, Project, BlogPost, Stat } from '@/types';

// Local storage utility for persisting admin changes
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

// Generic storage functions
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Store timestamp to track when data was last saved locally
    localStorage.setItem(`${key}_last_saved`, Date.now().toString());
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: { key, data } }));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

// Check if localStorage data was recently saved (within 5 minutes)
export const isRecentlySaved = (key: string, maxAgeMinutes: number = 5): boolean => {
  try {
    const lastSaved = localStorage.getItem(`${key}_last_saved`);
    if (!lastSaved) return false;
    const age = Date.now() - parseInt(lastSaved, 10);
    return age < maxAgeMinutes * 60 * 1000; // 5 minutes in milliseconds
  } catch {
    return false;
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
};

// User Data
export const saveUserData = (data: User) => {
  saveToStorage(STORAGE_KEYS.USER_DATA, data);
};

export const loadUserData = (defaultData: User) => {
  return loadFromStorage(STORAGE_KEYS.USER_DATA, defaultData);
};

// Skills
export const saveSkills = (data: Skill[]) => {
  saveToStorage(STORAGE_KEYS.SKILLS, data);
};

export const loadSkills = (defaultData: Skill[]) => {
  return loadFromStorage(STORAGE_KEYS.SKILLS, defaultData);
};

// Experiences
export const saveExperiences = (data: Experience[]) => {
  saveToStorage(STORAGE_KEYS.EXPERIENCES, data);
};

export const loadExperiences = (defaultData: Experience[]) => {
  return loadFromStorage(STORAGE_KEYS.EXPERIENCES, defaultData);
};

// Achievements
export const saveAchievements = (data: Achievement[]) => {
  saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, data);
};

export const loadAchievements = (defaultData: Achievement[]) => {
  return loadFromStorage(STORAGE_KEYS.ACHIEVEMENTS, defaultData);
};

// Projects
export const saveProjects = (data: Project[]) => {
  saveToStorage(STORAGE_KEYS.PROJECTS, data);
};

export const loadProjects = (defaultData: Project[]) => {
  return loadFromStorage(STORAGE_KEYS.PROJECTS, defaultData);
};

// Blog Posts
export const saveBlogPosts = (data: BlogPost[]) => {
  saveToStorage(STORAGE_KEYS.BLOG_POSTS, data);
};

export const loadBlogPosts = (defaultData: BlogPost[]) => {
  return loadFromStorage(STORAGE_KEYS.BLOG_POSTS, defaultData);
};

// Stats
export const saveStats = (data: Stat[]) => {
  saveToStorage(STORAGE_KEYS.STATS, data);
};

export const loadStats = (defaultData: Stat[]) => {
  return loadFromStorage(STORAGE_KEYS.STATS, defaultData);
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

export const saveMessages = (data: ContactMessage[]) => {
  saveToStorage(STORAGE_KEYS.MESSAGES, data);
};

export const loadMessages = (): ContactMessage[] => {
  return loadFromStorage(STORAGE_KEYS.MESSAGES, []);
};

export const addMessage = (message: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
  const messages = loadMessages();
  const newMessage: ContactMessage = {
    ...message,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    read: false
  };
  messages.unshift(newMessage);
  saveMessages(messages);
  return newMessage;
};

// Theme Settings
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  darkMode: boolean;
}

export const saveThemeSettings = (data: ThemeSettings) => {
  saveToStorage(STORAGE_KEYS.THEME_SETTINGS, data);
};

/**
 * Loads theme settings from public/theme.json (for GitHub Pages) or localStorage (for admin preview)
 * This allows the theme to be shared across all users on GitHub Pages
 */
export const loadThemeSettings = async (): Promise<ThemeSettings> => {
  const defaultSettings: ThemeSettings = {
    primaryColor: '#2563eb',
    secondaryColor: '#4f46e5',
    fontFamily: 'system-ui',
    darkMode: false
  };

  try {
    // Try to load from public/theme.json first (for GitHub Pages deployment)
    const response = await fetch('/theme.json', { 
      cache: 'no-store'
    });
    if (response.ok) {
      const publicTheme = await response.json();
      // Validate and merge with defaults
      return {
        primaryColor: publicTheme.primaryColor || defaultSettings.primaryColor,
        secondaryColor: publicTheme.secondaryColor || defaultSettings.secondaryColor,
        fontFamily: publicTheme.fontFamily || defaultSettings.fontFamily,
        darkMode: publicTheme.darkMode ?? defaultSettings.darkMode
      };
    }
    // 404 is expected if theme.json doesn't exist - silently fall through to localStorage
  } catch (error) {
    // If theme.json doesn't exist or fetch fails, fall back to localStorage
    // Silently handle - 404 errors are expected if theme.json doesn't exist
  }

  // Fall back to localStorage (for admin preview/development)
  return loadFromStorage(STORAGE_KEYS.THEME_SETTINGS, defaultSettings);
};

/**
 * Synchronous version for use in components that need immediate access
 * Will use localStorage as fallback until async load completes
 */
export const loadThemeSettingsSync = (): ThemeSettings => {
  return loadFromStorage(STORAGE_KEYS.THEME_SETTINGS, {
    primaryColor: '#2563eb',
    secondaryColor: '#4f46e5',
    fontFamily: 'system-ui',
    darkMode: false
  });
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

export const saveAnalytics = (data: AnalyticsData) => {
  saveToStorage(STORAGE_KEYS.ANALYTICS, data);
};

export const loadAnalytics = (): AnalyticsData => {
  return loadFromStorage(STORAGE_KEYS.ANALYTICS, {
    pageViews: { home: 0, about: 0, projects: 0, blog: 0, contact: 0 },
    projectViews: {},
    blogViews: {},
    totalVisits: 0,
    lastUpdated: new Date().toISOString()
  });
};

export const trackPageView = (page: string) => {
  const analytics = loadAnalytics();
  analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;
  analytics.totalVisits += 1;
  analytics.lastUpdated = new Date().toISOString();
  saveAnalytics(analytics);
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

export const saveSiteSettings = (data: SiteSettings) => {
  saveToStorage(STORAGE_KEYS.SITE_SETTINGS, data);
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: { key: STORAGE_KEYS.SITE_SETTINGS, data } }));
};

export const loadSiteSettings = (): SiteSettings => {
  return loadFromStorage(STORAGE_KEYS.SITE_SETTINGS, {
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
    footerEnabled: true, // Footer enabled by default
    contactEmail: 'contact@example.com',
    contactPhone: '',
    contactAddress: '',
    metaTitle: 'My Portfolio - Full Stack Developer',
    metaDescription: 'Professional portfolio showcasing my projects, skills, and experience in web development.',
    metaKeywords: 'portfolio, web developer, full stack, react, typescript',
    ogImage: '',
    twitterHandle: ''
  });
};

// Clear all stored data
export const clearAllStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
};