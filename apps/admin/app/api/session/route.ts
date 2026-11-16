import { NextResponse } from 'next/server';
import { LoginResult } from '@9ja-vote/shared-types';
import { apiFetch } from '../../../lib/api';
import { SESSION_COOKIE } from '../../../lib/session';

/**
 * Sign-in endpoint for the Command Centre.
 *
 * A plain form post rather than a client-side fetch: the page works without
 * JavaScript, the token never touches browser storage, and the cookie is set
 * by the server with HttpOnly, SameSite=Lax and Secure in production.
 */
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const totp = String(form.get('totp') ?? '').trim();
  const loginUrl = new URL('/login', request.url);

  if (!email || !password) {
    loginUrl.searchParams.set('error', 'Enter your email and password.');
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  try {
    const result = await apiFetch<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(totp ? { totp } : {}) }),
    });
    const response = NextResponse.redirect(new URL('/', request.url), { status: 303 });
    response.cookies.set(SESSION_COOKIE, result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: result.expiresIn,
    });
    return response;
  } catch (error) {
    const text = error instanceof Error ? error.message : 'Sign-in failed';
    loginUrl.searchParams.set(
      'error',
      text.includes('MFA_REQUIRED') ? 'Enter the 6-digit code from your authenticator app.' : text,
    );
    return NextResponse.redirect(loginUrl, { status: 303 });
  }
}
