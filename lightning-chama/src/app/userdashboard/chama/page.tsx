"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import chamaicon from '@/assets/chamaicon.png';
import Image, { StaticImageData } from "next/image";
import Link from 'next/link';

export default function ChamasPage() {
  const chamas:  {
  id: number;
  name: string;
  image: StaticImageData;
  description: string;
  username: string;
}[] = [
    {
      id: 1,
      name: 'Chama1',
      image: chamaicon,
      description: 'Youth savings squad pooling money to support side hustles and short-term business goals.',
      username: 'chama1',
    },
    {
      id: 2,
      name: 'Chama2',
      image: chamaicon,
      description: 'Youth savings squad pooling money to support side hustles and short-term business goals.',
      username: 'chama1',
    },
    {
      id: 3,
      name: 'Chama3',
      image: chamaicon,
      description: 'Youth savings squad pooling money to support side hustles and short-term business goals.',
      username: 'chama1',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">

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
      <div className="bg-white px-6 py-4 flex gap-8">
        <Link href="/userdashboard/chama">
          <button className="flex-1 bg-emerald-600 text-white text-xl py-3 px-8 rounded-lg font-medium">
            My Chamas
          </button>
        </Link>
        <Link href="/userdashboard/chama/discover">
          <button className="flex-1 bg-white text-gray-700 text-xl py-3 px-10 rounded-lg font-medium border border-emerald-500">
            Discover
          </button>
        </Link>
      </div>

      {/* Chamas List */}
      <div className="px-6 py-4 space-y-4">
        {chamas.map((chama) => (
          <div key={chama.id} className="bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm mb-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <Image
                    src={chama.image}
                    alt={`${chama.name} icon`}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500">{chama.username}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{chama.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{chama.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Chama Button */}
      <Link href="/userdashboard/chama/createchama">
      <div  className="flex items-center gap-4 border border-gray-300 rounded-xl">
      <div className="px-6 py-4"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_827_2947)">
            <circle cx="32" cy="32" r="32" fill="#92B1F5"/>
            <path d="M31 33H25V31H31V25H33V31H39V33H33V39H31V33Z" fill="#1D1B20"/>
            </g>
            <defs>
            <clipPath id="clip0_827_2947">
            <rect width="64" height="64" fill="white"/>
            </clipPath>
            </defs>
            </svg>
       </div>     
          <span className="font-medium text-lg text-gray-700">Create Chama</span>
      </div>
    </Link>
    </div>
  );
}