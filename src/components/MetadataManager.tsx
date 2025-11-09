import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteSettings } from '@/lib/storage';
import { getDataFromBackend } from '@/lib/backend-api';
import { userData as defaultUserData } from '@/lib/data';

const MetadataManager = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(defaultUserData);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

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

  // Load user data and site settings from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [user, settings] = await Promise.all([
          getDataFromBackend('user'),
          getDataFromBackend('site-settings')
        ]);
        
        if (user) {
          setUserData(user as typeof defaultUserData);
        }
        if (settings) {
          setSiteSettings(settings as SiteSettings);
        }
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };
    loadData();

    // Listen for updates
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', handleUpdate);
  }, []);

  // Update metadata function
  const updateMetadata = () => {
    if (!siteSettings || !userData) return; // Wait for data to load
    
    // Update favicon using theme logo (image or text mode)
    let faviconUrl = '';
    if (siteSettings.logoMode === 'text' && siteSettings.logoText) {
      // Generate favicon from text
      faviconUrl = generateTextFavicon(siteSettings.logoText);
    } else if (siteSettings.logo) {
      // Use image logo
      faviconUrl = siteSettings.logo;
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
    const ogTitle = siteSettings.metaTitle || `${userData.name} - ${userData.title}`;
    const ogDescription = siteSettings.metaDescription || userData.tagline || `${userData.name} - ${userData.title} Portfolio`;
    const ogImage = siteSettings.ogImage || userData.profileImage || '';
    
    // Update page title
    document.title = siteSettings.metaTitle || `${userData.name} - ${userData.title}`;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.content = siteSettings.metaDescription || ogDescription;

    // Update or create meta keywords
    if (siteSettings.metaKeywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.getElementsByTagName('head')[0].appendChild(metaKeywords);
      }
      metaKeywords.content = siteSettings.metaKeywords;
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
    
    // Handle image URL - ensure it's absolute
    if (ogImage) {
      let imageUrl = ogImage;
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = window.location.origin + imageUrl;
      }
      updateOgTag('og:image', imageUrl);
    }
    
    updateOgTag('og:url', window.location.href);
    updateOgTag('og:site_name', siteSettings.siteName || userData.name || 'Portfolio');
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
    
    // Handle Twitter image URL - ensure it's absolute
    if (ogImage) {
      let imageUrl = ogImage;
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = window.location.origin + imageUrl;
      }
      updateTwitterTag('twitter:image', imageUrl);
    }
    if (siteSettings.twitterHandle) {
      updateTwitterTag('twitter:site', siteSettings.twitterHandle);
      updateTwitterTag('twitter:creator', siteSettings.twitterHandle);
    }
  };

  useEffect(() => {
    // Update metadata when data is loaded or changes
    if (userData && siteSettings) {
      updateMetadata();
    }
  }, [location, userData, siteSettings]);

  return null; // This component doesn't render anything
};

export default MetadataManager;
