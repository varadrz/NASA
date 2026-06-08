// Public Schedule API Endpoint
// Location: src/app/api/schedule/route.ts

import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await DB.getScheduleEvents();
    
    // Group events by day_idx (0 to 3)
    const dayMeta = [
      { dayName: "DAY 01", dateStr: "2026-06-11" },
      { dayName: "DAY 02", dateStr: "2026-06-12" },
      { dayName: "DAY 03", dateStr: "2026-06-13" },
      { dayName: "DAY 04", dateStr: "2026-06-14" },
    ];

    const groupedSchedule = dayMeta.map((meta, idx) => {
      const dayEvents = events.filter((e: any) => Number(e.day_idx) === idx);
      
      // Sort events by startHour ascending
      dayEvents.sort((a: any, b: any) => {
        const aStart = a.startHour !== undefined ? a.startHour : a.start_hour;
        const bStart = b.startHour !== undefined ? b.startHour : b.start_hour;
        return Number(aStart) - Number(bStart);
      });

      return {
        ...meta,
        events: dayEvents.map((e: any) => ({
          id: e.id,
          time: e.time,
          startHour: Number(e.startHour !== undefined ? e.startHour : e.start_hour),
          endHour: Number(e.endHour !== undefined ? e.endHour : e.end_hour),
          speaker: e.speaker,
          topic: e.topic,
          venue: e.venue,
          type: e.type
        }))
      };
    });

    return NextResponse.json(groupedSchedule);
  } catch (error: any) {
    console.error('Failed to group schedule events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
