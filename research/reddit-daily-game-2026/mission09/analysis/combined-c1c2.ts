/**
 * MISSION 09 — combined C1 × C2 analysis with the FULL beast-ignoring battery.
 *
 * For each of the four rule combinations (C1 engine/alt × C2 1.0/1.6):
 *   - the 9-rule beast-ignoring battery (max steady = the ceiling a non-reader can reach)
 *   - the beast-reading spread (top5) ceiling
 *   - the feasible k window
 *   - dynamic evolution (state evolves under that combination)
 *   - the failure-cliff location
 *
 * This is the load-bearing analysis for the integrity decision.
 */
import {
  ZONES, COMBOS, N_COMBOS, countsEven5, countsCycle15, countsTop5, countsHerd,
  countsRightTool, countsUniformExpect, countsRandom, equilCounts,
  simulate, ENGINE_RULES, C1_ALT, C2_ALT, BOTH_ALT, integritySqrt, integrityLinear,
  genesisState, type RulesConfig,
} from './lib9.ts';
import type { BeastState } from '../../mission04/prototype/src/engine/rules.ts';

// ---- the 9-rule beast-ignoring battery (fixed rules; never read the state) ----
// rule 0-2: even5 / cycle15 / herd-agnostic (uniform)
// rule 3-8: deterministic fixed allocations (must sum to N)
function fixedAlloc(N: number, weights: number[]): number[] {
  const c = new Array(N_COMBOS).fill(0); const tot = weights.reduce((a, b) => a + b, 0);
  let rem = N;
  for (let i = 0; i < N_COMBOS && rem > 0; i++) { const k = Math.floor((weights[i] / tot) * N); c[i] = Math.min(k, rem); rem -= c[i]; }
  let i = 0; while (rem > 0) { c[i % N_COMBOS]++; rem--; i++; }
  return c;
}
export const BATTERY: Array<{ name: string; fn: (N: number, seed: number) => number[] }> = [
  { name: 'even5', fn: (N) => countsEven5(N) },
  { name: 'cycle15', fn: (N) => countsCycle15(N) },
  { name: 'herd-agnostic', fn: (N) => countsUniformExpect(N).map(Math.round) },
  { name: 'fixed-5z-1t', fn: (N) => fixedAlloc(N, [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) },
  { name: 'fixed-3z', fn: (N) => fixedAlloc(N, [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) },
  { name: 'fixed-crown-heavy', fn: (N) => fixedAlloc(N, [3, 2, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1]) },
  { name: 'fixed-uniform-tools', fn: (N) => fixedAlloc(N, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]) },
  { name: 'fixed-tail-heavy', fn: (N) => fixedAlloc(N, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5]) },
  { name: 'random-realised', fn: (N, seed) => countsRandom(N, seed) },
];

export function batteryMax(cfg: RulesConfig, Ns: number[], seeds = [1, 2, 3], days = 150): { name: string; N: number; steady: number }[] {
  const out: { name: string; N: number; steady: number }[] = [];
  for (const rule of BATTERY) {
    for (const N of Ns) {
      let best = 0;
      for (const seed of seeds) {
        const r = simulate(N, () => rule.fn(N, seed), cfg, integritySqrt, days, seed);
        if (r.steady > best) best = r.steady;
      }
      out.push({ name: rule.name, N, steady: best });
    }
  }
  return out;
}

function readingName(cfg: RulesConfig): string {
  return `C1=${cfg.applyStateMult ? 'alt(§1.2)' : 'engine'} C2=${cfg.pierceExposed === 1.6 ? 'alt(1.6)' : 'engine(1.0)'}`;
}

console.log('============================================================');
console.log('MISSION 09 — COMBINED C1 x C2 ANALYSIS (full battery)');
console.log('============================================================');
const Ns = [50, 200, 1000];
const configs: [string, RulesConfig][] = [
  ['engine x 1.0', ENGINE_RULES],
  ['engine x 1.6', C2_ALT],
  ['alt(§1.2) x 1.0', C1_ALT],
  ['alt(§1.2) x 1.6', BOTH_ALT],
];

for (const [name, cfg] of configs) {
  console.log(`\n########## ${name}  (${readingName(cfg)}) ##########`);
  // battery
  const bat = batteryMax(cfg, Ns);
  let globalMax = 0, globalAt = '';
  for (const b of bat) if (b.steady > globalMax) { globalMax = b.steady; globalAt = `${b.name}@N=${b.N}`; }
  console.log('--- beast-ignoring battery (max steady over 3 seeds) ---');
  const byRule: Record<string, string[]> = {};
  for (const b of bat) { (byRule[b.name] ??= []).push(`${b.N}:${b.steady.toFixed(2)}`); }
  for (const k of Object.keys(byRule)) console.log(`  ${k.padEnd(18)} ${byRule[k].join('  ')}`);
  console.log(`  => GLOBAL MAX beast-ignoring = ${globalMax.toFixed(2)} at ${globalAt}`);

  // beast-reading
  let minRead = Infinity, readAt = '';
  for (const N of Ns) { const r = simulate(N, (st, c) => countsTop5(N, st, c), cfg, integritySqrt, 150, 1); if (r.steady < minRead) { minRead = r.steady; readAt = `N=${N}`; } }
  console.log(`  => min beast-reading (top5) = ${minRead.toFixed(2)} at ${readAt}`);
  console.log(`  => FEASIBLE k window = [${Math.ceil(globalMax)}, ${Math.floor(minRead)}]`);

  // dynamic evolution signature at N=200
  const r = simulate(200, (st, c) => countsTop5(200, st, c), cfg, integritySqrt, 150, 1);
  console.log(`  => dynamic top5 @N=200: steady=${r.steady.toFixed(2)} slain=${r.slainDays}/150`);
}

// ---- failure cliff per combination (k just below/above the beast-reading ceiling) ----
console.log('\n\n########## FAILURE CLIFF PER COMBINATION ##########');
for (const [name, cfg] of configs) {
  console.log(`\n--- ${name} ---`);
  const N = 200;
  for (const k of [26, 27, 28, 29, 30, 31, 32, 33, 34]) {
    const r = simulate(N, (st, c) => countsTop5(N, st, c), cfg, integrityLinear(k), 150, 1);
    console.log(`  k=${k}: beast-reader steady=${r.steady.toFixed(2)}  slain=${r.slainDays}/150`);
  }
}

console.log('\nDone.');
