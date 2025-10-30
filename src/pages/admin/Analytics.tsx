import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3,
  Eye,
  Users,
  FileText,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { loadAnalytics, AnalyticsData } from '@/lib/storage';

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(loadAnalytics());

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(loadAnalytics());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: 'Total Visits',
      value: analytics.totalVisits.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Page Views',
      value: Object.values(analytics.pageViews).reduce((a, b) => a + b, 0).toLocaleString(),
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Project Views',
      value: Object.values(analytics.projectViews).reduce((a, b) => a + b, 0).toLocaleString(),
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Blog Views',
      value: Object.values(analytics.blogViews).reduce((a, b) => a + b, 0).toLocaleString(),
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  const pageViews = Object.entries(analytics.pageViews).map(([page, views]) => ({
    page: page.charAt(0).toUpperCase() + page.slice(1),
    views
  })).sort((a, b) => b.views - a.views);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track your portfolio performance and visitor engagement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Page Views
            </CardTitle>
            <CardDescription>Most visited pages on your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageViews.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{item.page}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                        style={{
                          width: `${(item.views / Math.max(...pageViews.map(p => p.views))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white w-12 text-right">
                      {item.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Analytics Info
            </CardTitle>
            <CardDescription>Analytics tracking information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Last Updated</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {new Date(analytics.lastUpdated).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📊 Analytics are tracked automatically when visitors navigate your portfolio. 
                Data is stored locally in the browser.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 For production analytics, consider integrating Google Analytics or similar services.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;