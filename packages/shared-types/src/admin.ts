/**
 * Administration models shared by the API and the Command Centre.
 *
 * Accounts here are platform accounts only. Holding one does not make anyone a
 * registered voter, and no model in this file links an identity to a ballot.
 */

import { AdminRole } from './index';
import { StateResult } from './index';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface Account {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: AccountStatus;
  mfaEnabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export type AuditAction =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_MFA_ENABLED'
  | 'AUTH_MFA_DISABLED'
  | 'AUTH_PASSWORD_CHANGED'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REINSTATED'
  | 'ACCOUNT_ROLE_CHANGED'
  | 'RESULT_TRANSITION'
  | 'DATA_EXPORTED';

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string | null;
  actorEmail: string;
  actorRole: AdminRole | null;
  action: AuditAction;
  targetType: 'ACCOUNT' | 'RESULT' | 'SESSION' | 'SYSTEM';
  targetId: string;
  summary: string;
  metadata: Record<string, string>;
}

export interface ResultTransition {
  at: string;
  from: StateResult['status'];
  to: StateResult['status'];
  actorEmail: string;
  note: string | null;
}

/**
 * A result record adds workflow and provenance fields to the published figures.
 * Published values are immutable: corrections create a new record with
 * `version + 1` and `supersedesId` pointing at the previous version.
 */
export interface ResultRecord extends StateResult {
  submittedAt: string | null;
  submittedBy: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  note: string | null;
  version: number;
  supersedesId: string | null;
  history: ResultTransition[];
}

export interface WorkflowSummary {
  byStatus: Record<string, number>;
  awaitingAction: number;
  total: number;
  oldestPendingAt: string | null;
  dataSource: 'SYNTHETIC_DEMO';
  notice: string;
}

export interface AdminMetrics {
  statesReporting: number;
  statesTotal: number;
  pollingUnitsReported: number;
  pollingUnitsTotal: number;
  totalValidVotes: number;
  verifiedStates: number;
  disputedStates: number;
  awaitingSubmission: number;
  accounts: { total: number; active: number; mfaEnabled: number };
  auditEntries: number;
  lastAuditAt: string | null;
  storeVersion: number;
  uptimeSeconds: number;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  account: Account;
}

export interface MfaChallenge {
  mfaRequired: true;
  message: string;
}
