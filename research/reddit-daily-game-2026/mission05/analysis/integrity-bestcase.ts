/**
 * MISSION 05 — Integrity "best case" optimizer (evidence generator).
 *
 * To be FAIR to the design before reporting H7, this computes the MAXIMUM total
 * damage a perfectly coordinated crowd of size N could deal to the genesis beast,
 * using a hill-climbing search over how many strikers use each of the 15 combos.
 *
 * If even the BEST coordinated crowd of a given size cannot reach Integrity, then
 * the SLAIN branch is unreachable at that size for ANY play. Model-level only.
 */
import { ZONE_VALUE, TOOL_MULT, ZONES, TOOLS, type Zone, type Tool } from '../../mission04/prototype/src/engine/rules.ts';
import { crowdFactor, integrityFor } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';

const st = genesisState(1); // all exposed
const COMBOS: Array<{ zone: Zone; tool: Tool }> = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));

function totalFor(counts: number[], n: number): number {
  let total = 0;
  for (let i = 0; i < COMBOS.length; i++) {
    const c = counts[i];
    if (c === 0) continue;
    const { zone, tool } = COMBOS[i];
    const base = ZONE_VALUE[zone] * TOOL_MULT[tool][st.zoneState[zone]];
    const share = c / n;
    total += c * Math.round(base * crowdFactor(share).factor);
  }
  return total;
}

/** Hill-climb: move one striker between combos while it increases total. */
function bestTotal(n: number, seed = 1): number {
  let rng = seed + n;
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let counts = new Array(COMBOS.length).fill(0);
  for (let i = 0; i < n; i++) counts[Math.floor(rand() * COMBOS.length)]++;
  let best = totalFor(counts, n);
  for (let iter = 0; iter < 20000; iter++) {
    const a = Math.floor(rand() * COMBOS.length);
    const b = Math.floor(rand() * COMBOS.length);
    if (a === b || counts[a] === 0) continue;
    counts[a]--; counts[b]++;
    const t = totalFor(counts, n);
    if (t >= best) best = t;
    else { counts[b]--; counts[a]++; }
  }
  return best;
}

console.log('============================================================');
console.log('MISSION 05 — H7 best case: can a PERFECTLY COORDINATED crowd slay?');
console.log('============================================================');
console.log('(model-level, NOT human data; genesis beast, all zones exposed)\n');
console.log('     N   Integrity   BEST coordinated total   reachable?');
for (const n of [300, 320, 340, 350, 360, 380, 400]) {
  const integ = integrityFor(n);
  const best = bestTotal(n);
  console.log(`  ${String(n).padStart(4)}  ${integ.toFixed(0).padStart(9)}  ${best.toFixed(0).padStart(22)}   ${best >= integ ? 'YES' : 'no'}`);
}
console.log('\nDone.');
