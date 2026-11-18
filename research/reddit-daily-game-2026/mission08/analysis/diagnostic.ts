/**
 * MISSION 08 — DIAGNOSTIC: what is the top-5 spread rule actually doing? [ENGINE]
 * Dumps the steady-state day for top5Spread and blindDispersion at N=1000 so we can
 * see the exact combos, shares, bands and per-combo damage. Also the DP-optimal day.
 */
import {
  COMBOS, N_COMBOS, ZONES, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  bestCountsExact, type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, damageFor, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const N = 1000, DAYS = 150;

function runTo(end: number, pick: (i: number, st: BeastState) => Combo, seed = 1) {
  const rand = lcg(seed + N);
  let state = genesisState(1);
  for (let d = 1; d <= end; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, state); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    if (d === end) return { state, res };
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  throw new Error('x');
}

function dump(label: string, state: BeastState, res: any) {
  line(`\n=== ${label} (day ${res.day}, N=${res.n}, total=${res.totalDamage}, per=${(res.totalDamage / res.n).toFixed(2)}) ===`);
  line(`  state: ${ZONES.map((z) => `${z}=${state.zoneState[z]}`).join(' ')}  fatigued=${state.fatiguedTool} ridges=[${state.ridges.join(',')}]`);
  const rows = COMBOS.map((c, i) => {
    const cnt = res.aggregate.comboCount[`${c.zone}:${c.tool}`] ?? 0;
    const share = cnt / res.n;
    return { key: `${c.zone}:${c.tool}`, cnt, share, band: crowdFactor(share).label, fac: crowdFactor(share).factor, dmg: damageFor(c, state, share), base: baseOf(c, state) };
  }).filter((r) => r.cnt > 0).sort((a, b) => b.cnt - a.cnt);
  for (const r of rows) line(`    ${r.key.padEnd(14)} cnt=${String(r.cnt).padStart(4)} share=${r.share.toFixed(3)} band=${r.band.padEnd(7)} fac=${r.fac} base=${r.base.toFixed(1)} dmg=${r.dmg}`);
  const contrib = rows.reduce((a, r) => a + r.cnt * r.dmg, 0);
  line(`  check: sum(cnt*dmg)=${contrib}  (engine total=${res.totalDamage})`);
}

line('================================================================');
line('MISSION 08 — DIAGNOSTIC OF TOP-5 SPREAD vs BLIND DISPERSION');
line('================================================================');

const top5 = (i: number, st: BeastState) => COMBOS[rankedByBase(st)[i % 5]];
const disp = (i: number) => COMBOS[i % N_COMBOS];
const herd = (i: number, st: BeastState) => COMBOS[obviousIdx(st)];

for (const [name, pick] of [['top5Spread', top5], ['blindDispersion', disp], ['herd', herd]] as const) {
  const { state, res } = runTo(DAYS, pick);
  dump(name, state, res);
}

// DP-optimal day at day 150
{
  let state = genesisState(1);
  for (let d = 1; d <= DAYS; d++) {
    const counts = bestCountsExact(N, state);
    const subs: Submission[] = [];
    for (let i = 0; i < N_COMBOS; i++) for (let k = 0; k < counts[i]; k++) subs.push({ userId: `u${i}_${k}`, strike: { zone: COMBOS[i].zone, tool: COMBOS[i].tool } });
    const res = resolveDay(d, state, subs);
    if (d === DAYS) dump('DP-optimal', state, res);
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
}
line('\nDone.');
