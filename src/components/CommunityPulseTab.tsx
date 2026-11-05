'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Topic } from '@/lib/types';
import {
  Scale,
  Award,
  Sparkles,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { TOPIC_NAMES } from '@/lib/translations';

export const CommunityPulseTab: React.FC = () => {
  const { posts, argumentsList, openDebateDrawerById, language } = useApp();
  const isHindi = language === 'hi';

  // Compute total votes and interactions
  const totalVotesCast = posts.reduce((acc, p) => acc + (p.agree_votes || 0) + (p.disagree_votes || 0), 0);
  const totalArguments = argumentsList.length;

  // Filter posts that have received at least 1 vote for consensus & polarization analysis
  const votedPostsAnalysis = posts
    .map((p) => {
      const agree = p.agree_votes || 0;
      const disagree = p.disagree_votes || 0;
      const total = agree + disagree;
      if (total === 0) return null;

      const agreeRatio = agree / total;
      // 1.0 = exact 50/50 split, 0.0 = completely one-sided (100/0)
      const polarizationScore = 1 - Math.abs(agreeRatio - 0.5) * 2;
      // 0.5 to 1.0 (how dominant the majority side is)
      const consensusScore = Math.max(agreeRatio, 1 - agreeRatio);
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
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Top Polarized Debates: Highest polarization score (closest to 50/50)
  // Must have at least 1 vote, sorted by polarization score descending
  const polarizedDebates = [...votedPostsAnalysis]
    .sort((a, b) => b.polarizationScore - a.polarizationScore)
    .slice(0, 3);

  const polarizedIds = new Set(polarizedDebates.map((d) => d.post.id));

  // Highest Consensus Topics: Policies where majority agrees or disagrees strongly (> 65%)
  // Deduplicate: avoid posts already listed under polarized debates
  const highestConsensusDebates = [...votedPostsAnalysis]
    .filter((d) => !polarizedIds.has(d.post.id))
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
    Economy: { bar: 'bg-support', text: 'text-support-strong', bg: 'bg-support-soft' },
    Education: { bar: 'bg-accent', text: 'text-accent', bg: 'bg-accent-soft' },
    'Civic Life': { bar: 'bg-oppose', text: 'text-oppose-strong', bg: 'bg-oppose-soft' },
    Technology: { bar: 'bg-neutral', text: 'text-ink', bg: 'bg-paper' },
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Overview Stat Strip - Single inline row */}
      <div className="flex items-center justify-around p-3 bg-surface border border-rule rounded-xl text-center">
        <div>
          <p className="text-lg font-bold text-ink leading-tight">{posts.length}</p>
          <span className="text-[11px] text-ink-muted">
            {isHindi ? 'विमर्श' : 'Debates'}
          </span>
        </div>

        <div className="h-8 w-px bg-rule" />

        <div>
          <p className="text-lg font-bold text-ink leading-tight">{totalVotesCast.toLocaleString()}</p>
          <span className="text-[11px] text-ink-muted">
            {isHindi ? 'कुल मत' : 'Votes cast'}
          </span>
        </div>

        <div className="h-8 w-px bg-rule" />

        <div>
          <p className="text-lg font-bold text-ink leading-tight">{totalArguments}</p>
          <span className="text-[11px] text-ink-muted">
            {isHindi ? 'तर्क' : 'Arguments'}
          </span>
        </div>
      </div>

      {/* SECTION 1: TOP POLARIZED DEBATES */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-accent" />
            <span>{isHindi ? 'सर्वाधिक विभाजित बहसें' : 'Top polarized debates'}</span>
          </h3>
          <span className="text-[11px] font-medium text-ink-muted bg-paper px-2 py-0.5 rounded-md border border-rule">
            {isHindi ? 'समान विभाजन' : 'Even split'}
          </span>
        </div>
        <p className="text-[11px] text-ink-muted leading-normal">
          {isHindi
            ? 'विवादित नीतियां जहां नागरिक दोनों पक्षों में बराबरी से बंटे हुए हैं।'
            : 'Issues where citizens are closely divided between support and opposition.'}
        </p>

        <div className="space-y-2">
          {polarizedDebates.length === 0 ? (
            <div className="p-4 text-center bg-surface rounded-xl border border-rule text-xs text-ink-muted">
              {isHindi ? 'अभी तक कोई मतदान रिकॉर्ड नहीं हुआ है।' : 'No voting activity recorded yet.'}
            </div>
          ) : (
            polarizedDebates.map(({ post, agreePercent, disagreePercent, total }) => (
              <div
                key={post.id}
                onClick={() => openDebateDrawerById(post.id)}
                className="p-3.5 rounded-xl bg-surface border border-rule hover:border-accent transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-paper text-ink border border-rule">
                    {(TOPIC_NAMES as Record<string, { en: string; hi: string }>)[post.topic]?.[language] || post.topic} &bull; {post.region}
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    {total} {isHindi ? 'मत' : 'votes'}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-ink leading-snug font-serif">
                  {post.title}
                </h4>

                {/* Stance Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-support-strong">
                      {isHindi ? 'समर्थन' : 'Support'} {agreePercent}%
                    </span>
                    <span className="text-oppose-strong">
                      {isHindi ? 'विरोध' : 'Oppose'} {disagreePercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-paper rounded-full overflow-hidden flex">
                    <div style={{ width: `${agreePercent}%` }} className="h-full bg-support" />
                    <div style={{ width: `${disagreePercent}%` }} className="h-full bg-oppose" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-accent font-medium">
                  <span>{isHindi ? 'बहस देखें' : 'View discussion'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: HIGHEST CONSENSUS TOPICS */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-support-strong" />
            <span>{isHindi ? 'सर्वोच्च सहमति वाले विषय' : 'Highest consensus topics'}</span>
          </h3>
          <span className="text-[11px] font-medium text-support-strong bg-support-soft px-2 py-0.5 rounded-md border border-rule">
            &gt;65% {isHindi ? 'सहमति' : 'Consensus'}
          </span>
        </div>
        <p className="text-[11px] text-ink-muted leading-normal">
          {isHindi
            ? 'प्रस्ताव जहां नागरिकों का भारी बहुमत साझा सहमति प्रदर्शित करता है।'
            : 'Propositions where an overwhelming majority of citizens share a collective stance.'}
        </p>

        <div className="space-y-2">
          {highestConsensusDebates.length === 0 ? (
            <div className="p-4 text-center bg-surface rounded-xl border border-rule text-xs text-ink-muted">
              {isHindi ? 'अभी तक कोई सहमति रुझान उपलब्ध नहीं है।' : 'No consensus trends recorded yet.'}
            </div>
          ) : (
            highestConsensusDebates.map(({ post, agreePercent, disagreePercent, total }) => {
              const isMajorityAgree = agreePercent >= 50;
              const consensusRate = isMajorityAgree ? agreePercent : disagreePercent;
              const stanceLabel = isMajorityAgree
                ? (isHindi ? 'समर्थन' : 'Support')
                : (isHindi ? 'विरोध' : 'Oppose');

              return (
                <div
                  key={post.id}
                  onClick={() => openDebateDrawerById(post.id)}
                  className="p-3.5 rounded-xl bg-surface border border-rule hover:border-accent transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-support-soft text-support-strong border border-rule">
                      {consensusRate}% {stanceLabel}
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      {post.region} &bull; {total} {isHindi ? 'मत' : 'votes'}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-ink leading-snug font-serif">
                    {post.title}
                  </h4>

                  <div className="h-2 w-full bg-paper rounded-full overflow-hidden flex">
                    <div style={{ width: `${agreePercent}%` }} className="h-full bg-support" />
                    <div style={{ width: `${disagreePercent}%` }} className="h-full bg-oppose" />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-accent font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent" />
                      {isHindi ? 'तर्क देखें' : 'View arguments'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 3: TOPIC ACTIVITY BREAKDOWN */}
      <div className="p-4 rounded-xl bg-surface border border-rule space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-accent" />
            <span>{isHindi ? 'विषयवार सक्रियता' : 'Topic activity breakdown'}</span>
          </h3>
          <span className="text-[11px] text-ink-muted">{isHindi ? 'वितरण' : 'Distribution'}</span>
        </div>

        {/* Visual Stacked Bar */}
        <div className="h-2.5 w-full bg-paper rounded-full overflow-hidden flex">
          {categoriesList.map((cat) => {
            const count = topicCounts[cat] || 0;
            const pct = Math.round((count / totalCategorized) * 100);
            return (
              <div
                key={cat}
                style={{ width: `${pct}%` }}
                className={`h-full ${topicColors[cat]?.bar || 'bg-neutral'}`}
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
              bar: 'bg-neutral',
              text: 'text-ink',
              bg: 'bg-paper',
            };
            const catLabel = TOPIC_NAMES[cat]?.[language] || cat;

            return (
              <div
                key={cat}
                className={`p-2.5 rounded-lg border border-rule ${style.bg} flex items-center justify-between`}
              >
                <div>
                  <span className={`text-[11px] font-medium ${style.text} block`}>{catLabel}</span>
                  <span className="text-[10px] text-ink-muted">{count} {isHindi ? 'बहसें' : 'debates'}</span>
                </div>
                <span className="text-xs font-semibold text-ink">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
