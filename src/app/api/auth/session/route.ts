// Participant Session Verification API Route Handler
// Location: src/app/api/auth/session/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  // 1. Get token from Cookie or Authorization header
  let token = request.cookies.get('participant_session')?.value;
  
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return NextResponse.json(
      { authenticated: false, error: 'No active session found.' },
      { status: 401 }
    );
  }

  // 2. Verify JWT
  const decoded = await verifyJWT(token);
  if (!decoded) {
    const response = NextResponse.json(
      { authenticated: false, error: 'Session expired or invalid.' },
      { status: 401 }
    );
    // Clear invalid cookie
    response.cookies.delete('participant_session');
    return response;
  }

  try {
    // 3. Fetch current participant record from DB
    const participant = await DB.getParticipantById(decoded.participantId);
    if (!participant) {
      const response = NextResponse.json(
        { authenticated: false, error: 'Participant not found.' },
        { status: 401 }
      );
      response.cookies.delete('participant_session');
      return response;
    }

    // 4. Verify participant is not disabled by admin
    if (participant.is_disabled) {
      const response = NextResponse.json(
        { authenticated: false, error: 'Your session has been suspended by an administrator.' },
        { status: 403 }
      );
      response.cookies.delete('participant_session');
      return response;
    }

    // 5. Fetch participant progress
    const progress = await DB.getParticipantProgress(participant.id);

    return NextResponse.json({
      authenticated: true,
      participant: {
        id: participant.id,
        full_name: participant.full_name,
        college_name: participant.college_name,
        registration_id: participant.registration_id
      },
      progress: progress ? {
        completed_quizzes: progress.completed_quizzes,
        total_score: progress.total_score,
        total_time: progress.total_time,
        next_barrel_id: progress.next_barrel_id,
        current_attempt_id: progress.current_attempt_id
      } : null
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error checking session.' },
      { status: 500 }
    );
  }
}

// Log out route handler - clears session cookie
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('participant_session');
  return response;
}
