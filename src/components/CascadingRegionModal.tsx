'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
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

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
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

  // Reset state when modal is opened (React 19 recommended render-time state adjustment)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedCountry(initialCountry || activeCountry || 'India');
      setSelectedState(initialState || activeRegion || 'All India');
      setSelectedConstituency(initialConstituency || activeConstituency || 'All Constituencies');
      setSearchQuery('');
      setView(initialView || 'country');
    }
  }

  // Constituencies for current state
  const constituencies = useMemo(() => {
    return INDIA_STATES_CONSTITUENCIES[selectedState] || ['All Constituencies'];
  }, [selectedState]);

  // Flattened index of all 543 Lok Sabha Constituencies for fast cross-state search
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
  };

  const handleCountryClick = (c: CountryInfo) => {
    setSelectedCountry(c.id);
    setSelectedState('All India');
    setSelectedConstituency('All Constituencies');
    if (onSelect) {
      onSelect('All India', 'All Constituencies', c.id);
    } else {
      setGeographicFilter(c.id, 'All India', 'All Constituencies');
    }
    onClose();
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

  const handleStateClick = (state: string) => {
    setSelectedCountry('India');
    setSelectedState(state);
    setView('constituency');
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
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-ink/60 backdrop-blur-xs">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div
        className="w-full h-[75vh] max-h-[85vh] bg-surface rounded-t-2xl border-t border-rule flex flex-col overflow-hidden pb-8 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-rule rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-5 pb-3 border-b border-rule flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {view !== 'country' && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-paper text-ink transition-colors mr-1 cursor-pointer min-h-[36px]"
                title={isHindi ? 'पीछे जाएं' : 'Go back'}
              >
                <ArrowLeft className="w-5 h-5 text-ink" />
              </button>
            )}
            <h3 className="font-semibold text-base text-ink leading-tight font-serif">
              {view === 'country'
                ? title || (isHindi ? 'क्षेत्र चुनें' : 'Select region')
                : view === 'state'
                  ? isHindi
                    ? 'भारत: राज्य एवं निर्वाचन क्षेत्र'
                    : 'India: States & constituencies'
                  : REGION_NAMES[selectedState]?.[language] || selectedState}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-paper hover:bg-rule/40 text-ink-muted font-bold transition-colors cursor-pointer min-h-[36px]"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Scope Options */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* STEP 1: Country View (India card first, then Worldwide, then other countries) */}
          {view === 'country' && (
            <div className="space-y-3">
              {/* Option 1: India Deep-Dive (First) */}
              <button
                type="button"
                onClick={handleOpenIndiaScope}
                className="w-full p-4 rounded-xl border border-rule hover:border-accent bg-surface flex items-center justify-between text-left transition-colors cursor-pointer min-h-[44px] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <div className="font-semibold text-ink text-sm">
                      {isHindi ? 'भारत (राष्ट्रीय एवं निर्वाचन क्षेत्र)' : 'India (National & constituencies)'}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {isHindi
                        ? '28 राज्यों, केंद्र शासित प्रदेशों व 543 लोकसभा सीटों तक'
                        : 'Filter by all 28 states, UTs & 543 Lok Sabha seats'}
                    </div>
                  </div>
                </div>
                <span className="text-ink-muted group-hover:text-accent font-bold transition-colors">→</span>
              </button>

              {/* Option 2: Worldwide */}
              <button
                type="button"
                onClick={handleSelectWorldwide}
                className="w-full p-4 rounded-xl border border-rule hover:border-accent bg-surface flex items-center justify-between text-left transition-colors cursor-pointer min-h-[44px] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="font-semibold text-ink text-sm">
                      {isHindi ? 'विश्वभर (सभी विचार)' : 'Worldwide (All posts)'}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {isHindi
                        ? 'वैश्विक नागरिक विमर्श एवं अंतरराष्ट्रीय नीतियां'
                        : 'Global civic deliberations & international policies'}
                    </div>
                  </div>
                </div>
                {activeCountry === 'Worldwide' && (
                  <Check className="w-5 h-5 text-accent shrink-0" />
                )}
              </button>

              {/* Other Global Countries */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-rule">
                  <span className="text-[11px] font-semibold text-ink-muted">
                    {isHindi ? 'अन्य देश' : 'Other countries'}
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
                        className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between gap-2 cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-accent-soft border-accent text-accent font-semibold'
                            : 'bg-surface hover:bg-paper border-rule text-ink'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0 leading-none">{c.flag}</span>
                          <span className="text-xs truncate font-medium">{displayName}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INDIA REGIONAL DEEP-DIVE */}
          {view === 'state' && (
            <div className="space-y-3">
              {/* Option 1: All India (Countrywide) 1-Tap */}
              <button
                type="button"
                onClick={handleSelectAllIndia}
                className={`w-full p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between gap-3 cursor-pointer min-h-[44px] ${
                  activeCountry === 'India' && activeRegion === 'All India'
                    ? 'bg-accent-soft border-accent text-accent font-semibold'
                    : 'bg-surface hover:bg-paper border-rule text-ink'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-accent text-surface flex items-center justify-center font-bold text-sm shrink-0">
                    🇮🇳
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">
                      {isHindi ? 'संपूर्ण भारत (देशव्यापी जनमत)' : 'All India (Countrywide scope)'}
                    </p>
                    <p className="text-[10.5px] text-ink-muted">
                      {isHindi ? 'सभी राष्ट्रीय नीति एवं विमर्श' : 'Deliberate on all national policy issues'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {activeCountry === 'India' && activeRegion === 'All India' ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-ink-muted" />
                  )}
                </div>
              </button>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-ink-muted" />
                <input
                  type="text"
                  autoFocus={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'राज्य या लोकसभा सीट खोजें (उदा. नई दिल्ली, वाराणसी, बैंगलोर...)'
                      : 'Search state or 543 Lok Sabha seats (e.g. Varanasi, Bangalore...)'
                  }
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-paper border border-rule text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-accent font-normal min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-ink-muted hover:text-ink p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* If search query matches constituencies, show matching results */}
              {searchQuery.trim().length >= 2 && matchingGlobalConstituencies.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 pb-1 text-[11px] font-semibold text-accent">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {isHindi ? 'मिलते-जुलते लोकसभा निर्वाचन क्षेत्र' : 'Matching Lok Sabha constituencies'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {matchingGlobalConstituencies.map((item) => (
                      <button
                        key={`${item.state}-${item.constituency}`}
                        type="button"
                        onClick={() => handleDirectConstituencyClick(item.state, item.constituency)}
                        className="w-full py-2 px-3 rounded-xl bg-surface hover:bg-paper border border-rule hover:border-accent text-left transition-colors flex items-center justify-between cursor-pointer min-h-[44px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-semibold text-ink">
                              {item.constituency}
                            </span>
                            <span className="text-[10px] text-ink-muted ml-1.5 font-normal">
                              ({item.localizedState})
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* States & Union Territories List */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between pb-1 text-[11px] font-semibold text-ink-muted">
                  <span>{isHindi ? '28 राज्य व 8 केंद्र शासित प्रदेश' : '28 states & 8 union territories'}</span>
                </div>

                {filteredStates.length === 0 && matchingGlobalConstituencies.length === 0 ? (
                  <div className="py-8 text-center text-xs text-ink-muted">
                    <p className="font-medium">{isHindi ? 'कोई परिणाम नहीं मिला' : 'No matches found'}</p>
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
                        className={`w-full py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between text-left cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-accent-soft border border-accent text-accent font-semibold'
                            : 'bg-surface hover:bg-paper border border-rule text-ink'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-paper text-ink-muted border border-rule flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold leading-snug">{localizedStateName}</p>
                            <p className="text-[10px] text-ink-muted">
                              {isHindi ? `${cCount} लोकसभा सीटें` : `${cCount} constituencies`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {isSelected && <Check className="w-4 h-4 text-accent" />}
                          <ChevronRight className="w-4 h-4 text-ink-muted" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 3: LOK SABHA CONSTITUENCIES FOR SELECTED STATE */}
          {view === 'constituency' && (
            <div className="space-y-2">
              {/* Sticky Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-ink-muted" />
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
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-paper border border-rule text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-accent font-normal min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-ink-muted hover:text-ink p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {filteredConstituencies.length === 0 ? (
                  <div className="py-8 text-center text-xs text-ink-muted">
                    <p className="font-medium">
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
                        className={`w-full py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between text-left cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-accent-soft border border-accent text-accent font-semibold'
                            : 'bg-surface hover:bg-paper border border-rule text-ink'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isAll ? 'bg-accent text-surface' : 'bg-paper text-ink-muted border border-rule'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold leading-snug">
                              {isAll
                                ? isHindi
                                  ? `संपूर्ण ${selectedState}`
                                  : `All ${selectedState}`
                                : c}
                            </p>
                            <p className="text-[10px] text-ink-muted">
                              {isAll
                                ? isHindi
                                  ? 'राज्य स्तरीय व्यापक जनमत'
                                  : 'Statewide general consensus'
                                : isHindi
                                  ? 'लोकसभा संसदीय निर्वाचन क्षेत्र'
                                  : 'Lok Sabha parliamentary seat'}
                            </p>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0 ml-2" />}
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
