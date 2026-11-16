import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const PREFIX = 'scrypt';

/** Password hashing with Node's built-in scrypt (no native dependency to compile). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password.normalize('NFKC'), salt, KEY_LENGTH).toString('hex');
  return `${PREFIX}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(':');
  if (scheme !== PREFIX || !salt || !hash) return false;
  const candidate = scryptSync(password.normalize('NFKC'), salt, KEY_LENGTH);
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export interface PasswordPolicyResult {
  ok: boolean;
  problems: string[];
}

/** Deliberately simple, explainable policy: length beats symbol soup. */
export function checkPasswordPolicy(password: string): PasswordPolicyResult {
  const problems: string[] = [];
  if (password.length < 12) problems.push('Use at least 12 characters.');
  if (!/[a-zA-Z]/.test(password)) problems.push('Include at least one letter.');
  if (!/[0-9]/.test(password)) problems.push('Include at least one number.');
  if (/^(password|9javote|admin|letmein)/i.test(password)) problems.push('Do not start with a common word.');
  return { ok: problems.length === 0, problems };
}
