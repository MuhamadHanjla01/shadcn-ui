import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save,
  CheckCircle,
  Palette,
  Type,
  Moon,
  Sun,
  Download,
  Info
} from 'lucide-react';
import { loadThemeSettingsSync, saveThemeSettings, exportThemeSettings, ThemeSettings, loadSiteSettings, saveSiteSettings, SiteSettings } from '@/lib/storage';
import { toast } from 'sonner';

const ThemeSettingsPage = () => {
  const [settings, setSettings] = useState<ThemeSettings>(loadThemeSettingsSync());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(loadSiteSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      saveThemeSettings(settings);
      saveSiteSettings(siteSettings);
      
      toast.success('Theme settings saved successfully!', {
        description: 'Changes applied locally. Use Settings page to publish to GitHub.'
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving theme settings:', error);
      setSaveStatus('error');
      toast.error('Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    exportThemeSettings(settings);
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setSiteSettings(prev => ({ ...prev, logo: dataUrl }));
  };

  const colorPresets = [
    { name: 'Blue', primary: '#2563eb', secondary: '#4f46e5' },
    { name: 'Purple', primary: '#9333ea', secondary: '#7c3aed' },
    { name: 'Green', primary: '#059669', secondary: '#10b981' },
    { name: 'Red', primary: '#dc2626', secondary: '#ef4444' },
    { name: 'Orange', primary: '#ea580c', secondary: '#f97316' }
  ];

  const fontPresets = [
    'system-ui',
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat'
  ];

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Theme Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Customize the look and feel of your portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInstructions(!showInstructions)}
            className="hidden sm:flex"
          >
            <Info className="h-4 w-4 mr-2" />
            GitHub Pages
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export theme.json
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
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {showInstructions && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="space-y-2">
              <p className="font-semibold">To apply theme on GitHub Pages:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click "Export theme.json" button to download the theme file</li>
                <li>Upload the file to your repository at <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">public/theme.json</code></li>
                <li>Commit and push the changes to your repository</li>
                <li>GitHub Pages will rebuild and all users will see the new theme</li>
              </ol>
              <p className="text-sm mt-2">Note: Local preview uses localStorage. The exported theme.json will be used on GitHub Pages.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Theme settings saved successfully! Changes will be applied immediately.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Color Scheme</CardTitle>
          </div>
          <CardDescription>Choose your primary and secondary colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site-name">Site Name</Label>
              <input
                id="site-name"
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="mt-2 px-3 py-2 border rounded w-full"
                placeholder="Your brand or name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSettings({
                  ...settings,
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary
                })}
                className="group relative"
              >
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                  <div
                    className="h-1/2 w-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="h-1/2 w-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <p className="text-sm text-center mt-2 group-hover:text-blue-600">
                  {preset.name}
                </p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="h-10 w-20 rounded border"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="h-10 w-20 rounded border"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Brand Logo</CardTitle>
          </div>
          <CardDescription>Use an image or text initials as your logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Mode Switch */}
          <div className="flex items-center gap-2">
            <Button
              variant={siteSettings.logoMode === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSiteSettings(prev => ({ ...prev, logoMode: 'image' }))}
            >
              Image
            </Button>
            <Button
              variant={siteSettings.logoMode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSiteSettings(prev => ({ ...prev, logoMode: 'text' }))}
            >
              Text
            </Button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center">
              {siteSettings.logoMode === 'image' ? (
                siteSettings.logo ? (
                  <img src={siteSettings.logo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">No logo</div>
                )
              ) : (
                <span className="font-bold text-slate-700">
                  {(siteSettings.logoText || 'AC').slice(0, 3)}
                </span>
              )}
            </div>

            {siteSettings.logoMode === 'image' ? (
              <div className="flex items-center gap-2">
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                    e.currentTarget.value = '';
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-file-input')?.click()}>
                  Choose Logo
                </Button>
                {siteSettings.logo && (
                  <Button variant="ghost" size="sm" onClick={() => setSiteSettings(prev => ({ ...prev, logo: '' }))}>
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div>
                  <Label htmlFor="logo-text">Logo Text (1–3 chars)</Label>
                  <input
                    id="logo-text"
                    type="text"
                    value={siteSettings.logoText || ''}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, logoText: e.target.value.toUpperCase().slice(0, 3) }))}
                    className="mt-1 px-3 py-2 border rounded w-28"
                    placeholder="AC"
                    maxLength={3}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            <CardTitle>Typography</CardTitle>
          </div>
          <CardDescription>Select your preferred font family</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fontPresets.map((font) => (
              <Button
                key={font}
                variant={settings.fontFamily === font ? 'default' : 'outline'}
                onClick={() => setSettings({ ...settings, fontFamily: font })}
                className="justify-start"
                style={{ fontFamily: font }}
              >
                {font}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <CardTitle>Dark Mode</CardTitle>
          </div>
          <CardDescription>Toggle dark mode preference (for reference only)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={!settings.darkMode ? 'default' : 'outline'}
              onClick={() => setSettings({ ...settings, darkMode: false })}
            >
              <Sun className="h-4 w-4 mr-2" />
              Light Mode
            </Button>
            <Button
              variant={settings.darkMode ? 'default' : 'outline'}
              onClick={() => setSettings({ ...settings, darkMode: true })}
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeSettingsPage;