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

      if (text.startsWith('/start') || text.startsWith('/report')) {
        // Reply with Telegram Mini App Button
        const replyPayload = {
          chat_id: chatId,
          text: `👋 សួស្តី <b>${userName}</b>!\n\nសូមស្វាគមន៍មកកាន់ប្រព័ន្ធ <b>Cambo BIM Access Bot</b>។\n\nចុចប៊ូតុងខាងក្រោមដើម្បីបើកបំពេញរបាយការណ៍ការងារប្រចាំថ្ងៃ (Daily Site Report)៖`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📋 បើកទម្រង់របាយការណ៍ (Open Report)',
                  web_app: { url: APP_URL },
                },
              ],
              [
                {
                  text: 'ℹ️ ជំនួយ និងការប្រើប្រាស់ (Help)',
                  callback_data: 'help_info',
                },
              ],
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
