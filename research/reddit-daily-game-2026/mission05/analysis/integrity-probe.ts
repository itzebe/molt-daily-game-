/**
 * MISSION 05 — Integrity-scaling probe (evidence generator).
 *
 * Adversarial hypothesis H7: "the shared goal is unreachable — the beast can
 * never be SLAIN at a realistic subreddit size, so the SLAIN branch (and its
 * reward) never fires and the ESCAPED penalty always fires."
 *
 * Method: for a range of N, have N synthetic strikers play under two crowd
 * models, resolve the day with the REAL engine, and report the SLAIN rate.
 *   - uniform: each striker picks one of the 15 combos uniformly at random
 *              (maximises spread -> maximises the crowd factor -> the most
 *              favourable case for reaching Integrity).
 *   - herd:    80% pile onto the obvious crown:cleave, 20% random (a realistic
 *              Reddit crowd), on the genesis (all-exposed) beast.
 *
 * Model-level evidence ONLY. Not human data. ANALYSIS ONLY.
 */
import { ZONES, TOOLS, type Strike, type Zone, type Tool } from '../../mission04/prototype/src/engine/rules.ts';
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';

const COMBOS: Strike[] = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
const st = genesisState(1);

function slaInRate(n: number, model: 'uniform' | 'herd', trials = 200, seed = 12345) {
  let rng = seed + n;
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let slain = 0;
  let sumTotal = 0;
  for (let trial = 0; trial < trials; trial++) {
    const subs = [];
    for (let i = 0; i < n; i++) {
      let s: Strike;
      if (model === 'uniform') s = COMBOS[Math.floor(rand() * COMBOS.length)];
      else s = rand() < 0.8 ? { zone: 'crown', tool: 'cleave' } : COMBOS[Math.floor(rand() * COMBOS.length)];
      subs.push({ userId: `u${i}`, strike: s });
    }
    const res = resolveDay(1, st, subs);
    if (res.outcome === 'SLAIN') slain++;
    sumTotal += res.totalDamage;
  }
  const last = resolveDay(1, st, Array.from({ length: n }, (_, i) => ({ userId: `u${i}`, strike: COMBOS[i % COMBOS.length] })));
  return { rate: slain / trials, avgTotal: sumTotal / trials, integrity: last.integrity };
}

console.log('============================================================');
console.log('MISSION 05 — H7: is the shared goal (SLAIN) reachable?');
console.log('============================================================');
console.log('(model-level, NOT human data)\n');

for (const model of ['uniform', 'herd'] as const) {
  console.log(`--- crowd model: ${model} (genesis beast, all zones exposed) ---`);
  console.log('     N     Integrity    avg total dmg    SLAIN rate');
  for (const n of [100, 200, 250, 300, 350, 400, 450, 500, 600, 750, 1000, 2000]) {
    const r = slaInRate(n, model);
    console.log(`  ${String(n).padStart(5)}  ${r.integrity.toFixed(0).padStart(10)}  ${r.avgTotal.toFixed(0).padStart(14)}  ${(r.rate * 100).toFixed(0).padStart(8)}%`);
  }
  console.log();
}

console.log('--- interpretation ---');
console.log('If SLAIN rate is ~0% across realistic N, the SLAIN branch never fires and the');
console.log('ESCAPED penalty always fires: the shared goal is decorative, not a real goal.');
console.log('\nDone.');
