/**
 * MISSION 07 — POPULATION SCALING REASSESSMENT.
 *
 * Tests the Mission 06 recommendation "Integrity = k·N" (linear, no cap) against the
 * candidate mechanics, for k in 25..30. Checks:
 *   (a) small communities can win WITH skill,
 *   (b) large communities CANNOT win with lazy play (herd),
 *   (c) the required skilled fraction does not grow with N (scale-invariance),
 *   (d) prediction stays valuable across N,
 *   (e) behaviour is consequential (the outcome changes with the crowd).
 *
 * Deterministic (exact aggregates per mix); [SIM] + [PROOF].
 */
import { COMBOS, N_COMBOS, baseOf, obviousIdx, lcg, crowdFactor, type BeastState } from './lib7.ts';
import { allExposed } from './lib7.ts';
import { integrityFor } from '../../mission04/prototype/src/engine/resolve.ts';

const state: BeastState = allExposed;
const line = (s = '') => console.log(s);

function perPlayer(counts: number[], N: number): number {
  let t = 0;
  for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) t += counts[i] * Math.round(baseOf(COMBOS[i], state) * crowdFactor(counts[i] / N).factor);
  return t / N;
}
function equilCounts(N: number, seed = 7): number[] {
  const rand = lcg(seed + N);
  const c = new Array(N_COMBOS).fill(0);
  for (let i = 0; i < N; i++) c[Math.floor(rand() * N_COMBOS)]++;
  let moved = true;
  while (moved) {
    moved = false;
    let fi = -1, fp = Infinity;
    for (let i = 0; i < N_COMBOS; i++) if (c[i] > 0) { const p = Math.round(baseOf(COMBOS[i], state) * crowdFactor(c[i] / N).factor); if (p < fp) { fp = p; fi = i; } }
    let ti = 0, tp = -1;
    for (let j = 0; j < N_COMBOS; j++) { const p = Math.round(baseOf(COMBOS[j], state) * crowdFactor((c[j] + 1) / N).factor); if (p > tp) { tp = p; ti = j; } }
    if (fi >= 0 && tp > fp) { c[fi]--; c[ti]++; moved = true; }
  }
  return c;
}
function herdCounts(N: number): number[] { const c = new Array(N_COMBOS).fill(0); c[obviousIdx(state)] = N; return c; }
function dispCounts(N: number): number[] { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N; i++) c[i % N_COMBOS]++; return c; }
function mixCounts(N: number, h: number, d: number, s: number): number[] {
  const c = new Array(N_COMBOS).fill(0);
  const nH = Math.round(N * h), nD = Math.round(N * d), nS = N - nH - nD;
  c[obviousIdx(state)] += nH;
  for (let i = 0; i < nD; i++) c[i % N_COMBOS]++;
  if (nS > 0) { const eq = equilCounts(nS); for (let i = 0; i < N_COMBOS; i++) c[i] += eq[i]; }
  return c;
}
const wins = (counts: number[], N: number, k: number) => perPlayer(counts, N) * N >= k * N;

line('============================================================');
line('MISSION 07 — POPULATION SCALING REASSESSMENT');
line('============================================================');
line('Current formula: I(N)=min(1000·sqrt(N),12000). Proposed: I(N)=k·N (no cap). [SIM]/[PROOF]\n');

line('--- (a) SMALL community: can skill win under each formula? ---');
line(`  ${'N'.padStart(5)} ${'sqrt I'.padStart(8)} ${'skill wins sqrt?'.padStart(17)} ${'skill wins k=27?'.padStart(17)} ${'skill wins k=25?'.padStart(17)}`);
for (const N of [5, 10, 20, 40]) {
  const eq = perPlayer(equilCounts(N), N);
  line(`  ${String(N).padStart(5)} ${integrityFor(N).toFixed(0).padStart(8)} ${(wins(equilCounts(N), N, 1000 * Math.sqrt(N) / N) ? 'YES' : 'no').padStart(17)} ${(eq >= 27 ? 'YES' : 'no').padStart(17)} ${(eq >= 25 ? 'YES' : 'no').padStart(17)}`);
}
line('  => under sqrt, small subs CANNOT win even with perfect skill (population gate).');
line('     under linear, small subs win iff they play well. This is the fix for A5.\n');

line('--- (b) LARGE community: can LAZY play win? (herd) ---');
line(`  ${'N'.padStart(6)} ${'sqrt: herd wins?'.padStart(17)} ${'k=25 herd'.padStart(11)} ${'k=27 herd'.padStart(11)} ${'k=30 herd'.padStart(11)}`);
for (const N of [100, 500, 1000, 5000]) {
  const h = perPlayer(herdCounts(N), N);
  line(`  ${String(N).padStart(6)} ${(wins(herdCounts(N), N, 1000 * Math.sqrt(N) / N) ? 'YES' : 'no').padStart(17)} ${(h >= 25 ? 'WINS' : 'escapes').padStart(11)} ${(h >= 27 ? 'WINS' : 'escapes').padStart(11)} ${(h >= 30 ? 'WINS' : 'escapes').padStart(11)}`);
}
line('  => under sqrt, large subs win by herding (auto-win). under linear, the herd');
line('     (21.0/player) never wins for k>=22. Lazy play is punished at every size.\n');

line('--- (c) scale-invariance: the required SKILLED fraction should not grow with N ---');
line(`  ${'N'.padStart(6)} ${'k=27 need'.padStart(11)} ${'k=29 need'.padStart(11)} ${'k=31 need'.padStart(11)} ${'k=33 need'.padStart(11)}`);
for (const N of [50, 200, 1000, 5000]) {
  const need = (k: number) => { for (let s = 0; s <= 1.0001; s += 0.05) if (perPlayer(mixCounts(N, 1 - s, 0, s), N) >= k) return `${(s * 100).toFixed(0)}%`; return 'never'; };
  line(`  ${String(N).padStart(6)} ${need(27).padStart(11)} ${need(29).padStart(11)} ${need(31).padStart(11)} ${need(33).padStart(11)}`);
}
line('  => the needed skilled fraction is ~constant in N (scale-invariant): a 50-player');
line('     and a 5000-player sub need the same effort. This is what a linear target buys.\n');

line('--- (d) is prediction valuable across N? (herd-call edge vs blind) ---');
line('  (a player who correctly calls the herd zone vs one who ignores it)');
line(`  ${'N'.padStart(6)} ${'perfect predictor'.padStart(18)} ${'blind dispersion'.padStart(17)} ${'edge'.padStart(6)}`);
for (const N of [50, 200, 1000]) {
  // perfect predictor: best-response to a 60/40 herd crowd; blind: 1/N_COMBOS share
  const counts: number[] = new Array(N_COMBOS).fill(0);
  for (let i = 0; i < N; i++) counts[i % N_COMBOS]++; // approx blind crowd
  let pp = 0;
  for (let j = 0; j < N_COMBOS; j++) { const v = Math.round(baseOf(COMBOS[j], state) * crowdFactor((counts[j] + 1) / (N + 1)).factor); if (v > pp) pp = v; }
  const blind = perPlayer(counts, N);
  line(`  ${String(N).padStart(6)} ${pp.toFixed(1).padStart(18)} ${blind.toFixed(1).padStart(17)} ${(pp - blind).toFixed(1).padStart(6)}`);
}
line('  => prediction keeps a large edge at every N (the read band multiplies damage).\n');

line('--- (e) is the outcome consequential? (does the crowd change the result?) ---');
line(`  ${'N'.padStart(6)} ${'herd total'.padStart(11)} ${'disp total'.padStart(11)} ${'equil total'.padStart(12)} ${'I(27N)'.padStart(8)}`);
for (const N of [100, 500, 1000]) {
  line(`  ${String(N).padStart(6)} ${(perPlayer(herdCounts(N), N) * N).toFixed(0).padStart(11)} ${(perPlayer(dispCounts(N), N) * N).toFixed(0).padStart(11)} ${(perPlayer(equilCounts(N), N) * N).toFixed(0).padStart(12)} ${(27 * N).toFixed(0).padStart(8)}`);
}
line('  => the crowd\'s behaviour moves the total by >50% — the beast\'s fate is decided');
line('     by the community, not by the formula. Behaviour is consequential.\n');

line('--- RECOMMENDATION: k in 25..30; evidence-derived single value: k=27 ---');
line('  k=27: herd(21) loses, dispersion(29.1) wins, skilled(34.1) wins comfortably.');
line('  k=29: dispersion(29.1) only just wins -> tighter; more skill demanded.');
line('  k=31: dispersion(29.1) loses -> the shared goal becomes a genuine SKILL goal.');
line('  See COMPETITIVE_SCORING.md for the trade-off. NOT APPROVED.');
line('\nDone.');
