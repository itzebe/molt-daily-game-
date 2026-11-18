/**
 * MISSION 06 — population balance matrix (required N levels).
 *
 * For the CURRENT formula and for the recommended LINEAR formula, reports per
 * population N: is SLAIN possible, the required mean damage/striker, where that
 * sits in the achievable range, and the outcome under several crowd models.
 *
 * Deterministic; disclosed seeds; model-level only.
 */
import { bestTotal, integrity, realisticTotal, dmgFor, lcg, COMBOS, allExposed, N_COMBOS, type CrowdModel } from './lib.ts';
import { INTEGRITY_CAP } from '../../mission04/prototype/src/engine/rules.ts';

const LEVELS = [1, 4, 8, 12, 20, 50, 100, 250, 350, 500, 1000];
const MODELS: CrowdModel[] = ['obvious', 'herd80', 'uniform', 'spread-top5', 'spread-all'];

// asymptotic per-striker ceilings measured by the engine (from scale-invariance)
const cBest = (N: number) => bestTotal(N) / N;

console.log('============================================================');
console.log('MISSION 06 — POPULATION BALANCE MATRIX');
console.log('============================================================');
console.log('CURRENT formula: I(N) = min(1000*sqrt(N), 12000)\n');
console.log('    N   I(N)   req/striker   c_herd   c_best   coord-gap   outcome(obvious..spreadAll)');
for (const N of LEVELS) {
  const I = integrity(N);
  const req = I / N;
  const cH = realisticTotal(N, 'herd80') / N;
  const cB = cBest(N);
  const gap = cB > cH ? (req - cH) / (cB - cH) : NaN;
  const outcomes = MODELS.map((m) => (realisticTotal(N, m) >= I ? 'S' : '.')).join('');
  console.log(`  ${String(N).padStart(4)}  ${I.toFixed(0).padStart(6)}  ${req.toFixed(2).padStart(11)}   ${cH.toFixed(2).padStart(6)}   ${cB.toFixed(2).padStart(6)}   ${(isNaN(gap) ? '-' : gap.toFixed(2)).padStart(9)}   ${outcomes}`);
}
console.log('  outcomes: obvious | herd80 | uniform | spreadTop5 | spreadAll   (S=SLAIN .=ESCAPE)');
console.log('  coord-gap: (req - c_herd)/(c_best - c_herd); <=0 means the herd alone suffices;');
console.log('             >1 means impossible even with optimal play. NaN = no room (c_best<=c_herd).\n');

console.log('--- Recommended LINEAR formula: I(N) = k*N (k=27), NO cap ---');
const k = 27;
console.log('    N   I(N)   req/striker   c_herd   c_best   coord-gap   outcome(obvious..spreadAll)');
for (const N of LEVELS) {
  const I = k * N;
  const req = k;
  const cH = realisticTotal(N, 'herd80') / N;
  const cB = cBest(N);
  const gap = cB > cH ? (req - cH) / (cB - cH) : NaN;
  const outcomes = MODELS.map((m) => (realisticTotal(N, m) >= I ? 'S' : '.')).join('');
  console.log(`  ${String(N).padStart(4)}  ${I.toFixed(0).padStart(6)}  ${req.toFixed(2).padStart(11)}   ${cH.toFixed(2).padStart(6)}   ${cB.toFixed(2).padStart(6)}   ${(isNaN(gap) ? '-' : gap.toFixed(2)).padStart(9)}   ${outcomes}`);
}
console.log('  => req/striker is CONSTANT (27): the bar is the same at every N.\n');

console.log('--- Band-structure ceiling vs N (why small subs have a lower roof) ---');
console.log('    N   c_best   c_herd   c_uniform   highest band reachable');
for (const N of [1, 3, 4, 9, 10, 33, 34, 100, 1000]) {
  const cB = cBest(N);
  const cH = realisticTotal(N, 'herd80') / N;
  const cU = realisticTotal(N, 'uniform') / N;
  const one = 1 / N;
  const band = one < 0.03 ? 'read(1.9)' : one < 0.10 ? 'lone(1.4)' : one < 0.30 ? 'common(1.0)' : 'herd(0.7)';
  console.log(`  ${String(N).padStart(4)}   ${cB.toFixed(2).padStart(6)}   ${cH.toFixed(2).padStart(6)}   ${cU.toFixed(2).padStart(8)}   ${band}`);
}
console.log('  => a lone striker (share 1/N) only reaches the read band when N>33;');
console.log('     at N<=3 every combo is >=30% share, so everyone is in the herd band.');
console.log('\nDone.');
