import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { loadSiteSettings, SiteSettings, loadThemeSettingsSync, ThemeSettings } from '@/lib/storage';
import { hexToHsl } from '@/lib/theme-utils';
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
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(loadThemeSettingsSync());
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    const load = () => setSiteSettings(loadSiteSettings());
    load();
    const onUpdate = () => load();
    window.addEventListener('portfolioDataUpdated', onUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', onUpdate);
  }, []);

  // Load and listen for theme settings updates
  useEffect(() => {
    // Load from theme.json (for GitHub Pages) or localStorage
    const loadTheme = async () => {
      try {
        const { loadThemeSettings } = await import('@/lib/storage');
        const theme = await loadThemeSettings();
        setThemeSettings(theme);
      } catch (error) {
        console.error('Error loading theme:', error);
        setThemeSettings(loadThemeSettingsSync());
      }
    };
    
    loadTheme();
    
    const onThemeUpdate = (e: CustomEvent) => {
      if (e.detail?.key === 'portfolio_theme_settings') {
        // Reload from theme.json if it exists, otherwise use localStorage
        loadTheme();
      }
    };
    window.addEventListener('portfolioDataUpdated', onThemeUpdate as EventListener);
    return () => window.removeEventListener('portfolioDataUpdated', onThemeUpdate as EventListener);
  }, []);

  // Apply theme settings as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply primary and secondary colors
    if (themeSettings.primaryColor) {
      const primaryHsl = hexToHsl(themeSettings.primaryColor);
      root.style.setProperty('--primary', primaryHsl);
      
      // Calculate a lighter version for primary-foreground (high contrast)
      // For dark mode, use light foreground; for light mode, use dark foreground
      const [h, s, l] = primaryHsl.split(' ').map(v => parseFloat(v));
      const foregroundLightness = isDark ? Math.min(98, l + 50) : Math.max(10, l - 50);
      root.style.setProperty('--primary-foreground', `${h} ${s}% ${foregroundLightness}%`);
    }
    
    if (themeSettings.secondaryColor) {
      const secondaryHsl = hexToHsl(themeSettings.secondaryColor);
      root.style.setProperty('--secondary', secondaryHsl);
      
      // Calculate foreground for secondary
      const [h, s, l] = secondaryHsl.split(' ').map(v => parseFloat(v));
      const foregroundLightness = isDark ? Math.min(98, l + 50) : Math.max(10, l - 50);
      root.style.setProperty('--secondary-foreground', `${h} ${s}% ${foregroundLightness}%`);
    }
    
    // Apply font family
    if (themeSettings.fontFamily) {
      root.style.setProperty('--font-family', themeSettings.fontFamily);
      document.body.style.fontFamily = themeSettings.fontFamily;
    }
  }, [themeSettings, isDark]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to right, ${themeSettings.primaryColor || '#2563eb'}, ${themeSettings.secondaryColor || '#4f46e5'})`
                  }}
                >
                  <span className="text-white font-bold text-sm">
                    {(siteSettings.logoText || 'AC').slice(0, 3)}
                  </span>
                </div>
              )}
              <span 
                className="font-bold text-xl bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeSettings.primaryColor || '#2563eb'}, ${themeSettings.secondaryColor || '#4f46e5'})`
                }}
              >
                {siteSettings.siteName || 'Alex Chen'}
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
                        ? ''
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                    style={isActive(item.href) ? {
                      backgroundColor: isDark 
                        ? `${themeSettings.primaryColor || '#2563eb'}40` 
                        : `${themeSettings.primaryColor || '#2563eb'}20`,
                      color: themeSettings.primaryColor || '#2563eb'
                    } : {}}
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
                              ? ''
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                          }`}
                          style={isActive(item.href) ? {
                            backgroundColor: isDark 
                              ? `${themeSettings.primaryColor || '#2563eb'}40` 
                              : `${themeSettings.primaryColor || '#2563eb'}20`,
                            color: themeSettings.primaryColor || '#2563eb'
                          } : {}}
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