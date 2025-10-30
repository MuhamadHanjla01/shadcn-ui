import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Projects from '@/pages/Projects';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import Maintenance from '@/pages/Maintenance';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import HomeEditor from '@/pages/admin/HomeEditor';
import AboutEditor from '@/pages/admin/AboutEditor';
import ProjectsManager from '@/pages/admin/ProjectsManager';
import BlogManager from '@/pages/admin/BlogManager';
import Messages from '@/pages/admin/Messages';
import MediaLibrary from '@/pages/admin/MediaLibrary';
import ThemeSettings from '@/pages/admin/ThemeSettings';
import Analytics from '@/pages/admin/Analytics';
import Settings from '@/pages/admin/Settings';
import Profile from '@/pages/admin/Profile';
import { loadSiteSettings } from '@/lib/storage';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

// Maintenance Mode Wrapper for Public Routes
const MaintenanceWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    // Check maintenance mode on mount
    const checkMaintenanceMode = () => {
      const settings = loadSiteSettings();
      setIsMaintenanceMode(settings.maintenanceMode);
    };

    checkMaintenanceMode();

    // Listen for storage changes (when settings are updated)
    const handleStorageChange = () => {
      checkMaintenanceMode();
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('maintenanceModeChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('maintenanceModeChange', handleStorageChange);
    };
  }, []);

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { auth, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Routes Component
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="home" element={<HomeEditor />} />
        <Route path="about" element={<AboutEditor />} />
        <Route path="projects" element={<ProjectsManager />} />
        <Route path="blog" element={<BlogManager />} />
        <Route path="messages" element={<Messages />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="theme" element={<ThemeSettings />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            {/* Public Portfolio Routes with Maintenance Mode Check */}
            <Route
              path="/*"
              element={
                <MaintenanceWrapper>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:id" element={<BlogPost />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </MaintenanceWrapper>
              }
            />
            
            {/* Admin Routes - Always Accessible */}
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;