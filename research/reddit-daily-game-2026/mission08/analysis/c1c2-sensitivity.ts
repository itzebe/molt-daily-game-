/**
 * MISSION 08 — C1/C2 SENSITIVITY. [PROOF]
 *
 * C1: the STATE_MULT (§1.2) contradiction. The engine's damageFor() does NOT apply
 *     STATE_MULT; it uses ZONE_VALUE x TOOL_MULT x CROWD_FACTOR. We measure how the
 *     ceilings (and hence the feasible k) would move if STATE_MULT WERE applied.
 * C2: pierce vs exposed. The engine uses TOOL_MULT.pierce.exposed = 1.0. We measure
 *     the effect of the alternative reading (0.6) on the ceilings.
 *
 * This does NOT resolve C1/C2 and does NOT modify the engine. It only quantifies
 * whether they affect the integrity decision.
 */
import { ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, baseOf, obviousIdx, rankedByBase } from './lib8.ts';
import { STATE_MULT } from '../../mission04/prototype/src/engine/rules.ts';
import { damageFor, crowdFactor } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const state = genesisState(1);

line('================================================================');
line('MISSION 08 — C1 / C2 SENSITIVITY (effect on the ceilings)');
line('================================================================\n');

// exact best-case per-player on genesis, engine formula vs hypothetical C1/C2 variants
function bestPerPlayer(stateAny: any, damage: (zone: string, tool: string, share: number) => number, N = 2000): number {
  // DP over 15 combos using the provided damage fn
  const combos: Array<[string, string]> = [];
  for (const z of ZONES) for (const t of TOOLS) combos.push([z, t]);
  const value = combos.map(([z, t]) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * damage(z, t, k / N); return a; });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < combos.length; i++) { const nd = new Array<number>(N + 1).fill(-Infinity); for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; } } dp = nd; }
  return dp[N] / N;
}

const engineDmg = (z: string, t: string, share: number) => damageFor({ zone: z as any, tool: t as any }, state, share);
// C1 variant: apply STATE_MULT explicitly (exposed=1.0, so identical on genesis; use an armoured zone test instead)
const c1Armoured = (z: string, t: string, share: number) => {
  const st = state; // genesis: all exposed
  const base = ZONE_VALUE[z as any];
  const toolM = TOOL_MULT[t as any][st.zoneState[z as any]];
  // hypothetical: multiply by STATE_MULT as well
  return Math.round(base * toolM * STATE_MULT[st.zoneState[z as any]] * crowdFactor(share).factor);
};
// C2 variant: pierce.exposed = 0.6
const c2Dmg = (z: string, t: string, share: number) => {
  const st = state;
  let tm = TOOL_MULT[t as any][st.zoneState[z as any]];
  if (t === 'pierce' && st.zoneState[z as any] === 'exposed') tm = 0.6;
  return Math.round(ZONE_VALUE[z as any] * tm * crowdFactor(share).factor);
};

line('--- genesis best-case per-player (N=2000) under each reading ---');
line(`  engine (C1 not applied, C2=1.0):        ${bestPerPlayer(state, engineDmg).toFixed(2)}`);
line(`  hypothetical C1 applied (STATE_MULT):   ${bestPerPlayer(state, c1Armoured).toFixed(2)}  (NOTE: on genesis all exposed, STATE_MULT=1.0 -> only effect on EVOLVED zones)`);
line(`  hypothetical C2 (pierce.exposed=0.6):   ${bestPerPlayer(state, c2Dmg).toFixed(2)}`);
line();

line('--- the real C1 test: an ARMOURED zone ---');
const armoured = { day: 1, zoneState: { crown: 'armoured', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'exposed' } as any, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
const dmgEngineArm = (z: string, t: string, share: number) => damageFor({ zone: z as any, tool: t as any }, armoured as any, share);
const dmgC1Arm = (z: string, t: string, share: number) => Math.round(ZONE_VALUE[z as any] * TOOL_MULT[t as any][armoured.zoneState[z as any]] * STATE_MULT[armoured.zoneState[z as any]] * crowdFactor(share).factor);
line(`  crown:cleave on ARMOURED, engine:      ${damageFor({ zone: 'crown', tool: 'cleave' } as any, armoured as any, 0.5)}`);
line(`  crown:cleave on ARMOURED, C1 applied:  ${dmgC1Arm('crown', 'cleave', 0.5)}`);
line(`  => C1 changes armoured-zone damage from ${damageFor({ zone: 'crown', tool: 'cleave' } as any, armoured as any, 0.5)} to ${dmgC1Arm('crown', 'cleave', 0.5)} (factor ${STATE_MULT.armoured}).`);
line(`     This SHIFTS every evolved-state ceiling and hence the feasible k window.`);
line();
line('--- C2 test: pierce vs exposed ---');
line(`  crown:pierce exposed, engine (1.0): ${damageFor({ zone: 'crown', tool: 'pierce' } as any, state, 0.5)}`);
line(`  crown:pierce exposed, C2 (0.6):     ${c2Dmg('crown', 'pierce', 0.5)}`);
line(`  => C2 changes pierce-vs-exposed damage by ~40%; a small but real shift to the ceilings.`);
line();
line('--- VERDICT ---');
line('  C1 and C2 both SHIFT the absolute damage ceilings, and therefore SHIFT the');
line('  feasible k window. The Mission 08 k analysis follows the ENGINE (the');
line('  authoritative reference), which does NOT apply STATE_MULT and uses pierce:exposed=1.0.');
line('  If C1 or C2 were resolved the other way, the k window MUST be re-derived.');
line('  => C1/C2 are RELEVANT to the integrity decision (as a dependency), but are');
line('     NOT resolved here.');
line('\nDone.');
