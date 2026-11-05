import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, AlertTriangle, Scale, Users, FileText, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service & Legal Disclaimer | JanManch',
  description:
    'JanManch Terms of Service, Legal Non-Affiliation Disclaimer, and Community Deliberation Guidelines for civic discourse.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white pb-20">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all active:scale-98"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Return to Agora</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>JanManch Legal</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header Title */}
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>OFFICIAL CIVIC CHARTER &amp; TERMS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              JanManch Terms of Service, Legal Disclaimer &amp; Community Guidelines
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Democratic Discourse • Independent Citizen Agora • Non-Affiliation Declaration
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 font-semibold">
              <span>Effective Date: November 2026</span>
              <span>•</span>
              <span>Version: 1.2 (Pan-India &amp; Global)</span>
            </div>
          </div>

          {/* Prominent Legal Disclaimer Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Critical Civic &amp; Legal Notice
              </h2>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-amber-900 font-medium">
              <strong>JanManch (&ldquo;जनमंच&rdquo;)</strong> is an independent, non-partisan citizen agora and civic technology platform designed exclusively for citizen-to-citizen perspective sharing, debate, and consensus mapping. 
              <strong> JanManch is NOT affiliated with, sponsored by, authorized by, or in any way officially connected with the Government of India, any State Government, Union Territory administration, the Election Commission of India (ECI), or any political party.</strong>
            </p>
            <p className="text-xs leading-relaxed text-amber-800">
              Votes cast, percentages displayed, and arguments recorded represent user-generated civic sentiments and carry <strong>no statutory, legal, or binding governmental authority</strong>.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">1</span>
              <h2 className="text-base font-extrabold text-slate-900">Acceptance of Terms &amp; Eligibility</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              By accessing, browsing, registering for, or interacting with JanManch (the &ldquo;Platform&rdquo;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any part of these Terms, you must immediately discontinue use of the platform.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              To create a citizen profile, submit propositions, or record votes, you represent and warrant that you are at least 18 years of age (or have reached the legal age of majority in your jurisdiction) and possess full legal capacity to enter into this agreement.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">2</span>
              <h2 className="text-base font-extrabold text-slate-900">Citizen Registration &amp; Authentication</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              When creating an account, you agree to provide truthful, accurate, and current registration details. You are solely responsible for maintaining the confidentiality of your account credentials.
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5 font-normal">
              <li>Each citizen is permitted only one primary active account. Automated bot registration, script-driven voting, or multi-account manipulation will lead to permanent revocation.</li>
              <li>Impersonation of any elected official, civil servant, public personality, or fellow citizen is strictly prohibited.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">3</span>
              <h2 className="text-base font-extrabold text-slate-900">Democratic Deliberation &amp; Community Conduct</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              JanManch is committed to robust, respectful, evidence-based civic deliberation. While passionate debate and constructive criticism of public policy are strongly encouraged, the following behaviors are strictly prohibited:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="text-xs font-bold text-rose-700 mb-1">🚫 Hate Speech &amp; Communal Incitement</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Attacks or discrimination based on religion, race, caste, gender, sexual orientation, disability, or nationality.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="text-xs font-bold text-rose-700 mb-1">🚫 Harassment, Threats &amp; Doxxing</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Publishing private phone numbers, physical addresses, personal extortion, or violent intimidation.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="text-xs font-bold text-rose-700 mb-1">🚫 Malicious Disinformation</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Fabricated crisis alerts, manipulated deepfakes, counterfeit government orders, or voter suppression hoaxes.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="text-xs font-bold text-rose-700 mb-1">🚫 Spam &amp; Commercial Solicitation</h3>
                <p className="text-[11px] text-slate-500 leading-normal">Commercial advertisements, promotional links, affiliate spam, cryptocurrency schemes, or deceptive links.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">4</span>
              <h2 className="text-base font-extrabold text-slate-900">User Content, Perspectives &amp; Supporting Evidence</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              You retain ownership of any propositions, arguments, comments, and multimedia files (images, documents, audio recordings, or videos) that you submit to JanManch.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              By submitting content to JanManch, you grant the platform an irrevocable, worldwide, non-exclusive, royalty-free license to host, display, index, categorize, and aggregate your submission within the Agora feed and Pulse trends analytics.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">5</span>
              <h2 className="text-base font-extrabold text-slate-900">Civic Karma &amp; Moderation Mechanics</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Civic Karma points (+20 for constructive arguments, +5 for upvotes, +30 for publishing verified propositions) are an internal reputation score intended to encourage high-quality discourse. Karma points hold <strong>no cash value, monetary equity, or transferable financial status</strong>.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              JanManch reserves the right to review reported content, apply temporary posting timeouts, adjust karma scores, or permanently terminate accounts found gaming or manipulating the deliberation floor.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">6</span>
              <h2 className="text-base font-extrabold text-slate-900">Intermediary Safe Harbor &amp; Legal Compliance</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              JanManch acts as an intermediary platform pursuant to Section 79 of the Information Technology Act, 2000 (India) and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              JanManch does not pre-screen all citizen submissions and shall not be held liable for third-party content posted by users. Upon receipt of valid statutory takedown notices or reports of unlawful content, JanManch acts expediently to review and disable infringing materials.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">7</span>
              <h2 className="text-base font-extrabold text-slate-900">Limitation of Liability</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              JanManch is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. Under no circumstances shall JanManch, its developers, operators, or affiliates be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use of, or inability to use, this platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900">Grievance Redressal &amp; Contact</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              If you believe any content on JanManch violates your legal rights, copyright, or community decency standards, or if you have questions regarding these terms, please contact our Grievance Officer:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 font-medium">
              <p className="font-bold text-slate-900">JanManch Grievance &amp; Legal Desk</p>
              <p className="text-slate-600">Email: <a href="mailto:grievance@janmanch.in" className="text-blue-600 font-bold underline">grievance@janmanch.in</a></p>
              <p className="text-slate-500">Jurisdiction: New Delhi, India</p>
            </div>
          </section>

          {/* Bottom Action */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Independent Civic Technology Initiative</span>
            </div>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 text-center transition-all active:scale-98"
            >
              ← Back to JanManch Agora
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
