'use client';

import React from 'react';
import { ShieldAlert, RefreshCw, XCircle, Users, ExternalLink } from 'lucide-react';
import { TelegramUser } from '@/types/telegram';

interface AccessDeniedCardProps {
  currentUser?: TelegramUser | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function AccessDeniedCard({
  currentUser,
  onRetry,
  isRetrying = false,
}: AccessDeniedCardProps) {
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-8 px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-rose-200/80 dark:border-rose-950/60 shadow-2xl shadow-rose-950/10 p-6 sm:p-8 text-center">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon with glowing badge */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-xl shadow-rose-500/25">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-3">
          <span>🚫 ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          អ្នកពុំទាន់មានសិទ្ធិចូលប្រើប្រាស់ឡើយ
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          ប្រព័ន្ធរបាយការណ៍ការដ្ឋាននេះ ត្រូវបានកំណត់សម្រាប់តែវិស្វករ និងសមាជិកដែលស្ថិតនៅក្នុងក្រុម Telegram <span className="font-semibold text-rose-600 dark:text-rose-400">QB Report</span> ប៉ុណ្ណោះ។
        </p>

        {/* User identification card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700/60 text-left text-xs space-y-2 mb-6">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>👤 គណនីរបស់អ្នក៖</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentUser ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : 'មិនស្គាល់ (Guest)'}
            </span>
          </div>
          {currentUser?.username && (
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>🏷️ Username៖</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">@{currentUser.username}</span>
            </div>
          )}
          {currentUser?.id && (
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>🆔 Telegram ID៖</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser.id}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">🔒 ស្ថានភាពសិទ្ធិ៖</span>
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              មិនមែនជាសមាជិកក្រុម
            </span>
          </div>
        </div>

        {/* Guidance Notice */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-left text-xs text-amber-800 dark:text-amber-300 mb-6">
          <Users className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            ប្រសិនបើលោកអ្នកជាបុគ្គលិករបស់ <b>QB Tech Solution</b> សូមទាក់ទងទៅកាន់ Admin ឬអ្នកគ្រប់គ្រងដើម្បី <b>Add អ្នកចូលទៅក្នុងក្រុម Telegram</b> ជាមុនសិន។
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'កំពុងឆែក...' : 'ពិនិត្យឡើងវិញ'}</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-sm font-semibold border border-rose-200 dark:border-rose-900 active:scale-95 transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>បិទកម្មវិធី</span>
          </button>
        </div>
      </div>
    </div>
  );
}
