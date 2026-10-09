'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  Save, 
  Send, 
  Sun, 
  Cloud, 
  CloudRain, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { TelegramUser } from '@/types/telegram';

interface ReportFormProps {
  currentUser?: TelegramUser | null;
  onSubmitted?: () => void;
}

export default function ReportForm({ currentUser, onSubmitted }: ReportFormProps) {
  // Form States
  const [reporterName, setReporterName] = useState(() => {
    if (currentUser) {
      return `${currentUser.first_name} ${currentUser.last_name || ''}`.trim();
    }
    return '';
  });
  const [assignedTask, setAssignedTask] = useState('SAMPLE - Mobilization & site setup · TSK-SAMPLE-09-1');
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [weather, setWeather] = useState('មានពន្លឺថ្ងៃ · Sunny');
  const [startTime, setStartTime] = useState('07:00 AM');
  const [workSummary, setWorkSummary] = useState('');
  const [qualityAndSafety, setQualityAndSafety] = useState('ដំណើរការល្អប្រសើរ មានការត្រួតពិនិត្យត្រឹមត្រូវ');
  const [issuesAndObstacles, setIssuesAndObstacles] = useState('មិនមានការរាំងស្ទះដំណើរការងារនោះឡើយ');
  const [tomorrowsPlan, setTomorrowsPlan] = useState('រៀបចំសរសៃដែកគ្រឹះដាក់ចូល និងចាក់បេតុងសសរគ្រឹះ');

  // Sync reporter name when Telegram user loads
  useEffect(() => {
    if (currentUser && !reporterName) {
      const name = `${currentUser.first_name} ${currentUser.last_name || ''}`.trim();
      setReporterName(name);
    }
  }, [currentUser]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('cambo_bim_report_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.reporterName) setReporterName(parsed.reporterName);
        if (parsed.workSummary) setWorkSummary(parsed.workSummary);
        if (parsed.qualityAndSafety) setQualityAndSafety(parsed.qualityAndSafety);
        if (parsed.issuesAndObstacles) setIssuesAndObstacles(parsed.issuesAndObstacles);
        if (parsed.tomorrowsPlan) setTomorrowsPlan(parsed.tomorrowsPlan);
        if (parsed.assignedTask) setAssignedTask(parsed.assignedTask);
        if (parsed.weather) setWeather(parsed.weather);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleSaveDraft = () => {
    triggerHaptic('light');
    const draft = {
      reporterName,
      assignedTask,
      reportDate,
      weather,
      startTime,
      workSummary,
      qualityAndSafety,
      issuesAndObstacles,
      tomorrowsPlan,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('cambo_bim_report_draft', JSON.stringify(draft));
    setStatusMessage({
      type: 'info',
      text: '💾 បានរក្សាទុកក្នុងសេចក្តីព្រាង (Draft Saved) ដោយជោគជ័យ!',
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workSummary.trim()) {
      triggerHaptic('heavy');
      setStatusMessage({
        type: 'error',
        text: 'សូមបញ្ចូល "សង្ខេបការងារ (Work summary)" មុនពេលបញ្ជូន!',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    triggerHaptic('medium');

    const finalReporterName = reporterName.trim() ||
      (currentUser ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : 'វិស្វករការដ្ឋាន');

    const payload = {
      telegram_user_id: currentUser?.id || 0,
      telegram_username: currentUser?.username || '',
      reporter_name: finalReporterName,
      assigned_task: assignedTask,
      report_date: reportDate,
      weather,
      start_time: startTime,
      work_summary: workSummary,
      quality_and_safety: qualityAndSafety,
      issues_and_obstacles: issuesAndObstacles,
      tomorrows_plan: tomorrowsPlan,
      status: 'submitted' as const,
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        setStatusMessage({
          type: 'success',
          text: '🎉 របាយការណ៍ត្រូវបានបញ្ជូនជោគជ័យ! ទិន្នន័យត្រូវបានរក្សាទុក និងផ្ញើទៅកាន់ក្រុម Telegram។',
        });
        localStorage.removeItem('cambo_bim_report_draft');
        setWorkSummary('');
        if (onSubmitted) onSubmitted();
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (err: unknown) {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'មានបញ្ហាក្នុងការបញ្ជូនទិន្នន័យ',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-28 max-w-2xl mx-auto">
      {/* Toast Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : (
            <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 0. Reporter Name Field */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-2">
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          ឈ្មោះអ្នករាយការណ៍ <span className="text-rose-500">*</span>
          <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">
            Reporter name (ឈ្មោះវិស្វកររាយការណ៍)
          </span>
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="បញ្ចូលឈ្មោះរបស់អ្នក (ឧ. សុវត្ថិ ឬ Mr. Savat)"
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
          {currentUser?.username && (
            <span className="absolute right-3 text-[11px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200/50">
              @{currentUser.username}
            </span>
          )}
        </div>
      </div>

      {/* 1. Assigned Task Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-2">
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          ការងារដែលបានប្រគល់ <span className="text-rose-500">*</span>
          <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">
            Assigned task
          </span>
        </label>
        <div className="relative">
          <select
            value={assignedTask}
            onChange={(e) => setAssignedTask(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all appearance-none cursor-pointer"
          >
            <option value="SAMPLE - Mobilization & site setup · TSK-SAMPLE-09-1">
              SAMPLE - Mobilization & site setup · TSK-SAMPLE-09-1
            </option>
            <option value="Structural Framing & Rebar Inspection · TSK-STRUCT-01">
              Structural Framing & Rebar Inspection · TSK-STRUCT-01
            </option>
            <option value="HVAC & MEP Pipe Installation Level 2 · TSK-MEP-03">
              HVAC & MEP Pipe Installation Level 2 · TSK-MEP-03
            </option>
            <option value="Plastering & Tile Works Block B · TSK-FINISH-08">
              Plastering & Tile Works Block B · TSK-FINISH-08
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Admin · អាចគ្រប់គ្រងទាំងអស់ / Full access
        </p>
      </div>

      {/* 2. Date and Weather Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Date Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            កាលបរិច្ឆេទ <span className="text-rose-500">*</span>
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
              Report date
            </span>
          </label>
          <div className="relative flex items-center">
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Weather Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            អាកាសធាតុ
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
              Weather
            </span>
          </label>
          <div className="relative">
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden appearance-none cursor-pointer"
            >
              <option value="មានពន្លឺថ្ងៃ · Sunny">☀️ មានពន្លឺថ្ងៃ · Sunny</option>
              <option value="ពពក · Cloudy">☁️ ពពក · Cloudy</option>
              <option value="ភ្លៀង · Rainy">🌧️ ភ្លៀង · Rainy</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              {weather.includes('Sunny') ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : weather.includes('Cloudy') ? (
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Start Time */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-1.5">
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          ម៉ោងចាប់ផ្តើម
          <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
            Start time
          </span>
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="07:00 AM"
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <Clock className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
        </div>
      </div>

      {/* 4. Group Card: Today's Work (ការងារថ្ងៃនេះ) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 bg-sky-100 dark:bg-sky-950 rounded-lg text-sky-600 dark:text-sky-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold">ការងារថ្ងៃនេះ</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Today&apos;s work</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            សង្ខេបការងារ <span className="text-rose-500">*</span>
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
              Work summary
            </span>
          </label>
          <textarea
            rows={3}
            value={workSummary}
            onChange={(e) => setWorkSummary(e.target.value)}
            placeholder="ការងារ ទីតាំង និងបរិមាណ / Work, location and quantity..."
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 5. Group Card: Safety & Next Steps (សុវត្ថិភាព និងផែនការ) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold">សុវត្ថិភាព និងផែនការ</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Safety & next steps</p>
          </div>
        </div>

        {/* Quality & Safety */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            គុណភាព និងសុវត្ថិភាព
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
              Quality & safety
            </span>
          </label>
          <textarea
            rows={2}
            value={qualityAndSafety}
            onChange={(e) => setQualityAndSafety(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none transition-all"
          />
        </div>

        {/* Issues & Obstacles */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            បញ្ហា / ឧបសគ្គ
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
              Issues & obstacles
            </span>
          </label>
          <textarea
            rows={2}
            value={issuesAndObstacles}
            onChange={(e) => setIssuesAndObstacles(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none transition-all"
          />
        </div>

        {/* Tomorrow's Plan */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            ផែនការថ្ងៃស្អែក
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
              Tomorrow&apos;s plan
            </span>
          </label>
          <textarea
            rows={2}
            value={tomorrowsPlan}
            onChange={(e) => setTomorrowsPlan(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none transition-all"
          />
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>រក្សាទុក · Draft</span>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>កំពុងបញ្ជូន...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>បញ្ជូន · Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
