// Admin Audit Logs API Route Handler
// Location: src/app/api/admin/audit-logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const logs = await DB.getAuditLogs();
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch audit logs.' }, { status: 500 });
  }
}
