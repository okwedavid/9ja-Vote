import { DataSource, GeoLevel, leadingParty, ResultStatus, StateResult } from './index';

/** A sub-national result node used for LGA → ward → polling-unit drill-down. */
export interface SubResult {
  code: string;
  name: string;
  level: GeoLevel;
  parentCode: string | null;
  status: ResultStatus;
  votes: Record<string, number>;
  totalValidVotes: number;
  leadingPartyId: string | null;
  pollingUnitsReported: number;
  pollingUnitsTotal: number;
  source: DataSource;
  updatedAt: string;
  children?: SubResult[];
}

const LGA_SUFFIXES = ['Central', 'North', 'South'];

function splitVotes(votes: Record<string, number>, parts: number, index: number): Record<string, number> {
  const weights = [0.42, 0.35, 0.23];
  const weight = weights[index % weights.length] ?? 1 / parts;
  return Object.fromEntries(Object.entries(votes).map(([k, v]) => [k, Math.floor(v * weight)]));
}

/**
 * Deterministically derives synthetic lower-level figures from a state record so
 * the drill-down can be demonstrated without pretending the figures are real.
 * Rows inherit the state's status; only the split is generated.
 */
export function buildSubResults(parent: StateResult | SubResult, level: 'LGA' | 'WARD' | 'POLLING_UNIT'): SubResult[] {
  const parts = 3;
  const parentCode = 'stateCode' in parent ? parent.stateCode : parent.code;
  const parentName = 'stateName' in parent ? parent.stateName : parent.name;
  const children: SubResult[] = [];
  for (let i = 0; i < parts; i += 1) {
    const votes = splitVotes(parent.votes, parts, i);
    const totalValidVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    const puTotal = Math.max(1, Math.round(parent.pollingUnitsTotal / parts));
    const reportedShare = parent.pollingUnitsTotal === 0 ? 0 : parent.pollingUnitsReported / parent.pollingUnitsTotal;
    const code =
      level === 'LGA'
        ? `${parentCode}-LGA-${String(i + 1).padStart(2, '0')}`
        : level === 'WARD'
          ? `${parentCode}-W-${String(i + 1).padStart(2, '0')}`
          : `${parentCode}-PU-${String(i + 1).padStart(3, '0')}`;
    const name =
      level === 'LGA'
        ? `${parentName} ${LGA_SUFFIXES[i]}`
        : level === 'WARD'
          ? `Ward ${String(i + 1).padStart(2, '0')}`
          : `Polling Unit ${String(i + 1).padStart(3, '0')}`;
    children.push({
      code,
      name,
      level,
      parentCode,
      status: parent.status,
      votes,
      totalValidVotes,
      leadingPartyId: leadingParty(votes),
      pollingUnitsReported: Math.round(puTotal * reportedShare),
      pollingUnitsTotal: puTotal,
      source: 'SYNTHETIC_DEMO',
      updatedAt: parent.updatedAt,
    });
  }
  return children;
}
