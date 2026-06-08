// Public Announcements API Endpoint
// Location: src/app/api/announcements/route.ts

import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const announcements = await DB.getAnnouncements();
    const now = new Date();

    // Filter announcements: only show ones scheduled in the past/present, and not expired
    const activeAnnouncements = announcements.filter((a: any) => {
      if (a.scheduled_for && new Date(a.scheduled_for) > now) {
        return false; // Scheduled for future
      }
      if (a.expires_at && new Date(a.expires_at) < now) {
        return false; // Already expired
      }
      return true;
    });

    return NextResponse.json(activeAnnouncements);
  } catch (error: any) {
    console.error('Failed to fetch active announcements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
