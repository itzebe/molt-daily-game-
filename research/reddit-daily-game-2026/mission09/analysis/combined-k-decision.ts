/**
 * MISSION 09 — combined k-decision across all four C1×C2 combinations.
 *
 * For each combination and candidate k: the state evolves UNDER that k, and we
 * report (a) the max SLAIN% over every beast-ignoring rule and (b) the engaged
 * top5 SLAIN%. A combination is playable iff some integer k has
 * max-ignoring ~0% AND top5 ~100%.
 */
import {
  simulate, integrityLinear, countsTop5, ENGINE_RULES, C1_ALT, C2_ALT, BOTH_ALT,
  type RulesConfig,
} from './lib9.ts';
import { IGNORING_RULES } from './battery.ts';

const SEEDS = [1, 2, 3, 7, 42];
const Ns = [25, 50, 200, 1000];

console.log('============================================================');
console.log('MISSION 09 — COMBINED k-DECISION (state evolves under each k)');
console.log('============================================================');
console.log('cell = maxBeastIgnoringSLAIN% / top5SLAIN%   (over N in {25,50,200,1000}, 5 seeds)\n');

const configs: [string, RulesConfig][] = [
  ['engine x 1.0 (recommended)', ENGINE_RULES],
  ['engine x 1.6 (C2 alt)', C2_ALT],
  ['alt(§1.2) x 1.0 (C1 alt)', C1_ALT],
  ['alt(§1.2) x 1.6 (both alt)', BOTH_ALT],
];

const Ks = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];

for (const [name, cfg] of configs) {
  console.log(`\n########## ${name} ##########`);
  console.log(`  ${'k'.padEnd(4)} ${'maxIgnoreSLAIN%'.padStart(16)} ${'top5SLAIN%(minN)'.padStart(16)}  verdict`);
  for (const k of Ks) {
    let maxIgnore = 0;
    for (const N of Ns) for (const r of IGNORING_RULES) {
      let s = 0, d = 0;
      for (const seed of SEEDS) { const res = simulate(N, (st) => r.make(N, seed, cfg)(st), cfg, integrityLinear(k), 150, seed); s += res.slainDays; d += 150; }
      maxIgnore = Math.max(maxIgnore, 100 * s / d);
    }
    let minTop5 = 100;
    for (const N of Ns) {
      let s = 0, d = 0;
      for (const seed of SEEDS) { const res = simulate(N, (st) => countsTop5(N, st, cfg), cfg, integrityLinear(k), 150, seed); s += res.slainDays; d += 150; }
      minTop5 = Math.min(minTop5, 100 * s / d);
    }
    const closes = maxIgnore < 5, reach = minTop5 > 90;
    const v = closes && reach ? '*** PASS ***' : closes ? 'too hard' : reach ? 'too easy' : 'fail';
    console.log(`  ${String(k).padEnd(4)} ${maxIgnore.toFixed(1).padStart(15)}% ${minTop5.toFixed(1).padStart(15)}%  ${v}`);
  }
}

console.log('\nDone.');
