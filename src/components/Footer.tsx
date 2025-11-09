import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';
import { SiteSettings } from '@/lib/storage';
import { userData as initialUserData } from '@/lib/data';
import { getDataFromBackend } from '@/lib/backend-api';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Portfolio',
    siteDescription: '',
    seoKeywords: [],
    googleAnalyticsId: '',
    maintenanceMode: false,
    footerEnabled: true,
    footerText: '© 2024 All rights reserved.',
    footerLinks: []
  });
  const [userData, setUserData] = useState(initialUserData);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settings, user] = await Promise.all([
          getDataFromBackend('site-settings'),
          getDataFromBackend('user')
        ]);
        if (settings) setSiteSettings(settings as SiteSettings);
        if (user) setUserData(user as typeof initialUserData);
      } catch (error) {
        // Silent fallback to defaults
      }
    };

    loadData();

    // Listen for updates
    const handleUpdate = () => loadData();
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', handleUpdate);
  }, []);

  const socialLinks = [
    { icon: Github, url: userData.socialMedia.github, label: 'GitHub' },
    { icon: Linkedin, url: userData.socialMedia.linkedin, label: 'LinkedIn' },
    { icon: Twitter, url: userData.socialMedia.twitter, label: 'Twitter' },
    { icon: Mail, url: userData.socialMedia.email ? `mailto:${userData.socialMedia.email}` : '', label: 'Email' }
  ];

  const currentYear = new Date().getFullYear();
  const footerText = siteSettings.footerText || `© ${currentYear} All rights reserved.`;

  return (
    <footer className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {siteSettings.siteName || userData.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {siteSettings.siteDescription || userData.tagline}
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                if (!social.url) return null;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </Link>
              <Link to="/projects" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Projects
              </Link>
              <Link to="/blog" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact & Footer Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Contact
            </h4>
            <div className="flex flex-col space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {siteSettings.contactEmail && (
                <a href={`mailto:${siteSettings.contactEmail}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {siteSettings.contactEmail}
                </a>
              )}
              {siteSettings.contactPhone && (
                <a href={`tel:${siteSettings.contactPhone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {siteSettings.contactPhone}
                </a>
              )}
              {siteSettings.contactAddress && (
                <p className="text-sm">
                  {siteSettings.contactAddress}
                </p>
              )}
            </div>
            
            {/* Footer Links */}
            {siteSettings.footerLinks && siteSettings.footerLinks.length > 0 && (
              <div className="flex flex-col space-y-2 pt-2">
                {siteSettings.footerLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.url}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {footerText}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> using React & TypeScript
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

