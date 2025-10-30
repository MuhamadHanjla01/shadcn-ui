import { Notification } from '@/types/admin';
import { loadMessages } from './storage';
import { dashboardService } from './dashboard-service';

const STORAGE_KEY = 'admin_notifications';

/**
 * Notification Service
 * Manages admin panel notifications
 */

// Load notifications from localStorage
export const loadNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
};

// Save notifications to localStorage
export const saveNotifications = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

// Add a new notification
export const addNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  actionUrl?: string
): Notification => {
  const notifications = loadNotifications();
  
  const newNotification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl
  };
  
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50);
  saveNotifications(trimmed);
  
  return newNotification;
};

// Mark notification as read
export const markAsRead = (id: string): void => {
  const notifications = loadNotifications();
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(updated);
};

// Mark all notifications as read
export const markAllAsRead = (): void => {
  const notifications = loadNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
};

// Delete notification
export const deleteNotification = (id: string): void => {
  const notifications = loadNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  saveNotifications(filtered);
};

// Clear all notifications
export const clearAllNotifications = (): void => {
  saveNotifications([]);
};

// Get unread count
export const getUnreadCount = (): number => {
  const notifications = loadNotifications();
  return notifications.filter(n => !n.read).length;
};

// Generate notifications from system events
export const generateSystemNotifications = (): void => {
  const notifications = loadNotifications();
  const latestNotificationTime = notifications[0]?.timestamp || new Date(0).toISOString();
  
  // Check for new unread messages
  const messages = loadMessages();
  const newMessages = messages.filter(
    msg => !msg.read && new Date(msg.date) > new Date(latestNotificationTime)
  );
  
  newMessages.forEach(msg => {
    addNotification(
      'message',
      'New Contact Message',
      `${msg.name} sent you a message: "${msg.subject}"`,
      '/admin/messages'
    );
  });
};

// Auto-generate notifications when data changes
export const initNotificationListener = (): void => {
  // Listen for new messages
  window.addEventListener('portfolioDataUpdated', (event: any) => {
    const detail = event.detail;
    
    if (detail?.key === 'portfolio_messages') {
      const messages = loadMessages();
      const unreadMessages = messages.filter(msg => !msg.read);
      
      if (unreadMessages.length > 0) {
        const latest = unreadMessages[0];
        addNotification(
          'message',
          'New Contact Message',
          `${latest.name}: ${latest.subject}`,
          '/admin/messages'
        );
      }
    }
    
    if (detail?.key === 'portfolio_projects') {
      const stats = dashboardService.getDashboardStats();
      addNotification(
        'update',
        'Projects Updated',
        `You now have ${stats.totalProjects} projects in your portfolio`,
        '/admin/projects'
      );
    }
    
    if (detail?.key === 'portfolio_blog_posts') {
      const stats = dashboardService.getDashboardStats();
      addNotification(
        'update',
        'Blog Posts Updated',
        `You now have ${stats.totalBlogPosts} blog posts`,
        '/admin/blog'
      );
    }
  });
};

// Export notification service
export const notificationService = {
  loadNotifications,
  saveNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  generateSystemNotifications,
  initNotificationListener
};

