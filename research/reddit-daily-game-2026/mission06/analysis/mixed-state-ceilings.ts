/**
 * MISSION 06 — aggregate strategy ceilings on MIXED-STATE beasts.
 *
 * The all-exposed genesis beast may understate the value of skill (every zone
 * wants the same tool). On a MIXED beast (some armoured, some raw), choosing the
 * RIGHT tool per zone should matter. This tests whether, at the aggregate level,
 * a "tool-aware" crowd beats a "blind" one — i.e. whether the shared goal can
 * reward skill rather than mere dispersion.
 *
 * Deterministic (exact, share-based); no randomness.
 */
import { ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, type BeastState, type Zone, type ZoneState } from '../../mission04/prototype/src/engine/rules.ts';
import { crowdFactor } from '../../mission04/prototype/src/engine/resolve.ts';
import { COMBOS, N_COMBOS } from './lib.ts';

function mkState(map: Partial<Record<Zone, ZoneState>>): BeastState {
  const zs = {} as Record<Zone, ZoneState>;
  for (const z of ZONES) zs[z] = map[z] ?? 'exposed';
  return { day: 1, zoneState: zs, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
}
const r = Math.round;
const dmg = (c: { zone: Zone; tool: import('../../mission04/prototype/src/engine/rules.ts').Tool }, st: BeastState, share: number) =>
  r(ZONE_VALUE[c.zone] * TOOL_MULT[c.tool][st.zoneState[c.zone]] * crowdFactor(share).factor);

function perStriker(counts: number[], N: number, st: BeastState): number {
  let tot = 0;
  for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) tot += counts[i] * dmg(COMBOS[i], st, counts[i] / N);
  return tot / N;
}

const N = 10000;
function strategies(st: BeastState) {
  const byBase = COMBOS.map((c, i) => ({ i, b: ZONE_VALUE[c.zone] * TOOL_MULT[c.tool][st.zoneState[c.zone]] })).sort((a, b) => b.b - a.b).map((x) => x.i);
  const mk = (spec: Array<[number, number]>) => { const c = new Array(N_COMBOS).fill(0); for (const [i, n] of spec) c[i] = n; return c; };
  // blind: uniform over all 15 (ignores state)
  const blind = mk(COMBOS.map((_, i) => [i, Math.round(N / 15)]));
  // tool-aware: for each zone, the RIGHT tool; distribute zones evenly (5 combos at 20%)
  const rightTool: Array<[number, number]> = [];
  for (const z of ZONES) {
    const best = TOOLS.slice().sort((a, b) => TOOL_MULT[b][st.zoneState[z]] - TOOL_MULT[a][st.zoneState[z]])[0];
    rightTool.push([COMBOS.findIndex((c) => c.zone === z && c.tool === best), Math.round(N / 5)]);
  }
  const toolAware = mk(rightTool);
  // base-ranked top-5 (what a naive "hit the softest" crowd does)
  const top5 = mk(byBase.slice(0, 5).map((i) => [i, Math.round(N / 5)]));
  // base-ranked top-10
  const top10 = mk(byBase.slice(0, 10).map((i) => [i, Math.round(N / 10)]));
  return { blind, toolAware, top5, top10 };
}

const states: Array<[string, BeastState]> = [
  ['all exposed (genesis)', mkState({})],
  ['crown armoured', mkState({ crown: 'armoured' })],
  ['mixed: crown arm, gut raw, tail raw', mkState({ crown: 'armoured', gut: 'raw', tail: 'raw' })],
  ['heavy: crown+gut arm, claw+tail raw', mkState({ crown: 'armoured', gut: 'armoured', claw: 'raw', tail: 'raw' })],
];

console.log('============================================================');
console.log('MISSION 06 — AGGREGATE CEILINGS ON MIXED-STATE BEASTS');
console.log('============================================================');
console.log('Per-striker aggregate damage; exact; N=10000.\n');
console.log('  state                                  blind   toolAware  top5    top10');
for (const [name, st] of states) {
  const s = strategies(st);
  console.log(`  ${name.padEnd(38)} ${perStriker(s.blind, N, st).toFixed(2).padStart(6)}  ${perStriker(s.toolAware, N, st).toFixed(2).padStart(8)}  ${perStriker(s.top5, N, st).toFixed(2).padStart(6)}  ${perStriker(s.top10, N, st).toFixed(2).padStart(6)}`);
}
console.log('\nQuestion: does tool-aware beat blind? If the gap is small, the shared goal');
console.log('rewards DISPERSION, not tool-skill, at the aggregate level.');
console.log('\nDone.');
