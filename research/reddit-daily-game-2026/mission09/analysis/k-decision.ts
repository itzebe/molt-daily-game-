/**
 * MISSION 09 — DEFINITIVE k-decision sweep.
 *
 * For each candidate k, the beast state EVOLVES UNDER THAT k (the methodologically
 * correct test: the escape penalty depends on the outcome, which depends on k).
 * For every rule we report the steady per-player AND the SLAIN rate.
 *
 * Decision rule:
 *   - a defensible k has EVERY beast-ignoring rule at ~0% SLAIN  (trivial path closed)
 *   - and the engaged beast-reading crowd at ~100% SLAIN        (goal achievable)
 *
 * Run for the ENGINE reading (the recommended C1/C2 resolution).
 */
import {
  simulate, integrityLinear, countsTop5, countsCycle15, countsEven5, countsHerd,
  countsUniformExpect, COMBOS, N_COMBOS, genesisState, ENGINE_RULES, type RulesConfig,
} from './lib9.ts';
import { IGNORING_RULES } from './battery.ts';
import type { BeastState } from '../../mission04/prototype/src/engine/rules.ts';

const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const cfg: RulesConfig = ENGINE_RULES;

console.log('============================================================');
console.log('MISSION 09 — DEFINITIVE k-DECISION SWEEP (engine reading)');
console.log('============================================================');
console.log('state evolves UNDER each k; steady = mean per-player last 20 of 150 days');
console.log('SLAIN% = share of days the shared goal is met (mean over 9 seeds)\n');

function top5Rule(N: number) { return (st: BeastState) => countsTop5(N, st, cfg); }

for (const N of [25, 50, 200, 1000]) {
  console.log(`\n########## N = ${N} ##########`);
  console.log(`  ${'rule'.padEnd(18)} ${'k=27'.padStart(14)} ${'k=28'.padStart(14)} ${'k=29'.padStart(14)} ${'k=30'.padStart(14)} ${'k=31'.padStart(14)}`);
  const rules: Array<[string, (st: BeastState) => number[]]> = [
    ['TOP5 (engaged)', top5Rule(N)],
    ...IGNORING_RULES.map((r) => [r.name, r.make(N, 1, cfg)] as [string, (st: BeastState) => number[]]),
  ];
  for (const [name, fn] of rules) {
    const cells: string[] = [];
    for (const k of [27, 28, 29, 30, 31]) {
      let steadySum = 0, slainSum = 0, days = 0;
      for (const seed of SEEDS) {
        const r = simulate(N, (st) => fn(st), cfg, integrityLinear(k), 150, seed);
        steadySum += r.steady; slainSum += r.slainDays; days += 150;
      }
      const steady = steadySum / SEEDS.length, slainPct = 100 * slainSum / days;
      cells.push(`${steady.toFixed(1)}/${slainPct.toFixed(0)}%`.padStart(14));
    }
    console.log(`  ${name.padEnd(18)} ${cells.join('')}`);
  }
}

// ---- the verdict table: which k closes the trivial path AND keeps the goal reachable ----
console.log('\n\n########## VERDICT TABLE (across N) ##########');
console.log('  k    max SLAIN% over ALL beast-ignoring rules   top5 SLAIN% (min over N)   verdict');
for (const k of [27, 28, 29, 30, 31]) {
  let maxIgnoreSlain = 0, minTop5 = 100;
  for (const N of [25, 50, 200, 1000]) {
    for (const r of IGNORING_RULES) {
      let slainSum = 0, days = 0;
      for (const seed of SEEDS) { const res = simulate(N, (st) => r.make(N, seed, cfg)(st), cfg, integrityLinear(k), 150, seed); slainSum += res.slainDays; days += 150; }
      maxIgnoreSlain = Math.max(maxIgnoreSlain, 100 * slainSum / days);
    }
    let s = 0, d = 0;
    for (const seed of SEEDS) { const res = simulate(N, (st) => countsTop5(N, st, cfg), cfg, integrityLinear(k), 150, seed); s += res.slainDays; d += 150; }
    minTop5 = Math.min(minTop5, 100 * s / d);
  }
  const closesTrivial = maxIgnoreSlain < 5;
  const reachable = minTop5 > 90;
  const verdict = closesTrivial && reachable ? 'PASS' : closesTrivial && !reachable ? 'TOO HARD' : !closesTrivial && reachable ? 'TOO EASY' : 'FAIL';
  console.log(`  ${String(k).padEnd(4)} ${maxIgnoreSlain.toFixed(1).padStart(6)}%${' '.repeat(28)} ${minTop5.toFixed(1).padStart(6)}%${' '.repeat(13)} ${verdict}`);
}

console.log('\nDone.');
