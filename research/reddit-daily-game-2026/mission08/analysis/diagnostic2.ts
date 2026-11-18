/**
 * MISSION 08 — DIAGNOSTIC 2: why blind15 and top5 differ by N. [ENGINE]
 * Dumps the day-150 state and per-combo damage for blind15 and top5 at N=50, 300, 1000.
 */
import {
  COMBOS, N_COMBOS, ZONES, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, damageFor, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const DAYS = 150;

function run(N: number, pick: (i: number, st: BeastState) => Combo) {
  let state = genesisState(1);
  for (let d = 1; d <= DAYS; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, state); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    if (d === DAYS) return { state, res };
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  throw new Error('x');
}
function dump(label: string, N: number, state: BeastState, res: any) {
  line(`\n=== ${label} N=${N} (total=${res.totalDamage}, per=${(res.totalDamage / N).toFixed(2)}) ===`);
  line(`  zoneState: ${ZONES.map((z) => `${z.slice(0, 3)}=${state.zoneState[z].slice(0, 3)}`).join(' ')} | fatigued=${state.fatiguedTool} ridges=[${state.ridges.join(',')}] mutated=${state.mutated}`);
  const rows = COMBOS.map((c) => {
    const cnt = res.aggregate.comboCount[`${c.zone}:${c.tool}`] ?? 0;
    const share = cnt / res.n;
    return { key: `${c.zone.slice(0, 4)}:${c.tool.slice(0, 4)}`, cnt, share, band: crowdFactor(share).label, fac: crowdFactor(share).factor, dmg: damageFor(c, state, share), base: baseOf(c, state) };
  }).filter((r) => r.cnt > 0).sort((a, b) => b.cnt - a.cnt);
  for (const r of rows) line(`    ${r.key.padEnd(13)} cnt=${String(r.cnt).padStart(4)} share=${r.share.toFixed(3)} band=${r.band.padEnd(6)} fac=${r.fac} base=${r.base.toFixed(1)} dmg=${r.dmg}`);
}

line('================================================================');
line('MISSION 08 — DIAGNOSTIC 2: blind15 vs top5 by N');
line('================================================================');
const blind15 = (i: number) => COMBOS[i % N_COMBOS];
const top5 = (i: number, st: BeastState) => COMBOS[rankedByBase(st)[i % 5]];
for (const N of [50, 300, 1000]) {
  const a = run(N, blind15); dump('blind15', N, a.state, a.res);
  const b = run(N, top5); dump('top5', N, b.state, b.res);
}
line('\nDone.');
