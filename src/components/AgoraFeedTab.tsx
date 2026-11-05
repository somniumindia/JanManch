'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AgoraPost, Topic, SurveyChoice, SurveyVotes } from '@/lib/types';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ShieldCheck,
  Share2,
  ChevronRight,
  Search,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  MessageCircle,
  Users,
  Bookmark,
  FileText,
  ExternalLink,
  Flame,
  Bot,
  ChevronDown,
  ChevronUp,
  X,
  Compass,
} from 'lucide-react';
import { DICTIONARY, SURVEY_OPTIONS, TOPIC_NAMES, REGION_NAMES } from '@/lib/translations';
import { SPECTRUM_LEVELS } from '@/constants/regions';

const TOPIC_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  Economy: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  Education: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  'Civic Life': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Technology: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
};

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
  const votes: SurveyVotes = post.survey_votes || {
    strongly_agree: Math.round(post.agree_votes * 0.55),
    agree: Math.max(0, Math.round(post.agree_votes * 0.45)),
    neutral: Math.max(12, Math.round((post.agree_votes + post.disagree_votes) * 0.1)),
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

  return { votes, total, pct };
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
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    posts,
    argumentsList,
    activeCountry,
    activeRegion,
    activeConstituency,
    activeTopic,
    setTopic,
    feedSort,
    setFeedSort,
    language,
    searchQuery,
    setSearchQuery,
    castPropositionVote,
    castSurveyVote,
    user,
    setDrawerPost,
  } = useApp();

  const t = DICTIONARY[language];
  const isHindi = language === 'hi';

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // AI Summaries state: { [postId]: { loading: boolean, bullets?: string[], open: boolean } }
  const [aiSummaries, setAiSummaries] = useState<
    Record<string, { loading: boolean; bullets?: string[]; open: boolean }>
  >({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle or fetch AI Summary
  const handleToggleAiSummary = async (post: AgoraPost) => {
    const current = aiSummaries[post.id];
    if (current?.open) {
      setAiSummaries((prev) => ({
        ...prev,
        [post.id]: { ...prev[post.id], open: false },
      }));
      return;
    }

    if (current?.bullets && current.bullets.length > 0) {
      setAiSummaries((prev) => ({
        ...prev,
        [post.id]: { ...prev[post.id], open: true },
      }));
      return;
    }

    // Set loading
    setAiSummaries((prev) => ({
      ...prev,
      [post.id]: { loading: true, open: true },
    }));

    try {
      const postArgs = argumentsList.filter((a) => a.post_id === post.id);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summarize',
          title: post.title,
          description: post.description,
          argumentsList: postArgs.map((a) => ({
            author_name: a.author_name,
            stance: a.stance,
            content: a.content,
          })),
          language,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.bullets)) {
        setAiSummaries((prev) => ({
          ...prev,
          [post.id]: { loading: false, bullets: data.bullets, open: true },
        }));
      } else {
        throw new Error(data.error || 'Summary generation failed');
      }
    } catch (err: any) {
      showToast(isHindi ? 'AI सारांश प्राप्त नहीं हो सका' : 'Could not generate summary');
      setAiSummaries((prev) => ({
        ...prev,
        [post.id]: { loading: false, open: false },
      }));
    }
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
    <div className="space-y-3.5 px-4 py-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold shadow-xl animate-fade-in flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            {t.clear}
          </button>
        )}
      </div>

      {/* 3-Step Interactive Guidance Strip */}
      {showOnboardingGuide && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-3.5 shadow-md shadow-blue-500/15 animate-fade-in border border-blue-400/30">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Compass className="w-3.5 h-3.5 text-white" />
              </div>
              <h4 className="text-xs font-extrabold tracking-tight">
                {isHindi ? '3 चरणों में आपकी नागरिक शक्ति' : 'Your Civic Power in 3 Steps'}
              </h4>
            </div>
            <button
              onClick={() => setShowOnboardingGuide(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title={isHindi ? 'बंद करें' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10 flex flex-col items-center">
              <span className="w-4 h-4 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center mb-1">
                1
              </span>
              <span className="text-[10px] font-bold leading-tight">
                {isHindi ? 'क्षेत्र चुनें' : 'Choose Region'}
              </span>
              <span className="text-[9px] text-blue-100/80 mt-0.5 leading-tight">
                {isHindi ? 'शीर्ष फिल्टर' : 'Top selector'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10 flex flex-col items-center">
              <span className="w-4 h-4 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center mb-1">
                2
              </span>
              <span className="text-[10px] font-bold leading-tight">
                {isHindi ? 'मत दर्ज करें' : 'Cast 5-Pt Vote'}
              </span>
              <span className="text-[9px] text-blue-100/80 mt-0.5 leading-tight">
                {isHindi ? 'सहमति स्केल' : 'Likert meter'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10 flex flex-col items-center">
              <span className="w-4 h-4 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center mb-1">
                3
              </span>
              <span className="text-[10px] font-bold leading-tight">
                {isHindi ? 'अखाड़ा बहस' : 'Deliberate'}
              </span>
              <span className="text-[9px] text-blue-100/80 mt-0.5 leading-tight">
                {isHindi ? '+20 कर्मा' : '+20 Karma'}
              </span>
            </div>
          </div>
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
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {displayTopic}
            </button>
          );
        })}
      </div>

      {/* Feed Sorting Switcher (Latest vs. Most Active) */}
      <div className="flex items-center justify-between gap-2 p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setFeedSort('latest')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            feedSort === 'latest'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{isHindi ? 'नवीनतम' : 'Latest'}</span>
        </button>

        <button
          onClick={() => setFeedSort('active')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            feedSort === 'active'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>{isHindi ? 'सक्रिय' : 'Most Active'}</span>
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
          {sortedPosts.map((post) => {
            const topicColors = TOPIC_BADGES[post.topic] || {
              bg: 'bg-slate-100',
              text: 'text-slate-800',
              border: 'border-slate-200',
            };

            const postArgs = argumentsList.filter((a) => a.post_id === post.id);
            const stats = calculateSurveyStats(post);
            const userChoice = user?.votedSurveys?.[post.id];
            const authorHandle =
              post.author_username || post.author_name.toLowerCase().replace(/\s+/g, '_');
            const isBookmarked = Boolean(bookmarkedIds[post.id]);
            const postSummary = aiSummaries[post.id];

            return (
              <article
                key={post.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                {/* Card Top: Topic, Geographic Badge & Relative Posting Time */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${topicColors.bg} ${topicColors.text} ${topicColors.border}`}
                    >
                      {TOPIC_NAMES[post.topic as Topic]?.[language] || post.topic}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/90 truncate max-w-[210px] shrink-0">
                      {getCardGeographicBadge(post, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0 ml-auto">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatRelativeTime(post.created_at, mounted, isHindi)}</span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                    {post.author_name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900">{post.author_name}</span>
                    <span className="text-[11px] text-slate-400 font-normal">@{authorHandle}</span>
                    {post.is_verified_citizen && (
                      <span title="Verified Citizen Voter">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Proposition Title & Context */}
                <div className="space-y-1.5 cursor-pointer" onClick={() => setDrawerPost(post)}>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug hover:text-blue-700 transition-colors">
                    {isHindi && post.title_hi ? post.title_hi : post.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {isHindi && (post.description_hi || post.context_hi)
                      ? post.description_hi || post.context_hi
                      : post.description}
                  </p>
                </div>

                {/* Multi-Media Evidence & Attachment Rendering */}
                {post.media_url && (
                  <div className="pt-0.5 space-y-2">
                    {/* Case 1: Image Evidence */}
                    {(post.media_type === 'image' || (!post.media_type && Boolean(post.media_url.match(/\.(png|jpe?g|webp|gif)($|\?)/i)))) && (
                      <div className="rounded-xl overflow-hidden border border-slate-200/90 bg-slate-100 max-h-64 shadow-xs">
                        <img
                          src={post.media_url}
                          alt={post.title}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage(post.media_url!);
                          }}
                          className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Case 2: Video Evidence */}
                    {(post.media_type === 'video' || (!post.media_type && Boolean(post.media_url.match(/\.(mp4|webm|mov)($|\?)/i)))) && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl overflow-hidden border border-slate-200 bg-black max-h-64 shadow-xs"
                      >
                        <video
                          src={post.media_url}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-64 object-contain"
                        />
                      </div>
                    )}

                    {/* Case 3: Document Evidence (PDF) */}
                    {(post.media_type === 'document' || (!post.media_type && Boolean(post.media_url.match(/\.(pdf|doc|docx)($|\?)/i)))) && (
                      <a
                        href={post.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {post.media_filename || (isHindi ? 'संलग्न आधिकारिक साक्ष्य दस्तावेज़' : 'Official Evidence Document')}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {isHindi ? 'पीडीएफ दस्तावेज़ • नए टैब में देखें' : 'PDF Document • Tap to open in new tab'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 shrink-0 ml-2">
                          <span>{isHindi ? 'दस्तावेज़ देखें' : 'View Document'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </a>
                    )}
                  </div>
                )}

                {/* Optional External News Link */}
                {post.source_url && (
                  <div className="pt-0.5">
                    <a
                      href={post.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{t.newsArticle}</span>
                    </a>
                  </div>
                )}

                {/* Requirement 5: AI COPILOT SUMMARY BOX (Collapsible on Card) */}
                <div className="pt-0.5">
                  <button
                    onClick={() => handleToggleAiSummary(post)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-700 transition-all shadow-2xs"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{postSummary?.open ? t.hideSummary : t.aiSummary}</span>
                    {postSummary?.loading ? (
                      <Sparkles className="w-3 h-3 animate-spin text-purple-600" />
                    ) : postSummary?.open ? (
                      <ChevronUp className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-indigo-600" />
                    )}
                  </button>

                  {postSummary?.open && (
                    <div className="mt-2 p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border border-indigo-200/80 shadow-xs space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>{t.aiSummaryHeading}</span>
                        </span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          Gemini 1.5
                        </span>
                      </div>

                      {postSummary.loading ? (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 py-2">
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>{t.aiGenerating}</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                          {postSummary.bullets?.map((b, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-indigo-600 font-bold mt-0.5">•</span>
                              <p className="flex-1 font-medium">{b}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dynamic Voting Engine: The Verdict (2-Way) vs The Spectrum (5-Tier) */}
                <div className="space-y-3 pt-1">
                  {post.voting_mode === 'verdict' ? (
                    /* 1. THE VERDICT: Clear 2-Way Endorse vs Oppose */
                    <div className="space-y-2">
                      {/* Split Progress Bar with percentages & total counts */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-700 flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>
                              {isHindi ? 'पक्ष में' : 'Endorse'} {Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%
                            </span>
                            <span className="text-[10px] font-normal text-slate-400">
                              ({post.agree_votes})
                            </span>
                          </span>

                          <span className="text-rose-700 flex items-center gap-1.5">
                            <span className="text-[10px] font-normal text-slate-400">
                              ({post.disagree_votes})
                            </span>
                            <span>
                              {isHindi ? 'विपक्ष में' : 'Oppose'} {100 - Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%
                            </span>
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {/* 2-Tone Split Progress Bar */}
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          <div
                            style={{
                              width: `${Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%`,
                            }}
                            className="h-full bg-emerald-600 transition-all duration-300"
                          />
                          <div
                            style={{
                              width: `${100 - Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%`,
                            }}
                            className="h-full bg-rose-600 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Dual Interactive Option Buttons: Endorse vs Oppose (Single clean icon per action) */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          onClick={() => castPropositionVote(post.id, 'endorse')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border shadow-2xs ${
                            user?.votedPropositions?.[post.id] === 'endorse' || user?.votedDebates?.[post.id] === 'pro'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30'
                              : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'पक्ष में' : 'Endorse'}</span>
                          <span className="text-[10px] opacity-80 font-normal">
                            ({Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%)
                          </span>
                        </button>

                        <button
                          onClick={() => castPropositionVote(post.id, 'oppose')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border shadow-2xs ${
                            user?.votedPropositions?.[post.id] === 'oppose' || user?.votedDebates?.[post.id] === 'con'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/30'
                              : 'bg-rose-50/70 hover:bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'विपक्ष में' : 'Oppose'}</span>
                          <span className="text-[10px] opacity-80 font-normal">
                            ({100 - Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%)
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 2. THE SPECTRUM: 5-Tier Likert Consensus Meter */
                    <div className="space-y-2">
                      {/* Continuous 5-Segmented Consensus Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-emerald-800 font-bold">
                            {isHindi ? 'समर्थक' : 'Support'} {stats.pct.strongly_agree + stats.pct.agree}%
                          </span>

                          <span className="text-slate-500 font-semibold text-[10px]">
                            {isHindi ? 'अनिर्णित' : 'Undecided'} {stats.pct.neutral}%
                          </span>

                          <span className="text-rose-800 font-bold">
                            {isHindi ? 'विरोधी' : 'Dissent'} {stats.pct.disagree + stats.pct.strongly_disagree}%
                          </span>
                        </div>

                        {/* Continuous 5-Segmented Color Bar: Dark Emerald, Light Emerald, Slate Gray, Light Rose, Crimson */}
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          <div
                            style={{ width: `${stats.pct.strongly_agree}%` }}
                            className="h-full bg-emerald-800 transition-all duration-300"
                            title={`Firmly Back: ${stats.pct.strongly_agree}%`}
                          />
                          <div
                            style={{ width: `${stats.pct.agree}%` }}
                            className="h-full bg-emerald-500 transition-all duration-300"
                            title={`Lean Support: ${stats.pct.agree}%`}
                          />
                          <div
                            style={{ width: `${stats.pct.neutral}%` }}
                            className="h-full bg-slate-400 transition-all duration-300"
                            title={`Undecided: ${stats.pct.neutral}%`}
                          />
                          <div
                            style={{ width: `${stats.pct.disagree}%` }}
                            className="h-full bg-rose-400 transition-all duration-300"
                            title={`Lean Dissent: ${stats.pct.disagree}%`}
                          />
                          <div
                            style={{ width: `${stats.pct.strongly_disagree}%` }}
                            className="h-full bg-rose-800 transition-all duration-300"
                            title={`Firmly Oppose: ${stats.pct.strongly_disagree}%`}
                          />
                        </div>
                      </div>

                      {/* 5 Compact, Touch-Friendly Option Pills */}
                      <div className="grid grid-cols-5 gap-1 w-full mt-2">
                        {SPECTRUM_LEVELS.map((level) => {
                          const isChosen =
                            userChoice === level.key ||
                            user?.votedPropositions?.[post.id] === level.key;
                          const label = isHindi ? level.labelHi : level.labelEn;
                          const percentage = stats.pct[level.key];

                          return (
                            <button
                              key={level.key}
                              onClick={() => castPropositionVote(post.id, level.key)}
                              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border text-center w-full min-w-0 overflow-hidden transition-all active:scale-95 ${
                                isChosen
                                  ? `${level.barColor} text-white shadow-xs ring-2 ring-blue-500/30 border-transparent`
                                  : `${level.bgLight} ${level.color} ${level.badgeBorder} hover:opacity-90`
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mb-0.5 shrink-0 ${
                                  isChosen ? 'bg-white' : level.barColor
                                }`}
                              />
                              <span className="text-[9px] font-bold leading-none tracking-tight truncate w-full text-center px-0.5">
                                {label}
                              </span>
                              <span className={`text-[10px] font-semibold mt-0.5 leading-none ${isChosen ? 'text-white/90' : 'text-slate-500'}`}>
                                {percentage}%
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. CLEAN METADATA FOOTER (Clearly separated below voting buttons, no overlap) */}
                  <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {post.voting_mode === 'verdict' ? post.agree_votes + post.disagree_votes : stats.total}{' '}
                        {isHindi ? 'नागरिकों ने भाग लिया' : 'citizens participated'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleWhatsAppShare(post)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 font-semibold text-[11px] transition-colors"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.share}</span>
                      </button>

                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                        }`}
                        title={isBookmarked ? 'Bookmarked' : 'Bookmark this debate'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* "Join Deliberation Floor" Button */}
                  <button
                    onClick={() => setDrawerPost(post)}
                    className="w-full mt-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 group"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600 mr-1.5 shrink-0" />
                    <span>
                      {isHindi
                        ? `विचार-मंथन कक्ष में भाग लें (${postArgs.length} तर्क)`
                        : `Join Deliberation Floor (${postArgs.length} arguments)`}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
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
    </div>
  );
};
