import { NextRequest, NextResponse } from 'next/server';
import { DB, supabase } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

// GET questions
export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quiz_id');

    let questions = [];
    if (quizId) {
      questions = await DB.getQuestionsByQuizId(quizId);
    } else {
      if (DB.isRealDatabase() && supabase) {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw new Error(error.message);
        questions = data || [];
      } else {
        const { getDB } = require('@/lib/mock-db');
        const db = getDB();
        questions = db.questions || [];
      }
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch questions.' }, { status: 500 });
  }
}

// POST create question
export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { quiz_id, question, option_a, option_b, option_c, option_d, correct_answer } = await request.json();
    if (!quiz_id || !question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return NextResponse.json({ error: 'quiz_id, question, options (a-d), and correct_answer are required.' }, { status: 400 });
    }

    const cleanedAns = correct_answer.toUpperCase().trim();
    if (!['A', 'B', 'C', 'D'].includes(cleanedAns)) {
      return NextResponse.json({ error: 'correct_answer must be A, B, C, or D.' }, { status: 400 });
    }

    let qRecord;
    if (DB.isRealDatabase() && supabase) {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          quiz_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer: cleanedAns
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      qRecord = data;
    } else {
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      qRecord = {
        id: crypto.randomUUID(),
        quiz_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer: cleanedAns
      };
      db.questions.push(qRecord);
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator created a new question under Quiz ID: ${quiz_id}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true, question: qRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create question.' }, { status: 500 });
  }
}

// PUT update question
export async function PUT(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer } = await request.json();
    if (!id || !quiz_id || !question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return NextResponse.json({ error: 'id, quiz_id, question, options (a-d), and correct_answer are required.' }, { status: 400 });
    }

    const cleanedAns = correct_answer.toUpperCase().trim();
    if (!['A', 'B', 'C', 'D'].includes(cleanedAns)) {
      return NextResponse.json({ error: 'correct_answer must be A, B, C, or D.' }, { status: 400 });
    }

    if (DB.isRealDatabase() && supabase) {
      const { error } = await supabase
        .from('questions')
        .update({
          quiz_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer: cleanedAns
        })
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      const idx = db.questions.findIndex((q: any) => q.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Question not found.' }, { status: 404 });
      }

      db.questions[idx] = {
        ...db.questions[idx],
        quiz_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer: cleanedAns
      };
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator updated question ID: ${id}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update question.' }, { status: 500 });
  }
}

// DELETE question
export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Question ID is required.' }, { status: 400 });
    }

    if (DB.isRealDatabase() && supabase) {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      db.questions = db.questions.filter((q: any) => q.id !== id);
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator deleted question ID: ${id}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete question.' }, { status: 500 });
  }
}
