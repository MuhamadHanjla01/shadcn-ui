import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Github, Linkedin, Twitter } from 'lucide-react';
import { userData as initialUserData } from '@/lib/data';
import { trackPageView } from '@/lib/storage';
import { getDataFromBackend } from '@/lib/backend-api';
import { startRealtimeSync } from '@/lib/realtime-sync';
import type { ContactForm } from '@/types';

const Contact = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [userData, setUserData] = useState<typeof initialUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load contact data from backend
  useEffect(() => {
    trackPageView('contact');
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [backendSettings, backendUser] = await Promise.all([
          getDataFromBackend('site-settings'),
          getDataFromBackend('user')
        ]);
        
        if (backendSettings) {
          setSiteSettings(backendSettings);
        }
        
        if (backendUser) {
          setUserData(backendUser as typeof initialUserData);
        } else {
          setUserData(initialUserData);
        }
      } catch (error) {
        console.error('Error loading contact data:', error);
        setUserData(initialUserData);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Listen for WebSocket updates
    const cleanup = startRealtimeSync((updates) => {
      if (updates.siteSettings) {
        setSiteSettings(updates.siteSettings);
      }
      if (updates.user) {
        setUserData(updates.user);
      }
    });
    
    return cleanup;
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Get backend URL
      const getApiBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          return 'http://localhost:3001';
        }
        return 'https://shadcn-ui-production-8f2d.up.railway.app';
      };
      
      const response = await fetch(`${getApiBaseUrl()}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Contact form submitted successfully');
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        console.error('❌ Contact form submission failed:', result.error);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Build contact info from site settings (filter out empty values)
  const contactInfo = [
    siteSettings?.contactEmail && {
      icon: Mail,
      label: 'Email',
      value: siteSettings.contactEmail,
      href: `mailto:${siteSettings.contactEmail}`
    },
    siteSettings?.contactPhone && {
      icon: Phone,
      label: 'Phone',
      value: siteSettings.contactPhone,
      href: `tel:${siteSettings.contactPhone.replace(/\D/g, '')}`
    },
    siteSettings?.contactAddress && {
      icon: MapPin,
      label: 'Location',
      value: siteSettings.contactAddress,
      href: '#'
    }
  ].filter(Boolean); // Remove null/undefined entries

  const socialLinks = userData ? [
    { icon: Github, href: userData.socialMedia.github, label: 'GitHub' },
    { icon: Linkedin, href: userData.socialMedia.linkedin, label: 'LinkedIn' },
    { icon: Twitter, href: userData.socialMedia.twitter, label: 'Twitter' },
  ] : [];

  // Show loading skeleton
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-20">
          <section className="text-center space-y-8">
            <div className="h-16 w-2/3 mx-auto bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="h-6 w-3/4 mx-auto bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Have a project in mind or want to collaborate? I'd love to hear from you. Let's create something amazing together.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <section className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white flex items-center space-x-2">
                  <Send className="h-6 w-6 text-blue-600" />
                  <span>Send Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={`min-h-32 ${errors.message ? 'border-red-500' : ''}`}
                      placeholder="Tell me about your project or how I can help you..."
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        Thank you for your message! I'll get back to you as soon as possible.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === 'error' && (
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        Sorry, there was an error sending your message. Please try again or contact me directly.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.length > 0 ? (
                  contactInfo.map((info, index) => {
                    if (!info) return null;
                    const Icon = info.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{info.label}</p>
                          {info.href !== '#' ? (
                            <a
                              href={info.href}
                              className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-slate-900 dark:text-white">{info.value}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Contact information will appear here once configured in admin settings.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">
                  Follow Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 hover:scale-110"
                        aria-label={social.label}
                      >
                        <Icon className="h-6 w-6 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Let's Build Something Great</h3>
                <p className="text-blue-100 mb-4">
                  I'm always excited to work on new projects and collaborate with talented people. Whether you have a specific project in mind or just want to explore possibilities, I'd love to hear from you.
                </p>
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Usually responds within 24 hours</span>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;