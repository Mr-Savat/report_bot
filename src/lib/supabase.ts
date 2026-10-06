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

export interface DailyReportData {
  id?: string;
  telegram_user_id: number;
  telegram_username?: string;
  reporter_name: string;
  assigned_task: string;
  report_date: string;
  weather: string;
  start_time: string;
  work_summary: string;
  quality_and_safety: string;
  issues_and_obstacles: string;
  tomorrows_plan: string;
  status: 'draft' | 'submitted' | 'approved';
  created_at?: string;
}

// Fallback in-memory storage for immediate testing before Supabase env is plugged in
const memoryReports: DailyReportData[] = [];

export async function saveReport(report: DailyReportData): Promise<{ success: boolean; data?: DailyReportData; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .insert([report])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: unknown) {
      console.error('Unexpected Supabase error:', err);
      return { success: false, error: String(err) };
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
