/**
 * MISSION 06 — DP allocation structure + decentralized informed strategies.
 *
 * (1) Print the exact DP-optimal count allocation at large N, to understand the
 *     skill the crowd factor rewards.
 * (2) Test DECENTRALIZED "informed" strategies a real crowd could plausibly use
 *     (no central coordination), to find the realistic engaged-crowd ceiling.
 *
 * Deterministic; disclosed seeds; model-level only.
 */
import { bestTotal, dmgFor, baseFor, lcg, COMBOS, allExposed, N_COMBOS } from './lib.ts';

// (1) Recover the DP allocation at N by re-running the DP with parent tracking.
function dpAlloc(N: number): number[] {
  const value = COMBOS.map((c) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * dmgFor(c, allExposed, k / N); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  const parents: number[][] = [];
  for (let i = 0; i < N_COMBOS; i++) {
    const nd = new Array<number>(N + 1).fill(-Infinity); const par = new Array<number>(N + 1).fill(0);
    for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) { nd[u + k] = v; par[u + k] = k; } } }
    parents.push(par); dp = nd;
  }
  // backtrack
  const counts = new Array<number>(N_COMBOS).fill(0); let rem = N;
  for (let i = N_COMBOS - 1; i >= 0; i--) { counts[i] = parents[i][rem]; rem -= counts[i]; }
  return counts;
}

const N = 1000;
const counts = dpAlloc(N);
console.log('============================================================');
console.log('MISSION 06 — DP-OPTIMAL ALLOCATION STRUCTURE');
console.log('============================================================');
console.log(`N=${N}; optimal distribution over combos (genesis/all-exposed):\n`);
console.log('  combo            count   share    base   band(mult)   dmg/striker');
let total = 0;
for (let i = 0; i < N_COMBOS; i++) {
  if (counts[i] === 0) continue;
  const share = counts[i] / N;
  const band = share >= 0.3 ? 'herd(0.7)' : share >= 0.1 ? 'common(1.0)' : share >= 0.03 ? 'lone(1.4)' : 'read(1.9)';
  const per = dmgFor(COMBOS[i], allExposed, share);
  total += counts[i] * per;
  console.log(`  ${(COMBOS[i].zone + ':' + COMBOS[i].tool).padEnd(16)} ${String(counts[i]).padStart(5)}   ${share.toFixed(3)}   ${String(baseFor(COMBOS[i], allExposed)).padStart(4)}   ${band.padEnd(10)}   ${String(per).padStart(6)}`);
}
console.log(`  total=${total}  per-striker=${(total / N).toFixed(2)}`);
console.log('\n=> The optimum concentrates high-value combos in the READ band (<3%) and');
console.log('   parks the rest in the LONE band (3-10%). That is the "read" skill.\n');

// (2) Decentralized informed strategies (each player acts alone).
type Dec = { name: string; pick: (i: number, rand: () => number) => number };
const ranked = COMBOS.map((c, i) => ({ i, b: baseFor(c, allExposed) })).sort((a, b) => b.b - a.b).map((x) => x.i);
const dec: Dec[] = [
  { name: 'blind uniform (15)', pick: (_i, r) => Math.floor(r() * N_COMBOS) },
  { name: 'random zone+tool', pick: (_i, r) => Math.floor(r() * 5) * 3 + Math.floor(r() * 3) },
  { name: 'top-8 uniformly', pick: (_i, r) => ranked[Math.floor(r() * 8)] },
  { name: 'top-10 uniformly', pick: (_i, r) => ranked[Math.floor(r() * 10)] },
  { name: 'right-tool only (5 zones, best tool)', pick: (i) => ranked[i % 5] },
  { name: '2% read on top combos', pick: (i) => ranked[Math.floor(i / Math.max(1, Math.round(0.02 * N)))] ?? ranked[0] },
];
console.log('============================================================');
console.log('MISSION 06 — DECENTRALIZED INFORMED CROWD CEILINGS');
console.log('============================================================');
console.log(`N=${N}; mean of 400 trials; seed disclosed (LCG). Model-level only.\n`);
for (const s of dec) {
  const rand = lcg(1234567 + s.name.length);
  let sum = 0; const trials = 400;
  for (let t = 0; t < trials; t++) {
    const counts2 = new Array<number>(N_COMBOS).fill(0);
    for (let i = 0; i < N; i++) counts2[s.pick(i, rand)]++;
    let tot = 0; for (let i = 0; i < N_COMBOS; i++) if (counts2[i] > 0) tot += counts2[i] * dmgFor(COMBOS[i], allExposed, counts2[i] / N);
    sum += tot;
  }
  console.log(`  ${s.name.padEnd(38)} ${(sum / trials / N).toFixed(2)} dmg/striker`);
}
console.log(`  ${'DP optimum (central coordination)'.padEnd(38)} ${(bestTotal(N) / N).toFixed(2)} dmg/striker`);
console.log('\nDone.');
