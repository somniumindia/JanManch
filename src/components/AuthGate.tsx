'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ALL_STATES_AND_UTS, INDIA_STATES_CONSTITUENCIES } from '@/constants/regions';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Globe2,
  MapPin,
  ArrowRight,
  Languages,
} from 'lucide-react';

export const AuthGate: React.FC = () => {
  const { signIn, signUp, language, toggleLanguage } = useApp();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState<'India' | 'Worldwide'>('India');
  const [state, setState] = useState<string>('Delhi (NCT)');
  const [constituency, setConstituency] = useState<string>('All Constituencies');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const isHindi = language === 'hi';

  const availableConstituencies = INDIA_STATES_CONSTITUENCIES[state] || ['All Constituencies'];

  const handleStateChange = (newState: string) => {
    setState(newState);
    setConstituency('All Constituencies');
  };

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
          res.error || (isHindi ? 'प्रवेश असफल। कृपया क्रेडेंशियल जांचें।' : 'Sign-in failed. Please verify your credentials.')
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
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMessage(
          isHindi ? 'सभी पंजीकरण फ़ील्ड आवश्यक हैं।' : 'All registration fields are required.'
        );
        return;
      }
      if (password.length < 6) {
        setErrorMessage(
          isHindi ? 'पासवर्ड में कम से कम 6 अक्षर होने चाहिए।' : 'Password must have at least 6 characters.'
        );
        return;
      }

      setLoading(true);
      const res = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        country,
        region: country === 'India' ? state : 'Worldwide',
        constituency: country === 'India' ? constituency : 'Countrywide',
      });
      setLoading(false);
      if (!res.success) {
        setErrorMessage(
          res.error || (isHindi ? 'पंजीकरण पूरा नहीं हो सका। कृपया पुनः प्रयास करें।' : 'Could not complete registration. Please retry.')
        );
      } else {
        // STRICT EMAIL CONFIRMATION GATE:
        setVerificationEmail(email.trim());
        setIsVerificationSent(true);
        setPassword('');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-paper text-ink flex flex-col justify-center px-4 py-8 sm:px-6">
      {/* Top Floating Language Switcher */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-rule bg-surface text-ink hover:bg-paper transition-colors cursor-pointer min-h-[36px]"
          title="Switch Language / भाषा बदलें"
        >
          <Languages className="w-3.5 h-3.5 text-accent" />
          <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      {/* Main Card */}
      {isVerificationSent ? (
        <div className="bg-surface border border-rule rounded-xl p-6 sm:p-7 space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center">
            <Mail className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-ink font-serif">
              {isHindi ? 'ईमेल सत्यापन भेजा गया' : 'Verification link sent'}
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed max-w-xs mx-auto font-normal">
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
        <div className="bg-surface border border-rule rounded-xl p-6 sm:p-7 space-y-5">
          {/* Branding Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-paper border border-rule p-1.5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="JanManch" className="w-9 h-9 object-contain" />
            </div>

            <div>
              <h1 className="font-semibold text-2xl tracking-tight text-ink font-serif leading-tight">
                {isHindi ? 'जनमंच' : 'JanManch'}
              </h1>
              <p className="text-xs text-ink-muted font-normal leading-relaxed max-w-xs mx-auto mt-1">
                {isHindi
                  ? 'लोक नीतियों और जनहित के मुद्दों पर निष्पक्ष नागरिक मंच'
                  : 'A fair stage for public debates and policy consensus'}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-paper rounded-xl text-xs font-medium border border-rule">
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
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-oppose-soft border border-oppose-strong/30 text-xs text-oppose-strong font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-medium text-ink mb-1">
                    {isHindi ? 'पूरा नाम' : 'Full public name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                    <input
                      type="text"
                      required
                      placeholder={isHindi ? 'उदा. माया अय्यर' : 'e.g. Maya Iyer'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Country Selector */}
                <div>
                  <label className="block text-[11px] font-medium text-ink mb-1">
                    {isHindi ? 'भौगोलिक क्षेत्र' : 'Geographic scope'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCountry('India')}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        country === 'India'
                          ? 'bg-accent-soft border-accent text-accent font-semibold'
                          : 'bg-paper border-rule text-ink hover:bg-rule/40'
                      }`}
                    >
                      <span>🇮🇳</span>
                      <span>India</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCountry('Worldwide')}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        country === 'Worldwide'
                          ? 'bg-accent-soft border-accent text-accent font-semibold'
                          : 'bg-paper border-rule text-ink hover:bg-rule/40'
                      }`}
                    >
                      <Globe2 className="w-3.5 h-3.5 text-accent" />
                      <span>Worldwide</span>
                    </button>
                  </div>
                </div>

                {/* Cascading State & Constituency if Country === 'India' */}
                {country === 'India' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-ink mb-1">
                        {isHindi ? 'राज्य या केंद्र शासित प्रदेश' : 'State or union territory'}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                        <select
                          value={state}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                        >
                          {ALL_STATES_AND_UTS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-ink mb-1">
                        {isHindi ? 'लोकसभा निर्वाचन क्षेत्र' : 'Lok Sabha constituency'}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                        <select
                          value={constituency}
                          onChange={(e) => setConstituency(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                        >
                          {availableConstituencies.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                {isHindi ? 'ईमेल पता' : 'Email address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                <input
                  type="email"
                  required
                  placeholder="citizen@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                {isHindi ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min. 6 characters)'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
                />
              </div>
            </div>

            {/* Mandatory Terms & Conditions Checkbox (Signup mode) */}
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

            {/* Submit Button */}
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
                    : mode === 'signup'
                      ? isHindi
                        ? 'खाता बनाएं'
                        : 'Create account'
                      : isHindi
                        ? 'प्रवेश करें'
                        : 'Sign in'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Protection Notice */}
          <div className="pt-3 border-t border-rule flex items-center justify-center gap-1.5 text-[11px] text-ink-muted font-normal">
            <ShieldCheck className="w-4 h-4 text-support" />
            <span>
              {isHindi
                ? 'आपका खाता ईमेल सत्यापन से सुरक्षित है'
                : 'Your account is protected with email verification'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
