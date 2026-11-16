/**
 * Reference content for the demonstration platform: calendar, candidates,
 * polling units, voter education, FAQ, glossary, locales and source register.
 *
 * Every political name, polling-unit code and figure here is SYNTHETIC and
 * clearly labelled. Real content is only ever loaded by an authorised Data
 * Manager from an INEC publication, with a source reference and timestamp.
 */

import { DEMO_ELECTION, DEMO_PARTIES } from './index';

const SEEDED_AT = '2026-11-12T08:00:00.000Z';

/* ------------------------------------------------------------------ */
/* Election calendar                                                   */
/* ------------------------------------------------------------------ */

export type ElectionPhase =
  | 'TIMETABLE_PUBLISHED'
  | 'VOTER_REGISTRATION'
  | 'PARTY_PRIMARIES'
  | 'CAMPAIGN'
  | 'ACCREDITATION'
  | 'VOTING'
  | 'RESULTS';

export interface ElectionCalendarItem {
  id: string;
  phase: ElectionPhase;
  title: string;
  /** ISO date. Demonstration timetable, not INEC's published calendar. */
  date: string;
  description: string;
  sourceReference: string;
}

export const DEMO_CALENDAR: ElectionCalendarItem[] = [
  {
    id: 'cal-1',
    phase: 'TIMETABLE_PUBLISHED',
    title: 'Demonstration timetable published',
    date: '2026-10-01',
    description: 'Placeholder timetable used to exercise the calendar UI. It is not INEC’s timetable.',
    sourceReference: 'Synthetic demo data',
  },
  {
    id: 'cal-2',
    phase: 'VOTER_REGISTRATION',
    title: 'Continuous voter registration window (illustrative)',
    date: '2026-10-15',
    description: 'The platform never registers voters. This entry only demonstrates how a real timetable would render.',
    sourceReference: 'Synthetic demo data',
  },
  {
    id: 'cal-3',
    phase: 'PARTY_PRIMARIES',
    title: 'Party primary window (illustrative)',
    date: '2026-11-20',
    description: 'Demonstration phase for party-directory screens.',
    sourceReference: 'Synthetic demo data',
  },
  {
    id: 'cal-4',
    phase: 'CAMPAIGN',
    title: 'Public campaign window (illustrative)',
    date: '2026-12-01',
    description: 'Demonstration phase for notification and education content.',
    sourceReference: 'Synthetic demo data',
  },
  {
    id: 'cal-5',
    phase: 'ACCREDITATION',
    title: 'Accreditation and logistics readiness (illustrative)',
    date: '2027-01-10',
    description: 'Demonstration phase for polling-unit readiness screens.',
    sourceReference: 'Synthetic demo data',
  },
  {
    id: 'cal-6',
    phase: 'VOTING',
    title: 'Presidential and National Assembly election day (reported date)',
    date: '2027-01-16',
    description:
      'Date repeated from the project brief. Confirm against INEC’s published timetable before displaying it as fact.',
    sourceReference: 'Project brief — verify with INEC',
  },
  {
    id: 'cal-7',
    phase: 'RESULTS',
    title: 'State collation and declarations (illustrative)',
    date: '2027-01-17',
    description: 'The platform mirrors results it is authorised to receive. It never declares a winner.',
    sourceReference: 'Synthetic demo data',
  },
];

/* ------------------------------------------------------------------ */
/* Candidates (fictional)                                              */
/* ------------------------------------------------------------------ */

export interface ManifestoPledge {
  title: string;
  summary: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  partyId: string;
  /** Clearly fictional name. */
  name: string;
  age: number;
  homeStateCode: string;
  slogan: string;
  manifesto: ManifestoPledge[];
  verificationStatus: 'SYNTHETIC' | 'UNVERIFIED' | 'VERIFIED_AGAINST_INEC';
  sourceReference: string;
  lastUpdated: string;
}

const FICTIONAL_NAMES = [
  'Amara O. Demo-Alpha',
  'Tunde B. Sample-Beta',
  'Ngozi C. Test-Gamma',
  'Ibrahim D. Placeholder-Delta',
  'Ebi E. Mock-Epsilon',
];

const PLEDGES: ManifestoPledge[][] = [
  [
    { title: 'Transparent collation', summary: 'Publish polling-unit level figures with timestamps and audit trails.' },
    { title: 'Civic education', summary: 'Fund plain-language voter education in English, Hausa, Yoruba, Igbo and Pidgin.' },
    { title: 'Accessible polling', summary: 'Priority access and assistive support at every polling unit.' },
  ],
  [
    { title: 'Local security', summary: 'Community-led safety planning for election day logistics.' },
    { title: 'Youth employment', summary: 'Skills programmes tied to public infrastructure projects.' },
    { title: 'Digital records', summary: 'Digitise land and business registries across the states.' },
  ],
  [
    { title: 'Health access', summary: 'Primary healthcare funding formula published every quarter.' },
    { title: 'Teacher training', summary: 'Annual teacher training and classroom connectivity.' },
    { title: 'Open budgets', summary: 'Machine-readable state budgets published before approval.' },
  ],
  [
    { title: 'Power reliability', summary: 'Grid and off-grid investment with published uptime targets.' },
    { title: 'Agriculture', summary: 'Storage and transport support for smallholder farmers.' },
    { title: 'Water', summary: 'State-by-state water point mapping and maintenance.' },
  ],
  [
    { title: 'Institutional reform', summary: 'Publish service standards and complaint resolution times.' },
    { title: 'Election integrity', summary: 'Support independent observation and result verification.' },
    { title: 'Disability inclusion', summary: 'Accessibility audits of public buildings.' },
  ],
];

export const DEMO_CANDIDATES: Candidate[] = DEMO_PARTIES.map((party, i) => ({
  id: `cand-${party.id}`,
  electionId: DEMO_ELECTION.id,
  partyId: party.id,
  name: FICTIONAL_NAMES[i],
  age: 42 + i * 3,
  homeStateCode: ['LA', 'KN', 'AN', 'RV', 'FC'][i] ?? 'FC',
  slogan: 'A demonstration slogan for a fictional candidacy.',
  manifesto: PLEDGES[i],
  verificationStatus: 'SYNTHETIC',
  sourceReference: 'Synthetic seed data (packages/shared-types)',
  lastUpdated: SEEDED_AT,
}));

export function candidateForParty(partyId: string): Candidate | undefined {
  return DEMO_CANDIDATES.find((c) => c.partyId === partyId);
}

/* ------------------------------------------------------------------ */
/* Polling units (synthetic codes)                                     */
/* ------------------------------------------------------------------ */

export interface PollingUnit {
  code: string;
  name: string;
  wardCode: string;
  wardName: string;
  lgaCode: string;
  lgaName: string;
  stateCode: string;
  stateName: string;
  registeredVoters: number;
  accessible: boolean;
  dataSource: 'SYNTHETIC_DEMO';
}

const LGA_SUFFIXES = ['Central', 'North', 'South', 'East', 'West'];

/** Deterministic synthetic polling units so search and drill-down can be demonstrated. */
export function buildDemoPollingUnits(stateCode: string, stateName: string): PollingUnit[] {
  const units: PollingUnit[] = [];
  for (let l = 1; l <= 3; l += 1) {
    const lgaCode = `${stateCode}-LGA-${String(l).padStart(2, '0')}`;
    const lgaName = `${stateName} ${LGA_SUFFIXES[l - 1]}`;
    for (let w = 1; w <= 2; w += 1) {
      const wardCode = `${lgaCode}-W-${String(w).padStart(2, '0')}`;
      const wardName = `Ward ${String(w).padStart(2, '0')}`;
      for (let p = 1; p <= 3; p += 1) {
        const code = `${wardCode}-PU-${String(p).padStart(3, '0')}`;
        units.push({
          code,
          name: `Demo Polling Unit ${l}.${w}.${p}`,
          wardCode,
          wardName,
          lgaCode,
          lgaName,
          stateCode,
          stateName,
          registeredVoters: 380 + ((l * 97 + w * 41 + p * 13) % 520),
          accessible: p !== 2 || w === 1,
          dataSource: 'SYNTHETIC_DEMO',
        });
      }
    }
  }
  return units;
}

/* ------------------------------------------------------------------ */
/* Voter education                                                     */
/* ------------------------------------------------------------------ */

export type EducationCategory = 'REGISTRATION' | 'VOTING_DAY' | 'RESULTS' | 'SAFETY' | 'ACCESSIBILITY';

export interface VoterEducationArticle {
  slug: string;
  category: EducationCategory;
  title: string;
  summary: string;
  body: string[];
  updatedAt: string;
  sourceReference: string;
}

export const VOTER_EDUCATION: VoterEducationArticle[] = [
  {
    slug: 'check-your-registration',
    category: 'REGISTRATION',
    title: 'How to check your voter registration',
    summary: 'Where to confirm your details and what to do if they are wrong — using official INEC channels.',
    body: [
      'Voter registration is handled by INEC, not by this platform. 9ja Vote never registers anyone and never stores biometric data.',
      'Confirm your registration status and polling unit through INEC’s own published channels before election day.',
      'If your details are wrong, follow INEC’s correction process. This platform cannot change them for you.',
    ],
    updatedAt: SEEDED_AT,
    sourceReference: 'General civic guidance — verify with INEC',
  },
  {
    slug: 'what-to-bring',
    category: 'VOTING_DAY',
    title: 'What to bring on election day',
    summary: 'Your permanent voter card, and a plan for getting to your polling unit early.',
    body: [
      'Bring the identification INEC requires and confirm your polling unit in advance. Requirements can change — check INEC’s instructions for the specific election.',
      'Accreditation happens before voting. Arrive early and follow officials’ instructions.',
      'This platform does not issue voter cards, accreditation or any document that could be mistaken for an official one.',
    ],
    updatedAt: SEEDED_AT,
    sourceReference: 'General civic guidance — verify with INEC',
  },
  {
    slug: 'how-results-are-collated',
    category: 'RESULTS',
    title: 'How results travel from the polling unit',
    summary: 'Polling unit → ward → local government → state → national collation, and why timestamps matter.',
    body: [
      'Results are recorded at the polling unit, then collated upward through ward, local government and state levels.',
      'Each level should be traceable to a signed sheet and a timestamp. 9ja Vote shows the status of every record it holds: received, under verification, verified or disputed.',
      'Only INEC can declare a result. This platform mirrors figures it is authorised to receive and marks anything synthetic as demonstration data.',
    ],
    updatedAt: SEEDED_AT,
    sourceReference: 'General civic guidance — verify with INEC',
  },
  {
    slug: 'spotting-misinformation',
    category: 'SAFETY',
    title: 'Spotting election misinformation',
    summary: 'Check the source, the timestamp and whether the claim is a screenshot of a screenshot.',
    body: [
      'Look for an official source and a date. Figures without a polling-unit trail should be treated as unverified.',
      'Screenshots are easy to fabricate. Prefer the originating page or document.',
      'Report threats and violence to the authorities. This platform cannot receive incident reports that require emergency action.',
    ],
    updatedAt: SEEDED_AT,
    sourceReference: 'General civic guidance',
  },
  {
    slug: 'accessibility-at-polling-units',
    category: 'ACCESSIBILITY',
    title: 'Accessibility at polling units',
    summary: 'Assistance for voters with disabilities, and what to ask for.',
    body: [
      'Assisted voting arrangements exist for voters who need them. Ask a polling official for help if you need it.',
      'This website targets WCAG 2.2 AA, supports keyboard navigation, visible focus and reduced motion.',
      'The mobile app supports large text and screen readers; these settings are in the app, not in your account profile.',
    ],
    updatedAt: SEEDED_AT,
    sourceReference: 'General civic guidance',
  },
];

/* ------------------------------------------------------------------ */
/* FAQ, glossary, locales, source register                             */
/* ------------------------------------------------------------------ */

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: 'Is this an INEC platform?',
    answer: 'No. 9ja Vote is independent and is not affiliated with INEC or any government body. Every figure here is demonstration data.',
  },
  {
    question: 'Can I vote here?',
    answer: 'No. There is no voting feature. The platform holds no vote-casting endpoint and no legally operative remote voting.',
  },
  {
    question: 'Does creating an account register me to vote?',
    answer: 'No. An app account is not voter registration. Voter registration is handled only by INEC.',
  },
  {
    question: 'Where do the results come from?',
    answer: 'The demonstration dataset is synthetic. In production, figures would only come from sources INEC has authorised, each with a source reference and timestamp.',
  },
  {
    question: 'Can anyone change a published result?',
    answer: 'No. Published records are append-only. Corrections create a new audited version and the previous version remains visible.',
  },
  {
    question: 'Can administrators see how I voted?',
    answer: 'There is no link between an identity and a ballot choice, so no administrator role — and no permission — can reveal how anyone voted.',
  },
];

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'LGA', definition: 'Local Government Area — the tier between ward and state in collation.' },
  { term: 'PU', definition: 'Polling Unit — where accreditation and voting take place.' },
  { term: 'Collation', definition: 'The staged aggregation of results from polling unit upward.' },
  { term: 'BVAS', definition: 'Bimodal Voter Accreditation System used by INEC for accreditation.' },
  { term: 'IReV', definition: 'INEC Result Viewing portal. This project is not connected to it.' },
  { term: 'Declaration', definition: 'The formal announcement of a result by the authorised body. Only INEC can declare.' },
];

export interface LocaleInfo {
  code: string;
  name: string;
  englishName: string;
  enabled: boolean;
  /** Why a locale is not enabled yet. */
  status: 'LIVE' | 'AWAITING_NATIVE_REVIEW';
}

export const LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', englishName: 'English', enabled: true, status: 'LIVE' },
  { code: 'ha', name: 'Hausa', englishName: 'Hausa', enabled: false, status: 'AWAITING_NATIVE_REVIEW' },
  { code: 'yo', name: 'Yorùbá', englishName: 'Yoruba', enabled: false, status: 'AWAITING_NATIVE_REVIEW' },
  { code: 'ig', name: 'Igbo', englishName: 'Igbo', enabled: false, status: 'AWAITING_NATIVE_REVIEW' },
  { code: 'pcm', name: 'Naijá', englishName: 'Nigerian Pidgin', enabled: false, status: 'AWAITING_NATIVE_REVIEW' },
];

/* ------------------------------------------------------------------ */
/* Source register                                                     */
/* ------------------------------------------------------------------ */

export interface SourceReference {
  id: string;
  publisher: string;
  title: string;
  url: string | null;
  accessedAt: string;
  note: string;
}

export const SOURCE_REGISTER: SourceReference[] = [
  {
    id: 'src-synthetic',
    publisher: '9ja Vote (internal)',
    title: 'Synthetic demonstration dataset',
    url: null,
    accessedAt: SEEDED_AT,
    note: 'Generated seed data. Not election data.',
  },
  {
    id: 'src-inec-timetable',
    publisher: 'Independent National Electoral Commission',
    title: 'Published election timetable (to be supplied)',
    url: null,
    accessedAt: SEEDED_AT,
    note: 'Placeholder: real dates must be loaded from an INEC publication with a timestamp.',
  },
];

/* ------------------------------------------------------------------ */
/* Notifications (demo)                                                */
/* ------------------------------------------------------------------ */

export type NotificationKind = 'RESULT_UPDATE' | 'CALENDAR' | 'SECURITY' | 'SERVICE';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
  actionHref?: string;
}

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ntf-1',
    kind: 'RESULT_UPDATE',
    title: 'Demonstration figures updated',
    body: 'Synthetic state figures were re-generated for the demonstration dataset.',
    at: '2026-11-12T07:30:00.000Z',
    read: false,
    actionHref: '/results',
  },
  {
    id: 'ntf-2',
    kind: 'CALENDAR',
    title: 'Illustrative timetable entry added',
    body: 'The demonstration calendar gained an accreditation-readiness entry.',
    at: '2026-11-11T16:05:00.000Z',
    read: false,
    actionHref: '/elections',
  },
  {
    id: 'ntf-3',
    kind: 'SECURITY',
    title: 'Sign-in from a new device (example)',
    body: 'This is an example security notification. Real alerts are only sent after accounts and MFA ship.',
    at: '2026-11-10T09:12:00.000Z',
    read: true,
  },
  {
    id: 'ntf-4',
    kind: 'SERVICE',
    title: 'Hausa, Yoruba, Igbo and Pidgin are in review',
    body: 'Translations are drafted but disabled until native speakers review them.',
    at: '2026-11-09T12:00:00.000Z',
    read: true,
    actionHref: '/help#languages',
  },
];
