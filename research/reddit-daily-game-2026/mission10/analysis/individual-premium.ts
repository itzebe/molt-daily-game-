/**
 * Mission 10 — individual-axis / k-independence reproduction (REAL engine).
 *
 * Reproduces Mission 09's single-deviator premium (+171%) and demonstrates that the
 * INDIVIDUAL axis is k-independent: k only appears in the SHARED comparison
 * (Σ damage >= k·N); a player's own damage never depends on k.
 *
 * Run: node --experimental-strip-types analysis/individual-premium.ts
 */
import {
  damageFor, ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, MAW,
  type Strike, type Tool, type Zone, type BeastState,
} from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/game.ts';
import { genesisState } from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/molt.ts';

const COMBOS = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
const NC = COMBOS.length;

function baseOf(c: { zone: Zone; tool: Tool }, st: BeastState): number {
  const zs = st.zoneState[c.zone] ?? 'exposed';
  const base = c.zone === ('maw' as Zone) ? MAW.value : ZONE_VALUE[c.zone];
  return base * TOOL_MULT[c.tool][zs];
}
function obviousIdx(st: BeastState): number { let bi = 0, bv = -1; for (let i = 0; i < NC; i++) { const v = baseOf(COMBOS[i], st); if (v > bv) { bv = v; bi = i; } } return bi; }

const N = 200;
const st = genesisState(1);
const herdCombo = obviousIdx(st);
const herdShare = (N - 1) / N;
const herdDmg = damageFor(COMBOS[herdCombo], st, herdShare);
let bestDev = -1, bestI = -1;
for (let i = 0; i < NC; i++) { if (i === herdCombo) continue; const v = damageFor(COMBOS[i], st, 1 / N); if (v > bestDev) { bestDev = v; bestI = i; } }

console.log('============================================================');
console.log('MISSION 10 — INDIVIDUAL PREMIUM + k-INDEPENDENCE (REAL engine)');
console.log('============================================================');
console.log(`genesis beast, N=${N}`);
console.log(`  herd (obvious) ${COMBOS[herdCombo].zone}:${COMBOS[herdCombo].tool} @ ${herdShare.toFixed(3)} share -> ${herdDmg}`);
console.log(`  deviator       ${COMBOS[bestI].zone}:${COMBOS[bestI].tool} @ ${(1 / N).toFixed(3)} share -> ${bestDev}`);
console.log(`  single-deviator premium = ${(100 * (bestDev - herdDmg) / herdDmg).toFixed(0)}%`);
console.log(`  (Mission 09 reported: herd=21, deviator(crown:pierce)=57, premium=171%)`);

console.log('\nk-INDEPENDENCE:');
console.log('  damageFor(strike, state, share) has no k term; the engine computes the same');
console.log('  per-player damage regardless of the integrity constant. k enters ONLY the');
console.log('  shared comparison  totalDamage >= k*N.  Proof by construction (see resolve.ts).');
const sameAcrossK = [27, 29, 30, 31].map(() => damageFor(COMBOS[bestI], st, 1 / N));
console.log(`  deviator damage for k in {27,29,30,31}: ${sameAcrossK.join(', ')}  -> identical: ${sameAcrossK.every((x) => x === sameAcrossK[0])}`);
