'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="glass p-8 sm:p-12 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to access your digital workspace.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
              placeholder="user@example.com (use admin@... for admin panel)"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition">Forgot?</a>
            </div>
            <input 
              type="password"
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-4"
          >
            Sign In to Dashboard
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center text-sm text-slate-400">
          Don't have an account? <a href="#" className="text-blue-400 font-medium hover:text-blue-300">Sign up now</a>
        </div>
      </div>
    </main>
  );
}
