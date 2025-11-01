import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Upload, 
  Eye, 
  RotateCcw,
  CheckCircle,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Download
} from 'lucide-react';
import { userData as initialUserData, stats as initialStats } from '@/lib/data';
import { saveUserData, loadUserData, loadSiteSettings, saveSiteSettings, saveStats, loadStats, isRecentlySaved } from '@/lib/storage';
import { loadDataFromFile, DATA_FILES } from '@/lib/data-sync';
import { saveAllDataToBackend, getDataFromBackend } from '@/lib/backend-api';
import type { Stat } from '@/types';
import { toast } from 'sonner';

const HomeEditor = () => {
  const [homeData, setHomeData] = useState({
    name: initialUserData.name,
    title: initialUserData.title,
    tagline: initialUserData.tagline,
    profileImage: initialUserData.profileImage,
    resume: initialUserData.resume,
    socialMedia: { ...initialUserData.socialMedia },
    socialVisibility: {
      github: true,
      linkedin: true,
      twitter: true,
      email: true
    },
    heroLayout: 'center' as 'left' | 'center' | 'right'
  });
  
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMeta, setResumeMeta] = useState<{ name: string; sizeLabel: string } | null>(null);
  const isInitializedRef = useRef(false);

  // Load data - prioritize backend API, fallback to localStorage/JSON files
  useEffect(() => {
    const loadLatestData = async () => {
      try {
        console.log('📥 Loading data from backend API...');
        
        // Try to load from backend API first (direct connection)
        const [backendUserData, backendStats, backendSettings] = await Promise.all([
          getDataFromBackend('user'),
          getDataFromBackend('stats'),
          getDataFromBackend('site-settings')
        ]);
        
        let freshUserData, freshStats, freshSiteSettings;
        
        // Use backend data if available, otherwise fallback to localStorage/JSON
        if (backendUserData) {
          freshUserData = backendUserData;
          // Update localStorage for local preview
          saveUserData(backendUserData);
          console.log('✅ Loaded user data from backend API');
        } else {
          // Fallback: Check if data was recently saved locally
          const userDataKey = 'portfolio_user_data';
          const userRecentlySaved = isRecentlySaved(userDataKey, 5);
          
          if (userRecentlySaved) {
            freshUserData = loadUserData(initialUserData);
            console.log('📝 Using recently saved localStorage data');
          } else {
            freshUserData = await loadDataFromFile(DATA_FILES.user, userDataKey, initialUserData, true);
          }
        }
        
        if (backendStats) {
          freshStats = backendStats;
          saveStats(backendStats);
          console.log('✅ Loaded stats from backend API');
        } else {
          const statsKey = 'portfolio_stats';
          const statsRecentlySaved = isRecentlySaved(statsKey, 5);
          
          if (statsRecentlySaved) {
            freshStats = loadStats(initialStats);
          } else {
            freshStats = await loadDataFromFile(DATA_FILES.stats, statsKey, initialStats, true);
          }
        }
        
        if (backendSettings) {
          freshSiteSettings = backendSettings;
          saveSiteSettings(backendSettings);
          console.log('✅ Loaded site settings from backend API');
        } else {
          const settingsKey = 'portfolio_site_settings';
          const settingsRecentlySaved = isRecentlySaved(settingsKey, 5);
          
          if (settingsRecentlySaved) {
            freshSiteSettings = loadSiteSettings();
          } else {
            freshSiteSettings = await loadDataFromFile(DATA_FILES.siteSettings, settingsKey, loadSiteSettings(), true);
          }
        }

        // Update stats
        setStats(freshStats);

        // Update home data
        if (freshUserData) {
          setHomeData({
            name: freshUserData.name || initialUserData.name,
            title: freshUserData.title || initialUserData.title,
            tagline: freshUserData.tagline || initialUserData.tagline,
            profileImage: freshUserData.profileImage || initialUserData.profileImage,
            resume: freshUserData.resume || initialUserData.resume,
            socialMedia: { ...(freshUserData.socialMedia || initialUserData.socialMedia) },
            socialVisibility: freshSiteSettings?.socialVisibility || {
              github: true,
              linkedin: true,
              twitter: true,
              email: true
            },
            heroLayout: (freshSiteSettings?.heroLayout as 'left'|'center'|'right') || 'center'
          });

          // Initialize resume meta for display after refresh
          const resume = freshUserData.resume || initialUserData.resume;
          if (resume) {
            const isDataUrl = typeof resume === 'string' && resume.startsWith('data:');
            const fromPath = typeof resume === 'string' ? resume.split('/').pop() : '';
            setResumeMeta({
              name: isDataUrl ? 'resume.pdf' : (fromPath || 'resume.pdf'),
              sizeLabel: '—'
            });
          } else {
            setResumeMeta(null);
          }
        } else {
          // Fallback to localStorage if JSON files don't exist
          const stored = localStorage.getItem('portfolio_user_data');
          const storedStats = loadStats(initialStats);
          setStats(storedStats);
          
          if (stored) {
            try {
              const parsedData = JSON.parse(stored);
              setHomeData({
                name: parsedData.name,
                title: parsedData.title,
                tagline: parsedData.tagline,
                profileImage: parsedData.profileImage,
                resume: parsedData.resume,
                socialMedia: { ...parsedData.socialMedia },
                socialVisibility: {
                  github: true,
                  linkedin: true,
                  twitter: true,
                  email: true
                },
                heroLayout: 'center'
              });
              // Load heroLayout from site settings if present
              const ss = loadSiteSettings();
              if (ss.heroLayout && ['left','center','right'].includes(ss.heroLayout)) {
                setHomeData(prev => ({ ...prev, heroLayout: ss.heroLayout as 'left'|'center'|'right' }));
              }
              if (ss.socialVisibility) {
                setHomeData(prev => ({ ...prev, socialVisibility: { ...ss.socialVisibility } }));
              }
              // Initialize resume meta
              if (parsedData.resume) {
                const isDataUrl = typeof parsedData.resume === 'string' && parsedData.resume.startsWith('data:');
                const fromPath = typeof parsedData.resume === 'string' ? parsedData.resume.split('/').pop() : '';
                setResumeMeta({
                  name: isDataUrl ? 'resume.pdf' : (fromPath || 'resume.pdf'),
                  sizeLabel: '—'
                });
              } else {
                setResumeMeta(null);
              }
            } catch (error) {
              console.error('Error loading stored data:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading latest data:', error);
        // Fallback to localStorage on error
        const stored = localStorage.getItem('portfolio_user_data');
        const storedStats = loadStats(initialStats);
        setStats(storedStats);
        
        if (stored) {
          try {
            const parsedData = JSON.parse(stored);
            setHomeData({
              name: parsedData.name || initialUserData.name,
              title: parsedData.title || initialUserData.title,
              tagline: parsedData.tagline || initialUserData.tagline,
              profileImage: parsedData.profileImage || initialUserData.profileImage,
              resume: parsedData.resume || initialUserData.resume,
              socialMedia: { ...(parsedData.socialMedia || initialUserData.socialMedia) },
              socialVisibility: {
                github: true,
                linkedin: true,
                twitter: true,
                email: true
              },
              heroLayout: 'center'
            });
          } catch (e) {
            console.error('Error parsing stored data:', e);
          }
        }
      }
      // Mark initialized so auto-save can start after initial load
      isInitializedRef.current = true;
    };

    loadLatestData();
  }, []);

  // Listen for real-time updates from other admin panels or saves
  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      const { key, data } = event.detail || {};
      
      // Reload data if user data was updated
      if (key === 'portfolio_user_data' && data) {
        console.log('🔄 Real-time update: User data changed');
        setHomeData(prev => ({
          ...prev,
          name: data.name || prev.name,
          title: data.title || prev.title,
          tagline: data.tagline || prev.tagline,
          profileImage: data.profileImage || prev.profileImage,
          resume: data.resume || prev.resume,
          socialMedia: data.socialMedia || prev.socialMedia
        }));
      }
      
      // Reload stats if updated
      if (key === 'portfolio_stats' && data) {
        console.log('🔄 Real-time update: Stats changed');
        setStats(data);
      }
      
      // Reload site settings if updated
      if (key === 'portfolio_site_settings' && data) {
        console.log('🔄 Real-time update: Site settings changed');
        if (data.heroLayout && ['left','center','right'].includes(data.heroLayout)) {
          setHomeData(prev => ({ ...prev, heroLayout: data.heroLayout as 'left'|'center'|'right' }));
        }
        if (data.socialVisibility) {
          setHomeData(prev => ({ ...prev, socialVisibility: data.socialVisibility }));
        }
      }
    };

    window.addEventListener('portfolioDataUpdated', handleStorageUpdate as EventListener);
    return () => window.removeEventListener('portfolioDataUpdated', handleStorageUpdate as EventListener);
  }, []);

  // Auto-save and broadcast updates to frontend (debounced)
  // Excludes heroLayout and resume so they only update frontend on explicit Save
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const { name, title, tagline, profileImage, socialMedia } = homeData;
    const timeout = setTimeout(() => {
      try {
        // Merge with current stored data to avoid wiping fields like resume
        const current = loadUserData(initialUserData);
        const merged = {
          ...current,
          name,
          title,
          tagline,
          bio: initialUserData.bio,
          profileImage,
          socialMedia
        };
        saveUserData(merged);
        window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
      } catch (e) {
        // ignore auto-save errors silently
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeData.name, homeData.title, homeData.tagline, homeData.profileImage, JSON.stringify(homeData.socialMedia)]);

  const handleInputChange = (field: string, value: string) => {
    setHomeData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setHomeData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
  };

  const handleSocialVisibilityChange = (platform: string, visible: boolean) => {
    setHomeData(prev => ({
      ...prev,
      socialVisibility: { ...prev.socialVisibility, [platform]: visible }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Save to localStorage
      const dataToSave = {
        name: homeData.name,
        title: homeData.title,
        tagline: homeData.tagline,
        bio: initialUserData.bio,
        profileImage: homeData.profileImage,
        resume: homeData.resume,
        socialMedia: homeData.socialMedia
      };
      
      // Save to localStorage (for local preview)
      saveUserData(dataToSave);
      saveStats(stats);
      
      // Persist hero layout in site settings
      const currentSettings = loadSiteSettings();
      const updatedSettings = {
        ...currentSettings,
        heroLayout: homeData.heroLayout,
        socialVisibility: { ...homeData.socialVisibility }
      };
      saveSiteSettings(updatedSettings);
      
      // Save to backend API (direct connection - no GitHub sync needed!)
      const saveResult = await saveAllDataToBackend({
        'user': {
          ...dataToSave,
          bio: dataToSave.bio || initialUserData.bio,
        },
        'stats': stats,
        'site-settings': updatedSettings
      });
      
      if (saveResult.success) {
        toast.success('Changes saved to backend!', {
          description: 'Users will see updates in real-time'
        });
        
        // Trigger frontend update event
        window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { 
          detail: { source: 'backend-api', reload: true, timestamp: Date.now() } 
        }));
      } else {
        toast.error('Failed to save to backend', {
          description: saveResult.message
        });
      }
      
      // Force update the form immediately with saved data (real-time update)
      setHomeData(prev => ({
        ...prev,
        name: dataToSave.name,
        title: dataToSave.title,
        tagline: dataToSave.tagline,
        profileImage: dataToSave.profileImage,
        resume: dataToSave.resume,
        socialMedia: dataToSave.socialMedia
      }));
      
      // Optional: Also sync to GitHub if configured (for backup/redundancy)
      const { isGitHubSyncConfigured, exportAndCommitToGitHub } = await import('@/lib/github-sync');
      if (isGitHubSyncConfigured()) {
        // Run GitHub sync in background without blocking save operation
        exportAndCommitToGitHub(
          {
            'user': {
              ...dataToSave,
              bio: dataToSave.bio || initialUserData.bio,
            },
            'stats': stats,
            'site-settings': updatedSettings
          },
          'Update home data (automatic sync)'
        ).then((result) => {
          if (result.success) {
            toast.success('Changes saved and published!', {
              description: 'Users will see updates in 1-2 minutes'
            });
            // Trigger a reload from JSON files after a delay to pick up GitHub changes
            // Note: GitHub Actions rebuild takes 1-2 minutes, so we'll retry multiple times
            console.log('✅ GitHub sync successful, will trigger frontend reload...');
            setTimeout(() => {
              console.log('🔄 Dispatching reload event to frontend...');
              window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { 
                detail: { source: 'github-sync', reload: true, timestamp: Date.now() } 
              }));
            }, 5000); // Wait 5 seconds initially, then retry
          } else {
            // Only log to console for backend connectivity issues - don't show alarming toast
            console.warn('GitHub sync note:', result.message);
            // Only show warning if it's not a backend connectivity issue
            if (!result.message.includes('Cannot connect to backend API') && 
                !result.message.includes('backend server is running')) {
              toast.warning('Saved locally. GitHub sync unavailable', {
                description: 'Data saved successfully. Start backend server to enable auto-sync.'
              });
            }
          }
        }).catch((error: any) => {
          // Silently handle sync errors - data is already saved locally
          console.warn('GitHub sync error (non-blocking):', error.message || 'Unknown error');
        });
        
        // Show success immediately - sync happens in background
        toast.success('Changes saved successfully!', {
          description: 'Syncing to GitHub in background...'
        });
      } else {
        toast.success('Saved locally!', {
          description: 'Enable GitHub Auto-Sync in Settings to publish changes'
        });
      }
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setHomeData(prev => ({ ...prev, profileImage: dataUrl }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const sizeLabel = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.ceil(file.size / 1024)} KB`;
      setHomeData(prev => ({ ...prev, resume: dataUrl }));
      setResumeMeta({ name: file.name, sizeLabel });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleReset = () => {
    setHomeData({
      name: initialUserData.name,
      title: initialUserData.title,
      tagline: initialUserData.tagline,
      profileImage: initialUserData.profileImage,
      resume: initialUserData.resume,
      socialMedia: { ...initialUserData.socialMedia },
      socialVisibility: {
        github: true,
        linkedin: true,
        twitter: true,
        email: true
      },
      heroLayout: 'center'
    });
    setSaveStatus('idle');
  };

  const socialPlatforms = [
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'your@email.com' }
  ];

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Home Section Editor</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Customize your homepage hero section and personal information
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Home section updated successfully! Changes appear live on the homepage.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your name, title, and tagline that appear on the homepage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={homeData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={homeData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Full Stack Developer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                value={homeData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="A brief description of what you do"
                className="min-h-20"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will appear with a typing animation effect
              </p>
            </div>

            <div className="space-y-2">
              <Label>Hero Layout</Label>
              <div className="flex space-x-2">
                {(['left', 'center', 'right'] as const).map((layout) => (
                  <Button
                    key={layout}
                    variant={homeData.heroLayout === layout ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHomeData(prev => ({ ...prev, heroLayout: layout }))}
                    className="capitalize"
                  >
                    {layout}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Image & Resume */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
          <CardHeader>
            <CardTitle>Profile Image & Resume</CardTitle>
            <CardDescription>
              Upload your profile photo and resume file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Profile Image</Label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                  <img
                    src={homeData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProfileImageUpload(file);
                      e.currentTarget.value = '';
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profile-image-input')?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload New'}
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recommended: 400x400px, JPG or PNG
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume File</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="resume"
                  value={homeData.resume}
                  onChange={(e) => handleInputChange('resume', e.target.value)}
                  placeholder="/path/to/resume.pdf"
                  className="flex-1"
                />
                <input
                  id="resume-file-input"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleResumeUpload(file);
                    e.currentTarget.value = '';
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                  disabled={uploadingResume}
                  title="Upload PDF resume"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploadingResume ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <Download className="h-4 w-4" />
                <span>Current: {resumeMeta?.name || 'resume.pdf'}</span>
                <Badge variant="secondary">{resumeMeta?.sizeLabel || '—'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Links */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Manage your social media profiles and their visibility on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <Label htmlFor={platform.key}>{platform.label}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`${platform.key}-visibility`} className="text-sm">
                        Visible
                      </Label>
                      <Switch
                        id={`${platform.key}-visibility`}
                        checked={homeData.socialVisibility[platform.key as keyof typeof homeData.socialVisibility]}
                        onCheckedChange={(checked) => handleSocialVisibilityChange(platform.key, checked)}
                      />
                    </div>
                  </div>
                  <Input
                    id={platform.key}
                    value={homeData.socialMedia[platform.key as keyof typeof homeData.socialMedia] || ''}
                    onChange={(e) => handleSocialMediaChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    disabled={!homeData.socialVisibility[platform.key as keyof typeof homeData.socialVisibility]}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your changes will appear on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={homeData.profileImage}
                alt={homeData.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {homeData.name}
              </h1>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {homeData.title}
              </Badge>
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {homeData.tagline}
            </p>

            <div className="flex justify-center space-x-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                const isVisible = homeData.socialVisibility[platform.key as keyof typeof homeData.socialVisibility];
                const hasUrl = homeData.socialMedia[platform.key as keyof typeof homeData.socialMedia];
                
                if (!isVisible || !hasUrl) return null;
                
                return (
                  <div
                    key={platform.key}
                    className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>
            Edit the statistics displayed on your homepage (Years Experience, Projects Completed, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <Label htmlFor={`stat-number-${index}`}>Number/Value</Label>
                  <Input
                    id={`stat-number-${index}`}
                    value={stat.number}
                    onChange={(e) => {
                      const newStats = [...stats];
                      newStats[index] = { ...newStats[index], number: e.target.value };
                      setStats(newStats);
                    }}
                    placeholder="e.g., 5+, 50+, 100%"
                  />
                  <p className="text-xs text-slate-500 mt-1">Examples: "5+", "50+", "100%", "20+"</p>
                </div>
                <div>
                  <Label htmlFor={`stat-label-${index}`}>Label</Label>
                  <Input
                    id={`stat-label-${index}`}
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...stats];
                      newStats[index] = { ...newStats[index], label: e.target.value };
                      setStats(newStats);
                    }}
                    placeholder="e.g., Years Experience, Projects Completed"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeEditor;