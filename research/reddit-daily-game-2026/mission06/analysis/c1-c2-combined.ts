/**
 * MISSION 06 — C1 / C2 numerical analysis + combined-rules interaction.
 *
 * C1 (STATE_MULT): compare three readings numerically on the §4 example.
 *   A) §2 + §4 (no STATE_MULT):      dmg = ZONE_VALUE * TOOL_MULT * CROWD
 *   B) §1.2 STATE_MULT applied:      dmg = ZONE_VALUE * STATE_MULT * TOOL_MULT * CROWD
 * C2 (pierce vs exposed): compare design §2.2 (1.6) vs spec §1.3/§4 (1.0).
 *
 * Uses the real engine constants. Read-only. Deterministic.
 */
import { ZONE_VALUE, TOOL_MULT, STATE_MULT, type Zone, type Tool, type ZoneState } from '../../mission04/prototype/src/engine/rules.ts';
import { crowdFactor } from '../../mission04/prototype/src/engine/resolve.ts';

const r = Math.round;
const CROWD = (s: number) => crowdFactor(s).factor;

function dmgA(zone: Zone, tool: Tool, state: ZoneState, share: number) {
  return r(ZONE_VALUE[zone] * TOOL_MULT[tool][state] * CROWD(share));
}
function dmgB(zone: Zone, tool: Tool, state: ZoneState, share: number) {
  return r(ZONE_VALUE[zone] * STATE_MULT[state] * TOOL_MULT[tool][state] * CROWD(share));
}

console.log('============================================================');
console.log('MISSION 06 — C1 (STATE_MULT) NUMERICAL COMPARISON');
console.log('============================================================');
console.log('Reading A = §2/§4 (no STATE_MULT);  Reading B = §1.2 (STATE_MULT applied)\n');
const cases: Array<[Zone, Tool, ZoneState, number, string]> = [
  ['crown', 'cleave', 'armoured', 0.40, '§4 herd play'],
  ['gut', 'pierce', 'exposed', 0.02, '§4 contrarian read'],
  ['crown', 'cleave', 'exposed', 0.40, 'herd, exposed crown'],
  ['tail', 'burn', 'raw', 0.02, 'read on a raw tail'],
  ['crown', 'cleave', 'raw', 0.40, 'wrong tool on raw crown'],
];
console.log('  zone:tool      state      share   A(§2/§4)   B(§1.2)   ratio B/A');
for (const [z, t, st, s, note] of cases) {
  const a = dmgA(z, t, st, s), b = dmgB(z, t, st, s);
  console.log(`  ${(z + ':' + t).padEnd(14)} ${st.padEnd(9)} ${s.toFixed(2)}   ${String(a).padStart(7)}   ${String(b).padStart(7)}   ${(b / a).toFixed(2)}   (${note})`);
}
console.log('\nNote: Reading B multiplies armoured plays by 0.55 and raw by 1.7.');
console.log('§1.2 was written for "damage = zone * state * tool", but §2 and §4 omit it.');
console.log('The engine (resolve.ts damageFor) omits it => engine follows §2/§4.\n');

console.log('============================================================');
console.log('MISSION 06 — C2 (pierce vs exposed) NUMERICAL COMPARISON');
console.log('============================================================');
console.log('Design §2.2: pierce STRONG vs exposed (x1.6). Spec §1.3/§4: 1.0.\n');
const c2: Array<[Zone, Tool, ZoneState, number, string]> = [
  ['gut', 'pierce', 'exposed', 0.02, '§4 headline read'],
  ['crown', 'pierce', 'armoured', 0.02, 'pierce vs armoured (both say 0.6)'],
  ['tail', 'pierce', 'raw', 0.02, 'pierce vs raw (both say 1.6)'],
];
console.log('  zone:tool      state      share   spec(1.0)   design(1.6)   diff');
for (const [z, t, st, s, note] of c2) {
  const spec = r(ZONE_VALUE[z] * TOOL_MULT[t][st] * CROWD(s));
  const designMult = st === 'exposed' ? 1.6 : TOOL_MULT[t][st];
  const design = r(ZONE_VALUE[z] * designMult * CROWD(s));
  console.log(`  ${(z + ':' + t).padEnd(14)} ${st.padEnd(9)} ${s.toFixed(2)}   ${String(spec).padStart(8)}   ${String(design).padStart(10)}   ${design - spec >= 0 ? '+' : ''}${design - spec}   (${note})`);
}
console.log('\nNote: the only disagreement is pierce-vs-exposed. Spec §1.3 and §4 agree');
console.log('with the engine; design §2.2 is the outlier.\n');

console.log('============================================================');
console.log('COMBINED RULES INTERACTION');
console.log('============================================================');
// Under reading B (STATE_MULT applied), the best-combo damage/striker changes,
// which moves the A5 population threshold. Compute both.
import { bestTotal, integrity } from './lib.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';
import { COMBOS, dmgFor, N_COMBOS, lcg } from './lib.ts';

// Build a B-variant bestTotal using STATE_MULT, to see how the threshold moves.
const st = genesisState(1);
function dmgBcombo(i: number, share: number) {
  const c = COMBOS[i];
  return r(ZONE_VALUE[c.zone] * STATE_MULT[st.zoneState[c.zone]] * TOOL_MULT[c.tool][st.zoneState[c.zone]] * CROWD(share));
}
function bestTotalB(N: number): number {
  const M = N_COMBOS;
  const value = COMBOS.map((_, i) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * dmgBcombo(i, k / N); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < M; i++) { const nd = new Array<number>(N + 1).fill(-Infinity); for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; } } dp = nd; }
  return dp[N];
}
console.log('A5 threshold under Reading A (engine, no STATE_MULT):');
let thrA = -1; for (let N = 1; N <= 3000; N++) if (bestTotal(N) >= integrity(N)) { thrA = N; break; }
console.log(`  N = ${thrA}`);
console.log('A5 threshold under Reading B (STATE_MULT applied):');
let thrB = -1; for (let N = 1; N <= 3000; N++) if (bestTotalB(N) >= integrity(N)) { thrB = N; break; }
console.log(`  N = ${thrB}`);
console.log(`  => applying STATE_MULT moves the best-case threshold from ${thrA} to ${thrB}.`);
console.log('\nC2 impact on A5: changing pierce-vs-exposed from 1.0 to 1.6 raises the');
console.log('best achievable damage/striker on an exposed beast, so it slightly LOWERS the');
console.log('threshold (it enlarges the ceiling), but does not remove the structural issue.');
console.log('\nDone.');
