/**
 * MISSION 09 — parametric analysis library.
 *
 * Imports the FROZEN engine (mission04/prototype) READ-ONLY. Nothing here changes
 * the engine. This library makes the two contested rule readings explicit and
 * parameterisable so they can be tested in isolation and in combination:
 *
 *   C1 (STATE_MULT):  applyStateMult = false (engine/§2/§4)  |  true (§1.2)
 *   C2 (pierce/exposed): pierceExposed = 1.0 (engine/§1.3/§4) | 1.6 (design §2.2)
 *   Integrity: sqrt (engine) | linear k
 *
 * State transitions REUSE the engine's `molt` verbatim (only the resolution's
 * outcome/zoneShare/topTool feed it), so the molt logic is provably identical.
 *
 * Categories:
 *   [PROOF]  exact arithmetic, no randomness
 *   [ENGINE] verified against the frozen engine's own functions
 *   [SIM]    seeded simulation with a disclosed seed
 */
import {
  ZONE_VALUE, STATE_MULT, TOOL_MULT, ZONES, TOOLS, CROWD_BANDS,
  MAW, RIDGE_PENALTY, FATIGUE_PENALTY, OVERUSE_THRESHOLD, NEGLECT_THRESHOLD,
  RIDGE_THRESHOLD, MUTATION_STDDEV, INTEGRITY_COEFF, INTEGRITY_CAP,
  type BeastState, type Strike, type Tool, type Zone, type ZoneState,
} from '../../mission04/prototype/src/engine/rules.ts';
import { crowdFactor, aggregate, topTool, type DayAggregate } from '../../mission04/prototype/src/engine/resolve.ts';
import { molt, genesisState } from '../../mission04/prototype/src/engine/molt.ts';

export type Combo = { zone: Zone; tool: Tool };
export const COMBOS: Combo[] = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
export const N_COMBOS = COMBOS.length; // 15
export const COMBO_KEY = (c: Combo) => `${c.zone}:${c.tool}`;

// ---------------------------------------------------------------- rules config
export interface RulesConfig {
  /** C1: apply STATE_MULT (§1.2) as a separate factor. false = engine/§2/§4. */
  applyStateMult: boolean;
  /** C2: pierce-vs-exposed multiplier. 1.0 = engine/§1.3/§4; 1.6 = design §2.2. */
  pierceExposed: number;
}
export const ENGINE_RULES: RulesConfig = { applyStateMult: false, pierceExposed: 1.0 };
export const C1_ALT: RulesConfig = { applyStateMult: true, pierceExposed: 1.0 };
export const C2_ALT: RulesConfig = { applyStateMult: false, pierceExposed: 1.6 };
export const BOTH_ALT: RulesConfig = { applyStateMult: true, pierceExposed: 1.6 };

// ---------------------------------------------------------------- integrity
export type IntegrityFn = (n: number) => number;
export const integritySqrt: IntegrityFn = (n) => Math.min(INTEGRITY_COEFF * Math.sqrt(n), INTEGRITY_CAP); // current [ENGINE]
export const integrityLinear = (k: number): IntegrityFn => (n) => k * n;
export const integrityK27 = integrityLinear(27);
export const integrityK29 = integrityLinear(29);
export const integrityK30 = integrityLinear(30);

// ---------------------------------------------------------------- damage [PARAM]
export function toolMult9(tool: Tool, state: ZoneState, cfg: RulesConfig): number {
  if (tool === 'pierce' && state === 'exposed') return cfg.pierceExposed;
  return TOOL_MULT[tool][state];
}
export function stateMult9(state: ZoneState, cfg: RulesConfig): number {
  return cfg.applyStateMult ? STATE_MULT[state] : 1.0;
}
export function baseOf(c: Combo, state: BeastState = genesisState(1), cfg: RulesConfig = ENGINE_RULES): number {
  const zs = state.zoneState[c.zone] ?? 'exposed';
  const base = c.zone === ('maw' as Zone) ? MAW.value : ZONE_VALUE[c.zone];
  return base * stateMult9(zs, cfg) * toolMult9(c.tool, zs, cfg);
}
export function dmg(c: Combo, state: BeastState, share: number, cfg: RulesConfig = ENGINE_RULES): number {
  const zs = state.zoneState[c.zone] ?? 'exposed';
  const base = c.zone === ('maw' as Zone) ? MAW.value : ZONE_VALUE[c.zone];
  let v = base * stateMult9(zs, cfg) * toolMult9(c.tool, zs, cfg) * crowdFactor(share).factor;
  if (state.fatiguedTool && c.tool === state.fatiguedTool) v *= FATIGUE_PENALTY;
  if (state.ridges.includes(c.zone)) v *= RIDGE_PENALTY;
  return Math.round(v);
}

// ---------------------------------------------------------------- day resolution [PARAM]
export interface Submission { userId: string; strike: Strike; }
export interface DayResult {
  day: number; n: number; integrity: number; totalDamage: number;
  outcome: 'SLAIN' | 'ESCAPED';
  aggregate: DayAggregate;
  zoneShare: Record<string, number>;
  topTool: Tool | null;
  perPlayer: number;
}

/** Resolve one day parametrically. Mirrors resolve.ts:resolveDay but with cfg + integrity fn. */
export function resolveDay9(
  day: number, state: BeastState, submissions: Submission[],
  cfg: RulesConfig = ENGINE_RULES, integrity: IntegrityFn = integritySqrt,
): DayResult {
  const agg = aggregate(submissions);
  const n = agg.n;
  const zoneShare: Record<string, number> = {};
  for (const z of ZONES) zoneShare[z] = n > 0 ? (agg.zoneCount[z] ?? 0) / n : 0;
  let totalDamage = 0;
  for (const s of submissions) {
    const share = n > 0 ? (agg.comboCount[COMBO_KEY(s.strike)] ?? 0) / n : 0;
    totalDamage += dmg(s.strike, state, share, cfg);
  }
  const target = integrity(n);
  const outcome: 'SLAIN' | 'ESCAPED' = totalDamage >= target ? 'SLAIN' : 'ESCAPED';
  return { day, n, integrity: target, totalDamage, outcome, aggregate: agg, zoneShare, topTool: topTool(agg), perPlayer: n > 0 ? totalDamage / n : 0 };
}

// ---------------------------------------------------------------- count vectors → submissions
export function countsToSubmissions(counts: number[]): Submission[] {
  const subs: Submission[] = [];
  for (let i = 0; i < N_COMBOS; i++) {
    for (let k = 0; k < counts[i]; k++) subs.push({ userId: `u${subs.length}`, strike: COMBOS[i] });
  }
  return subs;
}
export function totalOf(counts: number[], state: BeastState, N: number, cfg: RulesConfig = ENGINE_RULES): number {
  let t = 0;
  for (let i = 0; i < N_COMBOS; i++) { const k = counts[i]; if (k > 0) t += k * dmg(COMBOS[i], state, k / N, cfg); }
  return t;
}
export const perOf = (counts: number[], state: BeastState, N: number, cfg = ENGINE_RULES) => totalOf(counts, state, N, cfg) / N;

// ---------------------------------------------------------------- exact DP ceiling [PROOF]
export function bestTotalExact(N: number, state: BeastState = genesisState(1), cfg: RulesConfig = ENGINE_RULES): number {
  const value = COMBOS.map((c) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * dmg(c, state, k / N, cfg); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < N_COMBOS; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity);
    for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; } }
    dp = nd;
  }
  return dp[N];
}
export function bestCountsExact(N: number, state: BeastState = genesisState(1), cfg: RulesConfig = ENGINE_RULES): number[] {
  const value = COMBOS.map((c) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * dmg(c, state, k / N, cfg); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0; const par: number[][] = [];
  for (let i = 0; i < N_COMBOS; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity); const p = new Array<number>(N + 1).fill(0);
    for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) { nd[u + k] = v; p[u + k] = k; } } }
    par.push(p); dp = nd;
  }
  const c = new Array(N_COMBOS).fill(0); let rem = N;
  for (let i = N_COMBOS - 1; i >= 0; i--) { c[i] = par[i][rem]; rem -= c[i]; }
  return c;
}

// ---------------------------------------------------------------- deterministic LCG
export function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0x100000000); }

// ---------------------------------------------------------------- ranking / obvious
export function obviousIdx(state: BeastState = genesisState(1), cfg: RulesConfig = ENGINE_RULES): number {
  let bi = 0, bv = -1;
  for (let i = 0; i < N_COMBOS; i++) { const v = baseOf(COMBOS[i], state, cfg); if (v > bv) { bv = v; bi = i; } }
  return bi;
}
export function rankedByBase(state: BeastState = genesisState(1), cfg: RulesConfig = ENGINE_RULES): number[] {
  return COMBOS.map((c, i) => ({ i, b: baseOf(c, state, cfg) })).sort((a, b) => b.b - a.b).map((x) => x.i);
}

// ---------------------------------------------------------------- named strategies (count vectors)
export function countsHerd(N: number, state = genesisState(1), cfg = ENGINE_RULES): number[] { const c = new Array(N_COMBOS).fill(0); c[obviousIdx(state, cfg)] = N; return c; }
export function countsCycle15(N: number): number[] { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[i % N_COMBOS]++; return c; }
export function countsEven5(N: number): number[] { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[i % 5]++; return c; } // one combo per zone, cycling
export function countsTop5(N: number, state = genesisState(1), cfg = ENGINE_RULES): number[] { const c = new Array(N_COMBOS).fill(0); const r = rankedByBase(state, cfg); for (let i = 0; i < N; i++) c[r[i % 5]]++; return c; }
export function countsRightTool(N: number, state = genesisState(1), cfg = ENGINE_RULES): number[] {
  const c = new Array(N_COMBOS).fill(0);
  const perZone = ZONES.map((z) => { let bt: Tool = TOOLS[0], bv = -1; for (const t of TOOLS) { const v = baseOf({ zone: z, tool: t }, state, cfg); if (v > bv) { bv = v; bt = t; } } return COMBOS.findIndex((x) => x.zone === z && x.tool === bt); });
  for (let i = 0; i < N; i++) c[perZone[i % 5]]++;
  return c;
}
export function countsUniformExpect(N: number): number[] { return new Array(N_COMBOS).fill(N / N_COMBOS); }
/** random count vector from a seeded LCG (realised, integer). */
export function countsRandom(N: number, seed: number): number[] { const rand = lcg(seed); const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[Math.floor(rand() * N_COMBOS)]++; return c; }
/** self-interested iterated-best-response equilibrium (uses cfg damage). */
export function equilCounts(N: number, state = genesisState(1), cfg = ENGINE_RULES, seed = 7): number[] {
  const rand = lcg(seed + N); const c = new Array(N_COMBOS).fill(0);
  for (let i = 0; i < N; i++) c[Math.floor(rand() * N_COMBOS)]++;
  let moved = true, guard = 0;
  while (moved && guard++ < 500000) {
    moved = false;
    let fi = -1, fp = Infinity;
    for (let i = 0; i < N_COMBOS; i++) if (c[i] > 0) { const p = dmg(COMBOS[i], state, c[i] / N, cfg); if (p < fp) { fp = p; fi = i; } }
    let ti = 0, tp = -1;
    for (let j = 0; j < N_COMBOS; j++) { const p = dmg(COMBOS[j], state, (c[j] + 1) / N, cfg); if (p > tp) { tp = p; ti = j; } }
    if (fi >= 0 && tp > fp + 1e-9) { c[fi]--; c[ti]++; moved = true; }
  }
  return c;
}

// ---------------------------------------------------------------- dynamic simulation [SIM]
export type StrategyFn = (state: BeastState, cfg: RulesConfig) => number[];
export interface DynResult { steady: number; slainDays: number; days: number; states: string[]; }

/**
 * Simulate `days` days with the state EVOLVING (molt reuses the engine verbatim).
 * `steady` = mean per-player damage over the last `tail` days.
 */
export function simulate(
  N: number, strat: StrategyFn, cfg: RulesConfig, integrity: IntegrityFn,
  days = 150, seed = 1, tail = 20,
): DynResult {
  let state = genesisState(1);
  let total = 0, slain = 0; const recent: number[] = []; const states: string[] = [];
  const sharesHist: Array<Record<string, number>> = [];
  for (let d = 1; d <= days; d++) {
    const counts = strat(state, cfg);
    const subs = countsToSubmissions(counts);
    const res = resolveDay9(d, state, subs, cfg, integrity);
    if (res.outcome === 'SLAIN') slain++;
    recent.push(res.perPlayer);
    if (recent.length > tail) recent.shift();
    sharesHist.push(res.zoneShare);
    if (d > days - 12) states.push(ZONES.map((z) => (state.zoneState[z] ?? 'exposed')[0]).join('')); // e.g. "aeaea"
    state = molt({ nextDay: d + 1, resolution: res as any, recentZoneShares: sharesHist, previousState: state });
  }
  total = recent.reduce((a, b) => a + b, 0) / recent.length;
  return { steady: total, slainDays: slain, days, states };
}

export { ZONES, TOOLS, ZONE_VALUE, STATE_MULT, TOOL_MULT, CROWD_BANDS, crowdFactor, molt, genesisState, INTEGRITY_COEFF, INTEGRITY_CAP };
