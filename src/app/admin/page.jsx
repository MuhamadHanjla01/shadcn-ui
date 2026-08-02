'use client';
import { useState } from 'react';
import { ProtectedRoute } from '@/lib/auth';

export default function AdminPage() {
  const [resources, setResources] = useState([
    { id: 1, title: 'Advanced Analytics Tutorial', type: 'Tutorial', status: 'Active' },
    { id: 2, title: 'Software Automation Demo', type: 'Interactive Environment', status: 'Active' },
    { id: 3, title: 'SEO Optimization Kit', type: 'Tool', status: 'Draft' },
  ]);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:block">
          <div className="p-6">
            <div className="mb-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Admin Panel</p>
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-blue-600/10 text-blue-500 rounded-lg font-medium border border-blue-500/20">
                  <span className="text-lg">📁</span> Resources
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition font-medium">
                  <span className="text-lg">👥</span> Users
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition font-medium">
                  <span className="text-lg">💰</span> Revenue
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition font-medium">
                  <span className="text-lg">⚙️</span> Settings
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
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">Platform Administration</h1>
              <p className="text-slate-400">Manage your digital resources and active subscribers.</p>
            </header>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
                <h2 className="text-xl font-bold text-white">Resource Database</h2>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  + Add New Resource
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700 text-slate-400">
                    <tr>
                      <th className="p-4 font-medium">Resource Title</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-slate-300">
                    {resources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-4 font-medium text-white">{res.title}</td>
                        <td className="p-4">{res.type}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            res.status === 'Active' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-blue-400 hover:text-blue-300 font-medium mr-4 transition">Edit</button>
                          <button className="text-red-400 hover:text-red-300 font-medium transition">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
