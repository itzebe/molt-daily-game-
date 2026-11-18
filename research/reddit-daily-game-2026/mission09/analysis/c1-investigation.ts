/**
 * MISSION 09 — C1 (STATE_MULT) full investigation.
 *
 * Reconstructs both readings as exact equations, prints the damage table for every
 * (zone,tool,state), measures the effect on the achievable ceiling, checks the
 * death-spiral claim dynamically, and derives the k each reading implies.
 *
 * All numbers are [PROOF] (exact arithmetic) or [SIM] (seeded dynamic simulation).
 */
import {
  ZONES, TOOLS, ZONE_VALUE, STATE_MULT, TOOL_MULT, COMBOS, N_COMBOS,
  dmg, baseOf, bestTotalExact, countsEven5, countsTop5, countsHerd, countsRightTool,
  simulate, ENGINE_RULES, C1_ALT, integritySqrt, integrityLinear,
  genesisState, type RulesConfig,
} from './lib9.ts';
import type { BeastState, Zone, ZoneState } from '../../mission04/prototype/src/engine/rules.ts';

function mkAll(zs: ZoneState, extra?: Partial<BeastState>): BeastState {
  const zoneState = {} as Record<Zone, ZoneState>; for (const z of ZONES) zoneState[z] = zs;
  return { day: 1, zoneState, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null, ...extra };
}

console.log('============================================================');
console.log('MISSION 09 — C1 (STATE_MULT) INVESTIGATION');
console.log('============================================================');
console.log('Reading A (engine, §2/§4):  dmg = ZONE_VALUE * TOOL_MULT[tool][state] * CROWD(share)');
console.log('Reading B (§1.2):           dmg = ZONE_VALUE * STATE_MULT[state] * TOOL_MULT[tool][state] * CROWD(share)');
console.log('STATE_MULT = { armoured: 0.55, exposed: 1.00, raw: 1.70 }');
console.log('');

// ---- 1. exact damage table for every (zone, tool, state), read = <3% share ----
console.log('--- 1. EXACT DAMAGE TABLE (share <3%, crowd x1.9) [PROOF] ---');
console.log('zone:tool            armoured A/B     exposed A/B      raw A/B');
for (const zone of ZONES) {
  for (const tool of TOOLS) {
    const row: string[] = [];
    for (const zs of ['armoured', 'exposed', 'raw'] as ZoneState[]) {
      const st = mkAll(zs);
      const A = dmg({ zone, tool }, st, 0.02, ENGINE_RULES);
      const B = dmg({ zone, tool }, st, 0.02, C1_ALT);
      row.push(`${String(A).padStart(3)}/${String(B).padStart(3)}`);
    }
    console.log(`${(zone + ':' + tool).padEnd(20)} ${row[0].padEnd(16)} ${row[1].padEnd(16)} ${row[2]}`);
  }
}

// ---- 2. effect on the achievable ceiling (exact DP, genesis + hardened) ----
console.log('\n--- 2. ACHIEVABLE CEILING (exact DP, best total damage per N) [PROOF] ---');
console.log('  N       A(engine)   B(§1.2)    B/A     state');
for (const N of [100, 500, 2000]) {
  const gen = genesisState(1);
  const A = bestTotalExact(N, gen, ENGINE_RULES) / N;
  const B = bestTotalExact(N, gen, C1_ALT) / N;
  console.log(`  ${String(N).padEnd(6)}  ${A.toFixed(2).padStart(8)}   ${B.toFixed(2).padStart(8)}   ${(B / A).toFixed(3)}   genesis (all exposed)`);
}
// hardened states (as ESCAPEs add armour to high-value zones)
for (const arm of [['crown'], ['crown', 'gut'], ['crown', 'gut', 'claw'], ['crown', 'gut', 'claw', 'hide', 'tail']] as Zone[][]) {
  const zoneState = {} as Record<Zone, ZoneState>; for (const z of ZONES) zoneState[z] = 'exposed'; for (const z of arm) zoneState[z] = 'armoured';
  const st: BeastState = { day: 1, zoneState, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
  const N = 2000;
  const A = bestTotalExact(N, st, ENGINE_RULES) / N, B = bestTotalExact(N, st, C1_ALT) / N;
  console.log(`  ${String(N).padEnd(6)}  ${A.toFixed(2).padStart(8)}   ${B.toFixed(2).padStart(8)}   ${(B / A).toFixed(3)}   ${arm.length} armoured (${arm.join(',')})`);
}

// ---- 3. death-spiral check: ceiling as armour accumulates ----
console.log('\n--- 3. DEATH-SPIRAL CHECK (ceiling/striker at N=2000 as armour accumulates) [PROOF] ---');
console.log('  #armoured   A(engine)   B(§1.2)');
for (let n = 0; n <= 5; n++) {
  const zoneState = {} as Record<Zone, ZoneState>; for (const z of ZONES) zoneState[z] = 'exposed';
  const order: Zone[] = ['crown', 'gut', 'claw', 'hide', 'tail'];
  for (let i = 0; i < n; i++) zoneState[order[i]] = 'armoured';
  const st: BeastState = { day: 1, zoneState, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
  const A = bestTotalExact(2000, st, ENGINE_RULES) / 2000, B = bestTotalExact(2000, st, C1_ALT) / 2000;
  console.log(`  ${String(n).padEnd(10)}  ${A.toFixed(2).padStart(8)}   ${B.toFixed(2).padStart(8)}`);
}
console.log('  => A: hardening RAISES the ceiling (no spiral).  B: hardening LOWERS it (spiral risk).');

// ---- 4. dynamic ceilings (state evolves under the reading) [SIM] ----
console.log('\n--- 4. DYNAMIC CEILINGS (150 days, state evolves, mean last 20) [SIM] ---');
console.log('  reading   N=50     N=200    N=1000   (even-5 spread, beast-ignoring)');
for (const [name, cfg] of [['A(engine)', ENGINE_RULES], ['B(§1.2)', C1_ALT]] as [string, RulesConfig][]) {
  const cells: string[] = [];
  for (const N of [50, 200, 1000]) {
    const r = simulate(N, (st) => countsEven5(N), cfg, integritySqrt, 150, 1);
    cells.push(r.steady.toFixed(2).padStart(7));
  }
  console.log(`  ${name.padEnd(9)} ${cells.join('  ')}`);
}
console.log('\n  beast-reading top5 spread:');
for (const [name, cfg] of [['A(engine)', ENGINE_RULES], ['B(§1.2)', C1_ALT]] as [string, RulesConfig][]) {
  const cells: string[] = [];
  for (const N of [50, 200, 1000]) {
    const r = simulate(N, (st, c) => countsTop5(N, st, c), cfg, integritySqrt, 150, 1);
    cells.push(r.steady.toFixed(2).padStart(7));
  }
  console.log(`  ${name.padEnd(9)} ${cells.join('  ')}`);
}

// ---- 5. implied k under each reading ----
console.log('\n--- 5. IMPLIED k (feasible window: > beast-ignoring, <= beast-reading) [SIM] ---');
for (const [name, cfg] of [['A(engine)', ENGINE_RULES], ['B(§1.2)', C1_ALT]] as [string, RulesConfig][]) {
  let maxIgnore = 0, minRead = Infinity;
  for (const N of [50, 200, 1000]) {
    for (const [sn, fn] of [['even5', () => countsEven5(N)], ['herd', () => countsHerd(N, genesisState(1), cfg)], ['rightTool', () => countsRightTool(N, genesisState(1), cfg)]] as [string, () => number[]][]) {
      const r = simulate(N, () => fn(), cfg, integritySqrt, 150, 1);
      if (r.steady > maxIgnore) maxIgnore = r.steady;
    }
    const rt = simulate(N, (st, c) => countsTop5(N, st, c), cfg, integritySqrt, 150, 1);
    if (rt.steady < minRead) minRead = rt.steady;
  }
  console.log(`  ${name.padEnd(9)} maxBeastIgnoring=${maxIgnore.toFixed(2)}  minBeastReading=${minRead.toFixed(2)}  => k in [${Math.ceil(maxIgnore)}, ${Math.floor(minRead)}]`);
}

console.log('\nDone.');
