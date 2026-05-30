// Real-time Leaderboard API Route Handler
// Location: src/app/api/leaderboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';

  // 1. Rate Limiting (max 60 queries per minute per IP for leaderboard refreshes)
  const rl = await rateLimit(ip, 60, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overall';
  const rawBarrelId = searchParams.get('barrelId');

  try {
    if (type === 'quiz') {
      const barrelId = parseInt(rawBarrelId || '', 10);
      if (isNaN(barrelId) || barrelId < 1 || barrelId > 10) {
        return NextResponse.json({ error: 'Valid barrelId (1-10) is required for quiz leaderboards.' }, { status: 400 });
      }

      const leaderboard = await DB.getQuizLeaderboard(barrelId);
      const quiz = await DB.getQuizByBarrelId(barrelId);

      return NextResponse.json({
        type: 'quiz',
        barrel_id: barrelId,
        quiz_title: quiz?.title || `Quiz ${barrelId}`,
        leaderboard: leaderboard.map(item => ({
          rank: item.rank,
          name: item.full_name,
          college: item.college_name,
          score: item.score,
          time: item.time_taken_seconds
        }))
      });
    }

    // Default: Overall leaderboard
    const leaderboard = await DB.getOverallLeaderboard();
    return NextResponse.json({
      type: 'overall',
      leaderboard: leaderboard.map(item => ({
        rank: item.rank,
        name: item.full_name,
        college: item.college_name,
        score: item.total_score,
        time: item.total_time,
        completed: item.completed_quizzes
      }))
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error fetching leaderboard.' }, { status: 500 });
  }
}
