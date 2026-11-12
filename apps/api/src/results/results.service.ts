import { Injectable, NotFoundException } from '@nestjs/common';
import { buildDemoPayload, ResultsPayload, StateResult } from '@9ja-vote/shared-types';

/**
 * Read model for results. Today it serves the synthetic dataset; the same
 * interface will later be backed by PostgreSQL and an INEC-authorised source
 * adapter (see docs/architecture). It never declares a winner.
 */
@Injectable()
export class ResultsService {
  national(now: Date = new Date()): ResultsPayload {
    return buildDemoPayload(now);
  }

  state(code: string): StateResult {
    const found = buildDemoPayload().states.find((s) => s.stateCode === code.toUpperCase());
    if (!found) throw new NotFoundException(`Unknown state code: ${code}`);
    return found;
  }
}
