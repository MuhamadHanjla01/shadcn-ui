import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { blogPosts as initialBlogPosts } from '@/lib/data';
import { loadBlogPosts } from '@/lib/storage';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const load = () => {
      const posts = loadBlogPosts(initialBlogPosts);
      const found = posts.find((p) => p.id === id);
      setPost(found || null);
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('portfolioDataUpdated', onUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', onUpdate);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <p className="text-slate-600 dark:text-slate-300">Post not found.</p>
              <div className="mt-4">
                <Link to="/blog">
                  <Button variant="outline">Back to Blog</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(post.date)}</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {post.readTime} min read</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {post.tags?.map((tag: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900 dark:text-white">Article</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link to="/blog">
            <Button variant="outline">Back to Blog</Button>
          </Link>
          <Link to="/projects">
            <Button className="group">
              View Projects <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

