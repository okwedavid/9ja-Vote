import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { AdminRole } from '@9ja-vote/shared-types';

export type TokenType = 'access' | 'refresh';

export interface TokenClaims {
  sub: string;
  email: string;
  role: AdminRole;
  type: TokenType;
  iat: number;
  exp: number;
  jti: string;
}

const ACCESS_TTL = Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 1800);
const REFRESH_TTL = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 604800);

/** Ephemeral per-process secrets: used only if the operator has not set real ones. */
const EPHEMERAL: Record<TokenType, string> = {
  access: randomBytes(32).toString('hex'),
  refresh: randomBytes(32).toString('hex'),
};
let warned = false;

function secretFor(type: TokenType): string {
  const configured = type === 'access' ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (!warned) {
    warned = true;
    // Never hardcode a secret; degrade loudly instead.
    console.warn(
      '[9ja-vote] JWT secrets are not configured (need 32+ characters). Using ephemeral secrets: sessions end when the API restarts.',
    );
  }
  return EPHEMERAL[type];
}

const b64 = (input: Buffer | string): string => Buffer.from(input).toString('base64url');

function sign(payload: string, type: TokenType): string {
  return createHmac('sha256', secretFor(type)).update(payload).digest('base64url');
}

export function issueToken(input: { accountId: string; email: string; role: AdminRole; type: TokenType }): {
  token: string;
  claims: TokenClaims;
  expiresIn: number;
} {
  const now = Math.floor(Date.now() / 1000);
  const ttl = input.type === 'access' ? ACCESS_TTL : REFRESH_TTL;
  const claims: TokenClaims = {
    sub: input.accountId,
    email: input.email,
    role: input.role,
    type: input.type,
    iat: now,
    exp: now + ttl,
    jti: randomUUID(),
  };
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64(JSON.stringify(claims));
  const token = `${header}.${body}.${sign(`${header}.${body}`, input.type)}`;
  return { token, claims, expiresIn: ttl };
}

export function verifyToken(token: string, expected: TokenType): TokenClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts as [string, string, string];
  const expectedSignature = sign(`${header}.${body}`, expected);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenClaims;
    if (claims.type !== expected) return null;
    if (claims.exp * 1000 <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}
