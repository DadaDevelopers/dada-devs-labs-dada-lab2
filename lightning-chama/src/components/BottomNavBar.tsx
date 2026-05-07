"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Wallet, UserCircle } from 'lucide-react';

const navItems = [
  { id: 'home', icon: Home, label: 'Dashboard', href: '/userdashboard' },
  { id: 'users', icon: Users, label: 'Chamas', href: '/userdashboard/chama' },
  { id: 'wallet', icon: Wallet, label: 'Wallet', href: '/userdashboard/wallet' },
  { id: 'profile', icon: UserCircle, label: 'Profile', href: '/userdashboard/profile' },
] as const;

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
      <nav
        className="bg-white w-full max-w-[412px] h-[73px]"
        style={{ borderTop: '1px solid #F1F5F9' }}
      >
        <div className="flex items-center justify-between h-full px-[51px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`}
                aria-label={item.label}
              >
                <Icon
                  size={24}
                  strokeWidth={2}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className="text-[10px] font-normal leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavBar;
