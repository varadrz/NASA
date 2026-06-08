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
    
const getDynamicRange = (totalUsers: number): number => {
  if (totalUsers < 10) return 0;       // Starting 10 users: no range limit so they can see each other!
  if (totalUsers < 30) return 3;       // 10-29 users: small range
  if (totalUsers < 60) return 8;       // 30-59 users: moderate range
  if (totalUsers < 100) return 15;     // 60-99 users: larger range
  return 25;                           // 100+ users: full range
};

    let peerTargets = [];
    if (progress) {
      const allParts = await DB.getAllParticipants();
      const totalUsers = allParts.length;
      const limit = getDynamicRange(totalUsers);

      const PADDING_NAMES = ["Aarav Mehta", "Aditi Rao", "Vihaan Sharma", "Ananya Iyer", "Kabir Sen", "Ishaan Verma", "Diya Joshi", "Rohan Gupta", "Zara Khan", "Sai Pranav"];

      // Retrieve existing target list (default to empty list if none)
      const existingList = Array.isArray(progress.peer_targets) ? progress.peer_targets : [];
      
      // 1. Clean existing targets: remove mock targets and any targets violating the dynamic Z-ID range limit
      let cleanTargets = existingList.filter((t: any) => {
        // Strip mock padding targets
        if (PADDING_NAMES.includes(t.name)) {
          return false;
        }

        // Find the actual participant in DB by name to check current Z-ID range exclusion
        const dbPart = allParts.find((p: any) => p.full_name.toLowerCase() === t.name.toLowerCase());
        if (!dbPart) return true; // Keep if not found in DB but not a known mock target

        const currentRegId = participant.registration_id || '';
        const otherRegId = dbPart.registration_id || '';
        const currentMatch = currentRegId.match(/\d+/);
        const otherMatch = otherRegId.match(/\d+/);
        
        if (currentMatch && otherMatch) {
          const currentNum = parseInt(currentMatch[0], 10);
          const otherNum = parseInt(otherMatch[0], 10);
          if (Math.abs(currentNum - otherNum) <= limit) {
            return false; // Exclude targets violating current dynamic range limits
          }
        }
        return true;
      });

      // 2. If target list has fewer than 10 targets, dynamically fill it up with new eligible participants
      if (cleanTargets.length < 10) {
        const currentNamesLower = cleanTargets.map((t: any) => t.name.toLowerCase());

        // Find other registered participants who are not already in their target list, and are not within dynamic Z-ID range
        const newEligible = allParts.filter((p: any) => {
          if (p.id === participant.id || p.is_disabled) {
            return false;
          }
          if (currentNamesLower.includes(p.full_name.toLowerCase())) {
            return false; // Already targeted
          }

          const currentRegId = participant.registration_id || '';
          const otherRegId = p.registration_id || '';
          const currentMatch = currentRegId.match(/\d+/);
          const otherMatch = otherRegId.match(/\d+/);
          
          if (currentMatch && otherMatch) {
            const currentNum = parseInt(currentMatch[0], 10);
            const otherNum = parseInt(otherMatch[0], 10);
            if (Math.abs(currentNum - otherNum) <= limit) {
              return false; // Exclude targets within dynamic range limits
            }
          }
          return true;
        });

        if (newEligible.length > 0) {
          const shuffledNew = newEligible.sort(() => 0.5 - Math.random());
          const sliceCount = 10 - cleanTargets.length;
          const selectedNew = shuffledNew.slice(0, sliceCount);

          const addedTargets = selectedNew.map((p: any) => ({
            name: p.full_name,
            instagram_id: p.instagram_id ? p.instagram_id.trim() : '',
            reg_id: p.registration_id.trim().toUpperCase(),
            found: false
          }));

          cleanTargets = [...cleanTargets, ...addedTargets];
        }
      }

      peerTargets = cleanTargets;

      // 3. Save to database if targets list changed (e.g. mock targets stripped, new users added, or out-of-range targets removed)
      const hasChanged = !Array.isArray(progress.peer_targets) ||
        progress.peer_targets.length !== cleanTargets.length ||
        progress.peer_targets.some((t: any, idx: number) => t.name !== cleanTargets[idx]?.name);

      if (hasChanged) {
        progress.peer_targets = cleanTargets;
        await DB.updateParticipantProgress({
          participant_id: progress.participant_id,
          completed_quizzes: progress.completed_quizzes,
          total_score: progress.total_score,
          total_time: progress.total_time,
          next_barrel_id: progress.next_barrel_id,
          current_attempt_id: progress.current_attempt_id,
          peer_targets: cleanTargets
        });
      }
    }

    return NextResponse.json({
      authenticated: true,
      participant: {
        id: participant.id,
        app_id: (participant as any).app_id || '',
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
