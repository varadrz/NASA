// Admin Participant Management API Route Handler
// Location: src/app/api/admin/participants/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB, supabase } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const participants = await DB.getAllParticipants();
    
    // Enrich with progress details
    const enrichedList = await Promise.all(
      participants.map(async (p) => {
        const prog = await DB.getParticipantProgress(p.id);
        return {
          id: p.id,
          app_id: (p as any).app_id || '',
          full_name: p.full_name,
          college_name: p.college_name,
          phone_number: p.phone_number,
          registration_id: p.registration_id,
          instagram_id: p.instagram_id || '',
          is_disabled: p.is_disabled,
          created_at: p.created_at,
          completed_quizzes: prog?.completed_quizzes || 0,
          total_score: prog?.total_score || 0,
          total_time: prog?.total_time || 0,
          next_barrel_id: prog?.next_barrel_id || null
        };
      })
    );

    return NextResponse.json({ participants: enrichedList });
  } catch (error) {
    console.error('Admin fetch participants error:', error);
    return NextResponse.json({ error: 'Failed to fetch participants.' }, { status: 500 });
  }
}

// Create, Update, or Toggle Participant Status
export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action || (body.isDisabled !== undefined ? 'toggleStatus' : 'update');
    
    if (action === 'toggleStatus') {
      const { id, isDisabled } = body;
      if (!id) {
        return NextResponse.json({ error: 'Participant ID is required.' }, { status: 400 });
      }

      const success = await DB.updateParticipantStatus(id, isDisabled);
      if (!success) {
        return NextResponse.json({ error: 'Participant not found or update failed.' }, { status: 404 });
      }

      const actionText = isDisabled ? 'disabled' : 'enabled';
      await DB.logAudit(
        null,
        `Administrator ${actionText} participant ID: ${id}`,
        request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        request.headers.get('user-agent') || 'Unknown'
      );

      return NextResponse.json({ success: true, message: `Participant status set to ${isDisabled ? 'Suspended' : 'Active'}.` });
    }

    if (action === 'create') {
      const { full_name, college_name, phone_number, registration_id, instagram_id } = body;
      if (!full_name || !college_name || !phone_number || !registration_id) {
        return NextResponse.json({ error: 'Full name, college, phone, and registration ID are required.' }, { status: 400 });
      }

      // Check for duplicate participant by Name and Phone combination
      const normalizePhone = (num: string) => num.replace(/\D/g, '');
      const existingParts = await DB.getParticipantsByName(full_name);
      const existing = existingParts.find(p => normalizePhone(p.phone_number) === normalizePhone(phone_number));
      if (existing) {
        return NextResponse.json(
          { error: 'A participant with this Full Name and Phone Number is already registered.' },
          { status: 409 }
        );
      }

      // Create using existing DB wrapper which sets up participant and progress
      const participant = await DB.createParticipant({
        full_name,
        college_name,
        phone_number,
        registration_id,
        instagram_id: instagram_id || ''
      });

      // If progress overrides are specified, apply them too
      if (body.completed_quizzes !== undefined || body.total_score !== undefined || body.total_time !== undefined || body.next_barrel_id !== undefined) {
        const completed_quizzes = parseInt(body.completed_quizzes || '0', 10);
        const total_score = parseInt(body.total_score || '0', 10);
        const total_time = parseInt(body.total_time || '0', 10);
        const next_barrel_id = body.next_barrel_id ? parseInt(body.next_barrel_id, 10) : null;

        await DB.updateParticipantProgress({
          participant_id: participant.id,
          completed_quizzes,
          total_score,
          total_time,
          next_barrel_id,
          current_attempt_id: null
        });
      }

      await DB.logAudit(
        null,
        `Administrator created participant: ${full_name} (${registration_id})`,
        request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        request.headers.get('user-agent') || 'Unknown'
      );

      return NextResponse.json({ success: true, message: 'Participant created successfully.', participant });
    }

    if (action === 'update') {
      const {
        id,
        full_name,
        college_name,
        phone_number,
        registration_id,
        instagram_id,
        is_disabled,
        completed_quizzes,
        total_score,
        total_time,
        next_barrel_id
      } = body;

      if (!id) {
        return NextResponse.json({ error: 'Participant ID is required for update.' }, { status: 400 });
      }

      // Check for duplicate participant by Name and Phone combination (excluding current participant ID)
      const normalizePhone = (num: string) => num.replace(/\D/g, '');
      const existingParts = await DB.getParticipantsByName(full_name);
      const taken = existingParts.find(p => p.id !== id && normalizePhone(p.phone_number) === normalizePhone(phone_number));
      if (taken) {
        return NextResponse.json(
          { error: 'This Full Name and Phone Number combination is already registered by another participant.' },
          { status: 409 }
        );
      }

      // Calculate/recalculate app_id if needed
      const currentParticipant = await DB.getParticipantById(id);
      let app_id = (currentParticipant as any)?.app_id;

      const regIdLower = registration_id.toLowerCase().trim();
      const currentRegIdLower = currentParticipant?.registration_id?.toLowerCase().trim();
      const currentCollege = currentParticipant?.college_name?.trim();

      if (!app_id || regIdLower !== currentRegIdLower || college_name.trim() !== currentCollege) {
        let seq = 1;
        if (DB.isRealDatabase() && supabase) {
          const { count, error: countError } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .ilike('registration_id', regIdLower);
          if (!countError && count !== null) {
            seq = count + 1;
          }
        } else {
          const { getDB } = require('@/lib/mock-db');
          const db = getDB();
          const count = db.participants.filter((x: any) => x.id !== id && x.registration_id.toLowerCase().trim() === regIdLower).length;
          seq = count + 1;
        }

        const zoneMatch = college_name.match(/\d+/);
        const zoneNum = zoneMatch ? zoneMatch[0] : '1';

        const regMatch = registration_id.match(/\d+/);
        const zIdDigits = regMatch ? regMatch[0] : '001';
        const zIdPadded = zIdDigits.padStart(3, '0');

        const seqPadded = String(seq).padStart(3, '0');

        app_id = `${zoneNum}${zIdPadded}${seqPadded}`;
      }

      if (DB.isRealDatabase() && supabase) {
        // Update participant table
        const { error: pError } = await supabase
          .from('participants')
          .update({
            full_name,
            college_name,
            phone_number,
            registration_id,
            instagram_id: instagram_id || '',
            app_id: app_id,
            is_disabled: !!is_disabled
          })
          .eq('id', id);

        if (pError) throw new Error(pError.message);

        // Update progress table
        const { error: progError } = await supabase
          .from('participant_progress')
          .upsert({
            participant_id: id,
            completed_quizzes: parseInt(completed_quizzes || '0', 10),
            total_score: parseInt(total_score || '0', 10),
            total_time: parseInt(total_time || '0', 10),
            next_barrel_id: next_barrel_id ? parseInt(next_barrel_id, 10) : null,
            updated_at: new Date().toISOString()
          });

        if (progError) throw new Error(progError.message);
      } else {
        const { getDB, saveDB } = require('@/lib/mock-db');
        const db = getDB();
        const p = db.participants.find((x: any) => x.id === id);
        if (!p) {
          return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
        }

        p.full_name = full_name;
        p.college_name = college_name;
        p.phone_number = phone_number;
        p.registration_id = registration_id;
        p.instagram_id = instagram_id || '';
        p.app_id = app_id;
        p.is_disabled = !!is_disabled;

        let prog = db.participant_progress.find((x: any) => x.participant_id === id);
        if (!prog) {
          prog = { participant_id: id };
          db.participant_progress.push(prog);
        }

        prog.completed_quizzes = parseInt(completed_quizzes || '0', 10);
        prog.total_score = parseInt(total_score || '0', 10);
        prog.total_time = parseInt(total_time || '0', 10);
        prog.next_barrel_id = next_barrel_id ? parseInt(next_barrel_id, 10) : null;
        prog.updated_at = new Date().toISOString();

        saveDB(db);
      }

      await DB.logAudit(
        null,
        `Administrator updated participant details for: ${full_name} (${registration_id})`,
        request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        request.headers.get('user-agent') || 'Unknown'
      );

      return NextResponse.json({ success: true, message: 'Participant updated successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Participant CRUD error:', error);
    return NextResponse.json({ error: error.message || 'Failed to perform participant operation.' }, { status: 500 });
  }
}

// Delete Participant
export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Participant ID is required.' }, { status: 400 });
  }

  try {
    if (DB.isRealDatabase() && supabase) {
      const { error } = await supabase.from('participants').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      // Mock delete
      const { getDB, saveDB } = require('@/lib/mock-db');
      const db = getDB();
      db.participants = db.participants.filter((p: any) => p.id !== id);
      db.participant_progress = db.participant_progress.filter((p: any) => p.participant_id !== id);
      db.quiz_attempts = db.quiz_attempts.filter((a: any) => a.participant_id !== id);
      saveDB(db);
    }

    await DB.logAudit(
      null,
      `Administrator deleted participant ID: ${id}`,
      request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ success: true, message: 'Participant deleted successfully.' });
  } catch (error: any) {
    console.error('Delete participant error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete participant.' }, { status: 500 });
  }
}
