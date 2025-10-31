import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadSiteSettings, loadUserData } from '@/lib/storage';
import { loadDataFromFile, DATA_FILES } from '@/lib/data-sync';
import { userData as defaultUserData } from '@/lib/data';

const MetadataManager = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(defaultUserData);

  // Generate favicon from text
  const generateTextFavicon = (text: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Background
    ctx.fillStyle = '#2563eb'; // blue-600
    ctx.fillRect(0, 0, 64, 64);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);
    
    return canvas.toDataURL('image/png');
  };

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await loadDataFromFile(
        DATA_FILES.user,
        'portfolio_user_data',
        defaultUserData
      );
      setUserData(user);
    };
    loadUser();

    // Listen for user data updates
    const handleUpdate = () => {
      loadUser();
    };
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', handleUpdate);
  }, []);

  // Update metadata function
  const updateMetadata = () => {
    const settings = loadSiteSettings();
    
    // Get current user data (prefer state, fallback to localStorage)
    const currentUser = userData || loadUserData(defaultUserData);

    // Update favicon using theme logo (image or text mode)
    let faviconUrl = '';
    if (settings.logoMode === 'text' && settings.logoText) {
      // Generate favicon from text
      faviconUrl = generateTextFavicon(settings.logoText);
    } else if (settings.logo) {
      // Use image logo
      faviconUrl = settings.logo;
    }
    
    if (faviconUrl) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.type = 'image/x-icon';
      link.href = faviconUrl;
    }

    // Build dynamic title from user data or settings
    const ogTitle = settings.metaTitle || `${currentUser.name} - ${currentUser.title}`;
    const ogDescription = settings.metaDescription || currentUser.tagline || `${currentUser.name} - ${currentUser.title} Portfolio`;
    const ogImage = settings.ogImage || currentUser.profileImage || '';
    
    // Update page title
    if (settings.metaTitle) {
      document.title = settings.metaTitle;
    } else {
      document.title = `${currentUser.name} - ${currentUser.title}`;
    }

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.content = settings.metaDescription || ogDescription;

    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
    if (settings.metaKeywords) {
      metaKeywords.content = settings.metaKeywords;
    }

    // Open Graph tags - Use user data for dynamic updates
    const updateOgTag = (property: string, content: string | undefined) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.getElementsByTagName('head')[0].appendChild(tag);
      }
      tag.content = content;
    };

    // Use current user data for OG tags
    updateOgTag('og:title', ogTitle);
    updateOgTag('og:description', ogDescription);
    updateOgTag('og:image', ogImage ? (ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`) : '');
    updateOgTag('og:url', window.location.href);
    updateOgTag('og:site_name', settings.siteName || currentUser.name);
    updateOgTag('og:type', 'website');

    // Twitter Card tags - Use user data
    const updateTwitterTag = (name: string, content: string | undefined) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.getElementsByTagName('head')[0].appendChild(tag);
      }
      tag.content = content;
    };

    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:title', ogTitle);
    updateTwitterTag('twitter:description', ogDescription);
    updateTwitterTag('twitter:image', ogImage ? (ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`) : '');
    if (settings.twitterHandle) {
      updateTwitterTag('twitter:site', settings.twitterHandle);
      updateTwitterTag('twitter:creator', settings.twitterHandle);
    }
  };

  useEffect(() => {
    // Update on mount and when location or user data changes
    updateMetadata();

    // Listen for settings and user data updates
    const handleUpdate = () => {
      // Reload user data if updated
      loadDataFromFile(DATA_FILES.user, 'portfolio_user_data', defaultUserData).then(setUserData);
      updateMetadata();
    };
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('portfolioDataUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [location, userData]);

  return null; // This component doesn't render anything
};

export default MetadataManager;
