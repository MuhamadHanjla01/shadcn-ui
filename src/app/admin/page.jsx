"use client";
import { useState } from 'react';
import { ProtectedRoute } from '@/lib/auth';

export default function AdminPage() {
  const [resources, setResources] = useState([
    { id: 1, title: 'Advanced Analytics Tutorial', type: 'Tutorial' },
    { id: 2, title: 'Software Automation Demo', type: 'Demo Account' }
  ]);

  return (
    <ProtectedRoute requireAdmin={true}>
      <main className="min-h-screen p-8 max-w-5xl mx-auto bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <h1 className="text-3xl font-bold mb-2">Platform Administration</h1>
          <p className="text-gray-500 text-sm">Manage your subscribers and digital resources.</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded font-medium">Resources</button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-gray-700">Subscribers</button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-gray-700">Settings</button>
          </div>
          
          <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manage Resources</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Add New</button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 font-medium text-gray-600">Title</th>
                    <th className="p-3 font-medium text-gray-600">Type</th>
                    <th className="p-3 font-medium text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {resources.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{res.title}</td>
                      <td className="p-3 text-gray-500">{res.type}</td>
                      <td className="p-3 text-right">
                        <button className="text-blue-600 hover:underline mr-3">Edit</button>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
