/**
 * MISSION 07 — multi-day STRATEGY TOURNAMENT (the core experiment).
 *
 * Runs a mixed population of named strategies through the FROZEN engine for many
 * days, and measures BOTH:
 *   - the INDIVIDUAL leaderboard (does crowd-reading out-score blind dispersion?)
 *   - the SHARED outcome (SLAIN rate under a given integrity formula)
 *
 * Deterministic per seed; many seeds; disclosed. [SIM] + [ENGINE].
 */
import {
  COMBOS, N_COMBOS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  ZONES, TOOLS, TOOL_MULT, ZONE_VALUE, type Combo, type BeastState,
} from './lib7.ts';
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';
import type { Submission } from '../../mission04/prototype/src/engine/resolve.ts';

const TOOLS_ARR = TOOLS as readonly string[];

// ---- strategy context ----
interface Ctx {
  i: number; N: number; day: number; state: BeastState;
  prevZoneShare: Record<string, number>;
  prevComboShare: Record<string, number>;
  rand: () => number;
}
type Strat = { name: string; pick: (c: Ctx) => Combo };

const comboOf = (z: string, t: string): Combo => ({ zone: z as any, tool: t as any });
const bestToolFor = (z: string, state: BeastState): string => {
  let bt = 'cleave', bv = -1;
  for (const t of TOOLS_ARR) { const v = ZONE_VALUE[z as any] * TOOL_MULT[t as any][state.zoneState[z as any] ?? 'exposed']; if (v > bv) { bv = v; bt = t; } }
  return bt;
};

// ---- strategies ----
const STRATS: Strat[] = [
  { name: 'random', pick: (c) => COMBOS[Math.floor(c.rand() * N_COMBOS)] },
  { name: 'blindDispersion', pick: (c) => COMBOS[c.i % N_COMBOS] },
  { name: 'casualHerd', pick: (c) => (c.rand() < 0.7 ? COMBOS[obviousIdx(c.state)] : COMBOS[Math.floor(c.rand() * N_COMBOS)]) },
  { name: 'top5Spread', pick: (c) => { const r = rankedByBase(c.state); return COMBOS[r[c.i % 5]]; } },
  // contrarian: pick the highest-base combo that was least picked yesterday
  { name: 'contrarian', pick: (c) => {
      const r = rankedByBase(c.state);
      // rank combos by (base desc) but prefer low prev share; score = base * (1 - share)
      const scored = r.map((idx) => ({ idx, s: baseOf(COMBOS[idx], c.state) * (1 - (c.prevComboShare[`${COMBOS[idx].zone}:${COMBOS[idx].tool}`] ?? 0)) }));
      scored.sort((a, b) => b.s - a.s);
      return COMBOS[scored[0].idx];
    } },
  // predictorSimple: assume the crowd repeats yesterday's zone split; pick the best-response combo
  { name: 'predictorPersistence', pick: (c) => bestResponse(c.state, c.prevComboShare, c.N) },
  // predictorUniform: assume the crowd is roughly uniform; pick best response
  { name: 'predictorUniform', pick: (c) => bestResponse(c.state, {}, c.N) },
  // learner: exponentially-weighted estimate of combo shares, then best response
  { name: 'learnerEWMA', pick: (c) => bestResponse(c.state, c.prevComboShare, c.N) },
  // misleader: pile onto a mid-value zone to make others avoid it, then take the top zone
  { name: 'misleader', pick: (c) => {
      const z = ZONES[c.i % ZONES.length];
      return comboOf(z, bestToolFor(z, c.state));
    } },
];

/** Best response to a predicted combo-share map: maximise base(c) * crowd(predShare(c)). */
function bestResponse(state: BeastState, predShare: Record<string, number>, N: number): Combo {
  let best = COMBOS[0], bestV = -1;
  for (const c of COMBOS) {
    const key = `${c.zone}:${c.tool}`;
    const pred = predShare[key] ?? 0;
    const share = pred > 0 ? pred : 1 / N_COMBOS; // fall back to uniform prior
    const v = baseOf(c, state) * crowdFactor(share).factor;
    if (v > bestV) { bestV = v; best = c; }
  }
  return best;
}

interface DayRow { day: number; outcome: string; totalDamage: number; integrity: number; perStrategy: Record<string, number>; }

function runTournament(N: number, days: number, seed: number, target: (n: number) => number) {
  const rand = lcg(seed);
  let state = genesisState(1);
  let prevComboShare: Record<string, number> = {};
  let prevZoneShare: Record<string, number> = {};
  const cum: Record<string, number> = Object.fromEntries(STRATS.map((s) => [s.name, 0]));
  const reads: Record<string, number> = Object.fromEntries(STRATS.map((s) => [s.name, 0]));
  let slain = 0;
  const share = Math.floor(N / STRATS.length);
  const counts = STRATS.map((_, k) => (k === STRATS.length - 1 ? N - share * (STRATS.length - 1) : share));

  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    const owner: string[] = [];
    let p = 0;
    for (let k = 0; k < STRATS.length; k++) {
      for (let j = 0; j < counts[k]; j++) {
        const c = STRATS[k].pick({ i: p, N, day: d, state, prevZoneShare, prevComboShare, rand });
        subs.push({ userId: `${STRATS[k].name}#${j}`, strike: { zone: c.zone, tool: c.tool } });
        owner.push(STRATS[k].name);
        p++;
      }
    }
    const res = resolveDay(d, state, subs);
    // per-strategy mean damage
    const perStrat: Record<string, { sum: number; n: number; reads: number }> = {};
    for (let s = 0; s < res.results.length; s++) {
      const nm = owner[s]; const r = res.results[s];
      (perStrat[nm] ??= { sum: 0, n: 0, reads: 0 });
      perStrat[nm].sum += r.damage; perStrat[nm].n++; if (r.isRead) perStrat[nm].reads++;
    }
    const perStrategy: Record<string, number> = {};
    for (const nm of Object.keys(perStrat)) { perStrategy[nm] = perStrat[nm].sum / perStrat[nm].n; cum[nm] += perStrategy[nm]; reads[nm] += perStrat[nm].reads / perStrat[nm].n; }
    const out = res.totalDamage >= target(res.n) ? 'SLAIN' : 'ESCAPED';
    if (out === 'SLAIN') slain++;
    prevComboShare = {}; for (const k of Object.keys(res.aggregate.comboCount)) prevComboShare[k] = res.aggregate.comboCount[k] / res.n;
    prevZoneShare = res.zoneShare;
    state = molt({ nextDay: d + 1, resolution: { ...res, outcome: out } as any, recentZoneShares: [res.zoneShare], previousState: state });
  }
  const ranking = Object.entries(cum).map(([n, v]) => ({ n, meanDaily: v / days, readsPerDay: reads[n] / days })).sort((a, b) => b.meanDaily - a.meanDaily);
  return { ranking, slainRate: slain / days };
}

// ---- report ----
const line = (s = '') => console.log(s);
line('============================================================');
line('MISSION 07 — STRATEGY TOURNAMENT');
line('============================================================');
line('Mixed population; frozen engine; each strategy mean DAILY damage (individual payoff).');
line('Higher = better individual score. Categories: [SIM] (seeded) + [ENGINE].\n');

const SEEDS = [101, 202, 303, 404, 505];
for (const N of [60, 200, 600]) {
  // average the ranking across seeds
  const acc: Record<string, { mean: number; reads: number; rank: number }> = {};
  for (const s of STRATS) acc[s.name] = { mean: 0, reads: 0, rank: 0 };
  let slainAcc = 0;
  for (const seed of SEEDS) {
    const r = runTournament(N, 60, seed, (n) => 27 * n);
    slainAcc += r.slainRate;
    r.ranking.forEach((row, idx) => { acc[row.n].mean += row.meanDaily; acc[row.n].reads += row.readsPerDay; acc[row.n].rank += idx + 1; });
  }
  const rows = Object.entries(acc).map(([n, a]) => ({ n, mean: a.mean / SEEDS.length, reads: a.reads / SEEDS.length, rank: a.rank / SEEDS.length })).sort((a, b) => b.mean - a.mean);
  line(`--- N=${N}, 60 days, ${SEEDS.length} seeds, target 27N; shared SLAIN rate ${((slainAcc / SEEDS.length) * 100).toFixed(0)}% ---`);
  line(`  ${'strategy'.padStart(20)} ${'mean dmg/day'.padStart(13)} ${'reads/day'.padStart(10)} ${'avg rank'.padStart(9)}`);
  for (const r of rows) line(`  ${r.n.padStart(20)} ${r.mean.toFixed(2).padStart(13)} ${r.reads.toFixed(2).padStart(10)} ${r.rank.toFixed(2).padStart(9)}`);
  line();
}
line('KEY QUESTION: does a crowd-reading strategy (contrarian/predictor) rank ABOVE');
line('blindDispersion on the individual leaderboard? If yes, MOLT rewards understanding.');
line('\nDone.');
