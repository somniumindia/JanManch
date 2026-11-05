'use client';

import React, { useState, useRef } from 'react';
import { AgoraPost, AgoraArgument, ArgumentStance, SurveyVotes } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
  MapPin,
  Users,
  Mic,
  Bot,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
} from 'lucide-react';
import { DICTIONARY, TOPIC_NAMES } from '@/lib/translations';
import { useSpeechDictation } from '@/lib/speech';
import { SPECTRUM_LEVELS } from '@/constants/regions';

interface DeliberationFloorDrawerProps {
  post: AgoraPost;
  onClose: () => void;
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

export const DeliberationFloorDrawer: React.FC<DeliberationFloorDrawerProps> = ({
  post,
  onClose,
}) => {
  const {
    argumentsList,
    addArgument,
    upvoteArgument,
    castPropositionVote,
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

  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBullets, setAiBullets] = useState<string[] | null>(null);

  const argumentInputRef = useRef<HTMLInputElement>(null);

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
    toggleListening,
    stopListening,
    error: speechError,
  } = useSpeechDictation({
    lang: isHindi ? 'hi-IN' : 'en-IN',
    onTranscript: (text) => {
      setArgumentContent((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  const handleToggleAiSummary = async () => {
    if (isAiSummaryOpen) {
      setIsAiSummaryOpen(false);
      return;
    }
    setIsAiSummaryOpen(true);
    if (aiBullets && aiBullets.length > 0) return;

    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summarize',
          title: post.title,
          description: post.description,
          argumentsList: postArguments.map((a) => ({
            author_name: a.author_name,
            stance: a.stance,
            content: a.content,
          })),
          language,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bullets)) {
        setAiBullets(data.bullets);
      } else {
        throw new Error('Failed');
      }
    } catch {
      showToast(isHindi ? 'AI सारांश प्राप्त नहीं हो सका' : 'Could not generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  const focusComposer = (stance?: ArgumentStance, prefix?: string) => {
    if (stance) setNewStance(stance);
    if (prefix) {
      setArgumentContent((prev) => (prev ? `${prev} ${prefix} ` : `${prefix} `));
    }
    setTimeout(() => {
      argumentInputRef.current?.focus();
    }, 50);
  };

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

  const renderArgumentCard = (arg: AgoraArgument) => {
    const isPro = arg.stance === 'pro';
    const isUpvoted = upvotedArgs.includes(arg.id);
    const handle = arg.author_username || arg.author_name.toLowerCase().replace(/\s+/g, '_');

    return (
      <div
        key={arg.id}
        className={`p-3 rounded-xl bg-surface border border-rule border-l-4 ${
          isPro ? 'border-l-support' : 'border-l-oppose'
        } space-y-2 transition-all`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                isPro ? 'bg-support-soft text-support' : 'bg-oppose-soft text-oppose'
              }`}
            >
              {arg.author_name.charAt(0)}
            </div>
            <div className="min-w-0 truncate">
              <span className="font-semibold text-xs text-ink block truncate">
                {arg.author_name}
              </span>
              <span className="text-[11px] text-ink-muted block truncate">
                @{handle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                isPro ? 'bg-support-soft text-support' : 'bg-oppose-soft text-oppose'
              }`}
            >
              {isPro ? (isHindi ? 'पक्ष' : 'For') : (isHindi ? 'विपक्ष' : 'Against')}
            </span>

            <button
              type="button"
              onClick={() => handleUpvote(arg.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 border ${
                isUpvoted
                  ? isPro
                    ? 'bg-support text-surface border-support font-bold'
                    : 'bg-oppose text-surface border-oppose font-bold'
                  : 'bg-surface text-ink-muted border-rule hover:bg-paper'
              }`}
              title="Upvote argument"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{arg.upvotes}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-ink leading-relaxed font-normal">
          {isHindi && arg.content_hi ? arg.content_hi : arg.content}
        </p>

        {/* Respond Action */}
        <div className="flex items-center justify-end pt-1 border-t border-rule/60">
          <button
            type="button"
            onClick={() => focusComposer(isPro ? 'con' : 'pro', `@${handle}`)}
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 py-1 px-1.5 focus-visible:outline-accent"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>{isHindi ? 'उत्तर दें' : 'Respond'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-ink/60 backdrop-blur-sm pointer-events-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] h-[90vh] flex flex-col bg-surface rounded-t-2xl border-t border-rule overflow-hidden pointer-events-auto relative w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-rule rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Toast inside Drawer */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-xl bg-ink text-surface text-xs font-semibold shadow-lg animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* 1. Sticky Header */}
        <div className="flex-shrink-0 border-b border-rule p-4 bg-surface space-y-2.5 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 pr-2 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-accent-soft text-accent border border-accent/20">
                  {(TOPIC_NAMES as Record<string, { en: string; hi: string }>)[post.topic]?.[language] || post.topic}
                </span>
                <span className="text-[11px] font-medium text-ink-muted bg-paper px-2 py-0.5 rounded-lg border border-rule flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-accent" />
                  <span>
                    {post.constituency && post.constituency !== 'All Constituencies'
                      ? `${post.constituency}, ${post.region}`
                      : post.region}
                  </span>
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-lg font-semibold text-ink line-clamp-2 leading-snug">
                {isHindi && post.title_hi ? post.title_hi : post.title}
              </h2>
              {/* N citizens participated */}
              <div className="flex items-center gap-1.5 text-xs text-ink-muted pt-0.5">
                <Users className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                <span>
                  {post.voting_mode === 'verdict'
                    ? (post.agree_votes || 0) + (post.disagree_votes || 0)
                    : stats.total}{' '}
                  {isHindi ? 'नागरिकों ने भाग लिया' : 'citizens participated'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-paper hover:bg-rule text-ink-muted hover:text-ink transition-colors shrink-0"
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
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-paper text-ink text-[11px] font-medium border border-rule hover:bg-surface transition-colors"
                >
                  <FileText className="w-3 h-3 text-accent" />
                  <span className="truncate max-w-[130px]">{t.evidenceAttached}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-ink-muted" />
                </a>
              )}
              {post.source_url && (
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-accent-soft text-accent text-[11px] font-medium border border-accent/20 hover:bg-accent/15 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-accent" />
                  <span className="truncate max-w-[130px]">{t.newsArticle}</span>
                </a>
              )}
            </div>
          )}

          {/* AI Copilot Summary in Detail Sheet */}
          <div className="pt-0.5">
            <button
              onClick={handleToggleAiSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold bg-accent-soft hover:bg-accent/15 border border-accent/20 text-accent transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-accent" />
              <span>{isAiSummaryOpen ? (isHindi ? 'सारांश छिपाएं' : 'Hide summary') : (isHindi ? 'AI सारांश' : 'AI summary')}</span>
              {aiLoading ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin text-accent" />
              ) : isAiSummaryOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-accent" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-accent" />
              )}
            </button>

            {isAiSummaryOpen && (
              <div className="mt-2 p-3 rounded-xl bg-surface border border-rule space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-accent flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>{isHindi ? 'AI सारांश' : 'AI summary'}</span>
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-paper text-ink-muted border border-rule">
                    Gemini
                  </span>
                </div>

                {aiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-ink-muted py-2">
                    <Sparkles className="w-4 h-4 animate-spin text-accent" />
                    <span>{isHindi ? 'AI सारांश तैयार किया जा रहा है...' : 'Generating AI summary...'}</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-ink leading-relaxed">
                    {aiBullets?.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <p className="flex-1">{b}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stance Bar & Voting in Detail Sheet */}
          {post.voting_mode === 'verdict' ? (
            (() => {
              const total = (post.agree_votes || 0) + (post.disagree_votes || 0);
              const hasVotes = total > 0;
              const supportPct = hasVotes ? Math.round(((post.agree_votes || 0) / total) * 100) : 0;
              const opposePct = hasVotes ? 100 - supportPct : 0;

              return (
                <div className="space-y-2 pt-1">
                  {!hasVotes ? (
                    <div className="w-full h-3 rounded-full bg-rule/70 overflow-hidden flex items-center justify-center px-3">
                      <span className="text-[10px] font-medium text-ink-muted select-none">
                        {isHindi ? 'अभी कोई मत नहीं। पहले बनें।' : 'No votes yet. Be the first.'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
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
                      <div className="h-3 w-full bg-rule/40 rounded-full overflow-hidden flex">
                        <div style={{ width: `${supportPct}%` }} className="h-full bg-support transition-all duration-300" />
                        <div style={{ width: `${opposePct}%` }} className="h-full bg-oppose transition-all duration-300" />
                      </div>
                    </div>
                  )}

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
                </div>
              );
            })()
          ) : (
            (() => {
              const supportPct = stats.pct.strongly_agree + stats.pct.agree;
              const opposePct = stats.pct.disagree + stats.pct.strongly_disagree;

              return (
                <div className="space-y-2 pt-1">
                  {!stats.hasVotes ? (
                    <div className="w-full h-3 rounded-full bg-rule/70 overflow-hidden flex items-center justify-center px-3">
                      <span className="text-[10px] font-medium text-ink-muted select-none">
                        {isHindi ? 'अभी कोई मत नहीं। पहले बनें।' : 'No votes yet. Be the first.'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
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
                      <div className="h-3 w-full bg-rule/40 rounded-full overflow-hidden flex">
                        <div style={{ width: `${stats.pct.strongly_agree}%` }} className="h-full bg-support-strong transition-all duration-300" />
                        <div style={{ width: `${stats.pct.agree}%` }} className="h-full bg-support transition-all duration-300" />
                        <div style={{ width: `${stats.pct.neutral}%` }} className="h-full bg-neutral transition-all duration-300" />
                        <div style={{ width: `${stats.pct.disagree}%` }} className="h-full bg-oppose transition-all duration-300" />
                        <div style={{ width: `${stats.pct.strongly_disagree}%` }} className="h-full bg-oppose-strong transition-all duration-300" />
                      </div>
                    </div>
                  )}

                  {/* Five Percentage Boxes */}
                  {stats.hasVotes && (
                    <div className="grid grid-cols-5 gap-1 pt-1 text-center">
                      {SPECTRUM_LEVELS.map((level) => (
                        <div key={level.key} className="p-1.5 rounded-lg bg-surface border border-rule flex flex-col items-center">
                          <span className="text-[9px] text-ink-muted truncate w-full">
                            {isHindi ? level.labelHi : level.labelEn}
                          </span>
                          <span className="text-xs font-bold text-ink mt-0.5">
                            {stats.pct[level.key]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5 Compact Touch-Friendly Option Pills inside Drawer */}
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
                </div>
              );
            })()
          )}

          {/* View Filter Toggle Tabs: All / For / Against */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 p-1 bg-paper border border-rule rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewFilter === 'all'
                    ? 'bg-accent text-surface font-semibold'
                    : 'text-ink-muted hover:text-ink font-medium'
                }`}
              >
                {isHindi ? 'सभी' : 'All'} ({postArguments.length})
              </button>
              <button
                type="button"
                onClick={() => setViewFilter('pro')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewFilter === 'pro'
                    ? 'bg-support text-surface font-semibold'
                    : 'text-ink-muted hover:text-ink font-medium'
                }`}
              >
                {isHindi ? 'समर्थन' : 'Support'} ({proArgs.length})
              </button>
              <button
                type="button"
                onClick={() => setViewFilter('con')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewFilter === 'con'
                    ? 'bg-oppose text-surface font-semibold'
                    : 'text-ink-muted hover:text-ink font-medium'
                }`}
              >
                {isHindi ? 'विरोध' : 'Oppose'} ({conArgs.length})
              </button>
            </div>

            <span className="text-[11px] text-ink-muted font-medium">
              +20 {isHindi ? 'कर्मा' : 'karma'}
            </span>
          </div>
        </div>

        {/* 2. Scrollable Arguments List Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 min-h-0 bg-paper">
          {viewFilter === 'all' ? (
            postArguments.length === 0 ? (
              /* Empty state invitation */
              <div className="py-8 px-4 text-center space-y-3 bg-surface rounded-xl border border-dashed border-rule">
                <p className="font-serif text-base font-semibold text-ink">
                  {isHindi
                    ? 'पहले बनें: इस पर सबसे मजबूत पक्ष या विपक्ष क्या है?'
                    : "Be first: what's the strongest case for or against?"}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => focusComposer('pro')}
                    className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-support text-surface hover:opacity-90 active:scale-95 transition-all focus-visible:outline-accent"
                  >
                    {isHindi ? 'पक्ष में तर्क दें' : 'Make case for'}
                  </button>
                  <button
                    type="button"
                    onClick={() => focusComposer('con')}
                    className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-oppose text-surface hover:opacity-90 active:scale-95 transition-all focus-visible:outline-accent"
                  >
                    {isHindi ? 'विरोध में तर्क दें' : 'Make case against'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: Single vertical list (< 768px) */}
                <div className="md:hidden space-y-2.5">
                  {postArguments.map((arg) => renderArgumentCard(arg))}
                </div>

                {/* Desktop: Two columns side-by-side (>= 768px) */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-3 items-start">
                  {/* Left Column: For */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-rule">
                      <span className="text-xs font-semibold text-support flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-support" />
                        <span>{isHindi ? 'समर्थन' : 'Support'} ({proArgs.length})</span>
                      </span>
                    </div>
                    {proArgs.length === 0 ? (
                      <div className="p-4 rounded-xl bg-surface border border-dashed border-rule text-center space-y-2">
                        <p className="text-xs text-ink-muted">
                          {isHindi ? 'पहला विचार रखें: समर्थन में सबसे ठोस तर्क क्या है?' : "Be first: what's the strongest case in support?"}
                        </p>
                        <button
                          type="button"
                          onClick={() => focusComposer('pro')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-support text-surface hover:opacity-90 transition-all focus-visible:outline-accent"
                        >
                          {isHindi ? 'समर्थन में तर्क दें' : 'Make case in support'}
                        </button>
                      </div>
                    ) : (
                      proArgs.map((arg) => renderArgumentCard(arg))
                    )}
                  </div>

                  {/* Right Column: Oppose */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-rule">
                      <span className="text-xs font-semibold text-oppose flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-oppose" />
                        <span>{isHindi ? 'विरोध' : 'Oppose'} ({conArgs.length})</span>
                      </span>
                    </div>
                    {conArgs.length === 0 ? (
                      <div className="p-4 rounded-xl bg-surface border border-dashed border-rule text-center space-y-2">
                        <p className="text-xs text-ink-muted">
                          {isHindi ? 'पहला विचार रखें: विरोध में सबसे ठोस तर्क क्या है?' : "Be first: what's the strongest case in opposition?"}
                        </p>
                        <button
                          type="button"
                          onClick={() => focusComposer('con')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-oppose text-surface hover:opacity-90 transition-all focus-visible:outline-accent"
                        >
                          {isHindi ? 'विरोध में तर्क दें' : 'Make case in opposition'}
                        </button>
                      </div>
                    ) : (
                      conArgs.map((arg) => renderArgumentCard(arg))
                    )}
                  </div>
                </div>
              </>
            )
          ) : viewFilter === 'pro' ? (
            proArgs.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-3 bg-surface rounded-xl border border-dashed border-rule">
                <p className="font-serif text-base font-semibold text-ink">
                  {isHindi ? 'पहला विचार रखें: समर्थन में सबसे ठोस तर्क क्या है?' : "Be first: what's the strongest case in support?"}
                </p>
                <button
                  type="button"
                  onClick={() => focusComposer('pro')}
                  className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-support text-surface hover:opacity-90 transition-all focus-visible:outline-accent"
                >
                  {isHindi ? 'समर्थन में तर्क दें' : 'Make case in support'}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {proArgs.map((arg) => renderArgumentCard(arg))}
              </div>
            )
          ) : (
            conArgs.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-3 bg-surface rounded-xl border border-dashed border-rule">
                <p className="font-serif text-base font-semibold text-ink">
                  {isHindi ? 'पहला विचार रखें: विरोध में सबसे ठोस तर्क क्या है?' : "Be first: what's the strongest case in opposition?"}
                </p>
                <button
                  type="button"
                  onClick={() => focusComposer('con')}
                  className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-oppose text-surface hover:opacity-90 transition-all focus-visible:outline-accent"
                >
                  {isHindi ? 'विरोध में तर्क दें' : 'Make case in opposition'}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {conArgs.map((arg) => renderArgumentCard(arg))}
              </div>
            )
          )}
        </div>

        {/* 3. Bottom Input Dock with AI Refiner & Voice Dictation */}
        <div className="flex-shrink-0 border-t border-rule bg-surface p-3 z-10 space-y-2">
          {speechError && (
            <div className="text-[11px] text-oppose-strong font-medium px-1">
              {speechError}
            </div>
          )}

          {/* Listening Feedback Indicator Banner */}
          {isListening && (
            <div className="p-2 rounded-xl bg-oppose-soft border border-oppose/30 flex items-center justify-between text-xs text-oppose-strong animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-oppose-strong animate-ping" />
                <span className="font-bold">
                  {isHindi ? 'सुन रहे हैं... (रोकने के लिए दोबारा टैप करें)' : 'Listening... Tap mic again to stop'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-xs bg-oppose-strong text-surface px-2.5 py-0.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                {isHindi ? 'रोकें' : 'Stop'}
              </button>
            </div>
          )}

          <form onSubmit={handleAddArgument} className="space-y-2">
            {/* Top Toolbar: Stance Toggle Pills + "Refine with AI" Button */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewStance('pro')}
                  className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all border ${
                    newStance === 'pro'
                      ? 'bg-support text-surface border-support font-bold'
                      : 'bg-surface text-ink-muted border-rule hover:bg-paper'
                  }`}
                >
                  {isHindi ? 'समर्थन' : 'Support'}
                </button>
                <button
                  type="button"
                  onClick={() => setNewStance('con')}
                  className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all border ${
                    newStance === 'con'
                      ? 'bg-oppose text-surface border-oppose font-bold'
                      : 'bg-surface text-ink-muted border-rule hover:bg-paper'
                  }`}
                >
                  {isHindi ? 'विरोध' : 'Oppose'}
                </button>
              </div>

              {/* Composer "Refine with AI": clearly visible when enabled, clearly disabled otherwise */}
              <button
                type="button"
                onClick={handleRefineWithAi}
                disabled={isRefining || !argumentContent.trim()}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs transition-all border ${
                  argumentContent.trim() && !isRefining
                    ? 'bg-accent-soft text-accent border-accent/30 hover:bg-accent/15 cursor-pointer font-semibold opacity-100'
                    : 'bg-paper text-ink-muted/50 border-rule cursor-not-allowed opacity-50 font-normal'
                }`}
                title={argumentContent.trim() ? "Polish draft with AI" : "Type a draft first to refine with AI"}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin text-accent' : argumentContent.trim() ? 'text-accent' : 'text-ink-muted/40'}`} />
                <span>{isRefining ? t.aiRefining : (isHindi ? 'AI से सुधारें' : 'Refine with AI')}</span>
              </button>
            </div>

            {/* Input Row with Dictation Mic & Post Button */}
            <div className="flex items-center gap-2 relative z-20">
              <div className="relative flex-1">
                <input
                  ref={argumentInputRef}
                  type="text"
                  placeholder={
                    newStance === 'pro'
                      ? (isHindi ? 'समर्थन में अपना तर्क लिखें...' : 'State your perspective in support...')
                      : (isHindi ? 'विरोध में अपना तर्क लिखें...' : 'State your perspective in opposition...')
                  }
                  value={argumentContent}
                  onChange={(e) => setArgumentContent(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 min-h-[44px] text-xs rounded-xl bg-surface border border-rule text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors font-normal"
                />

                {/* Voice Dictation Microphone inside Input */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                    isListening
                      ? 'bg-oppose-strong text-surface pulse-listening'
                      : 'text-ink-muted hover:text-ink hover:bg-paper'
                  }`}
                  title={isListening ? t.micStop : t.micSpeakNow}
                  aria-label="Voice input"
                >
                  <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !argumentContent.trim()}
                className="px-4 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 bg-accent text-surface disabled:opacity-40 hover:opacity-90 active:scale-95 focus-visible:outline-accent"
              >
                <span>{isSubmitting ? t.posting : (isHindi ? 'प्रस्तुत करें' : 'Post')}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
