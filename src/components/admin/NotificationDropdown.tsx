import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  CheckCheck,
  X
} from 'lucide-react';
import { Notification } from '@/types/admin';
import { notificationService } from '@/lib/notification-service';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();

    // Listen for notification updates
    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notificationsUpdated', handleUpdate);
    
    // Refresh every 10 seconds
    const interval = setInterval(loadNotifications, 10000);

    return () => {
      window.removeEventListener('notificationsUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadNotifications = () => {
    const notifs = notificationService.loadNotifications();
    setNotifications(notifs);
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    notificationService.deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    loadNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'update':
        return <RefreshCw className="h-4 w-4 text-purple-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-6 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  asChild
                  className={`p-0 ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                >
                  <div className="relative">
                    {notification.actionUrl ? (
                      <Link
                        to={notification.actionUrl}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="block w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded transition-colors"
                      >
                        <NotificationContent
                          notification={notification}
                          formatTimeAgo={formatTimeAgo}
                          getNotificationIcon={getNotificationIcon}
                        />
                      </Link>
                    ) : (
                      <div
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="block w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded transition-colors"
                      >
                        <NotificationContent
                          notification={notification}
                          formatTimeAgo={formatTimeAgo}
                          getNotificationIcon={getNotificationIcon}
                        />
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link to="/admin/messages">
                <Button variant="ghost" size="sm" className="w-full">
                  View All Messages
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NotificationContent = ({
  notification,
  formatTimeAgo,
  getNotificationIcon
}: {
  notification: Notification;
  formatTimeAgo: (timestamp: string) => string;
  getNotificationIcon: (type: Notification['type']) => JSX.Element;
}) => (
  <div className="flex items-start space-x-3 group">
    <div className="flex-shrink-0 mt-1">
      {getNotificationIcon(notification.type)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {notification.title}
        </p>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-blue-600 ml-2 flex-shrink-0"></div>
        )}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
        {notification.message}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
        {formatTimeAgo(notification.timestamp)}
      </p>
    </div>
  </div>
);

export default NotificationDropdown;

