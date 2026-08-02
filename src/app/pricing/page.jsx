export default function PricingPage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Subscription Plans</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Basic Plan</h2>
          <p className="text-gray-600 mb-4">Access to standard resources and tutorials.</p>
          <p className="text-3xl font-bold mb-6">$9.99<span className="text-sm font-normal text-gray-500">/mo</span></p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Subscribe</button>
        </div>
        <div className="border rounded-lg p-6 shadow-sm border-blue-600 relative">
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg rounded-tr-lg">POPULAR</div>
          <h2 className="text-2xl font-bold mb-4">Premium Plan</h2>
          <p className="text-gray-600 mb-4">Full access to all exclusive resources, including live demos.</p>
          <p className="text-3xl font-bold mb-6">$24.99<span className="text-sm font-normal text-gray-500">/mo</span></p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Subscribe</button>
        </div>
      </div>
    </main>
  );
}
