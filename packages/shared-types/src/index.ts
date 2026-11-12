/**
 * @9ja-vote/shared-types
 * Domain types shared by the API and the web applications, plus a clearly
 * labelled SYNTHETIC demonstration dataset.
 *
 * Nothing in this file is official election data. Party names are deliberately
 * fictional placeholders: real parties and candidates must only ever be loaded
 * from verified INEC publications by an authorised data manager.
 */

export const DATA_CLASSIFICATION = 'DEMONSTRATION' as const;
export const DEMO_NOTICE =
  'Demonstration data only. Synthetic figures for testing. Not official results and not affiliated with INEC.';

export type ElectionType =
  | 'PRESIDENTIAL'
  | 'SENATE'
  | 'HOUSE_OF_REPRESENTATIVES'
  | 'GOVERNORSHIP'
  | 'STATE_HOUSE_OF_ASSEMBLY';

export type GeoLevel = 'POLLING_UNIT' | 'WARD' | 'LGA' | 'STATE' | 'NATIONAL';

export const RESULT_STATUSES = [
  'AWAITING_SUBMISSION',
  'SUBMITTED',
  'RECEIVED',
  'UNDER_VERIFICATION',
  'VERIFIED',
  'DISPUTED',
  'OFFICIALLY_DECLARED',
] as const;
export type ResultStatus = (typeof RESULT_STATUSES)[number];

export const RESULT_STATUS_LABEL: Record<ResultStatus, string> = {
  AWAITING_SUBMISSION: 'Awaiting submission',
  SUBMITTED: 'Submitted',
  RECEIVED: 'Received',
  UNDER_VERIFICATION: 'Under verification',
  VERIFIED: 'Verified',
  DISPUTED: 'Disputed',
  OFFICIALLY_DECLARED: 'Officially declared',
};

export type DataSource = 'SYNTHETIC_DEMO' | 'INEC_AUTHORISED';

export interface Election {
  id: string;
  title: string;
  type: ElectionType;
  /** ISO date. For real elections this must come from INEC's published timetable. */
  date: string;
  dataSource: DataSource;
  /** Real-election participation is permanently false in this codebase until legally authorised. */
  realVotingEnabled: false;
}

export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  colour: string;
  description: string;
  verificationStatus: 'SYNTHETIC' | 'UNVERIFIED' | 'VERIFIED_AGAINST_INEC';
  sourceReference: string;
  lastUpdated: string;
}

export interface StateInfo {
  code: string;
  name: string;
  /** Position on the schematic tile map [column, row]. Not a geographic projection. */
  tile: [number, number];
}

export interface StateResult {
  electionId: string;
  stateCode: string;
  stateName: string;
  status: ResultStatus;
  votes: Record<string, number>;
  totalValidVotes: number;
  /** Party with the most votes in the figures received so far. Not a declaration. */
  leadingPartyId: string | null;
  pollingUnitsReported: number;
  pollingUnitsTotal: number;
  source: DataSource;
  updatedAt: string;
}

export interface NationalSummary {
  election: Election;
  classification: typeof DATA_CLASSIFICATION;
  notice: string;
  generatedAt: string;
  totals: { partyId: string; votes: number; share: number; statesLeading: number }[];
  totalValidVotes: number;
  statesReporting: number;
  statesTotal: number;
  pollingUnitsReported: number;
  pollingUnitsTotal: number;
  statusBreakdown: Record<ResultStatus, number>;
  /** Always null: this platform never independently declares a winner. */
  declaredWinner: null;
}

/* ------------------------------------------------------------------ */
/* Administration roles (RBAC)                                         */
/* ------------------------------------------------------------------ */

export const ADMIN_ROLES = [
  'SUPER_ADMINISTRATOR',
  'ELECTION_ADMINISTRATOR',
  'DATA_MANAGER',
  'RESULTS_VERIFICATION_OFFICER',
  'SUPPORT_OFFICER',
  'READ_ONLY_AUDITOR',
] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const PERMISSIONS = [
  'admin.users.manage',
  'elections.configure',
  'parties.edit',
  'parties.approve',
  'results.ingest',
  'results.verify',
  'results.publish',
  'support.tickets',
  'audit.read',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/**
 * Separation of duties: nobody holds both `parties.edit` and `parties.approve`,
 * or both `results.ingest` and `results.verify`. No role can read ballot choices
 * because no such permission exists.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMINISTRATOR: ['admin.users.manage', 'audit.read'],
  ELECTION_ADMINISTRATOR: ['elections.configure', 'parties.approve', 'results.publish', 'audit.read'],
  DATA_MANAGER: ['parties.edit', 'results.ingest'],
  RESULTS_VERIFICATION_OFFICER: ['results.verify', 'audit.read'],
  SUPPORT_OFFICER: ['support.tickets'],
  READ_ONLY_AUDITOR: ['audit.read'],
};

/* ------------------------------------------------------------------ */
/* Geography (factual: the 36 states and the FCT)                      */
/* ------------------------------------------------------------------ */

export const STATES: StateInfo[] = [
  { code: 'SO', name: 'Sokoto', tile: [1, 0] },
  { code: 'KT', name: 'Katsina', tile: [3, 0] },
  { code: 'JI', name: 'Jigawa', tile: [4, 0] },
  { code: 'YO', name: 'Yobe', tile: [5, 0] },
  { code: 'BO', name: 'Borno', tile: [6, 0] },
  { code: 'KE', name: 'Kebbi', tile: [0, 1] },
  { code: 'ZA', name: 'Zamfara', tile: [1, 1] },
  { code: 'KN', name: 'Kano', tile: [3, 1] },
  { code: 'BA', name: 'Bauchi', tile: [4, 1] },
  { code: 'GO', name: 'Gombe', tile: [5, 1] },
  { code: 'AD', name: 'Adamawa', tile: [6, 1] },
  { code: 'NI', name: 'Niger', tile: [1, 2] },
  { code: 'KD', name: 'Kaduna', tile: [2, 2] },
  { code: 'PL', name: 'Plateau', tile: [4, 2] },
  { code: 'TA', name: 'Taraba', tile: [5, 2] },
  { code: 'KW', name: 'Kwara', tile: [0, 3] },
  { code: 'FC', name: 'FCT', tile: [2, 3] },
  { code: 'NA', name: 'Nasarawa', tile: [3, 3] },
  { code: 'BE', name: 'Benue', tile: [4, 3] },
  { code: 'OY', name: 'Oyo', tile: [0, 4] },
  { code: 'OS', name: 'Osun', tile: [1, 4] },
  { code: 'EK', name: 'Ekiti', tile: [2, 4] },
  { code: 'KO', name: 'Kogi', tile: [3, 4] },
  { code: 'EN', name: 'Enugu', tile: [4, 4] },
  { code: 'EB', name: 'Ebonyi', tile: [5, 4] },
  { code: 'OG', name: 'Ogun', tile: [0, 5] },
  { code: 'ON', name: 'Ondo', tile: [1, 5] },
  { code: 'ED', name: 'Edo', tile: [2, 5] },
  { code: 'AN', name: 'Anambra', tile: [3, 5] },
  { code: 'IM', name: 'Imo', tile: [4, 5] },
  { code: 'AB', name: 'Abia', tile: [5, 5] },
  { code: 'CR', name: 'Cross River', tile: [6, 5] },
  { code: 'LA', name: 'Lagos', tile: [0, 6] },
  { code: 'DE', name: 'Delta', tile: [2, 6] },
  { code: 'BY', name: 'Bayelsa', tile: [3, 6] },
  { code: 'RI', name: 'Rivers', tile: [4, 6] },
  { code: 'AK', name: 'Akwa Ibom', tile: [5, 6] },
];

/* ------------------------------------------------------------------ */
/* Synthetic demonstration dataset                                     */
/* ------------------------------------------------------------------ */

const SEEDED_AT = '2026-11-12T08:00:00.000Z';

export const DEMO_ELECTION: Election = {
  id: 'demo-presidential-001',
  title: 'Demonstration Presidential Election (synthetic)',
  type: 'PRESIDENTIAL',
  date: '2027-01-16',
  dataSource: 'SYNTHETIC_DEMO',
  realVotingEnabled: false,
};

const demoParty = (id: string, letter: string, colour: string): Party => ({
  id,
  name: `Demo Party ${letter}`,
  abbreviation: `DP${letter[0]}`,
  colour,
  description: 'Fictional placeholder party used only to exercise the platform.',
  verificationStatus: 'SYNTHETIC',
  sourceReference: 'Synthetic seed data (packages/shared-types)',
  lastUpdated: SEEDED_AT,
});

export const DEMO_PARTIES: Party[] = [
  demoParty('dp-a', 'Alpha', '#0a7d43'),
  demoParty('dp-b', 'Beta', '#c8961e'),
  demoParty('dp-c', 'Gamma', '#2563a8'),
  demoParty('dp-d', 'Delta', '#8a4fb3'),
  demoParty('dp-e', 'Epsilon', '#6b7280'),
];

/** Small deterministic PRNG (mulberry32) so the demo data is reproducible in tests. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function leadingParty(votes: Record<string, number>): string | null {
  let best: string | null = null;
  let bestVotes = 0;
  let tie = false;
  for (const [id, v] of Object.entries(votes)) {
    if (v > bestVotes) {
      best = id;
      bestVotes = v;
      tie = false;
    } else if (v === bestVotes && v > 0) {
      tie = true;
    }
  }
  return tie ? null : best;
}

export function buildDemoStateResults(seed = 2027): StateResult[] {
  const rand = prng(seed);
  const pattern: ResultStatus[] = [
    'VERIFIED', 'VERIFIED', 'UNDER_VERIFICATION', 'VERIFIED', 'RECEIVED',
    'SUBMITTED', 'VERIFIED', 'DISPUTED', 'AWAITING_SUBMISSION', 'UNDER_VERIFICATION',
  ];
  return STATES.map((s, i) => {
    const status = pattern[i % pattern.length];
    const pollingUnitsTotal = 2500 + Math.floor(rand() * 6000);
    const reportedShare = status === 'AWAITING_SUBMISSION' ? 0 : 0.55 + rand() * 0.45;
    const pollingUnitsReported = Math.floor(pollingUnitsTotal * reportedShare);
    const votes: Record<string, number> = {};
    const weights = DEMO_PARTIES.map((_, p) => (p < 3 ? 0.6 + rand() * 1.6 : 0.05 + rand() * 0.35));
    const turnout = pollingUnitsReported * (90 + Math.floor(rand() * 120));
    const weightSum = weights.reduce((a, b) => a + b, 0);
    DEMO_PARTIES.forEach((p, idx) => {
      votes[p.id] = Math.floor((turnout * weights[idx]) / weightSum);
    });
    const totalValidVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    return {
      electionId: DEMO_ELECTION.id,
      stateCode: s.code,
      stateName: s.name,
      status,
      votes,
      totalValidVotes,
      leadingPartyId: leadingParty(votes),
      pollingUnitsReported,
      pollingUnitsTotal,
      source: 'SYNTHETIC_DEMO',
      updatedAt: SEEDED_AT,
    };
  });
}

/**
 * Aggregates state-level figures into a national summary.
 * Deliberately never produces a winner: declaration is INEC's function alone.
 */
export function summarise(
  election: Election,
  parties: Party[],
  states: StateResult[],
  now: Date = new Date(),
): NationalSummary {
  const totalValidVotes = states.reduce((a, s) => a + s.totalValidVotes, 0);
  const totals = parties
    .map((p) => {
      const votes = states.reduce((a, s) => a + (s.votes[p.id] ?? 0), 0);
      return {
        partyId: p.id,
        votes,
        share: totalValidVotes === 0 ? 0 : votes / totalValidVotes,
        statesLeading: states.filter((s) => s.leadingPartyId === p.id).length,
      };
    })
    .sort((a, b) => b.votes - a.votes);
  const statusBreakdown = Object.fromEntries(RESULT_STATUSES.map((s) => [s, 0])) as Record<ResultStatus, number>;
  for (const s of states) statusBreakdown[s.status] += 1;
  return {
    election,
    classification: DATA_CLASSIFICATION,
    notice: DEMO_NOTICE,
    generatedAt: now.toISOString(),
    totals,
    totalValidVotes,
    statesReporting: states.filter((s) => s.status !== 'AWAITING_SUBMISSION').length,
    statesTotal: states.length,
    pollingUnitsReported: states.reduce((a, s) => a + s.pollingUnitsReported, 0),
    pollingUnitsTotal: states.reduce((a, s) => a + s.pollingUnitsTotal, 0),
    statusBreakdown,
    declaredWinner: null,
  };
}

export interface ResultsPayload {
  summary: NationalSummary;
  parties: Party[];
  states: StateResult[];
}

export function buildDemoPayload(now: Date = new Date()): ResultsPayload {
  const states = buildDemoStateResults();
  return { summary: summarise(DEMO_ELECTION, DEMO_PARTIES, states, now), parties: DEMO_PARTIES, states };
}
