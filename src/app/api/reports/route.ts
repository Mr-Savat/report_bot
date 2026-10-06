import { NextRequest, NextResponse } from 'next/server';
import { saveReport, getReports, DailyReportData } from '@/lib/supabase';
import { formatReportTelegramMessage, sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  const reports = await getReports();
  return NextResponse.json({ success: true, reports });
}

export async function POST(req: NextRequest) {
  try {
    const body: DailyReportData = await req.json();

    // Basic validation
    if (!body.assigned_task || !body.report_date || !body.work_summary) {
      return NextResponse.json(
        { success: false, error: 'សូមបំពេញព័ត៌មានដែលចាំបាច់ (Task, Date, Work Summary)' },
        { status: 400 }
      );
    }

    // 1. Save to database
    const saveResult = await saveReport(body);
    if (!saveResult.success) {
      return NextResponse.json(
        { success: false, error: saveResult.error || 'បរាជ័យក្នុងការរក្សាទុក' },
        { status: 500 }
      );
    }

    // 2. Send Telegram notification if configured
    const message = formatReportTelegramMessage(body);
    const notifyResult = await sendTelegramMessage(message);

    return NextResponse.json({
      success: true,
      message: 'របាយការណ៍ត្រូវបានបញ្ជូនជោគជ័យ!',
      data: saveResult.data,
      telegramNotified: notifyResult.success,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'មានបញ្ហាបច្ចេកទេសក្នុងម៉ាស៊ីនបម្រើ' },
      { status: 500 }
    );
  }
}
