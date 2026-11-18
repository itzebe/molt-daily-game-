/**
 * MISSION 08 — ROBUSTNESS: the authoritative window + k=27/29/30 SLAIN rates.
 * [SIM]/[ENGINE]
 *
 * Strategy classes by WHAT THE PLAYER MUST DO:
 *   beastIgnoring : no state-reading, no crowd-reading (herd, top1, random, blind15, rightTool)
 *   stateReading  : read the beast's state, spread across its weak points (top3, top5, top8)
 *   crowdReading  : react to yesterday's realised shares (reader, coordMinority)
 *   optimal       : central planner (DP) -- the day's ceiling
 *
 * For each N (fine grid) and 5 seeds, compute the median steady per-player damage.
 * Then the feasible window: k must be > max(beastIgnoring) and <= min(stateReading).
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
type Ctx = { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number };
type Pick = (i: number, c: Ctx) => Combo;

const P: Record<string, Pick> = {
  herd: (i, c) => COMBOS[obviousIdx(c.state)],
  top1: (i, c) => COMBOS[rankedByBase(c.state)[0]],
  random: (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)],
  blind15: (i) => COMBOS[i % N_COMBOS],
  rightTool: (i, c) => { const z = ZONES[i % 5]; let bt = TOOLS[0], bv = -1; for (const t of TOOLS) { const v = baseOf({ zone: z, tool: t }, c.state); if (v > bv) { bv = v; bt = t; } } return { zone: z, tool: bt }; },
  top3: (i, c) => COMBOS[rankedByBase(c.state)[i % 3]],
  top5: (i, c) => COMBOS[rankedByBase(c.state)[i % 5]],
  top8: (i, c) => COMBOS[rankedByBase(c.state)[i % 8]],
  reader: (i, c) => { let b = COMBOS[0], bv = -1; for (const cc of COMBOS) { const p = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, c.state) * crowdFactor(p).factor; if (v > bv) { bv = v; b = cc; } } return b; },
  coordMin: (i, c) => { let b = COMBOS[0], bv = -Infinity; for (const cc of COMBOS) { const s = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 0; const v = baseOf(cc, c.state) * (1 - s); if (v > bv) { bv = v; b = cc; } } return b; },
};

function steady(N: number, days: number, pick: Pick, seed: number): number {
  const rand = lcg(seed + N * 131);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  const per: number[] = [];
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    per.push(res.totalDamage / res.n);
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return per.slice(-20).reduce((a, b) => a + b, 0) / 20;
}
const SEEDS = [1, 7, 42, 1234, 90210];
const med = (N: number, pick: Pick) => { const v = SEEDS.map((s) => steady(N, 150, pick, s)).sort((a, b) => a - b); return { med: v[2], min: v[0], max: v[4] }; };

const CLASSES: Record<string, string[]> = {
  beastIgnoring: ['herd', 'top1', 'random', 'blind15', 'rightTool'],
  stateReading: ['top3', 'top5', 'top8'],
  crowdReading: ['reader', 'coordMin'],
};

line('================================================================');
line('MISSION 08 — ROBUSTNESS: AUTHORITATIVE WINDOW + SLAIN RATES');
line('================================================================');
line('Frozen engine; 150 days; steady = mean per-player last 20 days; median of 5 seeds.\n');

const Ns = [10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 2000];

line('--- A. steady per-player by strategy (median of 5 seeds) ---');
line(`  ${'strategy'.padStart(11)} ` + Ns.map((n) => String(n).padStart(6)).join(''));
const T: Record<string, number[]> = {};
for (const name of Object.keys(P)) { T[name] = Ns.map((N) => med(N, P[name]).med); line(`  ${name.padStart(11)} ` + T[name].map((v) => fmt(v).padStart(6)).join('')); }

line('\n--- B. class extremes + feasible window per N ---');
line(`  ${'N'.padStart(6)} ${'maxBeastIgn'.padStart(12)} ${'minStateRead'.padStart(12)} ${'maxCrowdRead'.padStart(12)} ${'k_min'.padStart(6)} ${'k_max'.padStart(6)} ${'window'.padStart(9)}`);
const windows: Array<[number, number, number]> = [];
for (let i = 0; i < Ns.length; i++) {
  const N = Ns[i];
  const maxIgn = Math.max(...CLASSES.beastIgnoring.map((n) => T[n][i]));
  const minSR = Math.min(...CLASSES.stateReading.map((n) => T[n][i]));
  const maxCR = Math.max(...CLASSES.crowdReading.map((n) => T[n][i]));
  const kmin = Math.floor(maxIgn) + 1, kmax = Math.floor(minSR);
  windows.push([N, kmin, kmax]);
  line(`  ${String(N).padStart(6)} ${fmt(maxIgn).padStart(12)} ${fmt(minSR).padStart(12)} ${fmt(maxCR).padStart(12)} ${String(kmin).padStart(6)} ${String(kmax).padStart(6)} ${`${kmin}-${kmax}`.padStart(9)}`);
}

line('\n--- C. explicit candidate check (must defeat ALL beastIgnoring AND allow ALL stateReading) ---');
for (const k of [26, 27, 28, 29, 30, 31]) {
  const fails: string[] = [];
  for (const [N, kmin, kmax] of windows) {
    if (k < kmin) fails.push(`N=${N}:${CLASSES.beastIgnoring[0] && ''}trivial>=${k}`);
    if (k > kmax) fails.push(`N=${N}:skill<${k}`);
  }
  line(`  k=${k}: ${fails.length === 0 ? 'PASS at all N' : `FAIL (${fails.length} cells) e.g. ${fails.slice(0, 4).join('  ')}`}`);
}

line('\n--- D. SLAIN rate per N for k=27 / k=29 / k=30 (by class; 5 seeds pooled) ---');
function slainRate(N: number, pick: Pick, k: number): number {
  let slain = 0, tot = 0;
  for (const seed of SEEDS) {
    const rand = lcg(seed + N * 131);
    let state = genesisState(1); let prevCombo: Record<string, number> = {};
    for (let d = 1; d <= 150; d++) {
      const subs: Submission[] = [];
      for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
      const res = resolveDay(d, state, subs);
      if (res.totalDamage >= k * res.n) slain++;
      prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
      state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
    }
    tot += 150;
  }
  return slain / tot;
}
line(`  ${'N'.padStart(6)} ${'blind15@27/29/30'.padStart(18)} ${'top5@27/29/30'.padStart(17)} ${'herd@27/29/30'.padStart(16)}`);
for (const N of [20, 50, 100, 200, 500, 1000]) {
  const b = [27, 29, 30].map((k) => `${(slainRate(N, P.blind15, k) * 100).toFixed(0)}%`).join('/');
  const t = [27, 29, 30].map((k) => `${(slainRate(N, P.top5, k) * 100).toFixed(0)}%`).join('/');
  const h = [27, 29, 30].map((k) => `${(slainRate(N, P.herd, k) * 100).toFixed(0)}%`).join('/');
  line(`  ${String(N).padStart(6)} ${b.padStart(18)} ${t.padStart(17)} ${h.padStart(16)}`);
}
line('\nDone.');
