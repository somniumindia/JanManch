'use client';

import React from 'react';
import { useApp, ActiveTabType } from '@/context/AppContext';
import { Scale, TrendingUp, Plus, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user, language } = useApp();
  const isHindi = language === 'hi';

  const tabs = [
    {
      id: 'agora' as ActiveTabType,
      label: isHindi ? 'बहस' : 'Debates',
      icon: Scale,
    },
    {
      id: 'pulse' as ActiveTabType,
      label: isHindi ? 'रुझान' : 'Trends',
      icon: TrendingUp,
    },
    {
      id: 'create' as ActiveTabType,
      label: isHindi ? 'नई बहस' : 'New debate',
      icon: Plus,
      isPrimary: true,
    },
    {
      id: 'profile' as ActiveTabType,
      label: user ? (isHindi ? 'प्रोफ़ाइल' : 'Profile') : (isHindi ? 'प्रवेश' : 'Sign in'),
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-surface/95 backdrop-blur-xl border-t border-rule px-3 py-1">
        <div className="grid grid-cols-4 items-center relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isPrimary) {
              return (
                <div key={tab.id} className="flex flex-col items-center justify-center -mt-5">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 bg-accent text-surface ring-4 ring-surface hover:opacity-95 focus-visible:outline-accent"
                    title={tab.label}
                    aria-label={tab.label}
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </button>
                  <span
                    className={`text-[10px] mt-1 font-semibold tracking-normal transition-colors ${
                      isActive ? 'text-accent' : 'text-ink-muted'
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
                className="flex flex-col items-center justify-center py-1.5 min-h-[44px] group focus-visible:outline-accent transition-colors"
                aria-label={tab.label}
              >
                <div
                  className={`p-1 transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-ink-muted group-hover:text-ink'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 transition-colors truncate max-w-[70px] ${
                    isActive ? 'text-accent font-semibold' : 'text-ink-muted font-normal group-hover:text-ink'
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
