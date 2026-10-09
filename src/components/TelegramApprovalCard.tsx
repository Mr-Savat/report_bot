'use client';

import React, { useState } from 'react';
import { ShieldCheck, Bell, CheckCircle, Clock, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function TelegramApprovalCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApproved, setIsApproved] = useState(true);

  return (
    <div className="mx-4 mt-3 bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-sky-900/10 dark:from-blue-950/40 dark:to-slate-900/40 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-3.5 shadow-xs transition-all">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Cambo BIM Access Bot
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold px-1.5 py-0.2 rounded-full">
                E2E Workflow
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ប្រព័ន្ធចុះឈ្មោះ & សិទ្ធិអនុញ្ញាត (Sign Up & Role Access)
            </p>
          </div>
        </div>

        <button 
          type="button" 
          aria-label="Toggle details"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <span>🔔</span>
              <span>NEW SIGN UP REQUEST (CAMBO BIM)</span>
            </div>
            
            <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>🆔</span>
              <span>User ID: <strong>USR-A1144FAF4B</strong></span>
            </div>

            <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>APPROVED by Admin</span>
            </div>

            <div className="text-slate-600 dark:text-slate-400 pl-4 space-y-0.5">
              <p>Approver: Admin (@Mr_Savat)</p>
              <p className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Time: 04-Oct-2026 09:16 PM
              </p>
              <p className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Status: User is now Active (Viewer / Reporter role)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
            <span>សិទ្ធិបច្ចុប្បន្ន: <strong>Full Admin & Reporter</strong></span>
            <button
              type="button"
              onClick={() => setIsApproved(!isApproved)}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-sans cursor-pointer"
            >
              <UserCheck className="w-3 h-3" />
              {isApproved ? 'តេស្តសាកល្បង Re-verify' : 'ផ្តល់សិទ្ធិឡើងវិញ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
