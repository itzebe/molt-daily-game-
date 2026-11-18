/**
 * MISSION 08 — DYNAMIC (multi-day) INTEGRITY TEST. [SIM]/[ENGINE]
 *
 * The critical correction to Mission 07: ceilings measured on a FIXED state are not
 * the whole story, because the beast's state is ENDOGENOUS — it evolves from the
 * community's own play via molt(). This runs a fixed community strategy for many days
 * through the FROZEN engine (resolveDay + molt) and measures the LONG-RUN per-player
 * damage and SLAIN rate under the current sqrt formula and linear k=27 / k=30.
 *
 * A strategy "beats the shared goal" if the long-run per-player damage >= k.
 *
 * Deterministic per seed (disclosed). [SIM] + [ENGINE].
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, allExposed, baseOf, obviousIdx, rankedByBase, lcg,
  crowdFactor, integritySqrt, integrityK27, integrityK30, type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);

// ---- strategies (each maps (i, ctx) -> combo) ----
interface Ctx { i: number; N: number; state: BeastState; prevComboShare: Record<string, number>; rand: () => number; }
type Strat = { name: string; pick: (c: Ctx) => Combo };

const herdIdx = (st: BeastState) => obviousIdx(st);
const STRATS: Strat[] = [
  { name: 'random', pick: (c) => COMBOS[Math.floor(c.rand() * N_COMBOS)] },
  { name: 'blindDispersion', pick: (c) => COMBOS[c.i % N_COMBOS] },
  { name: 'top5Spread', pick: (c) => { const r = rankedByBase(c.state); return COMBOS[r[c.i % 5]]; } },
  { name: 'herdObvious', pick: (c) => COMBOS[herdIdx(c.state)] },
  { name: 'rightTool', pick: (c) => {
      const z = ZONES[c.i % 5];
      let bt = TOOLS[0], bv = -1;
      for (const t of TOOLS) { const v = baseOf({ zone: z, tool: t }, c.state); if (v > bv) { bv = v; bt = t; } }
      return { zone: z, tool: bt };
    } },
  // crowd-reader: best response to yesterday's realised combo shares (naive persistence)
  { name: 'readerPersist', pick: (c) => {
      let best = COMBOS[0], bv = -1;
      for (const cc of COMBOS) {
        const pred = c.prevComboShare[`${cc.zone}:${cc.tool}`] ?? 1 / N_COMBOS;
        const v = baseOf(cc, c.state) * crowdFactor(pred).factor;
        if (v > bv) { bv = v; best = cc; }
      }
      return best;
    } },
  // coordinated minority: a fixed bloc always hits a NEGLECTED high-base zone (gut:pierce if raw else crown:cleave)
  { name: 'coordMinority', pick: (c) => {
      // choose the highest-base combo that had the LOWEST share yesterday
      let best = COMBOS[0], bv = -Infinity;
      for (const cc of COMBOS) {
        const share = c.prevComboShare[`${cc.zone}:${cc.tool}`] ?? 0;
        const v = baseOf(cc, c.state) * (1 - share);
        if (v > bv) { bv = v; best = cc; }
      }
      return best;
    } },
];

function runStrategy(N: number, days: number, strat: Strat, seed: number) {
  const rand = lcg(seed + N);
  let state = genesisState(1);
  let prevComboShare: Record<string, number> = {};
  let prevZoneShare: Record<string, number> = {};
  let slainSqrt = 0, slain27 = 0, slain30 = 0;
  const perHist: number[] = [];
  const stateHist: string[] = [];
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) {
      const c = strat.pick({ i, N, state, prevComboShare, rand });
      subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } });
    }
    const res = resolveDay(d, state, subs);
    const per = res.totalDamage / res.n;
    perHist.push(per);
    // record state signature
    stateHist.push(ZONES.map((z) => state.zoneState[z][0]).join('') + (state.mutated ? 'M' : ''));
    if (res.totalDamage >= integritySqrt(res.n)) slainSqrt++;
    if (res.totalDamage >= integrityK27(res.n)) slain27++;
    if (res.totalDamage >= integrityK30(res.n)) slain30++;
    prevComboShare = {};
    for (const k of Object.keys(res.aggregate.comboCount)) prevComboShare[k] = res.aggregate.comboCount[k] / res.n;
    prevZoneShare = res.zoneShare;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  const meanPer = perHist.reduce((a, b) => a + b, 0) / perHist.length;
  const last10 = perHist.slice(-10);
  const steadyPer = last10.reduce((a, b) => a + b, 0) / last10.length;
  return { meanPer, steadyPer, slainSqrt: slainSqrt / days, slain27: slain27 / days, slain30: slain30 / days, stateHist };
}

line('================================================================');
line('MISSION 08 — DYNAMIC (multi-day) INTEGRITY TEST');
line('================================================================');
line('Frozen engine; state evolves via molt(); 120 days; genesis start. [SIM]/[ENGINE]\n');
line('steady = mean per-player damage over the last 10 days (the reached equilibrium).');
line('SLAIN rate = fraction of days cleared under each formula.\n');

const DAYS = 120;
for (const N of [50, 200, 1000]) {
  line(`########## N=${N} ##########`);
  line(`  ${'strategy'.padStart(16)} ${'mean/pl'.padStart(8)} ${'steady/pl'.padStart(10)} ${'sqrt SLAIN'.padStart(11)} ${'k27 SLAIN'.padStart(10)} ${'k30 SLAIN'.padStart(10)} ${'final state'.padStart(12)}`);
  for (const s of STRATS) {
    const r = runStrategy(N, DAYS, s, 20261119);
    line(`  ${s.name.padStart(16)} ${fmt(r.meanPer).padStart(8)} ${fmt(r.steadyPer).padStart(10)} ${((r.slainSqrt) * 100).toFixed(0).padStart(10)}% ${((r.slain27) * 100).toFixed(0).padStart(9)}% ${((r.slain30) * 100).toFixed(0).padStart(9)}% ${r.stateHist[r.stateHist.length - 1].padStart(12)}`);
  }
  line();
}
line('READING:');
line('  - Under the current sqrt formula, SLAIN rate RISES with N for every strategy');
line('    (turnout dominance) -> large subs auto-win even by herding.');
line('  - Under linear k, SLAIN rate is ~independent of N for a fixed strategy ->');
line('    the outcome depends on the strategy, not turnout. This is the structural fix.');
line('  - If a TRIVIAL strategy (blindDispersion/top5Spread/herd) shows ~100% SLAIN');
line('    under k, that k is too low (the trivial rule still wins the shared goal).');
line('  - If NO strategy clears k, that k is too high (unwinnable).');
line('\nDone.');
