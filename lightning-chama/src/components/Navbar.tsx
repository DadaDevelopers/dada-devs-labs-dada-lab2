'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bell, Menu } from 'lucide-react';
import logo from '@/assets/Ellipse 1.svg';

type NavbarProps = {
  isAuthenticated?: boolean;
  userName?: string;
};

export function Navbar({ isAuthenticated = false, userName = '',}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const publicNavItems = [
    { label: 'Home', href: '#' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why Bitcoin', href: '#why-bitcoin' },
    { label: 'Login', href: '#' },
    { label: 'FAQs', href: '#faqs' },
  ];

  const dashboardNavItems = [
    { label: 'Dashboard', href: '/userdashboard' },
    { label: 'Chama', href: '/userdashboard/chama' },
    { label: 'Wallet', href: '/userdashboard/wallet' },
    { label: 'Profile Settings', href: '/profile' },
    { label: 'Logout', href: '/landing-page' },
  ];

  const navItems = isAuthenticated
    ? dashboardNavItems
    : publicNavItems;

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-6 py-4 flex justify-between items-center">

          {/* Left: Logo + User Name */}
          <div className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Logo"
              width={40}
              height={40}
              priority
            />

            {isAuthenticated && (
              <span className="text-gray-900 font-semibold text-lg">
                Dashboard {userName}
              </span>
            )}
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3">

            {isAuthenticated && (
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
            )}

            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-[70px] right-6 bg-emerald-600 rounded-xl p-4 min-w-[220px] shadow-lg">
            <button
              className="absolute top-2 right-3 text-white text-2xl"
              onClick={() => setIsMenuOpen(false)}
            >
              ×
            </button>

            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block py-3 px-4 text-white rounded-lg hover:bg-emerald-700 transition"
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
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
