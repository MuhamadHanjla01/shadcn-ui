import { useState, useEffect } from 'react';
import { trackPageView } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Search, Tag } from 'lucide-react';
import { blogPosts as initialBlogPosts } from '@/lib/data';
import { loadBlogPosts } from '@/lib/storage';
import { loadDataFromFile, DATA_FILES } from '@/lib/data-sync';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [posts, setPosts] = useState(initialBlogPosts);

  useEffect(() => {
    trackPageView('blog');
    const load = async () => {
      const blogPosts = await loadDataFromFile(
        DATA_FILES.blogPosts,
        'portfolio_blog_posts',
        initialBlogPosts
      );
      setPosts(blogPosts);
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('portfolioDataUpdated', onUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', onUpdate);
  }, []);

  const allTags = ['All', ...Array.from(new Set(posts.flatMap(post => post.tags)))];
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'All' || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Blog & Articles
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Thoughts, tutorials, and insights about web development, technology, and the ever-evolving digital landscape.
            </p>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Tag className="h-4 w-4 text-slate-500 mt-2" />
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className={selectedTag === tag 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                    : ""
                  }
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600 dark:text-slate-300">
                No articles found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <Card key={post.id} className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Link to={`/blog/${post.id}`}>
                      <Button variant="ghost" className="w-full justify-start p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        Read more →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter Signup */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Stay Updated</h3>
                <p className="text-blue-100">
                  Get notified when I publish new articles about web development, technology, and programming.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-100"
                />
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Subscribe
                </Button>
              </div>
              
              <p className="text-xs text-blue-100">
                No spam, unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Blog;