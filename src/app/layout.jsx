import './globals.css';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth';
import Header from '@/components/Header';

export const metadata = {
  title: 'Content Platform',
  description: 'Subscription based digital resources',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <div className="flex-grow">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
