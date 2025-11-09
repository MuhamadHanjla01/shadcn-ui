import { Notification } from '@/types/admin';
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

// Generate notifications from system events (deprecated - now handled by WebSocket)
export const generateSystemNotifications = (): void => {
  // This is now handled by real-time WebSocket updates in Messages.tsx
  // Keeping function for backward compatibility
  console.log('ℹ️ generateSystemNotifications called - notifications are now handled via WebSocket');
};

// Auto-generate notifications when data changes (deprecated - now using WebSocket)
export const initNotificationListener = (): void => {
  // Notifications are now created in real-time via WebSocket in Messages.tsx
  // Keeping function for backward compatibility
  console.log('ℹ️ initNotificationListener called - notifications are now handled via WebSocket');
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

