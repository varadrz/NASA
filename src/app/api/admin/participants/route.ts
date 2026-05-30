// Admin Participant Management API Route Handler
// Location: src/app/api/admin/participants/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB, supabase } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const participants = await DB.getAllParticipants();
    
    // Enrich with progress details
    const enrichedList = await Promise.all(
      participants.map(async (p) => {
        const prog = await DB.getParticipantProgress(p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          college_name: p.college_name,
          phone_number: p.phone_number,
          registration_id: p.registration_id,
          is_disabled: p.is_disabled,
          created_at: p.created_at,
          completed_quizzes: prog?.completed_quizzes || 0,
          total_score: prog?.total_score || 0,
          total_time: prog?.total_time || 0,
          next_barrel_id: prog?.next_barrel_id || null
        };
      })
    );

    return NextResponse.json({ participants: enrichedList });
  } catch (error) {
    console.error('Admin fetch participants error:', error);
    return NextResponse.json({ error: 'Failed to fetch participants.' }, { status: 500 });
  }
}

// Toggle Participant Status (suspend/unsuspend)
export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id, isDisabled } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Participant ID is required.' }, { status: 400 });
    }

    const success = await DB.updateParticipantStatus(id, isDisabled);
    if (!success) {
      return NextResponse.json({ error: 'Participant not found or update failed.' }, { status: 404 });
    }

    const actionText = isDisabled ? 'disabled' : 'enabled';
    await DB.logAudit(
      null,
      `Administrator ${actionText} participant ID: ${id}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true, message: `Participant status set to ${isDisabled ? 'Suspended' : 'Active'}.` });
  } catch (error) {
    console.error('Toggle status error:', error);
    return NextResponse.json({ error: 'Failed to update status.' }, { status: 500 });
  }
}

// Delete Participant
export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Participant ID is required.' }, { status: 400 });
  }

  try {
    if (DB.isRealDatabase() && supabase) {
      const { error } = await supabase.from('participants').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      // Mock delete
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      db.participants = db.participants.filter((p: any) => p.id !== id);
      db.participant_progress = db.participant_progress.filter((p: any) => p.participant_id !== id);
      db.quiz_attempts = db.quiz_attempts.filter((a: any) => a.participant_id !== id);
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator deleted participant ID: ${id}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true, message: 'Participant deleted successfully.' });
  } catch (error: any) {
    console.error('Delete participant error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete participant.' }, { status: 500 });
  }
}
