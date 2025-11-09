import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  MessageSquare, 
  Image, 
  BarChart3, 
  Palette, 
  Home,
  Menu,
  LogOut,
  Search,
  User,
  Shield
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Input } from '@/components/ui/input';
import NotificationDropdown from './NotificationDropdown';
import { addNotification } from '@/lib/notification-service';
import { getWebSocketUrl, getDataFromBackend } from '@/lib/backend-api';
import { ContactMessage, SiteSettings } from '@/lib/storage';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const { auth, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesCountRef = useRef<number>(0);

  // Load site settings for logo and favicon
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getDataFromBackend('site-settings');
        if (settings) {
          setSiteSettings(settings as SiteSettings);
          
          // Update document title for admin panel
          const siteName = settings.siteName || 'Portfolio';
          document.title = `Admin Panel - ${siteName}`;
          
          // Update favicon to match frontend
          const updateFavicon = (faviconUrl: string) => {
            const existingIcon = document.querySelector("link[rel*='icon']");
            if (existingIcon) {
              existingIcon.setAttribute('href', faviconUrl);
            } else {
              const newIcon = document.createElement('link');
              newIcon.rel = 'icon';
              newIcon.type = 'image/x-icon';
              newIcon.href = faviconUrl;
              document.head.appendChild(newIcon);
            }
          };
          
          // Generate text favicon if needed
          const generateTextFavicon = (text: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (!ctx) return '';
            
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 64, 64);
            gradient.addColorStop(0, '#2563eb'); // blue-600
            gradient.addColorStop(1, '#4f46e5'); // indigo-600
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            
            // Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text.slice(0, 3), 32, 32);
            
            return canvas.toDataURL('image/png');
          };
          
          // Apply favicon
          if (settings.logoMode === 'text' && settings.logoText) {
            const faviconUrl = generateTextFavicon(settings.logoText);
            updateFavicon(faviconUrl);
          } else if (settings.logo) {
            updateFavicon(settings.logo);
          }
        }
      } catch (error) {
        console.error('Error loading site settings for admin:', error);
      }
    };
    loadSettings();
    
    // Listen for settings updates
    const onUpdate = () => loadSettings();
    window.addEventListener('portfolioDataUpdated', onUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', onUpdate);
  }, []);

  // Listen for new messages via WebSocket and create notifications
  useEffect(() => {
    const wsUrl = getWebSocketUrl();
    console.log('🔔 Admin: Setting up WebSocket for notifications...');
    
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ Admin: Notification WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Listen for messages updates
          if (message.type === 'update' && message.dataType === 'messages') {
            console.log('📨 Admin: Messages update received via WebSocket');
            
            if (message.data && Array.isArray(message.data)) {
              const messages = message.data as ContactMessage[];
              const currentCount = messages.length;
              const previousCount = messagesCountRef.current;
              
              // If there are more messages than before, create notification
              if (previousCount > 0 && currentCount > previousCount) {
                const latestMessage = messages[0]; // Messages are sorted newest first
                if (latestMessage && !latestMessage.read) {
                  addNotification(
                    'message',
                    'New Contact Message',
                    `${latestMessage.name}: ${latestMessage.message.substring(0, 50)}${latestMessage.message.length > 50 ? '...' : ''}`,
                    '/admin/messages'
                  );
                  console.log('🔔 Notification created for new message from:', latestMessage.name);
                }
              }
              
              // Update the count reference
              messagesCountRef.current = currentCount;
            }
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ Notification WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('🔌 Notification WebSocket disconnected');
      };
    } catch (error) {
      console.error('❌ Failed to create notification WebSocket:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Home Editor', href: '/admin/home', icon: Home },
    { name: 'About Editor', href: '/admin/about', icon: Users },
    { name: 'Projects', href: '/admin/projects', icon: FileText },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Media Library', href: '/admin/media', icon: Image },
    { name: 'Theme Settings', href: '/admin/theme', icon: Palette },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo - Use frontend logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <Link to="/admin" className="flex items-center space-x-2">
          {siteSettings?.logoMode === 'image' && siteSettings?.logo ? (
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={siteSettings.logo} alt="Logo" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {siteSettings?.logoText?.slice(0, 3) || 'AC'}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              {siteSettings?.siteName || 'Admin Panel'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Portfolio CMS</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <Avatar className="h-10 w-10">
            <AvatarImage src={auth.user?.avatar} />
            <AvatarFallback>{auth.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {auth.user?.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {auth.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="bg-white dark:bg-slate-800 h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Search */}
              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 bg-slate-100 dark:bg-slate-700 border-0"
                  />
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                <NotificationDropdown />

                <Link to="/" target="_blank">
                  <Button variant="outline" size="sm">
                    View Site
                  </Button>
                </Link>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={auth.user?.avatar} />
                        <AvatarFallback>{auth.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{auth.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {auth.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>System Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex items-center w-full">
                        <Shield className="mr-2 h-4 w-4" />
                        <span className="flex-1">Role</span>
                        <Badge variant="secondary" className="text-xs">
                          {auth.user?.role}
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;