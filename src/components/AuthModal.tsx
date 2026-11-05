'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Region } from '@/lib/types';
import { X, Sparkles, Lock, Mail, User, AtSign, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

import { ALL_STATES_AND_UTS } from '@/constants/regions';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalPrompt, signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [region, setRegion] = useState<Region>('Delhi NCR');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signin') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter both your citizen email and password.');
        return;
      }
      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      if (!agreedToTerms) {
        setErrorMessage('You must agree to the Terms & Conditions to join JanManch.');
        return;
      }
      if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('All registration fields are required.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password should have at least 6 characters.');
        return;
      }
      setLoading(true);
      const res = await signUp({
        name,
        username,
        email,
        password,
        region,
      });
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Could not complete registration. Please retry.');
      } else {
        // STRICT EMAIL CONFIRMATION GATE
        setVerificationEmail(email.trim());
        setIsVerificationSent(true);
        setPassword('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Slide-up Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Citizen Agora Auth</h2>
              <p className="text-[10px] text-slate-500 font-medium">Democratic & Verified Discourse</p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {isVerificationSent ? (
            <div className="py-4 space-y-5 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
                <Mail className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-black text-slate-900">
                  Verification Link Sent / ईमेल सत्यापन भेजा गया
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  We have sent a verification link to your email. Please verify your email before logging in.
                </p>
                <div className="inline-block px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  {verificationEmail}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerificationSent(false);
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Back to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Prompt Banner */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{authModalPrompt}</p>
              </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Citizen Account
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Full Legal / Public Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Maya Iyer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Citizen Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. maya_delhi"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    City / Constituency
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value as Region)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    >
                      {ALL_STATES_AND_UTS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Citizen Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="pt-1 pb-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-left group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I agree to the JanManch{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms &amp; Conditions
                    </a>{' '}
                    and acknowledge that this is an independent civic platform without government affiliation.
                  </span>
                </label>
              </div>
            )}

            <div
              className="w-full"
              onClick={() => {
                if (mode === 'signup' && !agreedToTerms) {
                  setErrorMessage('You must agree to the Terms & Conditions to join JanManch.');
                }
              }}
            >
              <button
                type="submit"
                disabled={loading || (mode === 'signup' && !agreedToTerms)}
                className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In as Citizen' : 'Create Citizen Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
};
