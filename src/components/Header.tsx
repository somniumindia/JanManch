'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, LogIn, Languages } from 'lucide-react';
import { DICTIONARY } from '@/lib/translations';

export const Header: React.FC = () => {
  const {
    user,
    openAuthModal,
    setActiveTab,
    language,
    toggleLanguage,
  } = useApp();

  const t = DICTIONARY[language];

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-rule px-4 py-2.5 transition-all">
      {/* Brand & Right Actions - Single Row Header */}
      <div className="flex items-center justify-between gap-2 min-h-[44px]">
        {/* Left: Logo + JanManch (in serif font) */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="JanManch"
            className="w-8 h-8 object-contain shrink-0"
          />
          <h1 className="font-serif text-xl font-bold tracking-tight text-ink leading-none">
            {language === 'hi' ? 'जनमंच' : 'JanManch'}
          </h1>
        </div>

        {/* Right Action Cluster: Language Switcher + User Profile / Sign In */}
        <div className="flex items-center gap-2">
          {/* 1-Tap Language Switch Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-semibold border border-rule bg-surface text-ink hover:bg-paper active:scale-95 transition-all focus-visible:outline-accent"
            title="Switch language / भाषा बदलें"
            aria-label="Switch language"
          >
            <Languages className="w-4 h-4 text-accent shrink-0" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* User Karma or Sign In Button */}
          {user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-surface border border-rule text-xs font-semibold text-ink hover:bg-paper transition-colors focus-visible:outline-accent"
              title={language === 'hi' ? 'नागरिक प्रोफ़ाइल' : 'Citizen profile'}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-bold">{user.karmaScore}</span>
              <span className="text-[11px] text-ink-muted font-normal">{t.pts}</span>
              <div className="w-5 h-5 rounded-full bg-accent text-surface text-[10px] font-bold flex items-center justify-center ml-0.5 shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-accent text-surface text-xs font-semibold hover:opacity-95 transition-opacity focus-visible:outline-accent"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
