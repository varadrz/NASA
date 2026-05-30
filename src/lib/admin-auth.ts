// Helper for validating administrative requests
// Location: src/lib/admin-auth.ts

import { NextRequest } from 'next/server';

export function isAdminAuthorized(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin_hyderabad_heritage_2026';
  
  // Check header
  const headerPassword = request.headers.get('x-admin-password');
  if (headerPassword === adminPassword) return true;

  // Check cookie
  const cookiePassword = request.cookies.get('admin_session')?.value;
  if (cookiePassword === adminPassword) return true;

  return false;
}
