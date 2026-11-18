/**
 * MISSION 06 — threshold across beast states (bounding A5 rigorously).
 *
 * Analytic claim to test: for BEST play, an `exposed` zone gives max multiplier
 * 1.0 (cleave/pierce), while `armoured` and `raw` give 1.6 (cleave / pierce-burn).
 * Therefore the ALL-EXPOSED genesis beast is the GLOBAL MINIMUM ceiling, hence the
 * GLOBAL MAXIMUM threshold. Any evolved beast (armoured/raw zones) has a HIGHER
 * ceiling and a LOWER threshold.
 *
 * Also shows the gate is governed by the CAP: N_min = ceil(CAP / c_max).
 * Deterministic.
 */
import { ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, type BeastState, type Zone, type ZoneState } from '../../mission04/prototype/src/engine/rules.ts';
import { crowdFactor, integrityFor } from '../../mission04/prototype/src/engine/resolve.ts';
import { COMBOS, N_COMBOS } from './lib.ts';

const r = Math.round;
function mk(map: Partial<Record<Zone, ZoneState>>): BeastState {
  const zs = {} as Record<Zone, ZoneState>;
  for (const z of ZONES) zs[z] = map[z] ?? 'exposed';
  return { day: 1, zoneState: zs, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
}
function bestTotal(N: number, st: BeastState): number {
  const value = COMBOS.map((c) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * r(ZONE_VALUE[c.zone] * TOOL_MULT[c.tool][st.zoneState[c.zone]] * crowdFactor(k / N).factor); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < N_COMBOS; i++) { const nd = new Array<number>(N + 1).fill(-Infinity); for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; } } dp = nd; }
  return dp[N];
}
function threshold(st: BeastState): number {
  for (let N = 1; N <= 3000; N++) if (bestTotal(N, st) >= integrityFor(N)) return N;
  return -1;
}

console.log('============================================================');
console.log('MISSION 06 — THRESHOLD ACROSS BEAST STATES');
console.log('============================================================');
console.log('best-case SLAIN threshold per state (current sqrt(1000)/cap 12000 formula).\n');
const states: Array<[string, BeastState]> = [
  ['all exposed (genesis)', mk({})],
  ['1 armoured (crown)', mk({ crown: 'armoured' })],
  ['2 armoured (crown,gut)', mk({ crown: 'armoured', gut: 'armoured' })],
  ['5 armoured', mk({ crown: 'armoured', hide: 'armoured', gut: 'armoured', claw: 'armoured', tail: 'armoured' })],
  ['1 raw (tail)', mk({ tail: 'raw' })],
  ['mixed (crown arm, gut raw)', mk({ crown: 'armoured', gut: 'raw' })],
];
console.log('  state                        threshold N   ceiling@N2000');
for (const [name, st] of states) {
  console.log(`  ${name.padEnd(28)} ${String(threshold(st)).padStart(11)}   ${(bestTotal(2000, st) / 2000).toFixed(2)}`);
}
console.log('\n=> ALL-EXPOSED is the maximum threshold (worst case). Evolved beasts');
console.log('   (armoured or raw) have HIGHER ceilings and LOWER thresholds.');
console.log('   The gate is set by the CAP: N_min ≈ ceil(12000 / c_max).');
console.log('\nNote: this means, under the engine formula, the ESCAPE penalty (adds');
console.log('armour) RAISES next-day damage potential -> it does NOT create a death');
console.log('spiral. The spiral concern applies only to the rejected STATE_MULT reading.');
console.log('\nDone.');
