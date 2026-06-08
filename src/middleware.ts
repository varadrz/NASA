import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'nasa_hyderabad_heritage_quiz_hunt_secret_key_2026_xyz';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect Admin routes
  if (pathname.startsWith('/admin')) {
    // If it's the main admin login page, allow access so they can input password
    if (pathname === '/admin') {
      return NextResponse.next();
    }
    
    // For any admin sub-routes, check session
    const adminSession = request.cookies.get('admin_session')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_hyderabad_heritage_2026';
    if (!adminSession || adminSession !== adminPassword) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. Protect Barrel (Quiz) routes
  if (pathname.startsWith('/barrel/')) {
    const segments = pathname.split('/');
    const barrelIdStr = segments[segments.length - 1] || segments[segments.length - 2];
    const barrelId = parseInt(barrelIdStr, 10);

    if (isNaN(barrelId) || barrelId < 1 || barrelId > 20) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check participant session
    const token = request.cookies.get('participant_session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/?error=session_required', request.url));
    }

    try {
      // Decode JWT token
      const { payload } = await jwtVerify(token, secretKey);
      
      // Check progress to prevent URL manipulation (must match next_barrel_id)
      const origin = request.nextUrl.origin;
      const sessionRes = await fetch(`${origin}/api/auth/session`, {
        headers: {
          Cookie: `participant_session=${token}`
        }
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated && sessionData.progress) {
          const nextBarrelId = sessionData.progress.next_barrel_id;
          
          if (sessionData.progress.completed_quizzes >= 20) {
            return NextResponse.redirect(new URL('/?error=hunt_completed', request.url));
          }
          if (nextBarrelId && nextBarrelId !== barrelId) {
            return NextResponse.redirect(new URL(`/?error=incorrect_sequence&assigned=${nextBarrelId}`, request.url));
          }
        } else {
          const response = NextResponse.redirect(new URL('/?error=invalid_session', request.url));
          response.cookies.delete('participant_session');
          return response;
        }
      }
    } catch (err) {
      console.error('Middleware JWT/Session verification failed:', err);
      const response = NextResponse.redirect(new URL('/?error=session_expired', request.url));
      response.cookies.delete('participant_session');
      return response;
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: ['/admin/:path*', '/barrel/:path*'],
};
