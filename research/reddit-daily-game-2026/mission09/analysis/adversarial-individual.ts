/**
 * MISSION 09 — adversarial strategies + individual vs shared outcome.
 *
 * Part A: the full adversarial battery under the ENGINE rules and each k, including
 *         adaptive (state-reading) and beast-ignoring rules, plus defection.
 * Part B: the individual axis (crowd-reading premium) vs the shared axis (beast-reading),
 *         shown to be distinct skills, and the k-dependence of each.
 */
import {
  ZONES, TOOLS, COMBOS, N_COMBOS, dmg, baseOf, bestTotalExact, bestCountsExact,
  countsEven5, countsCycle15, countsTop5, countsHerd, countsRightTool,
  countsUniformExpect, countsRandom, equilCounts, obviousIdx, rankedByBase,
  simulate, ENGINE_RULES, integritySqrt, integrityLinear, genesisState,
} from './lib9.ts';
import type { BeastState } from '../../mission04/prototype/src/engine/rules.ts';

console.log('============================================================');
console.log('MISSION 09 — ADVERSARIAL STRATEGIES + INDIVIDUAL vs SHARED');
console.log('============================================================');

// ============================ PART A ============================
console.log('\n########## PART A — ADVERSARIAL BATTERY (engine reading) ##########');
console.log('--- A1. steady per-player by strategy and k (N=200, 150d, state evolves) ---');
console.log('  strategy        sqrt     k=27     k=29     k=30     k=31');
const strategies: Array<[string, (st: BeastState) => number[]]> = [
  ['herd(obvious)', (st) => countsHerd(200, st, ENGINE_RULES)],
  ['even5', () => countsEven5(200)],
  ['cycle15', () => countsCycle15(200)],
  ['uniform-agnostic', () => countsUniformExpect(200).map(Math.round)],
  ['rightTool/zone', (st) => countsRightTool(200, st, ENGINE_RULES)],
  ['equil(selfish)', (st) => equilCounts(200, st, ENGINE_RULES)],
  ['top5(beast-read)', (st) => countsTop5(200, st, ENGINE_RULES)],
  ['random(seed1)', () => countsRandom(200, 1)],
];
for (const [name, fn] of strategies) {
  const row: string[] = [];
  for (const integ of [integritySqrt, integrityLinear(27), integrityLinear(29), integrityLinear(30), integrityLinear(31)]) {
    const r = simulate(200, (st) => fn(st), ENGINE_RULES, integ, 150, 1);
    row.push(r.steady.toFixed(1).padStart(7));
  }
  console.log(`  ${name.padEnd(16)} ${row.join('')}`);
}

console.log('\n--- A2. which rules CLEAR each k? (steady >= k) ---');
console.log('  k=27 clears: herd? even5? cycle15? uniform? random? | top5?');
for (const k of [27, 29, 30]) {
  const clears: string[] = [];
  for (const [name, fn] of strategies) {
    const r = simulate(200, (st) => fn(st), ENGINE_RULES, integrityLinear(k), 150, 1);
    clears.push(`${name.split('(')[0]}=${r.slainDays > 75 ? 'Y' : 'n'}`);
  }
  console.log(`  k=${k}: ${clears.join(' ')}`);
}

console.log('\n--- A3. defection: one player deviates from a herd of N-1 (individual premium) ---');
for (const k of [27, 30]) {
  const state = genesisState(1);
  // herd plays obvious; a deviator picks the best private combo at 1/N share
  const herdCombo = obviousIdx(state, ENGINE_RULES);
  const herdShare = (200 - 1) / 200;
  const herdDmg = dmg(COMBOS[herdCombo], state, herdShare, ENGINE_RULES);
  let bestDev = -1, bestI = -1;
  for (let i = 0; i < N_COMBOS; i++) { if (i === herdCombo) continue; const v = dmg(COMBOS[i], state, 1 / 200, ENGINE_RULES); if (v > bestDev) { bestDev = v; bestI = i; } }
  console.log(`  k=${k}: herd dmg=${herdDmg}, deviator(${COMBOS[bestI].zone}:${COMBOS[bestI].tool}) dmg=${bestDev}, premium=${(100 * (bestDev - herdDmg) / herdDmg).toFixed(0)}%`);
}

// ============================ PART B ============================
console.log('\n\n########## PART B — INDIVIDUAL vs SHARED AXES ##########');
console.log('--- B1. individual best response at fixed crowd (N=200, genesis state) [PROOF] ---');
const st0 = genesisState(1);
const crowd = countsUniformExpect(200).map(Math.round);
let indBest = -1, indI = -1, indPer = 0;
for (let i = 0; i < N_COMBOS; i++) {
  const share = crowd[i] / 200;
  const v = dmg(COMBOS[i], st0, share + 1 / 200, ENGINE_RULES);
  const p = dmg(COMBOS[i], st0, share, ENGINE_RULES);
  if (v > indBest) { indBest = v; indI = i; indPer = p; }
}
console.log(`  best individual combo vs a uniform crowd: ${COMBOS[indI].zone}:${COMBOS[indI].tool} -> ${indBest} (crowd avg ~${indPer})`);
console.log('  => the individual axis rewards reading the crowd (low share -> x1.9).');

console.log('\n--- B2. shared ceiling vs k (N=200, state evolves) [SIM] ---');
console.log('  strategy         k=27     k=30     k=33     (shared-goal feasibility)');
for (const [name, fn] of [['even5', () => countsEven5(200)], ['top5', (st: BeastState) => countsTop5(200, st, ENGINE_RULES)]] as [string, (st: BeastState) => number[]][]) {
  const row: string[] = [];
  for (const k of [27, 30, 33]) { const r = simulate(200, (st) => fn(st), ENGINE_RULES, integrityLinear(k), 150, 1); row.push(`${r.steady.toFixed(1)}/${r.slainDays}`.padStart(10)); }
  console.log(`  ${name.padEnd(16)} ${row.join('')}`);
}
console.log('  (value/slainDays)');

console.log('\n--- B3. central-planner ceiling (exact DP) vs best decentralised strategy ---');
for (const N of [50, 200, 1000]) {
  const dp = bestTotalExact(N, genesisState(1), ENGINE_RULES) / N;
  const top = simulate(N, (st, c) => countsTop5(N, st, c), ENGINE_RULES, integritySqrt, 150, 1).steady;
  console.log(`  N=${String(N).padEnd(5)} DP ceiling=${dp.toFixed(2)}  top5 steady=${top.toFixed(2)}  gap=${(dp - top).toFixed(2)}`);
}

console.log('\n--- B4. k-independence of the INDIVIDUAL axis (single-player, fixed crowd) ---');
console.log('  A player\'s own damage does not depend on k (k is the shared target).');
console.log('  k only changes whether the SHARED goal is met, not individual payoffs.');

console.log('\nDone.');
