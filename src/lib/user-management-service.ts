import { AdminUser } from '@/types/admin';

const USERS_STORAGE_KEY = 'admin_users';
const CURRENT_USER_KEY = 'current_admin_user';

/**
 * User Management Service
 * Manages admin users in localStorage (for local auth mode)
 */

// Default admin user
const DEFAULT_ADMIN: AdminUser & { password: string } = {
  id: 'default-admin-001',
  email: 'Hanjla.Muhamad@admin.com',
  name: 'Hanjla Muhamad',
  role: 'admin',
  password: 'Hanjla.admin', // Hashed in production
  lastLogin: new Date().toISOString(),
  twoFactorEnabled: false
};

interface StoredUser extends AdminUser {
  password: string;
}

// Load all users
export const loadUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      // Initialize with default admin
      const defaultUsers = [DEFAULT_ADMIN];
      saveUsers(defaultUsers);
      return defaultUsers;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading users:', error);
    return [DEFAULT_ADMIN];
  }
};

// Save all users
export const saveUsers = (users: StoredUser[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Get user by email
export const getUserByEmail = (email: string): StoredUser | null => {
  const users = loadUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Get user by ID
export const getUserById = (id: string): StoredUser | null => {
  const users = loadUsers();
  return users.find(u => u.id === id) || null;
};

// Create new user
export const createUser = (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'editor' = 'editor'
): { success: boolean; error?: string; user?: AdminUser } => {
  try {
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    // Validate password
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    // Check if email already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    const users = loadUsers();
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      role,
      password, // In production, this should be hashed
      lastLogin: new Date().toISOString(),
      twoFactorEnabled: false
    };

    users.push(newUser);
    saveUsers(users);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
};

// Update user
export const updateUser = (
  userId: string,
  updates: Partial<Omit<StoredUser, 'id'>>
): { success: boolean; error?: string; user?: AdminUser } => {
  try {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Validate email if being updated
    if (updates.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        return { success: false, error: 'Invalid email address' };
      }
      // Check if email already exists for another user
      const existingUser = getUserByEmail(updates.email);
      if (existingUser && existingUser.id !== userId) {
        return { success: false, error: 'Email already exists' };
      }
    }

    // Validate name if being updated
    if (updates.name && updates.name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);

    // Update current user session if updating own profile
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const { password: _, ...userWithoutPassword } = users[userIndex];
      setCurrentUser(userWithoutPassword);
    }

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
};

// Update password
export const updatePassword = (
  userId: string,
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    // Update password
    user.password = newPassword; // In production, this should be hashed
    saveUsers(users);

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: 'Failed to update password' };
  }
};

// Delete user
export const deleteUser = (userId: string): { success: boolean; error?: string } => {
  try {
    const users = loadUsers();
    
    // Prevent deleting the last admin
    const admins = users.filter(u => u.role === 'admin');
    const userToDelete = users.find(u => u.id === userId);
    
    if (userToDelete?.role === 'admin' && admins.length === 1) {
      return { success: false, error: 'Cannot delete the last admin user' };
    }

    const filtered = users.filter(u => u.id !== userId);
    saveUsers(filtered);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
};

// Get all users (without passwords)
export const getAllUsers = (): AdminUser[] => {
  const users = loadUsers();
  return users.map(({ password: _, ...user }) => user);
};

// Set current user
export const setCurrentUser = (user: AdminUser): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Get current user
export const getCurrentUser = (): AdminUser | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Authenticate user
export const authenticateUser = (
  email: string,
  password: string
): { success: boolean; error?: string; user?: AdminUser } => {
  try {
    const user = getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    updateUser(user.id, { lastLogin: user.lastLogin });

    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

export const userManagementService = {
  loadUsers,
  saveUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
  getAllUsers,
  setCurrentUser,
  getCurrentUser,
  authenticateUser
};

