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
  Sparkles,
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
        // Show verification sent screen, user cannot proceed without verifying
        setVerificationEmail(email.trim());
        setIsVerificationSent(true);
        setPassword('');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center px-4 py-8 sm:px-6">
      {/* Top Floating Language Switcher */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 bg-white shadow-2xs hover:bg-slate-100 text-slate-700 transition-all active:scale-95"
          title="Switch Language / भाषा बदलें"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      {/* Main Card */}
      {isVerificationSent ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-7 space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900">
              {isHindi ? 'ईमेल सत्यापन भेजा गया' : 'Verification Link Sent'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              {isHindi
                ? 'हमने आपके ईमेल पते पर एक सत्यापन लिंक भेजा है। कृपया लॉग इन करने से पहले अपना ईमेल सत्यापित करें।'
                : 'We have sent a verification link to your email. Please verify your email before logging in.'}
            </p>
            <div className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
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
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isHindi ? 'प्रवेश पर वापस जाएं' : 'Back to Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-7 space-y-5">
          {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <img src="/logo.png" alt="JanManch" className="w-10 h-10 object-contain" />
            </div>
          </div>

          <div>
            <h1 className="font-black text-2xl tracking-tight text-slate-900 leading-tight">
              {isHindi ? 'जन' : 'Jan'}
              <span className="text-blue-600">{isHindi ? 'मंच' : 'Manch'}</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto mt-0.5">
              {isHindi
                ? 'लोकतांत्रिक संवाद, दृष्टिकोण साझाकरण एवं नीतिगत विमर्श'
                : 'Democratic Discourse, Perspective Sharing & Structured Policy Debates'}
            </p>
          </div>
        </div>

        {/* Tab Switcher: "Create Citizen Account" (default) vs "Sign In" */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
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
            {isHindi ? 'नागरिक खाता बनाएं' : 'Create Citizen Account'}
          </button>
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
            {isHindi ? 'प्रवेश करें' : 'Sign In'}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {isHindi ? 'पूर्ण नाम' : 'Full Legal / Public Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={isHindi ? 'उदा. माया अय्यर' : 'e.g. Maya Iyer'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Country Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {isHindi ? 'भौगोलिक दायरा / देश' : 'Geographic Jurisdiction / Country'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCountry('India')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      country === 'India'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🇮🇳</span>
                    <span>India</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCountry('Worldwide')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      country === 'Worldwide'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Worldwide</span>
                  </button>
                </div>
              </div>

              {/* Cascading State & Constituency if Country === 'India' */}
              {country === 'India' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      {isHindi ? 'राज्य / केंद्र शासित प्रदेश' : 'State / Union Territory'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <select
                        value={state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
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
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      {isHindi ? 'लोकसभा निर्वाचन क्षेत्र' : 'Lok Sabha Parliamentary Constituency'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <select
                        value={constituency}
                        onChange={(e) => setConstituency(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
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
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              {isHindi ? 'नागरिक ईमेल पता' : 'Citizen Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="citizen@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              {isHindi ? 'पासवर्ड (न्यूनतम 6 अक्षर)' : 'Password (min. 6 chars)'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
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
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  {isHindi ? (
                    <>
                      मैं जनमंच के{' '}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
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
                        className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms &amp; Conditions
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {loading
                  ? isHindi
                    ? 'प्रमाणीकरण जारी...'
                    : 'Authenticating...'
                  : mode === 'signup'
                    ? isHindi
                      ? 'नागरिक खाता बनाएं'
                      : 'Create Citizen Account'
                    : isHindi
                      ? 'नागरिक के रूप में प्रवेश करें'
                      : 'Sign In as Citizen'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Security / Verification Badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {isHindi ? 'सुरक्षित एवं सत्यापित नागरिक विमर्श' : 'Verified & Cryptographically Secured Discourse'}
          </span>
        </div>
      </div>
      )}
    </div>
  );
};
