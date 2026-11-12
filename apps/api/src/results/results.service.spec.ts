import { RESULT_STATUSES, STATES } from '@9ja-vote/shared-types';
import { ResultsService } from './results.service';

describe('ResultsService (synthetic data)', () => {
  const service = new ResultsService();
  const payload = service.national(new Date('2026-11-12T00:00:00Z'));

  it('covers the 36 states and the FCT exactly once', () => {
    expect(payload.states).toHaveLength(37);
    expect(new Set(payload.states.map((s) => s.stateCode)).size).toBe(STATES.length);
  });

  it('never declares a winner', () => {
    expect(payload.summary.declaredWinner).toBeNull();
  });

  it('labels everything as demonstration data', () => {
    expect(payload.summary.classification).toBe('DEMONSTRATION');
    expect(payload.states.every((s) => s.source === 'SYNTHETIC_DEMO')).toBe(true);
    expect(payload.parties.every((p) => p.verificationStatus === 'SYNTHETIC')).toBe(true);
    expect(payload.summary.election.realVotingEnabled).toBe(false);
  });

  it('keeps national totals consistent with state totals', () => {
    const fromStates = payload.states.reduce((a, s) => a + s.totalValidVotes, 0);
    const fromParties = payload.summary.totals.reduce((a, t) => a + t.votes, 0);
    expect(payload.summary.totalValidVotes).toBe(fromStates);
    expect(fromParties).toBe(fromStates);
    const statusCount = RESULT_STATUSES.reduce((a, s) => a + payload.summary.statusBreakdown[s], 0);
    expect(statusCount).toBe(37);
  });

  it('is deterministic', () => {
    expect(service.national(new Date(0)).states).toEqual(service.national(new Date(0)).states);
  });

  it('rejects unknown states', () => {
    expect(() => service.state('ZZ')).toThrow();
    expect(service.state('la').stateName).toBe('Lagos');
  });
});
