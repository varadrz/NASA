// Admin Schedule CRUD API Handler
// Location: src/app/api/admin/schedule/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const events = await DB.getScheduleEvents();
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Admin fetch schedule error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch schedule events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { day_idx, time, startHour, endHour, speaker, topic, venue, type } = body;

    if (day_idx === undefined || !time || startHour === undefined || endHour === undefined || !topic || !venue || !type) {
      return NextResponse.json({ error: 'Missing required fields (day_idx, time, startHour, endHour, topic, venue, type)' }, { status: 400 });
    }

    const payload = {
      day_idx: Number(day_idx),
      time,
      startHour: Number(startHour),
      endHour: Number(endHour),
      speaker,
      topic,
      venue,
      type
    };

    const newEvent = await DB.createScheduleEvent(payload);
    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error('Admin create event error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, day_idx, time, startHour, endHour, speaker, topic, venue, type } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required for update' }, { status: 400 });
    }

    const payload: any = {};
    if (day_idx !== undefined) payload.day_idx = Number(day_idx);
    if (time !== undefined) payload.time = time;
    if (startHour !== undefined) payload.startHour = Number(startHour);
    if (endHour !== undefined) payload.endHour = Number(endHour);
    if (speaker !== undefined) payload.speaker = speaker;
    if (topic !== undefined) payload.topic = topic;
    if (venue !== undefined) payload.venue = venue;
    if (type !== undefined) payload.type = type;

    const updatedEvent = await DB.updateScheduleEvent(id, payload);
    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error('Admin update event error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    let id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required for deletion' }, { status: 400 });
    }

    const success = await DB.deleteScheduleEvent(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Admin delete event error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete event' }, { status: 500 });
  }
}
