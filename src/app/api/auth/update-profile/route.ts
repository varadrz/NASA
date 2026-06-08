// Participant Detail Update API Route Handler
// Location: src/app/api/auth/update-profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { verifyJWT } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // Enforce Rate Limiting (max 10 profile update attempts per IP per minute)
  const rl = await rateLimit(`update-profile:${ip}`, 10, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many update requests. Please wait a minute.' },
      { status: 429 }
    );
  }

  // 1. Get token and verify session
  let token = request.cookies.get('participant_session')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return NextResponse.json({ error: 'No active session found.' }, { status: 401 });
  }

  const decoded = await verifyJWT(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Session expired or invalid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { full_name, college_name, phone_number, instagram_id } = body;

    if (!full_name || !college_name || !phone_number || !instagram_id) {
      return NextResponse.json({ error: 'All fields (Full Name, Zone No., Phone Number, Instagram ID) are required.' }, { status: 400 });
    }

    // 2. Fetch current participant and progress
    const [participant, progress] = await Promise.all([
      DB.getParticipantById(decoded.participantId),
      DB.getParticipantProgress(decoded.participantId)
    ]);

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    }

    // 3. Enforce single update limit
    const hasAlreadyEdited =
      (participant as any).has_edited === true ||
      (progress && progress.peer_targets && Array.isArray(progress.peer_targets) && progress.peer_targets.some((t: any) => t.name === '__SYSTEM_DETAILS_EDITED__')) ||
      false;

    if (hasAlreadyEdited) {
      return NextResponse.json({ error: 'Details can only be changed once. You have already used your edit allowance.' }, { status: 400 });
    }

    // Check if the updated full name and phone number are already taken by a DIFFERENT participant
    const normalizePhone = (num: string) => num.replace(/\D/g, '');
    const existingParts = await DB.getParticipantsByName(full_name.trim());
    const taken = existingParts.find(p => p.id !== decoded.participantId && normalizePhone(p.phone_number) === normalizePhone(phone_number.trim()));
    if (taken) {
      return NextResponse.json({ error: 'This Full Name and Phone Number combination is already registered by another participant.' }, { status: 409 });
    }

    // 4. Perform update
    const updatedParticipant = await DB.updateParticipantDetails(decoded.participantId, {
      full_name: full_name.trim(),
      college_name: college_name.trim(),
      phone_number: phone_number.trim(),
      instagram_id: instagram_id.trim()
    });

    // 5. Audit Log
    await DB.logAudit(
      decoded.participantId,
      `Participant updated profile details: ${full_name.trim()} (Zone: ${college_name.trim()}, IG: ${instagram_id.trim()})`,
      ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      participant: {
        id: updatedParticipant.id,
        app_id: (updatedParticipant as any).app_id || '',
        full_name: updatedParticipant.full_name,
        college_name: updatedParticipant.college_name,
        registration_id: updatedParticipant.registration_id,
        instagram_id: updatedParticipant.instagram_id ? updatedParticipant.instagram_id.replace(/^@+/, '') : '',
        has_edited_details: true
      }
    });
  } catch (error: any) {
    console.error('Update profile details error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error updating details.' }, { status: 500 });
  }
}
