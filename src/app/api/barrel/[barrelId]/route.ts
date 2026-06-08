// Barrel Access and Quiz Retrieval API Route Handler
// Location: src/app/api/barrel/[barrelId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { verifyJWT } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';
import { seededShuffle } from '@/lib/seeded-shuffle';


const BARREL_CODES: { [key: number]: string } = {
  1: '48392015',
  2: '89201543',
  3: '31548920',
  4: '54389201',
  5: '92015438',
  6: '15438920',
  7: '83920154',
  8: '43892015',
  9: '20154389',
  10: '71543892',
  11: '62940183',
  12: '30958174',
  13: '84920173',
  14: '15948302',
  15: '93018472',
  16: '48201937',
  17: '75039182',
  18: '29481037',
  19: '58392014',
  20: '10394827'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barrelId: string }> }
) {
  const { barrelId: rawBarrelId } = await params;
  const barrelId = parseInt(rawBarrelId, 10);
  
  // 1. Get Client IP & UA for logging/rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // 2. Rate Limiting (max 30 requests per minute per IP for scanning)
  const rl = await rateLimit(`scan:${ip}`, 30, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  // 3. Verify Session
  let token = request.cookies.get('participant_session')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required. Please register or log in to join the hunt.', needs_auth: true },
      { status: 401 }
    );
  }

  const decoded = await verifyJWT(token);
  if (!decoded) {
    return NextResponse.json(
      { error: 'Session invalid or expired. Please register again.', needs_auth: true },
      { status: 401 }
    );
  }

  try {
    // 4. Fetch participant and progress in parallel
    const [participant, progress] = await Promise.all([
      DB.getParticipantById(decoded.participantId),
      DB.getParticipantProgress(decoded.participantId)
    ]);

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    }
    if (participant.is_disabled) {
      return NextResponse.json({ error: 'Your account has been suspended by an admin.' }, { status: 403 });
    }

    if (!progress) {
      return NextResponse.json({ error: 'Progress record not found.' }, { status: 404 });
    }

    // 6. Check if barrel ID is valid
    if (isNaN(barrelId) || barrelId < 1 || barrelId > 20) {
      return NextResponse.json({ error: 'Invalid Barrel ID. Must be between 1 and 20.' }, { status: 400 });
    }

    // 7. Verify assigned barrel flow
    if (progress.completed_quizzes >= 20) {
      await DB.logAudit(
        participant.id,
        `Scanned Barrel #${barrelId} after completing all quizzes`,
        ip,
        userAgent
      );
      return NextResponse.json({
        completed: true,
        message: 'Congratulations! You have completed all 20 quizzes. Head to the leaderboard to check your rank!'
      });
    }

    // 7.5 Verify 8-digit access code
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const expectedCode = BARREL_CODES[barrelId];
    if (!code || code.trim() !== expectedCode) {
      return NextResponse.json({
        needs_code: true,
        error: 'A valid 8-digit physical barrel access code is required to unlock this quiz.'
      }, { status: 403 });
    }

    if (progress.next_barrel_id !== barrelId) {
      await DB.logAudit(
        participant.id,
        `Scanned wrong barrel. Attempted: #${barrelId}, Assigned: #${progress.next_barrel_id}`,
        ip,
        userAgent
      );
      return NextResponse.json({
        wrong_barrel: true,
        assigned_barrel: progress.next_barrel_id,
        error: `Incorrect Barrel! Your assigned destination is Barrel #${progress.next_barrel_id}. Look for that barrel's QR code!`
      }, { status: 400 });
    }

    // 8. Fetch quiz for this barrel
    const quiz = await DB.getQuizByBarrelId(barrelId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not configured for this barrel.' }, { status: 500 });
    }

    // 9. Fetch questions pool (size 20)
    const questionsPool = await DB.getQuestionsByQuizId(quiz.id);
    if (!questionsPool || questionsPool.length === 0) {
      return NextResponse.json({ error: 'Questions pool is empty for this quiz.' }, { status: 500 });
    }

    // 10. Create or retrieve active attempt (sets started_at on server)
    const attempt = await DB.createAttempt(participant.id, quiz.id);

    // 11. Select 5 questions deterministically using attempt.id as a seed
    const selectedQuestions = seededShuffle(questionsPool, attempt.id).slice(0, 5);

    // 12. Format and sanitize questions (randomize options, remove correct answers)
    const formattedQuestions = selectedQuestions.map((q) => {
      // Create options list and shuffle it (using attempt.id + question.id as option seed to stabilize UI option layout across refreshes)
      const options = seededShuffle([
        { value: 'A', text: q.option_a },
        { value: 'B', text: q.option_b },
        { value: 'C', text: q.option_c },
        { value: 'D', text: q.option_d }
      ], attempt.id + q.id);

      return {
        id: q.id,
        question: q.question,
        options
      };
    });

    // 13. Audit log the scan
    await DB.logAudit(
      participant.id,
      `Successfully scanned Barrel #${barrelId} and unlocked Quiz: "${quiz.title}"`,
      ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        barrel_id: barrelId,
        title: quiz.title,
        description: quiz.description
      },
      attempt: {
        id: attempt.id,
        started_at: attempt.started_at
      },
      questions: formattedQuestions
    });
  } catch (error: any) {
    console.error('Error in barrel scanner API:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
