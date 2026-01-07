"use client";

import React, { useState } from 'react';
import { Home, Users, Wallet, UserCircle } from 'lucide-react';

type NavItem = 'home' | 'users' | 'wallet' | 'profile';

const BottomNavBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItem>('home');

  const navItems = [
    { id: 'home' as NavItem, icon: Home, label: 'Dashboard' },
    { id: 'users' as NavItem, icon: Users, label: 'Chamas' },
    { id: 'wallet' as NavItem, icon: Wallet, label: 'Wallet' },
    { id: 'profile' as NavItem, icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center">
      <nav className="bg-white w-full max-w-[412px] h-[73px]">
        <div className="flex items-center justify-between h-full px-[51px]">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'home');
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                  isActive && activeTab === item.id ? 'text-green-600' : 
                  item.id === 'home' && activeTab !== 'home' ? 'text-gray-600' :
                  isActive ? 'text-green-600' : 'text-gray-600'
                }`}
                aria-label={item.label}
              >
                <Icon 
                  size={24} 
                  strokeWidth={2}
                  fill={isActive && activeTab === item.id ? 'currentColor' : 
                        item.id === 'home' && activeTab === 'home' ? 'currentColor' : 'none'}
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