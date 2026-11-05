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
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

const AgoraShell: React.FC = () => {
  const { user, isAuthChecking, profileError, retryProfile, signOut, activeTab, drawerPost, setDrawerPost } = useApp();

  // 1. Session state checking spinner
  if (isAuthChecking) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JanManch" className="w-10 h-10 object-contain" />
          <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-ink tracking-wider font-serif">JanManch</p>
          <p className="text-[11px] text-ink-muted font-normal animate-pulse">Verifying citizen session...</p>
        </div>
      </div>
    );
  }

  // 2. Profile Fetch Error State (network or profile lookup failed)
  if (profileError && !user) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-oppose-soft border border-oppose text-oppose-strong flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-xs">
          <h2 className="text-sm font-semibold text-ink">Session verification error</h2>
          <p className="text-xs text-ink-muted leading-relaxed font-normal">{profileError}</p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={retryProfile}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry connection</span>
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rule bg-surface hover:bg-paper text-ink text-xs font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-ink-muted" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Citizen Agora Experience (Public landing for guests, full interactivity guard on participation)
  return (
    <div className="max-w-md mx-auto min-h-screen bg-paper text-ink pb-28 relative flex flex-col border-x border-rule">
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
