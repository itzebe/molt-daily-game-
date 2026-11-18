/**
 * MISSION 07 — analysis library.
 *
 * Imports the FROZEN engine (mission04/prototype) READ-ONLY. Nothing here changes
 * the engine. Provides exact and simulated crowd evaluation, the strategy
 * registry, and helpers used by the Mission 07 experiments.
 *
 * Categories used throughout Mission 07:
 *   [PROOF]  mathematically derived, no simulation
 *   [ENGINE] verified against the frozen engine's own functions
 *   [SIM]    deterministic/stochastic simulation with a disclosed seed
 */
import {
  ZONE_VALUE,
  TOOL_MULT,
  ZONES,
  TOOLS,
  FATIGUE_PENALTY,
  RIDGE_PENALTY,
  type BeastState,
  type Strike,
  type Tool,
  type Zone,
} from '../../mission04/prototype/src/engine/rules.ts';
import {
  damageFor,
  crowdFactor,
  integrityFor,
  resolveDay,
  type DayResolution,
  type Submission,
} from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

export type Combo = { zone: Zone; tool: Tool };
export const COMBOS: Combo[] = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
export const N_COMBOS = COMBOS.length; // 15
export const COMBO_KEY = (c: Combo) => `${c.zone}:${c.tool}`;
export const allExposed: BeastState = genesisState(1);
export const integrity = integrityFor;

/** Pre-crowd base = ZONE_VALUE × TOOL_MULT for the zone's current state. */
export function baseOf(c: Combo, state: BeastState = allExposed): number {
  return ZONE_VALUE[c.zone] * TOOL_MULT[c.tool][state.zoneState[c.zone] ?? 'exposed'];
}

/** Exact damage for one strike (delegates to the frozen engine). */
export const dmg = (c: Combo, state: BeastState, share: number) => damageFor(c, state, share);

/** index of the highest-base combo (the "obvious" play). */
export function obviousIdx(state: BeastState = allExposed): number {
  let bi = 0, bv = -1;
  for (let i = 0; i < N_COMBOS; i++) { const v = baseOf(COMBOS[i], state); if (v > bv) { bv = v; bi = i; } }
  return bi;
}

/** combos ranked by base (desc). */
export function rankedByBase(state: BeastState = allExposed): number[] {
  return COMBOS.map((c, i) => ({ i, b: baseOf(c, state) })).sort((a, b) => b.b - a.b).map((x) => x.i);
}

/** Exact totals (damage + successful reads) for a count vector. */
export function totalsOf(counts: number[], state: BeastState, N: number): { total: number; reads: number } {
  let total = 0, reads = 0;
  for (let i = 0; i < N_COMBOS; i++) {
    const k = counts[i];
    if (k <= 0) continue;
    const share = k / N;
    total += k * damageFor(COMBOS[i], state, share);
    const tm = TOOL_MULT[COMBOS[i].tool][state.zoneState[COMBOS[i].zone] ?? 'exposed'];
    if (crowdFactor(share).label === 'read' && tm >= 1.0) reads += k;
  }
  return { total, reads };
}

/** EXACT maximum total damage for N strikers (DP over the 15 combos). */
export function bestTotalExact(N: number, state: BeastState = allExposed): number {
  const M = N_COMBOS;
  const value = COMBOS.map((c) => {
    const a = new Array<number>(N + 1).fill(0);
    for (let k = 1; k <= N; k++) a[k] = k * damageFor(c, state, k / N);
    return a;
  });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < M; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity);
    for (let u = 0; u <= N; u++) {
      if (dp[u] === -Infinity) continue;
      for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; }
    }
    dp = nd;
  }
  return dp[N];
}

/** EXACT maximum number of successful reads for N strikers (DP). */
export function bestReadsExact(N: number, state: BeastState = allExposed): number {
  // value of putting k strikers on combo i = number of reads among them
  const M = N_COMBOS;
  const value = COMBOS.map((c) => {
    const tm = TOOL_MULT[c.tool][state.zoneState[c.zone] ?? 'exposed'];
    const a = new Array<number>(N + 1).fill(0);
    for (let k = 1; k <= N; k++) a[k] = (crowdFactor(k / N).label === 'read' && tm >= 1.0) ? k : 0;
    return a;
  });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < M; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity);
    for (let u = 0; u <= N; u++) {
      if (dp[u] === -Infinity) continue;
      for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; }
    }
    dp = nd;
  }
  return dp[N];
}

/** Deterministic LCG (disclosed) for reproducible stochastic crowds. */
export function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0x100000000);
}

// ---------------------------------------------------------------------------
// Strategy registry: each strategy maps a player index to a combo for a day.
// ---------------------------------------------------------------------------
export interface DayCtx {
  N: number;
  day: number;
  state: BeastState;
  /** last day's per-combo share (0 if none). */
  prevComboShare: Record<string, number>;
  /** last day's per-zone share (0 if none). */
  prevZoneShare: Record<string, number>;
  rand: () => number;
}
export type Strategy = { name: string; pick: (i: number, ctx: DayCtx) => Combo };

export function submissionsFor(N: number, strat: Strategy, ctx: Omit<DayCtx, 'N' | 'rand'> & { rand?: () => number }): Submission[] {
  const rand = ctx.rand ?? lcg(1);
  const subs: Submission[] = [];
  for (let i = 0; i < N; i++) {
    const c = strat.pick(i, { N, day: ctx.day, state: ctx.state, prevComboShare: ctx.prevComboShare, prevZoneShare: ctx.prevZoneShare, rand });
    subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } });
  }
  return subs;
}

/** run one day through the frozen engine. */
export function dayResolve(N: number, strat: Strategy, state: BeastState, day: number, prevComboShare: Record<string, number>, prevZoneShare: Record<string, number>, seed = 1): DayResolution {
  const subs = submissionsFor(N, strat, { day, state, prevComboShare, prevZoneShare, rand: lcg(seed + N * 131 + day) });
  return resolveDay(day, state, subs);
}

export { ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, FATIGUE_PENALTY, RIDGE_PENALTY, crowdFactor, resolveDay, molt, genesisState, damageFor };
