import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-pink-500/30">
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        {/* Background glow for hero */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 mt-10">
          
          {/* Left Column */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-xs font-medium text-slate-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Trusted users in 75+ countries
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Choose <span className="text-pink-500">100+ free</span> digital services & online subscriptions.
            </h1>
            
            <p className="text-lg text-slate-400 mb-8 max-w-xl">
              PlatformX gives you instant access to world-class streaming, productivity, storage, design tools and AI — without paying for each subscription separately.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded border border-slate-700 bg-slate-800/30 text-sm font-medium">
                <span className="text-green-500">✓</span> No credit card required
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded border border-slate-700 bg-slate-800/30 text-sm font-medium">
                <span className="text-orange-500">⚡</span> Instant activation in minutes
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded border border-slate-700 bg-slate-800/30 text-sm font-medium">
                <span className="text-blue-500">🔒</span> Secure dashboard access
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded border border-slate-700 bg-slate-800/30 text-sm font-medium">
                <span className="text-cyan-500">🌍</span> Global perks, local savings
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="lg:ml-auto w-full max-w-md">
            <div className="bg-[#0f1629]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative">
              <h2 className="text-2xl font-bold mb-2">Create your free PlatformX account</h2>
              <p className="text-slate-400 text-sm mb-6">Takes less than 60 seconds. Start claiming your free 100+ online services today.</p>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input type="text" placeholder="Enter your name" className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" placeholder="you@example.com" className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder:text-slate-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                    <input type="tel" placeholder="Contact number" className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <input type="password" placeholder="Create password" className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder:text-slate-600" />
                  </div>
                </div>
                
                <button type="button" className="w-full py-4 mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-lg transition">
                  Create free account
                </button>
                
                <div className="text-center mt-4">
                  <span className="text-slate-400 text-sm">Already have an account? </span>
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">Sign in here</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="px-6 py-4 mb-20 relative z-10">
        <div className="max-w-[1200px] mx-auto border border-slate-700 bg-slate-800/30 rounded-full px-8 py-6 flex flex-wrap justify-between items-center gap-6 text-center divide-x divide-slate-700/50">
          <div className="flex-1 px-4">
            <h3 className="font-bold text-xl">2 Million+ Users</h3>
            <p className="text-slate-400 text-sm">already saving on subscriptions</p>
          </div>
          <div className="flex-1 px-4">
            <h3 className="font-bold text-xl">100+ services</h3>
            <p className="text-slate-400 text-sm">streaming, cloud, design, AI & more</p>
          </div>
          <div className="flex-1 px-4">
            <h3 className="font-bold text-xl">25M+ monthly</h3>
            <p className="text-slate-400 text-sm">page visits worldwide</p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 py-16" id="why-free">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12 max-w-3xl">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Why Users Love PlatformX</h4>
            <h2 className="text-4xl font-extrabold mb-4">One account. 100+ premium subscriptions.</h2>
            <p className="text-slate-400">Instead of paying for every single subscription, PlatformX aggregates perks and plans from multiple partners into one easy-to-use dashboard. You pick what you need and redeem in seconds.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cards */}
            {[
              { icon: '🎬', title: 'Streaming & Entertainment', desc: 'Access music, movies and shows from top OTT and audio platforms — save your money for popcorn, not monthly fees.' },
              { icon: '📊', title: 'Productivity & Office', desc: 'Upgrade your productivity stack with premium note-taking, office suites and project-management tools.' },
              { icon: '☁️', title: 'Cloud Storage', desc: 'Store photos, backups and important files with generous cloud storage add-ons, all accessible via your dashboard.' },
              { icon: '🎨', title: 'Design & Creative', desc: 'Get access to pro-grade design, editing and creative suites — perfect for freelancers, creators and agencies.' },
              { icon: '🤖', title: 'AI-powered tools', desc: 'Chatbots, copywriting tools, and AI assistants to help you code, write, summarise and brainstorm ideas faster.' },
              { icon: '🛡️', title: 'Security & VPN', desc: 'Stay private and secure with VPNs, password managers and other protection tools included in your perks.' },
            ].map((card, i) => (
              <div key={i} className="bg-[#0a0f1d] border border-slate-700/60 p-6 rounded-xl hover:border-slate-500 transition duration-300">
                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-xl mb-4 border border-slate-700">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 bg-[#0a0f1d]" id="how-it-works">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">How it works</h4>
            <h2 className="text-4xl font-extrabold mb-4">3 simple steps to start saving</h2>
            <p className="text-slate-400 max-w-2xl">Getting started is easy. Create your free account, choose your favourite subscriptions and let us handle the rest.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Create your free account', desc: 'Register with your name, email and mobile number. No credit card, no hidden charges.' },
              { num: '2', title: 'Browse 100+ perks', desc: 'Explore streaming, productivity, storage, design and AI tools curated for different needs.' },
              { num: '3', title: 'Claim & activate', desc: 'Redeem the services you want, follow simple activation steps, and enjoy your new perks.' },
            ].map((step, i) => (
              <div key={i} className="border-2 border-dashed border-slate-700 p-8 rounded-xl relative">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center mb-6">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="px-6 py-20" id="stories">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Loved by users worldwide</h4>
            <h2 className="text-4xl font-extrabold">Real stories from the community</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Claimed design tools, VPN and cloud storage worth more than $20k in a single weekend. Activation was smooth and support was responsive.", name: "Arjun Mehta", role: "India • Freelance designer" },
              { quote: "As a student, paying for multiple subscriptions was impossible. With PlatformX I got the key tools I needed for free, in one place.", name: "Sara Khan", role: "UAE • University student" },
              { quote: "Our small remote team now uses a project suite, storage upgrades and AI tools — all discovered through PlatformX. Huge savings every month.", name: "David Chen", role: "USA • Startup founder" },
            ].map((story, i) => (
              <div key={i} className="bg-[#0a0f1d] border border-slate-700/60 p-8 rounded-xl">
                <p className="text-white font-medium mb-8 leading-relaxed">"{story.quote}"</p>
                <div>
                  <h4 className="font-bold text-white">{story.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{story.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#050812] pt-16 pb-8 px-6">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Platform Logo" className="h-8 object-contain" />
              <span className="font-bold text-xl tracking-tight">PlatformX</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pr-4">
              PlatformX is a free digital marketplace that helps you discover and unlock 100+ premium subscriptions and tools — streaming, productivity, storage, design and AI — from a single, simple dashboard.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Popular regions</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>India 🇮🇳</li>
              <li>United States 🇺🇸</li>
              <li>United Arab Emirates 🇦🇪</li>
              <li>Spain 🇪🇸</li>
              <li>Nigeria 🇳🇬</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Top categories</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Streaming & entertainment</li>
              <li>AI assistants & tools</li>
              <li>Cloud storage & backup</li>
              <li>Design & creative suites</li>
              <li>Security & VPN</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Support: support@example.com</li>
              <li>Alternate: contact@example.com</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
