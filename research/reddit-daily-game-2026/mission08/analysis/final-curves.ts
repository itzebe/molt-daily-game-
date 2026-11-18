/**
 * MISSION 08 — FINAL: clean difficulty curve + even-spread ceiling. [SIM]/[ENGINE]
 *
 * (A) EVEN-SPREAD CEILING: the maximum steady per-player achievable by any rule that
 *     ignores the beast's state, over a fine N grid, 9 seeds, several even-spread
 *     orderings. This sets the hard lower bound for k.
 * (B) DIFFICULTY CURVE: for k in {29,30,31}, the SLAIN rate as a function of the
 *     fraction of the community playing the beast-reading spread (rest lazy), on a
 *     fine fraction grid, 5 seeds, N in {50,200,1000}. Clean monotone curve.
 *
 * State evolves under each k. Deterministic per seed.
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

const top5: Pick = (i, c) => COMBOS[rankedByBase(c.state)[i % 5]];
const herd: Pick = (i, c) => COMBOS[obviousIdx(c.state)];
const G = rankedByBase(genesisState(1));

// even-spread orderings (all ignore state)
const spreads: Record<string, Pick> = {
  cycle15: (i) => COMBOS[i % 15],
  zoneMajor: (i) => ({ zone: ZONES[i % 5], tool: TOOLS[((i / 5) | 0) % 3] }),
  toolMajor: (i) => ({ zone: ZONES[((i / 3) | 0) % 5], tool: TOOLS[i % 3] }),
  shuffledFixed: (i) => COMBOS[(i * 7 + 3) % 15],
  genesisRankedCycle: (i) => COMBOS[G[i % 15]],
};

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
const SEEDS9 = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const SEEDS5 = [1, 7, 42, 1234, 90210];

line('================================================================');
line('MISSION 08 — FINAL: even-spread ceiling + clean difficulty curve');
line('================================================================\n');

line('--- (A) EVEN-SPREAD CEILING (beast-ignoring), MAX over 9 seeds ---');
line(`  ${'N'.padStart(6)} ` + Object.keys(spreads).map((n) => n.slice(0, 9).padStart(10)).join('') + '   max');
let globalMax = 0, globalAt = '';
for (const N of [10, 12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 50, 75, 100, 150, 200, 300, 500, 1000, 2000]) {
  const vals = Object.keys(spreads).map((n) => Math.max(...SEEDS9.map((s) => run(N, spreads[n], 30, s).steady)));
  const m = Math.max(...vals);
  if (m > globalMax) { globalMax = m; globalAt = `N=${N}`; }
  line(`  ${String(N).padStart(6)} ` + vals.map((x) => fmt(x).padStart(10)).join('') + `   ${fmt(m)}`);
}
line(`  => GLOBAL max even-spread steady = ${fmt(globalMax)} at ${globalAt}`);
line(`     => smallest integer k that defeats EVERY even-spread at EVERY N = ${Math.floor(globalMax) + 1}\n`);

line('--- (B) DIFFICULTY CURVE: SLAIN% vs fraction of beast-readers (k=29/30/31) ---');
function fracPick(f: number): Pick { return (i, c) => (c.rand() < f ? top5(i, c) : herd(i, c)); }
for (const k of [29, 30, 31]) {
  line(`  k=${k}:`);
  line(`    ${'frac'.padStart(6)} ${'N=50'.padStart(8)} ${'N=200'.padStart(8)} ${'N=1000'.padStart(8)}`);
  for (let f = 0; f <= 1.0001; f += 0.1) {
    const cell = (N: number) => `${(SEEDS5.reduce((a, s) => a + run(N, fracPick(f), k, s).slain, 0) / 5 * 100).toFixed(0)}%`.padStart(8);
    line(`    ${f.toFixed(1).padStart(6)} ${cell(50)} ${cell(200)} ${cell(1000)}`);
  }
}
line('  => the fraction at which SLAIN crosses 50% is the shared-goal difficulty.\n');
line('Done.');
