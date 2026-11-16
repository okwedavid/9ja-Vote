import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Account, Permission, ROLE_PERMISSIONS } from '@9ja-vote/shared-types';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { TokenClaims, verifyToken } from './token';

export const PERMISSIONS_KEY = 'requiredPermissions';

/** Requires ANY of the listed permissions (roles often overlap). */
export const RequirePermissions = (...permissions: Permission[]): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export interface AuthedRequest extends Request {
  account?: Account;
  claims?: TokenClaims;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Sign in to use this endpoint');
    }
    const claims = verifyToken(token, 'access');
    if (!claims) throw new UnauthorizedException('Session expired or invalid');
    if (this.auth.isRevoked(claims.jti)) throw new UnauthorizedException('Session has been signed out');
    const account = this.auth.me(claims.sub);
    if (account.status !== 'ACTIVE') throw new ForbiddenException('Account is suspended');
    req.account = account;
    req.claims = claims;
    return true;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const account = req.account;
    if (!account) throw new UnauthorizedException('Sign in to use this endpoint');
    const held = ROLE_PERMISSIONS[account.role];
    if (!required.some((p) => held.includes(p))) {
      throw new ForbiddenException(
        `Your role (${account.role}) does not include ${required.join(' or ')}. Separation of duties is enforced on the server.`,
      );
    }
    return true;
  }
}

export const CurrentAccount = createParamDecorator((_data: unknown, context: ExecutionContext): Account => {
  const req = context.switchToHttp().getRequest<AuthedRequest>();
  if (!req.account) throw new UnauthorizedException('Sign in to use this endpoint');
  return req.account;
});
