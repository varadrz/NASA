import crypto from 'crypto';

/**
 * Creates a deterministic pseudo-random number generator seeded with a string (e.g. UUID).
 */
export function seedRandom(seedStr: string) {
  const hash = crypto.createHash('sha256').update(seedStr).digest();
  let val = hash.readUInt32LE(0);
  return function() {
    val = (val + 0x9e3779b9) | 0;
    let z = val;
    z ^= z >>> 16;
    z = Math.imul(z, 0x21f0aa7);
    z ^= z >>> 15;
    z = Math.imul(z, 0x735a2d97);
    z ^= z >>> 15;
    return (z >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffles an array using the provided seed string.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const copy = [...array];
  const rand = seedRandom(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
