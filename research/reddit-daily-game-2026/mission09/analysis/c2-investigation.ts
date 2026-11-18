/**
 * MISSION 09 — C2 (pierce vs exposed) full investigation.
 *
 * Reconstructs both multipliers, shows where the multiplier enters, prints the
 * exact damage table, measures the effect on the ceiling and on tool incentives,
 * and derives the k each reading implies.
 */
import {
  ZONES, TOOLS, COMBOS, N_COMBOS, dmg, baseOf, bestTotalExact, bestCountsExact,
  countsEven5, countsTop5, countsHerd, countsRightTool, countsCycle15,
  simulate, ENGINE_RULES, C2_ALT, integritySqrt,
  genesisState, type RulesConfig,
} from './lib9.ts';
import type { BeastState, Zone, ZoneState } from '../../mission04/prototype/src/engine/rules.ts';

console.log('============================================================');
console.log('MISSION 09 — C2 (PIERCE vs EXPOSED) INVESTIGATION');
console.log('============================================================');
console.log('Spec §1.3 / §4 / engine:  TOOL_MULT.pierce.exposed = 1.0  (neutral)');
console.log('Design §2.2 prose:        pierce "strong vs exposed"     = 1.6');
console.log('The ONLY disagreement is pierce-vs-exposed; every other cell agrees.');
console.log('');

// ---- 1. exact damage where the readings differ ----
console.log('--- 1. DAMAGE ON AN EXPOSED ZONE, pierce, share<3% (x1.9) [PROOF] ---');
const exp: BeastState = { day: 1, zoneState: { crown: 'exposed', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'exposed' }, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
for (const zone of ZONES) {
  const a = dmg({ zone, tool: 'pierce' }, exp, 0.02, ENGINE_RULES);
  const b = dmg({ zone, tool: 'pierce' }, exp, 0.02, C2_ALT);
  console.log(`  ${zone.padEnd(6)} pierce/exposed:  1.0 -> ${String(a).padStart(3)}   |   1.6 -> ${String(b).padStart(3)}   (diff +${b - a})`);
}

// ---- 2. tool incentive on an exposed zone: which tool is best? ----
console.log('\n--- 2. TOOL INCENTIVE ON AN EXPOSED ZONE (base value x crowd 1.9) [PROOF] ---');
console.log('  zone    cleave   pierce(1.0)  pierce(1.6)  burn     best under 1.0 / 1.6');
for (const zone of ZONES) {
  const cl = dmg({ zone, tool: 'cleave' }, exp, 0.02, ENGINE_RULES);
  const p1 = dmg({ zone, tool: 'pierce' }, exp, 0.02, ENGINE_RULES);
  const p6 = dmg({ zone, tool: 'pierce' }, exp, 0.02, C2_ALT);
  const bu = dmg({ zone, tool: 'burn' }, exp, 0.02, ENGINE_RULES);
  const best1 = cl >= p1 && cl >= bu ? 'cleave' : p1 >= bu ? 'pierce' : 'burn';
  const best6 = p6 > cl && p6 >= bu ? 'pierce' : cl >= bu ? 'cleave' : 'burn';
  console.log(`  ${zone.padEnd(6)}  ${String(cl).padStart(5)}    ${String(p1).padStart(6)}      ${String(p6).padStart(6)}    ${String(bu).padStart(5)}    ${best1} / ${best6}`);
}
console.log('  Note: under 1.0 pierce ties cleave on exposed (both 1.0); under 1.6 pierce becomes the sole best.');

// ---- 3. effect on the achievable ceiling (exact DP) ----
console.log('\n--- 3. ACHIEVABLE CEILING (exact DP, genesis all-exposed) [PROOF] ---');
console.log('  N       engine(1.0)   design(1.6)   ratio');
for (const N of [100, 500, 2000]) {
  const A = bestTotalExact(N, genesisState(1), ENGINE_RULES) / N;
  const B = bestTotalExact(N, genesisState(1), C2_ALT) / N;
  console.log(`  ${String(N).padEnd(6)}  ${A.toFixed(2).padStart(9)}   ${B.toFixed(2).padStart(9)}   ${(B / A).toFixed(4)}`);
}

// ---- 4. which combo does the DP pick at genesis, under each reading? ----
console.log('\n--- 4. DP-OPTIMAL ALLOCATION AT GENESIS (N=200, top combos) [PROOF] ---');
for (const [name, cfg] of [['engine(1.0)', ENGINE_RULES], ['design(1.6)', C2_ALT]] as [string, RulesConfig][]) {
  const c = bestCountsExact(200, genesisState(1), cfg);
  const top = c.map((k, i) => ({ k, combo: COMBOS[i] })).filter((x) => x.k > 0).sort((a, b) => b.k - a.k).slice(0, 6);
  console.log(`  ${name}: ` + top.map((x) => `${x.combo.zone}:${x.combo.tool}=${x.k}`).join(' '));
}

// ---- 5. dynamic ceilings [SIM] ----
console.log('\n--- 5. DYNAMIC CEILINGS (150 days, mean last 20) [SIM] ---');
console.log('  strategy        N=50     N=200    N=1000');
for (const [sn, fn] of [
  ['even5', (N: number, st: BeastState, cfg: RulesConfig) => countsEven5(N)],
  ['cycle15', (N: number) => countsCycle15(N)],
  ['herd', (N: number, st: BeastState, cfg: RulesConfig) => countsHerd(N, st, cfg)],
  ['rightTool', (N: number, st: BeastState, cfg: RulesConfig) => countsRightTool(N, st, cfg)],
  ['top5', (N: number, st: BeastState, cfg: RulesConfig) => countsTop5(N, st, cfg)],
] as [string, (N: number, st: BeastState, cfg: RulesConfig) => number[]][]) {
  const cells: string[] = [];
  for (const N of [50, 200, 1000]) {
    // use engine reading for the "state" so the two readings are comparable
    const r = simulate(N, (st) => fn(N, st, ENGINE_RULES), ENGINE_RULES, integritySqrt, 150, 1);
    cells.push(r.steady.toFixed(2).padStart(7));
  }
  console.log(`  ${sn.padEnd(14)} ${cells.join('  ')}`);
}
console.log('  (state evolves under engine reading; C2 changes only the per-strike multiplier)');

// ---- 6. implied k ----
console.log('\n--- 6. IMPLIED k (window: > beast-ignoring, <= beast-reading) [SIM] ---');
for (const [name, cfg] of [['engine(1.0)', ENGINE_RULES], ['design(1.6)', C2_ALT]] as [string, RulesConfig][]) {
  let maxIgnore = 0, minRead = Infinity;
  for (const N of [50, 200, 1000]) {
    for (const fn of [() => countsEven5(N), () => countsHerd(N, genesisState(1), cfg), () => countsRightTool(N, genesisState(1), cfg)]) {
      const r = simulate(N, () => fn(), cfg, integritySqrt, 150, 1);
      if (r.steady > maxIgnore) maxIgnore = r.steady;
    }
    const rt = simulate(N, (st, c) => countsTop5(N, st, c), cfg, integritySqrt, 150, 1);
    if (rt.steady < minRead) minRead = rt.steady;
  }
  console.log(`  ${name.padEnd(13)} maxBeastIgnoring=${maxIgnore.toFixed(2)}  minBeastReading=${minRead.toFixed(2)}  => k in [${Math.ceil(maxIgnore)}, ${Math.floor(minRead)}]`);
}

console.log('\nDone.');
