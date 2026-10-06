'use client';

import React from 'react';
import { MoreVertical, X, ShieldCheck } from 'lucide-react';

interface TelegramHeaderProps {
  title?: string;
  onClose?: () => void;
  isAdmin?: boolean;
}

export default function TelegramHeader({
  title = "Cambo BIM Access Bot",
  onClose,
  isAdmin = true,
}: TelegramHeaderProps) {
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
          BIM
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            {isAdmin && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Telegram Mini App · របាយការណ៍ការដ្ឋាន
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
        <button
          type="button"
          aria-label="More options"
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
