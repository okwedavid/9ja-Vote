import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  Account,
  AdminRole,
  AuditAction,
  AuditEntry,
  buildDemoStateResults,
  canTransition,
  DEMO_NOTIFICATIONS,
  DEMO_NOTICE,
  NotificationItem,
  ResultRecord,
  ResultStatus,
  ResultTransition,
  StateResult,
} from '@9ja-vote/shared-types';

export interface StoredAccount extends Account {
  passwordHash: string;
  mfaSecret: string | null;
  mfaPendingSecret: string | null;
  failedAttempts: number;
  lockedUntil: string | null;
}

interface StoreShape {
  schemaVersion: 1;
  createdAt: string;
  storeVersion: number;
  results: ResultRecord[];
  accounts: StoredAccount[];
  audit: AuditEntry[];
  notifications: NotificationItem[];
}

export interface TransitionActor {
  id: string | null;
  email: string;
  role: AdminRole | null;
}

export interface TransitionOutcome {
  ok: boolean;
  reason?: string;
  record?: ResultRecord;
}

const MAX_AUDIT = 1000;

/** Statuses in the order a record normally travels through the workflow. */
const CHAIN: ResultStatus[] = ['SUBMITTED', 'RECEIVED', 'UNDER_VERIFICATION', 'VERIFIED', 'OFFICIALLY_DECLARED'];

function seedHistory(status: ResultStatus, updatedAt: string): ResultTransition[] {
  const target = status === 'DISPUTED' ? 'UNDER_VERIFICATION' : status;
  const steps = CHAIN.slice(0, Math.max(0, CHAIN.indexOf(target) + 1));
  if (status === 'AWAITING_SUBMISSION') return [];
  const base = Date.parse(updatedAt) - steps.length * 45 * 60 * 1000;
  const history: ResultTransition[] = [];
  let from: ResultStatus = 'AWAITING_SUBMISSION';
  steps.forEach((to, i) => {
    history.push({
      at: new Date(base + i * 45 * 60 * 1000).toISOString(),
      from,
      to,
      actorEmail: 'system@synthetic.demo',
      note: 'Synthetic demonstration record',
    });
    from = to;
  });
  if (status === 'DISPUTED') {
    history.push({
      at: updatedAt,
      from: 'UNDER_VERIFICATION',
      to: 'DISPUTED',
      actorEmail: 'system@synthetic.demo',
      note: 'Synthetic demonstration dispute',
    });
  }
  return history;
}

function toRecord(state: StateResult): ResultRecord {
  const history = seedHistory(state.status, state.updatedAt);
  const last = history[history.length - 1];
  return {
    ...state,
    submittedAt: history[0]?.at ?? null,
    submittedBy: history[0]?.actorEmail ?? null,
    verifiedAt: history.find((h) => h.to === 'VERIFIED')?.at ?? null,
    verifiedBy: history.find((h) => h.to === 'VERIFIED')?.actorEmail ?? null,
    note: last?.note ?? null,
    version: 1,
    supersedesId: null,
    history,
  };
}

function seedAudit(now: string): AuditEntry[] {
  const seed: Array<[AuditAction, string, string, string]> = [
    ['ACCOUNT_CREATED', 'SYSTEM', 'SYSTEM', 'Demonstration dataset initialised'],
    ['DATA_EXPORTED', 'SYSTEM', 'SYSTEM', 'Synthetic state results loaded (37 states and the FCT)'],
    ['RESULT_TRANSITION', 'SYSTEM', 'RESULT', 'Workflow history reconstructed for demonstration records'],
  ];
  return seed.map(([action, targetType, , summary], i) => ({
    id: `audit-seed-${i + 1}`,
    at: new Date(Date.parse(now) + i * 1000).toISOString(),
    actorId: null,
    actorEmail: 'system@synthetic.demo',
    actorRole: null,
    action,
    targetType: targetType as AuditEntry['targetType'],
    targetId: 'system',
    summary,
    metadata: { seeded: 'true' },
  }));
}

function emptyStore(): StoreShape {
  const now = new Date().toISOString();
  const results = buildDemoStateResults().map(toRecord);
  return {
    schemaVersion: 1,
    createdAt: now,
    storeVersion: 1,
    results,
    accounts: [],
    audit: seedAudit(now),
    notifications: DEMO_NOTIFICATIONS.map((n) => ({ ...n })),
  };
}

/**
 * File-backed store for the demonstration API.
 *
 * It is deliberately boring: one JSON document, written atomically. It exists so
 * the workflow, audit trail and RBAC can be exercised end to end without a
 * database. Production replaces this with PostgreSQL using the schema in
 * `infrastructure/database/migrations` — see ARCHITECTURE.md section 12.
 */
export class DataStore {
  readonly path: string;
  private data: StoreShape;

  constructor(path = process.env.DATA_STORE_PATH ?? resolve(process.cwd(), '.data', 'store.json')) {
    this.path = path;
    this.data = this.load();
  }

  private load(): StoreShape {
    if (!existsSync(this.path)) {
      const seeded = emptyStore();
      this.write(seeded);
      return seeded;
    }
    try {
      const parsed = JSON.parse(readFileSync(this.path, 'utf8')) as Partial<StoreShape>;
      if (!parsed.results || !parsed.accounts) throw new Error('incomplete store');
      return {
        schemaVersion: 1,
        createdAt: parsed.createdAt ?? new Date().toISOString(),
        storeVersion: parsed.storeVersion ?? 1,
        results: parsed.results,
        accounts: parsed.accounts,
        audit: parsed.audit ?? [],
        notifications: parsed.notifications ?? [],
      };
    } catch {
      // Never crash the API because a demo file is unreadable: re-seed instead.
      const seeded = emptyStore();
      this.write(seeded);
      return seeded;
    }
  }

  private write(data: StoreShape): void {
    mkdirSync(dirname(this.path), { recursive: true });
    const tmp = `${this.path}.tmp`;
    writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
    renameSync(tmp, this.path);
  }

  private commit(): void {
    this.data.storeVersion += 1;
    if (this.data.audit.length > MAX_AUDIT) this.data.audit = this.data.audit.slice(-MAX_AUDIT);
    this.write(this.data);
  }

  get version(): number {
    return this.data.storeVersion;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  /* ----------------------------- results ----------------------------- */

  results(): ResultRecord[] {
    return this.data.results.map((r) => ({ ...r, votes: { ...r.votes }, history: [...r.history] }));
  }

  published(): ResultRecord[] {
    return this.results();
  }

  result(stateCode: string): ResultRecord | undefined {
    return this.results().find((r) => r.stateCode === stateCode.toUpperCase());
  }

  transition(stateCode: string, to: ResultStatus, actor: TransitionActor, note: string | null): TransitionOutcome {
    const record = this.data.results.find((r) => r.stateCode === stateCode.toUpperCase());
    if (!record) return { ok: false, reason: `Unknown state code: ${stateCode}` };
    if (!canTransition(record.status, to)) {
      return { ok: false, reason: `Cannot move from ${record.status} to ${to}` };
    }
    const at = new Date().toISOString();
    record.status = to;
    record.updatedAt = at;
    record.note = note;
    record.history = [...record.history, { at, from: record.history.at(-1)?.to ?? 'AWAITING_SUBMISSION', to, actorEmail: actor.email, note }];
    if (to === 'SUBMITTED') {
      record.submittedAt = at;
      record.submittedBy = actor.email;
    }
    if (to === 'VERIFIED') {
      record.verifiedAt = at;
      record.verifiedBy = actor.email;
    }
    this.appendAudit({
      action: 'RESULT_TRANSITION',
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      targetType: 'RESULT',
      targetId: record.stateCode,
      summary: `${record.stateName}: ${record.history.at(-2)?.to ?? 'AWAITING_SUBMISSION'} → ${to}`,
      metadata: { from: record.history.at(-2)?.to ?? 'AWAITING_SUBMISSION', to },
    });
    this.commit();
    return { ok: true, record: { ...record, votes: { ...record.votes }, history: [...record.history] } };
  }

  /* ----------------------------- accounts ---------------------------- */

  accounts(): StoredAccount[] {
    return this.data.accounts.map((a) => ({ ...a }));
  }

  accountById(id: string): StoredAccount | undefined {
    const found = this.data.accounts.find((a) => a.id === id);
    return found ? { ...found } : undefined;
  }

  accountByEmail(email: string): StoredAccount | undefined {
    const found = this.data.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    return found ? { ...found } : undefined;
  }

  createAccount(input: {
    email: string;
    displayName: string;
    role: AdminRole;
    passwordHash: string;
  }): Account {
    if (this.accountByEmail(input.email)) throw new Error('An account with that email already exists');
    const now = new Date().toISOString();
    const account: StoredAccount = {
      id: randomUUID(),
      email: input.email.toLowerCase(),
      displayName: input.displayName,
      role: input.role,
      status: 'ACTIVE',
      mfaEnabled: false,
      createdAt: now,
      lastLoginAt: null,
      passwordHash: input.passwordHash,
      mfaSecret: null,
      mfaPendingSecret: null,
      failedAttempts: 0,
      lockedUntil: null,
    };
    this.data.accounts.push(account);
    this.appendAudit({
      action: 'ACCOUNT_CREATED',
      actorId: null,
      actorEmail: 'system@synthetic.demo',
      actorRole: null,
      targetType: 'ACCOUNT',
      targetId: account.email,
      summary: `Account created for ${account.email} (${account.role})`,
      metadata: { role: account.role },
    });
    this.commit();
    return publicAccount(account);
  }

  updateAccount(id: string, patch: Partial<StoredAccount>, audit?: { action: AuditAction; summary: string; metadata?: Record<string, string> }, actor?: TransitionActor): Account | undefined {
    const account = this.data.accounts.find((a) => a.id === id);
    if (!account) return undefined;
    Object.assign(account, patch);
    if (audit) {
      this.appendAudit({
        action: audit.action,
        actorId: actor?.id ?? null,
        actorEmail: actor?.email ?? 'system@synthetic.demo',
        actorRole: actor?.role ?? null,
        targetType: 'ACCOUNT',
        targetId: account.email,
        summary: audit.summary,
        metadata: audit.metadata ?? {},
      });
    }
    this.commit();
    return publicAccount(account);
  }

  /* ------------------------------ audit ------------------------------ */

  appendAudit(entry: Omit<AuditEntry, 'id' | 'at'> & { at?: string }): void {
    const record: AuditEntry = {
      id: randomUUID(),
      at: entry.at ?? new Date().toISOString(),
      ...entry,
    };
    this.data.audit.push(record);
  }

  audit(limit = 50, action?: AuditAction): AuditEntry[] {
    const filtered = action ? this.data.audit.filter((a) => a.action === action) : this.data.audit;
    return [...filtered].sort((a, b) => b.at.localeCompare(a.at)).slice(0, Math.min(limit, 200));
  }

  /* -------------------------- notifications -------------------------- */

  notifications(): NotificationItem[] {
    return this.data.notifications.map((n) => ({ ...n }));
  }

  markNotificationRead(id: string): NotificationItem | undefined {
    const item = this.data.notifications.find((n) => n.id === id);
    if (!item) return undefined;
    item.read = true;
    this.commit();
    return { ...item };
  }

  notice(): string {
    return DEMO_NOTICE;
  }
}

export function publicAccount(account: StoredAccount): Account {
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    role: account.role,
    status: account.status,
    mfaEnabled: account.mfaEnabled,
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
  };
}
