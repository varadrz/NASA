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
      { status: 200 }
    );
  }

  // 2. Verify JWT
  const decoded = await verifyJWT(token);
  if (!decoded) {
    const response = NextResponse.json(
      { authenticated: false, error: 'Session expired or invalid.' },
      { status: 200 }
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
        { status: 200 }
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
    
    let peerTargets = [];
    if (progress) {
      if (progress.peer_targets && Array.isArray(progress.peer_targets) && progress.peer_targets.length > 0) {
        peerTargets = progress.peer_targets;
      } else {
        // Initialize targets
        const allParts = await DB.getAllParticipants();
        const others = allParts.filter((p: any) => p.id !== participant.id && !p.is_disabled);

        const shuffled = others.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);

        const targets = selected.map((p: any) => ({
          name: p.full_name,
          reg_id: p.registration_id.trim().toUpperCase(),
          found: false
        }));

        if (targets.length < 10) {
          const paddingNeeded = 10 - targets.length;
          const PADDING_POOL = [
            { name: "Aarav Mehta", reg_id: "NASA08P1" },
            { name: "Aditi Rao", reg_id: "NASA08P2" },
            { name: "Vihaan Sharma", reg_id: "NASA08P3" },
            { name: "Ananya Iyer", reg_id: "NASA08P4" },
            { name: "Kabir Sen", reg_id: "NASA08P5" },
            { name: "Ishaan Verma", reg_id: "NASA08P6" },
            { name: "Diya Joshi", reg_id: "NASA08P7" },
            { name: "Rohan Gupta", reg_id: "NASA08P8" },
            { name: "Zara Khan", reg_id: "NASA08P9" },
            { name: "Sai Pranav", reg_id: "NASA08P10" }
          ];
          
          const shuffledPadding = PADDING_POOL.sort(() => 0.5 - Math.random());

          for (let i = 0; i < paddingNeeded; i++) {
            const pad = shuffledPadding[i % shuffledPadding.length];
            targets.push({
              name: pad.name,
              reg_id: pad.reg_id,
              found: false
            });
          }
        }

        peerTargets = targets;
        progress.peer_targets = targets;
        await DB.updateParticipantProgress({
          participant_id: progress.participant_id,
          completed_quizzes: progress.completed_quizzes,
          total_score: progress.total_score,
          total_time: progress.total_time,
          next_barrel_id: progress.next_barrel_id,
          current_attempt_id: progress.current_attempt_id,
          peer_targets: targets
        });
      }
    }

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
        current_attempt_id: progress.current_attempt_id,
        peer_targets: peerTargets.map((t: any) => ({
          name: t.name,
          found: t.found
        }))
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
