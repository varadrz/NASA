// Persistent JSON/In-memory database for local fallback when Supabase is not configured
// Location: src/lib/mock-db.ts

import fs from 'fs';
import path from 'path';
import { questionsData, QuizSeed, QuestionInput } from './questions-data';

interface Participant {
  id: string;
  full_name: string;
  college_name: string;
  phone_number: string;
  registration_id: string;
  instagram_id?: string;
  is_disabled: boolean;
  created_at: string;
}

interface Quiz {
  id: string;
  barrel_id: number;
  title: string;
  description: string;
}

interface Question {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
}

interface QuizAttempt {
  id: string;
  participant_id: string;
  quiz_id: string;
  score: number;
  time_taken_seconds: number;
  started_at: string;
  submitted_at: string | null;
  is_completed: boolean;
}

interface ParticipantProgress {
  participant_id: string;
  completed_quizzes: number;
  total_score: number;
  total_time: number;
  next_barrel_id: number | null;
  current_attempt_id: string | null;
  peer_targets?: any;
  updated_at: string;
}

interface AuditLog {
  id: string;
  participant_id: string | null;
  action: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface DBStructure {
  participants: Participant[];
  quizzes: Quiz[];
  questions: Question[];
  quiz_attempts: QuizAttempt[];
  participant_progress: ParticipantProgress[];
  audit_logs: AuditLog[];
}

const DB_FILE = path.join(process.cwd(), 'mock_db.json');

// Global memory state fallback (for read-only systems like Vercel serverless)
let memoryDB: DBStructure | null = null;

function initializeDB(): DBStructure {
  const defaultDB: DBStructure = {
    participants: [],
    quizzes: [],
    questions: [],
    quiz_attempts: [],
    participant_progress: [],
    audit_logs: []
  };

  // Seed quizzes and questions from questionsData
  let questionCount = 1;
  questionsData.forEach((qSeed) => {
    const quizId = `quiz-uuid-${qSeed.barrel_id}`;
    defaultDB.quizzes.push({
      id: quizId,
      barrel_id: qSeed.barrel_id,
      title: qSeed.title,
      description: qSeed.description
    });

    qSeed.questions.forEach((q, idx) => {
      defaultDB.questions.push({
        id: `question-uuid-${qSeed.barrel_id}-${idx + 1}`,
        quiz_id: quizId,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer
      });
    });
  });

  return defaultDB;
}

export function getDB(): DBStructure {
  if (memoryDB) return memoryDB;

  try {
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      // Validate structure contains quizzes
      if (parsed.quizzes && parsed.quizzes.length > 0) {
        // Self-healing migration for new global architecture questions
        if (parsed.quizzes[0] && parsed.quizzes[0].title.includes('Charminar')) {
          console.log('Migrating mock_db.json to new Global Architecture questions pool...');
          const fresh = initializeDB();
          parsed.quizzes = fresh.quizzes;
          parsed.questions = fresh.questions;
          parsed.quiz_attempts = [];
          parsed.participant_progress = (parsed.participant_progress || []).map((p: any) => ({
            ...p,
            completed_quizzes: 0,
            total_score: 0,
            total_time: 0,
            next_barrel_id: Math.floor(Math.random() * 20) + 1,
            current_attempt_id: null,
            peer_targets: null
          }));
          try {
            fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
          } catch (writeErr) {
            console.error('Failed to write migrated mock_db.json:', writeErr);
          }
        }
        memoryDB = parsed;
        return memoryDB!;
      }
    }
  } catch (error) {
    console.warn('Failed to read mock_db.json file, falling back to memory DB:', error);
  }

  // If file doesn't exist or failed to load, initialize the DB
  memoryDB = initializeDB();
  saveDB(memoryDB);
  return memoryDB;
}

export function saveDB(db: DBStructure): void {
  memoryDB = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    // Graceful fallback for read-only environments
    // No-op - already saved in memoryDB variable
  }
}

// -------------------------------------------------------------
// Database Operations Wrappers
// -------------------------------------------------------------

export const MockDB = {
  // Participants
  async getParticipantById(id: string): Promise<Participant | null> {
    const db = getDB();
    return db.participants.find(p => p.id === id) || null;
  },

  async getParticipantByRegistrationId(regId: string): Promise<Participant | null> {
    const db = getDB();
    return db.participants.find(p => p.registration_id.toLowerCase() === regId.toLowerCase()) || null;
  },

  async createParticipant(pData: Omit<Participant, 'id' | 'is_disabled' | 'created_at'>): Promise<Participant> {
    const db = getDB();
    const newParticipant: Participant = {
      id: `part-${Math.random().toString(36).substr(2, 9)}`,
      full_name: pData.full_name,
      college_name: pData.college_name,
      phone_number: pData.phone_number,
      registration_id: pData.registration_id,
      instagram_id: pData.instagram_id || '',
      is_disabled: false,
      created_at: new Date().toISOString()
    };
    db.participants.push(newParticipant);

    // Also initialize progress
    // Randomly assign first barrel (1 to 20)
    const firstBarrelId = Math.floor(Math.random() * 20) + 1;
    const newProgress: ParticipantProgress = {
      participant_id: newParticipant.id,
      completed_quizzes: 0,
      total_score: 0,
      total_time: 0,
      next_barrel_id: firstBarrelId,
      current_attempt_id: null,
      peer_targets: null,
      updated_at: new Date().toISOString()
    };
    db.participant_progress.push(newProgress);

    saveDB(db);
    return newParticipant;
  },

  async getAllParticipants(): Promise<Participant[]> {
    const db = getDB();
    return db.participants;
  },

  async updateParticipantStatus(id: string, isDisabled: boolean): Promise<boolean> {
    const db = getDB();
    const idx = db.participants.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.participants[idx].is_disabled = isDisabled;
      saveDB(db);
      return true;
    }
    return false;
  },

  // Progress
  async getParticipantProgress(participantId: string): Promise<ParticipantProgress | null> {
    const db = getDB();
    return db.participant_progress.find(p => p.participant_id === participantId) || null;
  },

  async updateParticipantProgress(progress: ParticipantProgress): Promise<void> {
    const db = getDB();
    const idx = db.participant_progress.findIndex(p => p.participant_id === progress.participant_id);
    if (idx !== -1) {
      db.participant_progress[idx] = {
        ...progress,
        updated_at: new Date().toISOString()
      };
    } else {
      db.participant_progress.push(progress);
    }
    saveDB(db);
  },

  // Quizzes & Questions
  async getQuizByBarrelId(barrelId: number): Promise<Quiz | null> {
    const db = getDB();
    return db.quizzes.find(q => q.barrel_id === barrelId) || null;
  },

  async getAllQuizzes(): Promise<Quiz[]> {
    const db = getDB();
    return db.quizzes;
  },

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const db = getDB();
    return db.questions.filter(q => q.quiz_id === quizId);
  },

  // Attempts
  async createAttempt(participantId: string, quizId: string): Promise<QuizAttempt> {
    const db = getDB();
    // Check if there's already an active (unsubmitted) attempt for this quiz
    const active = db.quiz_attempts.find(
      a => a.participant_id === participantId && a.quiz_id === quizId && !a.is_completed
    );
    if (active) return active;

    const newAttempt: QuizAttempt = {
      id: `attempt-${Math.random().toString(36).substr(2, 9)}`,
      participant_id: participantId,
      quiz_id: quizId,
      score: 0,
      time_taken_seconds: 0,
      started_at: new Date().toISOString(),
      submitted_at: null,
      is_completed: false
    };

    db.quiz_attempts.push(newAttempt);

    // Update progress with current attempt ID
    const progIdx = db.participant_progress.findIndex(p => p.participant_id === participantId);
    if (progIdx !== -1) {
      db.participant_progress[progIdx].current_attempt_id = newAttempt.id;
    }

    saveDB(db);
    return newAttempt;
  },

  async getAttemptById(attemptId: string): Promise<QuizAttempt | null> {
    const db = getDB();
    return db.quiz_attempts.find(a => a.id === attemptId) || null;
  },

  async submitAttempt(attemptId: string, score: number, timeTaken: number): Promise<QuizAttempt | null> {
    const db = getDB();
    const idx = db.quiz_attempts.findIndex(a => a.id === attemptId);
    if (idx === -1) return null;

    const attempt = db.quiz_attempts[idx];
    attempt.score = score;
    attempt.time_taken_seconds = timeTaken;
    attempt.submitted_at = new Date().toISOString();
    attempt.is_completed = true;

    saveDB(db);
    return attempt;
  },

  async getCompletedAttempts(participantId: string): Promise<QuizAttempt[]> {
    const db = getDB();
    return db.quiz_attempts.filter(a => a.participant_id === participantId && a.is_completed);
  },

  // Leaderboard & Analytics
  async getOverallLeaderboard(): Promise<any[]> {
    const db = getDB();
    // Join progress and participant name
    return db.participant_progress
      .map(p => {
        const participant = db.participants.find(part => part.id === p.participant_id);
        return {
          participant_id: p.participant_id,
          full_name: participant?.full_name || 'Unknown',
          college_name: participant?.college_name || 'Unknown',
          registration_id: participant?.registration_id || '',
          instagram_id: participant?.instagram_id || '',
          completed_quizzes: p.completed_quizzes,
          total_score: p.total_score,
          total_time: p.total_time,
          is_disabled: participant?.is_disabled || false
        };
      })
      .filter(p => !p.is_disabled) // filter out disabled participants
      .sort((a, b) => {
        // Sort by total score descending
        if (b.total_score !== a.total_score) {
          return b.total_score - a.total_score;
        }
        // Tie-breaker: lowest total time ascending
        return a.total_time - b.total_time;
      })
      .map((p, idx) => ({ ...p, rank: idx + 1 }));
  },

  async getQuizLeaderboard(barrelId: number): Promise<any[]> {
    const db = getDB();
    const quiz = db.quizzes.find(q => q.barrel_id === barrelId);
    if (!quiz) return [];

    // Filter attempts for this quiz and join names
    return db.quiz_attempts
      .filter(a => a.quiz_id === quiz.id && a.is_completed)
      .map(a => {
        const participant = db.participants.find(p => p.id === a.participant_id);
        return {
          participant_id: a.participant_id,
          full_name: participant?.full_name || 'Unknown',
          college_name: participant?.college_name || 'Unknown',
          instagram_id: participant?.instagram_id || '',
          score: a.score,
          time_taken_seconds: a.time_taken_seconds,
          submitted_at: a.submitted_at,
          is_disabled: participant?.is_disabled || false
        };
      })
      .filter(a => !a.is_disabled)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_taken_seconds - b.time_taken_seconds;
      })
      .map((a, idx) => ({ ...a, rank: idx + 1 }));
  },

  // Audit Logs
  async logAudit(participantId: string | null, action: string, ip: string, ua: string): Promise<void> {
    const db = getDB();
    db.audit_logs.push({
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      participant_id: participantId,
      action,
      ip_address: ip || '127.0.0.1',
      user_agent: ua || 'Unknown',
      created_at: new Date().toISOString()
    });
    saveDB(db);
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const db = getDB();
    return [...db.audit_logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Event Reset
  async resetEvent(): Promise<void> {
    const db = getDB();
    db.participants = [];
    db.quiz_attempts = [];
    db.participant_progress = [];
    db.audit_logs = [];
    saveDB(db);
  }
};
