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
  const [userData, setUserData] = useState(initialUserData);
  const [stats, setStats] = useState(initialStats);
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = userData.tagline;
  const [heroLayout, setHeroLayout] = useState<'left'|'center'|'right'>(loadSiteSettings().heroLayout || 'center');
  const [socialVisibility, setSocialVisibility] = useState(loadSiteSettings().socialVisibility || { github: true, linkedin: true, twitter: true, email: true });

  const handleResumeDownload = async (e: any) => {
    if (!userData.resume) return;
    if (typeof userData.resume === 'string' && userData.resume.startsWith('data:')) {
      e.preventDefault();
      try {
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
      } catch (err) {
        console.error('Failed to download resume:', err);
      }
    }
  };

  // Load user data from shared JSON files (or localStorage fallback)
  useEffect(() => {
    // Track page view for analytics
    trackPageView('home');

    const loadData = async () => {
      // Try to load from shared JSON files first, fall back to localStorage
      const userData = await loadDataFromFile(
        DATA_FILES.user,
        'portfolio_user_data',
        initialUserData
      );
      const stats = await loadDataFromFile(
        DATA_FILES.stats,
        'portfolio_stats',
        initialStats
      );
      
      // Update state with loaded data
      setUserData(userData);
      setStats(stats);
      
      // Initialize hashes for real-time sync (so we can detect changes later)
      initializeDataHash('user', userData);
      initializeDataHash('stats', stats);
      
      // Load site settings (also try JSON first)
      const ss = await loadDataFromFile(
        DATA_FILES.siteSettings,
        'portfolio_site_settings',
        loadSiteSettings()
      );
      
      setHeroLayout((ss.heroLayout as 'left'|'center'|'right') || 'center');
      setSocialVisibility(ss.socialVisibility || { github: true, linkedin: true, twitter: true, email: true });
      
      // Initialize hash for site settings
      initializeDataHash('siteSettings', ss);
      
      // Debug: Log what data was loaded
      if (import.meta.env.DEV) {
        console.log('📥 Loaded user data:', { 
          name: userData.name, 
          title: userData.title,
          tagline: userData.tagline,
          profileImage: userData.profileImage ? '✅ Set' : '❌ Missing',
          resume: userData.resume ? '✅ Set' : '❌ Missing'
        });
      }
    };

    loadData();

    // Listen for updates from admin panel
    const handleDataUpdate = (event?: any) => {
      console.log('🔄 Data update event received:', event?.detail);
      
      // If event indicates GitHub sync completed, force refresh from JSON files
      const shouldForceReload = event?.detail?.reload === true;
      
      // Reload data - force refresh from JSON if GitHub sync completed
      if (shouldForceReload) {
        console.log('📥 GitHub sync detected - forcing reload from JSON files...');
        // Wait a bit for GitHub to process the commit and GitHub Actions to rebuild
        setTimeout(async () => {
          console.log('🔄 Loading fresh data from JSON files...');
          
          // Force reload with multiple attempts (GitHub Actions takes time)
          const attemptReload = async (attempt: number = 1, maxAttempts: number = 3) => {
            const freshUserData = await loadDataFromFile(
              DATA_FILES.user,
              'portfolio_user_data',
              initialUserData,
              true // Force refresh
            );
            const freshStats = await loadDataFromFile(
              DATA_FILES.stats,
              'portfolio_stats',
              initialStats,
              true // Force refresh
            );
            
            console.log(`📊 Reload attempt ${attempt}:`, {
              name: freshUserData.name,
              title: freshUserData.title,
              statsCount: freshStats.length
            });
            
            setUserData(freshUserData);
            setStats(freshStats);
            
            const freshSettings = await loadDataFromFile(
              DATA_FILES.siteSettings,
              'portfolio_site_settings',
              loadSiteSettings(),
              true
            );
            setHeroLayout((freshSettings.heroLayout as 'left'|'center'|'right') || 'center');
            setSocialVisibility(freshSettings.socialVisibility || { github: true, linkedin: true, twitter: true, email: true });
            
            setDisplayText('');
            setCurrentIndex(0);
            
            // Check if data actually changed by comparing with current state
            const dataChanged = 
              freshUserData.name !== userData.name || 
              freshUserData.title !== userData.title ||
              JSON.stringify(freshStats) !== JSON.stringify(stats);
            
            if (dataChanged) {
              console.log('✅ Data changed detected! Frontend updated with new data.');
            } else if (attempt < maxAttempts) {
              console.log(`⏳ Data unchanged, retrying in 10 seconds... (${attempt}/${maxAttempts})`);
              console.log('💡 This is normal - GitHub Actions takes 1-2 minutes to rebuild and deploy');
              setTimeout(() => attemptReload(attempt + 1, maxAttempts), 10000); // 10 seconds between retries
            } else {
              console.log('⚠️ Max retries reached. Data might not have updated yet.');
              console.log('💡 This usually means:');
              console.log('   1. GitHub Actions is still building (check GitHub Actions tab)');
              console.log('   2. JSON files haven\'t been deployed yet');
              console.log('   3. Try manual refresh: Ctrl+Shift+R');
            }
          };
          
          attemptReload();
        }, 5000); // Wait 5 seconds for GitHub Actions to start building
      } else {
        // Normal reload from localStorage or JSON
        console.log('📥 Normal data reload...');
        loadData();
        setDisplayText('');
        setCurrentIndex(0);
      }
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

  const socialLinks = [
    { key: 'github', icon: Github, href: userData.socialMedia.github, label: 'GitHub' },
    { key: 'linkedin', icon: Linkedin, href: userData.socialMedia.linkedin, label: 'LinkedIn' },
    { key: 'twitter', icon: Twitter, href: userData.socialMedia.twitter, label: 'Twitter' },
    { key: 'email', icon: Mail, href: userData.socialMedia.email ? `mailto:${userData.socialMedia.email}` : '', label: 'Email' },
  ].filter((item: any) => {
    const visible = (socialVisibility as any)[item.key];
    const hasUrl = Boolean(item.href);
    return visible && hasUrl;
  });

  const sectionJustify = heroLayout === 'left' ? 'justify-start' : heroLayout === 'right' ? 'justify-end' : 'justify-center';
  const textAlign = heroLayout === 'left' ? 'text-left' : heroLayout === 'right' ? 'text-right' : 'text-center';

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