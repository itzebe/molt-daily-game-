/**
 * MOLT engine — resolution: damage and outcome for a completed day.
 *
 * Pure and deterministic. Implements §2 of the mechanics specification exactly.
 * Every interpretive decision is listed in INTERPRETATIONS below and disclosed in
 * the mission report (no silent spec changes).
 *
 * INTERPRETATIONS (documented, not spec changes):
 *  I1. Share denominator N = distinct strikers (one strike each), so
 *      sum of (zone,tool) counts == N.
 *  I2. Ridge penalty (×0.9) is applied multiplicatively with fatigue, before rounding.
 *  I3. `Math.round` (round-half-up) is used, matching the spec's worked example.
 */
import {
  CROWD_BANDS,
  FATIGUE_PENALTY,
  INTEGRITY_COEFF,
  MAW,
  RIDGE_PENALTY,
  TOOL_MULT,
  ZONE_VALUE,
  ZONES,
  type BeastState,
  type Strike,
  type Tool,
  type Zone,
} from './rules.ts';

export interface Submission {
  userId: string;
  strike: Strike;
}

export interface DayAggregate {
  n: number;
  /** count per exact (zone:tool) combo */
  comboCount: Record<string, number>;
  /** count per zone (any tool) */
  zoneCount: Record<string, number>;
  /** count per tool (any zone) */
  toolCount: Record<string, number>;
}

export interface SubmissionResult {
  userId: string;
  strike: Strike;
  damage: number;
  crowdFactor: number;
  crowdLabel: string;
  share: number;
  isRead: boolean;
}

export interface DayResolution {
  day: number;
  n: number;
  integrity: number;
  totalDamage: number;
  outcome: 'SLAIN' | 'ESCAPED';
  results: SubmissionResult[];
  aggregate: DayAggregate;
  topTool: Tool | null;
  /** zoneShare per zone (any tool) */
  zoneShare: Record<string, number>;
}

export function comboKey(s: Strike): string {
  return `${s.zone}:${s.tool}`;
}

/** §1.4 crowd factor from the exact (zone,tool) share. */
export function crowdFactor(share: number): { factor: number; label: string } {
  for (const band of CROWD_BANDS) {
    if (share >= band.minShare) return { factor: band.factor, label: band.label };
  }
  return { factor: CROWD_BANDS[CROWD_BANDS.length - 1].factor, label: 'read' };
}

/** §1.5 Integrity target for a day: linear in the number of distinct strikers. */
export function integrityFor(n: number): number {
  return INTEGRITY_COEFF * n;
}

/** Aggregate raw submissions (does not depend on beast state). */
export function aggregate(submissions: Submission[]): DayAggregate {
  const comboCount: Record<string, number> = {};
  const zoneCount: Record<string, number> = {};
  const toolCount: Record<string, number> = {};
  for (const z of ZONES) zoneCount[z] = 0;
  for (const s of submissions) {
    const k = comboKey(s.strike);
    comboCount[k] = (comboCount[k] ?? 0) + 1;
    zoneCount[s.strike.zone] = (zoneCount[s.strike.zone] ?? 0) + 1;
    toolCount[s.strike.tool] = (toolCount[s.strike.tool] ?? 0) + 1;
  }
  return { n: submissions.length, comboCount, zoneCount, toolCount };
}

/** Most-used tool, tie-broken by tool order (cleave, pierce, burn). §3.3 */
export function topTool(agg: DayAggregate): Tool | null {
  let best: Tool | null = null;
  let bestN = -1;
  for (const t of ['cleave', 'pierce', 'burn'] as Tool[]) {
    const n = agg.toolCount[t] ?? 0;
    if (n > bestN) {
      bestN = n;
      best = t;
    }
  }
  return bestN <= 0 ? null : best;
}

/** Damage for one submission against a beast state. §2 step 5. */
export function damageFor(s: Strike, state: BeastState, share: number): number {
  const base = s.zone === ('maw' as Zone) ? MAW.value : ZONE_VALUE[s.zone];
  const toolMultiplier = TOOL_MULT[s.tool][state.zoneState[s.zone] ?? 'exposed'];
  // NOTE (spec contradiction, disclosed): §2's normative formula and the §4 worked
  // example both use ZONE_VALUE × TOOL_MULT × CROWD_FACTOR — STATE_MULT (§1.2) is
  // NOT applied separately. §4's "30 × 1.6 × 0.7 = 34" confirms this: applying
  // STATE_MULT[armoured]=0.55 would yield 18, not 34. We follow §2/§4 (2 sources
  // vs 1) and record the contradiction in KNOWN_LIMITATIONS.md.
  let dmg = base * toolMultiplier * crowdFactor(share).factor;
  if (state.fatiguedTool && s.tool === state.fatiguedTool) dmg *= FATIGUE_PENALTY;
  if (state.ridges.includes(s.zone)) dmg *= RIDGE_PENALTY;
  return Math.round(dmg); // I3
}

/** Full deterministic resolution of day D. §2. */
export function resolveDay(
  day: number,
  state: BeastState,
  submissions: Submission[],
): DayResolution {
  const agg = aggregate(submissions);
  const n = agg.n;
  const integrity = integrityFor(n);

  const zoneShare: Record<string, number> = {};
  for (const z of ZONES) zoneShare[z] = n > 0 ? (agg.zoneCount[z] ?? 0) / n : 0;

  const results: SubmissionResult[] = submissions.map((s) => {
    const key = comboKey(s.strike);
    const share = n > 0 ? (agg.comboCount[key] ?? 0) / n : 0;
    const cf = crowdFactor(share);
    const damage = damageFor(s.strike, state, share);
    // "read" = effective (tool not the wrong one for the state) AND contrarian (<3%).
    const tm = TOOL_MULT[s.strike.tool][state.zoneState[s.strike.zone] ?? 'exposed'];
    const isRead = cf.label === 'read' && tm >= 1.0;
    return {
      userId: s.userId,
      strike: s.strike,
      damage,
      crowdFactor: cf.factor,
      crowdLabel: cf.label,
      share,
      isRead,
    };
  });

  const totalDamage = results.reduce((a, r) => a + r.damage, 0);
  const outcome: 'SLAIN' | 'ESCAPED' = totalDamage >= integrity ? 'SLAIN' : 'ESCAPED';

  return {
    day,
    n,
    integrity,
    totalDamage,
    outcome,
    results,
    aggregate: agg,
    topTool: topTool(agg),
    zoneShare,
  };
}
