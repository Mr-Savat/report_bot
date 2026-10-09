'use client';

import React, { useState, useEffect } from 'react';
import TelegramHeader from '@/components/TelegramHeader';
import ReportForm from '@/components/ReportForm';
import ReportHistoryDrawer from '@/components/ReportHistoryDrawer';
import { TelegramUser } from '@/types/telegram';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Initialize Telegram WebApp SDK if running inside Telegram
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if (window.Telegram.WebApp.initDataUnsafe?.user) {
          setCurrentUser(window.Telegram.WebApp.initDataUnsafe.user);
        }
      } catch (err) {
        console.error('Error initializing Telegram WebApp:', err);
      }
    }
  }, []);

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

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ReportForm
          currentUser={currentUser}
          onSubmitted={handleReportSubmitted}
        />
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
