'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Region } from '@/lib/types';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  AtSign,
  Edit3,
  LogOut,
  Layers,
  MessageSquare,
  ThumbsUp,
  X,
  Check,
  User,
  ArrowRight,
  Clock,
  ChevronRight,
} from 'lucide-react';

import { ALL_STATES_AND_UTS } from '@/constants/regions';

export const CitizenProfileTab: React.FC = () => {
  const { user, posts, argumentsList, signOut, updateProfile, openAuthModal, openDebateDrawerById } = useApp();

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
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900">
              Join the Citizen Agora
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Sign in or create your citizen account to submit policy propositions, cast verified votes, and build your civic deliberation score.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => openAuthModal('Sign in to access your civic profile and record deliberative votes.')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legal & Platform Transparency */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <Link
            href="/terms"
            className="w-full p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📜</span>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  Terms of Service &amp; Legal Disclaimer
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Independent platform notice &amp; deliberation guidelines
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
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
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-sm shadow-blue-500/20">
              {user.name.charAt(0)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-slate-900">{user.name}</h2>
                {user.isVerifiedVoter && (
                  <span title="Verified Citizen Voter">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">@{user.username}</p>
              <div className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>{user.region} Agora Citizen</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">Edit</span>
          </button>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100 font-normal">
            &ldquo;{user.bio}&rdquo;
          </p>
        )}
      </div>

      {/* Prominent Civic Karma Score Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-100 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Civic Karma Score
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Deliberative Standing</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-blue-700">{user.karmaScore}</span>
            <span className="text-[10px] text-slate-400 font-bold ml-1">pts</span>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-blue-900/80 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-blue-100/70">
          Earn +5 Karma each time neighbors upvote your debate points, +10 Karma per vote cast, and +30 Karma for initiating constructive propositions.
        </p>

        {/* Participation Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 font-semibold">
          <div className="p-2 rounded-xl bg-white/60 border border-slate-200/60 text-center">
            <span className="text-slate-900 font-bold block text-xs">
              {Object.keys(user.votedDebates || {}).length}
            </span>
            <span className="text-[10px] text-slate-500">Referendums Voted</span>
          </div>

          <div className="p-2 rounded-xl bg-white/60 border border-slate-200/60 text-center">
            <span className="text-slate-900 font-bold block text-xs">
              {(user.upvotedArgumentIds || []).length}
            </span>
            <span className="text-[10px] text-slate-500">Arguments Backed</span>
          </div>
        </div>
      </div>

      {/* Segmented Tabs: My Propositions vs My Arguments */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSegment('propositions')}
            className={`py-2 rounded-lg transition-all ${
              activeSegment === 'propositions'
                ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Propositions ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveSegment('arguments')}
            className={`py-2 rounded-lg transition-all ${
              activeSegment === 'arguments'
                ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Arguments ({myArguments.length})
          </button>
        </div>

        {/* Segment Content */}
        {activeSegment === 'propositions' ? (
          <div className="space-y-2.5">
            {myPosts.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-xs font-bold text-slate-700">No propositions authored yet</p>
                <p className="text-[11px] text-slate-400">
                  Tap the center (+) button below to launch your first public policy debate!
                </p>
              </div>
            ) : (
              myPosts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openDebateDrawerById(p.id)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {p.topic} &bull; {p.region}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {p.agree_votes + p.disagree_votes} votes
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {p.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-blue-700 font-bold pt-1">
                    <span>View Deliberation Floor</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {myArguments.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-xs font-bold text-slate-700">No arguments submitted yet</p>
                <p className="text-[11px] text-slate-400">
                  Join any deliberation on The Agora feed and submit your pro or con reasoning.
                </p>
              </div>
            ) : (
              myArguments.map((arg) => (
                <div
                  key={arg.id}
                  onClick={() => openDebateDrawerById(arg.post_id)}
                  className={`p-3 rounded-2xl border transition-shadow cursor-pointer space-y-1.5 ${
                    arg.stance === 'pro'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        arg.stance === 'pro'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {arg.stance === 'pro' ? 'In Favor' : 'Against'}
                    </span>
                    <div className="flex items-center gap-1 text-[10.5px] font-bold text-slate-600">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>{arg.upvotes} upvotes</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    &ldquo;{arg.content}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Account Settings & Legal */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
        <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Account &amp; Platform Transparency
        </div>
        <Link
          href="/terms"
          className="w-full p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm">📜</span>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                Terms of Service &amp; Legal Disclaimer
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Independent platform rules &amp; government non-affiliation notice
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Red-Accented Sign Out Button */}
      <div className="pt-1">
        <button
          onClick={signOut}
          className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Sign Out of JanManch</span>
        </button>
      </div>

      {/* Edit Profile Modal / Drawer */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Edit Citizen Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Public Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  City / Constituency
                </label>
                <select
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value as Region)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-semibold"
                >
                  {ALL_STATES_AND_UTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Civic Bio & Perspectives
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell fellow citizens about your policy interests..."
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
