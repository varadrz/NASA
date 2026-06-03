import { NextRequest, NextResponse } from 'next/server';
import { DB, supabase } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

// GET all quizzes
export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const quizzes = await DB.getAllQuizzes();
    return NextResponse.json({ quizzes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch quizzes.' }, { status: 500 });
  }
}

// POST create quiz
export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { barrel_id, title, description } = await request.json();
    if (barrel_id === undefined || !title || !description) {
      return NextResponse.json({ error: 'barrel_id, title, and description are required.' }, { status: 400 });
    }

    const bId = parseInt(barrel_id, 10);
    if (isNaN(bId) || bId < 1 || bId > 20) {
      return NextResponse.json({ error: 'barrel_id must be an integer between 1 and 20.' }, { status: 400 });
    }

    let quiz;
    if (DB.isRealDatabase() && supabase) {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ barrel_id: bId, title, description })
        .select()
        .single();
      if (error) throw new Error(error.message);
      quiz = data;
    } else {
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      
      // Check duplicate barrel_id
      if (db.quizzes.some((q: any) => q.barrel_id === bId)) {
        return NextResponse.json({ error: `Quiz for barrel #${bId} already exists.` }, { status: 400 });
      }

      quiz = {
        id: crypto.randomUUID(),
        barrel_id: bId,
        title,
        description
      };
      db.quizzes.push(quiz);
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator created quiz for Barrel #${bId}: "${title}"`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create quiz.' }, { status: 500 });
  }
}

// PUT update quiz
export async function PUT(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id, barrel_id, title, description } = await request.json();
    if (!id || barrel_id === undefined || !title || !description) {
      return NextResponse.json({ error: 'id, barrel_id, title, and description are required.' }, { status: 400 });
    }

    const bId = parseInt(barrel_id, 10);
    if (isNaN(bId) || bId < 1 || bId > 20) {
      return NextResponse.json({ error: 'barrel_id must be an integer between 1 and 20.' }, { status: 400 });
    }

    if (DB.isRealDatabase() && supabase) {
      const { error } = await supabase
        .from('quizzes')
        .update({ barrel_id: bId, title, description })
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      const idx = db.quizzes.findIndex((q: any) => q.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
      }

      // Check duplicate barrel_id on other quiz
      if (db.quizzes.some((q: any) => q.barrel_id === bId && q.id !== id)) {
        return NextResponse.json({ error: `Quiz for barrel #${bId} already exists.` }, { status: 400 });
      }

      db.quizzes[idx] = { ...db.quizzes[idx], barrel_id: bId, title, description };
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator updated quiz for Barrel #${bId}: "${title}"`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update quiz.' }, { status: 500 });
  }
}

// DELETE quiz
export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Quiz ID is required.' }, { status: 400 });
    }

    if (DB.isRealDatabase() && supabase) {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      db.quizzes = db.quizzes.filter((q: any) => q.id !== id);
      db.questions = db.questions.filter((q: any) => q.quiz_id !== id);
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator deleted quiz ID: ${id}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete quiz.' }, { status: 500 });
  }
}
