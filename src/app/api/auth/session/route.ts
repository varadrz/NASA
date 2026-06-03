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
    // 3. Fetch current participant record and progress in parallel
    const [participant, progress] = await Promise.all([
      DB.getParticipantById(decoded.participantId),
      DB.getParticipantProgress(decoded.participantId)
    ]);

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
    
    let peerTargets = [];
    if (progress) {
      if (progress.peer_targets && Array.isArray(progress.peer_targets) && progress.peer_targets.length > 0) {
        // Dynamically strip any legacy mock padding targets
        const PADDING_NAMES = ["Aarav Mehta", "Aditi Rao", "Vihaan Sharma", "Ananya Iyer", "Kabir Sen", "Ishaan Verma", "Diya Joshi", "Rohan Gupta", "Zara Khan", "Sai Pranav"];
        const cleanTargets = progress.peer_targets.filter((t: any) => !PADDING_NAMES.includes(t.name));
        
        // Also apply the +-25 range check to existing targets to ensure no invalid targets remain
        const allParts = await DB.getAllParticipants();
        const filteredTargets = cleanTargets.filter((t: any) => {
          const dbPart = allParts.find((p: any) => p.full_name.toLowerCase() === t.name.toLowerCase());
          if (!dbPart) return true; // Keep if not found in DB
          
          const currentRegId = participant.registration_id || '';
          const otherRegId = dbPart.registration_id || '';
          const currentMatch = currentRegId.match(/\d+/);
          const otherMatch = otherRegId.match(/\d+/);
          
          if (currentMatch && otherMatch) {
            const currentNum = parseInt(currentMatch[0], 10);
            const otherNum = parseInt(otherMatch[0], 10);
            if (Math.abs(currentNum - otherNum) <= 25) {
              return false; // Exclude
            }
          }
          return true;
        });

        peerTargets = filteredTargets;

        // If the targets were modified (e.g. mock names stripped or range checks applied), update DB
        if (filteredTargets.length !== progress.peer_targets.length) {
          progress.peer_targets = filteredTargets;
          await DB.updateParticipantProgress({
            participant_id: progress.participant_id,
            completed_quizzes: progress.completed_quizzes,
            total_score: progress.total_score,
            total_time: progress.total_time,
            next_barrel_id: progress.next_barrel_id,
            current_attempt_id: progress.current_attempt_id,
            peer_targets: filteredTargets
          });
        }
      } else {
        // Initialize targets using actual DB participants only (no mock padding)
        const allParts = await DB.getAllParticipants();
        
        // Filter out others who are disabled, matches own ID, or within +-25 numeric registration ID range
        const others = allParts.filter((p: any) => {
          if (p.id === participant.id || p.is_disabled) {
            return false;
          }
          
          const currentRegId = participant.registration_id || '';
          const otherRegId = p.registration_id || '';
          
          const currentMatch = currentRegId.match(/\d+/);
          const otherMatch = otherRegId.match(/\d+/);
          
          if (currentMatch && otherMatch) {
            const currentNum = parseInt(currentMatch[0], 10);
            const otherNum = parseInt(otherMatch[0], 10);
            if (Math.abs(currentNum - otherNum) <= 25) {
              return false; // Exclude targets within +-25 of current user's registration ID number
            }
          }
          
          return true;
        });

        const shuffled = others.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);

        const targets = selected.map((p: any) => ({
          name: p.full_name,
          instagram_id: p.instagram_id ? p.instagram_id.trim() : '',
          reg_id: p.registration_id.trim().toUpperCase(),
          found: false
        }));

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
        phone_number: participant.phone_number || '',
        registration_id: participant.registration_id,
        instagram_id: participant.instagram_id ? participant.instagram_id.replace(/^@+/, '') : '',
        has_edited_details: (participant as any).has_edited === true ||
          (progress && progress.peer_targets && Array.isArray(progress.peer_targets) && progress.peer_targets.some((t: any) => t.name === '__SYSTEM_DETAILS_EDITED__')) ||
          false
      },
      progress: progress ? {
        completed_quizzes: progress.completed_quizzes,
        total_score: progress.total_score,
        total_time: progress.total_time,
        next_barrel_id: progress.next_barrel_id,
        current_attempt_id: progress.current_attempt_id,
        peer_targets: peerTargets
          .filter((t: any) => !t.name.startsWith('__'))
          .map((t: any) => ({
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
