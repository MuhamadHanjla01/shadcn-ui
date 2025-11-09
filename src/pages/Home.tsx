import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { trackPageView } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Twitter, Mail, Download, ArrowRight, Sparkles } from 'lucide-react';
import { userData as initialUserData, stats as initialStats } from '@/lib/data';
import { loadUserData, loadSiteSettings, loadStats } from '@/lib/storage';
import { loadDataFromFile, DATA_FILES } from '@/lib/data-sync';
import { startRealtimeSync, initializeDataHash } from '@/lib/realtime-sync';
import { getDataFromBackend } from '@/lib/backend-api';

const Home = () => {
  // Start with null to avoid showing old data, will load from backend
  const [userData, setUserData] = useState<typeof initialUserData | null>(null);
  const [stats, setStats] = useState<typeof initialStats | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = userData?.tagline || '';
  const [heroLayout, setHeroLayout] = useState<'left'|'center'|'right'>('center');
  const [socialVisibility, setSocialVisibility] = useState({ github: true, linkedin: true, twitter: true, email: true });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const handleResumeDownload = async (e: any) => {
    if (!userData.resume) {
      console.warn('No resume file available');
      e.preventDefault();
      return;
    }
    
    // Handle data URL (base64 encoded PDF)
    if (typeof userData.resume === 'string' && userData.resume.startsWith('data:')) {
      e.preventDefault();
      try {
        console.log('Downloading resume from data URL...');
        const res = await fetch(userData.resume);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        console.log('✅ Resume downloaded successfully');
      } catch (err) {
        console.error('Failed to download resume:', err);
        alert('Failed to download resume. Please try again.');
      }
    }
    // Handle external URL or path
    else if (typeof userData.resume === 'string') {
      // Let the browser handle the download naturally
      console.log('Downloading resume from URL:', userData.resume);
    }
  };

  // Load user data ONLY from backend - no localStorage caching!
  useEffect(() => {
    // Track page view for analytics
    trackPageView('home');

    const loadData = async () => {
      console.log('📥 Loading home data from backend only (no cache)...');
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      
      // Safety timeout: Force close loading screen after 3 seconds max
      const safetyTimeout = setTimeout(() => {
        console.log('⚠️ Loading timeout - forcing close');
        setIsLoading(false);
        setHasLoadedOnce(true);
      }, 3000);
      
      try {
        // ONLY load from backend API - no fallback to localStorage or JSON
        const [backendUserData, backendStats, backendSettings] = await Promise.all([
          getDataFromBackend('user'),
          getDataFromBackend('stats'),
          getDataFromBackend('site-settings')
        ]);
        
        // IMPORTANT: Set data or use defaults, then close loading
        if (backendUserData) {
          setUserData(backendUserData as typeof initialUserData);
          initializeDataHash('user', backendUserData);
          console.log('✅ Loaded user from backend:', (backendUserData as any).name);
        } else {
          // Use fallback if backend returns null
          setUserData(initialUserData);
          console.log('⚠️ Using fallback user data');
        }
        
        if (backendStats) {
          setStats(backendStats as typeof initialStats);
          initializeDataHash('stats', backendStats);
          console.log('✅ Loaded stats from backend:', (backendStats as any[]).length);
        } else {
          setStats(initialStats);
          console.log('⚠️ Using fallback stats data');
        }
        
        if (backendSettings) {
          const ss = backendSettings as ReturnType<typeof loadSiteSettings>;
          setHeroLayout((ss.heroLayout as 'left'|'center'|'right') || 'center');
          setSocialVisibility(ss.socialVisibility || { github: true, linkedin: true, twitter: true, email: true });
          initializeDataHash('siteSettings', ss);
          console.log('✅ Loaded site settings from backend');
        }
        
        console.log('✅ All data loaded from backend at', new Date().toISOString());
      } catch (error) {
        console.error('❌ Error loading data from backend:', error);
        // On error, use initial defaults
        setUserData(initialUserData);
        setStats(initialStats);
      } finally {
        // Clear safety timeout and close loading screen
        clearTimeout(safetyTimeout);
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    };

    loadData();

    // Listen for WebSocket updates from admin panel
    const handleDataUpdate = async (event?: any) => {
      console.log('🔄 Data update event received on Home page:', event?.detail);
      
      // If real-time sync update detected, use data from event or fetch from backend
      if (event?.detail?.source === 'realtime-sync') {
        console.log('📥 Real-time sync update detected');
        
        // If event contains the data directly, use it immediately
        const eventData = event?.detail?.data;
        if (eventData) {
          console.log('✅ Using data from WebSocket event:', Object.keys(eventData));
          
          if (eventData.user) {
            setUserData(eventData.user as typeof initialUserData);
            console.log('✅ Updated user:', (eventData.user as any).name);
          }
          if (eventData.stats) {
            setStats(eventData.stats as typeof initialStats);
            console.log('✅ Updated stats:', (eventData.stats as any[]).length);
          }
          if (eventData.siteSettings) {
            setHeroLayout(((eventData.siteSettings as any).heroLayout as 'left'|'center'|'right') || 'center');
            setSocialVisibility((eventData.siteSettings as any).socialVisibility || { github: true, linkedin: true, twitter: true, email: true });
            console.log('✅ Updated site settings');
          }
          
          // Reset typing animation
          setDisplayText('');
          setCurrentIndex(0);
        }
        return;
      }
      
      // Otherwise reload data from backend
      console.log('📥 Reloading data from backend...');
      loadData();
      setDisplayText('');
      setCurrentIndex(0);
    };

    window.addEventListener('portfolioDataUpdated', handleDataUpdate);
    
    // Start real-time polling for updates (for user devices)
    const cleanup = startRealtimeSync((updates) => {
      console.log('🎯 Real-time sync callback triggered with updates:', Object.keys(updates));
      
      // Update UI with new data
      if (updates.user) {
        console.log('🔄 Updating user data in UI:', updates.user.name);
        setUserData(updates.user);
        setDisplayText('');
        setCurrentIndex(0);
      }
      if (updates.stats) {
        console.log('🔄 Updating stats in UI:', updates.stats.length, 'items');
        setStats(updates.stats);
      }
      if (updates.siteSettings) {
        console.log('🔄 Updating site settings in UI');
        setHeroLayout((updates.siteSettings.heroLayout as 'left'|'center'|'right') || 'center');
        setSocialVisibility(updates.siteSettings.socialVisibility || { github: true, linkedin: true, twitter: true, email: true });
      }
      
      // Show visual feedback (optional toast notification)
      if (Object.keys(updates).length > 0) {
        console.log('✅ UI updated successfully with new data!');
      }
    });
    
    return () => {
      window.removeEventListener('portfolioDataUpdated', handleDataUpdate);
      cleanup();
    };
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Reset typing animation when userData changes (new data loaded)
  useEffect(() => {
    if (userData) {
      setDisplayText('');
      setCurrentIndex(0);
    }
  }, [userData?.tagline]); // Only reset when tagline changes

  const socialLinks = userData ? [
    { key: 'github', icon: Github, href: userData.socialMedia.github, label: 'GitHub' },
    { key: 'linkedin', icon: Linkedin, href: userData.socialMedia.linkedin, label: 'LinkedIn' },
    { key: 'twitter', icon: Twitter, href: userData.socialMedia.twitter, label: 'Twitter' },
    { key: 'email', icon: Mail, href: userData.socialMedia.email ? `mailto:${userData.socialMedia.email}` : '', label: 'Email' },
  ].filter((item: any) => {
    // Safety check: ensure socialVisibility is defined
    const visible = socialVisibility ? (socialVisibility as any)[item.key] : true;
    const hasUrl = Boolean(item.href);
    return visible && hasUrl;
  }) : [];

  const sectionJustify = heroLayout === 'left' ? 'justify-start' : heroLayout === 'right' ? 'justify-end' : 'justify-center';
  const textAlign = heroLayout === 'left' ? 'text-left' : heroLayout === 'right' ? 'text-right' : 'text-center';

  // Show animated skeleton loading ONLY on first load
  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="relative overflow-hidden">
        {/* Animated Background Elements - Same as actual page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.25s' }}></div>
        </div>

        {/* Hero Section - EXACT same layout as actual page */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Profile Image - With border like actual */}
            <div className="relative inline-block text-center animate-in zoom-in fade-in duration-700" style={{ animationDelay: '0s' }}>
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden border-4 border-white/50 shadow-2xl dark:border-slate-700/50 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 animate-pulse"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 rounded-full flex items-center justify-center animate-pulse"></div>
            </div>

            {/* Name and Title - Exact spacing */}
            <div className="space-y-4 animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationDelay: '0.2s' }}>
              {/* Name - text-4xl sm:text-6xl lg:text-7xl height */}
              <div className="h-10 sm:h-16 lg:h-20 w-3/4 mx-auto bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg animate-pulse"></div>
              
              {/* Title Badge - space-y-2 */}
              <div className="space-y-2">
                <div className="flex justify-center animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '0.4s' }}>
                  <div className="h-10 w-64 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Typing Animation Area - h-16 like actual */}
            <div className="h-16 flex items-center justify-center animate-in slide-in-from-left-8 fade-in duration-700" style={{ animationDelay: '0.6s' }}>
              <div className="h-7 sm:h-8 w-2/3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg animate-pulse"></div>
            </div>

            {/* CTA Buttons - Same gap-4 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="h-12 w-44 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg animate-pulse animate-in slide-in-from-bottom-6 fade-in duration-700" style={{ animationDelay: '0.8s' }}></div>
              <div className="h-12 w-44 bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-lg animate-pulse animate-in slide-in-from-bottom-6 fade-in duration-700" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Social Links - space-x-6 pt-8 with backdrop */}
            <div className="flex justify-center space-x-6 pt-8">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 shadow-sm animate-pulse animate-in zoom-in fade-in duration-500" 
                  style={{ animationDelay: `${1.2 + i * 0.1}s` }}
                >
                  <div className="h-6 w-6 bg-slate-300 dark:bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>

            {/* Resume Download - pt-4 */}
            <div className="pt-4 animate-in fade-in duration-700" style={{ animationDelay: '1.6s' }}>
              <div className="inline-flex items-center space-x-2">
                <div className="h-4 w-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats - grid-cols-2 md:grid-cols-4 gap-8 */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="text-center space-y-2 p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 animate-pulse animate-in slide-in-from-right-8 fade-in duration-700" 
                  style={{ animationDelay: `${1.8 + i * 0.15}s` }}
                >
                  {/* Number */}
                  <div className="h-9 sm:h-10 w-16 mx-auto bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 rounded"></div>
                  {/* Label */}
                  <div className="h-4 w-24 mx-auto bg-slate-200 dark:bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center ${sectionJustify} px-4 sm:px-6 lg:px-8`}>
        <div className={`max-w-4xl mx-auto ${textAlign} space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000`}>
          {/* Profile Image */}
          <div className={`relative inline-block ${textAlign}`}>
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden border-4 border-white/50 shadow-2xl dark:border-slate-700/50">
              <img
                src={userData.profileImage}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Name and Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
              {userData.name}
            </h1>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                {userData.title}
              </Badge>
            </div>
          </div>

          {/* Typing Animation */}
          <div className="h-16 flex items-center justify-center">
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 font-medium">
              {displayText}
              <span className="animate-pulse">|</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/projects">
              <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                View My Work
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                Get In Touch
              </Button>
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 pt-8">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label={social.label}
                >
                  <Icon className="h-6 w-6 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </a>
              );
            })}
          </div>

          {/* Resume Download */}
          <div className="pt-4">
            <a
              href={userData.resume}
              download={userData.resume?.startsWith('data:') ? 'resume.pdf' : undefined}
              onClick={handleResumeDownload}
              className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
            >
              <Download className="h-4 w-4 group-hover:animate-bounce" />
              <span className="text-sm font-medium">Download Resume</span>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center space-y-2 p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;