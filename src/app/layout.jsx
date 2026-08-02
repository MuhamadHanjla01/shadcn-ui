import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Content Platform',
  description: 'Subscription based digital resources',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight text-blue-600">PlatformX</Link>
            <nav className="flex gap-6 text-sm font-medium text-gray-600">
              <Link href="/pricing" className="hover:text-blue-600 transition">Pricing</Link>
              <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
              <Link href="/admin" className="hover:text-blue-600 transition">Admin</Link>
            </nav>
            <div className="flex gap-3">
              <button className="text-sm font-medium px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</button>
              <button className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition">Sign Up</button>
            </div>
          </div>
        </header>
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}
