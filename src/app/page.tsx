'use client';

import React, { useState } from 'react';
import TelegramHeader from '@/components/TelegramHeader';
import TelegramApprovalCard from '@/components/TelegramApprovalCard';
import ReportForm from '@/components/ReportForm';
import TelegramSimulatorWrapper from '@/components/TelegramSimulatorWrapper';
import ReportHistoryDrawer from '@/components/ReportHistoryDrawer';
import { TelegramUser } from '@/types/telegram';
import { History } from 'lucide-react';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>({
    id: 108234912,
    first_name: 'Khmer',
    last_name: 'Engineer',
    username: 'khmerengineer',
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleReportSubmitted = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <TelegramSimulatorWrapper onUserChange={setCurrentUser}>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Telegram Top Header */}
        <TelegramHeader
          title="Cambo BIM Access Bot"
          isAdmin={true}
          onClose={() => alert('Mini App Close requested')}
        />

        {/* E2E User Sign-up & Approval Simulation Banner */}
        <TelegramApprovalCard />

        {/* Quick action: View Submitted Reports */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            ទម្រង់រាយការណ៍ការដ្ឋានសំណង់ប្រចាំថ្ងៃ
          </span>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-900/60 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>មើលប្រវត្តិ ({refreshCounter})</span>
          </button>
        </div>

        {/* Main Report Form */}
        <div className="flex-1">
          <ReportForm
            currentUser={currentUser}
            onSubmitted={handleReportSubmitted}
          />
        </div>

        {/* Reports History Drawer */}
        <ReportHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          refreshTrigger={refreshCounter}
        />
      </div>
    </TelegramSimulatorWrapper>
  );
}
