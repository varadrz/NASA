// Participant Registration API Route Handler
// Location: src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { signJWT } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // 1. Get Client IP & UA for logging and rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // 2. Enforce Rate Limiting (max 5 registration attempts per IP per minute)
  const rl = await rateLimit(`register:${ip}`, 5, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { full_name, college_name, phone_number, registration_id, instagram_id } = body;

    // 3. Validation
    if (!full_name || !college_name || !phone_number || !registration_id || !instagram_id) {
      return NextResponse.json(
        { error: 'All fields (Full Name, Zone No., Phone, Z-Id, Instagram ID) are required.' },
        { status: 400 }
      );
    }

    const trimmedRegId = registration_id.trim();
    if (trimmedRegId.length < 3) {
      return NextResponse.json(
        { error: 'Z-Id must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    // 4. Check for duplicate registration_id
    const existing = await DB.getParticipantByRegistrationId(trimmedRegId);
    if (existing) {
      return NextResponse.json(
        { error: 'This Z-Id is already registered.' },
        { status: 409 }
      );
    }

    // 5. Create participant and initialize progress
    const participant = await DB.createParticipant({
      full_name: full_name.trim(),
      college_name: college_name.trim(),
      phone_number: phone_number.trim(),
      registration_id: trimmedRegId,
      instagram_id: instagram_id.trim()
    });

    // 6. Generate JWT Session Token
    const token = await signJWT({
      participantId: participant.id,
      registrationId: participant.registration_id,
      fullName: participant.full_name
    });

    // 7. Write Audit Log
    await DB.logAudit(
      participant.id,
      `Participant registered: ${participant.full_name} (${trimmedRegId}) from ${college_name}`,
      ip,
      userAgent
    );

    // 8. Construct response with HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        full_name: participant.full_name,
        college_name: participant.college_name,
        registration_id: participant.registration_id
      },
      token
    });

    // Set cookie
    response.cookies.set({
      name: 'participant_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Registration failed:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
