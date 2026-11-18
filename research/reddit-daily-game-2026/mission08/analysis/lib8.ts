/**
 * MISSION 08 — analysis library.
 *
 * Imports the FROZEN engine (mission04/prototype) READ-ONLY. Nothing here changes
 * the engine. Provides exact damage/aggregate evaluation, the three candidate
 * integrity formulas, state constructors, and the strategy registry.
 *
 * Categories used throughout Mission 08:
 *   [PROOF]  exact arithmetic, no randomness
 *   [ENGINE] verified against the frozen engine's own functions
 *   [SIM]    seeded simulation with a disclosed seed
 */
import {
  ZONE_VALUE, TOOL_MULT, ZONES, TOOLS, CROWD_BANDS,
  INTEGRITY_COEFF, INTEGRITY_CAP,
  type BeastState, type Strike, type Tool, type Zone, type ZoneState,
} from '../../mission04/prototype/src/engine/rules.ts';
import {
  damageFor, crowdFactor, integrityFor, resolveDay, aggregate,
  type DayResolution, type Submission,
} from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

export type Combo = { zone: Zone; tool: Tool };
export const COMBOS: Combo[] = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
export const N_COMBOS = COMBOS.length; // 15
export const COMBO_KEY = (c: Combo) => `${c.zone}:${c.tool}`;
export const allExposed: BeastState = genesisState(1);

// --- the three candidate integrity formulas [PROOF] ---
export const integritySqrt = (n: number) => Math.min(INTEGRITY_COEFF * Math.sqrt(n), INTEGRITY_CAP); // current
export const integrityLinear = (k: number) => (n: number) => k * n;
export const integrityK27 = integrityLinear(27);
export const integrityK30 = integrityLinear(30);

// --- exact damage / aggregate helpers ---
export function baseOf(c: Combo, state: BeastState = allExposed): number {
  return ZONE_VALUE[c.zone] * TOOL_MULT[c.tool][state.zoneState[c.zone] ?? 'exposed'];
}
export const dmg = (c: Combo, state: BeastState, share: number) => damageFor(c, state, share);

/** exact total damage for a count vector. */
export function totalOf(counts: number[], state: BeastState, N: number): number {
  let t = 0;
  for (let i = 0; i < N_COMBOS; i++) {
    const k = counts[i];
    if (k > 0) t += k * damageFor(COMBOS[i], state, k / N);
  }
  return t;
}
export const perOf = (counts: number[], state: BeastState, N: number) => totalOf(counts, state, N) / N;

export function obviousIdx(state: BeastState = allExposed): number {
  let bi = 0, bv = -1;
  for (let i = 0; i < N_COMBOS; i++) { const v = baseOf(COMBOS[i], state); if (v > bv) { bv = v; bi = i; } }
  return bi;
}
export function rankedByBase(state: BeastState = allExposed): number[] {
  return COMBOS.map((c, i) => ({ i, b: baseOf(c, state) })).sort((a, b) => b.b - a.b).map((x) => x.i);
}

/** EXACT maximum total damage for N strikers (DP over the 15 combos) = central coordination ceiling. */
export function bestTotalExact(N: number, state: BeastState = allExposed): number {
  const value = COMBOS.map((c) => {
    const a = new Array<number>(N + 1).fill(0);
    for (let k = 1; k <= N; k++) a[k] = k * damageFor(c, state, k / N);
    return a;
  });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < N_COMBOS; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity);
    for (let u = 0; u <= N; u++) {
      if (dp[u] === -Infinity) continue;
      for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; }
    }
    dp = nd;
  }
  return dp[N];
}
/** the count vector achieving bestTotalExact (one optimum). */
export function bestCountsExact(N: number, state: BeastState = allExposed): number[] {
  const value = COMBOS.map((c) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * damageFor(c, state, k / N); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  const par: number[][] = [];
  for (let i = 0; i < N_COMBOS; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity); const p = new Array<number>(N + 1).fill(0);
    for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) { nd[u + k] = v; p[u + k] = k; } } }
    par.push(p); dp = nd;
  }
  const c = new Array(N_COMBOS).fill(0); let rem = N;
  for (let i = N_COMBOS - 1; i >= 0; i--) { c[i] = par[i][rem]; rem -= c[i]; }
  return c;
}

// --- deterministic LCG ---
export function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0x100000000); }

// --- state constructors ---
export function mkState(map: Partial<Record<Zone, ZoneState>>, extra?: Partial<BeastState>): BeastState {
  const zs = {} as Record<Zone, ZoneState>;
  for (const z of ZONES) zs[z] = map[z] ?? 'exposed';
  return { day: 1, zoneState: zs, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null, ...extra };
}

// --- self-interested equilibrium (iterated best response), as a count vector ---
export function equilCounts(N: number, state: BeastState = allExposed, seed = 7): number[] {
  const rand = lcg(seed + N);
  const c = new Array(N_COMBOS).fill(0);
  for (let i = 0; i < N; i++) c[Math.floor(rand() * N_COMBOS)]++;
  let moved = true, guard = 0;
  while (moved && guard++ < 500000) {
    moved = false;
    let fi = -1, fp = Infinity;
    for (let i = 0; i < N_COMBOS; i++) if (c[i] > 0) { const p = damageFor(COMBOS[i], state, c[i] / N); if (p < fp) { fp = p; fi = i; } }
    let ti = 0, tp = -1;
    for (let j = 0; j < N_COMBOS; j++) { const p = damageFor(COMBOS[j], state, (c[j] + 1) / N); if (p > tp) { tp = p; ti = j; } }
    if (fi >= 0 && tp > fp + 1e-9) { c[fi]--; c[ti]++; moved = true; }
  }
  return c;
}

// --- named count-vector strategies ---
export function countsHerd(N: number, state: BeastState = allExposed): number[] { const c = new Array(N_COMBOS).fill(0); c[obviousIdx(state)] = N; return c; }
export function countsCycle15(N: number): number[] { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[i % N_COMBOS]++; return c; }
export function countsTop5(N: number, state: BeastState = allExposed): number[] { const c = new Array(N_COMBOS).fill(0); const r = rankedByBase(state); for (let i = 0; i < N; i++) c[r[i % 5]]++; return c; }
export function countsRightTool(N: number, state: BeastState = allExposed): number[] {
  const c = new Array(N_COMBOS).fill(0);
  const perZone = ZONES.map((z) => {
    let bt = TOOLS[0], bv = -1;
    for (const t of TOOLS) { const v = baseOf({ zone: z, tool: t }, state); if (v > bv) { bv = v; bt = t; } }
    return COMBOS.findIndex((x) => x.zone === z && x.tool === bt);
  });
  for (let i = 0; i < N; i++) c[perZone[i % 5]]++;
  return c;
}
/** uniform-random expected distribution (deterministic expectation). */
export function countsUniformExpect(N: number): number[] { const c = new Array(N_COMBOS).fill(N / N_COMBOS); return c; }

export { ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, CROWD_BANDS, crowdFactor, resolveDay, aggregate, molt, genesisState, damageFor, integrityFor, INTEGRITY_COEFF, INTEGRITY_CAP };
