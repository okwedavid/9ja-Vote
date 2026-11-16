import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Account, AdminRole, LoginResult } from '@9ja-vote/shared-types';
import { DataStore, publicAccount, StoredAccount } from '../common/data-store';
import { checkPasswordPolicy, hashPassword, verifyPassword } from './password';
import { generateTotpSecret, otpauthUrl, verifyTotp } from './totp';
import { issueToken, TokenClaims, verifyToken } from './token';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export interface LoginInput {
  email: string;
  password: string;
  totp?: string;
}

@Injectable()
export class AuthService {
  /** Token ids revoked by logout. In-memory: a restart clears them, which is acceptable for the demo. */
  private readonly revoked = new Set<string>();

  constructor(private readonly store: DataStore) {}

  login(input: LoginInput): LoginResult {
    const account = this.store.accountByEmail(input.email);
    if (!account) {
      this.store.appendAudit({
        action: 'AUTH_LOGIN_FAILED',
        actorId: null,
        actorEmail: input.email,
        actorRole: null,
        targetType: 'SESSION',
        targetId: input.email,
        summary: 'Sign-in attempted for an unknown account',
        metadata: {},
      });
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (account.status !== 'ACTIVE') {
      throw new ForbiddenException('This account is suspended');
    }
    if (account.lockedUntil && Date.parse(account.lockedUntil) > Date.now()) {
      throw new ForbiddenException('Too many failed attempts. Try again later.');
    }

    if (!verifyPassword(input.password, account.passwordHash)) {
      const failedAttempts = account.failedAttempts + 1;
      const locked = failedAttempts >= MAX_ATTEMPTS;
      this.store.updateAccount(account.id, {
        failedAttempts,
        lockedUntil: locked ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null,
      });
      this.store.appendAudit({
        action: 'AUTH_LOGIN_FAILED',
        actorId: account.id,
        actorEmail: account.email,
        actorRole: account.role,
        targetType: 'SESSION',
        targetId: account.id,
        summary: `Failed sign-in (${failedAttempts}/${MAX_ATTEMPTS})`,
        metadata: { locked: String(locked) },
      });
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (account.mfaEnabled) {
      if (!input.totp) {
        throw new UnauthorizedException('MFA_REQUIRED: enter the 6-digit code from your authenticator app');
      }
      if (!account.mfaSecret || !verifyTotp(account.mfaSecret, input.totp)) {
        throw new UnauthorizedException('That code is not valid. Check your authenticator app.');
      }
    }

    const updated = this.store.updateAccount(account.id, {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
    });
    this.store.appendAudit({
      action: 'AUTH_LOGIN',
      actorId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'SESSION',
      targetId: account.id,
      summary: 'Signed in to the Command Centre',
      metadata: { mfa: String(account.mfaEnabled) },
    });
    return this.tokensFor(updated ?? publicAccount(account));
  }

  private tokensFor(account: Account): LoginResult {
    const access = issueToken({ accountId: account.id, email: account.email, role: account.role, type: 'access' });
    const refresh = issueToken({ accountId: account.id, email: account.email, role: account.role, type: 'refresh' });
    return { accessToken: access.token, refreshToken: refresh.token, expiresIn: access.expiresIn, account };
  }

  refresh(refreshToken: string): LoginResult {
    const claims = verifyToken(refreshToken, 'refresh');
    if (!claims) throw new UnauthorizedException('Refresh token is invalid or expired');
    const account = this.store.accountById(claims.sub);
    if (!account || account.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');
    return this.tokensFor(publicAccount(account));
  }

  logout(claims: TokenClaims): void {
    this.revoked.add(claims.jti);
    const account = this.store.accountById(claims.sub);
    if (account) {
      this.store.appendAudit({
        action: 'AUTH_LOGOUT',
        actorId: account.id,
        actorEmail: account.email,
        actorRole: account.role,
        targetType: 'SESSION',
        targetId: account.id,
        summary: 'Signed out',
        metadata: {},
      });
    }
  }

  isRevoked(jti: string): boolean {
    return this.revoked.has(jti);
  }

  me(accountId: string): Account {
    const account = this.store.accountById(accountId);
    if (!account) throw new UnauthorizedException('Account no longer exists');
    return publicAccount(account);
  }

  requireStored(accountId: string): StoredAccount {
    const account = this.store.accountById(accountId);
    if (!account) throw new UnauthorizedException('Account no longer exists');
    return account;
  }

  setupMfa(accountId: string): { secret: string; otpauthUrl: string } {
    const account = this.requireStored(accountId);
    if (account.mfaEnabled) throw new BadRequestException('Two-factor authentication is already enabled');
    const secret = generateTotpSecret();
    this.store.updateAccount(account.id, { mfaPendingSecret: secret });
    return { secret, otpauthUrl: otpauthUrl(secret, account.email) };
  }

  enableMfa(accountId: string, code: string): Account {
    const account = this.requireStored(accountId);
    if (!account.mfaPendingSecret) throw new BadRequestException('Start two-factor setup first');
    if (!verifyTotp(account.mfaPendingSecret, code)) throw new BadRequestException('That code did not match. Try again.');
    const updated = this.store.updateAccount(
      account.id,
      { mfaEnabled: true, mfaSecret: account.mfaPendingSecret, mfaPendingSecret: null },
      { action: 'AUTH_MFA_ENABLED', summary: 'Two-factor authentication enabled' },
      { id: account.id, email: account.email, role: account.role },
    );
    return updated!;
  }

  disableMfa(accountId: string, password: string): Account {
    const account = this.requireStored(accountId);
    if (!verifyPassword(password, account.passwordHash)) throw new UnauthorizedException('Password is incorrect');
    const updated = this.store.updateAccount(
      account.id,
      { mfaEnabled: false, mfaSecret: null, mfaPendingSecret: null },
      { action: 'AUTH_MFA_DISABLED', summary: 'Two-factor authentication disabled' },
      { id: account.id, email: account.email, role: account.role },
    );
    return updated!;
  }

  changePassword(accountId: string, current: string, next: string): void {
    const account = this.requireStored(accountId);
    if (!verifyPassword(current, account.passwordHash)) throw new UnauthorizedException('Current password is incorrect');
    const policy = checkPasswordPolicy(next);
    if (!policy.ok) throw new BadRequestException(policy.problems);
    this.store.updateAccount(
      account.id,
      { passwordHash: hashPassword(next) },
      { action: 'AUTH_PASSWORD_CHANGED', summary: 'Password changed' },
      { id: account.id, email: account.email, role: account.role },
    );
  }

  /** Used by the seed script and by super administrators creating colleagues. */
  createAccount(input: { email: string; displayName: string; role: AdminRole; password: string }): Account {
    const policy = checkPasswordPolicy(input.password);
    if (!policy.ok) throw new BadRequestException(policy.problems);
    return this.store.createAccount({
      email: input.email.trim().toLowerCase(),
      displayName: input.displayName.trim(),
      role: input.role,
      passwordHash: hashPassword(input.password),
    });
  }
}
