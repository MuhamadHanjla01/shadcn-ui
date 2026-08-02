'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-xl border shadow-sm max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Use 'admin' in email for admin role)</label>
            <input 
              type="email" 
              required
              className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password (Any)</label>
            <input 
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          For demo purposes, password verification is mocked.
        </div>
      </div>
    </main>
  );
}
