'use client';

import React from 'react';
import { useApp, ActiveTabType } from '@/context/AppContext';
import { Scale, TrendingUp, Plus, User } from 'lucide-react';
import { DICTIONARY } from '@/lib/translations';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user, language } = useApp();
  const isHindi = language === 'hi';

  const tabs = [
    {
      id: 'agora' as ActiveTabType,
      label: isHindi ? 'अखाड़ा' : 'The Agora',
      icon: Scale,
    },
    {
      id: 'pulse' as ActiveTabType,
      label: isHindi ? 'रुझान' : 'Pulse Trends',
      icon: TrendingUp,
    },
    {
      id: 'create' as ActiveTabType,
      label: isHindi ? 'नया प्रस्ताव' : 'New Prop',
      icon: Plus,
      isPrimary: true,
    },
    {
      id: 'profile' as ActiveTabType,
      label: user ? (isHindi ? 'प्रोफ़ाइल' : 'My Profile') : (isHindi ? 'प्रवेश' : 'Citizen Sign In'),
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-1.5 shadow-xl shadow-slate-900/5">
        <div className="grid grid-cols-4 items-center relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isPrimary) {
              return (
                <div key={tab.id} className="flex flex-col items-center justify-center -mt-5">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/30 ring-4 ring-white bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:brightness-110"
                    title={tab.label}
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </button>
                  <span
                    className={`text-[9.5px] mt-1 font-bold tracking-tight ${
                      isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center py-1 group focus:outline-none transition-colors"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 font-bold'
                      : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 transition-colors truncate max-w-[70px] ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium group-hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
