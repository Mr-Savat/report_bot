import crypto from 'crypto';
import { DailyReportData, ReportImage } from './supabase';

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
 * Send attached photos/screenshots directly into Telegram chat/group
 */
export async function sendTelegramPhotos(
  images: ReportImage[],
  chatId: string = TELEGRAM_CHAT_ID,
  replyToMessageId?: number
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN || !chatId || !images || images.length === 0) {
    return { success: false, error: 'No images or missing credentials' };
  }

  try {
    // If exactly 1 photo, send via sendPhoto
    if (images.length === 1) {
      const img = images[0];
      const formData = new FormData();
      formData.append('chat_id', chatId);
      if (replyToMessageId) {
        formData.append('reply_to_message_id', String(replyToMessageId));
        formData.append('allow_sending_without_reply', 'true');
      }
      if (img.caption) {
        formData.append('caption', `📸 <b>${img.caption}</b>`);
        formData.append('parse_mode', 'HTML');
      }

      if (img.url.startsWith('data:image/')) {
        const base64Data = img.url.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const mimeMatch = img.url.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const blob = new Blob([buffer], { type: mimeType });
        formData.append('photo', blob, 'attachment.jpg');
      } else {
        formData.append('photo', img.url);
      }

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      return { success: data.ok, data };
    }

    // Multiple photos (2-10): send via sendMediaGroup
    const formData = new FormData();
    formData.append('chat_id', chatId);
    if (replyToMessageId) {
      formData.append('reply_to_message_id', String(replyToMessageId));
      formData.append('allow_sending_without_reply', 'true');
    }

    const mediaList = images.map((img, idx) => {
      const isBase64 = img.url.startsWith('data:image/');
      const mediaItem: Record<string, unknown> = {
        type: 'photo',
        media: isBase64 ? `attach://photo_${idx}` : img.url,
      };
      if (img.caption) {
        mediaItem.caption = `📸 <b>${img.caption}</b>`;
        mediaItem.parse_mode = 'HTML';
      }
      return mediaItem;
    });

    formData.append('media', JSON.stringify(mediaList));

    images.forEach((img, idx) => {
      if (img.url.startsWith('data:image/')) {
        const base64Data = img.url.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const mimeMatch = img.url.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const blob = new Blob([buffer], { type: mimeType });
        formData.append(`photo_${idx}`, blob, `photo_${idx}.jpg`);
      }
    });

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    // Fallback: if sendMediaGroup fails (e.g. invalid group format), send individually
    if (!data.ok) {
      console.warn('sendMediaGroup warning, fallback to sendPhoto:', data.description);
      for (const img of images) {
        const singleForm = new FormData();
        singleForm.append('chat_id', chatId);
        if (replyToMessageId) {
          singleForm.append('reply_to_message_id', String(replyToMessageId));
          singleForm.append('allow_sending_without_reply', 'true');
        }
        if (img.caption) {
          singleForm.append('caption', `📸 <b>${img.caption}</b>`);
          singleForm.append('parse_mode', 'HTML');
        }
        if (img.url.startsWith('data:image/')) {
          const base64Data = img.url.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const mimeMatch = img.url.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const blob = new Blob([buffer], { type: mimeType });
          singleForm.append('photo', blob, 'attachment.jpg');
        } else {
          singleForm.append('photo', img.url);
        }

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: singleForm,
        });
      }
    }

    return { success: true, data };
  } catch (err) {
    console.error('Failed to send Telegram photos:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Send daily report to Telegram as ONE single unified message (photo with caption, or text if no photo)
 */
export async function sendTelegramReport(
  report: DailyReportData,
  chatId: string = TELEGRAM_CHAT_ID
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn('Telegram Bot Token or Chat ID not configured');
    return { success: false, error: 'missing_credentials' };
  }

  const messageText = formatReportTelegramMessage(report);
  const images = report.images || [];

  // 1. If NO photos: send single text message
  if (images.length === 0) {
    return sendTelegramMessage(messageText, chatId);
  }

  // 2. If there ARE photos: send photo(s) with full report as caption in ONE single message
  try {
    // Ensure caption fits in Telegram's 1024 character limit safely
    let captionText = messageText;
    if (captionText.length > 1024) {
      // If text is unusually long, send as text card first, then attach photos without breaking HTML tags
      const textRes = await sendTelegramMessage(messageText, chatId);
      const msgId = (textRes.data as { result?: { message_id?: number } })?.result?.message_id;
      return sendTelegramPhotos(images, chatId, msgId);
    }

    // Single photo case: 1 message with photo + report caption
    if (images.length === 1) {
      const img = images[0];
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', captionText);
      formData.append('parse_mode', 'HTML');

      if (img.url.startsWith('data:image/')) {
        const base64Data = img.url.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const mimeMatch = img.url.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const blob = new Blob([buffer], { type: mimeType });
        formData.append('photo', blob, 'report_photo.jpg');
      } else {
        formData.append('photo', img.url);
      }

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.ok) return { success: true, data };
      console.warn('sendPhoto with caption failed:', data.description);
    }

    // Multiple photos case: 1 media group post with report caption on 1st photo
    if (images.length > 1) {
      const formData = new FormData();
      formData.append('chat_id', chatId);

      const mediaList = images.map((img, idx) => {
        const isBase64 = img.url.startsWith('data:image/');
        const mediaItem: Record<string, unknown> = {
          type: 'photo',
          media: isBase64 ? `attach://photo_${idx}` : img.url,
        };
        // Put the full report card as caption on the first photo of the album
        if (idx === 0) {
          mediaItem.caption = captionText;
          mediaItem.parse_mode = 'HTML';
        }
        return mediaItem;
      });

      formData.append('media', JSON.stringify(mediaList));

      images.forEach((img, idx) => {
        if (img.url.startsWith('data:image/')) {
          const base64Data = img.url.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const mimeMatch = img.url.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const blob = new Blob([buffer], { type: mimeType });
          formData.append(`photo_${idx}`, blob, `photo_${idx}.jpg`);
        }
      });

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.ok) return { success: true, data };
      console.warn('sendMediaGroup failed:', data.description);
    }

    // Fallback: send text message if photo caption rejected
    return sendTelegramMessage(messageText, chatId);
  } catch (err) {
    console.error('Error sending unified Telegram report:', err);
    return sendTelegramMessage(messageText, chatId);
  }
}

/**
 * Helper to escape HTML characters so Telegram HTML parser doesn't break
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render visual progress bar for Telegram (e.g. ▰▰▰▰▰▰▰▰▱▱ 85%)
 */
function renderProgressBar(percent: number): string {
  const totalBars = 10;
  const clamped = Math.min(100, Math.max(0, percent));
  const filledBars = Math.round(clamped / 10);
  const emptyBars = totalBars - filledBars;
  return '▰'.repeat(filledBars) + '▱'.repeat(emptyBars);
}

/**
 * Format a daily report into an aesthetic Telegram notification for QB Tech Solution
 */
export function formatReportTelegramMessage(report: DailyReportData): string {
  // Make reporter name clickable to their Telegram profile
  const reporterLink = report.telegram_user_id && report.telegram_user_id > 0
    ? `<a href="tg://user?id=${report.telegram_user_id}"><b>${escapeHtml(report.reporter_name)}</b></a>`
    : `<b>${escapeHtml(report.reporter_name)}</b>`;

  const usernameTag = report.telegram_username ? ` (@${escapeHtml(report.telegram_username)})` : '';

  // Project formatting with badge code
  let projectFormatted = '';
  if (report.project_name) {
    const parts = report.project_name.split('·').map(s => s.trim());
    if (parts.length > 1) {
      projectFormatted = `💻 <b>គម្រោង:</b> ${escapeHtml(parts[0])} <code>[${escapeHtml(parts[1])}]</code>\n`;
    } else {
      projectFormatted = `💻 <b>គម្រោង:</b> ${escapeHtml(report.project_name)}\n`;
    }
  }

  // Task formatting with badge code
  let taskFormatted = '';
  if (report.assigned_task) {
    const parts = report.assigned_task.split('·').map(s => s.trim());
    if (parts.length > 1) {
      taskFormatted = `📌 <b>ភារកិច្ច:</b> ${escapeHtml(parts[0])} <code>[${escapeHtml(parts[1])}]</code>\n`;
    } else {
      taskFormatted = `📌 <b>ភារកិច្ច:</b> ${escapeHtml(report.assigned_task)}\n`;
    }
  }

  // Work Hours
  const hoursText = report.work_hours
    ? report.work_hours.split('(')[0].trim()
    : (report.weather ? report.weather.split('(')[0].trim() : '8 ម៉ោង');

  // Progress Bar
  const actualProg = report.actual_progress !== undefined ? Number(report.actual_progress) : 0;
  const plannedProg = report.planned_progress !== undefined ? Number(report.planned_progress) : 100;
  const progressBar = renderProgressBar(actualProg);

  // Attachments Summary (clean, no raw filenames)
  const imageCount = report.images ? report.images.length : 0;
  const attachmentsLine = imageCount > 0
    ? `\n📸 <b>រូបភាពភស្តុតាង:</b> ${imageCount} សន្លឹក (ភ្ជាប់ខាងលើ)\n`
    : '';

  // Safe length for summary to guarantee under Telegram 1024-char caption limit
  const safeSummary = escapeHtml(report.work_summary.length > 400 ? report.work_summary.slice(0, 397) + '...' : report.work_summary);
  const safeObstacles = escapeHtml((report.issues_and_obstacles || 'មិនមានបញ្ហារាំងស្ទះដំណើរការឡើយ (No blockers)').slice(0, 200));
  const safeTomorrow = escapeHtml((report.tomorrows_plan || 'បន្ត Sprint task បន្ទាប់ និងធ្វើការ Test E2E').slice(0, 200));

  return `
🚀 <b>DAILY TECH REPORT · QB TECH SOLUTION</b>
━━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>វិស្វករ:</b> ${reporterLink}${usernameTag}
${projectFormatted}${taskFormatted}📅 <b>កាលបរិច្ឆេទ:</b> ${report.report_date} · ⏱️ <b>${hoursText}</b>

📊 <b>វឌ្ឍនភាពការងារ:</b>
${progressBar} <b>${actualProg}%</b> (គោលដៅ: ${plannedProg}%)

🛠️ <b>លទ្ធផលសម្រេចបាន:</b>
<blockquote>${safeSummary}</blockquote>

⚠️ <b>បញ្ហាប្រឈម &amp; Blockers:</b>
<blockquote>${safeObstacles}</blockquote>

🔮 <b>ផែនការបន្ត:</b>
<blockquote>${safeTomorrow}</blockquote>${attachmentsLine}
━━━━━━━━━━━━━━━━━━━━━━━━
🤖 <b>រាយការណ៍តាម:</b> QB Report Bot · Automated System
`.trim();
}

/**
 * Check if a Telegram user is an active member or admin of the group
 */
export async function checkGroupMembership(
  userId: number,
  chatId: string = TELEGRAM_CHAT_ID
): Promise<{ isMember: boolean; status?: string; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn('Bot token or chat ID missing for membership check');
    return { isMember: true, status: 'unconfigured_bypass' };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${userId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok && data.result) {
      const activeStatuses = ['creator', 'administrator', 'member', 'restricted'];
      const isMember = activeStatuses.includes(data.result.status);
      return { isMember, status: data.result.status };
    }

    return { isMember: false, status: data.description || 'not_member' };
  } catch (err) {
    console.error('Failed to check Telegram group membership:', err);
    return { isMember: false, error: String(err) };
  }
}

