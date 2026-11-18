/**
 * MISSION 07 — T6 INDEPENDENT REPRODUCTION.
 *
 * Reproduces (or refutes) Mission 06's T6 claim that "blind dispersion performs
 * almost as well as deliberate crowd prediction", using the FROZEN engine.
 *
 * KEY NEW ANALYSIS: Mission 06 measured only the SHARED pool (aggregate damage).
 * MOLT has a SECOND axis — the INDIVIDUAL payoff. This script measures both, and
 * asks the decisive game-theoretic question: is a strategy EXPLOITABLE by a single
 * deviating player? (If yes, it is not a dominant strategy / not an equilibrium.)
 *
 * Categories: [PROOF] exact math, [ENGINE] verified vs frozen engine, [SIM] seeded.
 * Deterministic except where a seed is disclosed.
 */
import {
  COMBOS, N_COMBOS, allExposed, baseOf, dmg, obviousIdx, rankedByBase,
  bestTotalExact, lcg, crowdFactor, integrity, ZONES, TOOL_MULT, type Combo, type BeastState,
} from './lib7.ts';
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

// ---------------------------------------------------------------------------
// Exact aggregate for a fixed COUNT distribution (deterministic, no seed).
// ---------------------------------------------------------------------------
function aggregateOf(counts: number[], state: BeastState, N: number) {
  let total = 0, reads = 0;
  for (let i = 0; i < N_COMBOS; i++) {
    const k = counts[i]; if (k <= 0) continue;
    const share = k / N;
    total += k * dmg(COMBOS[i], state, share);
    const tm = TOOL_MULT[COMBOS[i].tool][state.zoneState[COMBOS[i].zone] ?? 'exposed'];
    if (crowdFactor(share).label === 'read' && tm >= 1.0) reads += k;
  }
  return { total, reads, per: total / N };
}

// ---------------------------------------------------------------------------
// Exact INDIVIDUAL payoff under a FIXED N: a unilateral deviation keeps the
// player set (and N) the same, moving one player from combo a to combo b.
//   current payoff of a player on i : dmg(i, state, counts[i]/N)
//   payoff if they move to j         : dmg(j, state, (counts[j]+1)/N)
// A pure Nash equilibrium: no player on any occupied combo wants to move.  [PROOF]
// ---------------------------------------------------------------------------
function playerPayoffOn(counts: number[], state: BeastState, N: number, i: number) {
  return dmg(COMBOS[i], state, counts[i] / N);
}
function payoffIfJoin(counts: number[], state: BeastState, N: number, j: number) {
  return dmg(COMBOS[j], state, (counts[j] + 1) / N);
}
/** best single-player deviation from a distribution (fixed N). */
function bestDeviation(counts: number[], state: BeastState, N: number) {
  // best payoff available by moving one player (from the worst occupied combo)
  let fromIdx = -1, fromPay = Infinity;
  for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) { const p = playerPayoffOn(counts, state, N, i); if (p < fromPay) { fromPay = p; fromIdx = i; } }
  let toIdx = 0, toPay = -1;
  for (let j = 0; j < N_COMBOS; j++) { const p = payoffIfJoin(counts, state, N, j); if (p > toPay) { toPay = p; toIdx = j; } }
  return { fromIdx, fromPay, toIdx, toPay, combo: COMBOS[toIdx], gain: toPay - fromPay };
}
/** Mean individual payoff of a distribution = aggregate/N (everyone symmetric). */
function meanIndividual(counts: number[], state: BeastState, N: number) { return aggregateOf(counts, state, N).total / N; }
/** True pure-Nash check: no occupied combo's player wants to move. */
function isNash(counts: number[], state: BeastState, N: number): boolean {
  for (let i = 0; i < N_COMBOS; i++) {
    if (counts[i] <= 0) continue;
    const here = playerPayoffOn(counts, state, N, i);
    for (let j = 0; j < N_COMBOS; j++) {
      if (payoffIfJoin(counts, state, N, j) > here + 1e-9) return false;
    }
  }
  return true;
}
/** Exact aggregate damage for an arbitrary count vector (deterministic). */
function aggTotal(counts: number[], state: BeastState, N: number) { return aggregateOf(counts, state, N).total; }

// ---------------------------------------------------------------------------
// Build count distributions for named strategies.
// ---------------------------------------------------------------------------
function countsUniform(N: number): number[] { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[i % N_COMBOS]++; return c; }
function countsHerd(N: number, state: BeastState): number[] { const c = new Array(N_COMBOS).fill(0); c[obviousIdx(state)] = N; return c; }
function countsTop5(N: number, state: BeastState): number[] { const c = new Array(N_COMBOS).fill(0); const r = rankedByBase(state); for (let i = 0; i < N; i++) c[r[i % 5]]++; return c; }
function countsRightTool(N: number, state: BeastState): number[] {
  // each zone gets the best tool; distribute players evenly across zones
  const c = new Array(N_COMBOS).fill(0);
  const perZone = ZONES.map((z) => {
    const best = ['cleave', 'pierce', 'burn'].map((t) => ({ t, v: baseOf({ zone: z, tool: t as any }, state) })).sort((a, b) => b.v - a.v)[0].t;
    return COMBOS.findIndex((x) => x.zone === z && x.tool === best);
  });
  for (let i = 0; i < N; i++) c[perZone[i % 5]]++;
  return c;
}
/** DP-optimal distribution (exact optimum). */
function countsOptimal(N: number, state: BeastState): number[] {
  const M = N_COMBOS;
  const value = COMBOS.map((c) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * dmg(c, state, k / N); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  const parents: number[][] = [];
  for (let i = 0; i < M; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity); const par = new Array<number>(N + 1).fill(0);
    for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) { nd[u + k] = v; par[u + k] = k; } } }
    parents.push(par); dp = nd;
  }
  const c = new Array(N_COMBOS).fill(0); let rem = N;
  for (let i = M - 1; i >= 0; i--) { c[i] = parents[i][rem]; rem -= c[i]; }
  return c;
}
/** "Minority-game equilibrium" — spread so that marginal payoffs equalise. Heuristic. */
function countsEquilibrium(N: number, state: BeastState): number[] {
  // iterative best-response: start uniform, repeatedly move players from the
  // lowest-payoff combo to the highest-payoff combo until no move improves.
  const c = countsUniform(N);
  for (let iter = 0; iter < 4000; iter++) {
    // payoff of each combo (as a marginal player)
    let lo = -1, hi = -1, loV = Infinity, hiV = -Infinity;
    for (let i = 0; i < N_COMBOS; i++) {
      if (c[i] <= 0) continue;
      const p = dmg(COMBOS[i], state, c[i] / N); // payoff of a player currently on i
      if (p < loV) { loV = p; lo = i; }
    }
    for (let i = 0; i < N_COMBOS; i++) {
      const p = dmg(COMBOS[i], state, (c[i] + 1) / N); // payoff if I move here
      if (p > hiV) { hiV = p; hi = i; }
    }
    if (lo < 0 || hiV <= loV + 1e-9) break;
    c[lo]--; c[hi]++;
  }
  return c;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const line = (s = '') => console.log(s);
line('============================================================');
line('MISSION 07 — T6 INDEPENDENT REPRODUCTION');
line('============================================================');
line('Frozen engine; exact computations (no seed). Categories: [PROOF]/[ENGINE].');
line('genesis beast (all exposed). Individual payoff uses the marginal deviator.\n');

const Ns = [8, 20, 50, 100, 250, 500, 1000];
line('--- PART 1: aggregate damage/player by strategy (exact) ---');
line(`  ${'N'.padStart(5)}  ${'herd'.padStart(6)} ${'top5'.padStart(6)} ${'rightTool'.padStart(9)} ${'blindUnif'.padStart(9)} ${'equil'.padStart(6)} ${'optimal'.padStart(8)}`);
const stratNames = ['herd', 'top5', 'rightTool', 'blindUnif', 'equil', 'optimal'] as const;
const table: Record<string, Record<number, number>> = {};
for (const N of Ns) {
  const dists: Record<string, number[]> = {
    herd: countsHerd(N, allExposed),
    top5: countsTop5(N, allExposed),
    rightTool: countsRightTool(N, allExposed),
    blindUnif: countsUniform(N),
    equil: countsEquilibrium(N, allExposed),
    optimal: countsOptimal(N, allExposed),
  };
  const row: Record<string, number> = {};
  for (const s of stratNames) { row[s] = aggregateOf(dists[s], allExposed, N).per; table[s] = table[s] ?? {}; table[s][N] = row[s]; }
  line(`  ${String(N).padStart(5)}  ${row.herd.toFixed(2).padStart(6)} ${row.top5.toFixed(2).padStart(6)} ${row.rightTool.toFixed(2).padStart(9)} ${row.blindUnif.toFixed(2).padStart(9)} ${row.equil.toFixed(2).padStart(6)} ${row.optimal.toFixed(2).padStart(8)}`);
}
line('\n  [ENGINE] cross-check vs Mission 06 numbers (N=1000): herd 21.00, blind 29.08, top5 28.00, optimal 34.66');
line(`  reproduced: herd ${table.herd[1000].toFixed(2)}, blind ${table.blindUnif[1000].toFixed(2)}, top5 ${table.top5[1000].toFixed(2)}, optimal ${table.optimal[1000].toFixed(2)}`);

line('\n--- PART 2: is each strategy a Nash equilibrium? (fixed N; [PROOF]) ---');
line('  mean = crowd mean payoff; best-dev = best single-player move; gain = toPay - fromPay');
line(`  ${'N'.padStart(5)} ${'strategy'.padStart(11)} ${'crowd mean'.padStart(10)} ${'move to'.padStart(10)} ${'best pay'.padStart(9)} ${'gain'.padStart(6)} ${'Nash?'.padStart(6)}`);
for (const N of [100, 1000]) {
  for (const s of stratNames) {
    const counts = s === 'herd' ? countsHerd(N, allExposed) : s === 'top5' ? countsTop5(N, allExposed) : s === 'rightTool' ? countsRightTool(N, allExposed) : s === 'blindUnif' ? countsUniform(N) : s === 'equil' ? countsEquilibrium(N, allExposed) : countsOptimal(N, allExposed);
    const crowdMean = meanIndividual(counts, allExposed, N);
    const dev = bestDeviation(counts, allExposed, N);
    line(`  ${String(N).padStart(5)} ${s.padStart(11)} ${crowdMean.toFixed(2).padStart(10)} ${(dev.combo.zone + ':' + dev.combo.tool).padStart(10)} ${dev.toPay.toFixed(2).padStart(9)} ${dev.gain.toFixed(2).padStart(6)} ${(isNash(counts, allExposed, N) ? 'YES' : 'no').padStart(6)}`);
  }
  line();
}

line('\n--- PART 2b: best-response dynamics — where does self-interested play land? [PROOF/SIM] ---');
line('  Start from a random distribution; repeatedly move one player from the lowest-');
line('  payoff occupied combo to the highest-payoff combo. Report the fixed point.');
line(`  ${'N'.padStart(5)} ${'start seed'.padStart(10)} ${'steps'.padStart(6)} ${'fixed point agg/player'.padStart(21)} ${'reads%'.padStart(7)} ${'Nash?'.padStart(6)}`);
for (const N of [50, 200, 1000]) {
  for (const seed of [11, 29]) {
    const rand = lcg(seed + N);
    const c = new Array(N_COMBOS).fill(0);
    for (let i = 0; i < N; i++) c[Math.floor(rand() * N_COMBOS)]++;
    let steps = 0, moved = true;
    while (moved && steps < 200000) {
      moved = false;
      let fromIdx = -1, fromPay = Infinity;
      for (let i = 0; i < N_COMBOS; i++) if (c[i] > 0) { const p = playerPayoffOn(c, allExposed, N, i); if (p < fromPay) { fromPay = p; fromIdx = i; } }
      let toIdx = 0, toPay = -1;
      for (let j = 0; j < N_COMBOS; j++) { const p = payoffIfJoin(c, allExposed, N, j); if (p > toPay) { toPay = p; toIdx = j; } }
      if (fromIdx >= 0 && toPay > fromPay + 1e-9) { c[fromIdx]--; c[toIdx]++; moved = true; steps++; }
    }
    const agg = aggregateOf(c, allExposed, N);
    line(`  ${String(N).padStart(5)} ${String(seed).padStart(10)} ${String(steps).padStart(6)} ${agg.per.toFixed(2).padStart(21)} ${((agg.reads / N) * 100).toFixed(1).padStart(7)} ${(isNash(c, allExposed, N) ? 'YES' : 'no').padStart(6)}`);
  }
}
line('  => This is the aggregate an all-self-interested population reaches. Compare to');
line('     blindUnif and optimal above. If it lands BELOW optimal, the shared goal is NOT');
line('     maximised by individual best response — a coordination problem, not a solved one.');

line('--- PART 3: the shared goal (SLAIN) under the CURRENT formula and 27N [ENGINE] ---');
line(`  ${'N'.padStart(5)} ${'strategy'.padStart(11)} ${'agg/player'.padStart(10)} ${'I=sqrt'.padStart(9)} ${'I=27N'.padStart(8)} ${'sqrt'.padStart(5)} ${'27N'.padStart(5)}`);
for (const N of Ns) {
  for (const s of ['herd', 'blindUnif', 'optimal'] as const) {
    const counts = s === 'herd' ? countsHerd(N, allExposed) : s === 'blindUnif' ? countsUniform(N) : countsOptimal(N, allExposed);
    const per = aggregateOf(counts, allExposed, N).per;
    const Is = integrity(N), I27 = 27 * N;
    const sqrtWin = per * N >= Is ? 'WIN' : 'esc';
    const win27 = per * N >= I27 ? 'WIN' : 'esc';
    line(`  ${String(N).padStart(5)} ${s.padStart(11)} ${per.toFixed(2).padStart(10)} ${Is.toFixed(0).padStart(9)} ${I27.toFixed(0).padStart(8)} ${sqrtWin.padStart(5)} ${win27.padStart(5)}`);
  }
}
line('\nDone.');
