import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  CheckCircle,
  Info
} from 'lucide-react';

const MediaLibrary = () => {
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop'
  ]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setImages([url, ...images]);
    }
  };

  const deleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Media Library</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage images for your portfolio
          </p>
        </div>
        <Button onClick={addImageUrl}>
          <Upload className="h-4 w-4 mr-2" />
          Add Image URL
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Click on any image URL to copy it. Use these URLs in your projects, blog posts, or profile settings.
          For best results, use external image hosting services like Unsplash, Imgur, or Cloudinary.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((url, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                }}
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={url}
                  readOnly
                  className="text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(url)}
                >
                  {copiedUrl === url ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteImage(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No images in library</p>
            <Button onClick={addImageUrl} className="mt-4">
              Add Your First Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaLibrary;