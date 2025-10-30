import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save,
  CheckCircle,
  Settings as SettingsIcon,
  Globe,
  Key,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Plus,
  Twitter,
  Share2
} from 'lucide-react';
import { loadSiteSettings, saveSiteSettings, SiteSettings, clearAllStorage } from '@/lib/storage';
import { toast } from 'sonner';

const Settings = () => {
  const [settings, setSettings] = useState<SiteSettings>(loadSiteSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      saveSiteSettings(settings);
      setSaveStatus('success');
      toast.success('Settings saved successfully!');
      
      // Update favicon dynamically
      if (settings.favicon) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = settings.favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      
      // Update page title
      if (settings.metaTitle) {
        document.title = settings.metaTitle;
      }
      
      // Dispatch custom event for maintenance mode changes
      window.dispatchEvent(new Event('maintenanceModeChange'));
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      clearAllStorage();
      window.location.reload();
    }
  };

  const updateKeywords = (keywordsString: string) => {
    const keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k);
    setSettings({ ...settings, seoKeywords: keywords });
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingOgImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, ogImage: reader.result as string });
        toast.success('OG Image uploaded! Remember to save settings.');
        setUploadingOgImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading OG image:', error);
      toast.error('Failed to upload OG image');
      setUploadingOgImage(false);
    }
  };

  const addFooterLink = () => {
    const newLinks = [...(settings.footerLinks || []), { label: 'New Link', url: '#' }];
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const updateFooterLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...(settings.footerLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const removeFooterLink = (index: number) => {
    const newLinks = settings.footerLinks?.filter((_, i) => i !== index) || [];
    setSettings({ ...settings, footerLinks: newLinks });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Site Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure everything from favicon to footer
          </p>
        </div>
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
              Save All Settings
            </>
          )}
        </Button>
      </div>

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            All settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Favicon Info */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <ImageIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Favicon automatically uses your Brand Logo</strong> from Theme Settings. 
              Go to <strong>Theme Settings</strong> to configure your logo (image or text initials).
            </AlertDescription>
          </Alert>

          {/* Site Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Site Information</CardTitle>
              </div>
              <CardDescription>Basic information about your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="My Portfolio"
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  placeholder="A brief description of your portfolio"
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Meta Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Meta Tags</CardTitle>
              </div>
              <CardDescription>Configure SEO and browser display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Page Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.metaTitle || ''}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  placeholder="My Portfolio - Full Stack Developer"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Appears in browser tab and search results
                </p>
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.metaDescription || ''}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  placeholder="Professional portfolio showcasing my projects, skills, and experience..."
                  className="min-h-20"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Shown in search engine results (150-160 characters recommended)
                </p>
              </div>
              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={settings.metaKeywords || ''}
                  onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                  placeholder="portfolio, web developer, full stack, react, typescript"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Comma-separated keywords for SEO
                </p>
              </div>
              <div>
                <Label htmlFor="seoKeywords">SEO Keywords (Legacy)</Label>
                <Input
                  id="seoKeywords"
                  value={settings.seoKeywords.join(', ')}
                  onChange={(e) => updateKeywords(e.target.value)}
                  placeholder="portfolio, developer, web development"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                <CardTitle>Social Sharing (Open Graph)</CardTitle>
              </div>
              <CardDescription>Configure how your site appears when shared on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ogImage">Open Graph Image</Label>
                <div className="space-y-3">
                  {settings.ogImage && (
                    <div className="w-full max-w-md rounded border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <img src={settings.ogImage} alt="OG Preview" className="w-full h-auto" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={ogImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleOgImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => ogImageInputRef.current?.click()}
                      disabled={uploadingOgImage}
                      variant="outline"
                    >
                      {uploadingOgImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload OG Image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      Recommended: 1200x630px, JPG/PNG, max 5MB
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  value={settings.twitterHandle || ''}
                  onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                  placeholder="@yourusername"
                />
                <p className="text-xs text-slate-500 mt-1">
                  For Twitter Card attribution
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Footer Settings</CardTitle>
              </div>
              <CardDescription>Control footer visibility and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Footer Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <Label htmlFor="footerEnabled" className="text-base font-semibold">
                    Enable Footer
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Show or hide the footer on all pages
                  </p>
                </div>
                <Switch
                  id="footerEnabled"
                  checked={settings.footerEnabled !== false} // Default to true if undefined
                  onCheckedChange={(checked) => setSettings({ ...settings, footerEnabled: checked })}
                />
              </div>

              {/* Footer Text - Only show if footer is enabled */}
              {settings.footerEnabled !== false && (
                <div>
                  <Label htmlFor="footerText">Copyright Text</Label>
                  <Input
                    id="footerText"
                    value={settings.footerText || ''}
                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                    placeholder="© 2024 All rights reserved."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Displayed at the bottom of every page
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {settings.footerEnabled !== false && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      <CardTitle>Footer Links</CardTitle>
                    </div>
                    <CardDescription>Links displayed in the footer</CardDescription>
                  </div>
                  <Button onClick={addFooterLink} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings.footerLinks && settings.footerLinks.length > 0 ? (
                    settings.footerLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={link.label}
                            onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                            placeholder="Link Label"
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                            placeholder="/page or https://..."
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFooterLink(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No footer links yet. Click "Add Link" to create one.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Contact Information</CardTitle>
              </div>
              <CardDescription>Display contact details on your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="contactAddress">Address</Label>
                <Textarea
                  id="contactAddress"
                  value={settings.contactAddress || ''}
                  onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <CardTitle>Analytics & Integrations</CardTitle>
              </div>
              <CardDescription>Connect third-party services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                <Input
                  id="googleAnalytics"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Add your Google Analytics tracking ID to monitor site traffic
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                <CardTitle>Site Status</CardTitle>
              </div>
              <CardDescription>Control site availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-slate-500">
                    Temporarily disable public access to your portfolio
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </div>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Resetting will delete all your portfolio data including projects, blog posts, messages, and settings. This action cannot be undone.
                </AlertDescription>
              </Alert>
              <Button variant="destructive" onClick={handleReset}>
                Reset All Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
