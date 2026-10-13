'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TelegramHeader from '@/components/TelegramHeader';
import ReportForm from '@/components/ReportForm';
import ReportHistoryDrawer from '@/components/ReportHistoryDrawer';
import AccessDeniedCard from '@/components/AccessDeniedCard';
import { TelegramUser } from '@/types/telegram';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Membership authorization state
  const [membershipStatus, setMembershipStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [isRetrying, setIsRetrying] = useState(false);

  const verifyMembership = useCallback(async (user: TelegramUser | null) => {
    try {
      const res = await fetch('/api/auth/verify-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await res.json();
      if (data.success && data.isMember) {
        setMembershipStatus('allowed');
      } else {
        setMembershipStatus('denied');
      }
    } catch (err) {
      console.error('Error verifying membership:', err);
      // In case of network glitch in development, fallback gracefully
      if (process.env.NODE_ENV === 'development') {
        setMembershipStatus('allowed');
      } else {
        setMembershipStatus('denied');
      }
    } finally {
      setIsRetrying(false);
    }
  }, []);

  // Initialize Telegram WebApp SDK if running inside Telegram
  useEffect(() => {
    let detectedUser: TelegramUser | null = null;

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if (window.Telegram.WebApp.initDataUnsafe?.user) {
          detectedUser = window.Telegram.WebApp.initDataUnsafe.user;
          setCurrentUser(detectedUser);
        }
      } catch (err) {
        console.error('Error initializing Telegram WebApp:', err);
      }
    }

    verifyMembership(detectedUser);
  }, [verifyMembership]);

  const handleRetryVerification = () => {
    setIsRetrying(true);
    setMembershipStatus('checking');
    verifyMembership(currentUser);
  };

  const handleReportSubmitted = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Clean Top Header */}
      <TelegramHeader
        currentUser={currentUser}
        onOpenHistory={() => setIsHistoryOpen(true)}
        reportCount={refreshCounter}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center">
        {membershipStatus === 'checking' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              កំពុងផ្ទៀងផ្ទាត់សិទ្ធិសមាជិក...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifying group membership in QB Report...
            </p>
          </div>
        )}

        {membershipStatus === 'denied' && (
          <AccessDeniedCard
            currentUser={currentUser}
            onRetry={handleRetryVerification}
            isRetrying={isRetrying}
          />
        )}

        {membershipStatus === 'allowed' && (
          <ReportForm
            currentUser={currentUser}
            onSubmitted={handleReportSubmitted}
          />
        )}
      </main>

      {/* Reports History Drawer */}
      <ReportHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        refreshTrigger={refreshCounter}
      />
    </div>
  );
}
