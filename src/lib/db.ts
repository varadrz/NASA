// Database Adapter supporting both Real Supabase and Mock local fallback
// Location: src/lib/db.ts

import { createClient } from '@supabase/supabase-js';
import { MockDB } from './mock-db';

// Rebuild trigger: updated production environment settings

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if we have real credentials (not placeholders)
const isRealSupabaseConfigured = (): boolean => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;
  if (SUPABASE_URL.includes('your-project-id')) return false;
  if (SUPABASE_SERVICE_KEY.includes('your-')) return false;
  return true;
};

export const IS_REAL_DB = isRealSupabaseConfigured();

const checkProductionDbGuard = () => {
  if (process.env.NODE_ENV === 'production' && !IS_REAL_DB) {
    const reasons: string[] = [];
    if (!SUPABASE_URL) {
      reasons.push("NEXT_PUBLIC_SUPABASE_URL is missing or empty");
    } else {
      if (SUPABASE_URL.includes('your-project-id')) reasons.push("NEXT_PUBLIC_SUPABASE_URL contains placeholder 'your-project-id'");
      reasons.push(`NEXT_PUBLIC_SUPABASE_URL length: ${SUPABASE_URL.length}`);
    }

    if (!SUPABASE_SERVICE_KEY) {
      reasons.push("SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY are both missing or empty");
    } else {
      if (SUPABASE_SERVICE_KEY.includes('your-')) reasons.push("SUPABASE_SERVICE_KEY contains placeholder 'your-'");
      reasons.push(`SUPABASE_SERVICE_KEY length: ${SUPABASE_SERVICE_KEY.length}`);
    }

    throw new Error(`CRITICAL CONFIGURATION ERROR: Supabase database is not configured. Mock DB cannot be used in production environments to prevent data loss. Details: [${reasons.join(', ')}]. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings.`);
  }
};

// Initialize real Supabase client if configured (using service role key to act as admin/bypass RLS on server side)
export const supabase = IS_REAL_DB 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

// Unified Database Client
export const DB = {
  isRealDatabase(): boolean {
    return IS_REAL_DB;
  },

  // Participants
  async getParticipantById(id: string) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getParticipantById(id);

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching participant by ID:', error);
      return null;
    }
    return data;
  },

  async getParticipantByRegistrationId(regId: string) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getParticipantByRegistrationId(regId);

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .ilike('registration_id', regId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching participant by registration ID:', error);
      return null;
    }
    return data;
  },

  async getParticipantsByName(name: string) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getParticipantsByName(name);

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .ilike('full_name', name.trim());

    if (error) {
      console.error('Error fetching participants by name:', error);
      return [];
    }
    return data || [];
  },

  async updateParticipantDetails(id: string, details: { full_name: string; college_name: string; phone_number: string; instagram_id: string }): Promise<any> {
    if (!IS_REAL_DB || !supabase) return await MockDB.updateParticipantDetails(id, details);

    const formattedInsta = details.instagram_id.replace(/^@+/, '');

    // 1. Try to update with has_edited = true
    const { data, error } = await supabase
      .from('participants')
      .update({
        full_name: details.full_name,
        college_name: details.college_name,
        phone_number: details.phone_number,
        instagram_id: formattedInsta,
        has_edited: true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // If the column has_edited doesn't exist, try updating without it!
      if (error.code === '42703') {
        console.warn('Column has_edited does not exist in participants table. Retrying update without it.');
        const { data: retryData, error: retryError } = await supabase
          .from('participants')
          .update({
            full_name: details.full_name,
            college_name: details.college_name,
            phone_number: details.phone_number,
            instagram_id: formattedInsta
          })
          .eq('id', id)
          .select()
          .single();

        if (retryError) {
          console.error('Error updating participant details:', retryError);
          throw new Error(retryError.message || 'Failed to update participant details');
        }

        // To make sure it is marked as edited, we also append it to peer_targets
        const progress = await this.getParticipantProgress(id);
        if (progress) {
          let targets = progress.peer_targets || [];
          if (!Array.isArray(targets)) targets = [];
          if (!targets.some((t: any) => t.name === '__SYSTEM_DETAILS_EDITED__')) {
            targets.push({ name: '__SYSTEM_DETAILS_EDITED__', found: true });
            await supabase
              .from('participant_progress')
              .update({ peer_targets: targets })
              .eq('participant_id', id);
          }
        }

        return retryData;
      }
      console.error('Error updating participant details:', error);
      throw new Error(error.message || 'Failed to update participant details');
    }

    // Even if column exists, write to peer_targets too for extra redundancy
    const progress = await this.getParticipantProgress(id);
    if (progress) {
      let targets = progress.peer_targets || [];
      if (!Array.isArray(targets)) targets = [];
      if (!targets.some((t: any) => t.name === '__SYSTEM_DETAILS_EDITED__')) {
        targets.push({ name: '__SYSTEM_DETAILS_EDITED__', found: true });
        await supabase
          .from('participant_progress')
          .update({ peer_targets: targets })
          .eq('participant_id', id);
      }
    }

    return data;
  },

  async createParticipant(pData: {
    full_name: string;
    college_name: string;
    phone_number: string;
    registration_id: string;
    instagram_id?: string;
  }) {
    checkProductionDbGuard();
    if (!IS_REAL_DB || !supabase) return await MockDB.createParticipant(pData);

    // 1. Insert participant
    const { data: participant, error: pError } = await supabase
      .from('participants')
      .insert({
        full_name: pData.full_name,
        college_name: pData.college_name,
        phone_number: pData.phone_number,
        registration_id: pData.registration_id,
        instagram_id: pData.instagram_id || '',
        is_disabled: false
      })
      .select()
      .single();

    if (pError || !participant) {
      console.error('Error creating participant:', pError);
      throw new Error(pError?.message || 'Failed to create participant');
    }

    // 2. Initialize progress with a random first barrel (1 to 20)
    const firstBarrelId = Math.floor(Math.random() * 20) + 1;
    const { error: progError } = await supabase
      .from('participant_progress')
      .insert({
        participant_id: participant.id,
        completed_quizzes: 0,
        total_score: 0,
        total_time: 0,
        next_barrel_id: firstBarrelId,
        current_attempt_id: null
      });

    if (progError) {
      console.error('Error creating participant progress:', progError);
      // Clean up participant to maintain integrity
      await supabase.from('participants').delete().eq('id', participant.id);
      throw new Error(progError.message || 'Failed to create participant progress');
    }

    return participant;
  },

  async getAllParticipants() {
    if (!IS_REAL_DB || !supabase) return await MockDB.getAllParticipants();

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all participants:', error);
      return [];
    }
    return data || [];
  },

  async updateParticipantStatus(id: string, isDisabled: boolean) {
    checkProductionDbGuard();
    if (!IS_REAL_DB || !supabase) return await MockDB.updateParticipantStatus(id, isDisabled);

    const { error } = await supabase
      .from('participants')
      .update({ is_disabled: isDisabled })
      .eq('id', id);

    if (error) {
      console.error('Error updating participant status:', error);
      return false;
    }
    return true;
  },

  // Progress
  async getParticipantProgress(participantId: string) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getParticipantProgress(participantId);

    const { data, error } = await supabase
      .from('participant_progress')
      .select('*')
      .eq('participant_id', participantId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching participant progress:', error);
      return null;
    }
    return data;
  },

  async updateParticipantProgress(progress: {
    participant_id: string;
    completed_quizzes: number;
    total_score: number;
    total_time: number;
    next_barrel_id: number | null;
    current_attempt_id: string | null;
    peer_targets?: any;
  }) {
    checkProductionDbGuard();
    if (!IS_REAL_DB || !supabase) {
      await MockDB.updateParticipantProgress(progress as any);
      return;
    }

    const { error } = await supabase
      .from('participant_progress')
      .upsert({
        participant_id: progress.participant_id,
        completed_quizzes: progress.completed_quizzes,
        total_score: progress.total_score,
        total_time: progress.total_time,
        next_barrel_id: progress.next_barrel_id,
        current_attempt_id: progress.current_attempt_id,
        peer_targets: progress.peer_targets,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating participant progress:', error);
      throw new Error(error.message);
    }
  },

  // Quizzes & Questions
  async getQuizByBarrelId(barrelId: number) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getQuizByBarrelId(barrelId);

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('barrel_id', barrelId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching quiz by barrel ID:', error);
      return null;
    }
    return data;
  },

  async getAllQuizzes() {
    if (!IS_REAL_DB || !supabase) return await MockDB.getAllQuizzes();

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('barrel_id', { ascending: true });

    if (error) {
      console.error('Error fetching all quizzes:', error);
      return [];
    }
    return data || [];
  },

  async getQuestionsByQuizId(quizId: string) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getQuestionsByQuizId(quizId);

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId);

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
    return data || [];
  },

  // Attempts
  async createAttempt(participantId: string, quizId: string) {
    checkProductionDbGuard();
    if (!IS_REAL_DB || !supabase) return await MockDB.createAttempt(participantId, quizId);

    // Check for existing active attempt
    const { data: active } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('participant_id', participantId)
      .eq('quiz_id', quizId)
      .eq('is_completed', false)
      .maybeSingle();

    if (active) return active;

    // Create new attempt
    const { data: newAttempt, error: createError } = await supabase
      .from('quiz_attempts')
      .insert({
        participant_id: participantId,
        quiz_id: quizId,
        score: 0,
        time_taken_seconds: 0,
        is_completed: false
      })
      .select()
      .single();

    if (createError || !newAttempt) {
      console.error('Error creating attempt:', createError);
      throw new Error(createError?.message || 'Failed to create attempt');
    }

    // Update progress with current attempt ID
    const { error: progError } = await supabase
      .from('participant_progress')
      .update({ current_attempt_id: newAttempt.id })
      .eq('participant_id', participantId);

    if (progError) {
      console.error('Error linking current attempt to progress:', progError);
    }

    return newAttempt;
  },

  async getAttemptById(attemptId: string) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getAttemptById(attemptId);

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching attempt:', error);
      return null;
    }
    return data;
  },

  async submitAttempt(attemptId: string, score: number, timeTaken: number) {
    checkProductionDbGuard();
    if (!IS_REAL_DB || !supabase) return await MockDB.submitAttempt(attemptId, score, timeTaken);

    const { data, error } = await supabase
      .from('quiz_attempts')
      .update({
        score,
        time_taken_seconds: timeTaken,
        submitted_at: new Date().toISOString(),
        is_completed: true
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error) {
      console.error('Error submitting attempt:', error);
      return null;
    }
    return data;
  },

  async getCompletedAttempts(participantId: string) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getCompletedAttempts(participantId);

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('participant_id', participantId)
      .eq('is_completed', true);

    if (error) {
      console.error('Error fetching completed attempts:', error);
      return [];
    }
    return data || [];
  },

  // Leaderboard & Analytics
  async getOverallLeaderboard() {
    if (!IS_REAL_DB || !supabase) return await MockDB.getOverallLeaderboard();

    // Query progress joined with participants
    const { data, error } = await supabase
      .from('participant_progress')
      .select(`
        participant_id,
        completed_quizzes,
        total_score,
        total_time,
        participants!inner(full_name, college_name, registration_id, instagram_id, is_disabled)
      `)
      .eq('participants.is_disabled', false)
      .order('total_score', { ascending: false })
      .order('total_time', { ascending: true });

    if (error) {
      console.error('Error fetching overall leaderboard:', error);
      return [];
    }

    return (data || []).map((row: any, idx: number) => ({
      participant_id: row.participant_id,
      full_name: row.participants?.full_name || 'Unknown',
      college_name: row.participants?.college_name || 'Unknown',
      registration_id: row.participants?.registration_id || '',
      instagram_id: row.participants?.instagram_id || '',
      completed_quizzes: row.completed_quizzes,
      total_score: row.total_score,
      total_time: row.total_time,
      rank: idx + 1
    }));
  },

  async getQuizLeaderboard(barrelId: number) {
    if (!IS_REAL_DB || !supabase) return await MockDB.getQuizLeaderboard(barrelId);

    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('barrel_id', barrelId)
      .single();

    if (!quiz) return [];

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        participant_id,
        score,
        time_taken_seconds,
        submitted_at,
        participants!inner(full_name, college_name, instagram_id, is_disabled)
      `)
      .eq('quiz_id', quiz.id)
      .eq('is_completed', true)
      .eq('participants.is_disabled', false)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true });

    if (error) {
      console.error('Error fetching quiz leaderboard:', error);
      return [];
    }

    return (data || []).map((row: any, idx: number) => ({
      participant_id: row.participant_id,
      full_name: row.participants?.full_name || 'Unknown',
      college_name: row.participants?.college_name || 'Unknown',
      instagram_id: row.participants?.instagram_id || '',
      score: row.score,
      time_taken_seconds: row.time_taken_seconds,
      submitted_at: row.submitted_at,
      rank: idx + 1
    }));
  },

  // Audit Logs
  async logAudit(participantId: string | null, action: string, ip: string, ua: string) {
    checkProductionDbGuard();
    if (!IS_REAL_DB || !supabase) {
      await MockDB.logAudit(participantId, action, ip, ua);
      return;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        participant_id: participantId,
        action,
        ip_address: ip || '127.0.0.1',
        user_agent: ua || 'Unknown'
      });

    if (error) {
      console.error('Error writing audit log:', error);
    }
  },

  async getAuditLogs() {
    if (!IS_REAL_DB || !supabase) return await MockDB.getAuditLogs();

    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        participant_id,
        action,
        ip_address,
        user_agent,
        created_at,
        participants(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      participant_id: row.participant_id,
      action: row.action,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: row.created_at,
      full_name: row.participants?.full_name || null
    }));
  },

  // Event Reset
  async resetEvent() {
    checkProductionDbGuard();
    if (!IS_REAL_DB || !supabase) {
      await MockDB.resetEvent();
      return;
    }

    // Delete participants (cascade deletes progress and attempts and audit logs if FK has CASCADE)
    const { error: pError } = await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (pError) console.error('Error during database wipe:', pError);

    // Also delete any dangling audits
    const { error: aError } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (aError) console.error('Error during audit logs wipe:', aError);
  },

  // Admin Database Seeding helper (inserts questions to Supabase)
  async seedQuestions(questions: any[]) {
    if (!IS_REAL_DB || !supabase) return { success: true, count: 100 };

    try {
      // 1. Seed or update quizzes
      for (const qSeed of questions) {
        const { error: qError } = await supabase
          .from('quizzes')
          .upsert({
            barrel_id: qSeed.barrel_id,
            title: qSeed.title,
            description: qSeed.description
          }, { onConflict: 'barrel_id' });

        if (qError) {
          console.error(`Error seeding quiz for barrel ${qSeed.barrel_id}:`, qError);
          return { success: false, error: `Failed to seed quiz for barrel ${qSeed.barrel_id}: ${qError.message}` };
        }
      }

      // 2. Clear existing questions to prevent duplicates
      await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 3. Prepare list
      const insertList: any[] = [];
      for (const qSeed of questions) {
        // Find matching quiz in Supabase
        const { data: quiz } = await supabase
          .from('quizzes')
          .select('id')
          .eq('barrel_id', qSeed.barrel_id)
          .single();

        if (quiz) {
          qSeed.questions.forEach((q: any) => {
            let correctText = '';
            if (q.correct_answer === 'A') correctText = q.option_a;
            else if (q.correct_answer === 'B') correctText = q.option_b;
            else if (q.correct_answer === 'C') correctText = q.option_c;
            else if (q.correct_answer === 'D') correctText = q.option_d;

            const options = [
              { text: q.option_a },
              { text: q.option_b },
              { text: q.option_c },
              { text: q.option_d }
            ];

            // Fisher-Yates shuffle
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [options[i], options[j]] = [options[j], options[i]];
            }

            // Find which option matches correctText
            let newCorrectAnswer: 'A' | 'B' | 'C' | 'D' = 'A';
            const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
            options.forEach((opt, idx) => {
              if (opt.text === correctText) {
                newCorrectAnswer = keys[idx];
              }
            });

            insertList.push({
              quiz_id: quiz.id,
              question: q.question,
              option_a: options[0].text,
              option_b: options[1].text,
              option_c: options[2].text,
              option_d: options[3].text,
              correct_answer: newCorrectAnswer
            });
          });
        }
      }

      // 4. Batch insert questions
      const { error } = await supabase.from('questions').insert(insertList);
      if (error) {
        console.error('Error bulk inserting questions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, count: insertList.length };
    } catch (err: any) {
      console.error('Seeding catch error:', err);
      return { success: false, error: err.message };
    }
  }
};
