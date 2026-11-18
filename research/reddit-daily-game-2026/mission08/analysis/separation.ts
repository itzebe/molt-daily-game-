/**
 * MISSION 08 — SHARED-AXIS SEPARATION. [SIM]/[ENGINE]
 *
 * The decision turns on whether the SHARED-goal payoff separates:
 *   "beast-ignoring" rules (herd, top1, random, blind even-spread)  -- should LOSE
 *   "beast-reading" rules  (spread over the beast's weak points)     -- should WIN
 *   "crowd-reading" rules  (react to yesterday's shares)             -- the identity skill
 *
 * Reports the steady per-player for every strategy, 9 seeds, at a fine N grid, and the
 * implied integer window [floor(max ignoring)+1 , floor(min reading)].
 *
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);
type Ctx = { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number };
type Pick = (i: number, c: Ctx) => Combo;

const P: Record<string, Pick> = {
  herd: (i, c) => COMBOS[obviousIdx(c.state)],
  top1: (i, c) => COMBOS[rankedByBase(c.state)[0]],
  random: (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)],
  blind15: (i) => COMBOS[i % N_COMBOS],
  top5: (i, c) => COMBOS[rankedByBase(c.state)[i % 5]],
  reader: (i, c) => { let b = COMBOS[0], bv = -1; for (const cc of COMBOS) { const p = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, c.state) * crowdFactor(p).factor; if (v > bv) { bv = v; b = cc; } } return b; },
};
const IGNORING = ['herd', 'top1', 'random', 'blind15'];
const READING = ['top5', 'reader'];

function steady(N: number, pick: Pick, seed: number, days = 150): number {
  const r = lcg(seed + N * 131);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  const per: number[] = [];
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand: r }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    per.push(res.totalDamage / res.n);
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return per.slice(-20).reduce((a, b) => a + b, 0) / 20;
}
const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const maxIgn = (N: number) => Math.max(...IGNORING.map((n) => Math.max(...SEEDS.map((s) => steady(N, P[n], s)))));
const minRead = (N: number) => Math.min(...READING.map((n) => Math.min(...SEEDS.map((s) => steady(N, P[n], s)))));

line('================================================================');
line('MISSION 08 — SHARED-AXIS SEPARATION');
line('================================================================');
line('Frozen engine; 150 days; steady = mean per-player last 20 days; 9 seeds. [SIM]/[ENGINE]\n');

const Ns = [15, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 2000];
line('--- per-strategy steady (WORST seed for ignoring, WORST seed for reading) ---');
line(`  ${'strategy'.padStart(9)} ` + Ns.map((n) => String(n).padStart(6)).join(''));
for (const name of [...IGNORING, ...READING]) {
  const row = Ns.map((N) => { const v = SEEDS.map((s) => steady(N, P[name], s)); return name === 'reader' || name === 'top5' ? Math.min(...v) : Math.max(...v); });
  line(`  ${name.padStart(9)} ` + row.map((x) => fmt(x).padStart(6)).join(''));
}
line();
line('--- window: k must exceed max(ignoring) and be <= min(reading) ---');
line(`  ${'N'.padStart(6)} ${'maxIgnoring'.padStart(12)} ${'minReading'.padStart(11)} ${'k_min'.padStart(6)} ${'k_max'.padStart(6)} ${'window'.padStart(9)} ${'27?'.padStart(5)} ${'29?'.padStart(5)} ${'30?'.padStart(5)}`);
for (const N of Ns) {
  const mi = maxIgn(N), mr = minRead(N);
  const kmin = Math.floor(mi) + 1, kmax = Math.floor(mr);
  line(`  ${String(N).padStart(6)} ${fmt(mi).padStart(12)} ${fmt(mr).padStart(11)} ${String(kmin).padStart(6)} ${String(kmax).padStart(6)} ${`${kmin}-${kmax}`.padStart(9)} ${(27 >= kmin && 27 <= kmax ? 'ok' : 'NO').padStart(5)} ${(29 >= kmin && 29 <= kmax ? 'ok' : 'NO').padStart(5)} ${(30 >= kmin && 30 <= kmax ? 'ok' : 'NO').padStart(5)}`);
}
line('\nDone.');
