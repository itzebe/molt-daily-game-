/**
 * MISSION 08 — DYNAMIC CEILING + EXPLOITABILITY. [SIM]/[PROOF]/[ENGINE]
 *
 * The k-sweep showed a naive per-player "reader" LOSES dynamically to a static
 * top-5 spread. Before drawing a conclusion we must bound the real ceiling:
 *
 *  (1) DYNAMIC DP-OPTIMAL: each day, a central planner allocates N strikers to
 *      maximise total damage against the CURRENT state. This is the absolute
 *      upper bound on what ANY coordinated community can do. It also drives the
 *      state (so we measure the reachable dynamic ceiling, not just the genesis one).
 *  (2) EXPLOITABILITY: a single top5Spread / blindDispersion player inside a
 *      non-reading crowd — does a trivial rule out-score the crowd it hides in?
 *  (3) SELF-ORGANISED readers: a mixed population where a fraction best-responds.
 *
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, allExposed, baseOf, obviousIdx, rankedByBase, lcg,
  crowdFactor, bestTotalExact, bestCountsExact, totalOf, type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, damageFor, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);

line('================================================================');
line('MISSION 08 — DYNAMIC CEILING + EXPLOITABILITY');
line('================================================================');
line('Frozen engine; 150 days; state evolves via molt. [SIM]/[PROOF]/[ENGINE]\n');

// ---------- (1) dynamic DP-optimal (central planner) ----------
function runDynamicOptimal(N: number, days: number, seed: number) {
  let state = genesisState(1);
  const perHist: number[] = [];
  const stateHist: string[] = [];
  for (let d = 1; d <= days; d++) {
    const counts = bestCountsExact(N, state);
    const subs: Submission[] = [];
    for (let i = 0; i < N_COMBOS; i++) for (let k = 0; k < counts[i]; k++) subs.push({ userId: `u${i}_${k}`, strike: { zone: COMBOS[i].zone, tool: COMBOS[i].tool } });
    const res = resolveDay(d, state, subs);
    perHist.push(res.totalDamage / res.n);
    stateHist.push(ZONES.map((z) => state.zoneState[z][0]).join(''));
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  const steady = perHist.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, perHist.length);
  return { steady, mean: perHist.reduce((a, b) => a + b, 0) / perHist.length, stateHist };
}

line('--- (1) DYNAMIC DP-OPTIMAL ceiling (central planner) ---');
line(`  ${'N'.padStart(6)} ${'mean/pl'.padStart(8)} ${'steady/pl'.padStart(10)}  final state`);
for (const N of [50, 200, 500, 1000, 2000]) {
  const r = runDynamicOptimal(N, 150, 1);
  line(`  ${String(N).padStart(6)} ${fmt(r.mean).padStart(8)} ${fmt(r.steady).padStart(10)}  ${r.stateHist[r.stateHist.length - 1]}`);
}
line('  => this is the absolute ceiling; no community can exceed it on that day.\n');

// ---------- (2) exploitability of a trivial rule inside a crowd ----------
line('--- (2) EXPLOITABILITY: one trivial player inside a fixed non-reading crowd ---');
line('    crowd = 200 players using herdObvious (or random); the single player uses X.');
function crowdCounts(N: number, pick: (i: number, st: BeastState) => Combo, state: BeastState): number[] {
  const c = new Array(N_COMBOS).fill(0);
  for (let i = 0; i < N; i++) { const cc = pick(i, state); const idx = COMBOS.findIndex((x) => x.zone === cc.zone && x.tool === cc.tool); c[idx]++; }
  return c;
}
function singleVsCrowd(crowdPick: (i: number, st: BeastState) => Combo, soloPick: (st: BeastState) => Combo, crowdN: number, days: number) {
  let state = genesisState(1);
  const solo: number[] = [], crowd: number[] = [];
  for (let d = 1; d <= days; d++) {
    const base = crowdCounts(crowdN, crowdPick, state);
    const soloCombo = soloPick(state);
    const soloIdx = COMBOS.findIndex((x) => x.zone === soloCombo.zone && x.tool === soloCombo.tool);
    const totalN = crowdN + 1;
    const c = base.slice(); c[soloIdx]++;
    const subs: Submission[] = [];
    for (let i = 0; i < N_COMBOS; i++) for (let k = 0; k < c[i]; k++) subs.push({ userId: `u${i}_${k}`, strike: { zone: COMBOS[i].zone, tool: COMBOS[i].tool } });
    const res = resolveDay(d, state, subs);
    // find the solo player's damage
    const soloRes = res.results.find((r) => r.userId === `u${soloIdx}_${c[soloIdx] - 1}`);
    solo.push(soloRes ? soloRes.damage : 0);
    crowd.push(res.totalDamage / totalN);
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return { solo: solo.slice(-20).reduce((a, b) => a + b, 0) / 20, crowd: crowd.slice(-20).reduce((a, b) => a + b, 0) / 20 };
}
{
  const herd = (i: number, st: BeastState) => COMBOS[obviousIdx(st)];
  const rand = (i: number, st: BeastState) => COMBOS[(i * 7 + 3) % N_COMBOS];
  const top5 = (st: BeastState) => { const r = rankedByBase(st); return COMBOS[r[0]]; };
  const disp = (st: BeastState) => COMBOS[0];
  const reader = (st: BeastState) => { let b = COMBOS[0], bv = -1; for (const cc of COMBOS) { const v = baseOf(cc, st) * 1.9; if (v > bv) { bv = v; b = cc; } } return b; };
  const r1 = singleVsCrowd(herd, top5, 200, 150);
  line(`    solo top5 (top base)   vs herd crowd: solo ${fmt(r1.solo)} / crowd ${fmt(r1.crowd)}`);
  const r2 = singleVsCrowd(herd, reader, 200, 150);
  line(`    solo reader(read band) vs herd crowd: solo ${fmt(r2.solo)} / crowd ${fmt(r2.crowd)}`);
  const r3 = singleVsCrowd(rand, top5, 200, 150);
  line(`    solo top5              vs random crowd: solo ${fmt(r3.solo)} / crowd ${fmt(r3.crowd)}`);
  const r4 = singleVsCrowd(rand, reader, 200, 150);
  line(`    solo reader            vs random crowd: solo ${fmt(r4.solo)} / crowd ${fmt(r4.crowd)}`);
}
line('  => if the solo reader >> solo top5, individual reading is rewarded (as Mission 07');
line('     found statically). The shared goal is a SEPARATE question (section 1).\n');

// ---------- (3) self-organised readers (mixed) ----------
line('--- (3) SELF-ORGANISED mixed populations (fraction reading) ---');
line('    a "reader" best-responds to yesterday\'s realised combo shares.');
function mixedRun(N: number, readerFrac: number, days: number, seed: number) {
  const rand = lcg(seed + N);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  const perHist: number[] = [];
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) {
      let c: Combo;
      if (rand() < readerFrac) {
        let best = COMBOS[0], bv = -1;
        for (const cc of COMBOS) { const p = prevCombo[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS; const v = baseOf(cc, state) * crowdFactor(p).factor; if (v > bv) { bv = v; best = cc; } }
        c = best;
      } else { c = COMBOS[obviousIdx(state)]; }
      subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } });
    }
    const res = resolveDay(d, state, subs);
    perHist.push(res.totalDamage / res.n);
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return perHist.slice(-20).reduce((a, b) => a + b, 0) / 20;
}
line(`  ${'readerFrac'.padStart(11)} ${'N=200 steady'.padStart(14)} ${'N=1000 steady'.padStart(15)}`);
for (const f of [0.0, 0.1, 0.2, 0.3, 0.5, 0.8, 1.0]) {
  const a = mixedRun(200, f, 150, 7), b = mixedRun(1000, f, 150, 7);
  line(`  ${f.toFixed(2).padStart(11)} ${fmt(a).padStart(14)} ${fmt(b).padStart(15)}`);
}
line('  => if the steady per-player RISES with reader fraction, reading helps the group;');
line('     if it FALLS, readers herd onto the same combo and hurt each other.\n');
line('Done.');
