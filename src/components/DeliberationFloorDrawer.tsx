'use client';

import React, { useState } from 'react';
import { AgoraPost, ArgumentStance, SurveyChoice, SurveyVotes } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
  MapPin,
  Clock,
  User,
  Mic,
  MicOff,
  Bot,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { DICTIONARY, SURVEY_OPTIONS, TOPIC_NAMES } from '@/lib/translations';
import { useSpeechDictation } from '@/lib/speech';

interface DeliberationFloorDrawerProps {
  post: AgoraPost;
  onClose: () => void;
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

export const DeliberationFloorDrawer: React.FC<DeliberationFloorDrawerProps> = ({
  post,
  onClose,
}) => {
  const {
    argumentsList,
    addArgument,
    upvoteArgument,
    castPropositionVote,
    castSurveyVote,
    user,
    openAuthModal,
    language,
  } = useApp();

  const t = DICTIONARY[language];
  const isHindi = language === 'hi';

  const [viewFilter, setViewFilter] = useState<'all' | 'pro' | 'con'>('all');
  const [newStance, setNewStance] = useState<ArgumentStance>('pro');
  const [argumentContent, setArgumentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const postArguments = argumentsList.filter((a) => a.post_id === post.id);
  const proArgs = postArguments.filter((a) => a.stance === 'pro');
  const conArgs = postArguments.filter((a) => a.stance === 'con');

  const stats = calculateSurveyStats(post);
  const userChoice = user?.votedSurveys?.[post.id];
  const upvotedArgs = user?.upvotedArgumentIds || [];

  // Voice-to-Text Microphone integration
  const {
    isListening,
    isSupported,
    toggleListening,
    stopListening,
    error: speechError,
  } = useSpeechDictation({
    lang: isHindi ? 'hi-IN' : 'en-IN',
    onTranscript: (text) => {
      setArgumentContent((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  const handleAddArgument = async (e: React.FormEvent) => {
    e.preventDefault();
    stopListening();
    if (!user) {
      openAuthModal(
        isHindi
          ? 'अपना तर्क प्रस्तुत करने के लिए प्रवेश करें।'
          : 'Sign in to submit your civic argument.'
      );
      return;
    }
    if (!argumentContent.trim()) return;

    setIsSubmitting(true);
    await addArgument(post.id, newStance, argumentContent.trim());
    setArgumentContent('');
    setIsSubmitting(false);
  };

  const handleUpvote = (argId: string) => {
    if (!user) {
      openAuthModal(
        isHindi
          ? 'तर्क का समर्थन करने के लिए प्रवेश करें।'
          : 'Sign in to upvote debate arguments.'
      );
      return;
    }
    upvoteArgument(argId);
  };

  // Requirement 5: AI Refinement feature for argument drafting
  const handleRefineWithAi = async () => {
    if (!argumentContent.trim()) {
      showToast(isHindi ? 'कृपया पहले कुछ विचार या बिंदु टाइप करें।' : 'Please type your rough point first.');
      return;
    }

    setIsRefining(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'refine',
          title: post.title,
          draftText: argumentContent,
          stance: newStance,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.refinedText) {
        setArgumentContent(data.refinedText);
        showToast(isHindi ? 'AI द्वारा तर्क को परिष्कृत किया गया!' : 'Argument polished with AI!');
      } else {
        throw new Error(data.error || 'Refinement failed');
      }
    } catch {
      showToast(isHindi ? 'AI सुधार उपलब्ध नहीं हो सका' : 'Could not refine argument with AI');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm pointer-events-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] h-[88vh] flex flex-col bg-white rounded-t-3xl shadow-2xl overflow-hidden pointer-events-auto relative w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Toast inside Drawer */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* 1. Sticky Header */}
        <div className="flex-shrink-0 border-b border-slate-100 p-4 bg-white space-y-2.5 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {(TOPIC_NAMES as Record<string, { en: string; hi: string }>)[post.topic]?.[language] || post.topic}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                  <span>
                    {post.constituency && post.constituency !== 'All Constituencies'
                      ? `${post.constituency}, ${post.region}`
                      : post.region}
                  </span>
                </span>
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                {isHindi && post.title_hi ? post.title_hi : post.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
              title={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Attachments pills in drawer header */}
          {(post.media_url || post.source_url) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {post.media_url && (
                <a
                  href={post.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10.5px] font-semibold hover:bg-slate-200 transition-colors"
                >
                  <FileText className="w-3 h-3 text-blue-600" />
                  <span className="truncate max-w-[130px]">{t.evidenceAttached}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              )}
              {post.source_url && (
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10.5px] font-semibold hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-blue-600" />
                  <span className="truncate max-w-[130px]">{t.newsArticle}</span>
                </a>
              )}
            </div>
          )}

          {/* Consensus Status Bar & Pills: Verdict vs Spectrum */}
          {post.voting_mode === 'verdict' ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-700">
                  {isHindi ? 'समर्थन' : 'Endorse'} {Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {post.agree_votes + post.disagree_votes} {t.totalVoted.replace(':', '')}
                </span>
                <span className="text-rose-700">
                  {isHindi ? 'विरोध' : 'Oppose'} {100 - Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%
                </span>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{
                    width: `${Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%`,
                  }}
                  className="h-full bg-emerald-600 transition-all"
                />
                <div
                  style={{
                    width: `${100 - Math.round((post.agree_votes / Math.max(1, post.agree_votes + post.disagree_votes)) * 100)}%`,
                  }}
                  className="h-full bg-rose-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => castPropositionVote(post.id, 'endorse')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border ${
                    user?.votedPropositions?.[post.id] === 'endorse' || user?.votedDebates?.[post.id] === 'pro'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{isHindi ? 'समर्थन' : 'Endorse'}</span>
                </button>
                <button
                  onClick={() => castPropositionVote(post.id, 'oppose')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border ${
                    user?.votedPropositions?.[post.id] === 'oppose' || user?.votedDebates?.[post.id] === 'con'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>{isHindi ? 'विरोध' : 'Oppose'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-700">
                  {isHindi ? 'सहमत' : 'Agree'} {stats.pct.strongly_agree + stats.pct.agree}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {stats.total} {t.totalVoted.replace(':', '')}
                </span>
                <span className="text-rose-700">
                  {isHindi ? 'असहमत' : 'Disagree'} {stats.pct.disagree + stats.pct.strongly_disagree}%
                </span>
              </div>

              {/* 5-Segment Color Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: `${stats.pct.strongly_agree}%` }} className="h-full bg-emerald-700 transition-all" />
                <div style={{ width: `${stats.pct.agree}%` }} className="h-full bg-emerald-500 transition-all" />
                <div style={{ width: `${stats.pct.neutral}%` }} className="h-full bg-slate-400 transition-all" />
                <div style={{ width: `${stats.pct.disagree}%` }} className="h-full bg-rose-400 transition-all" />
                <div style={{ width: `${stats.pct.strongly_disagree}%` }} className="h-full bg-rose-800 transition-all" />
              </div>

              {/* Compact 5-Point Voting Pills inside Drawer */}
              <div className="grid grid-cols-5 gap-1 pt-1">
                {(
                  [
                    'strongly_agree',
                    'agree',
                    'neutral',
                    'disagree',
                    'strongly_disagree',
                  ] as SurveyChoice[]
                ).map((choiceKey) => {
                  const opt = SURVEY_OPTIONS[choiceKey];
                  const isChosen = userChoice === choiceKey || user?.votedPropositions?.[post.id] === choiceKey;
                  const label = opt[language];

                  return (
                    <button
                      key={choiceKey}
                      onClick={() => castPropositionVote(post.id, choiceKey)}
                      className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border text-center w-full min-w-0 overflow-hidden transition-all active:scale-95 leading-tight ${
                        isChosen
                          ? `${opt.activeBg} ${opt.activeText} shadow-xs ring-1 ${opt.ring}`
                          : `${opt.bg} ${opt.color} ${opt.border} hover:opacity-90`
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mb-0.5 shrink-0 ${
                          isChosen ? 'bg-white' : opt.barColor
                        }`}
                      />
                      <span className="text-[9px] font-bold leading-none tracking-tight truncate w-full text-center px-0.5">
                        {label}
                      </span>
                      <span className={`text-[10px] font-semibold mt-0.5 leading-none ${isChosen ? 'text-white/90' : 'text-slate-500'}`}>
                        {stats.pct[choiceKey]}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View Filter Toggle Pills */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.allSides} ({postArguments.length})
              </button>
              <button
                onClick={() => setViewFilter('pro')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewFilter === 'pro'
                    ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                {t.inFavor} ({proArgs.length})
              </button>
              <button
                onClick={() => setViewFilter('con')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewFilter === 'con'
                    ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                {t.against} ({conArgs.length})
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-medium">
              +5 {isHindi ? 'कर्म / मत' : 'Karma / vote'}
            </span>
          </div>
        </div>

        {/* 2. Scrollable Arguments List Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 min-h-0 bg-slate-50/40">
          {viewFilter === 'all' ? (
            /* Dual-column side-by-side feed */
            <div className="grid grid-cols-2 gap-2.5">
              {/* Left Column: Pro Arguments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200/80">
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t.inFavor} ({proArgs.length})
                  </span>
                </div>

                {proArgs.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-[11px] text-slate-500 text-center">
                    {isHindi ? 'पक्ष में अभी कोई तर्क नहीं है। नीचे जोड़ें!' : 'No pro arguments yet. Add your perspective below!'}
                  </div>
                ) : (
                  proArgs.map((arg) => {
                    const isUpvoted = upvotedArgs.includes(arg.id);
                    const handle = arg.author_username || arg.author_name.toLowerCase().replace(/\s+/g, '_');
                    return (
                      <div
                        key={arg.id}
                        className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 text-slate-900 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="truncate max-w-[85px]">
                            <span className="text-[11px] font-bold text-emerald-950 block truncate">
                              {arg.author_name}
                            </span>
                            <span className="text-[9px] text-emerald-700 font-medium block truncate">
                              @{handle}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUpvote(arg.id)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                              isUpvoted
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <ThumbsUp className="w-2.5 h-2.5" />
                            <span>{arg.upvotes}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                          {isHindi && arg.content_hi ? arg.content_hi : arg.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Con Arguments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-rose-200/80">
                  <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wide flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {t.against} ({conArgs.length})
                  </span>
                </div>

                {conArgs.length === 0 ? (
                  <div className="p-3 rounded-xl bg-rose-50/40 border border-rose-100 text-[11px] text-slate-500 text-center">
                    {isHindi ? 'विरोध में अभी कोई तर्क नहीं है। नीचे जोड़ें!' : 'No counter arguments yet. Add your rebuttal below!'}
                  </div>
                ) : (
                  conArgs.map((arg) => {
                    const isUpvoted = upvotedArgs.includes(arg.id);
                    const handle = arg.author_username || arg.author_name.toLowerCase().replace(/\s+/g, '_');
                    return (
                      <div
                        key={arg.id}
                        className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-200/90 text-slate-900 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="truncate max-w-[85px]">
                            <span className="text-[11px] font-bold text-rose-950 block truncate">
                              {arg.author_name}
                            </span>
                            <span className="text-[9px] text-rose-700 font-medium block truncate">
                              @{handle}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUpvote(arg.id)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                              isUpvoted
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <ThumbsUp className="w-2.5 h-2.5" />
                            <span>{arg.upvotes}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                          {isHindi && arg.content_hi ? arg.content_hi : arg.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Single Feed list when Pro or Con selected */
            <div className="space-y-2.5">
              {(viewFilter === 'pro' ? proArgs : conArgs).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {isHindi ? 'इस पक्ष में अभी कोई तर्क उपलब्ध नहीं है।' : 'No arguments submitted in this stance yet.'}
                </div>
              ) : (
                (viewFilter === 'pro' ? proArgs : conArgs).map((arg) => {
                  const isPro = arg.stance === 'pro';
                  const isUpvoted = upvotedArgs.includes(arg.id);
                  const handle = arg.author_username || arg.author_name.toLowerCase().replace(/\s+/g, '_');
                  return (
                    <div
                      key={arg.id}
                      className={`p-3 rounded-2xl border text-slate-900 space-y-2 shadow-2xs ${
                        isPro
                          ? 'bg-emerald-50/80 border-emerald-200'
                          : 'bg-rose-50/80 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                            {arg.author_name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {arg.author_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              @{handle}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUpvote(arg.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            isUpvoted
                              ? isPro
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                              : isPro
                              ? 'bg-white text-emerald-800 border border-emerald-200'
                              : 'bg-white text-rose-800 border border-rose-200'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{arg.upvotes}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {isHindi && arg.content_hi ? arg.content_hi : arg.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 3. Bottom Input Dock with AI Refiner & Voice Dictation */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3 z-10 shadow-lg space-y-2">
          {speechError && (
            <div className="text-[11px] text-rose-600 font-medium px-1">
              {speechError}
            </div>
          )}

          {/* Listening Feedback Indicator Banner */}
          {isListening && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span className="font-bold">
                  {isHindi ? 'सुन रहे हैं... (रोकने के लिए दोबारा टैप करें)' : 'Listening... Tap mic again to stop'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-xs bg-rose-600 text-white px-2.5 py-0.5 rounded-md font-bold hover:bg-rose-700 transition-colors"
              >
                {isHindi ? 'रोकें' : 'Stop'}
              </button>
            </div>
          )}

          <form onSubmit={handleAddArgument} className="space-y-2">
            {/* Top Toolbar: Pro/Con Stance Pills + Refine with AI Button */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewStance('pro')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all pointer-events-auto ${
                    newStance === 'pro'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {t.argueInFavor}
                </button>
                <button
                  type="button"
                  onClick={() => setNewStance('con')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all pointer-events-auto ${
                    newStance === 'con'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {t.argueAgainst}
                </button>
              </div>

              {/* Requirement 5: "Refine with AI / AI से सुधारें" Button */}
              <button
                type="button"
                onClick={handleRefineWithAi}
                disabled={isRefining || !argumentContent.trim()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-800 hover:from-purple-100 hover:to-indigo-100 disabled:opacity-40 transition-all shadow-2xs"
                title="Polish draft with AI"
              >
                <Sparkles className={`w-3 h-3 text-purple-600 ${isRefining ? 'animate-spin' : ''}`} />
                <span>{isRefining ? t.aiRefining : t.refineWithAi}</span>
              </button>
            </div>

            {/* Input Row with Dictation Mic & Post Button */}
            <div className="flex items-center gap-2 relative z-20">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={
                    newStance === 'pro'
                      ? t.arguePlaceholderPro
                      : t.arguePlaceholderCon
                  }
                  value={argumentContent}
                  onChange={(e) => setArgumentContent(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />

                {/* Requirement 6: Voice Dictation Microphone inside Input */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2 top-2 p-1 rounded-lg transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white pulse-listening shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isListening ? t.micStop : t.micSpeakNow}
                >
                  <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !argumentContent.trim()}
                className={`relative z-20 pointer-events-auto px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 text-white disabled:opacity-40 active:scale-95 ${
                  newStance === 'pro'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                <span>{isSubmitting ? t.posting : t.postArgument}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
