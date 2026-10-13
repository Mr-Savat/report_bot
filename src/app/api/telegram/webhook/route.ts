import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    if (!BOT_TOKEN) {
      return NextResponse.json({ ok: true, note: 'BOT_TOKEN not configured yet' });
    }

    // Process Telegram Message
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const user = update.message.from;
      const userName = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Engineer';

      const isGroup = update.message.chat.type === 'group' || update.message.chat.type === 'supergroup';
      const cleanText = text.toLowerCase().trim();

      if (cleanText.startsWith('/start') || cleanText.startsWith('/report')) {
        // In groups, Telegram requires direct Mini App URL; in private chats, it supports web_app object
        const reportButton = isGroup
          ? {
              text: '📋 បើកទម្រង់របាយការណ៍ (Open Report)',
              url: 'https://t.me/qb_tech_report_bot/report',
            }
          : {
              text: '📋 បើកទម្រង់របាយការណ៍ (Open Report)',
              web_app: { url: APP_URL },
            };

        const replyPayload = {
          chat_id: chatId,
          text: `👋 សួស្តី <b>${userName}</b>!\n\nសូមស្វាគមន៍មកកាន់ប្រព័ន្ធ <b>QB Report Bot</b>។\n\nចុចប៊ូតុងខាងក្រោមដើម្បីបើកបំពេញរបាយការណ៍ការដ្ឋានប្រចាំថ្ងៃ (Daily Site Report)៖`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [reportButton],
            ],
          },
        };

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(replyPayload),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Telegram Webhook is ready',
    botConfigured: Boolean(BOT_TOKEN),
  });
}
