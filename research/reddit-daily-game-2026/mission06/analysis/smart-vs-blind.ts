/**
 * MISSION 06 — "smart spread" vs "blind spread" ceilings.
 *
 * The design (§2.4) says the crowd factor must reward reading against the grain
 * "without rewarding blind randomness". At the AGGREGATE level (the shared pool),
 * does a SKILLED spread (spread across high-value combos, in the band-optimal
 * proportions) beat a BLIND spread (uniform over all 15)?
 *
 * If yes, there is a k that separates them -> the shared goal rewards skill, not
 * mere participation. This script measures the ladder to find that k.
 *
 * Deterministic (exact, share-based); no randomness.
 */
import { COMBOS, dmgFor, baseFor, allExposed, N_COMBOS } from './lib.ts';

// exact per-striker damage for a given count-distribution over the 15 combos
function perStriker(counts: number[], N: number): number {
  let tot = 0;
  for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) tot += counts[i] * dmgFor(COMBOS[i], allExposed, counts[i] / N);
  return tot / N;
}

const N = 10000; // deep asymptotic; shares are exact fractions
const ranked = COMBOS.map((c, i) => ({ i, b: baseFor(c, allExposed) })).sort((a, b) => b.b - a.b);
const byBase = ranked.map((x) => x.i);

console.log('============================================================');
console.log('MISSION 06 — SMART vs BLIND SPREAD (aggregate, exact)');
console.log('============================================================');
console.log('Per-striker aggregate damage; no randomness; N=10000 (shares exact).\n');

function show(label: string, counts: number[]) {
  const per = perStriker(counts, N);
  // band summary
  const bands = { herd: 0, common: 0, lone: 0, read: 0 };
  for (let i = 0; i < N_COMBOS; i++) {
    if (!counts[i]) continue;
    const s = counts[i] / N;
    if (s >= 0.3) bands.herd++; else if (s >= 0.1) bands.common++; else if (s >= 0.03) bands.lone++; else bands.read++;
  }
  console.log(`  ${label.padEnd(42)} ${per.toFixed(2)}   [herd:${bands.herd} common:${bands.common} lone:${bands.lone} read:${bands.read}]`);
  return per;
}

const mk = (spec: Array<[number, number]>) => { const c = new Array(N_COMBOS).fill(0); for (const [idx, cnt] of spec) c[idx] = cnt; return c; };

// blind uniform over all 15 (6.67% each -> lone band)
const blind = mk(COMBOS.map((_, i) => [i, Math.round(N / 15)]));
// blind over 5 zones x best tool (20% each -> common band)
const rightTool = mk([0, 1, 2, 3, 4].map((z) => [byBase[z], Math.round(N / 5)]));
// smart: top-10 combos at 10% each (lone band)  (10 combos: 5 zones x 2 best tools)
const smart10 = mk(byBase.slice(0, 10).map((i) => [i, Math.round(N / 10)]));
// smart: top-6 at 16.7% (common band)
const smart6 = mk(byBase.slice(0, 6).map((i) => [i, Math.round(N / 6)]));
// smart: top-4 at 25% (common band)
const smart4 = mk(byBase.slice(0, 4).map((i) => [i, Math.round(N / 4)]));
// the DP optimum at large N: high-value combos in lone band, low-value in read band.
// Reconstruct from the measured DP allocation (N=1000) scaled: 9 combos at ~10%, 5 at ~3%.
const dpApprox = mk([
  ...byBase.slice(0, 9).map((i) => [i, Math.round(N * 0.10)] as [number, number]),
  ...byBase.slice(9, 14).map((i) => [i, Math.round(N * 0.03)] as [number, number]),
]);

show('herd (1 combo, 100%)', mk([[byBase[0], N]]));
show('right-tool only (5 combos, 20%)', rightTool);
show('blind uniform (15 combos, 6.7%)', blind);
show('smart4 (top-4, 25%)', smart4);
show('smart6 (top-6, 16.7%)', smart6);
show('smart10 (top-10, 10%)', smart10);
show('DP-like (9x10% + 5x3%)', dpApprox);

console.log('\n=== LADDER (lazy -> optimal) ===');
const ladder: Array<[string, number]> = [
  ['herd', perStriker(mk([[byBase[0], N]]), N)],
  ['right-tool only', perStriker(rightTool, N)],
  ['blind uniform', perStriker(blind, N)],
  ['smart4', perStriker(smart4, N)],
  ['smart6', perStriker(smart6, N)],
  ['smart10', perStriker(smart10, N)],
  ['DP-like', perStriker(dpApprox, N)],
];
for (const [n, v] of ladder) console.log(`  ${n.padEnd(18)} ${v.toFixed(2)}`);

console.log('\n=== k SEPARATING blind from smart ===');
console.log('  k must be > blind uniform AND <= a realistic smart-spread:');
const cBlind = perStriker(blind, N), cSmart10 = perStriker(smart10, N), cSmart6 = perStriker(smart6, N), cSmart4 = perStriker(smart4, N);
console.log(`  blind=${cBlind.toFixed(2)}  smart4=${cSmart4.toFixed(2)}  smart6=${cSmart6.toFixed(2)}  smart10=${cSmart10.toFixed(2)}`);
console.log(`  => k in (${cBlind.toFixed(2)}, ${cSmart4.toFixed(2)}] separates blind from smart (using smart4 as the`);
console.log(`     weakest "smart" strategy). Integer candidates: 30, 31.`);
console.log('\nDone.');
