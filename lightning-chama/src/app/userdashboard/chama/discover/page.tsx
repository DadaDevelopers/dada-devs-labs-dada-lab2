"use client";

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function ChamasPage() {
  const [activeTab, setActiveTab] = useState('myChamas');

  const chamas = [
    {
      id: 1,
      name: 'Chama1',
      username: 'chama1',
      description: 'Youth savings squad pooling money to support side hustles and short-term business goals.',
      logo: '/api/placeholder/48/48',
      bgColor: 'bg-green-100',
      iconColor: 'bg-green-700'
    },
    {
      id: 2,
      name: 'Chama2',
      username: 'chama1',
      description: 'Youth savings squad pooling money to support side hustles and short-term business goals.',
      logo: '/api/placeholder/48/48',
      bgColor: 'bg-teal-900',
      iconColor: 'bg-teal-600'
    },
    {
      id: 3,
      name: 'Chama3',
      username: 'chama1',
      description: 'Youth savings squad pooling money to support side hustles and short-term business goals.',
      logo: '/api/placeholder/48/48',
      bgColor: 'bg-yellow-600',
      iconColor: 'bg-yellow-400'
    },
    {
      id: 4,
      name: 'Chama4',
      username: 'chama1',
      description: 'Youth savings squad pooling money to support side hustles and short-term business goals.',
      logo: '/api/placeholder/48/48',
      bgColor: 'bg-gray-200',
      iconColor: 'bg-gray-400'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <Navbar 
        isAuthenticated={true}
        userName=''
        />
    {/* Back to Home */}
      <div className="w-full max-w-md flex p-2 items-center">
        <Link
          href="/userdashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-sm">Go Back</span>
        </Link>
      </div>
      {/* Tab Navigation */}
      <div className="bg-white px-8 py-4 flex gap-6">
        <Link href="/userdashboard/chama">
          <button 
            onClick={() => setActiveTab('myChamas')}
            className={`flex-1 py-3 px-6 text-xl rounded-lg font-medium transition-colors ${
            activeTab === 'myChamas'
              ? 'bg-white text-gray-900 border border-emerald-500'
              : 'bg-white text-gray-900 border border-emerald-500'
          }`}>
            My Chamas
          </button>
        </Link>
        <Link href="/userdashboard/chama/discover">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 px-10 rounded-lg font-medium  text-xl transition-colors ${
            activeTab === 'discover'
              ? 'bg-[#059669] text-white'
              : 'bg-[#059669] text-white'
          }`}>
            Discover
          </button>
        </Link>
      </div>

      {/* Chamas List */}
      <div className="px-4 py-2 mb-2">
        {chamas.map((chama) => (
          <div
            key={chama.id}
            className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Avatar/Logo */}
            <div className="flex shrink-0">
              <div className={`w-12 h-12 rounded-full ${chama.bgColor} flex items-center justify-center relative`}>
                <div className={`w-8 h-8 rounded-full ${chama.iconColor} flex items-center justify-center`}>
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{chama.username}</p>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">{chama.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {chama.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Indicator */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
      </div>
    </div>
  );
}