// Admin Seeding API Route Handler
// Location: src/app/api/admin/seed-questions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { questionsData } from '@/lib/questions-data';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await DB.seedQuestions(questionsData);
    
    await DB.logAudit(
      null,
      `Administrator seeded questions pool. Seeding result: ${JSON.stringify(result)}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to seed questions.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.count} questions across 10 quizzes into the database.`
    });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message || 'Error occurred during seeding.' }, { status: 500 });
  }
}
