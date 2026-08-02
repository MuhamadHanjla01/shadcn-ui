'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="absolute top-0 w-full z-50 bg-transparent border-b border-slate-800/50">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Oxaam Logo" className="h-8 object-contain" />
            <span className="font-bold text-2xl tracking-tight text-white">PlatformX</span>
          </Link>
          <span className="hidden lg:inline text-xs font-medium text-slate-400 pl-4 border-l border-slate-700">
            World-Leading Free Digital Marketplace
          </span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          <Link href="#how-it-works" className="hover:text-white transition">How it works</Link>
          <Link href="#why-free" className="hover:text-white transition">Why free?</Link>
          <Link href="#stories" className="hover:text-white transition">Stories</Link>
        </nav>
        
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium px-6 py-2.5 text-white border border-slate-600 hover:border-slate-400 rounded-full transition">
            Sign in
          </Link>
          <Link href="/login" className="text-sm font-bold px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-full transition shadow-lg">
            Create free account
          </Link>
        </div>
      </div>
    </header>
  );
}
