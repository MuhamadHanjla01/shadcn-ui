'use client';

import { ProtectedRoute } from '@/lib/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Subscriber Dashboard</h1>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">Active Subscription: Premium</div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Your Resources & Demos</h2>
            <div className="space-y-4">
              <div className="border p-4 rounded-lg hover:shadow-md transition">
                <h3 className="font-bold text-lg text-blue-600">Advanced Analytics Tutorial</h3>
                <p className="text-gray-600 text-sm mt-1">Learn how to track and convert your audience effectively.</p>
                <div className="mt-3 text-sm">
                  <a href="#" className="text-blue-500 hover:underline">Access Resource &rarr;</a>
                </div>
              </div>
              <div className="border p-4 rounded-lg hover:shadow-md transition">
                <h3 className="font-bold text-lg text-blue-600">Software Automation Demo</h3>
                <p className="text-gray-600 text-sm mt-1">Interactive demo environment for the new automation suite.</p>
                <div className="mt-3 text-sm">
                  <a href="#" className="text-blue-500 hover:underline">Launch Demo &rarr;</a>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Account Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium mb-4">subscriber@example.com</p>
              
              <p className="text-sm text-gray-500 mb-1">Member Since</p>
              <p className="font-medium mb-4">October 24, 2023</p>
              
              <button className="text-red-600 text-sm hover:underline">Cancel Subscription</button>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
