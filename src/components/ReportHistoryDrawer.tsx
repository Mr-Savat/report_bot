'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Clock, Sun, Cloud, CloudRain, RefreshCw, X } from 'lucide-react';
import { DailyReportData } from '@/lib/supabase';
import { formatReportTelegramMessage } from '@/lib/telegram';

interface ReportHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger?: number;
}

export default function ReportHistoryDrawer({
  isOpen,
  onClose,
  refreshTrigger,
}: ReportHistoryDrawerProps) {
  const [reports, setReports] = useState<DailyReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, refreshTrigger]);

  const copyTelegramFormat = (report: DailyReportData) => {
    const text = formatReportTelegramMessage(report);
    navigator.clipboard.writeText(text);
    setCopiedId(report.id || 'current');
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              ប្រវត្តិនៃរបាយការណ៍ (Submitted Reports)
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={fetchReports}
              aria-label="Refresh"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">មិនទាន់មានរបាយការណ៍នៅឡើយទេ</p>
              <p className="text-xs text-slate-500 mt-1">សូមបំពេញ Form ហើយចុច &quot;បញ្ជូន&quot; ដើម្បីបង្កើត</p>
            </div>
          ) : (
            reports.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {item.assigned_task}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.report_date} · {item.start_time}
                  </span>
                  <span className="flex items-center gap-1">
                    {item.weather.includes('Sunny') ? (
                      <Sun className="w-3 h-3 text-amber-500" />
                    ) : item.weather.includes('Cloudy') ? (
                      <Cloud className="w-3 h-3 text-sky-400" />
                    ) : (
                      <CloudRain className="w-3 h-3 text-blue-500" />
                    )}
                    {item.weather.split('·')[0]}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <p className="font-medium text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    សង្ខេបការងារ:
                  </p>
                  <p className="line-clamp-2">{item.work_summary}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    រាយការណ៍ដោយ: <strong>{item.reporter_name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyTelegramFormat(item)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Telegram Format</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
