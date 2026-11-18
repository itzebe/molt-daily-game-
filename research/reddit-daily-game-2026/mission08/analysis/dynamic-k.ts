/**
 * MISSION 08 — DYNAMIC UNDER EACH CANDIDATE k (methodologically correct). [SIM]/[ENGINE]
 *
 * CORRECTION to the earlier scripts: the beast's state evolves via molt(), and molt()
 * uses the day's OUTCOME for the escape penalty (§3.7). So the state trajectory
 * depends on WHICH integrity formula is in force. This script evolves the state under
 * EACH candidate formula (sqrt, k=27, k=29, k=30, and a sweep) and measures the
 * long-run per-player damage + SLAIN rate for each strategy.
 *
 * Damage is computed by the frozen engine (resolveDay); only the OUTCOME label used by
 * molt is overridden to compare against k*N. This does not modify the engine.
 *
 * Deterministic per (seed, N, strategy, k).
 */
import {
  COMBOS, N_COMBOS, ZONES, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, integrityFor, type Submission, type DayResolution } from '../../mission04/prototype/src/engine/resolve.ts';
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

/** Run days under formula f (a function of n returning the target), returning steady + SLAIN rate. */
function run(N: number, pick: Pick, f: (n: number) => number, seed: number, days = 150) {
  const r = lcg(seed + N * 131);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  const per: number[] = []; let slain = 0;
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand: r }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    per.push(res.totalDamage / res.n);
    const target = f(res.n);
    const outcome: 'SLAIN' | 'ESCAPED' = res.n > 0 && res.totalDamage >= target ? 'SLAIN' : 'ESCAPED';
    if (outcome === 'SLAIN') slain++;
    // feed the OVERRIDDEN outcome into molt so the state evolves under this formula
    const res2: DayResolution = { ...res, integrity: target, outcome };
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res2, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return { steady: per.slice(-20).reduce((a, b) => a + b, 0) / 20, slain: slain / days };
}
const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const medSteady = (N: number, name: string, f: (n: number) => number) => { const v = SEEDS.map((s) => run(N, P[name], f, s).steady).sort((a, b) => a - b); return { min: v[0], med: v[4], max: v[8] }; };
const meanSlain = (N: number, name: string, f: (n: number) => number) => SEEDS.reduce((a, s) => a + run(N, P[name], f, s).slain, 0) / SEEDS.length;

line('================================================================');
line('MISSION 08 — DYNAMIC UNDER EACH CANDIDATE k (state evolves under k)');
line('================================================================');
line('Frozen engine; 150 days; state evolves with the candidate formula\'s outcome. [SIM]/[ENGINE]\n');

const ks: Array<[string, (n: number) => number]> = [['sqrt', integrityFor], ['k=27', (n) => 27 * n], ['k=29', (n) => 29 * n], ['k=30', (n) => 30 * n]];
for (const N of [50, 200, 1000]) {
  line(`########## N=${N} ##########`);
  line(`  ${'formula'.padStart(8)} ` + ['herd', 'top1', 'random', 'blind15', 'top5', 'reader'].map((n) => n.padStart(9)).join(''));
  for (const [fn, f] of ks) {
    const row = ['herd', 'top1', 'random', 'blind15', 'top5', 'reader'].map((n) => fmt(medSteady(N, n, f).med).padStart(9));
    line(`  ${fn.padStart(8)} ` + row.join(''));
  }
  line(`  ${'SLAIN%'.padStart(8)} ` + ['herd', 'top1', 'random', 'blind15', 'top5', 'reader'].map((n) => `${(meanSlain(N, n, integrityFor) * 100).toFixed(0)}%`.padStart(9)).join('') + '  (sqrt)');
  for (const [fn, f] of ks.filter(([n]) => n !== 'sqrt')) {
    line(`  ${(fn + 'S%').padStart(8)} ` + ['herd', 'top1', 'random', 'blind15', 'top5', 'reader'].map((n) => `${(meanSlain(N, n, f) * 100).toFixed(0)}%`.padStart(9)).join(''));
  }
  line();
}

line('--- WINDOW under the correct (state-evolves-under-k) dynamics ---');
line('  k must be > max(trivial steady) and <= min(skilled steady).');
line(`  ${'N'.padStart(6)} ${'maxTrivial'.padStart(11)} ${'minSkilled'.padStart(11)} ${'k_min'.padStart(6)} ${'k_max'.padStart(6)} ${'window'.padStart(10)}`);
for (const N of [25, 50, 100, 200, 300, 500, 750, 1000, 2000]) {
  // find the window using the formula each strategy would face: use k=29 as the probe formula
  // (the steady is fairly insensitive to which k is in force for NON-clearing strategies;
  //  for clearing strategies it matters and is captured by the SLAIN-rate rows above).
  const probe = (n: number) => 29 * n;
  const triv = ['herd', 'top1', 'random', 'blind15'].map((n) => medSteady(N, n, probe).max);
  const skill = ['top5', 'reader'].map((n) => medSteady(N, n, probe).min);
  const mt = Math.max(...triv), ms = Math.min(...skill);
  line(`  ${String(N).padStart(6)} ${fmt(mt).padStart(11)} ${fmt(ms).padStart(11)} ${String(Math.floor(mt) + 1).padStart(6)} ${String(Math.floor(ms)).padStart(6)} ${`${Math.floor(mt) + 1}-${Math.floor(ms)}`.padStart(10)}`);
}
line('\nDone.');
