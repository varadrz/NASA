// Quiz Submission and Scoring API Route Handler
// Location: src/app/api/quiz/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { verifyJWT } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';
import { seededShuffle } from '@/lib/seeded-shuffle';

export async function POST(request: NextRequest) {
  // 1. Get Client IP & UA for logging/rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // 2. Rate Limiting (max 10 submissions per minute per IP to prevent spamming)
  const rl = await rateLimit(`submit:${ip}`, 10, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a moment.' },
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
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const decoded = await verifyJWT(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
  }

  try {
    // 4. Fetch participant and verify status
    const participant = await DB.getParticipantById(decoded.participantId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    }
    if (participant.is_disabled) {
      return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 });
    }

    // 5. Parse request body
    const { attemptId, answers } = await request.json();
    if (!attemptId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Attempt ID and answers list are required.' }, { status: 400 });
    }

    if (answers.length !== 5) {
      return NextResponse.json({ error: 'Invalid answers count. Exactly 5 answers are required.' }, { status: 400 });
    }

    // 6. Fetch attempt and verify ownership
    const attempt = await DB.getAttemptById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: 'Quiz attempt not found.' }, { status: 404 });
    }
    if (attempt.participant_id !== participant.id) {
      return NextResponse.json({ error: 'Unauthorized attempt access.' }, { status: 403 });
    }
    if (attempt.is_completed) {
      return NextResponse.json({ error: 'This quiz has already been submitted and scored.' }, { status: 400 });
    }

    // 7. Verify attempt is the currently active one in progress
    const progress = await DB.getParticipantProgress(participant.id);
    if (!progress || progress.current_attempt_id !== attemptId) {
      return NextResponse.json({ error: 'This is not your currently active quiz attempt.' }, { status: 400 });
    }

    // 8. Fetch the quiz
    const quiz = await DB.getQuizByBarrelId(progress.next_barrel_id!);
    if (!quiz || quiz.id !== attempt.quiz_id) {
      return NextResponse.json({ error: 'Mismatched quiz structure.' }, { status: 400 });
    }

    // 9. Score the quiz server-side
    const dbQuestions = await DB.getQuestionsByQuizId(quiz.id);
    const selectedQuestions = seededShuffle(dbQuestions, attempt.id).slice(0, 5);
    let correctCount = 0;
    
    // Validate each question answer against the deterministically assigned subset only
    answers.forEach((submitted: { questionId: string; answer: string }) => {
      const match = selectedQuestions.find(q => q.id === submitted.questionId);
      if (match) {
        if (match.correct_answer.toUpperCase() === submitted.answer.trim().toUpperCase()) {
          correctCount++;
        }
      }
    });

    const score = Math.min(50, correctCount * 10); // 10 points per question (Max 50 per quiz)

    // 10. Calculate time elapsed on Server
    const startTime = new Date(attempt.started_at).getTime();
    const endTime = Date.now();
    let timeTakenSeconds = Math.round((endTime - startTime) / 1000);
    if (timeTakenSeconds < 1) timeTakenSeconds = 1; // Minimum 1 second duration

    // 11. Submit attempt in database
    await DB.submitAttempt(attemptId, score, timeTakenSeconds);

    // 12. Determine next barrel randomly from unattempted barrels
    const [completedAttempts, allQuizzes] = await Promise.all([
      DB.getCompletedAttempts(participant.id),
      DB.getAllQuizzes()
    ]);
    const completedQuizIds = completedAttempts.map(a => a.quiz_id);

    // Find completed barrel IDs in memory
    const completedBarrels: number[] = [];
    for (const bQuiz of allQuizzes) {
      if (completedQuizIds.includes(bQuiz.id)) {
        completedBarrels.push(bQuiz.barrel_id);
      }
    }

    const allBarrels = Array.from({ length: 20 }, (_, i) => i + 1);
    const unattemptedBarrels = allBarrels.filter(bId => !completedBarrels.includes(bId));
    let nextBarrelId: number | null = null;
    if (unattemptedBarrels.length > 0) {
      const randIdx = Math.floor(Math.random() * unattemptedBarrels.length);
      nextBarrelId = unattemptedBarrels[randIdx];
    }

    const nextCompletedQuizzes = completedQuizIds.length; // includes current submission
    const nextTotalScore = progress.total_score + score;
    const nextTotalTime = progress.total_time + timeTakenSeconds;

    // 13. Update participant progress record
    await DB.updateParticipantProgress({
      participant_id: participant.id,
      completed_quizzes: nextCompletedQuizzes,
      total_score: nextTotalScore,
      total_time: nextTotalTime,
      next_barrel_id: nextBarrelId,
      current_attempt_id: null // Reset active attempt
    });

    // 14. Log audit action
    await DB.logAudit(
      participant.id,
      `Submitted Quiz "${quiz.title}" (Barrel #${quiz.barrel_id}). Score: ${score}/50, Time: ${timeTakenSeconds}s. Next assigned: ${nextBarrelId ? '#' + nextBarrelId : 'Event Completed'}`,
      ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      quiz_title: quiz.title,
      score,
      correct_count: correctCount,
      time_taken_seconds: timeTakenSeconds,
      progress: {
        completed_quizzes: nextCompletedQuizzes,
        total_score: nextTotalScore,
        total_time: nextTotalTime,
        next_barrel_id: nextBarrelId,
        is_finished: nextCompletedQuizzes >= 20
      }
    });
  } catch (error: any) {
    console.error('Submission failed:', error);
    return NextResponse.json({ error: 'An error occurred during submission.' }, { status: 500 });
  }
}
