'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { AgoraFeedTab } from '@/components/AgoraFeedTab';
import { CommunityPulseTab } from '@/components/CommunityPulseTab';
import { CreateDiscussionTab } from '@/components/CreateDiscussionTab';
import { CitizenProfileTab } from '@/components/CitizenProfileTab';
import { DeliberationFloorDrawer } from '@/components/DeliberationFloorDrawer';
import { AuthModal } from '@/components/AuthModal';
import { AuthGate } from '@/components/AuthGate';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

const AgoraShell: React.FC = () => {
  const { user, isAuthChecking, profileError, retryProfile, signOut, activeTab, drawerPost, setDrawerPost } = useApp();

  // 1. Session state checking spinner
  if (isAuthChecking) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <img src="/logo.png" alt="JanManch" className="w-10 h-10 object-contain drop-shadow-sm" />
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-800 tracking-wider uppercase">JanManch Agora</p>
          <p className="text-[11px] text-slate-400 font-medium animate-pulse">Verifying Citizen Session...</p>
        </div>
      </div>
    );
  }

  // 2. Profile Fetch Error State (network or profile lookup failed)
  if (profileError && !user) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-xs">
          <h2 className="text-sm font-extrabold text-slate-900">Session Verification Error</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">{profileError}</p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={retryProfile}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Mandatory Auth Gate: If no authenticated citizen session exists, do NOT show Agora feed or bottom navigation
  if (!user) {
    return <AuthGate />;
  }

  // 4. Authenticated Citizen Agora Experience
  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 pb-24 relative flex flex-col shadow-xl border-x border-slate-200/80">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'agora' && <AgoraFeedTab />}
        {activeTab === 'pulse' && <CommunityPulseTab />}
        {activeTab === 'create' && <CreateDiscussionTab />}
        {activeTab === 'profile' && <CitizenProfileTab />}
      </main>

      <BottomNav />

      {/* Deliberation Floor Drawer */}
      {drawerPost && (
        <DeliberationFloorDrawer
          post={drawerPost}
          onClose={() => setDrawerPost(null)}
        />
      )}

      <AuthModal />
    </div>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <AgoraShell />
    </AppProvider>
  );
}
