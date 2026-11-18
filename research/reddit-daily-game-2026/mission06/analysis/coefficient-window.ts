/**
 * MISSION 06 — small-N winnability + coefficient window.
 *
 * The crowd-factor bands are fractions of N, so a lone striker only reaches the
 * "read" band when N>33. This creates a SMALL-N HANDICAP in the achievable
 * damage/striker ceiling. This script quantifies it and finds, for each candidate
 * k, the smallest N at which a coordinated crowd can reach k*N, and whether the
 * lazy/casual/random crowds reach it too (the "window").
 *
 * Deterministic; disclosed seeds; model-level only.
 */
import { bestTotal, realisticTotal, lcg, COMBOS, dmgFor, allExposed, N_COMBOS, type CrowdModel } from './lib.ts';

console.log('============================================================');
console.log('MISSION 06 — SMALL-N HANDICAP (achievable ceiling vs N)');
console.log('============================================================');
console.log('    N   c_best   c_top5   c_uniform   c_herd80   c_obvious');
for (const N of [1, 2, 3, 4, 8, 12, 20, 34, 50, 100, 200, 500, 1000]) {
  const f = (m: CrowdModel) => realisticTotal(N, m) / N;
  console.log(`  ${String(N).padStart(4)}   ${(bestTotal(N) / N).toFixed(2).padStart(6)}   ${f('spread-top5').toFixed(2).padStart(6)}   ${f('uniform').toFixed(2).padStart(8)}   ${f('herd80').toFixed(2).padStart(8)}   ${f('obvious').toFixed(2).padStart(8)}`);
}
console.log('  => c_best rises from ~21 (N=1, all in herd band) toward ~34.8 (N>=34).');
console.log('     The band structure penalises tiny crowds: they cannot spread finely.\n');

console.log('============================================================');
console.log('MISSION 06 — COEFFICIENT WINDOW (linear I=kN)');
console.log('============================================================');
console.log('For each k: the smallest N that CAN win (best play) and whether the');
console.log('lazy/casual/random crowds win at large N.\n');
console.log('   k   minN(best win)   herd80@N1000   uniform@N1000   verdict');
for (const k of [22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34]) {
  let minN = -1;
  for (let N = 1; N <= 5000; N++) if (bestTotal(N) >= k * N) { minN = N; break; }
  const herdWins = realisticTotal(1000, 'herd80') >= k * 1000;
  const randWins = realisticTotal(1000, 'uniform') >= k * 1000;
  let verdict = '';
  if (minN < 0) verdict = 'unreachable even with perfect play';
  else if (herdWins) verdict = 'lazy herd auto-wins (too easy)';
  else if (randWins) verdict = 'random auto-wins (participation only)';
  else verdict = 'requires real coordination';
  console.log(`  ${String(k).padStart(2)}   ${String(minN).padStart(11)}   ${herdWins ? 'WIN' : 'fail'}            ${randWins ? 'WIN' : 'fail'}            ${verdict}`);
}
console.log('\nNote: minN<0 means even the exact optimum cannot reach k*N at any N<=5000.');
console.log('=> the k that makes small subs winnable is the same k that lets random win.');
console.log('   This is the residual tension the mission asks us to surface.\n');
console.log('Done.');
