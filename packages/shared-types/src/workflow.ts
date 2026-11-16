import { ResultStatus } from './index';

/**
 * Allowed forward transitions for a result record.
 *
 * - A record may only move along this graph; anything else is rejected by the API.
 * - `OFFICIALLY_DECLARED` is reachable only from `VERIFIED` and only by an
 *   Election Administrator, and it never means "we declare a winner": it records
 *   that an authorised body has declared a result elsewhere.
 * - Once published, values are immutable. A correction must be a new version
 *   (see `supersedesId`), never a silent edit.
 */
export const RESULT_TRANSITIONS: Record<ResultStatus, ResultStatus[]> = {
  AWAITING_SUBMISSION: ['SUBMITTED', 'DISPUTED'],
  SUBMITTED: ['RECEIVED', 'DISPUTED'],
  RECEIVED: ['UNDER_VERIFICATION', 'DISPUTED'],
  UNDER_VERIFICATION: ['VERIFIED', 'DISPUTED'],
  VERIFIED: ['OFFICIALLY_DECLARED', 'DISPUTED'],
  DISPUTED: ['UNDER_VERIFICATION'],
  OFFICIALLY_DECLARED: [],
};

/** Statuses whose figures are safe to publish as "as received". */
export const PUBLISHED_STATUSES: ResultStatus[] = [
  'RECEIVED',
  'UNDER_VERIFICATION',
  'VERIFIED',
  'DISPUTED',
  'OFFICIALLY_DECLARED',
];

export function canTransition(from: ResultStatus, to: ResultStatus): boolean {
  return RESULT_TRANSITIONS[from].includes(to);
}

/** Human-readable action name for a transition, used in the UI and audit log. */
export const TRANSITION_ACTION: Partial<Record<`${ResultStatus}>${ResultStatus}`, string>> = {
  'AWAITING_SUBMISSION>SUBMITTED': 'Submit result sheet',
  'SUBMITTED>RECEIVED': 'Acknowledge receipt',
  'RECEIVED>UNDER_VERIFICATION': 'Start verification',
  'UNDER_VERIFICATION>VERIFIED': 'Verify figures',
  'VERIFIED>OFFICIALLY_DECLARED': 'Record authorised declaration',
  'AWAITING_SUBMISSION>DISPUTED': 'Flag dispute',
  'SUBMITTED>DISPUTED': 'Flag dispute',
  'RECEIVED>DISPUTED': 'Flag dispute',
  'UNDER_VERIFICATION>DISPUTED': 'Flag dispute',
  'VERIFIED>DISPUTED': 'Flag dispute',
  'DISPUTED>UNDER_VERIFICATION': 'Reopen verification',
};
