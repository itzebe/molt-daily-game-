/**
 * MISSION 06 — shared analysis library.
 *
 * Imports the FROZEN engine's constants and functions (no modification to
 * mission04/prototype). Provides:
 *   - the combo set and per-state base damage
 *   - `bestTotal(N, state)` : EXACT maximum total damage a perfectly coordinated
 *     crowd of N can deal, via dynamic programming (not a hill-climber).
 *   - `realisticTotal(...)` : total damage under disclosed crowd models.
 *   - `integrity(N)` : the real integrityFor().
 *
 * Everything is deterministic; where randomness is used the seed is disclosed.
 */
import {
  ZONE_VALUE,
  TOOL_MULT,
  ZONES,
  TOOLS,
  type BeastState,
  type Strike,
  type Tool,
  type Zone,
  type ZoneState,
} from '../../mission04/prototype/src/engine/rules.ts';
import { crowdFactor, integrityFor } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';

export type Combo = { zone: Zone; tool: Tool };
export const COMBOS: Combo[] = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
export const COMBO_KEY = (c: Combo) => `${c.zone}:${c.tool}`;
export const N_COMBOS = COMBOS.length; // 15

export const allExposed: BeastState = genesisState(1);

/** base damage = ZONE_VALUE * TOOL_MULT for a combo against a state (pre-crowd). */
export function baseFor(c: Combo, state: BeastState): number {
  return ZONE_VALUE[c.zone] * TOOL_MULT[c.tool][state.zoneState[c.zone] ?? 'exposed'];
}

/** damage for ONE submission, matching the engine's rounding (no fatigue/ridge). */
export function dmgFor(c: Combo, state: BeastState, share: number): number {
  return Math.round(baseFor(c, state) * crowdFactor(share).factor);
}

/**
 * EXACT maximum total damage for N strikers: choose counts c_i >= 0 over the 15
 * combos with sum c_i = N to maximise sum_i c_i * dmgFor(combo_i, share=c_i/N).
 * Solved by DP over combos and player count. O(15 * N^2).
 */
export function bestTotal(N: number, state: BeastState = allExposed): number {
  const M = COMBOS.length;
  // value[i][c] = total for c players all on combo i
  const value = COMBOS.map((c) => {
    const arr = new Array<number>(N + 1).fill(0);
    for (let k = 1; k <= N; k++) arr[k] = k * dmgFor(c, state, k / N);
    return arr;
  });
  // dp over combos
  let dp = new Array<number>(N + 1).fill(-Infinity);
  dp[0] = 0;
  for (let i = 0; i < M; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity);
    for (let used = 0; used <= N; used++) {
      if (dp[used] === -Infinity) continue;
      for (let k = 0; used + k <= N; k++) {
        const v = dp[used] + value[i][k];
        if (v > nd[used + k]) nd[used + k] = v;
      }
    }
    dp = nd;
  }
  return dp[N];
}

/** Integrity from the real engine. */
export const integrity = (N: number) => integrityFor(N);

/** Deterministic LCG (documented) for reproducible crowd simulations. */
export function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0x100000000);
}

export type CrowdModel = 'uniform' | 'herd80' | 'obvious' | 'random-tool' | 'spread-top5' | 'spread-all';

/** Total damage for a crowd model on one day. Returns mean over `trials`. */
export function realisticTotal(
  N: number,
  model: CrowdModel,
  state: BeastState = allExposed,
  seed = 424242,
  trials = 200,
): number {
  const rand = lcg(seed + N);
  const obvious = bestBaseCombo(state);
  // top-5 combos by base damage
  const ranked = COMBOS.map((c, i) => ({ i, b: baseFor(c, state) })).sort((a, b) => b.b - a.b).map((x) => x.i);
  const top5 = ranked.slice(0, 5);
  let sum = 0;
  for (let t = 0; t < trials; t++) {
    const counts = new Array<number>(N_COMBOS).fill(0);
    for (let i = 0; i < N; i++) {
      let idx: number;
      if (model === 'uniform') idx = Math.floor(rand() * N_COMBOS);
      else if (model === 'herd80') idx = rand() < 0.8 ? obvious : Math.floor(rand() * N_COMBOS);
      else if (model === 'obvious') idx = obvious;
      else if (model === 'spread-top5') idx = top5[i % 5];
      else if (model === 'spread-all') idx = i % N_COMBOS;
      else idx = Math.floor(rand() * ZONES.length) * TOOLS.length + Math.floor(rand() * TOOLS.length);
      counts[idx]++;
    }
    let total = 0;
    for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) total += counts[i] * dmgFor(COMBOS[i], state, counts[i] / N);
    sum += total;
  }
  return sum / trials;
}

/** index of the highest-base combo (the "obvious" play). */
export function bestBaseCombo(state: BeastState = allExposed): number {
  let bi = 0, bv = -1;
  for (let i = 0; i < N_COMBOS; i++) { const v = baseFor(COMBOS[i], state); if (v > bv) { bv = v; bi = i; } }
  return bi;
}

export { ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, crowdFactor };
