'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Region } from '@/lib/types';
import { X, Sparkles, Lock, Mail, User, AtSign, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

import { ALL_STATES_AND_UTS } from '@/constants/regions';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalPrompt, signIn, signUp, language } = useApp();
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

  const isHindi = language === 'hi';

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signin') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage(
          isHindi
            ? 'कृपया अपना नागरिक ईमेल और पासवर्ड दर्ज करें।'
            : 'Please enter both your citizen email and password.'
        );
        return;
      }
      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(
          res.error || (isHindi ? 'प्रवेश असफल। कृपया क्रेडेंशियल जांचें।' : 'Failed to sign in. Please verify your credentials.')
        );
      }
    } else {
      if (!agreedToTerms) {
        setErrorMessage(
          isHindi
            ? 'जनमंच से जुड़ने के लिए आपको नियमों व शर्तों से सहमत होना अनिवार्य है।'
            : 'You must agree to the Terms & Conditions to join JanManch.'
        );
        return;
      }
      if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
        setErrorMessage(
          isHindi ? 'सभी पंजीकरण फ़ील्ड आवश्यक हैं।' : 'All registration fields are required.'
        );
        return;
      }
      if (password.length < 6) {
        setErrorMessage(
          isHindi ? 'पासवर्ड में कम से कम 6 अक्षर होने चाहिए।' : 'Password should have at least 6 characters.'
        );
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
        setErrorMessage(
          res.error || (isHindi ? 'पंजीकरण पूरा नहीं हो सका। कृपया पुनः प्रयास करें।' : 'Could not complete registration. Please retry.')
        );
      } else {
        // STRICT EMAIL CONFIRMATION GATE
        setVerificationEmail(email.trim());
        setIsVerificationSent(true);
        setPassword('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-xs transition-opacity animate-fade-in p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Slide-up Container */}
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-xl border border-rule overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-rule flex items-center justify-between bg-paper">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-ink font-serif">
                {isHindi ? 'नागरिक प्रमाणीकरण' : 'Citizen authentication'}
              </h2>
              <p className="text-[10px] text-ink-muted">
                {isHindi
                  ? 'आपका खाता ईमेल सत्यापन से सुरक्षित है'
                  : 'Protected with email verification'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-7 h-7 rounded-full bg-surface hover:bg-rule/40 text-ink-muted flex items-center justify-center transition-colors cursor-pointer border border-rule"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {isVerificationSent ? (
            <div className="py-4 space-y-5 text-center animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-semibold text-ink font-serif">
                  {isHindi ? 'ईमेल सत्यापन भेजा गया' : 'Verification link sent'}
                </h2>
                <p className="text-xs text-ink-muted leading-relaxed max-w-xs mx-auto">
                  {isHindi
                    ? 'हमने आपके ईमेल पते पर एक सत्यापन लिंक भेजा है। कृपया लॉग इन करने से पहले अपना ईमेल सत्यापित करें।'
                    : 'We have sent a verification link to your email. Please verify your email before logging in.'}
                </p>
                <div className="inline-block px-3 py-1 rounded-lg bg-paper text-ink text-xs font-medium border border-rule">
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
                  className="w-full py-2.5 px-4 rounded-xl bg-accent text-surface font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>{isHindi ? 'प्रवेश पर वापस जाएं' : 'Back to sign in'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Contextual Prompt Banner */}
              {authModalPrompt && (
                <div className="p-3 rounded-xl bg-accent-soft text-xs text-accent border border-accent/20 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{authModalPrompt}</p>
                </div>
              )}

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-1 bg-paper rounded-xl text-xs font-medium border border-rule">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-surface text-ink font-semibold border border-rule'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {isHindi ? 'प्रवेश करें' : 'Sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-surface text-ink font-semibold border border-rule'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {isHindi ? 'खाता बनाएं' : 'Create account'}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-oppose-soft border border-oppose-strong/30 text-xs text-oppose-strong font-medium leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-ink mb-1">
                        {isHindi ? 'पूरा नाम' : 'Full public name'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                        <input
                          type="text"
                          placeholder={isHindi ? 'उदा. माया अय्यर' : 'e.g. Maya Iyer'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-ink mb-1">
                        {isHindi ? 'उपयोगकर्ता नाम' : 'Username'}
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                        <input
                          type="text"
                          placeholder={isHindi ? 'उदा. maya_delhi' : 'e.g. maya_delhi'}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-ink mb-1">
                        {isHindi ? 'राज्य या क्षेत्र' : 'State or region'}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value as Region)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
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
                  <label className="block text-[11px] font-medium text-ink mb-1">
                    {isHindi ? 'ईमेल पता' : 'Email address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                    <input
                      type="email"
                      placeholder="citizen@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink mb-1">
                    {isHindi ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min. 6 characters)'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
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
                        className="mt-0.5 w-4 h-4 rounded border-rule text-accent focus:ring-accent shrink-0 cursor-pointer"
                      />
                      <span className="text-[11px] text-ink-muted leading-snug">
                        {isHindi ? (
                          <>
                            मैं जनमंच के{' '}
                            <Link
                              href="/terms"
                              target="_blank"
                              className="font-medium text-accent hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              नियमों व शर्तों
                            </Link>{' '}
                            से सहमत हूँ और स्वीकार करता हूँ कि यह बिना सरकारी संबद्धता वाला एक स्वतंत्र नागरिक मंच है।
                          </>
                        ) : (
                          <>
                            I agree to the JanManch{' '}
                            <Link
                              href="/terms"
                              target="_blank"
                              className="font-medium text-accent hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              terms &amp; conditions
                            </Link>{' '}
                            and acknowledge that this is an independent civic platform without government affiliation.
                          </>
                        )}
                      </span>
                    </label>
                  </div>
                )}

                <div
                  className="w-full pt-1"
                  onClick={() => {
                    if (mode === 'signup' && !agreedToTerms) {
                      setErrorMessage(
                        isHindi
                          ? 'जनमंच से जुड़ने के लिए आपको नियमों व शर्तों से सहमत होना अनिवार्य है।'
                          : 'You must agree to the Terms & Conditions to join JanManch.'
                      );
                    }
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading || (mode === 'signup' && !agreedToTerms)}
                    className="w-full py-2.5 px-4 rounded-xl bg-accent text-surface font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
                  >
                    <span>
                      {loading
                        ? isHindi
                          ? 'प्रमाणीकरण जारी...'
                          : 'Authenticating...'
                        : mode === 'signin'
                          ? isHindi
                            ? 'प्रवेश करें'
                            : 'Sign in'
                          : isHindi
                            ? 'खाता बनाएं'
                            : 'Create account'}
                    </span>
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
