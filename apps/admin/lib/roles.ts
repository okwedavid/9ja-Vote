import {
  AdminRole,
  Permission,
  RESULT_TRANSITIONS,
  ResultStatus,
  ROLE_PERMISSIONS,
} from '@9ja-vote/shared-types';

export function permissionForStatus(to: ResultStatus): Permission {
  if (to === 'SUBMITTED') return 'results.ingest';
  if (to === 'OFFICIALLY_DECLARED') return 'results.publish';
  return 'results.verify';
}

const LABEL: Record<ResultStatus, string> = {
  AWAITING_SUBMISSION: 'submit sheet',
  SUBMITTED: 'acknowledge receipt',
  RECEIVED: 'start verification',
  UNDER_VERIFICATION: 'mark verified',
  VERIFIED: 'record declaration',
  DISPUTED: 'flag dispute',
  OFFICIALLY_DECLARED: 'no further action',
};

/** Only the transitions this role is actually allowed to perform, so the UI never offers a 403. */
export function availableTransitions(from: ResultStatus, role: AdminRole): Array<{ value: ResultStatus; label: string }> {
  return RESULT_TRANSITIONS[from]
    .filter((to) => ROLE_PERMISSIONS[role].includes(permissionForStatus(to)))
    .map((to) => ({ value: to, label: to === 'DISPUTED' ? 'flag as disputed' : LABEL[to] }));
}
