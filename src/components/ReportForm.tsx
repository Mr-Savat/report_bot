'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Laptop,
  Briefcase,
  Save, 
  Send, 
  Camera,
  Sparkles,
  Loader2,
  X,
  Trash2,
  TrendingUp,
  FileText,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';
import { TelegramUser } from '@/types/telegram';
import StatusModal from './StatusModal';
import CustomDropdown, { DropdownOption } from './CustomDropdown';
import { ReportImage } from '@/lib/supabase';

// QB Tech Solution Project Catalog
const PROJECT_OPTIONS: DropdownOption[] = [
  {
    value: 'School Management System · PRJ-SMS-01',
    label: 'School Management System (SMS)',
    code: 'PRJ-SMS-01',
  },
  {
    value: 'Telegram Bot & Automation · PRJ-BOT-02',
    label: 'Telegram Bot & Daily Report Bot',
    code: 'PRJ-BOT-02',
  },
  {
    value: 'Web & Client Management Portal · PRJ-WEB-03',
    label: 'Web & Client Management Portal',
    code: 'PRJ-WEB-03',
  },
  {
    value: 'Backend API & Database Microservices · PRJ-API-04',
    label: 'Backend API & Database Microservices',
    code: 'PRJ-API-04',
  },
  {
    value: 'UI/UX Design System & Prototyping · PRJ-UIX-05',
    label: 'UI/UX Design System & Figma Prototyping',
    code: 'PRJ-UIX-05',
  },
  {
    value: 'DevOps, Cloud Server & CI/CD · PRJ-OPS-06',
    label: 'DevOps, Cloud Server & CI/CD Pipeline',
    code: 'PRJ-OPS-06',
  },
  {
    value: 'Internal Tools & IT System Support · PRJ-IT-07',
    label: 'Internal Tools & IT Support',
    code: 'PRJ-IT-07',
  },
];

// Tech Task Modules
const TASK_OPTIONS: DropdownOption[] = [
  {
    value: 'Frontend UI & Component Implementation · TSK-FE-01',
    label: 'Frontend UI & Component Implementation',
    code: 'TSK-FE-01',
  },
  {
    value: 'Backend API & Database Integration · TSK-BE-02',
    label: 'Backend API & Database Integration',
    code: 'TSK-BE-02',
  },
  {
    value: 'Telegram Mini App Flow & Bot Optimization · TSK-BOT-03',
    label: 'Telegram Mini App Flow & Bot Optimization',
    code: 'TSK-BOT-03',
  },
  {
    value: 'Authentication & Role Security Audit · TSK-AUTH-04',
    label: 'Authentication & Role Security Audit',
    code: 'TSK-AUTH-04',
  },
  {
    value: 'Bug Fixing & System Testing (QA) · TSK-QA-05',
    label: 'Bug Fixing & System Testing (QA)',
    code: 'TSK-QA-05',
  },
  {
    value: 'Database Migration & Performance Tuning · TSK-DB-06',
    label: 'Database Migration & Performance Tuning',
    code: 'TSK-DB-06',
  },
  {
    value: 'Code Review & Architecture Refactoring · TSK-ARCH-07',
    label: 'Code Review & Architecture Refactoring',
    code: 'TSK-ARCH-07',
  },
];

const WORK_HOURS_OPTIONS = [
  '8 ម៉ោង (Full-time ពេញម៉ោង)',
  '4 ម៉ោង (Half-time កន្លះថ្ងៃ)',
  '10 ម៉ោង (Full-time + OT ថែមម៉ោង)',
  'Remote / WFH (ធ្វើការពីផ្ទះ)',
  'On-site Office (ការិយាល័យ)',
];

interface FormImageItem extends ReportImage {
  name?: string;
}

interface ReportFormProps {
  currentUser?: TelegramUser | null;
  onSubmitted?: () => void;
}

export default function ReportForm({ currentUser, onSubmitted }: ReportFormProps) {
  const workSummaryRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States tailored for QB Tech Solution
  const [reporterName, setReporterName] = useState(() => {
    if (currentUser) {
      return `${currentUser.first_name} ${currentUser.last_name || ''}`.trim();
    }
    return '';
  });
  const [projectName, setProjectName] = useState('School Management System · PRJ-SMS-01');
  const [assignedTask, setAssignedTask] = useState('Frontend UI & Component Implementation · TSK-FE-01');
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [workHours, setWorkHours] = useState('8 ម៉ោង (Full-time ពេញម៉ោង)');
  const [plannedProgress, setPlannedProgress] = useState<number>(100);
  const [actualProgress, setActualProgress] = useState<number>(85);
  const [workSummary, setWorkSummary] = useState('');
  const [issuesAndObstacles, setIssuesAndObstacles] = useState('មិនមានបញ្ហារាំងស្ទះដំណើរការឡើយ (No blockers)');
  const [tomorrowsPlan, setTomorrowsPlan] = useState('បន្ត Sprint task បន្ទាប់ និងធ្វើការ Test E2E លើប្រព័ន្ធ');
  const [images, setImages] = useState<FormImageItem[]>([]);

  // Sync reporter name when Telegram user loads or from stored preference
  useEffect(() => {
    if (currentUser) {
      const name = `${currentUser.first_name} ${currentUser.last_name || ''}`.trim();
      if (name) {
        setReporterName(name);
        try {
          localStorage.setItem('qb_reporter_name', name);
        } catch {}
      }
    } else {
      try {
        const saved = localStorage.getItem('qb_reporter_name');
        if (saved && !reporterName) setReporterName(saved);
      } catch {}
    }
  }, [currentUser]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('qb_report_draft');
      if (savedDraft) {
        setHasSavedDraft(true);
        const parsed = JSON.parse(savedDraft);
        if (parsed.reporterName) setReporterName(parsed.reporterName);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.assignedTask) setAssignedTask(parsed.assignedTask);
        if (parsed.reportDate) setReportDate(parsed.reportDate);
        if (parsed.workHours) setWorkHours(parsed.workHours);
        if (parsed.plannedProgress !== undefined) setPlannedProgress(Number(parsed.plannedProgress));
        if (parsed.actualProgress !== undefined) setActualProgress(Number(parsed.actualProgress));
        if (parsed.workSummary) setWorkSummary(parsed.workSummary);
        if (parsed.issuesAndObstacles) setIssuesAndObstacles(parsed.issuesAndObstacles);
        if (parsed.tomorrowsPlan) setTomorrowsPlan(parsed.tomorrowsPlan);
        if (Array.isArray(parsed.images)) setImages(parsed.images);
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

  const handleClearDraft = () => {
    try {
      localStorage.removeItem('qb_report_draft');
      setHasSavedDraft(false);
      setWorkSummary('');
      setImages([]);
      triggerHaptic('light');
      setStatusMessage({
        type: 'info',
        text: '🗑️ បានសម្អាតសេចក្តីព្រាង (Draft Cleared) រួចរាល់!',
      });
      setTimeout(() => setStatusMessage(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveDraft = () => {
    triggerHaptic('light');
    try {
      const draft = {
        reporterName,
        projectName,
        assignedTask,
        reportDate,
        workHours,
        plannedProgress,
        actualProgress,
        workSummary,
        issuesAndObstacles,
        tomorrowsPlan,
        images,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('qb_report_draft', JSON.stringify(draft));
      setHasSavedDraft(true);
      setStatusMessage({
        type: 'info',
        text: '💾 បានរក្សាទុកក្នុងសេចក្តីព្រាង (Draft Saved) ដោយជោគជ័យ!',
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({
        type: 'error',
        text: '⚠️ មិនអាចរក្សាទុកព្រាងបាន (ទំហំរូបភាពធំពេក សូមបន្ថយចំនួនរូប)',
      });
    }
  };

  // Helper to compress image client-side for fast & lightweight transmission
  const compressImage = (file: File): Promise<{ base64Url: string; sizeStr: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 1280;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            const approxBytes = Math.round((compressed.length * 3) / 4);
            const sizeStr = approxBytes > 1024 * 1024
              ? `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(approxBytes / 1024)} KB`;
            resolve({ base64Url: compressed, sizeStr });
          } else {
            const raw = e.target?.result as string;
            resolve({ base64Url: raw, sizeStr: `${Math.round(file.size / 1024)} KB` });
          }
        };
        img.onerror = () => {
          const raw = e.target?.result as string;
          resolve({ base64Url: raw, sizeStr: `${Math.round(file.size / 1024)} KB` });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const [isDragging, setIsDragging] = useState(false);

  // Helper to process files from either file input or drag-and-drop with duplicate check & compression
  const processFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validImageFiles = fileList.filter((f) => f.type.startsWith('image/'));

    if (validImageFiles.length === 0) {
      triggerHaptic('heavy');
      setStatusMessage({
        type: 'error',
        text: 'សូមជ្រើសរើសឯកសារជាប្រភេទរូបភាព (Image files) ប៉ុណ្ណោះ!',
      });
      return;
    }

    // 1. Prevent duplicate images: check by file name and size
    const nonDuplicateFiles: File[] = [];
    const duplicateNames: string[] = [];

    validImageFiles.forEach((file) => {
      const isDuplicate = images.some((existing) => existing.name === file.name);
      if (isDuplicate) {
        duplicateNames.push(file.name);
      } else {
        nonDuplicateFiles.push(file);
      }
    });

    if (duplicateNames.length > 0) {
      triggerHaptic('medium');
      setStatusMessage({
        type: 'info',
        text: `⚠️ បានរំលងរូបភាព ${duplicateNames.length} សន្លឹកដោយសារមានរួចហើយ (Skipped duplicate images)`,
      });
    }

    if (nonDuplicateFiles.length === 0) return;

    // 2. Check remaining slots (up to 6)
    const remainingSlots = 6 - images.length;
    if (remainingSlots <= 0) {
      triggerHaptic('heavy');
      setStatusMessage({
        type: 'error',
        text: 'អតិបរមា 6 រូបភាពប៉ុណ្ណោះ! សូមលុបរូបភាពចាស់ចេញមួយចំនួនសិន។',
      });
      return;
    }

    const filesToProcess = nonDuplicateFiles.slice(0, remainingSlots);

    filesToProcess.forEach(async (file, index) => {
      const { base64Url, sizeStr } = await compressImage(file);
      const newImage: FormImageItem = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${index}`,
        url: base64Url,
        name: file.name,
        size: sizeStr,
        caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      };

      setImages((prev) => {
        // Prevent concurrent duplicate insertion
        if (prev.some((img) => img.name === file.name)) return prev;
        if (prev.length >= 6) return prev;
        return [...prev, newImage];
      });
      triggerHaptic('light');
    });

    // Reset input so file can be re-selected if user explicitly removes and re-adds
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveImage = (id: string) => {
    triggerHaptic('medium');
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

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
      (currentUser ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : 'QB Tech Engineer');

    const payload = {
      telegram_user_id: currentUser?.id || 0,
      telegram_username: currentUser?.username || '',
      reporter_name: finalReporterName,
      project_name: projectName,
      assigned_task: assignedTask,
      report_date: reportDate,
      work_hours: workHours,
      planned_progress: plannedProgress,
      actual_progress: actualProgress,
      work_summary: workSummary,
      issues_and_obstacles: issuesAndObstacles,
      tomorrows_plan: tomorrowsPlan,
      images: images,
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
          text: '🎉 របាយការណ៍បច្ចេកវិទ្យាត្រូវបានបញ្ជូនជោគជ័យ! ទិន្នន័យត្រូវបានរក្សាទុកក្នុងប្រព័ន្ធ និងផ្ញើទៅកាន់ក្រុម Telegram រួចរាល់។',
        });
        localStorage.removeItem('qb_report_draft');
        setHasSavedDraft(false);
        setWorkSummary('');
        setImages([]);
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
    <form onSubmit={handleSubmit} className="w-full space-y-4 pb-28">
      {/* Reusable Status Modal */}
      <StatusModal
        isOpen={Boolean(statusMessage && (statusMessage.type === 'success' || statusMessage.type === 'error'))}
        type={statusMessage?.type || 'info'}
        message={statusMessage?.text || ''}
        onClose={() => setStatusMessage(null)}
        primaryButtonText={statusMessage?.type === 'success' ? '✅ រួចរាល់ (បិទកម្មវិធី)' : 'យល់ព្រម (ត្រឡប់ទៅបំពេញ)'}
        onPrimaryClick={() => {
          if (statusMessage?.type === 'success') {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
              window.Telegram.WebApp.close();
            } else {
              setStatusMessage(null);
            }
          } else {
            setStatusMessage(null);
            setTimeout(() => {
              workSummaryRef.current?.focus();
            }, 150);
          }
        }}
        secondaryButtonText={statusMessage?.type === 'success' ? '📝 បំពេញរបាយការណ៍ថ្មី' : undefined}
        onSecondaryClick={() => setStatusMessage(null)}
      />

      {/* Floating Pill Toast for Draft Saved (Info) */}
      {statusMessage && statusMessage.type === 'info' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. General Tech Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            ព័ត៌មានគម្រោង និងអ្នករាយការណ៍ · Project & Developer Info
          </h2>
        </div>

        {/* 2-column: Reporter & Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reporter Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                ឈ្មោះវិស្វករ / Developer <span className="text-rose-500">*</span>
              </label>
              {currentUser && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Auto-filled from Telegram
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={reporterName}
                onChange={(e) => {
                  setReporterName(e.target.value);
                  try {
                    localStorage.setItem('qb_reporter_name', e.target.value);
                  } catch {}
                }}
                placeholder="ឈ្មោះអ្នករាយការណ៍..."
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
              {currentUser?.username && (
                <span className="absolute right-3 text-[11px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200/50">
                  @{currentUser.username}
                </span>
              )}
            </div>
          </div>

          {/* Project Selection (Custom Dropdown) */}
          <CustomDropdown
            label="គម្រោងបច្ចេកវិទ្យា (Project)"
            required
            options={PROJECT_OPTIONS}
            value={projectName}
            onChange={setProjectName}
          />
        </div>

        {/* Task & Date & Work Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
          {/* Assigned Task (Custom Dropdown) */}
          <div className="sm:col-span-1">
            <CustomDropdown
              label="ភារកិច្ចទទួលបន្ទុក (Task Module)"
              required
              options={TASK_OPTIONS}
              value={assignedTask}
              onChange={setAssignedTask}
            />
          </div>

          {/* Report Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              កាលបរិច្ឆេទ <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Work Hours Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              ម៉ោងធ្វើការ / Work Hours
            </label>
            <div className="relative">
              <select
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden appearance-none cursor-pointer"
              >
                {WORK_HOURS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* 2-column Progress % Tracking (Planned vs Actual) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              វឌ្ឍនភាពការងារ · Progress Tracking (%)
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              សម្រេច: <strong className="text-blue-600 dark:text-blue-400">{actualProgress}%</strong> / គ្រោង {plannedProgress}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Planned Progress */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                វឌ្ឍនភាពគ្រោង % <span className="text-slate-400">(Planned)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={plannedProgress}
                  onChange={(e) => setPlannedProgress(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>

            {/* Actual Progress */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                វឌ្ឍនភាពជាក់ស្តែង % <span className="text-slate-400">(Actual)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={actualProgress}
                  onChange={(e) => setActualProgress(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="absolute right-3 text-xs text-blue-500 font-semibold">%</span>
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, actualProgress))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Work Attachments / Screenshots Card (Exact Layout as Sample Video) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-950/80 rounded-lg text-blue-600 dark:text-blue-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                រូបភាពការងារ & Screenshots · Work Attachments
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {images.length} / 6
          </span>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Upload Dropzone Box (Drag & Drop + Click) */}
        {images.length < 6 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                processFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
              isDragging
                ? 'border-blue-500 bg-blue-100/70 dark:bg-blue-900/40 scale-[1.01] ring-2 ring-blue-500/30'
                : 'border-blue-200 dark:border-blue-900/60 hover:border-blue-500 dark:hover:border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70'
            }`}
          >
            <div className={`p-2.5 rounded-full transition-transform ${
              isDragging
                ? 'bg-blue-600 text-white scale-110'
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 group-hover:scale-105'
            }`}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
              {isDragging ? 'ទម្លាក់រូបភាពនៅទីនេះ · Drop photos here' : 'បន្ថែមរូបភាព · Add photos'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              អូសទម្លាក់ (Drag & Drop) ឬចុចដើម្បីជ្រើសរើស Camera / Gallery
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              អតិបរមា 6 រូបភាព · មិនស្ទួនរូបភាព (Auto duplicate filter)
            </p>
          </div>
        )}

        {/* 2-Column Attached Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700/80 space-y-2 relative group"
              >
                {/* Thumbnail with Delete Button */}
                <div className="relative w-full aspect-video sm:h-36 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={img.url}
                    alt={img.caption || 'Attachment'}
                    className="w-full h-full object-cover"
                  />
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    title="លុបរូបភាព"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Caption Input */}
                <input
                  type="text"
                  value={img.caption || ''}
                  onChange={(e) => handleUpdateCaption(img.id, e.target.value)}
                  placeholder="ពិពណ៌នារូបភាព (ឧ. UI Dashboard)..."
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />

                {/* File size & Ready status */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-0.5">
                  <span>{img.size || 'image'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ រង់ចាំរក្សាទុក / Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Today's Tech Work Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="p-1.5 bg-sky-100 dark:bg-sky-950/80 rounded-lg text-sky-600 dark:text-sky-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              សង្ខេបការងារថ្ងៃនេះ · Work Summary
            </h2>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            ពិពណ៌នាការងារជាក់ស្តែង <span className="text-rose-500">*</span>
          </label>
          <textarea
            ref={workSummaryRef}
            rows={4}
            value={workSummary}
            onChange={(e) => setWorkSummary(e.target.value)}
            placeholder="បញ្ចូលព័ត៌មានលម្អិតពីការងារដែលបានអនុវត្ត (ឧទាហរណ៍៖ បញ្ចប់ UI Dashboard, រៀបចំ API Endpoints, សរសេរ Unit Test, ដោះស្រាយ Hydration bugs)..."
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 4. Blockers & Tomorrow's Plan Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Laptop className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              ឧបសគ្គបច្ចេកទេស និងផែនការបន្ត · Blockers & Next Sprint Plan
            </h2>
          </div>
        </div>

        {/* 2 columns: Issues & Next Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Issues & Blockers */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              បញ្ហា និងឧបសគ្គបច្ចេកទេស · Issues & Blockers
            </label>
            <textarea
              rows={3}
              value={issuesAndObstacles}
              onChange={(e) => setIssuesAndObstacles(e.target.value)}
              placeholder="បញ្ហា bugs, dependency errors ឬឧបសគ្គរាំងស្ទះ..."
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none transition-all"
            />
          </div>

          {/* Tomorrow's Plan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              ផែនការបន្តសម្រាប់ថ្ងៃស្អែក · Tomorrow&apos;s Sprint Plan
            </label>
            <textarea
              rows={3}
              value={tomorrowsPlan}
              onChange={(e) => setTomorrowsPlan(e.target.value)}
              placeholder="កិច្ចការបន្ទាប់ដែលត្រូវបំពេញថ្ងៃស្អែក..."
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-end gap-3 px-2 sm:px-4">
          {/* Clear Draft Button (visible if saved draft exists) */}
          {hasSavedDraft && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-medium text-xs sm:text-sm transition-all cursor-pointer active:scale-98"
              title="លុបសេចក្តីព្រាង"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">លុបព្រាង</span>
            </button>
          )}

          {/* Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>រក្សាទុកព្រាង</span>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 disabled:opacity-60 transition-all cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>កំពុងបញ្ជូន...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>បញ្ជូនរបាយការណ៍</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
