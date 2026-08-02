export default function PricingPage() {
  const plans = [
    {
      name: 'Free Tier',
      price: '$0',
      description: 'Basic access to community features and limited tools.',
      features: ['Access to Free Tools', 'Community Support', 'Basic Tutorials'],
      cta: 'Get Started Free',
      highlighted: false,
    },
    {
      name: 'Pro Subscription',
      price: '$19.99',
      period: '/mo',
      description: 'Full access to all premium design, SEO, and marketing tools.',
      features: [
        'All Premium Tools Unlocked',
        'Priority 24/7 Support',
        'Exclusive Masterclasses',
        'Early Access to Beta Tools',
        'Cancel Anytime',
      ],
      cta: 'Subscribe Now',
      highlighted: true,
    }
  ];

  return (
    <main className="min-h-screen py-24 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Stop paying for dozens of separate subscriptions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto justify-center">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`flex-1 rounded-3xl p-8 relative ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.2)]' 
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
              <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                {plan.period && <span className="text-slate-400">{plan.period}</span>}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-slate-300">
                    <span className="text-blue-500 mr-3 text-lg">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-4 rounded-xl font-bold transition ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
