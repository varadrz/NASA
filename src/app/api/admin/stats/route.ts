// Admin Stats API Route Handler
// Location: src/app/api/admin/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  // 1. Authenticate Admin
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const [participants, leaderboard, allQuizzes] = await Promise.all([
      DB.getAllParticipants(),
      DB.getOverallLeaderboard(),
      DB.getAllQuizzes()
    ]);

    const totalParticipants = participants.length;
    const activeParticipants = participants.filter(p => !p.is_disabled).length;
    const disabledParticipants = totalParticipants - activeParticipants;

    // Calculate averages from leaderboard
    let totalScoreAll = 0;
    let totalTimeAll = 0;
    let completedCount = 0;
    const completionStats = Array(21).fill(0); // index 0 to 20

    leaderboard.forEach(p => {
      totalScoreAll += p.total_score || 0;
      totalTimeAll += p.total_time || 0;
      if (p.completed_quizzes === 20) completedCount++;
      if (p.completed_quizzes >= 0 && p.completed_quizzes <= 20) {
        completionStats[p.completed_quizzes]++;
      }
    });

    const averageScore = totalParticipants > 0 ? Math.round(totalScoreAll / totalParticipants) : 0;
    const averageTime = totalParticipants > 0 ? Math.round(totalTimeAll / totalParticipants) : 0;

    // Quiz by quiz stats (completions per barrel) fetched in parallel
    const quizStatsPromises = allQuizzes.map(async (quiz) => {
      const qLeaderboard = await DB.getQuizLeaderboard(quiz.barrel_id);
      
      let sumScore = 0;
      let sumTime = 0;
      qLeaderboard.forEach(item => {
        sumScore += item.score;
        sumTime += item.time_taken_seconds;
      });

      return {
        barrel_id: quiz.barrel_id,
        title: quiz.title || `Quiz ${quiz.barrel_id}`,
        completions: qLeaderboard.length,
        average_score: qLeaderboard.length > 0 ? Math.round((sumScore / qLeaderboard.length) * 10) / 10 : 0,
        average_time_seconds: qLeaderboard.length > 0 ? Math.round(sumTime / qLeaderboard.length) : 0
      };
    });

    const quizStats = await Promise.all(quizStatsPromises);
    quizStats.sort((a, b) => a.barrel_id - b.barrel_id);

    return NextResponse.json({
      summary: {
        total_participants: totalParticipants,
        active_participants: activeParticipants,
        disabled_participants: disabledParticipants,
        completed_all_20: completedCount,
        average_score: averageScore,
        average_time_seconds: averageTime
      },
      completion_distribution: completionStats.map((count, index) => ({
        quizzes_completed: index,
        participant_count: count
      })),
      quizzes: quizStats
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to calculate stats.' }, { status: 500 });
  }
}
