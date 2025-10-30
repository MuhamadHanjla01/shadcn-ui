import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { loadSiteSettings, SiteSettings } from '@/lib/storage';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Moon, Sun, Menu, Home, User, Briefcase, PenTool, Mail } from 'lucide-react';
import Footer from './Footer';
import MetadataManager from './MetadataManager';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isDark, setIsDark] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(loadSiteSettings());
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Load theme with real-time sync
  useEffect(() => {
    const loadTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      setIsDark(shouldBeDark);
      console.log('🎨 Theme loaded:', shouldBeDark ? 'dark' : 'light');
    };
    
    loadTheme();
    
    // Listen for theme changes from other tabs/devices
    const handleThemeUpdate = () => {
      console.log('✨ Theme change detected - syncing...');
      loadTheme();
    };
    
    window.addEventListener('themeChanged', handleThemeUpdate);
    window.addEventListener('storage', handleThemeUpdate);
    window.addEventListener('portfolioDataUpdated', handleThemeUpdate);
    window.addEventListener('forceDataReload', handleThemeUpdate);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeUpdate);
      window.removeEventListener('storage', handleThemeUpdate);
      window.removeEventListener('portfolioDataUpdated', handleThemeUpdate);
      window.removeEventListener('forceDataReload', handleThemeUpdate);
    };
  }, []);

  // Load site settings with real-time sync
  useEffect(() => {
    const load = () => {
      console.log('🔄 Reloading site settings...');
      setSiteSettings(loadSiteSettings());
    };
    load();
    
    const onUpdate = () => {
      console.log('✨ Settings update detected');
      load();
    };
    
    window.addEventListener('portfolioDataUpdated', onUpdate);
    window.addEventListener('storage', onUpdate);
    window.addEventListener('forceDataReload', onUpdate);
    window.addEventListener('focus', onUpdate);
    
    return () => {
      window.removeEventListener('portfolioDataUpdated', onUpdate);
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('forceDataReload', onUpdate);
      window.removeEventListener('focus', onUpdate);
    };
  }, []);

  // Apply theme and broadcast changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    const themeValue = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', themeValue);
    
    // Broadcast theme change to all tabs/pages
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: themeValue } 
    }));
    
    // Also trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: themeValue,
      url: window.location.href
    }));
    
    console.log('🎨 Theme applied:', themeValue);
  }, [isDark]);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: User },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Blog', href: '/blog', icon: PenTool },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500 flex flex-col">
      <MetadataManager />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {siteSettings.logoMode === 'image' && siteSettings.logo ? (
                <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/30 dark:border-slate-700/50 bg-white">
                  <img src={siteSettings.logo} alt="Logo" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(siteSettings.logoText || 'AC').slice(0, 3)}
                  </span>
                </div>
              )}
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {siteSettings.siteName || 'Muhamad Hanjla'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDark(!isDark)}
                className="h-9 w-9 p-0"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden h-9 w-9 p-0">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Only show if enabled in settings */}
      {siteSettings.footerEnabled !== false && <Footer />}
    </div>
  );
};

export default Layout;