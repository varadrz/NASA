// Admin Announcements API Handler
// Location: src/app/api/admin/announcements/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const announcements = await DB.getAnnouncements();
    return NextResponse.json(announcements);
  } catch (error: any) {
    console.error('Admin fetch announcements error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, message, type, scheduled_for, expires_at } = body;

    if (!message) {
      return NextResponse.json({ error: 'Announcement message is required' }, { status: 400 });
    }

    const payload = {
      title: title || 'Notice',
      message,
      type: type || 'info',
      scheduled_for: scheduled_for || new Date().toISOString(),
      expires_at: expires_at || null
    };

    const newAnn = await DB.createAnnouncement(payload);
    return NextResponse.json({ success: true, announcement: newAnn });
  } catch (error: any) {
    console.error('Admin create announcement error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create announcement' }, { status: 500 });
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
      return NextResponse.json({ error: 'Announcement ID is required for deletion' }, { status: 400 });
    }

    const success = await DB.deleteAnnouncement(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Admin delete announcement error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete announcement' }, { status: 500 });
  }
}
