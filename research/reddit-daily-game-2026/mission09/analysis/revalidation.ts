/**
 * MISSION 09 — dynamic integrity revalidation + robustness.
 *
 * Reproduces Mission 08's headline numbers, then re-derives the feasible window
 * with a wider seed set and finer population grid, tests turnout variation, and
 * locates the failure cliff precisely. Worst-case and typical are reported
 * separately (never averaged).
 */
import {
  countsEven5, countsCycle15, countsTop5, countsHerd, countsRightTool,
  countsUniformExpect, countsRandom, equilCounts, COMBOS, N_COMBOS,
  simulate, ENGINE_RULES, integritySqrt, integrityLinear,
  genesisState, type RulesConfig,
} from './lib9.ts';

const cfg = ENGINE_RULES;
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function fixedAlloc(N: number, w: number[]): number[] {
  const c = new Array(N_COMBOS).fill(0); const tot = w.reduce((a, b) => a + b, 0); let rem = N;
  for (let i = 0; i < N_COMBOS && rem > 0; i++) { const k = Math.min(Math.floor((w[i] / tot) * N), rem); c[i] = k; rem -= k; }
  let i = 0; while (rem > 0) { c[i % N_COMBOS]++; rem--; i++; } return c;
}
const IGNORE: Array<{ name: string; fn: (N: number, seed: number) => number[] }> = [
  { name: 'even5', fn: (N) => countsEven5(N) },
  { name: 'cycle15', fn: (N) => countsCycle15(N) },
  { name: 'uniform-agnostic', fn: (N) => countsUniformExpect(N).map(Math.round) },
  { name: 'fixed-5z-1t', fn: (N) => fixedAlloc(N, [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) },
  { name: 'fixed-3z', fn: (N) => fixedAlloc(N, [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) },
  { name: 'fixed-crown-heavy', fn: (N) => fixedAlloc(N, [3, 2, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1]) },
  { name: 'fixed-uniform-tools', fn: (N) => fixedAlloc(N, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]) },
  { name: 'fixed-tail-heavy', fn: (N) => fixedAlloc(N, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5]) },
  { name: 'random-realised', fn: (N, seed) => countsRandom(N, seed) },
];

console.log('============================================================');
console.log('MISSION 09 — DYNAMIC INTEGRITY REVALIDATION (engine rules)');
console.log('============================================================');

// ---- 0. reproduce Mission 08 headline numbers ----
console.log('\n--- 0. REPRODUCE MISSION 08 HEADLINES (engine reading) ---');
console.log('  Mission 08: even-spread ceiling up to 29.50 (tiny N); k=30 clears 148/150; k=30.5 clears 0/150');
const b25 = simulate(25, () => countsEven5(25), cfg, integritySqrt, 150, 1);
const b22 = simulate(22, () => countsEven5(22), cfg, integritySqrt, 150, 1);
console.log(`  even5 @N=25 steady=${b25.steady.toFixed(2)}  @N=22 steady=${b22.steady.toFixed(2)}`);
for (const k of [30, 30.25, 30.5]) {
  const r = simulate(200, (st, c) => countsTop5(200, st, c), cfg, integrityLinear(k), 150, 1);
  console.log(`  top5 @N=200 k=${k}: slain=${r.slainDays}/150`);
}

// ---- 1. beast-ignoring battery: wide seeds, fine N ----
console.log('\n--- 1. BEAST-IGNORING BATTERY (max steady over 9 seeds), engine reading ---');
const NsFine = [10, 15, 20, 25, 30, 50, 100, 200, 500, 1000, 2000];
let globalMax = 0, globalAt = '', globalSeed = 0;
console.log('  N      ' + IGNORE.map((r) => r.name.slice(0, 8).padStart(9)).join(''));
for (const N of NsFine) {
  const cells: string[] = [];
  for (const rule of IGNORE) {
    let best = 0, bs = 0;
    for (const seed of SEEDS) { const r = simulate(N, () => rule.fn(N, seed), cfg, integritySqrt, 150, seed); if (r.steady > best) { best = r.steady; bs = seed; } }
    cells.push(best.toFixed(1).padStart(9));
    if (best > globalMax) { globalMax = best; globalAt = `${rule.name}@N=${N}`; globalSeed = bs; }
  }
  console.log(`  ${String(N).padEnd(6)} ` + cells.join(''));
}
console.log(`  => GLOBAL MAX beast-ignoring steady = ${globalMax.toFixed(2)} at ${globalAt} (seed ${globalSeed})`);

// ---- 2. beast-reading floor (min over N, 9 seeds) ----
console.log('\n--- 2. BEAST-READING FLOOR (top5, min steady over N and seeds) ---');
let readMin = Infinity, readAt = '';
for (const N of NsFine) { for (const seed of SEEDS) { const r = simulate(N, (st, c) => countsTop5(N, st, c), cfg, integritySqrt, 150, seed); if (r.steady < readMin) { readMin = r.steady; readAt = `N=${N} seed=${seed}`; } } }
console.log(`  min beast-reading steady = ${readMin.toFixed(2)} at ${readAt}`);

// ---- 3. the window, worst-case ----
console.log('\n--- 3. FEASIBLE WINDOW (worst-case over 9 seeds) ---');
console.log(`  lower bound (must exceed) = ${globalMax.toFixed(2)} -> k_min = ${Math.ceil(globalMax)}`);
console.log(`  upper bound (must not exceed) = ${readMin.toFixed(2)} -> k_max = ${Math.floor(readMin)}`);
console.log(`  => window = [${Math.ceil(globalMax)}, ${Math.floor(readMin)}]  (k=30 in window? ${Math.ceil(globalMax) <= 30 && 30 <= Math.floor(readMin)})`);

// ---- 4. cliff location at N=200 (fine k) ----
console.log('\n--- 4. FAILURE CLIFF (top5 beast-reader, N=200, 9 seeds) ---');
for (const k of [29, 29.5, 30, 30.1, 30.2, 30.3, 30.4, 30.5, 31]) {
  let totalSlain = 0; for (const seed of SEEDS) { const r = simulate(200, (st, c) => countsTop5(200, st, c), cfg, integrityLinear(k), 150, seed); totalSlain += r.slainDays; }
  console.log(`  k=${String(k).padEnd(5)} beast-reader slain = ${totalSlain}/${9 * 150} (${(100 * totalSlain / (9 * 150)).toFixed(1)}%)`);
}

// ---- 5. turnout variation (partial participation) ----
console.log('\n--- 5. TURNOUT VARIATION (mixed crowd: 50% top5 + 50% even5), N=200 ---');
for (const k of [28, 29, 30, 31]) {
  const mixed = (N: number) => { const a = countsTop5(N, genesisState(1), cfg); const b = countsEven5(N); const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < N_COMBOS; i++) c[i] = Math.round((a[i] + b[i]) / 2); let rem = N - c.reduce((x, y) => x + y, 0); let j = 0; while (rem > 0) { c[j % N_COMBOS]++; rem--; j++; } return c; };
  const r = simulate(200, () => mixed(200), cfg, integrityLinear(k), 150, 1);
  console.log(`  k=${k}: mixed-crowd steady=${r.steady.toFixed(2)}  slain=${r.slainDays}/150`);
}

// ---- 6. typical vs worst-case summary ----
console.log('\n--- 6. WORST-CASE vs TYPICAL (engine reading) ---');
for (const N of [50, 200, 1000]) {
  const even = simulate(N, () => countsEven5(N), cfg, integritySqrt, 150, 1).steady;
  const rand = SEEDS.map((s) => simulate(N, () => countsRandom(N, s), cfg, integritySqrt, 150, s).steady);
  const randMean = rand.reduce((a, b) => a + b, 0) / rand.length, randMax = Math.max(...rand);
  const top = simulate(N, (st, c) => countsTop5(N, st, c), cfg, integritySqrt, 150, 1).steady;
  console.log(`  N=${String(N).padEnd(5)} even5=${even.toFixed(2)}  random(mean=${randMean.toFixed(2)}, max=${randMax.toFixed(2)})  top5=${top.toFixed(2)}`);
}

console.log('\nDone.');
