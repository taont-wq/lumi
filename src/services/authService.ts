/**
 * Secure Authentication & Password Hashing Service using Web Crypto API (SHA-256)
 */

const SESSION_KEY = 'vhome_admin_auth_session_v1';

// Default password hashes:
// SHA-256('admin123') = 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
// SHA-256('admin')    = 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
export const DEFAULT_ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
export const LEGACY_ADMIN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

/**
 * Hash a plain text password using SHA-256 via native browser Web Crypto API
 */
export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify a plain text password against stored SHA-256 hash
 */
export async function verifyPassword(plainText: string, storedHash?: string): Promise<boolean> {
  const input = plainText.trim();
  if (!input) return false;

  const inputHash = await hashPassword(input);
  const normalizedStoredHash = (storedHash || '').toLowerCase().trim();

  // If no custom hash set, or default hash, accept either admin123 or admin
  if (!normalizedStoredHash || normalizedStoredHash === DEFAULT_ADMIN_HASH || normalizedStoredHash === LEGACY_ADMIN_HASH) {
    return input === 'admin123' || input === 'admin' || inputHash === DEFAULT_ADMIN_HASH || inputHash === LEGACY_ADMIN_HASH;
  }

  // Direct comparison with custom stored hash
  return inputHash.toLowerCase() === normalizedStoredHash;
}

/**
 * Check if the current browser session has active Admin authorization
 */
export function isSessionAuthenticated(): boolean {
  try {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) return false;
    const parsed = JSON.parse(token);
    // Token valid for 8 hours
    if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
      return true;
    }
    sessionStorage.removeItem(SESSION_KEY);
    return false;
  } catch (e) {
    return false;
  }
}

export const isAdminSessionValid = isSessionAuthenticated;

/**
 * Set active authenticated admin session
 */
export function setAdminSession(): void {
  const sessionData = {
    authenticated: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Terminate active admin session
 */
export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

