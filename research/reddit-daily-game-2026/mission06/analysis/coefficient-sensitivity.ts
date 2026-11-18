/**
 * MISSION 06 — coefficient sensitivity analysis.
 *
 * For each candidate target formula and each population N and each crowd model,
 * report whether the beast is SLAIN, and the "coordination requirement" p_min =
 * the minimum fraction of strikers that must play the anti-herd (spread) strategy
 * for SLAIN to happen.
 *
 * Deterministic; disclosed seeds; model-level only.
 */
import { bestTotal, integrity, realisticTotal, dmgFor, lcg, COMBOS, allExposed, N_COMBOS, type CrowdModel } from './lib.ts';
import { INTEGRITY_CAP } from '../../mission04/prototype/src/engine/rules.ts';

// ---- candidate target formulas -------------------------------------------
type Formula = { name: string; I: (n: number) => number };
const cur = (n: number) => Math.min(1000 * Math.sqrt(n), INTEGRITY_CAP);
const sqrtC = (c: number) => (n: number) => Math.min(c * Math.sqrt(n), INTEGRITY_CAP);
const linK = (k: number) => (n: number) => k * n;
const CANDS: Formula[] = [
  { name: 'A  sqrt 1000 (current)', I: cur },
  { name: 'B1 sqrt 300', I: sqrtC(300) },
  { name: 'B2 sqrt 500', I: sqrtC(500) },
  { name: 'B3 sqrt 700', I: sqrtC(700) },
  { name: 'C1 linear k=22', I: linK(22) },
  { name: 'C2 linear k=25', I: linK(25) },
  { name: 'C3 linear k=27', I: linK(27) },
  { name: 'C4 linear k=29', I: linK(29) },
  { name: 'C5 linear k=32', I: linK(32) },
];

const LEVELS = [1, 4, 8, 12, 20, 50, 100, 250, 350, 500, 1000];
const MODELS: CrowdModel[] = ['obvious', 'herd80', 'uniform', 'spread-top5', 'spread-all'];

/** Total damage for a "spread fraction p" crowd: each striker spreads (uniform
 *  over all 15 combos) with prob p, else plays the obvious combo. Deterministic
 *  mean over `trials`; seed disclosed. */
function spreadTotal(N: number, p: number, seed = 777, trials = 400): number {
  const rand = lcg(seed + N + Math.round(p * 1000));
  // obvious combo = crown:cleave (index 0 in COMBOS)
  const obvious = 0;
  let sum = 0;
  for (let t = 0; t < trials; t++) {
    const counts = new Array<number>(N_COMBOS).fill(0);
    for (let i = 0; i < N; i++) counts[rand() < p ? Math.floor(rand() * N_COMBOS) : obvious]++;
    let total = 0;
    for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) total += counts[i] * dmgFor(COMBOS[i], allExposed, counts[i] / N);
    sum += total;
  }
  return sum / trials;
}

/** p_min = smallest p (grid 0.00..1.00 step 0.02) with spreadTotal >= I(N); -1 if none. */
function pMin(N: number, I: (n: number) => number): number {
  const target = I(N);
  for (let p = 0; p <= 1.0001; p += 0.02) if (spreadTotal(N, p) >= target) return Math.round(p * 100) / 100;
  return -1;
}

console.log('============================================================');
console.log('MISSION 06 — COEFFICIENT SENSITIVITY ANALYSIS');
console.log('============================================================');
console.log('Each cell: S = SLAIN, . = ESCAPED, under a crowd model (genesis beast).');
console.log('Best-case column uses the exact DP optimum (the ceiling of any play).\n');

for (const f of CANDS) {
  console.log(`--- ${f.name} ---`);
  console.log('     N   I(N)   BestDP   obvious  herd80  uniform  spread5  spreadAll');
  for (const N of LEVELS) {
    const I = f.I(N);
    const best = bestTotal(N);
    const cells = MODELS.map((m) => (realisticTotal(N, m) >= I ? 'S' : '.'));
    console.log(
      `  ${String(N).padStart(4)}  ${I.toFixed(0).padStart(6)}  ${(best >= I ? 'S' : '.').padStart(6)}   ` +
      cells.map((c) => c.padStart(6)).join('  '),
    );
  }
  console.log();
}

console.log('============================================================');
console.log('COORDINATION REQUIREMENT p_min (fraction of crowd that must');
console.log('play the anti-herd spread for SLAIN); "-" = impossible even at p=1.');
console.log('============================================================');
for (const f of CANDS) {
  const row = LEVELS.map((N) => {
    const p = pMin(N, f.I);
    return `${N}:${p < 0 ? '-' : p.toFixed(2)}`;
  });
  console.log(`  ${f.name.padEnd(24)} ${row.join('  ')}`);
}
console.log('\nNote: p_min is the *same* under any scale-invariant (linear) formula across');
console.log('N once N>=~34 (the read band becomes reachable); small-N p_min is higher');
console.log('because the crowd factor cannot spread as finely.\n');
console.log('Done.');
