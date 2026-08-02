import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white text-center">
      <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-gray-900">
        Unlock Premium Digital Resources
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        Join our exclusive platform to access high-quality tutorials, software automation demos, and specialized content designed to accelerate your workflow.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/pricing" 
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
        >
          View Subscription Plans
        </Link>
        <Link 
          href="/dashboard" 
          className="bg-white text-blue-600 border border-blue-200 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition shadow-sm"
        >
          Go to Dashboard
        </Link>
      </div>

      <div className="mt-20 pt-10 border-t w-full max-w-4xl text-left grid md:grid-cols-3 gap-8 text-gray-500">
        <div>
          <h3 className="font-bold text-gray-800 mb-2">Exclusive Content</h3>
          <p className="text-sm">Access tutorials and guides you won't find anywhere else.</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-2">Live Demos</h3>
          <p className="text-sm">Try out our software environments directly from your dashboard.</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-2">Secure Access</h3>
          <p className="text-sm">Your subscription is protected by industry standard security.</p>
        </div>
      </div>
    </main>
  );
}
