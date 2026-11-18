/**
 * MISSION 09 — Method-A window per C1×C2 combination + battery validation.
 *
 * Method A: the state evolves under the CURRENT sqrt formula for both bounds. This
 * gives the "static-formula" window, useful as a cross-check. The AUTHORITATIVE
 * k-decision is `k-decision.ts` / `combined-k-decision.ts` (state evolves under each
 * candidate k = Method B).
 *
 * Also validates the battery by reproducing Mission 08's headline (max even-spread
 * ceiling 29.50 at tiny N; smallest defeating integer = 30).
 */
import {
  countsTop5, simulate, ENGINE_RULES, C1_ALT, C2_ALT, BOTH_ALT, integritySqrt,
  genesisState, type RulesConfig,
} from './lib9.ts';
import { IGNORING_RULES, READING_RULES } from './battery.ts';

const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const Ns = [10, 12, 15, 18, 20, 22, 25, 30, 50, 100, 200, 500, 1000, 2000];

console.log('============================================================');
console.log('MISSION 09 — WINDOW (shared battery) + C1xC2 COMBINATIONS');
console.log('============================================================');

// ---- validation: reproduce Mission 08 (engine reading, k-independent ceilings) ----
console.log('\n--- VALIDATION vs MISSION 08 (engine reading, sqrt integrity) ---');
let vMax = 0, vAt = '';
for (const rule of IGNORING_RULES) {
  for (const N of Ns) {
    for (const seed of SEEDS) {
      const r = simulate(N, rule.make(N, seed, ENGINE_RULES), ENGINE_RULES, integritySqrt, 150, seed);
      if (r.steady > vMax) { vMax = r.steady; vAt = `${rule.name}@N=${N}`; }
    }
  }
}
console.log(`  GLOBAL max beast-ignoring steady = ${vMax.toFixed(2)} at ${vAt}`);
console.log(`  Mission 08 reported 29.50 (even-spread). smallest defeating integer = ${Math.floor(vMax) + 1}`);

// ---- per-combination window ----
const configs: [string, RulesConfig][] = [
  ['engine x 1.0', ENGINE_RULES],
  ['engine x 1.6', C2_ALT],
  ['alt(§1.2) x 1.0', C1_ALT],
  ['alt(§1.2) x 1.6', BOTH_ALT],
];

console.log('\n\n--- FEASIBLE WINDOW PER COMBINATION (full battery, 9 seeds, fine N) ---');
const results: Record<string, { maxIgnore: number; at: string; minRead: number; readAt: string }> = {};
for (const [name, cfg] of configs) {
  let maxIgnore = 0, at = '';
  for (const rule of IGNORING_RULES) {
    for (const N of Ns) {
      for (const seed of SEEDS) {
        const r = simulate(N, rule.make(N, seed, cfg), cfg, integritySqrt, 150, seed);
        if (r.steady > maxIgnore) { maxIgnore = r.steady; at = `${rule.name}@N=${N}`; }
      }
    }
  }
  let minRead = Infinity, readAt = '';
  for (const rule of READING_RULES) {
    for (const N of Ns) {
      for (const seed of SEEDS) {
        const r = simulate(N, rule.make(N, seed, cfg), cfg, integritySqrt, 150, seed);
        if (r.steady < minRead) { minRead = r.steady; readAt = `${rule.name}@N=${N}`; }
      }
    }
  }
  results[name] = { maxIgnore, at, minRead, readAt };
  const kmin = Math.ceil(maxIgnore), kmax = Math.floor(minRead);
  const ok = kmin <= kmax;
  console.log(`\n  ${name}`);
  console.log(`    max beast-ignoring = ${maxIgnore.toFixed(2)} (${at})`);
  console.log(`    min beast-reading  = ${minRead.toFixed(2)} (${readAt})`);
  console.log(`    window = [${kmin}, ${kmax}]  ${ok ? '(NON-EMPTY)' : '*** EMPTY: no valid integer k ***'}`);
}

// ---- the smallest integer defeating every ignoring rule, per combination ----
console.log('\n\n--- SMALLEST INTEGER k DEFEATING EVERY IGNORING RULE (per combination) ---');
for (const [name, cfg] of configs) {
  const r = results[name];
  console.log(`  ${name.padEnd(18)} k >= ${Math.ceil(r.maxIgnore)}   (beast-reader clears at ${r.minRead.toFixed(2)})`);
}

console.log('\nDone.');
