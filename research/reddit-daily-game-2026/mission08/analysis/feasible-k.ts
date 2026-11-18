/**
 * MISSION 08 — FEASIBLE k WINDOW PER N (dynamic, frozen engine). [SIM]/[ENGINE]
 *
 * Decisive experiment. For each N, run the strategy classes through the FROZEN engine
 * (state evolves) and compute the long-run steady per-player damage. Then derive, for
 * that N:
 *   k_min = 1 + floor(max steady of the TRIVIAL rules)  (smallest k that defeats them)
 *   k_max = floor(min steady of the SKILLED rules)      (largest k that stays winnable)
 * A k is defensible at N iff k_min <= k <= k_max.
 *
 * "Trivial" = no state-reading, no crowd-reading: herd, random, blind cycle-15, top1.
 * "Skilled" = state-reading spread (top5 / rightTool) and crowd-reading (reader).
 *
 * Deterministic per seed; medians over 3 seeds.
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);

type Pick = (i: number, c: { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number }) => Combo;

const herdPick: Pick = (i, c) => COMBOS[obviousIdx(c.state)];
const top1Pick: Pick = (i, c) => COMBOS[rankedByBase(c.state)[0]];
const randPick: Pick = (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)];
const dispPick: Pick = (i) => COMBOS[i % N_COMBOS];
const top5Pick: Pick = (i, c) => COMBOS[rankedByBase(c.state)[i % 5]];
const rightToolPick: Pick = (i, c) => { const z = ZONES[i % 5]; let bt = TOOLS[0], bv = -1; for (const t of TOOLS) { const v = baseOf({ zone: z, tool: t }, c.state); if (v > bv) { bv = v; bt = t; } } return { zone: z, tool: bt }; };
const readerPick: Pick = (i, c) => { let b = COMBOS[0], bv = -1; for (const cc of COMBOS) { const p = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, c.state) * crowdFactor(p).factor; if (v > bv) { bv = v; b = cc; } } return b; };
// coordinated minority: a bloc (here the whole crowd, since we measure the shared total)
// hits the single highest-base combo that had the LOWEST share yesterday (a neglected zone).
const coordMinorityPick: Pick = (i, c) => { let b = COMBOS[0], bv = -Infinity; for (const cc of COMBOS) { const s = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 0; const v = baseOf(cc, c.state) * (1 - s); if (v > bv) { bv = v; b = cc; } } return b; };

function steady(N: number, days: number, pick: Pick, seed: number): number {
  const rand = lcg(seed + N * 131);
  let state = genesisState(1);
  let prevCombo: Record<string, number> = {};
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
const med = (N: number, pick: Pick, days = 150) => { const v = [1, 42, 90210].map((s) => steady(N, days, pick, s)).sort((a, b) => a - b); return v[1]; };

line('================================================================');
line('MISSION 08 — FEASIBLE k WINDOW PER N');
line('================================================================');
line('Frozen engine; 150 days; steady = mean per-player last 20 days; median of 3 seeds. [SIM]/[ENGINE]\n');

const TRIVIAL: Array<[string, Pick]> = [['herd', herdPick], ['top1', top1Pick], ['random', randPick], ['blind15', dispPick]];
const SKILLED: Array<[string, Pick]> = [['top5Spread', top5Pick], ['rightTool', rightToolPick], ['reader', readerPick], ['coordMin', coordMinorityPick]];

line('--- A. steady per-player by strategy and N ---');
const Ns = [20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];
line(`  ${'strategy'.padStart(12)} ` + Ns.map((n) => String(n).padStart(6)).join(''));
const table: Record<string, number[]> = {};
for (const [name, pick] of [...TRIVIAL, ...SKILLED]) {
  const row = Ns.map((N) => med(N, pick));
  table[name] = row;
  line(`  ${name.padStart(12)} ` + row.map((v) => fmt(v).padStart(6)).join(''));
}
line();

line('--- B. feasible k window per N ---');
line('  k_min = 1+floor(max trivial steady); k_max = floor(min skilled steady).');
line(`  ${'N'.padStart(6)} ${'maxTrivial'.padStart(11)} ${'minSkilled'.padStart(11)} ${'k_min'.padStart(6)} ${'k_max'.padStart(6)} ${'window'.padStart(9)} ${'27 ok?'.padStart(8)} ${'29 ok?'.padStart(8)} ${'30 ok?'.padStart(8)}`);
const feasible: Record<number, boolean> = {};
for (let i = 0; i < Ns.length; i++) {
  const N = Ns[i];
  const maxTriv = Math.max(...TRIVIAL.map(([n]) => table[n][i]));
  const minSkill = Math.min(...SKILLED.map(([n]) => table[n][i]));
  const kmin = Math.floor(maxTriv) + 1;
  const kmax = Math.floor(minSkill);
  const ok27 = 27 >= kmin && 27 <= kmax;
  const ok29 = 29 >= kmin && 29 <= kmax;
  const ok30 = 30 >= kmin && 30 <= kmax;
  line(`  ${String(N).padStart(6)} ${fmt(maxTriv).padStart(11)} ${fmt(minSkill).padStart(11)} ${String(kmin).padStart(6)} ${String(kmax).padStart(6)} ${`${kmin}-${kmax}`.padStart(9)} ${(ok27 ? 'yes' : 'NO').padStart(8)} ${(ok29 ? 'yes' : 'NO').padStart(8)} ${(ok30 ? 'yes' : 'NO').padStart(8)}`);
  feasible[N] = kmin <= kmax;
}
line('\n--- C. global verdict per candidate k (defensible at ALL N?) ---');
for (const k of [26, 27, 28, 29, 30, 31, 32, 33]) {
  let allOk = true, failing: number[] = [];
  for (let i = 0; i < Ns.length; i++) {
    const maxTriv = Math.max(...TRIVIAL.map(([n]) => table[n][i]));
    const minSkill = Math.min(...SKILLED.map(([n]) => table[n][i]));
    const kmin = Math.floor(maxTriv) + 1, kmax = Math.floor(minSkill);
    if (!(k >= kmin && k <= kmax)) { allOk = false; failing.push(Ns[i]); }
  }
  line(`  k=${k}: ${allOk ? 'DEFENSIBLE at all N' : `NOT defensible (fails at N=${failing.join(',')})`}`);
}
line('\nDone.');
