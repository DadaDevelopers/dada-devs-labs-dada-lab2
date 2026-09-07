'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import logo from '@/assets/Ellipse 1.svg';

type NavbarProps = {
  isAuthenticated?: boolean;
  userName?: string;
};

type NavItem = {
  label: string;
  href: string;
  isLogout?: boolean;
};

export function Navbar({ isAuthenticated = false, userName = '' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const publicNavItems: NavItem[] = [
    { label: 'Home', href: '/landing-page' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why Bitcoin', href: '#why-bitcoin' },
    { label: 'Login', href: '/landing-page/login' },
    { label: 'FAQs', href: '/faqs' },
  ];

  const dashboardNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/userdashboard' },
    { label: 'Chama', href: '/userdashboard/chama' },
    { label: 'Contributions', href: '/userdashboard/contribute' },
    { label: 'Wallet', href: '/userdashboard/wallet' },
    { label: 'Profile Settings', href: '/userdashboard/profile' },
    { label: 'Logout', href: '/landing-page', isLogout: true },
  ];

  const navItems: NavItem[] = isAuthenticated ? dashboardNavItems : publicNavItems;

  const handleLogout = () => {
    // Clear all items from local storage
    localStorage.clear();
    
    // Close the menu
    setIsMenuOpen(false);
    
    // Navigate to landing page
    router.push('/landing-page');
  };

  const handleNavItemClick = (item: NavItem) => {
    // Close the menu
    setIsMenuOpen(false);
    
    // If it's a logout item, handle logout
    if (item.isLogout) {
      handleLogout();
    } else {
      // For regular navigation items, navigate to the href
      if (item.href.startsWith('#')) {
        // For anchor links, scroll to the section
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // For page routes, use the router
        router.push(item.href);
      }
    }
  };

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
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              className="p-2 hover:bg-gray-100 rounded-full transition"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
                <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-[60] cursor-default bg-black/35 backdrop-blur-[2px]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {isMenuOpen && (
        <aside
          id="mobile-navigation"
          role="dialog"
          aria-label="Navigation menu"
          className="fixed right-4 top-4 z-[70] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-[#064E3B] text-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-serif text-xl">Chama<span className="text-[#f2b544]">Vault</span></span>
            <button type="button" aria-label="Close menu" onClick={() => setIsMenuOpen(false)} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <nav className="p-3">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => handleNavItemClick(item)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition hover:bg-white/10 ${item.isLogout ? 'text-red-200' : 'text-white'}`}
              >
                {item.label}
                <span aria-hidden="true" className="text-white/35">→</span>
              </button>
            ))}
          </nav>
        </aside>
      )}
    </>
  );
}
