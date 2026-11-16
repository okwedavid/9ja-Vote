import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Account, RESULT_STATUSES, STATES } from '@9ja-vote/shared-types';
import { DataStore } from '../common/data-store';
import { ResultsService } from './results.service';

const actor: Account = {
  id: 'test-actor',
  email: 'verifier@example.org',
  displayName: 'Test Verifier',
  role: 'RESULTS_VERIFICATION_OFFICER',
  status: 'ACTIVE',
  mfaEnabled: false,
  createdAt: new Date(0).toISOString(),
  lastLoginAt: null,
};

describe('ResultsService (synthetic data)', () => {
  let dir: string;
  let store: DataStore;
  let service: ResultsService;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), '9ja-results-'));
    store = new DataStore(join(dir, 'store.json'));
    service = new ResultsService(store);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('covers the 36 states and the FCT exactly once', () => {
    const payload = service.national();
    expect(payload.states).toHaveLength(37);
    expect(new Set(payload.states.map((s) => s.stateCode)).size).toBe(STATES.length);
  });

  it('never declares a winner', () => {
    expect(service.national().summary.declaredWinner).toBeNull();
  });

  it('labels everything as demonstration data', () => {
    const payload = service.national();
    expect(payload.summary.classification).toBe('DEMONSTRATION');
    expect(payload.states.every((s) => s.source === 'SYNTHETIC_DEMO')).toBe(true);
    expect(payload.parties.every((p) => p.verificationStatus === 'SYNTHETIC')).toBe(true);
    expect(payload.summary.election.realVotingEnabled).toBe(false);
  });

  it('keeps national totals consistent with state totals', () => {
    const payload = service.national();
    const fromStates = payload.states.reduce((a, s) => a + s.totalValidVotes, 0);
    const fromParties = payload.summary.totals.reduce((a, t) => a + t.votes, 0);
    expect(payload.summary.totalValidVotes).toBe(fromStates);
    expect(fromParties).toBe(fromStates);
    const statusCount = RESULT_STATUSES.reduce((a, s) => a + payload.summary.statusBreakdown[s], 0);
    expect(statusCount).toBe(37);
  });

  it('rejects unknown states', () => {
    expect(() => service.state('ZZ')).toThrow();
    expect(service.state('la').stateName).toBe('Lagos');
  });

  it('drills down from state to LGA and ward without inventing a winner', () => {
    const lgas = service.lgas('LA');
    expect(lgas).toHaveLength(3);
    expect(lgas.every((l) => l.level === 'LGA' && l.source === 'SYNTHETIC_DEMO')).toBe(true);
    const wards = service.wards('LA', lgas[0]!.code);
    expect(wards.children).toHaveLength(3);
    expect(wards.children?.every((w) => w.level === 'WARD')).toBe(true);
  });

  it('enforces the workflow graph', () => {
    const verifiedState = service.national().states.find((s) => s.status === 'VERIFIED');
    expect(verifiedState).toBeDefined();
    const code = verifiedState!.stateCode;
    const before = service.state(code);
    expect(before.status).toBe('VERIFIED');
    expect(() => service.transition(code, 'AWAITING_SUBMISSION', undefined, actor)).toThrow();
    const after = service.transition(code, 'DISPUTED', 'Figures queried during review', actor);
    expect(after.status).toBe('DISPUTED');
    expect(after.history.at(-1)?.note).toBe('Figures queried during review');
    expect(after.verifiedAt).not.toBeNull();
  });

  it('refuses a transition the role is not permitted to make', () => {
    const dataManager: Account = { ...actor, id: 'dm', email: 'dm@example.org', role: 'DATA_MANAGER' };
    const verifiedState = service.national().states.find((s) => s.status === 'VERIFIED')!;
    expect(() => service.transition(verifiedState.stateCode, 'DISPUTED', undefined, dataManager)).toThrow(/permission/i);
  });

  it('records every transition in the append-only audit log', () => {
    const verifiedState = service.national().states.find((s) => s.status === 'VERIFIED')!;
    service.transition(verifiedState.stateCode, 'DISPUTED', 'Audited change', actor);
    const entries = store.audit(20, 'RESULT_TRANSITION');
    expect(entries.some((e) => e.targetId === verifiedState.stateCode && e.actorEmail === actor.email)).toBe(true);
  });
});
