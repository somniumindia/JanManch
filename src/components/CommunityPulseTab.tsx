'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AgoraPost, Topic } from '@/lib/types';
import {
  TrendingUp,
  Scale,
  Award,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Flame,
  PieChart,
  BarChart3,
  Layers,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { TOPIC_NAMES } from '@/lib/translations';

export const CommunityPulseTab: React.FC = () => {
  const { posts, argumentsList, openDebateDrawerById, language } = useApp();
  const isHindi = language === 'hi';

  // Compute total votes and interactions
  const totalVotesCast = posts.reduce((acc, p) => acc + p.agree_votes + p.disagree_votes, 0);
  const totalArguments = argumentsList.length;

  // Consensus Analysis
  const consensusAnalysis = posts.map((p) => {
    const total = p.agree_votes + p.disagree_votes;
    const agreeRatio = total > 0 ? p.agree_votes / total : 0.5;
    const polarizationScore = 1 - Math.abs(agreeRatio - 0.5) * 2; // 1.0 = exact 50/50, 0 = 100/0
    const consensusScore = Math.max(agreeRatio, 1 - agreeRatio); // 0.5 to 1.0
    const agreePercent = Math.round(agreeRatio * 100);
    const disagreePercent = 100 - agreePercent;

    return {
      post: p,
      total,
      agreePercent,
      disagreePercent,
      polarizationScore,
      consensusScore,
    };
  });

  // Top Polarized Debates: Highest polarization score (closest to 50/50)
  const polarizedDebates = [...consensusAnalysis]
    .sort((a, b) => b.polarizationScore - a.polarizationScore)
    .slice(0, 3);

  // Highest Consensus Topics: Policies where highest consensus score (>75-80%)
  const highestConsensusDebates = [...consensusAnalysis]
    .sort((a, b) => b.consensusScore - a.consensusScore)
    .slice(0, 3);

  // Topic Activity Breakdown
  const categoriesList: Topic[] = ['Economy', 'Education', 'Civic Life', 'Technology'];
  const topicCounts: Record<string, number> = {
    Economy: 0,
    Education: 0,
    'Civic Life': 0,
    Technology: 0,
  };

  posts.forEach((p) => {
    if (topicCounts[p.topic] !== undefined) {
      topicCounts[p.topic] += 1;
    } else {
      topicCounts['Civic Life'] += 1;
    }
  });

  const totalCategorized = posts.length || 1;

  const topicColors: Record<string, { bar: string; text: string; bg: string }> = {
    Economy: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    Education: { bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
    'Civic Life': { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    Technology: { bar: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isHindi ? 'विमर्श मुद्दे' : 'Deliberations'}
          </span>
          <p className="text-base font-extrabold text-slate-900">{posts.length}</p>
          <span className="text-[9.5px] text-blue-600 font-semibold">
            {isHindi ? 'सक्रिय जनमत' : 'Active Referendums'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isHindi ? 'कुल नागरिक मत' : 'Votes Cast'}
          </span>
          <p className="text-base font-extrabold text-slate-900">{totalVotesCast.toLocaleString()}</p>
          <span className="text-[9.5px] text-emerald-600 font-semibold">
            {isHindi ? 'प्रमाणित नागरिक' : 'Verified Voices'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isHindi ? 'नागरिक तर्क' : 'Arguments'}
          </span>
          <p className="text-base font-extrabold text-slate-900">{totalArguments}</p>
          <span className="text-[9.5px] text-indigo-600 font-semibold">
            {isHindi ? 'पक्ष व विपक्ष बिंदु' : 'Pro & Con Points'}
          </span>
        </div>
      </div>

      {/* SECTION 1: TOP POLARIZED DEBATES */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>{isHindi ? 'सर्वाधिक विभाजित बहसें' : 'Top Polarized Debates'}</span>
          </h3>
          <span className="text-[10.5px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
            50-50 Split
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          {isHindi
            ? 'विवादित नीतियां जहां नागरिक दोनों पक्षों में बराबरी से बंटे हुए हैं।'
            : 'Contested issues where citizens are intensely divided across opposing stances.'}
        </p>

        <div className="space-y-2.5">
          {polarizedDebates.map(({ post, agreePercent, disagreePercent, total }) => (
            <div
              key={post.id}
              onClick={() => openDebateDrawerById(post.id)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                  {(TOPIC_NAMES as Record<string, { en: string; hi: string }>)[post.topic]?.[language] || post.topic} &bull; {post.region}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {total} {isHindi ? 'मत' : 'votes'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                {post.title}
              </h4>

              {/* Progress Split */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {isHindi ? 'सहमत' : 'Agree'} {agreePercent}%
                  </span>
                  <span className="text-rose-700 flex items-center gap-1">
                    {isHindi ? 'असहमत' : 'Disagree'} {disagreePercent}% <ThumbsDown className="w-3 h-3" />
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${agreePercent}%` }} className="h-full bg-emerald-500" />
                  <div style={{ width: `${disagreePercent}%` }} className="h-full bg-rose-400" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-purple-700 font-bold">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {isHindi ? 'बहस कक्ष में जाएं' : 'Join Deliberation Floor'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: HIGHEST CONSENSUS TOPICS */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{isHindi ? 'सर्वोच्च आम सहमति वाले विषय' : 'Highest Consensus Topics'}</span>
          </h3>
          <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            &gt;75% {isHindi ? 'सहमति' : 'Agreement'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          {isHindi
            ? 'प्रस्ताव जहां नागरिकों का भारी बहुमत साझा सहमति और एकता प्रदर्शित करता है।'
            : 'Propositions where an overwhelming majority of citizens share collective unity.'}
        </p>

        <div className="space-y-2.5">
          {highestConsensusDebates.map(({ post, agreePercent, disagreePercent, total }) => {
            const isMajorityAgree = agreePercent >= 50;
            const consensusRate = isMajorityAgree ? agreePercent : disagreePercent;
            const stanceLabel = isMajorityAgree ? (isHindi ? 'पक्ष में' : 'In Favor') : (isHindi ? 'विरोध में' : 'Opposed');

            return (
              <div
                key={post.id}
                onClick={() => openDebateDrawerById(post.id)}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    {consensusRate}% {stanceLabel}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {post.region}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {post.title}
                </h4>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${agreePercent}%` }} className="h-full bg-emerald-500" />
                  <div style={{ width: `${disagreePercent}%` }} className="h-full bg-rose-400" />
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> {isHindi ? 'सहमति तर्क देखें' : 'View Consensus Arguments'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: TOPIC ACTIVITY BREAKDOWN */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>{isHindi ? 'विषयवार सक्रियता विवरण' : 'Topic Activity Breakdown'}</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">{isHindi ? 'नीतिगत वितरण' : 'Policy Distribution'}</span>
        </div>

        {/* Visual Stacked Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {categoriesList.map((cat) => {
            const count = topicCounts[cat] || 0;
            const pct = Math.round((count / totalCategorized) * 100);
            return (
              <div
                key={cat}
                style={{ width: `${pct}%` }}
                className={`h-full ${topicColors[cat]?.bar || 'bg-slate-400'}`}
                title={`${cat}: ${count} (${pct}%)`}
              />
            );
          })}
        </div>

        {/* Individual Category Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {categoriesList.map((cat) => {
            const count = topicCounts[cat] || 0;
            const pct = Math.round((count / totalCategorized) * 100);
            const style = topicColors[cat] || {
              bar: 'bg-slate-400',
              text: 'text-slate-700',
              bg: 'bg-slate-50',
            };
            const catLabel = TOPIC_NAMES[cat]?.[language] || cat;

            return (
              <div
                key={cat}
                className={`p-2.5 rounded-xl border border-slate-100 ${style.bg} flex items-center justify-between`}
              >
                <div>
                  <span className={`text-[11px] font-bold ${style.text} block`}>{catLabel}</span>
                  <span className="text-[10px] text-slate-500">{count} {isHindi ? 'मुद्दे' : 'Debates'}</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
