/**
 * Client-safe obfuscation & key derivation utilities.
 * Zero external dependencies, runs safely in browser runtime memory.
 */

export function generateKeyByte(salt: string, index: number): number {
  let hash = 0x5a5a;
  for (let i = 0; i < salt.length; i++) {
    hash = ((hash << 5) - hash + salt.charCodeAt(i) + (index * 17)) & 0xff;
  }
  return hash;
}

/**
 * Reconstructs the site key strictly in client runtime memory
 * without storing or exposing it in DOM or static files.
 */
export function unmaskSiteKey(payload: string, seed: string): string {
  if (!payload || !seed) return '';
  const chars: string[] = [];
  for (let i = 0; i < payload.length; i += 2) {
    const hexByte = parseInt(payload.substring(i, i + 2), 16);
    const maskByte = generateKeyByte(seed, i / 2);
    chars.push(String.fromCharCode(hexByte ^ maskByte));
  }
  return chars.join('');
}

