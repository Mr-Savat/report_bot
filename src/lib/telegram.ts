import crypto from 'crypto';
import { DailyReportData } from './supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

/**
 * Validate Telegram initData from Mini App to ensure it wasn't forged
 */
export function verifyTelegramInitData(initData: string, botToken: string = TELEGRAM_BOT_TOKEN): boolean {
  if (!initData || !botToken) return false;

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    urlParams.delete('hash');

    // Sort keys alphabetically
    const paramsList: string[] = [];
    Array.from(urlParams.keys())
      .sort()
      .forEach((key) => {
        paramsList.push(`${key}=${urlParams.get(key)}`);
      });

    const dataCheckString = paramsList.join('\n');

    // Create secret key using bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate HMAC-SHA256
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (err) {
    console.error('Error validating Telegram initData:', err);
    return false;
  }
}

/**
 * Send a notification message to a Telegram chat or group
 */
export async function sendTelegramMessage(text: string, chatId: string = TELEGRAM_CHAT_ID, parseMode: 'HTML' | 'MarkdownV2' = 'HTML') {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn('Telegram Bot Token or Chat ID not configured. Message:', text);
    return { success: false, reason: 'missing_credentials' };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    const data = await res.json();
    return { success: data.ok, data };
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Format a daily report into an aesthetic Telegram notification
 */
export function formatReportTelegramMessage(report: DailyReportData): string {
  const weatherEmoji = 
    report.weather.includes('sunny') ? '☀️' : 
    report.weather.includes('cloudy') ? '☁️' : 
    report.weather.includes('rainy') ? '🌧️' : '⛅';

  return `
📋 <b>របាយការណ៍ការងារប្រចាំថ្ងៃ (DAILY SITE REPORT)</b>
━━━━━━━━━━━━━━━━━━━━
👷 <b>អ្នករាយការណ៍:</b> ${report.reporter_name} ${report.telegram_username ? `(@${report.telegram_username})` : ''}
📌 <b>ការងារ / Task:</b> ${report.assigned_task}
📅 <b>កាលបរិច្ឆេទ:</b> ${report.report_date}
${weatherEmoji} <b>អាកាសធាតុ:</b> ${report.weather}
⏰ <b>ម៉ោងចាប់ផ្តើម:</b> ${report.start_time}

🛠️ <b>សង្ខេបការងារថ្ងៃនេះ:</b>
${report.work_summary}

🛡️ <b>គុណភាព និងសុវត្ថិភាព:</b>
${report.quality_and_safety || 'ដំណើរការល្អប្រសើរ'}

⚠️ <b>បញ្ហា / ឧបសគ្គ:</b>
${report.issues_and_obstacles || 'មិនមានបញ្ហារាំងស្ទះឡើយ'}

🔮 <b>ផែនការថ្ងៃស្អែក:</b>
${report.tomorrows_plan || 'បន្តការងារតាមកាលវិភាគ'}

━━━━━━━━━━━━━━━━━━━━
<i>រាយការណ៍តាម Cambo BIM Access Bot</i>
`.trim();
}
