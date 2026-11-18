/**
 * MISSION 08 — k-SWEEP + SEED STABILITY (dynamic, frozen engine). [SIM]/[ENGINE]
 *
 * Sweeps k over a wide range and, for each k, runs realistic communities through the
 * FROZEN engine (state evolves via molt) for many days and seeds. Reports:
 *   - SLAIN rate per k for each strategy class,
 *   - the seed-to-seed spread of the steady per-player damage,
 *   - the reachable beast states,
 * so we can locate the k window that (a) defeats non-reading rules and
 * (b) stays winnable by reading/skilled play.
 *
 * Deterministic per (seed, N, strategy).
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, allExposed, baseOf, obviousIdx, rankedByBase, lcg,
  crowdFactor, integritySqrt, type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);

type Pick = (i: number, ctx: { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number }) => Combo;

const herdPick: Pick = (i, c) => COMBOS[obviousIdx(c.state)];
const randPick: Pick = (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)];
const dispPick: Pick = (i) => COMBOS[i % N_COMBOS];
const top5Pick: Pick = (i, c) => { const r = rankedByBase(c.state); return COMBOS[r[i % 5]]; };
const readerPick: Pick = (i, c) => {
  // best base-adjusted response to yesterday's combo shares
  let best = COMBOS[0], bv = -1;
  for (const cc of COMBOS) { const p = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, c.state) * crowdFactor(p).factor; if (v > bv) { bv = v; best = cc; } }
  return best;
};
// greedy best-response to yesterday's shares (same as readerPick but pure damage) — a strong reader
const greedyPick: Pick = (i, c) => {
  let best = COMBOS[0], bv = -1;
  for (const cc of COMBOS) { const p = c.prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, c.state) * crowdFactor(p).factor; if (v > bv) { bv = v; best = cc; } }
  return best;
};

// mixed realistic community: fraction weights
function mixedPick(w: { herd: number; rand: number; top5: number; disp: number; reader: number }): Pick {
  return (i, c) => {
    const u = c.rand();
    if (u < w.herd) return herdPick(i, c);
    if (u < w.herd + w.rand) return randPick(i, c);
    if (u < w.herd + w.rand + w.top5) return top5Pick(i, c);
    if (u < w.herd + w.rand + w.top5 + w.disp) return dispPick(i, c);
    return readerPick(i, c);
  };
}

function runDynamic(N: number, days: number, pick: Pick, seed: number) {
  const rand = lcg(seed + N * 7919);
  let state = genesisState(1);
  let prevCombo: Record<string, number> = {};
  const perHist: number[] = [];
  const states = new Set<string>();
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    perHist.push(res.totalDamage / res.n);
    states.add(ZONES.map((z) => state.zoneState[z][0]).join(''));
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  const steady = perHist.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, perHist.length);
  return { steady, states: [...states] };
}

line('================================================================');
line('MISSION 08 — k-SWEEP + SEED STABILITY (dynamic)');
line('================================================================');
line('Frozen engine; 150 days; steady = mean per-player over last 20 days. [SIM]/[ENGINE]\n');

const DAYS = 150;
const SEEDS = [1, 7, 42, 1234, 90210];

line('--- A. SEED STABILITY of steady per-player (N=200, 5 seeds) ---');
line(`  ${'strategy'.padStart(15)} ${'min'.padStart(7)} ${'median'.padStart(7)} ${'max'.padStart(7)}   states reached`);
const singles: Array<[string, Pick]> = [
  ['random', randPick], ['blindDispersion', dispPick], ['top5Spread', top5Pick],
  ['herdObvious', herdPick], ['readerPersist', readerPick],
];
const steadyStats: Record<string, { min: number; med: number; max: number }> = {};
for (const [name, pick] of singles) {
  const vals = SEEDS.map((s) => runDynamic(200, DAYS, pick, s).steady).sort((a, b) => a - b);
  const st = runDynamic(200, DAYS, pick, 1);
  steadyStats[name] = { min: vals[0], med: vals[2], max: vals[4] };
  line(`  ${name.padStart(15)} ${fmt(vals[0]).padStart(7)} ${fmt(vals[2]).padStart(7)} ${fmt(vals[4]).padStart(7)}   ${st.states.slice(0, 6).join(',')}`);
}
line('  => blind dispersion is NOT a single number dynamically: it ranges ~27-29.5 with the');
line('     reached state. The static genesis value 29.1 is the top of that range, not a constant.\n');

line('--- B. k-SWEEP: SLAIN rate vs k (N=200, 5 seeds pooled, 150 days) ---');
const ks = [22, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 40];
const classes: Array<[string, Pick]> = [
  ['herd', herdPick], ['random', randPick], ['blindDispersion', dispPick],
  ['top5Spread', top5Pick], ['reader(greedy)', readerPick],
  ['mixed realistic', mixedPick({ herd: 0.4, rand: 0.3, top5: 0.1, disp: 0.1, reader: 0.1 })],
  ['mixed skilled', mixedPick({ herd: 0.2, rand: 0.2, top5: 0.1, disp: 0.1, reader: 0.4 })],
];
line(`  ${'k'.padStart(4)} ` + classes.map(([n]) => n.padStart(15)).join(''));
for (const k of ks) {
  const row: string[] = [];
  for (const [, pick] of classes) {
    let slain = 0, tot = 0;
    for (const seed of SEEDS) {
      const r = runDynamic(200, DAYS, pick, seed);
      // re-run capturing per-day SLAIN at this k
      const rand = lcg(seed + 200 * 7919);
      let state = genesisState(1); let prevCombo: Record<string, number> = {}; let s = 0;
      for (let d = 1; d <= DAYS; d++) {
        const subs: Submission[] = [];
        for (let i = 0; i < 200; i++) { const c = pick(i, { N: 200, state, prevCombo, rand }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
        const res = resolveDay(d, state, subs);
        if (res.totalDamage >= k * res.n) s++;
        prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
        state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
      }
      slain += s / DAYS; tot++;
    }
    row.push(`${((slain / tot) * 100).toFixed(0)}%`.padStart(15));
  }
  line(`  ${String(k).padStart(4)} ` + row.join(''));
}
line('\n  READING: a defensible k needs TRIVIAL rules low (herd/random/blind/top5) and');
line('  READING rules high. Find the k where the trivial columns collapse and the');
line('  reader columns stay high.\n');

line('--- C. per-player steady across N (reader vs top5), 3 seeds ---');
line(`  ${'N'.padStart(6)} ${'top5 min/med/max'.padStart(20)} ${'reader min/med/max'.padStart(22)}`);
for (const N of [50, 100, 200, 500, 1000]) {
  const t = [1, 42, 90210].map((s) => runDynamic(N, DAYS, top5Pick, s).steady).sort((a, b) => a - b);
  const r = [1, 42, 90210].map((s) => runDynamic(N, DAYS, readerPick, s).steady).sort((a, b) => a - b);
  line(`  ${String(N).padStart(6)} ${`${fmt(t[0])}/${fmt(t[1])}/${fmt(t[2])}`.padStart(20)} ${`${fmt(r[0])}/${fmt(r[1])}/${fmt(r[2])}`.padStart(22)}`);
}
line('  => if reader >> top5 at every N, there is room for a k between them.\n');
line('Done.');
