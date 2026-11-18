/**
 * MISSION 08 — DIFFICULTY CLIFF + RANDOMISING EQUILIBRIUM. [SIM]/[ENGINE]
 *
 * (A) FRACTION-NEEDED CURVE: for each k, what fraction of the community must play the
 *     beast-reading spread (top5) for the shared goal to clear, as a function of N?
 *     This is the decision-relevant "how hard is it" number.
 * (B) RANDOMISING EQUILIBRIUM: a deterministic reader self-defeats by piling on one
 *     combo. A randomising reader spreads over the top combos. Does randomising beat
 *     the deterministic reader, and can it beat top5? (tests whether Mission 07's
 *     static 34.1 equilibrium is realisable dynamically.)
 *
 * State evolves under each k. Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
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
// randomising reader: sample among the top 5 base combos with probability ~uniform,
// but push mass away from yesterday's most-used (a stochastic best response)
function randomReader(i: number, c: Ctx): Combo {
  const ranked = rankedByBase(c.state).slice(0, 8);
  // weight = base * crowdFactor(expected share); approximate share by yesterday's
  let tot = 0; const w: number[] = [];
  for (const j of ranked) { const key = `${COMBOS[j].zone}:${COMBOS[j].tool}`; const sh = c.prevCombo[key] ?? 1 / N_COMBOS; const val = baseOf(COMBOS[j], c.state) * crowdFactor(sh).factor; w.push(val); tot += val; }
  let u = c.rand() * tot;
  for (let x = 0; x < ranked.length; x++) { u -= w[x]; if (u <= 0) return COMBOS[ranked[x]]; }
  return COMBOS[ranked[0]];
}

function run(N: number, pick: Pick, k: number, seed: number, days = 150) {
  const r = lcg(seed + N * 131);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  let slain = 0; const per: number[] = [];
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
  return { slain: slain / days, steady: per.slice(-20).reduce((a, b) => a + b, 0) / 20 };
}
const SEEDS = [1, 42, 90210];
const meanSlain = (N: number, pick: Pick, k: number) => SEEDS.reduce((a, s) => a + run(N, pick, k, s).slain, 0) / SEEDS.length;

line('================================================================');
line('MISSION 08 — DIFFICULTY CLIFF + RANDOMISING EQUILIBRIUM');
line('================================================================');
line('State evolves under each k. 150 days, 3 seeds. [SIM]/[ENGINE]\n');

line('--- (A) FRACTION-NEEDED: fraction of state-readers (rest lazy herd) to clear ---');
function fracPick(f: number): Pick {
  return (i, c) => (c.rand() < f ? top5(i, c) : herd(i, c));
}
line(`  ${'k'.padStart(4)} ${'N=100 need'.padStart(12)} ${'N=500 need'.padStart(12)} ${'N=1000 need'.padStart(12)}  (fraction for SLAIN>=50%)`);
for (const k of [26, 27, 28, 29, 30, 31, 32]) {
  const need = (N: number) => { for (let f = 0; f <= 1.0001; f += 0.05) if (meanSlain(N, fracPick(f), k) >= 0.5) return `${(f * 100).toFixed(0)}%`; return '>100%'; };
  line(`  ${String(k).padStart(4)} ${need(100).padStart(12)} ${need(500).padStart(12)} ${need(1000).padStart(12)}`);
}
line('  => the "fraction needed" is the difficulty of the shared goal. A k needing');
line('     >70-80% skilled play is harsh for a casual subreddit.\n');

line('--- (B) RANDOMISING READER vs DETERMINISTIC READER vs top5 (N=500) ---');
line(`  ${'strategy'.padStart(20)} ${'steady@k27'.padStart(11)} ${'steady@k29'.padStart(11)} ${'steady@k30'.padStart(11)} ${'SLAIN@k30'.padStart(11)}`);
for (const [name, pick] of [['top5 (beast-read)', top5], ['randomReader', randomReader], ['herd (lazy)', herd]] as const) {
  const s27 = SEEDS.reduce((a, s) => a + run(500, pick, 27, s).steady, 0) / 3;
  const s29 = SEEDS.reduce((a, s) => a + run(500, pick, 29, s).steady, 0) / 3;
  const s30 = SEEDS.reduce((a, s) => a + run(500, pick, 30, s).steady, 0) / 3;
  const sl = meanSlain(500, pick, 30);
  line(`  ${name.padStart(20)} ${fmt(s27).padStart(11)} ${fmt(s29).padStart(11)} ${fmt(s30).padStart(11)} ${`${(sl * 100).toFixed(0)}%`.padStart(11)}`);
}
line('  => if randomReader > top5, a sophisticated crowd can do better than the simple');
line('     spread; if not, top5 is effectively the achievable shared-goal ceiling.\n');
line('Done.');
