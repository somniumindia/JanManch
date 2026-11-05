'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Region } from '@/lib/types';
import {
  ShieldCheck,
  MapPin,
  Edit3,
  LogOut,
  User,
  ArrowRight,
  ChevronRight,
  X,
  Check,
  Plus,
} from 'lucide-react';

import { ALL_STATES_AND_UTS } from '@/constants/regions';

export const CitizenProfileTab: React.FC = () => {
  const {
    user,
    posts,
    argumentsList,
    signOut,
    updateProfile,
    openAuthModal,
    openDebateDrawerById,
    setActiveTab,
    language,
  } = useApp();

  const isHindi = language === 'hi';

  const [activeSegment, setActiveSegment] = useState<'propositions' | 'arguments'>('propositions');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState<Region>('Delhi NCR');
  const [editBio, setEditBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // If user is a guest
  if (!user) {
    return (
      <div className="px-4 py-8 space-y-4">
        <div className="p-6 rounded-xl bg-surface border border-rule text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-semibold text-ink font-serif">
              {isHindi ? 'नागरिक मंच से जुड़ें' : 'Join JanManch'}
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed max-w-xs mx-auto">
              {isHindi
                ? 'नीतिगत बहस शुरू करने, प्रमाणित मत देने और अपनी नागरिक साख दर्ज करने के लिए प्रवेश करें।'
                : 'Sign in or create your citizen account to propose policies, cast verified votes, and build your civic score.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => openAuthModal(isHindi ? 'अपनी प्रोफ़ाइल देखने के लिए प्रवेश करें।' : 'Sign in to access your civic profile and record votes.')}
              className="w-full py-2.5 px-4 rounded-xl bg-accent text-surface font-semibold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>{isHindi ? 'प्रवेश करें / खाता बनाएं' : 'Sign in / Create account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legal & Platform Transparency */}
        <div className="p-3 rounded-xl bg-surface border border-rule">
          <Link
            href="/terms"
            className="w-full p-2 rounded-lg hover:bg-paper transition-colors flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📜</span>
              <div>
                <div className="text-xs font-semibold text-ink group-hover:text-accent transition-colors">
                  {isHindi ? 'सेवा की शर्तें एवं कानूनी अस्वीकरण' : 'Terms of service & legal disclaimer'}
                </div>
                <div className="text-[10px] text-ink-muted">
                  {isHindi ? 'स्वतंत्र नागरिक मंच एवं दिशानिर्देश' : 'Independent civic platform notice & guidelines'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // Filter posts and arguments created by this user
  const myPosts = posts.filter(
    (p) =>
      (p.author_id && p.author_id === user.id) ||
      (p.author_username && p.author_username === user.username) ||
      p.author_name === user.name
  );

  const myArguments = argumentsList.filter(
    (a) =>
      (a.author_id && a.author_id === user.id) ||
      (a.author_username && a.author_username === user.username) ||
      a.author_name === user.name
  );

  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditRegion(user.region);
    setEditBio(user.bio || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      name: editName.trim() || user.name,
      region: editRegion,
      bio: editBio.trim(),
    });
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Profile Card */}
      <div className="p-4 rounded-xl bg-surface border border-rule space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent text-surface flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-ink">{user.name}</h2>
                {user.isVerifiedVoter && (
                  <span title={isHindi ? 'प्रमाणित नागरिक' : 'Verified citizen'}>
                    <ShieldCheck className="w-4 h-4 text-support" />
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted">@{user.username}</p>
              <div className="flex items-center gap-1 text-[11px] text-accent font-medium">
                <MapPin className="w-3 h-3 text-accent" />
                <span>{user.region}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="p-2 rounded-xl bg-paper border border-rule hover:bg-rule/40 text-ink text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer min-h-[36px]"
          >
            <Edit3 className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-[11px]">{isHindi ? 'बदलें' : 'Edit'}</span>
          </button>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-rule font-normal">
            &ldquo;{user.bio}&rdquo;
          </p>
        )}
      </div>

      {/* Civic Karma Score Card - Light and quiet, no gradients */}
      <div className="p-4 rounded-xl bg-surface border border-rule space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-ink">
              {isHindi ? 'नागरिक कर्म स्कोर' : 'Civic karma score'}
            </h3>
            <span className="text-[10px] text-ink-muted">
              {isHindi ? 'मंच पर आपकी सहभागिता साख' : 'Deliberative standing'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold text-accent">{user.karmaScore}</span>
            <span className="text-[10px] text-ink-muted ml-1">pts</span>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-ink-muted leading-relaxed bg-paper p-2.5 rounded-lg border border-rule">
          {isHindi
            ? 'आपके तर्कों को समर्थन मिलने पर +5 अंक, मतदान करने पर +10 अंक, और रचनात्मक बहस शुरू करने पर +30 अंक अर्जित करें।'
            : 'Earn +5 karma when citizens upvote your arguments, +10 karma per vote cast, and +30 karma for initiating constructive debates.'}
        </p>

        {/* Participation Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-ink">
          <div className="p-2 rounded-lg bg-paper border border-rule text-center">
            <span className="text-ink font-semibold block text-sm">
              {Object.keys(user.votedDebates || {}).length}
            </span>
            <span className="text-[10px] text-ink-muted">
              {isHindi ? 'दिए गए मत' : 'Votes cast'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-paper border border-rule text-center">
            <span className="text-ink font-semibold block text-sm">
              {(user.upvotedArgumentIds || []).length}
            </span>
            <span className="text-[10px] text-ink-muted">
              {isHindi ? 'समर्थित तर्क' : 'Arguments backed'}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Tabs: My Debates vs My Arguments */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 p-1 bg-paper rounded-xl text-xs font-medium border border-rule">
          <button
            onClick={() => setActiveSegment('propositions')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeSegment === 'propositions'
                ? 'bg-surface text-ink font-semibold border border-rule'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {isHindi ? 'मेरी बहसें' : 'My debates'} ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveSegment('arguments')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeSegment === 'arguments'
                ? 'bg-surface text-ink font-semibold border border-rule'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {isHindi ? 'मेरे तर्क' : 'My arguments'} ({myArguments.length})
          </button>
        </div>

        {/* Segment Content */}
        {activeSegment === 'propositions' ? (
          <div className="space-y-2">
            {myPosts.length === 0 ? (
              <div className="p-6 text-center bg-surface rounded-xl border border-rule space-y-3">
                <p className="text-xs font-medium text-ink">
                  {isHindi ? 'आपने अभी तक कोई बहस शुरू नहीं की है' : 'No debates authored yet'}
                </p>
                <p className="text-[11px] text-ink-muted">
                  {isHindi
                    ? 'नीतिगत मुद्दे पर अपनी पहली लोक चर्चा शुरू करें।'
                    : 'Start your first public policy debate on an issue that matters to you.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-surface text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'अपनी पहली बहस शुरू करें' : 'Start your first debate'}</span>
                </button>
              </div>
            ) : (
              myPosts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openDebateDrawerById(p.id)}
                  className="p-3.5 rounded-xl bg-surface border border-rule hover:border-accent transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-paper text-ink border border-rule">
                      {p.topic} &bull; {p.region}
                    </span>
                    <span className="text-[10px] text-ink-muted font-normal">
                      {(p.agree_votes || 0) + (p.disagree_votes || 0)} {isHindi ? 'मत' : 'votes'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-ink group-hover:text-accent transition-colors leading-snug font-serif">
                    {p.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-accent font-medium pt-1">
                    <span>{isHindi ? 'बहस देखें' : 'View discussion'}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {myArguments.length === 0 ? (
              <div className="p-6 text-center bg-surface rounded-xl border border-rule space-y-3">
                <p className="text-xs font-medium text-ink">
                  {isHindi ? 'आपने अभी तक कोई तर्क नहीं दिया है' : 'No arguments submitted yet'}
                </p>
                <p className="text-[11px] text-ink-muted">
                  {isHindi
                    ? 'बहस सूची में जाएं और किसी भी चर्चा में अपना पक्ष रखें।'
                    : 'Browse discussions and share your perspective in support or opposition.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('agora')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-paper border border-rule text-ink text-xs font-semibold hover:bg-rule/40 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span>{isHindi ? 'बहसें ब्राउज़ करें' : 'Browse debates'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              myArguments.map((arg) => (
                <div
                  key={arg.id}
                  onClick={() => openDebateDrawerById(arg.post_id)}
                  className={`p-3 rounded-xl border border-rule bg-surface hover:border-accent transition-colors cursor-pointer space-y-1.5 border-l-4 ${
                    arg.stance === 'pro'
                      ? 'border-l-support'
                      : 'border-l-oppose'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        arg.stance === 'pro'
                          ? 'bg-support-soft text-support-strong'
                          : 'bg-oppose-soft text-oppose-strong'
                      }`}
                    >
                      {arg.stance === 'pro'
                        ? (isHindi ? 'समर्थन' : 'Support')
                        : (isHindi ? 'विरोध' : 'Oppose')}
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      {arg.upvotes} {isHindi ? 'अपवोट' : 'upvotes'}
                    </span>
                  </div>
                  <p className="text-xs text-ink leading-relaxed">
                    &ldquo;{arg.content}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Account Settings & Legal */}
      <div className="p-3 rounded-xl bg-surface border border-rule space-y-1">
        <div className="px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
          {isHindi ? 'मंच दिशानिर्देश' : 'Platform & guidelines'}
        </div>
        <Link
          href="/terms"
          className="w-full p-2.5 rounded-lg hover:bg-paper transition-colors flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm">📜</span>
            <div>
              <div className="text-xs font-semibold text-ink group-hover:text-accent transition-colors">
                {isHindi ? 'सेवा की शर्तें एवं कानूनी अस्वीकरण' : 'Terms of service & legal disclaimer'}
              </div>
              <div className="text-[10px] text-ink-muted">
                {isHindi ? 'स्वतंत्र गैर-सरकारी नागरिक विमर्श' : 'Independent civic platform rules & non-affiliation notice'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Sign Out Button */}
      <div className="pt-1">
        <button
          onClick={signOut}
          className="w-full py-2.5 px-4 rounded-xl border border-oppose-strong/30 bg-oppose-soft hover:bg-oppose-soft/80 text-oppose-strong text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <LogOut className="w-4 h-4 text-oppose-strong" />
          <span>{isHindi ? 'जनमंच से बाहर निकलें' : 'Sign out'}</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-sm bg-surface rounded-xl border border-rule overflow-hidden p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-rule">
              <h3 className="text-xs font-semibold text-ink">
                {isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit citizen profile'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-paper text-ink-muted hover:bg-rule/40 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  {isHindi ? 'पूरा नाम' : 'Full public name'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  {isHindi ? 'राज्य / क्षेत्र' : 'State / region'}
                </label>
                <select
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value as Region)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                >
                  {ALL_STATES_AND_UTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  {isHindi ? 'नागरिक परिचय' : 'Civic bio & perspectives'}
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder={isHindi ? 'अपनी नीतिगत रुचियों के बारे में बताएं...' : 'Tell fellow citizens about your policy interests...'}
                  className="w-full p-2.5 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2 px-3 rounded-xl border border-rule bg-surface text-ink text-xs font-medium hover:bg-paper cursor-pointer min-h-[44px]"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 px-3 rounded-xl bg-accent text-surface text-xs font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? (isHindi ? 'सहेज रहे हैं...' : 'Saving...') : (isHindi ? 'सहेजें' : 'Save profile')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
