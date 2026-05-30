// JWT Helper functions using jose for serverless environments
// Location: src/lib/jwt.ts

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'nasa_hyderabad_heritage_quiz_hunt_secret_key_2026_xyz';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface ParticipantJWTPayload {
  participantId: string;
  registrationId: string;
  fullName: string;
}

export async function signJWT(payload: ParticipantJWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 hour session duration for the event
    .sign(secretKey);
}

export async function verifyJWT(token: string): Promise<ParticipantJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as ParticipantJWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
