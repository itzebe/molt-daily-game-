/**
 * MISSION 06 — mixed-crowd tension analysis.
 *
 * The static-robustness test showed a FULLY spread crowd wins ~100%. Real crowds
 * are mixed. This script measures the SLAIN rate as a function of the fraction p
 * of the crowd that de-herds, for the current and linear formulas, to characterise
 * where the outcome is MARGINAL (tension) vs ROUTINE (solved).
 *
 * Deterministic; disclosed seed; model-level only.
 */
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';
import { COMBOS, baseFor, lcg, N_COMBOS, integrity } from './lib.ts';
import type { Strike } from '../../mission04/prototype/src/engine/rules.ts';

function mixedSeason(N: number, p: number, target: (n: number) => number, days = 100, seed = 13579) {
  const rand = lcg(seed + N + Math.round(p * 100));
  let st = genesisState(1);
  const recent: Array<Record<string, number>> = [];
  let slain = 0;
  for (let d = 1; d <= days; d++) {
    const byBase = COMBOS.map((c, i) => ({ i, b: baseFor(c, st) })).sort((a, b) => b.b - a.b).map((x) => x.i);
    const subs: Array<{ userId: string; strike: Strike }> = [];
    for (let i = 0; i < N; i++) {
      // de-herders spread uniformly; herders pile on the single best combo
      const strike = rand() < p ? COMBOS[byBase[Math.floor(rand() * 5)]] : COMBOS[byBase[0]];
      subs.push({ userId: `u${i}`, strike });
    }
    const res = resolveDay(d, st, subs);
    const out = res.totalDamage >= target(res.n) ? 'SLAIN' : 'ESCAPED';
    if (out === 'SLAIN') slain++;
    recent.push(res.zoneShare);
    st = molt({ nextDay: d + 1, resolution: { ...res, outcome: out } as any, recentZoneShares: recent, previousState: st });
  }
  return slain / days;
}

console.log('============================================================');
console.log('MISSION 06 — MIXED-CROWD TENSION (SLAIN rate vs de-herd fraction p)');
console.log('============================================================');
console.log('Crowd: fraction p de-herds (spreads over top-5), (1-p) piles on the best combo.');
console.log('100 days; seed 13579+N+p*100; model-level only.\n');

for (const [label, target] of [['CURRENT sqrt(1000)', (n: number) => integrity(n)], ['LINEAR k=27', (n: number) => 27 * n]] as const) {
  console.log(`--- target = ${label} ---`);
  console.log(`   p     N=8     N=50    N=200   N=1000`);
  for (const p of [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 1.0]) {
    const row = [8, 50, 200, 1000].map((N) => `${(mixedSeason(N, p, target) * 100).toFixed(0)}%`.padStart(7));
    console.log(`  ${p.toFixed(1)}  ${row.join(' ')}`);
  }
  console.log();
}
console.log('Interpretation: a healthy shared goal shows a TRANSITION as p rises from 0');
console.log('to 1 (a real coordination threshold). A degenerate goal is flat (0% or 100%).');
console.log('\nDone.');
