import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { randomBytes } from 'node:crypto';
import { Account, ADMIN_ROLES, AdminMetrics, AdminRole, AuditAction, AuditEntry } from '@9ja-vote/shared-types';
import { AuthService } from '../auth/auth.service';
import { CurrentAccount, JwtAuthGuard, PermissionsGuard, RequirePermissions } from '../auth/auth.guard';
import { CreateAccountDto } from '../auth/dto';
import { DataStore } from '../common/data-store';
import { checkPasswordPolicy } from '../auth/password';
import { ResultsService } from '../results/results.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly store: DataStore,
    private readonly auth: AuthService,
    private readonly results: ResultsService,
  ) {}

  @Get('metrics')
  metrics(): AdminMetrics {
    const records = this.store.results();
    const accounts = this.store.accounts();
    const audit = this.store.audit(1);
    return {
      statesReporting: records.filter((r) => r.status !== 'AWAITING_SUBMISSION').length,
      statesTotal: records.length,
      pollingUnitsReported: records.reduce((a, r) => a + r.pollingUnitsReported, 0),
      pollingUnitsTotal: records.reduce((a, r) => a + r.pollingUnitsTotal, 0),
      totalValidVotes: records.reduce((a, r) => a + r.totalValidVotes, 0),
      verifiedStates: records.filter((r) => r.status === 'VERIFIED' || r.status === 'OFFICIALLY_DECLARED').length,
      disputedStates: records.filter((r) => r.status === 'DISPUTED').length,
      awaitingSubmission: records.filter((r) => r.status === 'AWAITING_SUBMISSION').length,
      accounts: {
        total: accounts.length,
        active: accounts.filter((a) => a.status === 'ACTIVE').length,
        mfaEnabled: accounts.filter((a) => a.mfaEnabled).length,
      },
      auditEntries: this.store.audit(200).length,
      lastAuditAt: audit[0]?.at ?? null,
      storeVersion: this.store.version,
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  @Get('accounts')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('admin.users.manage')
  accounts(): Account[] {
    return this.store.accounts().map(({ passwordHash: _p, mfaSecret: _m, mfaPendingSecret: _mp, failedAttempts: _f, lockedUntil: _l, ...rest }) => rest);
  }

  @Post('accounts')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('admin.users.manage')
  createAccount(@Body() dto: CreateAccountDto, @CurrentAccount() actor: Account): { account: Account; temporaryPassword?: string } {
    if (!ADMIN_ROLES.includes(dto.role as AdminRole)) {
      throw new BadRequestException(`Unknown role. Choose one of: ${ADMIN_ROLES.join(', ')}`);
    }
    const generated = dto.password ? null : randomBytes(12).toString('base64url');
    const password: string = dto.password || generated || '';
    const policy = checkPasswordPolicy(password);
    if (!policy.ok) throw new BadRequestException(policy.problems);
    const account = this.auth.createAccount({
      email: dto.email,
      displayName: dto.displayName,
      role: dto.role as AdminRole,
      password,
    });
    this.store.appendAudit({
      action: 'ACCOUNT_CREATED',
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      targetType: 'ACCOUNT',
      targetId: account.email,
      summary: `${actor.email} created ${account.email} as ${account.role}`,
      metadata: { role: account.role },
    });
    return generated ? { account, temporaryPassword: generated } : { account };
  }

  @Patch('accounts/:id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('admin.users.manage')
  setStatus(@Param('id') id: string, @Body() body: { status?: string }, @CurrentAccount() actor: Account): Account {
    if (id === actor.id) throw new BadRequestException('You cannot suspend or reinstate your own account');
    const status = body.status === 'SUSPENDED' ? 'SUSPENDED' : body.status === 'ACTIVE' ? 'ACTIVE' : null;
    if (!status) throw new BadRequestException('status must be ACTIVE or SUSPENDED');
    const updated = this.store.updateAccount(
      id,
      { status },
      {
        action: status === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_REINSTATED',
        summary: `${actor.email} set ${status} on account ${id}`,
      },
      { id: actor.id, email: actor.email, role: actor.role },
    );
    if (!updated) throw new NotFoundException('Account not found');
    return updated;
  }

  @Patch('accounts/:id/role')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('admin.users.manage')
  setRole(@Param('id') id: string, @Body() body: { role?: string }, @CurrentAccount() actor: Account): Account {
    if (!body.role || !ADMIN_ROLES.includes(body.role as AdminRole)) {
      throw new BadRequestException(`role must be one of: ${ADMIN_ROLES.join(', ')}`);
    }
    if (id === actor.id) throw new BadRequestException('You cannot change your own role');
    const updated = this.store.updateAccount(
      id,
      { role: body.role as AdminRole },
      { action: 'ACCOUNT_ROLE_CHANGED', summary: `${actor.email} changed role to ${body.role} for ${id}`, metadata: { role: body.role } },
      { id: actor.id, email: actor.email, role: actor.role },
    );
    if (!updated) throw new NotFoundException('Account not found');
    return updated;
  }

  @Get('audit')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('audit.read')
  audit(@Query('limit') limit?: string, @Query('action') action?: string): { notice: string; items: AuditEntry[] } {
    const parsed = Number(limit ?? 50);
    const safeLimit = Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), 1), 200) : 50;
    const items = this.store.audit(safeLimit, action as AuditAction | undefined);
    return { notice: 'Audit entries are append-only. Nothing in the Command Centre can edit or delete them.', items };
  }

  @Get('workflow')
  workflow(): ReturnType<ResultsService['workflow']> {
    return this.results.workflow();
  }
}
