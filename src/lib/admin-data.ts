/**
 * Admin Data - Legacy file
 * 
 * This file previously contained mock data for the admin dashboard.
 * All dashboard statistics are now loaded from real data via the dashboard-service.
 * 
 * Data sources:
 * - Projects: localStorage via storage.ts (loadProjects)
 * - Blog Posts: localStorage via storage.ts (loadBlogPosts)
 * - Messages: localStorage via storage.ts (loadMessages)
 * - Analytics: localStorage via storage.ts (loadAnalytics)
 * 
 * For dashboard statistics, use: @/lib/dashboard-service
 * For authentication, use: @/contexts/AdminAuthContext
 */

import { AdminUser } from '@/types/admin';

// This is kept for backward compatibility only
// Authentication is now handled by AdminAuthContext
export const mockAdminUser: AdminUser = {
  id: 'default-admin-001',
  email: 'Hanjla.Muhamad@admin.com',
  name: 'Hanjla Muhamad',
  role: 'admin',
  lastLogin: new Date().toISOString(),
  twoFactorEnabled: false
};