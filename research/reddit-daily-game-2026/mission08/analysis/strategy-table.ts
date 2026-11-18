/**
 * MISSION 08 — DEFINITIVE DYNAMIC STRATEGY TABLE. [SIM]/[ENGINE]
 *
 * The k decision turns on the DYNAMIC (state-evolving) per-player damage of each
 * strategy class, across realistic N and seeds. This script produces the single
 * authoritative table, plus the true individual ceiling (a player who best-responds
 * to the ACTUAL realised crowd, not yesterday's).
 *
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  bestCountsExact, type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);

type Pick = (i: number, c: { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number }) => Combo;

const P: Record<string, Pick> = {
  herd: (i, c) => COMBOS[obviousIdx(c.state)],
  random: (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)],
  blindDispersion: (i) => COMBOS[i % N_COMBOS],
  top5Spread: (i, c) => { const r = rankedByBase(c.state); return COMBOS[r[i % 5]]; },
  top1: (i, c) => COMBOS[rankedByBase(c.state)[0]],
  rightToolSpread: (i, c) => { const z = ZONES[i % 5]; let bt = TOOLS[0], bv = -1; for (const t of TOOLS) { const v = baseOf({ zone: z, tool: t }, c.state); if (v > bv) { bv = v; bt = t; } } return { zone: z, tool: bt }; },
  readerYesterday: (i, c) => { let b = COMBOS[0], bv = -1; for (const cc of COMBOS) { const p = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, c.state) * crowdFactor(p).factor; if (v > bv) { bv = v; b = cc; } } return b; },
};

function runDynamic(N: number, days: number, pick: Pick, seed: number) {
  const rand = lcg(seed + N * 31);
  let state = genesisState(1);
  let prevCombo: Record<string, number> = {};
  const perHist: number[] = [];
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    perHist.push(res.totalDamage / res.n);
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  const steady = perHist.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const finalState = ZONES.map((z) => state.zoneState[z][0]).join('');
  return { steady, mean: perHist.reduce((a, b) => a + b, 0) / perHist.length, finalState };
}

// TRUE INDIVIDUAL CEILING: one player best-responds to the ACTUAL crowd that formed
// (perfect foresight). Implemented as: run a fixed crowd, then score the best combo
// against the realised share vector each day.
function perfectReader(N: number, days: number, crowdPick: Pick, seed: number) {
  const rand = lcg(seed + N * 31);
  let state = genesisState(1);
  let prevCombo: Record<string, number> = {};
  const best: number[] = [];
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = crowdPick(i, { N, state, prevCombo, rand }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    // shares that include one extra striker on the chosen combo
    let bv = -1;
    for (const cc of COMBOS) {
      const key = `${cc.zone}:${cc.tool}`;
      const share = ((res.aggregate.comboCount[key] ?? 0) + 1) / (N + 1);
      const v = baseOf(cc, state) * crowdFactor(share).factor;
      if (v > bv) bv = v;
    }
    best.push(bv);
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return best.slice(-20).reduce((a, b) => a + b, 0) / 20;
}

line('================================================================');
line('MISSION 08 — DEFINITIVE DYNAMIC STRATEGY TABLE');
line('================================================================');
line('Frozen engine; 150 days; steady = mean per-player, last 20 days. [SIM]/[ENGINE]\n');

const SEEDS = [1, 42, 90210];
const NAMES = Object.keys(P);
line('--- A. steady per-player by strategy and N (median of 3 seeds) ---');
line(`  ${'strategy'.padStart(17)} ` + [50, 100, 200, 500, 1000, 2000].map((n) => `N=${n}`.padStart(8)).join(''));
const grid: Record<string, number[]> = {};
for (const name of NAMES) {
  const row: number[] = [];
  for (const N of [50, 100, 200, 500, 1000, 2000]) {
    const vals = SEEDS.map((s) => runDynamic(N, 150, P[name], s).steady).sort((a, b) => a - b);
    row.push(vals[1]);
  }
  grid[name] = row;
  line(`  ${name.padStart(17)} ` + row.map((v) => fmt(v).padStart(8)).join(''));
}
line('  => the DECISIVE row is top5Spread: if it is >> k at large N, k cannot');
line('     defeat it without becoming unwinnable for the collective.\n');

line('--- B. TRUE INDIVIDUAL CEILING: perfect reader vs each crowd (N=500, 3 seeds median) ---');
line(`  ${'crowd'.padStart(17)} ${'perfectReader/pl'.padStart(18)} ${'crowd/pl'.padStart(9)}`);
for (const name of ['herd', 'random', 'blindDispersion', 'top5Spread']) {
  const vals = SEEDS.map((s) => perfectReader(500, 150, P[name], s)).sort((a, b) => a - b);
  const crowd = SEEDS.map((s) => runDynamic(500, 150, P[name], s).steady).sort((a, b) => a - b);
  line(`  ${name.padStart(17)} ${fmt(vals[1]).padStart(18)} ${fmt(crowd[1]).padStart(9)}`);
}
line('  => if perfectReader >> top5Spread, a reading player is individually rewarded');
line('     even when the crowd is trivial (the individual axis is healthy).\n');

line('--- C. head-to-head: top5Spread vs blindDispersion dynamic steady (median 3 seeds) ---');
for (const N of [50, 200, 1000]) {
  const t = SEEDS.map((s) => runDynamic(N, 150, P.top5Spread, s).steady).sort((a, b) => a - b)[1];
  const d = SEEDS.map((s) => runDynamic(N, 150, P.blindDispersion, s).steady).sort((a, b) => a - b)[1];
  const h = SEEDS.map((s) => runDynamic(N, 150, P.herd, s).steady).sort((a, b) => a - b)[1];
  line(`  N=${String(N).padStart(4)}: herd ${fmt(h)}  blindDispersion ${fmt(d)}  top5Spread ${fmt(t)}`);
}
line('\nDone.');
