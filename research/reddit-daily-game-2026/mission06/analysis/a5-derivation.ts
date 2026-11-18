/**
 * MISSION 06 — A5 mathematical derivation (independent reproduction).
 *
 * Independently reproduces or disproves Mission 05's A5 claim (~348 best-case /
 * ~450-500 realistic SLAIN threshold) using an EXACT dynamic-programming optimum,
 * not a hill-climber.
 *
 * Key structural facts derived analytically (see A5_MATHEMATICAL_DERIVATION.md):
 *   - Integrity(N) = min(1000*sqrt(N), 12000).
 *   - Under the crowd factor, the BEST achievable mean damage per striker is
 *     bounded: splitting N strikers to maximise each combo's band.
 *   - The decisive question: does bestTotal(N) >= Integrity(N)?
 *
 * Output is the SLAIN threshold (smallest N where the best coordinated crowd can
 * reach Integrity) and the realistic thresholds under disclosed crowd models.
 */
import { bestTotal, integrity, realisticTotal, COMBOS, dmgFor, allExposed, N_COMBOS, type CrowdModel } from './lib.ts';

console.log('============================================================');
console.log('MISSION 06 — A5 INDEPENDENT DERIVATION (exact DP optimum)');
console.log('============================================================');
console.log('Integrity(N) = min(1000*sqrt(N), 12000); damage = base*TOOL_MULT*CROWD_FACTOR');
console.log('Best-case = exact max over all count distributions (DP), genesis beast.\n');

// 1) Find the exact best-case threshold by scanning N upward.
let bestThreshold = -1;
for (let N = 1; N <= 3000; N++) {
  if (bestTotal(N) >= integrity(N)) { bestThreshold = N; break; }
}
console.log(`Best-case SLAIN threshold (exact DP): N = ${bestThreshold}`);
console.log(`  at N=${bestThreshold}: bestTotal=${bestTotal(bestThreshold).toFixed(0)}  integrity=${integrity(bestThreshold).toFixed(0)}`);
console.log(`  at N=${bestThreshold - 1}: bestTotal=${bestTotal(bestThreshold - 1).toFixed(0)}  integrity=${integrity(bestThreshold - 1).toFixed(0)}\n`);

// 2) Realistic thresholds under disclosed crowd models.
console.log('Realistic SLAIN threshold by crowd model (mean of 200 trials, seed 424242+N):');
for (const model of ['uniform', 'herd80', 'obvious', 'random-tool'] as CrowdModel[]) {
  let thr = -1;
  for (let N = 1; N <= 3000; N++) {
    if (realisticTotal(N, model) >= integrity(N)) { thr = N; break; }
  }
  console.log(`  ${model.padEnd(12)} threshold N = ${thr}`);
}
console.log();

// 3) The required table from Mission 06 §3.
const levels = [1, 4, 8, 12, 20, 50, 100, 250, 350, 500, 1000];
console.log('Population analysis (genesis beast):');
console.log('    N   Integrity   BestDP   Best/striker   uniform   herd80   obvious');
for (const N of levels) {
  const integ = integrity(N);
  const best = bestTotal(N);
  const u = realisticTotal(N, 'uniform');
  const h = realisticTotal(N, 'herd80');
  const o = realisticTotal(N, 'obvious');
  console.log(
    `  ${String(N).padStart(4)}  ${integ.toFixed(0).padStart(9)}  ${best.toFixed(0).padStart(7)}  ${(best / N).toFixed(2).padStart(12)}  ${u.toFixed(0).padStart(8)}  ${h.toFixed(0).padStart(7)}  ${o.toFixed(0).padStart(7)}` +
    `   SLAIN(best)=${best >= integ ? 'Y' : 'n'}`
  );
}
console.log();

// 4) The optimal per-striker damage decomposition at a large N (where cap binds).
const bigN = 1200;
console.log(`Optimal allocation structure at N=${bigN} (Integrity capped at ${integrity(bigN).toFixed(0)}):`);
// reconstruct by greedy: DP value is enough; show the per-band "best combo" values
const bandShares = [0.30, 0.10, 0.03, 0.0];
console.log('  per-band best achievable damage/striker (genesis, all exposed):');
for (const [i, band] of [0.7, 1.0, 1.4, 1.9].entries()) {
  // pick combo maximising base at that band
  let best = 0, which = '';
  for (const c of COMBOS) { const d = dmgFor(c, allExposed, bandShares[i]); if (d > best) { best = d; which = `${c.zone}:${c.tool}`; } }
  console.log(`    band x${band} (share>=${bandShares[i]}) -> ${which} = ${best}`);
}
console.log();

// 5) Analytic bound: with the cap, Integrity is 12000; the best mean per striker
//    (all on the best single combo, which then sits in the >=0.30 herd band x0.7).
const bestHerdCombo = (() => { let b = 0, w = ''; for (const c of COMBOS) { const d = dmgFor(c, allExposed, 0.5); if (d > b) { b = d; w = `${c.zone}:${c.tool}`; } } return { d: b, w }; })();
console.log('Analytic bound (the decisive mechanism):');
console.log(`  If everyone piles on one combo, it lands in the >=30% "herd" band (x0.7).`);
console.log(`  Best herd combo: ${bestHerdCombo.w} -> ${bestHerdCombo.d} dmg/striker.`);
console.log(`  So a coordinated crowd must SPREAD to reach higher bands, but spreading`);
console.log(`  lowers each combo's count... the optimum balances these.`);
console.log(`  With Integrity capped at 12000, SLAIN needs total>=12000.`);
console.log(`  At ${bestHerdCombo.d} dmg/striker (single-combo herd) that is >= ${Math.ceil(12000 / bestHerdCombo.d)} strikers.`);
console.log('\nDone.');
