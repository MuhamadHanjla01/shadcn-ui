import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Plus,
  Trash2,
  CheckCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { blogPosts as initialBlogPosts } from '@/lib/data';
import { saveBlogPosts, isRecentlySaved, loadBlogPosts } from '@/lib/storage';
import { loadDataFromFile, DATA_FILES } from '@/lib/data-sync';
import { saveDataToBackend, getDataFromBackend } from '@/lib/backend-api';
import { BlogPost } from '@/types';
import { notificationService } from '@/lib/notification-service';
import { toast } from 'sonner';

const BlogManager = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load data - prioritize backend API, fallback to localStorage/JSON files
    const loadLatestData = async () => {
      try {
        console.log('📥 Loading blog posts from backend API...');
        
        // Try to load from backend API first
        const backendBlogPosts = await getDataFromBackend('blog-posts');
        
        let freshBlogPosts;
        
        if (backendBlogPosts) {
          freshBlogPosts = backendBlogPosts;
          saveBlogPosts(backendBlogPosts);
          console.log('✅ Loaded blog posts from backend API');
        } else {
          const blogPostsKey = 'portfolio_blog_posts';
          if (isRecentlySaved(blogPostsKey, 5)) {
            freshBlogPosts = loadBlogPosts(initialBlogPosts);
          } else {
            freshBlogPosts = await loadDataFromFile(
              DATA_FILES.blogPosts,
              blogPostsKey,
              initialBlogPosts,
              true
            );
          }
        }
        
        if (freshBlogPosts) setBlogPosts(freshBlogPosts);
      } catch (error) {
        console.error('Error loading latest data:', error);
        // Fallback to localStorage on error
        const stored = localStorage.getItem('portfolio_blog_posts');
        if (stored) {
          try {
            setBlogPosts(JSON.parse(stored));
          } catch (e) {}
        }
      }
    };

    loadLatestData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Save ONLY to backend API - no localStorage!
      const saveResult = await saveDataToBackend('blog-posts', blogPosts);
      
      if (saveResult.success) {
        toast.success('Changes saved successfully!', {
          description: 'Users will see updates instantly via WebSocket'
        });
        setSaveStatus('success');
        
        // Add success notification
        notificationService.addNotification(
          'success',
          'Blog Posts Saved',
          `Successfully updated ${blogPosts.length} blog post${blogPosts.length !== 1 ? 's' : ''}`,
          '/admin/blog'
        );
        
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        toast.error('Failed to save to backend', {
          description: saveResult.message
        });
        setSaveStatus('error');
        
        // Add error notification
        notificationService.addNotification(
          'warning',
          'Save Failed',
          'Failed to save blog posts. Please try again.',
          '/admin/blog'
        );
      }
    } catch (error) {
      console.error('Error saving blog posts:', error);
      toast.error('Save failed', {
        description: 'Could not connect to backend server'
      });
      setSaveStatus('error');
      
      // Add error notification
      notificationService.addNotification(
        'warning',
        'Save Failed',
        'Failed to save blog posts. Please try again.',
        '/admin/blog'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addPost = () => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: '',
      content: '',
      excerpt: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      readTime: 5
    };
    setBlogPosts([newPost, ...blogPosts]);
  };

  const updatePost = (index: number, field: keyof BlogPost, value: any) => {
    const updated = [...blogPosts];
    updated[index] = { ...updated[index], [field]: value };
    setBlogPosts(updated);
  };

  const deletePost = (index: number) => {
    setBlogPosts(blogPosts.filter((_, i) => i !== index));
  };

  const updateTags = (index: number, tagsString: string) => {
    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
    updatePost(index, 'tags', tags);
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Blog Manager</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create and manage your blog posts
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={addPost} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Post
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
                Save All
              </>
            )}
          </Button>
        </div>
      </div>

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Blog posts updated successfully! Refresh the Blog page to see changes.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {blogPosts.map((post, index) => (
          <Card key={post.id}>
            <CardHeader className="bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Post #{index + 1}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => deletePost(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={post.title}
                  onChange={(e) => updatePost(index, 'title', e.target.value)}
                  placeholder="Post title"
                />
              </div>

              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={post.excerpt}
                  onChange={(e) => updatePost(index, 'excerpt', e.target.value)}
                  placeholder="Brief summary of the post..."
                  className="min-h-20"
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  value={post.content}
                  onChange={(e) => updatePost(index, 'content', e.target.value)}
                  placeholder="Full post content..."
                  className="min-h-40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={post.date}
                    onChange={(e) => updatePost(index, 'date', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Read Time (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={post.readTime}
                    onChange={(e) => updatePost(index, 'readTime', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={post.tags.join(', ')}
                    onChange={(e) => updateTags(index, e.target.value)}
                    placeholder="React, JavaScript"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;