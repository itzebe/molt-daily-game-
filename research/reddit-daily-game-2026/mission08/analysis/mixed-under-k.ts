/**
 * MISSION 08 — MIXED POPULATIONS UNDER CORRECT k-DYNAMICS. [SIM]/[ENGINE]
 *
 * For each candidate k, the state evolves under THAT k's outcome, and we measure the
 * shared-goal SLAIN rate for realistic mixed communities. This answers: "is k=30
 * winnable by a realistic subreddit, or only by a perfect one?"
 *
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission, type DayResolution } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 1) => x.toFixed(d);
type Ctx = { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number };
type Pick = (i: number, c: Ctx) => Combo;

const herd: Pick = (i, c) => COMBOS[obviousIdx(c.state)];
const rand: Pick = (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)];
const blind15: Pick = (i) => COMBOS[i % N_COMBOS];
const top5: Pick = (i, c) => COMBOS[rankedByBase(c.state)[i % 5]];
const reader: Pick = (i, c) => { let b = COMBOS[0], bv = -1; for (const cc of COMBOS) { const p = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, c.state) * crowdFactor(p).factor; if (v > bv) { bv = v; b = cc; } } return b; };

function mix(w: { herd: number; rand: number; blind15: number; top5: number; reader: number }): Pick {
  return (i, c) => { let x = c.rand();
    if (x < w.herd) return herd(i, c); x -= w.herd;
    if (x < w.rand) return rand(i, c); x -= w.rand;
    if (x < w.blind15) return blind15(i, c); x -= w.blind15;
    if (x < w.top5) return top5(i, c); x -= w.top5;
    return reader(i, c); };
}

function run(N: number, pick: Pick, k: number, seed: number, days = 150) {
  const r = lcg(seed + N * 131);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  let slain = 0;
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand: r }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    const target = k * res.n;
    const outcome: 'SLAIN' | 'ESCAPED' = res.n > 0 && res.totalDamage >= target ? 'SLAIN' : 'ESCAPED';
    if (outcome === 'SLAIN') slain++;
    const res2: DayResolution = { ...res, integrity: target, outcome };
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res2, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return slain / days;
}
const SEEDS = [1, 42, 90210];

line('================================================================');
line('MISSION 08 — MIXED POPULATIONS UNDER CORRECT k-DYNAMICS');
line('================================================================');
line('State evolves under each k. SLAIN% = mean daily clear rate, 3 seeds. [SIM]/[ENGINE]\n');

const mixes: Array<[string, Pick]> = [
  ['pure lazy (herd)', mix({ herd: 1, rand: 0, blind15: 0, top5: 0, reader: 0 })],
  ['lazy+random', mix({ herd: 0.5, rand: 0.5, blind15: 0, top5: 0, reader: 0 })],
  ['half even-spread', mix({ herd: 0.25, rand: 0.25, blind15: 0.5, top5: 0, reader: 0 })],
  ['30% state-read', mix({ herd: 0.35, rand: 0.35, blind15: 0, top5: 0.30, reader: 0 })],
  ['50% state-read', mix({ herd: 0.25, rand: 0.25, blind15: 0, top5: 0.50, reader: 0 })],
  ['70% state-read', mix({ herd: 0.15, rand: 0.15, blind15: 0, top5: 0.70, reader: 0 })],
  ['50% SR + 20% reader', mix({ herd: 0.15, rand: 0.15, blind15: 0, top5: 0.50, reader: 0.20 })],
  ['all state-read', mix({ herd: 0, rand: 0, blind15: 0, top5: 1, reader: 0 })],
];
line(`  ${'community'.padStart(22)} ${'N=100'.padStart(7)} ${'N=500'.padStart(7)} ${'N=1000'.padStart(7)}   (SLAIN% at k=27 / k=29 / k=30)`);
for (const [name, pick] of mixes) {
  const cell = (N: number) => [27, 29, 30].map((k) => `${fmt(SEEDS.reduce((a, s) => a + run(N, pick, k, s), 0) / 3 * 100)}%`).join('/');
  line(`  ${name.padStart(22)} ${cell(100).padStart(7)} ${cell(500).padStart(7)} ${cell(1000).padStart(7)}`);
}
line('\nREADING: the community must clear the goal most days. A k where even a');
line('50-70% state-reading community wins <50% is too hard for a real subreddit.');
line('\nDone.');
