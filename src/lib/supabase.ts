import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-url')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface ReportImage {
  id: string;
  url: string;
  caption?: string;
  size?: string;
}

export interface DailyReportData {
  id?: string;
  telegram_user_id: number;
  telegram_username?: string;
  reporter_name: string;
  project_name?: string;
  assigned_task: string;
  report_date: string;
  work_hours?: string;
  planned_progress?: number;
  actual_progress?: number;
  work_summary: string;
  quality_and_safety?: string;
  issues_and_obstacles?: string;
  tomorrows_plan?: string;
  images?: ReportImage[];
  status: 'draft' | 'submitted' | 'approved';
  created_at?: string;
  weather?: string;
  start_time?: string;
}

// Fallback in-memory storage for immediate testing before Supabase env is plugged in
const memoryReports: DailyReportData[] = [];

export async function saveReport(report: DailyReportData): Promise<{ success: boolean; data?: DailyReportData; error?: string }> {
  if (supabase) {
    try {
      // Clean mapping to match existing Supabase daily_reports table columns
      const dbPayload = {
        telegram_user_id: report.telegram_user_id,
        telegram_username: report.telegram_username || '',
        reporter_name: report.reporter_name,
        assigned_task: report.project_name
          ? `[${report.project_name}] ${report.assigned_task}`
          : report.assigned_task,
        report_date: report.report_date,
        weather: report.work_hours || report.weather || '8 ម៉ោង (Full-time)',
        start_time: (report.actual_progress !== undefined || report.planned_progress !== undefined)
          ? `សម្រេច ${report.actual_progress ?? 0}% (គ្រោង ${report.planned_progress ?? 100}%)`
          : (report.start_time || '08:00 AM'),
        work_summary: report.work_summary,
        quality_and_safety: report.images && report.images.length > 0
          ? `📸 ភ្ជាប់រូបភាព ${report.images.length} សន្លឹក`
          : (report.quality_and_safety || 'ដំណើរការល្អប្រសើរ'),
        issues_and_obstacles: report.issues_and_obstacles || 'មិនមានបញ្ហារាំងស្ទះឡើយ',
        tomorrows_plan: report.tomorrows_plan || '',
        status: report.status || 'submitted',
      };

      const { data, error } = await supabase
        .from('daily_reports')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert warning (falling back to memory):', error.message);
        const recordWithId = {
          ...report,
          id: `fallback-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        memoryReports.unshift(recordWithId);
        return { success: true, data: recordWithId };
      }
      const completeRecord: DailyReportData = {
        ...report,
        ...data,
        images: report.images || [],
      };
      memoryReports.unshift(completeRecord);
      return { success: true, data: completeRecord };
    } catch (err: unknown) {
      console.warn('Supabase request timeout/error (falling back to memory):', err);
      const recordWithId = {
        ...report,
        id: `fallback-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      memoryReports.unshift(recordWithId);
      return { success: true, data: recordWithId };
    }
  }

  // Fallback demo storage
  const recordWithId = {
    ...report,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  memoryReports.unshift(recordWithId);
  return { success: true, data: recordWithId };
}

export async function getReports(): Promise<DailyReportData[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        return memoryReports;
      }
      return data || [];
    } catch (err) {
      console.error('Supabase fetch error:', err);
      return memoryReports;
    }
  }
  return memoryReports;
}
