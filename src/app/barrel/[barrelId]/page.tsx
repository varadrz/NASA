// Dynamic Barrel Scan Landing and Quiz Execution Page (Bauhaus Theme)
// Location: src/app/barrel/[barrelId]/page.tsx

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Lock, 
  MapPin, 
  Send, 
  Trophy, 
  XCircle 
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: { value: string; text: string }[];
}

interface QuizData {
  id: string;
  barrel_id: number;
  title: string;
  description: string;
}

interface AttemptData {
  id: string;
  started_at: string;
}

export default function BarrelQuizPage({
  params,
}: {
  params: Promise<{ barrelId: string }>;
}) {
  const router = useNextRouter();
  const { barrelId: rawBarrelId } = use(params);
  const barrelId = parseInt(rawBarrelId, 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auth & sequence states
  const [needsAuth, setNeedsAuth] = useState(false);
  const [wrongBarrel, setWrongBarrel] = useState(false);
  const [assignedBarrel, setAssignedBarrel] = useState<number | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  
  // Quiz execution states
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selections, setSelections] = useState<{ [qId: string]: string }>({});
  
  // Timers
  const [elapsedTime, setElapsedTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [barrelId]);

  useEffect(() => {
    if (!attempt || submittedResult) return;
    
    const startTime = new Date(attempt.started_at).getTime();
    const interval = setInterval(() => {
      const current = Date.now();
      setElapsedTime(Math.round((current - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, submittedResult]);

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    setNeedsAuth(false);
    setWrongBarrel(false);
    setAlreadyCompleted(false);

    try {
      const res = await fetch(`/api/barrel/${barrelId}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setNeedsAuth(true);
          setError(data.error);
        } else if (data.wrong_barrel) {
          setWrongBarrel(true);
          setAssignedBarrel(data.assigned_barrel);
          setError(data.error);
        } else {
          setError(data.error || 'Failed to fetch barrel information.');
        }
        setLoading(false);
        return;
      }

      if (data.completed) {
        setAlreadyCompleted(true);
        setLoading(false);
        return;
      }

      setQuiz(data.quiz);
      setAttempt(data.attempt);
      setQuestions(data.questions);
      
      const initialSelections: { [qId: string]: string } = {};
      data.questions.forEach((q: Question) => {
        initialSelections[q.id] = '';
      });
      setSelections(initialSelections);

    } catch (err) {
      console.error('Quiz loading error:', err);
      setError('A connection error occurred. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, optionValue: string) => {
    if (submitting || submittedResult) return;
    setSelections({
      ...selections,
      [qId]: optionValue
    });
  };

  const handleSubmit = async () => {
    const unanswered = Object.values(selections).some(val => val === '');
    if (unanswered) {
      alert('Answer all 5 questions before submitting!');
      return;
    }

    setSubmitting(true);

    try {
      const answersPayload = Object.entries(selections).map(([qId, val]) => ({
        questionId: qId,
        answer: val
      }));

      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attemptId: attempt?.id,
          answers: answersPayload
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to submit answers.');
        setSubmitting(false);
        return;
      }

      setSubmittedResult(data);
      
      if (data.progress?.is_finished) {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      window.dispatchEvent(new Event('refresh-session'));

    } catch (err) {
      console.error('Submit error:', err);
      alert('A connection error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center text-brand-on-surface">
        <Compass className="h-10 w-10 text-brand-primary animate-spin mb-4" />
        <p className="font-mono text-xs font-bold uppercase tracking-widest">LOADING BARREL COORDINATES...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE A: UNAUTHORIZED USER
  // -------------------------------------------------------------
  if (needsAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-brand-surface p-8 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] max-w-md w-full text-center space-y-6">
            <div className="inline-flex p-4 bg-brand-mustard border-2 border-brand-on-surface text-brand-on-surface">
              <Lock className="h-10 w-10" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase text-brand-on-surface">SCAN REGISTERED</h2>
            <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
              You successfully located <strong className="text-brand-on-surface">Barrel #{barrelId}</strong>. To unlock this heritage questionnaire, you must establish an active participant session first.
            </p>
            <div className="pt-2">
              <Link
                href={`/register?barrel=${barrelId}`}
                className="w-full py-4 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center justify-center"
              >
                Create Participant Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE B: INCORRECT BARREL SEQUENCE ORDER
  // -------------------------------------------------------------
  if (wrongBarrel) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-brand-surface p-8 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] max-w-md w-full text-center space-y-6">
            <div className="inline-flex p-4 bg-brand-primary border-2 border-brand-on-surface text-brand-on-primary">
              <AlertTriangle className="h-10 w-10 animate-pulse" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase text-brand-on-surface">WRONG BARREL SCANNED</h2>
            <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
              You scanned Barrel <strong className="text-brand-on-surface">#{barrelId}</strong>, but your assigned target sequence directs you to <strong className="text-brand-primary">Barrel #{assignedBarrel}</strong>.
            </p>
            
            <div className="p-4 bg-brand-surface-low border-2 border-brand-on-surface flex items-center justify-center gap-4">
              <div className="h-10 w-10 bg-brand-mustard border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-brand-on-surface shrink-0">
                #{assignedBarrel}
              </div>
              <span className="text-[10px] text-left text-brand-on-surface-variant font-mono font-bold leading-normal uppercase">
                Find and scan the QR marker located physically on Barrel #{assignedBarrel} to proceed!
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 py-3.5 bg-brand-surface border-2 border-brand-on-surface font-display font-bold text-xs uppercase hover:bg-brand-surface-low transition-all"
              >
                Dashboard
              </Link>
              <Link
                href={`/barrel/${assignedBarrel}`}
                className="flex-1 py-3.5 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-bold text-xs uppercase shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all"
              >
                Skip to #{assignedBarrel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE C: ALREADY COMPLETED QUIZ
  // -------------------------------------------------------------
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-brand-surface p-8 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] max-w-md w-full text-center space-y-6">
            <div className="inline-flex p-4 bg-brand-secondary border-2 border-brand-on-surface text-brand-on-secondary">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase text-brand-on-surface">QUIZ SOLVED</h2>
            <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
              You have already completed the questionnaire for Barrel #{barrelId}. Participants are restricted from re-attempting solved barrels.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 py-3.5 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container transition-all"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="flex-1 py-3.5 bg-brand-surface border-2 border-brand-on-surface font-display font-bold text-xs uppercase hover:bg-brand-surface-low transition-all"
              >
                Leaderboards
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE D: GENERIC LOADING ERROR
  // -------------------------------------------------------------
  if (error && !quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-brand-surface p-8 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] max-w-md w-full text-center space-y-6">
            <div className="inline-flex p-4 bg-brand-primary border-2 border-brand-on-surface text-brand-on-primary">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase text-brand-on-surface">ERROR LOADING</h2>
            <p className="font-mono text-xs text-brand-error uppercase font-bold">{error}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-3.5 bg-brand-surface border-2 border-brand-on-surface font-display font-bold text-xs uppercase hover:bg-brand-surface-low transition-all"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE E: ACTIVE QUIZ VIEW OR COMPLETED RESULTS VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <div className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 pb-32">
        {quiz && !submittedResult ? (
          // ACTIVE MCQ QUESTIONNAIRE PLAY
          <div className="space-y-8 animate-fade-in">
            {/* Architectural Header stats bar */}
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div className="bg-brand-primary text-brand-on-primary p-4 border-2 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] min-w-[200px]">
                <span className="font-mono text-[10px] block opacity-85 uppercase font-bold tracking-wider">BARREL IDENTIFIER</span>
                <span className="font-display text-2xl font-black uppercase">BR-0{quiz.barrel_id}26/HYD</span>
              </div>
              <div className="bg-brand-secondary text-brand-on-secondary p-4 border-2 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] min-w-[180px] text-right">
                <span className="font-mono text-[10px] block opacity-85 uppercase font-bold tracking-wider">TIME REMAINING</span>
                <span className="font-display text-2xl font-black font-mono">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>

            {/* Questions Container Block */}
            <section className="bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)]">
              {/* Challenge Heading block with decorative geometric marks */}
              <div className="bg-brand-secondary p-4 border-b-4 border-brand-on-surface flex justify-between items-center text-brand-on-secondary">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider">LOCATION CHALLENGE</h2>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-brand-mustard border border-brand-on-surface"></div>
                  <div className="w-3 h-3 bg-brand-primary border border-brand-on-surface"></div>
                </div>
              </div>

              {/* Contest Guidelines */}
              <div className="p-6 md:p-8 border-b-2 border-brand-on-surface bg-brand-surface-low">
                <div className="font-display text-xl font-bold text-brand-on-surface uppercase">
                  {quiz.title}
                </div>
                <p className="text-brand-on-surface-variant text-sm mt-1 leading-relaxed">
                  {quiz.description} Answers are verified instantly on submission. Bypassing client states has no effect on timing validations.
                </p>
              </div>

              {/* Questions Stack */}
              <div className="p-6 md:p-8 space-y-10">
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-4">
                    {/* Header: step indicator and Q text */}
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-xs font-bold bg-brand-on-surface text-brand-surface w-8 h-8 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="font-display text-lg font-black text-brand-on-surface leading-tight pt-1">
                        {q.question}
                      </h3>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-12">
                      {q.options.map((opt) => {
                        const isSelected = selections[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.value)}
                            className={`text-left p-4 border-2 border-brand-on-surface font-sans transition-all flex items-start gap-4 cursor-pointer hover:bg-brand-surface-low ${
                              isSelected
                                ? 'bg-brand-mustard font-bold transform translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]'
                                : 'bg-brand-surface'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold bg-brand-on-surface text-brand-surface w-6 h-6 flex items-center justify-center shrink-0">
                              {opt.value}
                            </span>
                            <span className="text-sm font-bold text-brand-on-surface self-center">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-4">
              <Link
                href="/"
                className="flex-1 py-4 px-6 border-2 border-brand-on-surface font-display text-xs uppercase tracking-widest text-center font-bold hover:bg-brand-surface-low transition-all"
              >
                Back to Dashboard
              </Link>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-4 px-6 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display text-xs uppercase tracking-widest hover:bg-brand-primary-container transition-all shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
              >
                {submitting ? (
                  <>
                    <Compass className="h-4.5 w-4.5 animate-spin" />
                    SUBMITTING ANSWERS...
                  </>
                ) : (
                  <>
                    <Send className="h-4.5 w-4.5" />
                    SUBMIT ANSWERS
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // RENDER SUBMISSION RESULT CARD
          submittedResult && (
            <div className="max-w-xl mx-auto py-12 animate-fade-in">
              <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
                {/* Bauhaus accents */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-mustard border-b-2 border-l-2 border-brand-on-surface -z-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-secondary border-t-2 border-r-2 border-brand-on-surface -z-10"></div>

                <div className="inline-flex p-4 bg-brand-mustard border-2 border-brand-on-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] text-brand-on-surface">
                  {submittedResult.progress.is_finished ? (
                    <Trophy className="h-10 w-10 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="h-10 w-10" />
                  )}
                </div>

                <h2 className="font-display text-3xl font-black uppercase text-brand-on-surface">
                  {submittedResult.progress.is_finished ? 'HUNT COMPLETED!' : 'QUIZ RESOLVED!'}
                </h2>
                
                <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed max-w-sm mx-auto">
                  Server computed evaluation successfully for barrel challenge: <br />
                  <strong className="text-brand-on-surface uppercase mt-2 block">"{submittedResult.quiz_title}"</strong>
                </p>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-2">
                  <div className="bg-brand-surface border-2 border-brand-on-surface p-4">
                    <span className="font-mono text-[9px] text-brand-on-surface-variant uppercase block font-bold">Points Awarded</span>
                    <strong className="font-display text-2xl font-black text-brand-primary">+{submittedResult.score} XP</strong>
                    <span className="font-mono text-[8px] text-brand-on-surface-variant block mt-1">({submittedResult.correct_count}/5 CORRECT)</span>
                  </div>

                  <div className="bg-brand-surface border-2 border-brand-on-surface p-4">
                    <span className="font-mono text-[9px] text-brand-on-surface-variant uppercase block font-bold">Elapsed Duration</span>
                    <strong className="font-display text-2xl font-black text-brand-secondary">{submittedResult.time_taken_seconds}s</strong>
                    <span className="font-mono text-[8px] text-brand-on-surface-variant block mt-1">SECURE AUDIT APPROVED</span>
                  </div>
                </div>

                <div className="py-3 border-t border-b border-brand-on-surface flex justify-between items-center text-xs font-mono font-bold uppercase text-brand-on-surface-variant px-4">
                  <span>Completed Barrels:</span>
                  <span className="text-brand-on-surface">{submittedResult.progress.completed_quizzes} / 10</span>
                </div>

                {/* Next target or finish message */}
                {!submittedResult.progress.is_finished && submittedResult.progress.next_barrel_id ? (
                  <div className="p-4 bg-brand-surface-low border-2 border-brand-on-surface space-y-2 mt-4 text-center">
                    <span className="font-mono text-[10px] text-brand-primary uppercase font-bold block tracking-widest flex items-center justify-center gap-1">
                      <MapPin className="h-3.5 w-3.5 animate-bounce" />
                      NEXT TARGET SPECIFICATION
                    </span>
                    <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">
                      LOCATE & SCAN BARREL #{submittedResult.progress.next_barrel_id}
                    </h3>
                    <p className="text-[10px] text-brand-on-surface-variant leading-relaxed max-w-xs mx-auto">
                      Review clues on the dashboard. Proceed to coordinates and scan Barrel #{submittedResult.progress.next_barrel_id} to continue.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-brand-secondary-container border-2 border-brand-on-surface space-y-1 mt-4">
                    <span className="font-mono text-[10px] text-brand-secondary uppercase font-bold block">MISSION DECODED</span>
                    <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">CONGRATULATIONS</h3>
                    <p className="text-[10px] text-brand-on-surface-variant leading-relaxed max-w-xs mx-auto">
                      All 10 physical location sequences completed. Proceed to main lobby.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/"
                    className="flex-1 py-3.5 bg-brand-surface border-2 border-brand-on-surface font-display text-xs uppercase font-bold hover:bg-brand-surface-low transition-all text-center"
                  >
                    Dashboard
                  </Link>

                  {!submittedResult.progress.is_finished ? (
                    <Link
                      href={`/barrel/${submittedResult.progress.next_barrel_id}`}
                      className="flex-1 py-3.5 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display text-xs uppercase font-bold shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all text-center"
                    >
                      Scan Next
                    </Link>
                  ) : (
                    <Link
                      href="/leaderboard"
                      className="flex-1 py-3.5 bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-display text-xs uppercase font-bold hover:bg-opacity-95 shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] transition-all text-center"
                    >
                      Leaderboards
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
