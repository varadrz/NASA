// Serverless Rate Limiter with Upstash Redis and Local In-Memory Fallback
// Location: src/lib/rate-limit.ts

import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

const isRedisConfigured = (): boolean => {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  if (REDIS_URL.includes('your-db-name')) return false;
  if (REDIS_TOKEN.includes('your-redis-')) return false;
  return true;
};

// Initialize Redis if configured
const redis = isRedisConfigured()
  ? new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    })
  : null;

// Local in-memory store for rate limiting (fallback)
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const localBuckets = new Map<string, RateLimitBucket>();

// Clean up expired local buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of localBuckets.entries()) {
      if (now > bucket.resetTime) {
        localBuckets.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks if a request from a given identifier (IP) exceeds the limit within a window of time.
 * @param identifier Unique identifier, usually the client IP address.
 * @param limit Maximum number of requests allowed in the window.
 * @param windowSeconds Window size in seconds.
 */
export async function rateLimit(
  identifier: string,
  limit: number = 30,
  windowSeconds: number = 60
): Promise<RateLimitResponse> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const ipKey = `ratelimit:${identifier}`;

  if (redis) {
    try {
      // Redis Implementation
      const p = redis.pipeline();
      p.incr(ipKey);
      p.ttl(ipKey);
      const [countResult, ttlResult] = await p.exec();
      
      const count = countResult as number;
      const ttl = ttlResult as number;

      // Set expiration if key was newly created
      if (count === 1 || ttl === -1) {
        await redis.expire(ipKey, windowSeconds);
      }

      const remaining = Math.max(0, limit - count);
      const reset = now + (ttl > 0 ? ttl * 1000 : windowMs);

      return {
        success: count <= limit,
        limit,
        remaining,
        reset
      };
    } catch (error) {
      console.warn('Upstash Redis connection failed, falling back to local rate limiting:', error);
      // Failover to local in-memory
    }
  }

  // Local In-Memory Fallback Implementation
  let bucket = localBuckets.get(identifier);
  if (!bucket || now > bucket.resetTime) {
    bucket = {
      count: 0,
      resetTime: now + windowMs
    };
    localBuckets.set(identifier, bucket);
  }

  bucket.count++;
  const remaining = Math.max(0, limit - bucket.count);
  const reset = bucket.resetTime;

  return {
    success: bucket.count <= limit,
    limit,
    remaining,
    reset
  };
}
