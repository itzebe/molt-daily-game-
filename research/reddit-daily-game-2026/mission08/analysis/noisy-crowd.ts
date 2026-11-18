/**
 * MISSION 08 — REALISTIC NOISY CROWD. [SIM]/[ENGINE]
 *
 * The deterministic top5 "spread" is a lockstep coordination: all readers pick the
 * same 5 combos in the same proportions. A REAL crowd is noisy. This models readers
 * who pick among the beast's weak points with noise (so some overlap into the herd
 * band), which LOWERS the achieved per-player — the honest estimate of what a real
 * state-reading crowd can do.
 *
 * Reports the SLAIN rate for k=27/29/30 as a function of the reader fraction, on a
 * fine grid, N in {100, 500, 1000}. State evolves under each k.
 *
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission, type DayResolution } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);
type Ctx = { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number };
type Pick = (i: number, c: Ctx) => Combo;

const herd: Pick = (i, c) => COMBOS[obviousIdx(c.state)];

/** noisy state-reader: sample a combo with weight ∝ base^T (T = sharpness) over ALL 15. */
function noisyReader(T: number): Pick {
  return (i, c) => {
    const w: number[] = []; let tot = 0;
    for (const cc of COMBOS) { const v = Math.pow(baseOf(cc, c.state), T); w.push(v); tot += v; }
    let u = c.rand() * tot;
    for (let x = 0; x < N_COMBOS; x++) { u -= w[x]; if (u <= 0) return COMBOS[x]; }
    return COMBOS[0];
  };
}
function mix(f: number, reader: Pick): Pick {
  return (i, c) => (c.rand() < f ? reader(i, c) : herd(i, c));
}

function run(N: number, pick: Pick, k: number, seed: number, days = 150) {
  const r = lcg(seed + N * 131);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  const per: number[] = []; let slain = 0;
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand: r }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    per.push(res.totalDamage / res.n);
    const target = k * res.n;
    const outcome: 'SLAIN' | 'ESCAPED' = res.n > 0 && res.totalDamage >= target ? 'SLAIN' : 'ESCAPED';
    if (outcome === 'SLAIN') slain++;
    const res2: DayResolution = { ...res, integrity: target, outcome };
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res2, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return { steady: per.slice(-20).reduce((a, b) => a + b, 0) / 20, slain: slain / days };
}
const SEEDS = [1, 7, 42, 1234, 90210];
const meanSteady = (N: number, pick: Pick, k: number) => SEEDS.reduce((a, s) => a + run(N, pick, k, s).steady, 0) / 5;
const meanSlain = (N: number, pick: Pick, k: number) => SEEDS.reduce((a, s) => a + run(N, pick, k, s).slain, 0) / 5;

line('================================================================');
line('MISSION 08 — REALISTIC NOISY CROWD');
line('================================================================');
line('Frozen engine; 150 days; state evolves under k; 5 seeds. [SIM]/[ENGINE]\n');

line('--- A. steady per-player of a PURE noisy-reader crowd (sharpness T) ---');
line(`  ${'T'.padStart(4)} ` + [100, 500, 1000].map((n) => `N=${n}`.padStart(8)).join('') + '   (T=2 mild, T=4 sharp, T=8 near-deterministic)');
for (const T of [1, 2, 3, 4, 6, 8]) {
  const row = [100, 500, 1000].map((N) => fmt(meanSteady(N, noisyReader(T), 30)).padStart(8));
  line(`  ${String(T).padStart(4)} ` + row.join(''));
}
line('  => the ACHIEVABLE shared-goal ceiling for a realistic reader crowd.\n');

line('--- B. SLAIN% vs reader fraction (noisy reader, T=3) ---');
const reader = noisyReader(3);
for (const k of [27, 29, 30]) {
  line(`  k=${k}:  ${'frac'.padStart(6)} ${'N=100'.padStart(8)} ${'N=500'.padStart(8)} ${'N=1000'.padStart(8)}`);
  for (let f = 0; f <= 1.0001; f += 0.1) {
    const cell = (N: number) => `${(meanSlain(N, mix(f, reader), k) * 100).toFixed(0)}%`.padStart(8);
    line(`         ${f.toFixed(1).padStart(6)} ${cell(100)} ${cell(500)} ${cell(1000)}`);
  }
}
line('  => a smooth difficulty curve; the 50% crossing is the practical difficulty.\n');
line('Done.');
