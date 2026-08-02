'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login logic
    let role = 'user';
    if (email.includes('admin')) {
      role = 'admin';
    }
    const mockUser = { email, role };
    setUser(mockUser);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requireAdmin && user.role !== 'admin') {
        router.push('/dashboard'); // redirect to normal dashboard if not admin
      }
    }
  }, [user, loading, requireAdmin, router]);

  if (loading || !user || (requireAdmin && user.role !== 'admin')) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return children;
}
