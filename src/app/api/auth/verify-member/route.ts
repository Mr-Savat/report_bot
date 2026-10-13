import { NextRequest, NextResponse } from 'next/server';
import { checkGroupMembership } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    // Allow bypass for local dev if no Telegram user is injected
    if (!userId && process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        isMember: true,
        isDevBypass: true,
        message: 'Dev bypass active',
      });
    }

    if (!userId) {
      return NextResponse.json({
        success: true,
        isMember: false,
        reason: 'missing_user',
        message: 'មិនមានព័ត៌មានគណនី Telegram ឡើយ។ សូមបើកតាមរយៈកម្មវិធី Telegram។',
      });
    }

    const result = await checkGroupMembership(Number(userId));

    return NextResponse.json({
      success: true,
      isMember: result.isMember,
      status: result.status,
      error: result.error,
    });
  } catch (error) {
    console.error('Membership verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
