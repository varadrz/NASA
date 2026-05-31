// Peer Hunt Submission API Route Handler
// Location: src/app/api/peer-hunt/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { verifyJWT } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // Rate Limiting (max 10 submissions per minute per IP to prevent brute-forcing Z-IDs)
  const rl = await rateLimit(`peer-hunt:${ip}`, 10, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please slow down.' },
      { status: 429 }
    );
  }

  // 1. Verify Session
  let token = request.cookies.get('participant_session')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized. Active session required.' }, { status: 401 });
  }

  const decoded = await verifyJWT(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Session expired or invalid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, zId } = body;

    if (!name || !zId) {
      return NextResponse.json({ error: 'Target name and Z-Id are required.' }, { status: 400 });
    }

    // 2. Fetch Progress
    const progress = await DB.getParticipantProgress(decoded.participantId);
    if (!progress || !progress.peer_targets || !Array.isArray(progress.peer_targets)) {
      return NextResponse.json({ error: 'No peer targets initialized for your account.' }, { status: 400 });
    }

    // 3. Find target in list
    const targets = [...progress.peer_targets];
    const targetIndex = targets.findIndex(t => t.name.toLowerCase() === name.toLowerCase());

    if (targetIndex === -1) {
      return NextResponse.json({ error: 'Participant not in your assigned network list.' }, { status: 400 });
    }

    const target = targets[targetIndex];
    if (target.found) {
      return NextResponse.json({ error: 'You have already verified this participant.' }, { status: 400 });
    }

    // 4. Verify Z-ID (registration ID)
    const normalizedInputId = zId.trim().toUpperCase();
    const expectedRegId = target.reg_id.trim().toUpperCase();

    if (normalizedInputId !== expectedRegId) {
      return NextResponse.json({ error: 'Invalid Z-Id for this participant. Verify physically.' }, { status: 400 });
    }

    // 5. Award 25 XP and mark as found
    target.found = true;
    const newScore = progress.total_score + 25;

    await DB.updateParticipantProgress({
      participant_id: progress.participant_id,
      completed_quizzes: progress.completed_quizzes,
      total_score: newScore,
      total_time: progress.total_time,
      next_barrel_id: progress.next_barrel_id,
      current_attempt_id: progress.current_attempt_id,
      peer_targets: targets
    });

    // 6. Log Audit
    await DB.logAudit(
      decoded.participantId,
      `Verified peer target: ${target.name} (+25 XP)`,
      ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: `Verified ${target.name}! +25 XP awarded.`,
      newScore,
      peer_targets: targets.map(t => ({ name: t.name, found: t.found }))
    });
  } catch (error: any) {
    console.error('Peer hunt submit error:', error);
    return NextResponse.json({ error: 'Internal server error processing peer hunt.' }, { status: 500 });
  }
}
