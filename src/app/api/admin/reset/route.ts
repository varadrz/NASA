// Admin Event Reset API Route Handler
// Location: src/app/api/admin/reset/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Wipe event data
    await DB.resetEvent();

    // Log the reset audit after database wipe
    await DB.logAudit(
      null,
      'Administrator performed a full event reset. All participant data and attempts cleared.',
      ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Event reset successfully. All participant logs, attempts, and progress records have been wiped clean.'
    });
  } catch (error: any) {
    console.error('Reset API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reset event.' }, { status: 500 });
  }
}
