'use client';

import { ProtectedRoute, useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const resources = [
    { name: 'Advanced Analytics Tutorial', type: 'Tutorial', active: true, icon: '📊' },
    { name: 'Software Automation Demo', type: 'Interactive Environment', active: true, icon: '⚙️' },
    { name: 'SEO Optimization Kit', type: 'Tool', active: false, icon: '🔍' },
    { name: 'Design Assets Library', type: 'Assets', active: false, icon: '🎨' },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:block">
          <div className="p-6">
            <div className="mb-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Main Menu</p>
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-blue-600/10 text-blue-500 rounded-lg font-medium border border-blue-500/20">
                  <span className="text-lg">📱</span> My Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition font-medium">
                  <span className="text-lg">📁</span> All Resources
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition font-medium">
                  <span className="text-lg">💬</span> Support Tickets
                </a>
              </nav>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Account</p>
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition font-medium">
                  <span className="text-lg">⚙️</span> Settings
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition font-medium">
                  <span className="text-lg">💳</span> Billing
                </a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 relative">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="max-w-5xl mx-auto relative z-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.email?.split('@')[0]}!</h1>
                <p className="text-slate-400">Manage your active subscriptions and access your tools below.</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-sm font-medium text-slate-300">Premium Active</span>
              </div>
            </header>
            
            <h2 className="text-xl font-bold text-white mb-6">Your Resources</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res, idx) => (
                <div 
                  key={idx} 
                  className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                    res.active 
                      ? 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] group' 
                      : 'bg-slate-900/50 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {res.icon}
                    </div>
                    {!res.active && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400">
                        Upgrade Required
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-white mb-1">{res.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">{res.type}</p>
                  
                  {res.active ? (
                    <button className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-600 rounded-lg font-medium transition duration-300">
                      Access Now
                    </button>
                  ) : (
                    <button className="w-full py-2.5 bg-slate-800 text-slate-500 border border-slate-700 rounded-lg font-medium cursor-not-allowed">
                      Locked
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
