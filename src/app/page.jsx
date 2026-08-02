import Link from 'next/link';

export default function Home() {
  const tools = [
    { name: 'SEO Optimizer Pro', category: 'Marketing', icon: '🔍' },
    { name: 'Design Studio Beta', category: 'Creative', icon: '✨' },
    { name: 'Copywriter AI', category: 'Productivity', icon: '📝' },
    { name: 'Video Renderer Plus', category: 'Creative', icon: '🎥' },
    { name: 'Social Scheduler', category: 'Marketing', icon: '📱' },
    { name: 'Code Assistant X', category: 'Development', icon: '💻' },
  ];

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-[100px] rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm text-slate-300 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            Unlock premium digital tools today
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Access world-class tools.<br />
            <span className="gradient-text">All in one platform.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop paying thousands for individual subscriptions. Get instant access to the best digital marketing, design, and productivity tools under a single dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-[0_0_30px_rgba(37,99,235,0.4)] text-lg">
              View Pricing & Plans
            </Link>
            <Link href="/dashboard" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition border border-slate-700 text-lg">
              Browse Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Tool Grid Section */}
      <section className="py-24 px-6 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported Tools & Services</h2>
            <p className="text-slate-400">Instantly access these premium tools with an active subscription.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, idx) => (
              <div key={idx} className="group relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                <p className="text-slate-400 text-sm mb-6">Premium {tool.category} tool for professional creators.</p>
                <div className="flex items-center text-blue-400 font-medium text-sm group-hover:text-blue-300">
                  Access Tool <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
