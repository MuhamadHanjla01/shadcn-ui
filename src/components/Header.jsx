'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-blue-600">PlatformX</Link>
        <nav className="flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/pricing" className="hover:text-blue-600 transition">Pricing</Link>
          <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
          <Link href="/admin" className="hover:text-blue-600 transition">Admin</Link>
        </nav>
        <div className="flex gap-3 items-center">
          {!loading && (
            user ? (
              <>
                <span className="text-sm font-medium text-gray-500 mr-2">{user.email}</span>
                <button 
                  onClick={logout}
                  className="text-sm font-medium px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
                <Link href="/login" className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition">Sign Up</Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
