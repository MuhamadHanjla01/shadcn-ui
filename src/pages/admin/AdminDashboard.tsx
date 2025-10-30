import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  Clock,
  Star,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { dashboardService } from '@/lib/dashboard-service';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { DashboardStats, ContactMessage } from '@/types/admin';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/lib/notification-service';

const AdminDashboard = () => {
  const { auth } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalMessages: 0,
    totalBlogPosts: 0,
    totalVisitors: 0,
    recentActivity: []
  });
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [statsChanges, setStatsChanges] = useState({
    projectsChange: '',
    messagesChange: '',
    blogPostsChange: '',
    visitorsChange: ''
  });

  // Load dashboard data function
  const loadDashboardData = () => {
    const dashboardStats = dashboardService.getDashboardStats();
    const messages = dashboardService.getRecentMessages(3);
    const changes = dashboardService.getStatsChanges();
    
    setStats(dashboardStats);
    setRecentMessages(messages);
    setStatsChanges(changes);
  };

  // Load real data on component mount
  useEffect(() => {
    loadDashboardData();

    // Add welcome notification on first load
    const hasWelcomed = sessionStorage.getItem('admin_welcomed');
    if (!hasWelcomed) {
      const unreadMessages = dashboardService.getUnreadMessages();
      if (unreadMessages > 0) {
        notificationService.addNotification(
          'info',
          'Welcome back!',
          `You have ${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}`,
          '/admin/messages'
        );
      } else {
        notificationService.addNotification(
          'success',
          'Welcome back!',
          'Your portfolio is looking great. All caught up!',
          '/admin'
        );
      }
      sessionStorage.setItem('admin_welcomed', 'true');
    }

    // Listen for data updates
    const handleDataUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('portfolioDataUpdated', handleDataUpdate);
    
    // Also refresh every 30 seconds to catch any missed updates
    const intervalId = setInterval(loadDashboardData, 30000);

    return () => {
      window.removeEventListener('portfolioDataUpdated', handleDataUpdate);
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      change: statsChanges.projectsChange,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50'
    },
    {
      title: 'Contact Messages',
      value: stats.totalMessages,
      change: statsChanges.messagesChange,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/50'
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogPosts,
      change: statsChanges.blogPostsChange,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50'
    },
    {
      title: 'Total Visitors',
      value: stats.totalVisitors,
      change: statsChanges.visitorsChange,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return FileText;
      case 'message': return MessageSquare;
      case 'blog': return FileText;
      case 'visitor': return Eye;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-blue-600';
      case 'message': return 'text-green-600';
      case 'blog': return 'text-purple-600';
      case 'visitor': return 'text-orange-600';
      default: return 'text-slate-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {auth.user?.name}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={loadDashboardData}
          >
            <Star className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-700`}>
                    <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                      {activity.user && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            by {activity.user}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">Recent Messages</CardTitle>
              <CardDescription>Latest contact form submissions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/messages')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No messages yet</p>
                <p className="text-sm mt-1">Messages from your contact form will appear here</p>
              </div>
            ) : (
              recentMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    {message.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {message.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      {!message.isRead && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {message.email}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {message.message}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {formatTimeAgo(message.timestamp)}
                  </p>
                </div>
              </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to update your portfolio?</h3>
              <p className="text-blue-100">
                Add new projects, update your bio, or customize your theme to keep your portfolio fresh and engaging.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="secondary" 
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={() => navigate('/admin/projects')}
              >
                Add Project
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => navigate('/admin/home')}
              >
                Update Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;