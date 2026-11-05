'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useApp } from '@/context/AppContext';
import { AgoraPost, Topic, SurveyVotes } from '@/lib/types';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ShieldCheck,
  Share2,
  ChevronRight,
  Search,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  MessageCircle,
  Bookmark,
  Flame,
  ChevronDown,
  X,
  Compass,
} from 'lucide-react';
import { DICTIONARY, TOPIC_NAMES, REGION_NAMES } from '@/lib/translations';
import { SPECTRUM_LEVELS } from '@/constants/regions';
import { CascadingRegionModal } from './CascadingRegionModal';

const CATEGORIES: Topic[] = ['All Topics', 'Economy', 'Education', 'Civic Life', 'Technology'];

function formatRelativeTime(dateString: string, isMounted: boolean, isHindi: boolean): string {
  if (!isMounted) return isHindi ? 'हाल ही में' : 'Recently';
  try {
    const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return isHindi ? `${Math.max(1, mins)} मि. पहले` : `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return isHindi ? `${hours} घंटे पहले` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isHindi ? `${days} दिन पहले` : `${days}d ago`;
  } catch {
    return isHindi ? 'हाल ही में' : 'Recently';
  }
}

function calculateSurveyStats(post: AgoraPost) {
  const hasRawVotes = (post.agree_votes || 0) + (post.disagree_votes || 0) > 0;
  const hasSurveyObj = Boolean(
    post.survey_votes &&
    ((post.survey_votes.strongly_agree || 0) +
      (post.survey_votes.agree || 0) +
      (post.survey_votes.neutral || 0) +
      (post.survey_votes.disagree || 0) +
      (post.survey_votes.strongly_disagree || 0)) > 0
  );

  if (!hasRawVotes && !hasSurveyObj) {
    return {
      votes: { strongly_agree: 0, agree: 0, neutral: 0, disagree: 0, strongly_disagree: 0 },
      total: 0,
      pct: { strongly_agree: 0, agree: 0, neutral: 0, disagree: 0, strongly_disagree: 0 },
      hasVotes: false,
    };
  }

  const votes: SurveyVotes = post.survey_votes || {
    strongly_agree: Math.round(post.agree_votes * 0.55),
    agree: Math.max(0, Math.round(post.agree_votes * 0.45)),
    neutral: Math.round((post.agree_votes + post.disagree_votes) * 0.1),
    disagree: Math.max(0, Math.round(post.disagree_votes * 0.55)),
    strongly_disagree: Math.round(post.disagree_votes * 0.45),
  };

  const total =
    (votes.strongly_agree || 0) +
    (votes.agree || 0) +
    (votes.neutral || 0) +
    (votes.disagree || 0) +
    (votes.strongly_disagree || 0);

  const safeTotal = total > 0 ? total : 1;

  const pct = {
    strongly_agree: Math.round(((votes.strongly_agree || 0) / safeTotal) * 100),
    agree: Math.round(((votes.agree || 0) / safeTotal) * 100),
    neutral: Math.round(((votes.neutral || 0) / safeTotal) * 100),
    disagree: Math.round(((votes.disagree || 0) / safeTotal) * 100),
    strongly_disagree: Math.round(((votes.strongly_disagree || 0) / safeTotal) * 100),
  };

  return { votes, total, pct, hasVotes: total > 0 };
}

function getCardGeographicBadge(post: AgoraPost, language: 'en' | 'hi') {
  const isHindi = language === 'hi';
  const country = post.country || 'India';
  const region = post.region || 'All India';
  const constituency = post.constituency;

  if (country !== 'India') {
    const countryName = country === 'Worldwide' 
      ? (isHindi ? 'वैश्विक' : 'Worldwide')
      : country;
    return `🌐 ${countryName}`;
  }

  if (region === 'All India' || !region) {
    return isHindi ? '🇮🇳 संपूर्ण भारत' : '🇮🇳 All India';
  }

  const localizedRegion = REGION_NAMES[region]?.[language] || region;
  if (constituency && constituency !== 'All Constituencies') {
    return `📍 ${constituency}, ${localizedRegion}`;
  }

  return `📍 ${localizedRegion}`;
}

export const AgoraFeedTab: React.FC = () => {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const {
    posts,
    argumentsList,
    activeCountry,
    activeRegion,
    activeConstituency,
    setGeographicFilter,
    activeTopic,
    setTopic,
    feedSort,
    setFeedSort,
    language,
    searchQuery,
    setSearchQuery,
    castPropositionVote,
    user,
    setDrawerPost,
  } = useApp();

  const t = DICTIONARY[language];
  const isHindi = language === 'hi';

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [modalStartView, setModalStartView] = useState<'country' | 'state' | 'constituency'>('country');

  const isIndia = activeCountry === 'India';
  const isAllConstituencies = !activeConstituency || activeConstituency === 'All Constituencies';
  const hasSpecificFilter =
    activeCountry !== 'Worldwide' &&
    (activeRegion !== 'All India' || !isAllConstituencies || activeCountry !== 'India');

  const handleOpenScopeSelector = () => {
    setModalStartView('country');
    setIsRegionModalOpen(true);
  };

  const handleResetToWorldwide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGeographicFilter('Worldwide', 'All India', 'All Constituencies');
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter posts by country, region, constituency, topic, and search query
  const filteredPosts = posts.filter((post) => {
    const isIndia = !activeCountry || activeCountry === 'India';
    const isWorldwide = activeCountry === 'Worldwide';

    const matchesCountry =
      isWorldwide ||
      (!post.country && isIndia) ||
      post.country === 'Worldwide' ||
      post.country === activeCountry;

    const matchesRegion =
      !isIndia ||
      activeRegion === 'All India' ||
      post.region === activeRegion ||
      post.region === 'All India' ||
      (activeRegion === 'Delhi (NCT)' && (post.region === 'Delhi NCR' || post.region === 'Delhi (NCT)')) ||
      (activeRegion === 'Delhi NCR' && (post.region === 'Delhi NCR' || post.region === 'Delhi (NCT)')) ||
      (activeRegion === 'Maharashtra' && post.region === 'Mumbai') ||
      (activeRegion === 'Karnataka' && post.region === 'Bangalore') ||
      (activeRegion === 'Telangana' && post.region === 'Hyderabad');

    const matchesConstituency =
      !isIndia ||
      !activeConstituency ||
      activeConstituency === 'All Constituencies' ||
      !post.constituency ||
      post.constituency === 'All Constituencies' ||
      post.constituency === activeConstituency;

    const matchesTopic =
      activeTopic === 'All Topics' || post.topic === activeTopic;

    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author_username && post.author_username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.constituency && post.constituency.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.region && post.region.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCountry && matchesRegion && matchesConstituency && matchesTopic && matchesSearch;
  });

  // Sort posts: Latest vs Most Active
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (feedSort === 'latest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      // Most active: total votes + total arguments count
      const aArgs = argumentsList.filter((x) => x.post_id === a.id).length;
      const bArgs = argumentsList.filter((x) => x.post_id === b.id).length;
      const aStats = calculateSurveyStats(a);
      const bStats = calculateSurveyStats(b);
      const aScore = aStats.total + aArgs * 3;
      const bScore = bStats.total + bArgs * 3;
      return bScore - aScore;
    }
  });

  const handleShare = (post: AgoraPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`JanManch Citizen Agora: "${post.title}" - https://janmanch.in`);
      showToast(t.copied);
    }
  };

  const handleBookmark = (postId: string) => {
    setBookmarkedIds((prev) => {
      const next = !prev[postId];
      showToast(next ? t.bookmarked : t.bookmarkRemoved);
      return { ...prev, [postId]: next };
    });
  };

  const handleWhatsAppShare = (post: AgoraPost) => {
    const shareText = `Join the citizen deliberation on JanManch Agora:\n\n"${post.title}"\n\nCast your vote & read arguments: https://janmanch.in`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3 px-4 py-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-ink border border-rule text-surface text-xs font-semibold shadow-lg animate-fade-in flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-support" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Filter Strip: Region Scope + Topic Selector */}
      <div className="flex items-center gap-2">
        {/* Region Scope Button */}
        <button
          type="button"
          onClick={handleOpenScopeSelector}
          className="flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium border border-rule bg-surface text-ink hover:bg-paper active:scale-98 transition-all focus-visible:outline-accent"
          title={isHindi ? 'जनमत दायरा बदलें' : 'Change debate scope'}
        >
          <div className="flex items-center gap-1.5 truncate min-w-0">
            {activeCountry === 'Worldwide' ? (
              <>
                <span className="text-sm shrink-0 leading-none">🌐</span>
                <span className="truncate">{isHindi ? 'विश्वव्यापी (सभी विचार)' : 'Worldwide (All posts)'}</span>
              </>
            ) : isIndia && activeRegion === 'All India' ? (
              <>
                <span className="text-sm shrink-0 leading-none">🇮🇳</span>
                <span className="truncate">{isHindi ? 'भारत (देशव्यापी)' : 'India (Countrywide)'}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate font-semibold text-ink">
                  {!isAllConstituencies ? `📍 ${activeConstituency}` : `📍 ${activeRegion}`}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {hasSpecificFilter && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleResetToWorldwide}
                className="w-4 h-4 rounded-full bg-rule hover:bg-oppose-soft hover:text-oppose-strong text-ink-muted flex items-center justify-center transition-colors cursor-pointer"
                title={isHindi ? 'विश्वव्यापी पर रीसेट करें' : 'Reset to worldwide'}
                aria-label="Reset to worldwide"
              >
                <X className="w-2.5 h-2.5" />
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          </div>
        </button>

        {/* Topic Selector */}
        <div className="relative shrink-0">
          <select
            value={activeTopic}
            onChange={(e) => setTopic(e.target.value as Topic)}
            className="appearance-none bg-surface border border-rule text-ink text-xs font-semibold pl-3 pr-8 py-2 min-h-[44px] rounded-xl focus-visible:outline-accent hover:bg-paper transition-colors cursor-pointer"
            aria-label={isHindi ? 'विषय चुनें' : 'Filter by topic'}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {TOPIC_NAMES[cat]?.[language] || cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2 min-h-[44px] rounded-xl bg-surface border border-rule text-xs text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink font-semibold p-1"
          >
            {t.clear}
          </button>
        )}
      </div>

      {/* Compact Dismissible One-Line Tip */}
      {showOnboardingGuide && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-accent-soft border border-accent/20 text-xs text-ink animate-fade-in">
          <div className="flex items-center gap-2 truncate min-w-0">
            <span className="text-sm shrink-0">💡</span>
            <span className="truncate font-medium text-ink">
              {isHindi
                ? 'नागरिक मंच: दायरा चुनें, अपना मत दर्ज करें और बहस में भाग लें।'
                : 'Civic Agora: choose your scope, record your stance, and deliberate.'}
            </span>
          </div>
          <button
            onClick={() => setShowOnboardingGuide(false)}
            className="p-1 rounded-lg text-ink-muted hover:text-ink transition-colors shrink-0"
            title={isHindi ? 'बंद करें' : 'Dismiss'}
            aria-label="Dismiss tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const isSelected = activeTopic === cat;
          const displayTopic = TOPIC_NAMES[cat]?.[language] || cat;
          return (
            <button
              key={cat}
              onClick={() => setTopic(cat)}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs transition-all whitespace-nowrap shrink-0 active:scale-95 focus-visible:outline-accent border ${
                isSelected
                  ? 'bg-accent text-surface border-accent font-semibold'
                  : 'bg-surface text-ink-muted border-rule hover:bg-paper hover:text-ink font-medium'
              }`}
            >
              {displayTopic}
            </button>
          );
        })}
      </div>

      {/* Feed Sorting Switcher: Simple Segmented Control */}
      <div className="flex items-center justify-between gap-1 p-1 bg-paper border border-rule rounded-xl">
        <button
          onClick={() => setFeedSort('latest')}
          className={`flex-1 py-1.5 px-3 min-h-[36px] rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 focus-visible:outline-accent ${
            feedSort === 'latest'
              ? 'bg-surface text-ink font-semibold border border-rule'
              : 'text-ink-muted hover:text-ink font-medium border border-transparent'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{isHindi ? 'नवीनतम' : 'Latest'}</span>
        </button>

        <button
          onClick={() => setFeedSort('active')}
          className={`flex-1 py-1.5 px-3 min-h-[36px] rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 focus-visible:outline-accent ${
            feedSort === 'active'
              ? 'bg-surface text-ink font-semibold border border-rule'
              : 'text-ink-muted hover:text-ink font-medium border border-transparent'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{isHindi ? 'सक्रिय' : 'Most active'}</span>
        </button>
      </div>

      {/* Stream Overview Subheader */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {activeCountry && activeCountry !== 'India'
              ? `${activeCountry} • `
              : `${REGION_NAMES[activeRegion]?.[language] || activeRegion}${
                  activeConstituency && activeConstituency !== 'All Constituencies'
                    ? ` • ${activeConstituency}`
                    : ''
                } • `}
            <strong className="text-slate-800">
              {TOPIC_NAMES[activeTopic]?.[language] || activeTopic}
            </strong>{' '}
            ({sortedPosts.length} {t.debatesCount})
          </span>
        </span>
        <span className="text-[11px] font-semibold text-blue-700">
          {t.openCitizenAgora}
        </span>
      </div>

      {/* Posts Stream */}
      {sortedPosts.length === 0 ? (
        <div className="py-12 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2.5 shadow-xs">
          <Layers className="w-9 h-9 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">{t.noDebatesFound}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">{t.noDebatesSubtext}</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedPosts.map((post, index) => {
            const isFeatured = index === 0;
            const postArgs = argumentsList.filter((a) => a.post_id === post.id);
            const stats = calculateSurveyStats(post);
            const userChoice = user?.votedSurveys?.[post.id];
            const authorHandle =
              post.author_username || post.author_name.toLowerCase().replace(/\s+/g, '_');
            const isBookmarked = Boolean(bookmarkedIds[post.id]);

            return (
              <article
                key={post.id}
                className={`bg-surface border rounded-xl p-4 transition-all space-y-3 ${
                  isFeatured
                    ? 'border-accent/40 ring-1 ring-accent/20'
                    : 'border-rule'
                }`}
              >
                {/* 1. Meta Line: Topic, Region, Time */}
                <div className="flex items-center justify-between text-xs text-ink-muted leading-none gap-2">
                  <div className="flex items-center gap-1.5 truncate min-w-0">
                    <span className="font-semibold text-accent truncate">
                      {TOPIC_NAMES[post.topic as Topic]?.[language] || post.topic}
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {getCardGeographicBadge(post, language)}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-muted">
                    {formatRelativeTime(post.created_at, mounted, isHindi)}
                  </span>
                </div>

                {/* 2. Author Row */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs shrink-0">
                    {post.author_name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0 truncate text-xs">
                    <span className="font-semibold text-ink truncate">{post.author_name}</span>
                    <span className="text-ink-muted truncate">@{authorHandle}</span>
                    {post.is_verified_citizen && (
                      <span title="Verified citizen">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Title in Serif Font (2-3 lines max) */}
                <h2
                  onClick={() => setDrawerPost(post)}
                  className={`font-serif font-semibold text-ink leading-snug line-clamp-3 hover:text-accent transition-colors cursor-pointer ${
                    isFeatured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                  }`}
                >
                  {isHindi && post.title_hi ? post.title_hi : post.title}
                </h2>

                {/* 4. One-Line Description */}
                <p
                  onClick={() => setDrawerPost(post)}
                  className="text-xs text-ink-muted line-clamp-1 cursor-pointer"
                >
                  {isHindi && (post.description_hi || post.context_hi)
                    ? post.description_hi || post.context_hi
                    : post.description}
                </p>

                {/* 5. The Stance Bar (The Hero) */}
                {(!stats.hasVotes && (post.voting_mode !== 'verdict' || (post.agree_votes + post.disagree_votes === 0))) ? (
                  <div className="space-y-1 pt-1">
                    <div className={`w-full ${isFeatured ? 'h-4' : 'h-3'} rounded-full bg-rule/70 overflow-hidden flex items-center justify-center px-3`}>
                      <span className="text-[10px] font-medium text-ink-muted select-none">
                        {isHindi ? 'अभी कोई मत नहीं। पहले बनें।' : 'No votes yet. Be the first.'}
                      </span>
                    </div>
                  </div>
                ) : post.voting_mode === 'verdict' ? (
                  (() => {
                    const total = post.agree_votes + post.disagree_votes;
                    const supportPct = Math.round((post.agree_votes / total) * 100);
                    const opposePct = 100 - supportPct;
                    return (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-semibold px-0.5">
                          <span className="text-support font-bold flex items-center gap-1">
                            <span>{isHindi ? 'समर्थन' : 'Support'}</span>
                            <span>{supportPct}%</span>
                          </span>
                          <span className="text-oppose font-bold flex items-center gap-1">
                            <span>{opposePct}%</span>
                            <span>{isHindi ? 'विरोध' : 'Oppose'}</span>
                          </span>
                        </div>
                        <div
                          className={`w-full ${isFeatured ? 'h-4' : 'h-3'} rounded-full bg-rule/40 overflow-hidden flex`}
                          title={`Support ${supportPct}%, Oppose ${opposePct}%`}
                        >
                          <div style={{ width: `${supportPct}%` }} className="h-full bg-support transition-all duration-300" />
                          <div style={{ width: `${opposePct}%` }} className="h-full bg-oppose transition-all duration-300" />
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    const supportPct = stats.pct.strongly_agree + stats.pct.agree;
                    const opposePct = stats.pct.disagree + stats.pct.strongly_disagree;
                    return (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-semibold px-0.5">
                          <span className="text-support font-bold flex items-center gap-1">
                            <span>{isHindi ? 'समर्थन' : 'Support'}</span>
                            <span>{supportPct}%</span>
                          </span>
                          <span className="text-oppose font-bold flex items-center gap-1">
                            <span>{opposePct}%</span>
                            <span>{isHindi ? 'विरोध' : 'Oppose'}</span>
                          </span>
                        </div>
                        <div
                          className={`w-full ${isFeatured ? 'h-4' : 'h-3'} rounded-full bg-rule/40 overflow-hidden flex`}
                          title={`Support ${supportPct}%, Oppose ${opposePct}%`}
                        >
                          <div style={{ width: `${stats.pct.strongly_agree}%` }} className="h-full bg-support-strong transition-all duration-300" />
                          <div style={{ width: `${stats.pct.agree}%` }} className="h-full bg-support transition-all duration-300" />
                          <div style={{ width: `${stats.pct.neutral}%` }} className="h-full bg-neutral transition-all duration-300" />
                          <div style={{ width: `${stats.pct.disagree}%` }} className="h-full bg-oppose transition-all duration-300" />
                          <div style={{ width: `${stats.pct.strongly_disagree}%` }} className="h-full bg-oppose-strong transition-all duration-300" />
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* 6. Vote Buttons */}
                {post.voting_mode === 'verdict' ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => castPropositionVote(post.id, 'endorse')}
                      className={`py-2 px-3 min-h-[44px] rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 border focus-visible:outline-accent ${
                        user?.votedPropositions?.[post.id] === 'endorse' || user?.votedDebates?.[post.id] === 'pro'
                          ? 'bg-support text-surface border-support font-bold'
                          : 'bg-surface text-support border border-support/40 hover:bg-support-soft'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{isHindi ? 'समर्थन' : 'Support'}</span>
                    </button>

                    <button
                      onClick={() => castPropositionVote(post.id, 'oppose')}
                      className={`py-2 px-3 min-h-[44px] rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 border focus-visible:outline-accent ${
                        user?.votedPropositions?.[post.id] === 'oppose' || user?.votedDebates?.[post.id] === 'con'
                          ? 'bg-oppose text-surface border-oppose font-bold'
                          : 'bg-surface text-oppose border border-oppose/40 hover:bg-oppose-soft'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{isHindi ? 'विरोध' : 'Oppose'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {SPECTRUM_LEVELS.map((level) => {
                      const isChosen =
                        userChoice === level.key ||
                        user?.votedPropositions?.[post.id] === level.key;
                      const label = isHindi ? level.labelHi : level.labelEn;

                      return (
                        <button
                          key={level.key}
                          onClick={() => castPropositionVote(post.id, level.key)}
                          className={`flex flex-col items-center justify-center py-2 px-1 min-h-[44px] rounded-xl text-center transition-all active:scale-95 border focus-visible:outline-accent ${
                            isChosen
                              ? `${level.barColor} text-surface border-transparent font-bold`
                              : 'bg-surface text-ink border border-rule hover:bg-paper'
                          }`}
                          title={label}
                          aria-label={label}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mb-1 shrink-0 ${
                              isChosen ? 'bg-surface' : level.barColor
                            }`}
                          />
                          <span className="text-[10px] leading-tight font-medium break-words text-center line-clamp-2 w-full">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 7. Single "Join discussion" Row with argument count & action icons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-rule">
                  <button
                    onClick={() => setDrawerPost(post)}
                    className="flex-1 min-w-0 py-2 px-3 min-h-[44px] rounded-xl bg-accent-soft hover:bg-accent/15 text-accent font-semibold text-xs transition-colors flex items-center justify-between group focus-visible:outline-accent"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-4 h-4 text-accent shrink-0" />
                      <span className="truncate">
                        {isHindi
                          ? `चर्चा में भाग लें (${postArgs.length} तर्क)`
                          : `Join discussion (${postArgs.length} arguments)`}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-accent group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleWhatsAppShare(post)}
                      className="p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-paper text-ink-muted hover:text-ink transition-colors flex items-center justify-center focus-visible:outline-accent"
                      title={isHindi ? 'व्हाट्सएप पर साझा करें' : 'Share on WhatsApp'}
                      aria-label="Share on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-support" />
                    </button>

                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`p-2 min-h-[44px] min-w-[44px] rounded-xl transition-colors flex items-center justify-center focus-visible:outline-accent ${
                        isBookmarked
                          ? 'bg-accent-soft text-accent'
                          : 'hover:bg-paper text-ink-muted hover:text-ink'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark this debate'}
                      aria-label="Bookmark"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(post)}
                      className="p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-paper text-ink-muted hover:text-ink transition-colors flex items-center justify-center focus-visible:outline-accent"
                      title={isHindi ? 'लिंक कॉपी करें' : 'Copy link'}
                      aria-label="Copy link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full-Screen Lightbox Modal for Image Evidence */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Evidence Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Slide-Up Bottom Sheet for Geographic & Region Filtering */}
      <CascadingRegionModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        initialView={modalStartView}
      />
    </div>
  );
};
