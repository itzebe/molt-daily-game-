/**
 * MISSION 08 — MIXED POPULATIONS, DEFECTION, SEED STABILITY. [SIM]/[ENGINE]
 *
 * Final decision evidence:
 *  A. SEED STABILITY of the key strategies (blind15 = "spread blindly"; top5 =
 *     "spread over the beast's weak points") across 9 seeds, at N in {50,200,1000}.
 *     Does the window (max blind15) < k <= (min top5) survive every seed?
 *  B. MIXED POPULATIONS: realistic crowds (fraction lazy / blind / top5) -> the
 *     SLAIN rate at k=27/29/30. Does a realistic sub win the shared goal?
 *  C. DEFECTION: inside a top5 crowd, the individual payoff of deviating to a
 *     neglected combo (the free-rider). How many defectors break the goal?
 *
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, damageFor, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);
type Ctx = { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number };
type Pick = (i: number, c: Ctx) => Combo;
const idxOf = (c: Combo) => COMBOS.findIndex((x) => x.zone === c.zone && x.tool === c.tool);

const herd: Pick = (i, c) => COMBOS[obviousIdx(c.state)];
const rand: Pick = (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)];
const blind15: Pick = (i) => COMBOS[i % N_COMBOS];
const top5: Pick = (i, c) => COMBOS[rankedByBase(c.state)[i % 5]];

line('================================================================');
line('MISSION 08 — MIXED POPULATIONS, DEFECTION, SEED STABILITY');
line('================================================================');
line('Frozen engine; 150 days; steady = mean per-player last 20 days. [SIM]/[ENGINE]\n');

const SEEDS9 = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];

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

line('--- A. SEED STABILITY: blind15 vs top5 (9 seeds) ---');
line(`  ${'N'.padStart(6)} ${'blind15 min/med/max'.padStart(24)} ${'top5 min/med/max'.padStart(24)} ${'window'.padStart(10)}`);
for (const N of [50, 200, 1000]) {
  const b = SEEDS9.map((s) => steady(N, blind15, s)).sort((a, b) => a - b);
  const t = SEEDS9.map((s) => steady(N, top5, s)).sort((a, b) => a - b);
  const kmin = Math.floor(b[8]) + 1, kmax = Math.floor(t[0]);
  line(`  ${String(N).padStart(6)} ${`${fmt(b[0])}/${fmt(b[4])}/${fmt(b[8])}`.padStart(24)} ${`${fmt(t[0])}/${fmt(t[4])}/${fmt(t[8])}`.padStart(24)} ${`${kmin}-${kmax}`.padStart(10)}`);
}
line('  => if (floor(max blind15)+1) <= floor(min top5) for EVERY seed, a k exists.');
line('     The widest blind15 across seeds sets k_min; the lowest top5 sets k_max.\n');

line('--- B. MIXED POPULATIONS: SLAIN rate at k=27/29/30 ---');
function mixedPick(w: { herd: number; rand: number; blind15: number; top5: number }): Pick {
  return (i, c) => { const u = c.rand(); let x = u;
    if (x < w.herd) return herd(i, c); x -= w.herd;
    if (x < w.rand) return rand(i, c); x -= w.rand;
    if (x < w.blind15) return blind15(i, c);
    return top5(i, c); };
}
function slainRate(N: number, pick: Pick, k: number, seeds: number[]): number {
  let slain = 0, tot = 0;
  for (const seed of seeds) {
    const r = lcg(seed + N * 131);
    let state = genesisState(1); let prevCombo: Record<string, number> = {};
    for (let d = 1; d <= 150; d++) {
      const subs: Submission[] = [];
      for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand: r }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
      const res = resolveDay(d, state, subs);
      if (res.totalDamage >= k * res.n) slain++;
      prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
      state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
    }
    tot += 150;
  }
  return slain / tot;
}
const mixes: Array<[string, Pick]> = [
  ['all lazy (herd)', mixedPick({ herd: 1, rand: 0, blind15: 0, top5: 0 })],
  ['mostly lazy+random', mixedPick({ herd: 0.5, rand: 0.5, blind15: 0, top5: 0 })],
  ['half blind15', mixedPick({ herd: 0.25, rand: 0.25, blind15: 0.5, top5: 0 })],
  ['30% top5', mixedPick({ herd: 0.35, rand: 0.35, blind15: 0, top5: 0.30 })],
  ['50% top5', mixedPick({ herd: 0.25, rand: 0.25, blind15: 0, top5: 0.50 })],
  ['70% top5', mixedPick({ herd: 0.15, rand: 0.15, blind15: 0, top5: 0.70 })],
  ['all top5', mixedPick({ herd: 0, rand: 0, blind15: 0, top5: 1 })],
];
line(`  ${'mix'.padStart(20)} ${'N=100 27/29/30'.padStart(20)} ${'N=500 27/29/30'.padStart(20)} ${'N=1000 27/29/30'.padStart(20)}`);
for (const [name, pick] of mixes) {
  const cell = (N: number) => [27, 29, 30].map((k) => `${(slainRate(N, pick, k, [1, 42, 90210]) * 100).toFixed(0)}%`).join('/');
  line(`  ${name.padStart(20)} ${cell(100).padStart(20)} ${cell(500).padStart(20)} ${cell(1000).padStart(20)}`);
}
line('  => a realistic sub should win (high SLAIN) at the chosen k. If even a 70% top5');
line('     crowd cannot clear k, k is too high for real communities.\n');

line('--- C. DEFECTION inside a top5 crowd (N=500): individual payoffs ---');
function defection(N: number, numDefectors: number, days = 150) {
  const r = lcg(7 + N);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  const crowdPer: number[] = [], defPer: number[] = [];
  for (let d = 1; d <= days; d++) {
    const counts = new Array(N_COMBOS).fill(0);
    for (let i = 0; i < N - numDefectors; i++) counts[idxOf(top5(i, { N, state, prevCombo, rand: r }))]++;
    // defectors pick the lowest-share high-base combo
    const ranked = rankedByBase(state);
    let dIdx = ranked[0], dShare = Infinity;
    for (const j of ranked) { const sh = (prevCombo[`${COMBOS[j].zone}:${COMBOS[j].tool}`] ?? 0); if (sh < dShare) { dShare = sh; dIdx = j; } }
    counts[dIdx] += numDefectors;
    const subs: Submission[] = [];
    for (let i = 0; i < N_COMBOS; i++) for (let k = 0; k < counts[i]; k++) subs.push({ userId: `u${i}_${k}`, strike: { zone: COMBOS[i].zone, tool: COMBOS[i].tool } });
    const res = resolveDay(d, state, subs);
    crowdPer.push(res.totalDamage / res.n);
    const dres = res.results.find((x) => x.userId === `u${dIdx}_${counts[dIdx] - 1}`);
    defPer.push(dres ? dres.damage : 0);
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return { crowd: crowdPer.slice(-20).reduce((a, b) => a + b, 0) / 20, def: defPer.slice(-20).reduce((a, b) => a + b, 0) / 20 };
}
line(`  ${'defectors'.padStart(10)} ${'crowd/pl'.padStart(9)} ${'defector/pl'.padStart(12)} ${'defect gain'.padStart(12)}`);
for (const nD of [0, 1, 5, 25, 50, 125, 250]) {
  const r = defection(500, nD);
  line(`  ${String(nD).padStart(10)} ${fmt(r.crowd).padStart(9)} ${fmt(r.def).padStart(12)} ${fmt(r.def - r.crowd).padStart(12)}`);
}
line('  => a positive "defect gain" means individuals are tempted to free-ride, which');
line('     makes a top5 equilibrium socially unstable (the coordination tension).\n');
line('Done.');
