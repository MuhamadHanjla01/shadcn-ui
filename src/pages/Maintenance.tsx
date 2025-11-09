import { Construction, Clock, Mail } from 'lucide-react';
import { SiteSettings } from '@/lib/storage';
import { getDataFromBackend } from '@/lib/backend-api';
import { useEffect, useState } from 'react';

const Maintenance = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Portfolio',
    siteDescription: '',
    seoKeywords: [],
    googleAnalyticsId: '',
    maintenanceMode: false
  });

  useEffect(() => {
    const load = async () => {
      const data = await getDataFromBackend('site-settings');
      if (data) setSettings(data as SiteSettings);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-full">
                <Construction className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              We'll Be Back Soon!
            </h1>
            
            <div className="flex items-center justify-center space-x-2 text-blue-200">
              <Clock className="w-5 h-5 animate-spin" />
              <p className="text-lg">Under Maintenance</p>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed max-w-lg mx-auto">
              We're currently performing scheduled maintenance to improve your experience. 
              We'll be back online shortly. Thank you for your patience!
            </p>

            {/* Animated Progress Bar */}
            <div className="mt-8">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse w-2/3"></div>
              </div>
              <p className="text-sm text-slate-400 mt-2">Working on it...</p>
            </div>

            {/* Contact Info */}
            {settings.contactEmail && (
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-slate-300 mb-3">Need urgent assistance?</p>
                <a 
                  href={`mailto:${settings.contactEmail}`}
                  className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 
                           text-white px-6 py-3 rounded-lg transition-all duration-300 
                           hover:scale-105 border border-white/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Us</span>
                </a>
              </div>
            )}

            {/* Footer Note */}
            <p className="text-sm text-slate-400 mt-8">
              {settings.siteName || 'Portfolio'} - Expected to be back soon
            </p>
          </div>
        </div>

        {/* Admin Access Note */}
        <div className="text-center mt-6">
          <a 
            href="/admin/login" 
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Admin Access →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

