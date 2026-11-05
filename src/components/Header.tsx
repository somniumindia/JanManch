'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, MapPin, LogIn, Languages, ChevronDown, SlidersHorizontal, Globe2, X } from 'lucide-react';
import { DICTIONARY, REGION_NAMES } from '@/lib/translations';
import { POPULAR_STATES, WORLD_COUNTRIES } from '@/constants/regions';
import { CascadingRegionModal } from './CascadingRegionModal';

export const Header: React.FC = () => {
  const {
    activeCountry,
    activeRegion,
    activeConstituency,
    activeTopic,
    setGeographicFilter,
    user,
    openAuthModal,
    setActiveTab,
    language,
    toggleLanguage,
  } = useApp();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [modalStartView, setModalStartView] = useState<'country' | 'state' | 'constituency'>('country');

  const t = DICTIONARY[language];
  const isHindi = language === 'hi';

  const isIndia = activeCountry === 'India';
  const isAllConstituencies = !activeConstituency || activeConstituency === 'All Constituencies';
  const hasSpecificFilter =
    activeCountry !== 'Worldwide' &&
    (activeRegion !== 'All India' || !isAllConstituencies || activeCountry !== 'India');

  const handleOpenScopeSelector = () => {
    setModalStartView('country');
    setIsSelectorOpen(true);
  };

  const handleResetToWorldwide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGeographicFilter('Worldwide', 'All India', 'All Constituencies');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 pt-3 pb-2.5 transition-all shadow-xs">
      {/* Brand & Language Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="JanManch"
              className="w-9 h-9 object-contain drop-shadow-xs"
            />
          </div>

          <div>
            <h1 className="font-black text-lg tracking-tight text-slate-900 leading-tight">
              {language === 'hi' ? 'जन' : 'Jan'}
              <span className="text-blue-600">{language === 'hi' ? 'मंच' : 'Manch'}</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Cluster: Language Switcher + User Profile / Sign In */}
        <div className="flex items-center gap-1.5">
          {/* 1-Tap Language Switch Toggle [EN | हिंदी] */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all active:scale-95 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 hover:bg-blue-100 shadow-2xs"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* User Karma or Sign In Pill */}
          {user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{user.karmaScore}</span>
              <span className="text-[10px] text-slate-400 font-normal">{t.pts}</span>
              <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                {user.name.charAt(0)}
              </div>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs hover:bg-blue-100 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Dual-Pill Bar: Scope Selector (Left) + Active Topic Indicator (Right) */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {/* Left Button: Scope Selector */}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleOpenScopeSelector}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-98 bg-slate-100 hover:bg-slate-200/80 border-slate-200/90 text-slate-800 shadow-2xs"
            title={isHindi ? 'जनमत दायरा बदलें' : 'Change Deliberation Scope'}
          >
            <div className="flex items-center gap-1.5 truncate min-w-0">
              {activeCountry === 'Worldwide' ? (
                <>
                  <span className="text-sm shrink-0 leading-none">🌐</span>
                  <span className="truncate">{isHindi ? 'विश्वव्यापी (सभी विचार)' : 'Worldwide (All Posts)'}</span>
                </>
              ) : isIndia && activeRegion === 'All India' ? (
                <>
                  <span className="text-sm shrink-0 leading-none">🇮🇳</span>
                  <span className="truncate">{isHindi ? 'भारत (देशव्यापी)' : 'India (Countrywide)'}</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate font-extrabold text-blue-900">
                    {!isAllConstituencies ? `📍 ${activeConstituency}` : `📍 ${activeRegion}`}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              {/* Quick Reset to Worldwide button '✕' if specific state/constituency is selected */}
              {hasSpecificFilter && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleResetToWorldwide}
                  className="w-4 h-4 rounded-full bg-slate-300 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title={isHindi ? 'विश्वव्यापी पर रीसेट करें' : 'Reset to Worldwide'}
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </button>
        </div>

        {/* Right Button: Quick Topic Indicator / Filter Pill */}
        <div className="shrink-0">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="truncate max-w-[90px]">{activeTopic}</span>
          </div>
        </div>
      </div>

      {/* Slide-Up Bottom Sheet for Geographic & Region Filtering (Mobile-safe, zero clipping) */}
      <CascadingRegionModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        initialView={modalStartView}
      />
    </header>
  );
};
