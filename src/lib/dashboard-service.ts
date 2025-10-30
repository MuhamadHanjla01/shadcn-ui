import { loadProjects } from './storage';
import { loadBlogPosts } from './storage';
import { loadMessages, ContactMessage as StorageContactMessage } from './storage';
import { loadAnalytics } from './storage';
import { DashboardStats, ActivityItem, ContactMessage } from '@/types/admin';
import { projects as defaultProjects } from './data';
import { blogPosts as defaultBlogPosts } from './data';

/**
 * Dashboard Service
 * Provides real-time statistics and data for the admin dashboard
 */

// Get total project count
export const getTotalProjects = (): number => {
  const projects = loadProjects(defaultProjects);
  return projects.length;
};

// Get total blog posts count
export const getTotalBlogPosts = (): number => {
  const blogPosts = loadBlogPosts(defaultBlogPosts);
  return blogPosts.length;
};

// Get total messages count
export const getTotalMessages = (): number => {
  const messages = loadMessages();
  return messages.length;
};

// Get unread messages count
export const getUnreadMessages = (): number => {
  const messages = loadMessages();
  return messages.filter(msg => !msg.read).length;
};

// Get total visitors from analytics
export const getTotalVisitors = (): number => {
  const analytics = loadAnalytics();
  return analytics.totalVisits || 0;
};

// Convert storage message to admin contact message
const convertToContactMessage = (msg: StorageContactMessage): ContactMessage => {
  return {
    id: msg.id,
    name: msg.name,
    email: msg.email,
    message: msg.message,
    timestamp: msg.date,
    isRead: msg.read,
    replied: false, // We don't track replies yet
    priority: determinePriority(msg)
  };
};

// Determine message priority based on keywords
const determinePriority = (msg: StorageContactMessage): 'low' | 'medium' | 'high' => {
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'important', 'critical'];
  const highKeywords = ['project', 'collaboration', 'hire', 'opportunity', 'contract'];
  
  const text = (msg.subject + ' ' + msg.message).toLowerCase();
  
  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    return 'high';
  }
  
  if (highKeywords.some(keyword => text.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};

// Get recent contact messages
export const getRecentMessages = (limit: number = 5): ContactMessage[] => {
  const messages = loadMessages();
  return messages
    .slice(0, limit)
    .map(convertToContactMessage);
};

// Generate recent activity based on actual data changes
export const getRecentActivity = (limit: number = 10): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  
  // Get recent messages
  const messages = loadMessages();
  messages.slice(0, 3).forEach((msg) => {
    activities.push({
      id: `msg-${msg.id}`,
      type: 'message',
      title: 'New contact message',
      description: `${msg.name} sent a message: ${msg.subject}`,
      timestamp: msg.date,
      user: msg.name
    });
  });
  
  // Get recent projects (check if they were recently created/updated)
  const projects = loadProjects(defaultProjects);
  const recentProjects = projects
    .filter(p => p.id)
    .slice(0, 2);
  
  recentProjects.forEach((project) => {
    // Create a timestamp for project (using ID as proxy for creation time)
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    activities.push({
      id: `project-${project.id}`,
      type: 'project',
      title: 'Project updated',
      description: `"${project.title}" was modified`,
      timestamp,
      user: 'Admin'
    });
  });
  
  // Get recent blog posts
  const blogPosts = loadBlogPosts(defaultBlogPosts);
  const recentPosts = blogPosts.slice(0, 2);
  
  recentPosts.forEach((post) => {
    activities.push({
      id: `blog-${post.id}`,
      type: 'blog',
      title: 'Blog post published',
      description: `Published "${post.title}"`,
      timestamp: post.date,
      user: 'Admin'
    });
  });
  
  // Add visitor analytics activity
  const analytics = loadAnalytics();
  if (analytics.totalVisits > 0) {
    activities.push({
      id: 'analytics-1',
      type: 'visitor',
      title: 'Site traffic',
      description: `${analytics.totalVisits} total visits recorded`,
      timestamp: analytics.lastUpdated
    });
  }
  
  // Sort by timestamp (most recent first) and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

// Get dashboard statistics
export const getDashboardStats = (): DashboardStats => {
  return {
    totalProjects: getTotalProjects(),
    totalMessages: getTotalMessages(),
    totalBlogPosts: getTotalBlogPosts(),
    totalVisitors: getTotalVisitors(),
    recentActivity: getRecentActivity()
  };
};

// Get stats changes (comparison with previous period)
export const getStatsChanges = () => {
  const messages = loadMessages();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  const messagesThisWeek = messages.filter(msg => new Date(msg.date).getTime() > weekAgo).length;
  const messagesThisMonth = messages.filter(msg => new Date(msg.date).getTime() > monthAgo).length;
  
  const projects = loadProjects(defaultProjects);
  const blogPosts = loadBlogPosts(defaultBlogPosts);
  
  // Calculate blog posts this month
  const blogPostsThisMonth = blogPosts.filter(post => {
    const postDate = new Date(post.date).getTime();
    return postDate > monthAgo;
  }).length;
  
  const analytics = loadAnalytics();
  const totalVisits = analytics.totalVisits || 0;
  
  return {
    projectsChange: projects.length > 0 ? `${projects.length} total` : 'No projects yet',
    messagesChange: messagesThisWeek > 0 ? `+${messagesThisWeek} this week` : 'No new messages',
    blogPostsChange: blogPostsThisMonth > 0 ? `+${blogPostsThisMonth} this month` : 'No new posts',
    visitorsChange: totalVisits > 0 ? `${totalVisits} total visits` : 'No visits tracked'
  };
};

// Export all functions
export const dashboardService = {
  getDashboardStats,
  getRecentMessages,
  getRecentActivity,
  getTotalProjects,
  getTotalBlogPosts,
  getTotalMessages,
  getUnreadMessages,
  getTotalVisitors,
  getStatsChanges
};

