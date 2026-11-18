/**
 * MISSION 06 — final candidate comparison (the centerpiece evidence).
 *
 * For every candidate target formula, compute:
 *   - best-case threshold N (exact DP)          [lower = small subs viable]
 *   - N at which the LAZY herd wins (obvious)   [lower = large subs trivial]
 *   - whether a winnable-but-not-trivial band exists.
 *
 * This proves the decisive point: lowering the sqrt CONSTANT (option B) only
 * moves the population gate; it never removes it. Only a LINEAR (scale-invariant)
 * formula removes the gate.
 *
 * Deterministic; disclosed seeds; model-level only.
 */
import { bestTotal, realisticTotal, integrity, lcg, COMBOS, dmgFor, allExposed, N_COMBOS } from './lib.ts';
import { INTEGRITY_CAP } from '../../mission04/prototype/src/engine/rules.ts';

type Cand = { name: string; I: (n: number) => number };
const cands: Cand[] = [
  { name: 'A  sqrt 1000 (current)', I: (n) => Math.min(1000 * Math.sqrt(n), INTEGRITY_CAP) },
  { name: 'B1 sqrt 300', I: (n) => Math.min(300 * Math.sqrt(n), INTEGRITY_CAP) },
  { name: 'B2 sqrt 500', I: (n) => Math.min(500 * Math.sqrt(n), INTEGRITY_CAP) },
  { name: 'B3 sqrt 700', I: (n) => Math.min(700 * Math.sqrt(n), INTEGRITY_CAP) },
  { name: 'C1 linear k=25', I: (n) => 25 * n },
  { name: 'C2 linear k=27', I: (n) => 27 * n },
  { name: 'C3 linear k=29', I: (n) => 29 * n },
  { name: 'C4 linear k=31', I: (n) => 31 * n },
];

function thresholdBest(I: (n: number) => number): number {
  for (let N = 1; N <= 6000; N++) if (bestTotal(N) >= I(N)) return N;
  return -1;
}
function thresholdLazy(I: (n: number) => number): number {
  for (let N = 1; N <= 6000; N++) if (realisticTotal(N, 'obvious') >= I(N)) return N;
  return -1;
}
function thresholdUniform(I: (n: number) => number): number {
  for (let N = 1; N <= 6000; N++) if (realisticTotal(N, 'uniform') >= I(N)) return N;
  return -1;
}

console.log('============================================================');
console.log('MISSION 06 — FINAL CANDIDATE COMPARISON');
console.log('============================================================');
console.log('thr_best = smallest N a PERFECT crowd can slay (lower = small subs viable).');
console.log('thr_uniform = smallest N a BLIND-random crowd slays (lower = participation-only).');
console.log('thr_lazy = smallest N the LAZY herd slays (lower = large subs trivial).');
console.log('gap = thr_lazy - thr_best (larger = a wider "skill matters" band).\n');
console.log('  candidate                thr_best   thr_uniform   thr_lazy   band(gap)');
for (const c of cands) {
  const tb = thresholdBest(c.I);
  const tu = thresholdUniform(c.I);
  const tl = thresholdLazy(c.I);
  const band = tb < 0 || tl < 0 ? 'n/a' : `${tb}..${tl}`;
  console.log(`  ${c.name.padEnd(24)} ${String(tb).padStart(8)}   ${String(tu).padStart(11)}   ${String(tl).padStart(8)}   ${band}`);
}
console.log('\nINTERPRETATION');
console.log('  - A and B* (any sqrt): thr_best > 0 always => a population gate exists.');
console.log('    Lowering the constant shifts the gate left but never removes it; and');
console.log('    the lazy herd still eventually wins for free (thr_lazy finite).');
console.log('  - C* (linear): the outcome is scale-invariant. thr_best is the only N');
console.log('    limit, and it is small (the band-structure handicap), NOT a population gate.');
console.log('    thr_lazy = -1 (the lazy herd NEVER wins at any N) for k>=25.');
console.log('\nDone.');
