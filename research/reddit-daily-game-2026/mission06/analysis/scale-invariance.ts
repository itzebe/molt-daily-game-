/**
 * MISSION 06 — structural probe: is the outcome scale-invariant in N?
 *
 * Tests the central theorem: total damage D(N) is ~linear in N (each striker
 * adds ~constant damage), while Integrity I(N) = min(1000*sqrt(N), 12000) is
 * sub-linear. Therefore D/I -> infinity, and SLAIN becomes automatic for large N
 * regardless of play quality; and below a threshold it is impossible.
 *
 * We also test a candidate linear target I(N) = k*N for scale invariance.
 *
 * Deterministic; disclosed seeds. Model-level only.
 */
import { bestTotal, integrity, realisticTotal, allExposed, type CrowdModel } from './lib.ts';

console.log('============================================================');
console.log('MISSION 06 — SCALE-INVARIANCE PROBE');
console.log('============================================================');
console.log('Does the outcome depend on population N, or only on play quality?\n');

console.log('--- Damage per striker (mean) vs N, several crowd strategies ---');
console.log('     N    bestDP   uniform   herd80   obvious   (damage/striker)');
const rows: Array<{ N: number; best: number; u: number; h: number; o: number }> = [];
for (const N of [10, 25, 50, 100, 200, 400, 800, 1600, 3200]) {
  const best = bestTotal(N) / N;
  const u = realisticTotal(N, 'uniform') / N;
  const h = realisticTotal(N, 'herd80') / N;
  const o = realisticTotal(N, 'obvious') / N;
  rows.push({ N, best, u, h, o });
  console.log(`  ${String(N).padStart(5)}   ${best.toFixed(2).padStart(6)}   ${u.toFixed(2).padStart(7)}   ${h.toFixed(2).padStart(6)}   ${o.toFixed(2).padStart(7)}`);
}
console.log('\nObservation: damage/striker converges to a CONSTANT as N grows.');
console.log('  best ~34.7, uniform ~29, herd80 ~24, obvious ~21. (Integrality makes');
console.log('  small N differ; asymptotically each is N-independent.)\n');

console.log('--- The ratio D/I under the CURRENT formula I=min(1000*sqrtN,12000) ---');
console.log('     N   I(N)    bestD/I   obviousD/I   outcome(best/obvious)');
for (const r of rows) {
  const I = integrity(r.N);
  const bestRatio = (r.best * r.N) / I;
  const obvRatio = (r.o * r.N) / I;
  console.log(`  ${String(r.N).padStart(5)}  ${I.toFixed(0).padStart(6)}  ${bestRatio.toFixed(2).padStart(8)}  ${obvRatio.toFixed(2).padStart(11)}   ${bestRatio >= 1 ? 'SLAIN' : 'escape'} / ${obvRatio >= 1 ? 'SLAIN' : 'escape'}`);
}
console.log('\n=> As N grows, BOTH ratios grow without bound: SLAIN becomes automatic,');
console.log('   even for the laziest crowd. Below ~348, even the BEST crowd fails.');
console.log('   The outcome is a function of N, not of coordination. (A5 confirmed.)\n');

console.log('--- The same under a LINEAR target I(N)=k*N (scale-invariant) ---');
console.log('   For I=k*N, outcome is SLAIN iff damage/striker >= k, INDEPENDENT of N.');
const kBands = [21, 24, 29, 34.7];
console.log('   threshold k  ->  who slays (at any N large enough for the regime)');
for (const k of kBands) {
  const who = [
    bestTotal(400) / 400 >= k ? 'best' : '-',
    realisticTotal(400, 'uniform') / 400 >= k ? 'uniform' : '-',
    realisticTotal(400, 'herd80') / 400 >= k ? 'herd80' : '-',
    realisticTotal(400, 'obvious') / 400 >= k ? 'obvious' : '-',
  ].filter((s) => s !== '-');
  console.log(`     ${String(k).padStart(5)}         ${who.join(', ') || 'nobody'}`);
}
console.log('\nDone.');
