'use client';

import { useState } from 'react';
import Image from 'next/image';
import logo from '@/assets/Ellipse 1.svg';

// Navbar Component
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why Bitcoin', href: '#why-bitcoin' },
    { label: 'Login', href: '#' },
    { label: 'FAQs', href: '#faqs' },
  ];

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Image 
              src={logo} 
              alt="Logo" 
              width={40} 
              height={40} 
              className="object-contain" 
              priority
            />
          </div>

          {/* Hamburger Menu */}
          <div 
            className="flex flex-col gap-1 cursor-pointer p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-0.5 bg-gray-700 rounded"></div>
            <div className="w-6 h-0.5 bg-gray-700 rounded"></div>
            <div className="w-6 h-0.5 bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-[70px] right-6 bg-[#0D8963] rounded-xl p-4 min-w-[200px] z-50 shadow-lg">
            <button 
              className="absolute top-2 right-3 bg-transparent border-none text-white text-2xl cursor-pointer hover:opacity-80"
              onClick={() => setIsMenuOpen(false)}
            >
              ×
            </button>
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="block py-3 px-4 text-white no-underline text-base rounded-lg mb-1 hover:bg-emerald-700 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-transparent bg-opacity-30 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}