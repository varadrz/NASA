// Participant Login API Route Handler
// Location: src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { signJWT } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

const normalizePhone = (num: string) => num.replace(/\D/g, '');

export async function POST(request: NextRequest) {
  // 1. Get Client IP & UA for logging and rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // 2. Enforce Rate Limiting (max 5 login attempts per IP per minute)
  const rl = await rateLimit(`login:${ip}`, 5, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { full_name, phone_number } = body;

    // 3. Validation
    if (!full_name || !phone_number) {
      return NextResponse.json(
        { error: 'Full Name and Phone Number are required.' },
        { status: 400 }
      );
    }

    const trimmedName = full_name.trim();

    // 4. Fetch participants by name from DB
    const participants = await DB.getParticipantsByName(trimmedName);
    if (participants.length === 0) {
      return NextResponse.json(
        { error: 'Invalid Full Name or registered Phone Number.' },
        { status: 401 }
      );
    }

    // 5. Find participant with matching phone number (normalized comparison)
    const participant = participants.find(p => normalizePhone(p.phone_number) === normalizePhone(phone_number));
    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid Full Name or registered Phone Number.' },
        { status: 401 }
      );
    }

    // 6. Verify participant is not suspended
    if (participant.is_disabled) {
      return NextResponse.json(
        { error: 'Your account has been suspended by an administrator.' },
        { status: 403 }
      );
    }

    // 7. Generate JWT Session Token
    const token = await signJWT({
      participantId: participant.id,
      registrationId: participant.registration_id,
      fullName: participant.full_name
    });

    // 8. Write Audit Log
    await DB.logAudit(
      participant.id,
      `Participant logged in: ${participant.full_name} (${participant.registration_id})`,
      ip,
      userAgent
    );

    // 9. Construct response with HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        app_id: (participant as any).app_id || '',
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
    console.error('Login failed:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during authentication. Please try again.' },
      { status: 500 }
    );
  }
}
