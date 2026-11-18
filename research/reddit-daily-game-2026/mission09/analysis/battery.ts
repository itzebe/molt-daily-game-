/**
 * MISSION 09 — the shared adversarial battery.
 *
 * A comprehensive, clearly-labelled set of BEAST-IGNORING rules (none reads
 * state.zoneState) and BEAST-READING rules (read the state), used identically by
 * every analysis script so the numbers are comparable.
 *
 * A strategy is a function of the beast state and returns a count vector over the
 * 15 combos summing to N. Rules that "vary daily" hold their own LCG closure and
 * advance once per call (simulate calls the strategy once per day).
 */
import {
  ZONES, TOOLS, COMBOS, N_COMBOS, lcg, obviousIdx, rankedByBase, genesisState,
  countsEven5, countsCycle15, countsHerd, countsRightTool, countsTop5, countsUniformExpect,
  type RulesConfig,
} from './lib9.ts';
import type { BeastState } from '../../mission04/prototype/src/engine/rules.ts';

function fixedAlloc(N: number, w: number[]): number[] {
  const c = new Array(N_COMBOS).fill(0); const tot = w.reduce((a, b) => a + b, 0); let rem = N;
  for (let i = 0; i < N_COMBOS && rem > 0; i++) { const k = Math.min(Math.floor((w[i] / tot) * N), rem); c[i] = k; rem -= k; }
  let i = 0; while (rem > 0) { c[i % N_COMBOS]++; rem--; i++; } return c;
}

// ---- BEAST-IGNORING (no rule below consults state.zoneState) ----
export interface Rule { name: string; ignores: boolean; make: (N: number, seed: number, cfg: RulesConfig) => (st: BeastState) => number[]; }

export const IGNORING_RULES: Rule[] = [
  // even spreads over the 15 combos
  { name: 'cycle15', ignores: true, make: (N) => () => countsCycle15(N) },
  { name: 'zoneMajor15', ignores: true, make: (N) => () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) { const z = ZONES[i % 5]; const t = TOOLS[((i / 5) | 0) % 3]; c[COMBOS.findIndex((x) => x.zone === z && x.tool === t)]++; } return c; } },
  { name: 'toolMajor15', ignores: true, make: (N) => () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) { const z = ZONES[((i / 3) | 0) % 5]; const t = TOOLS[i % 3]; c[COMBOS.findIndex((x) => x.zone === z && x.tool === t)]++; } return c; } },
  // even over 5 zones, one tool
  { name: 'even5-1tool', ignores: true, make: (N) => () => countsEven5(N) },
  { name: 'allCleave5z', ignores: true, make: (N) => () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[COMBOS.findIndex((x) => x.zone === ZONES[i % 5] && x.tool === 'cleave')]++; return c; } },
  { name: 'allPierce5z', ignores: true, make: (N) => () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[COMBOS.findIndex((x) => x.zone === ZONES[i % 5] && x.tool === 'pierce')]++; return c; } },
  { name: 'allBurn5z', ignores: true, make: (N) => () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[COMBOS.findIndex((x) => x.zone === ZONES[i % 5] && x.tool === 'burn')]++; return c; } },
  // fixed allocations (same combos every day)
  { name: 'fixed-uniform', ignores: true, make: (N) => () => countsUniformExpect(N).map(Math.round) },
  { name: 'fixed-crown-heavy', ignores: true, make: (N) => () => fixedAlloc(N, [3, 2, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1]) },
  { name: 'fixed-tail-heavy', ignores: true, make: (N) => () => fixedAlloc(N, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5]) },
  // static-ranked spreads (fixed ranking from genesis, never re-reads state)
  { name: 'staticTop5', ignores: true, make: (N, _s, cfg) => { const R = rankedByBase(genesisState(1), cfg); return () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[R[i % 5]]++; return c; }; } },
  { name: 'staticTop8', ignores: true, make: (N, _s, cfg) => { const R = rankedByBase(genesisState(1), cfg); return () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[R[i % 8]]++; return c; }; } },
  // a FIXED random allocation (one draw, repeated) — degenerate but state-ignoring
  { name: 'fixedRandomAlloc', ignores: true, make: (N, seed) => { const r = lcg(seed + N * 131); const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[Math.floor(r() * N_COMBOS)]++; return () => c.slice(); } },
  // a RE-DRAWN random crowd (varies daily) — realistic
  { name: 'randomDaily', ignores: true, make: (N, seed) => { const r = lcg(seed + N * 131); return () => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[Math.floor(r() * N_COMBOS)]++; return c; }; } },
  // the lazy herd (clicks the biggest-value combo, no state read beyond that)
  { name: 'herdObvious', ignores: true, make: (N) => (st) => countsHerd(N, st, { applyStateMult: false, pierceExposed: 1.0 }) },
];

// ---- BEAST-READING (these consult state.zoneState) ----
// NOTE: `top5-stateRead` is the engaged crowd's strongest rule. `rightToolByState`
// also reads the state but is DELIBERATELY not used as the "reading floor" bound:
// it concentrates each zone on its single best combo, which inflates crowd share and
// depresses its own damage, so it can score below a beast-ignoring spread. It is a
// NEGATIVE control (a state-reading rule that is nonetheless bad), not the floor.
export const READING_RULES: Rule[] = [
  { name: 'top5-stateRead', ignores: false, make: (N) => (st) => countsTop5(N, st, { applyStateMult: false, pierceExposed: 1.0 }) },
  { name: 'top8-stateRead', ignores: false, make: (N) => (st) => { const R = rankedByBase(st, { applyStateMult: false, pierceExposed: 1.0 }); const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[R[i % 8]]++; return c; } },
];
export const NEGATIVE_CONTROLS: Rule[] = [
  { name: 'rightToolByState', ignores: false, make: (N) => (st) => countsRightTool(N, st, { applyStateMult: false, pierceExposed: 1.0 }) },
];
