// Helper for validating administrative requests
// Location: src/lib/admin-auth.ts

import { NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * Computes the SHA-256 hash of a string.
 */
function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Constant-time comparison of two hex strings to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function isAdminAuthorized(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin_hyderabad_heritage_2026';
  
  // Hash of the configured environment password
  const expectedHash = adminPassword.length === 64 ? adminPassword : sha256(adminPassword);

  const verifyPassword = (inputPassword: string | undefined | null): boolean => {
    if (!inputPassword) return false;
    const inputHash = sha256(inputPassword);
    return safeCompare(inputHash, expectedHash);
  };

  // Check header
  const headerPassword = request.headers.get('x-admin-password');
  if (verifyPassword(headerPassword)) return true;

  // Check cookie
  const cookiePassword = request.cookies.get('admin_session')?.value;
  if (verifyPassword(cookiePassword)) return true;

  return false;
}

