'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

export interface StatusModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  onClose: () => void;
  primaryButtonText?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
}

export default function StatusModal({
  isOpen,
  type,
  title,
  message,
  onClose,
  primaryButtonText,
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
}: StatusModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Haptic feedback when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'success') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const defaultTitle =
    type === 'success'
      ? 'បញ្ជូនរបាយការណ៍ជោគជ័យ! 🎉'
      : type === 'error'
      ? 'សូមពិនិត្យព័ត៌មានឡើងវិញ ⚠️'
      : 'ដំណឹងជូនដំណឹង ℹ️';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop Click Dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing Icon */}
        <div className="mx-auto mb-4 flex items-center justify-center">
          {type === 'success' ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
          ) : type === 'error' ? (
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-9 h-9 animate-pulse" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-9 h-9" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {title || defaultTitle}
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {primaryButtonText && (
            <button
              type="button"
              onClick={onPrimaryClick || onClose}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 ${
                type === 'success'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                  : type === 'error'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                  : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
              }`}
            >
              <span>{primaryButtonText}</span>
            </button>
          )}

          {secondaryButtonText && (
            <button
              type="button"
              onClick={onSecondaryClick || onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs active:scale-95 transition-all border border-slate-200/50 dark:border-slate-700/50"
            >
              <span>{secondaryButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
