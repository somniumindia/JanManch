'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import {
  INDIA_STATES_CONSTITUENCIES,
  ALL_STATES_AND_UTS,
  WORLD_COUNTRIES,
  CountryInfo,
} from '@/constants/regions';
import { REGION_NAMES } from '@/lib/translations';
import {
  MapPin,
  Search,
  Check,
  ChevronRight,
  ArrowLeft,
  Building2,
  Sparkles,
} from 'lucide-react';

export interface CascadingRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (state: string, constituency: string, country?: string) => void;
  initialCountry?: string;
  initialState?: string;
  initialConstituency?: string;
  initialView?: 'country' | 'state' | 'constituency';
  title?: string;
  mode?: 'dropdown' | 'bottom-sheet';
}

export const CascadingRegionModal: React.FC<CascadingRegionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialCountry,
  initialState,
  initialConstituency,
  initialView,
  title,
}) => {
  const {
    activeCountry,
    activeRegion,
    activeConstituency,
    setGeographicFilter,
    language,
  } = useApp();

  const isHindi = language === 'hi';

  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialCountry || activeCountry || 'India'
  );
  const [selectedState, setSelectedState] = useState<string>(
    initialState || activeRegion || 'All India'
  );
  const [selectedConstituency, setSelectedConstituency] = useState<string>(
    initialConstituency || activeConstituency || 'All Constituencies'
  );

  const [view, setView] = useState<'country' | 'state' | 'constituency'>('country');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const startCountry = initialCountry || activeCountry || 'India';
      const startState = initialState || activeRegion || 'All India';
      const startConstituency = initialConstituency || activeConstituency || 'All Constituencies';

      setSelectedCountry(startCountry);
      setSelectedState(startState);
      setSelectedConstituency(startConstituency);
      setSearchQuery('');

      if (initialView) {
        setView(initialView);
      } else {
        setView('country');
      }
    }
  }, [isOpen, initialCountry, initialState, initialConstituency, initialView, activeCountry, activeRegion, activeConstituency]);

  // Constituencies for current state
  const constituencies = useMemo(() => {
    return INDIA_STATES_CONSTITUENCIES[selectedState] || ['All Constituencies'];
  }, [selectedState]);

  // Flattened index of all 543 Lok Sabha Constituencies for lightning-fast cross-state search
  const allConstituenciesIndex = useMemo(() => {
    const list: { state: string; constituency: string; localizedState: string }[] = [];
    Object.entries(INDIA_STATES_CONSTITUENCIES).forEach(([state, cList]) => {
      const locState = REGION_NAMES[state]?.[language] || state;
      cList.forEach((c) => {
        if (c !== 'All Constituencies') {
          list.push({ state, constituency: c, localizedState: locState });
        }
      });
    });
    return list;
  }, [language]);

  // Filtered lists based on search
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES.filter((c) => c.id !== 'Worldwide' && c.id !== 'India');
    return WORLD_COUNTRIES.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameHi.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredStates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_STATES_AND_UTS.filter((s) => s !== 'All India');

    return ALL_STATES_AND_UTS.filter((state) => {
      if (state === 'All India') return false;
      const stateMatch = state.toLowerCase().includes(q);
      const hindiName = REGION_NAMES[state]?.hi?.toLowerCase() || '';
      const hindiMatch = hindiName.includes(q);
      return stateMatch || hindiMatch;
    });
  }, [searchQuery]);

  // Matching constituencies across all of India when typing in search bar
  const matchingGlobalConstituencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allConstituenciesIndex
      .filter(
        (item) =>
          item.constituency.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.localizedState.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [searchQuery, allConstituenciesIndex]);

  const filteredConstituencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return constituencies;
    return constituencies.filter((c) => c.toLowerCase().includes(q));
  }, [constituencies, searchQuery]);

  if (!isOpen || !mounted) return null;

  const handleSelectWorldwide = () => {
    setSelectedCountry('Worldwide');
    setSelectedState('All India');
    setSelectedConstituency('All Constituencies');
    if (onSelect) {
      onSelect('All India', 'All Constituencies', 'Worldwide');
    } else {
      setGeographicFilter('Worldwide', 'All India', 'All Constituencies');
    }
    onClose();
  };

  const handleOpenIndiaScope = () => {
    setSelectedCountry('India');
    setView('state');
    setSearchQuery('');
  };

  const handleSelectAllIndia = () => {
    setSelectedCountry('India');
    setSelectedState('All India');
    setSelectedConstituency('All Constituencies');
    if (onSelect) {
      onSelect('All India', 'All Constituencies', 'India');
    } else {
      setGeographicFilter('India', 'All India', 'All Constituencies');
    }
    onClose();
  };

  const handleCountryClick = (c: CountryInfo) => {
    setSelectedCountry(c.id);
    setSearchQuery('');

    if (c.id === 'India') {
      setView('state');
    } else if (c.id === 'Worldwide') {
      handleSelectWorldwide();
    } else {
      // Non-India country
      setSelectedState('Countrywide');
      setSelectedConstituency('Countrywide');
      if (onSelect) {
        onSelect('Countrywide', 'Countrywide', c.id);
      } else {
        setGeographicFilter(c.id, 'Countrywide', 'Countrywide');
      }
      onClose();
    }
  };

  const handleStateClick = (state: string) => {
    setSelectedState(state);
    setSelectedConstituency('All Constituencies');
    setSearchQuery('');

    if (state === 'All India') {
      handleSelectAllIndia();
    } else {
      setView('constituency');
    }
  };

  const handleConstituencyClick = (constituency: string) => {
    setSelectedConstituency(constituency);
    if (onSelect) {
      onSelect(selectedState, constituency, selectedCountry);
    } else {
      setGeographicFilter(selectedCountry, selectedState, constituency);
    }
    onClose();
  };

  const handleDirectConstituencyClick = (state: string, constituency: string) => {
    setSelectedCountry('India');
    setSelectedState(state);
    setSelectedConstituency(constituency);
    if (onSelect) {
      onSelect(state, constituency, 'India');
    } else {
      setGeographicFilter('India', state, constituency);
    }
    onClose();
  };

  const handleBack = () => {
    setSearchQuery('');
    if (view === 'constituency') {
      setView('state');
    } else if (view === 'state') {
      setView('country');
    }
  };

  const modalJsx = (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div
        className="w-full h-[75vh] max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-8 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {view !== 'country' && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors mr-1 cursor-pointer"
                title={isHindi ? 'पीछे जाएं' : 'Go back'}
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
            )}
            <h3 className="font-bold text-lg text-slate-900 leading-tight">
              {view === 'country'
                ? title || (isHindi ? 'क्षेत्र चुनें / Select Region' : 'Select Region / क्षेत्र चुनें')
                : view === 'state'
                  ? isHindi
                    ? 'भारत: राज्य एवं निर्वाचन क्षेत्र'
                    : 'India: Regional Deep-Dive'
                  : REGION_NAMES[selectedState]?.[language] || selectedState}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Scope Options */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* =========================================================================
              STEP 1: TWO LARGE SELECTABLE CARDS (Worldwide vs India)
             ========================================================================= */}
          {view === 'country' && (
            <div className="space-y-3">
              {/* Option 1: Worldwide */}
              <button
                type="button"
                onClick={handleSelectWorldwide}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-blue-500 bg-slate-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {isHindi ? 'विश्वभर (सभी विचार)' : 'Worldwide (All Posts)'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isHindi
                        ? 'वैश्विक नागरिक विमर्श एवं अंतरराष्ट्रीय नीतियां'
                        : 'Global civic deliberations & international policies'}
                    </div>
                  </div>
                </div>
                {activeCountry === 'Worldwide' && (
                  <Check className="w-5 h-5 text-blue-600 shrink-0" />
                )}
              </button>

              {/* Option 2: India Deep-Dive */}
              <button
                type="button"
                onClick={handleOpenIndiaScope}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {isHindi ? 'भारत (राष्ट्रीय एवं निर्वाचन क्षेत्र)' : 'India (National & Constituencies)'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isHindi
                        ? '28 राज्यों, केंद्र शासित प्रदेशों व 543 लोकसभा सीटों तक'
                        : 'Filter by all 28 States, UTs & 543 Lok Sabha seats'}
                    </div>
                  </div>
                </div>
                <span className="text-slate-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Other Global Countries Accordion / Quick List */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {isHindi ? 'अन्य देश' : 'Other Countries'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  {filteredCountries.map((c) => {
                    const isSelected = activeCountry === c.id;
                    const displayName = isHindi ? c.nameHi : c.nameEn;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCountryClick(c)}
                        className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0 leading-none">{c.flag}</span>
                          <span className="text-xs truncate font-semibold">{displayName}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: INDIA REGIONAL DEEP-DIVE (Countrywide + Search + States)
             ========================================================================= */}
          {view === 'state' && (
            <div className="space-y-3">
              {/* Option 1: All India (Countrywide) 1-Tap */}
              <button
                type="button"
                onClick={handleSelectAllIndia}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex items-center justify-between gap-3 cursor-pointer ${
                  activeCountry === 'India' && activeRegion === 'All India'
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-900 shadow-xs'
                    : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/30 hover:bg-blue-50 border-blue-200/90 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    🇮🇳
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900">
                      {isHindi ? 'संपूर्ण भारत (देशव्यापी जनमत)' : 'All India (Countrywide Scope)'}
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      {isHindi ? 'सभी राष्ट्रीय नीति एवं विमर्श' : 'Deliberate on all national policy issues'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {activeCountry === 'India' && activeRegion === 'All India' ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Instant Search Bar for States & Lok Sabha Seats */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  autoFocus={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'राज्य या लोकसभा सीट खोजें (उदा. नई दिल्ली, वाराणसी, बैंगलोर...)'
                      : 'Search any state or 543 Lok Sabha seats (e.g. Varanasi, Bangalore...)'
                  }
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* If user typed a search query, show instant matching constituencies first */}
              {searchQuery.trim().length >= 2 && matchingGlobalConstituencies.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 pb-1 text-[11px] font-bold text-blue-700">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {isHindi ? 'मिलते-जुलते लोकसभा निर्वाचन क्षेत्र' : 'Matching Lok Sabha Constituencies'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {matchingGlobalConstituencies.map((item) => (
                      <button
                        key={`${item.state}-${item.constituency}`}
                        type="button"
                        onClick={() => handleDirectConstituencyClick(item.state, item.constituency)}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-left transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900">
                              {item.constituency}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                              ({item.localizedState})
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* States & Union Territories List */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{isHindi ? '28 राज्य व 8 केंद्र शासित प्रदेश' : '28 States & 8 Union Territories'}</span>
                </div>

                {filteredStates.length === 0 && matchingGlobalConstituencies.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <p className="font-semibold">{isHindi ? 'कोई परिणाम नहीं मिला' : 'No matches found'}</p>
                  </div>
                ) : (
                  filteredStates.map((state) => {
                    const isSelected = selectedState === state && activeCountry === 'India';
                    const cCount = (INDIA_STATES_CONSTITUENCIES[state]?.length || 1) - 1;
                    const localizedStateName = REGION_NAMES[state]?.[language] || state;

                    return (
                      <button
                        key={state}
                        type="button"
                        onClick={() => handleStateClick(state)}
                        className={`w-full py-2 px-3 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-200 text-blue-900 font-bold'
                            : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold leading-snug">{localizedStateName}</p>
                            <p className="text-[10px] text-slate-500">
                              {isHindi ? `${cCount} लोकसभा सीटें` : `${cCount} Constituencies`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: LOK SABHA CONSTITUENCIES FOR SELECTED STATE
             ========================================================================= */}
          {view === 'constituency' && (
            <div className="space-y-2">
              {/* Sticky Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  autoFocus={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isHindi
                      ? `${selectedState} में निर्वाचन क्षेत्र खोजें...`
                      : `Search Lok Sabha seat in ${selectedState}...`
                  }
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {filteredConstituencies.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <p className="font-semibold">
                      {isHindi ? 'कोई निर्वाचन क्षेत्र नहीं मिला' : 'No constituency found'}
                    </p>
                  </div>
                ) : (
                  filteredConstituencies.map((c) => {
                    const isSelected =
                      selectedConstituency === c &&
                      selectedState === activeRegion &&
                      activeCountry === 'India';
                    const isAll = c === 'All Constituencies';

                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleConstituencyClick(c)}
                        className={`w-full py-2 px-3 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold'
                            : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isAll ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold leading-snug">
                              {isAll
                                ? isHindi
                                  ? `संपूर्ण ${selectedState}`
                                  : `All ${selectedState}`
                                : c}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {isAll
                                ? isHindi
                                  ? 'राज्य स्तरीय व्यापक जनमत'
                                  : 'Statewide General Consensus'
                                : isHindi
                                  ? 'लोकसभा संसदीय निर्वाचन क्षेत्र'
                                  : 'Lok Sabha Parliamentary Seat'}
                            </p>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalJsx, document.body);
};
