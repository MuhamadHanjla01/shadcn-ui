'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">O</div>
          <span className="font-bold text-2xl tracking-tight text-white">PlatformX</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="/admin" className="hover:text-white transition">Admin</Link>
        </nav>
        <div className="flex gap-4 items-center">
          {!loading && (
            user ? (
              <>
                <span className="hidden sm:inline text-sm font-medium text-slate-400 mr-2">{user.email}</span>
                <button 
                  onClick={logout}
                  className="text-sm font-medium px-5 py-2.5 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition border border-slate-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium px-5 py-2.5 text-slate-300 hover:text-white transition">Sign In</Link>
                <Link href="/login" className="text-sm font-bold px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition shadow-[0_0_15px_rgba(37,99,235,0.5)]">Get Started</Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
