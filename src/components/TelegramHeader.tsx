'use client';

import React from 'react';
import { History, UserCheck, ClipboardCheck } from 'lucide-react';
import { TelegramUser } from '@/types/telegram';

interface TelegramHeaderProps {
  currentUser?: TelegramUser | null;
  onOpenHistory?: () => void;
  reportCount?: number;
}

export default function TelegramHeader({
  currentUser,
  onOpenHistory,
  reportCount = 0,
}: TelegramHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Title without logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              របាយការណ៍ការដ្ឋានប្រចាំថ្ងៃ
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Daily Construction Site Report
            </p>
          </div>
        </div>

        {/* Right side: User pill and History button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentUser && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{currentUser.first_name} {currentUser.last_name || ''}</span>
              {currentUser.username && (
                <span className="text-slate-400">(@{currentUser.username})</span>
              )}
            </div>
          )}

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3.5 py-2 rounded-xl border border-blue-200/70 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
            >
              <History className="w-3.5 h-3.5" />
              <span>ប្រវត្តិ {reportCount > 0 ? `(${reportCount})` : ''}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
