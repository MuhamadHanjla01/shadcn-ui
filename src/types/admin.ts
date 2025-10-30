export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalMessages: number;
  totalBlogPosts: number;
  totalVisitors: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'project' | 'message' | 'blog' | 'visitor';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  replied: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video';
  size: number;
  folder: string;
  uploadedAt: string;
  optimized: boolean;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'custom';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  sectionOrder: string[];
  visibleSections: Record<string, boolean>;
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  favicon: string;
  googleAnalyticsId?: string;
}

export interface SystemSettings {
  seo: SEOSettings;
  theme: ThemeSettings;
  emailConfig: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
  };
}

export interface AnalyticsData {
  pageViews: { date: string; views: number }[];
  topPages: { page: string; views: number }[];
  visitors: { date: string; visitors: number }[];
  deviceTypes: { device: string; percentage: number }[];
  referrers: { source: string; visits: number }[];
}

export interface Notification {
  id: string;
  type: 'message' | 'update' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}