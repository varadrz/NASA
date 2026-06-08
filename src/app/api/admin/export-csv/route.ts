// Admin CSV Export API Route Handler
// Location: src/app/api/admin/export-csv/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  // Check admin authorization
  if (!isAdminAuthorized(request)) {
    return new NextResponse('Unauthorized administrative access.', { status: 401 });
  }

  try {
    const participants = await DB.getAllParticipants();
    const leaderboard = await DB.getOverallLeaderboard();

    // Headers
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel formatting
    csvContent += 'Rank,App ID,Registration ID,Full Name,College Name,Phone Number,Completed Quizzes,Total Score,Total Time (seconds),Status,Registration Date\n';

    // Group participants by ID to easily join rank
    const rankMap = new Map<string, number>();
    leaderboard.forEach(p => {
      rankMap.set(p.participant_id, p.rank);
    });

    for (const p of participants) {
      const prog = await DB.getParticipantProgress(p.id);
      const rank = rankMap.get(p.id) || 'N/A';
      
      const row = [
        rank,
        (p as any).app_id || '',
        p.registration_id,
        p.full_name,
        p.college_name,
        p.phone_number,
        prog?.completed_quizzes || 0,
        prog?.total_score || 0,
        prog?.total_time || 0,
        p.is_disabled ? 'Suspended' : 'Active',
        p.created_at
      ];

      csvContent += row.map(escapeCSV).join(',') + '\n';
    }

    // Audit the export
    await DB.logAudit(
      null,
      `Administrator exported participant database to CSV (${participants.length} records)`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    // Return the response as a file download
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nasa_hyderabad_heritage_participants.csv"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('CSV export error:', error);
    return new NextResponse(`Export failed: ${error.message}`, { status: 500 });
  }
}
