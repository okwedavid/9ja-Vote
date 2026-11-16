import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Account,
  buildSubResults,
  DEMO_ELECTION,
  DEMO_PARTIES,
  Permission,
  ResultRecord,
  ResultStatus,
  ResultsPayload,
  ROLE_PERMISSIONS,
  StateResult,
  SubResult,
  summarise,
  WorkflowSummary,
} from '@9ja-vote/shared-types';
import { DataStore } from '../common/data-store';

/**
 * Read and workflow model for results.
 *
 * It never declares a winner and never computes one: `declaredWinner` is always
 * null, and the only way a record reaches OFFICIALLY_DECLARED is an authorised
 * administrator recording a declaration made elsewhere.
 */
@Injectable()
export class ResultsService {
  constructor(private readonly store: DataStore) {}

  private payload(): ResultsPayload {
    const states: StateResult[] = this.store.results();
    return {
      summary: summarise(DEMO_ELECTION, DEMO_PARTIES, states, new Date()),
      parties: DEMO_PARTIES,
      states,
    };
  }

  national(): ResultsPayload {
    return this.payload();
  }

  state(code: string): StateResult {
    const record = this.store.result(code);
    if (!record) throw new NotFoundException(`Unknown state code: ${code}`);
    return record;
  }

  lgas(code: string): SubResult[] {
    return buildSubResults(this.state(code), 'LGA');
  }

  wards(code: string, lgaCode: string): SubResult {
    const lga = this.lgas(code).find((l) => l.code.toLowerCase() === lgaCode.toLowerCase());
    if (!lga) throw new NotFoundException(`Unknown LGA code: ${lgaCode}`);
    return { ...lga, children: buildSubResults(lga, 'WARD') };
  }

  workflow(): WorkflowSummary {
    const records = this.store.results();
    const byStatus = records.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
    const pending = records
      .filter((r) => r.status !== 'VERIFIED' && r.status !== 'OFFICIALLY_DECLARED')
      .map((r) => r.updatedAt)
      .sort();
    return {
      byStatus,
      awaitingAction: pending.length,
      total: records.length,
      oldestPendingAt: pending[0] ?? null,
      dataSource: 'SYNTHETIC_DEMO',
      notice: this.store.notice(),
    };
  }

  /** The permission a role must hold to move a record into `to`. */
  static permissionFor(to: ResultStatus): Permission {
    if (to === 'SUBMITTED') return 'results.ingest';
    if (to === 'OFFICIALLY_DECLARED') return 'results.publish';
    return 'results.verify';
  }

  transition(code: string, to: string, note: string | undefined, account: Account): ResultRecord {
    if (!['AWAITING_SUBMISSION', 'SUBMITTED', 'RECEIVED', 'UNDER_VERIFICATION', 'VERIFIED', 'DISPUTED', 'OFFICIALLY_DECLARED'].includes(to)) {
      throw new BadRequestException(`Unknown result status: ${to}`);
    }
    const permission = ResultsService.permissionFor(to as ResultStatus);
    if (!ROLE_PERMISSIONS[account.role].includes(permission)) {
      throw new ForbiddenException(
        `Moving a record to ${to} needs the "${permission}" permission. Your role (${account.role}) does not include it.`,
      );
    }
    const outcome = this.store.transition(code, to as ResultStatus, { id: account.id, email: account.email, role: account.role }, note ?? null);
    if (!outcome.ok || !outcome.record) throw new BadRequestException(outcome.reason ?? 'Transition rejected');
    return outcome.record;
  }
}
