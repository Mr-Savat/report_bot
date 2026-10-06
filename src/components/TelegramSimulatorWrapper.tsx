'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Eye, User, Sparkles } from 'lucide-react';
import { TelegramUser } from '@/types/telegram';

interface TelegramSimulatorWrapperProps {
  children: React.ReactNode;
  onUserChange?: (user: TelegramUser) => void;
}

export default function TelegramSimulatorWrapper({
  children,
  onUserChange,
}: TelegramSimulatorWrapperProps) {
  const [viewMode, setViewMode] = useState<'desktop-modal' | 'mobile' | 'fullscreen'>('desktop-modal');
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);
  const [mockUser, setMockUser] = useState<TelegramUser>({
    id: 108234912,
    first_name: 'Khmer',
    last_name: 'Engineer',
    username: 'khmerengineer',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      setIsInsideTelegram(true);
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        setMockUser(tgUser);
        if (onUserChange) onUserChange(tgUser);
      }
    } else {
      if (onUserChange) onUserChange(mockUser);
    }
  }, []);

  // When running inside actual Telegram, render full without simulator frame
  if (isInsideTelegram) {
    return <main className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-start p-2 sm:p-6 transition-all">
      {/* Dev Simulator Top Toolbar */}
      <aside aria-label="Dev Simulator Control Bar" className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-md border border-slate-300 dark:border-slate-700 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Telegram WebApp Simulator
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-semibold px-1.5 py-0.5 rounded-full">
                Dev Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              សាកល្បងមុនពេលភ្ជាប់ទៅកាន់ Telegram ផ្ទាល់
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setViewMode('desktop-modal')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'desktop-modal'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop Modal</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('fullscreen')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'fullscreen'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full</span>
          </button>
        </div>

        {/* Mock Telegram User Info */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
            <User className="w-3 h-3 text-slate-400" />
            <span>@{mockUser.username}</span>
            <span className="text-[10px] text-emerald-500 font-bold ml-1">• Active</span>
          </div>
        </div>
      </aside>

      {/* Frame Container */}
      <main
        className={`w-full transition-all duration-300 ${
          viewMode === 'desktop-modal'
            ? 'max-w-md sm:max-w-lg bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden relative'
            : viewMode === 'mobile'
            ? 'max-w-sm bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl border-8 border-slate-800 dark:border-slate-700 overflow-hidden relative'
            : 'max-w-3xl bg-white dark:bg-slate-950 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
