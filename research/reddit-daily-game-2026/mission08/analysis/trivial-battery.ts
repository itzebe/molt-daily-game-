/**
 * MISSION 08 — DECISIVE ROBUSTNESS: can any BEAST-IGNORING rule reach 29? [SIM]/[ENGINE]
 *
 * The k=29 recommendation rests on the claim that no rule which ignores the beast's
 * state can reach ~29. This script attacks that claim with a battery of semi-trivial
 * rules that a non-reading player could plausibly use, across N and seeds.
 *
 * If any beast-ignoring rule reaches 29, k=29 is NOT robust and k=30 is required.
 *
 * State evolves under k=30 (the strictest candidate) so the state is realistic.
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, TOOLS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission, type DayResolution } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(2);
type Ctx = { N: number; state: BeastState; prevCombo: Record<string, number>; rand: () => number };
type Pick = (i: number, c: Ctx) => Combo;

// --- a battery of BEAST-IGNORING rules (none consults state.zoneState) ---
const STATIC_RANKED = rankedByBase(genesisState(1)); // rank by genesis base, fixed forever
const R: Record<string, Pick> = {
  herdObvious: (i, c) => COMBOS[obviousIdx(c.state)],            // "click the obvious" (reads only which zone is biggest, not state)
  uniformRandom: (i, c) => COMBOS[Math.floor(c.rand() * N_COMBOS)],
  cycleAll15: (i) => COMBOS[i % N_COMBOS],
  staticTop5: (i) => COMBOS[STATIC_RANKED[i % 5]],               // spread over top-5 genesis combos, fixed
  staticTop8: (i) => COMBOS[STATIC_RANKED[i % 8]],
  allCleave: (i) => ({ zone: ZONES[i % 5], tool: 'cleave' as const }),  // always cleave, spread zones
  allPierce: (i) => ({ zone: ZONES[i % 5], tool: 'pierce' as const }),
  allBurn: (i) => ({ zone: ZONES[i % 5], tool: 'burn' as const }),
  zoneSpread: (i) => ({ zone: ZONES[i % 5], tool: TOOLS[(i / 5) % 3 | 0] as any }), // even over 15 but ordered by zone
};
// --- state-reading controls (for the upper bound) ---
const SR: Record<string, Pick> = {
  top5StateRead: (i, c) => COMBOS[rankedByBase(c.state)[i % 5]],
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
const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];

line('================================================================');
line('MISSION 08 — DECISIVE ROBUSTNESS: can a beast-ignoring rule reach 29?');
line('================================================================');
line('State evolves under k=30; steady = mean per-player last 20 days; 9 seeds. [SIM]/[ENGINE]\n');

const Ns = [25, 50, 100, 200, 500, 1000, 2000];
line('--- beast-ignoring rules: MAX steady across seeds, per N ---');
line(`  ${'rule'.padStart(14)} ` + Ns.map((n) => String(n).padStart(7)).join('') + '   globalMax');
const maxIgn: Record<string, number> = {};
for (const name of Object.keys(R)) {
  const row = Ns.map((N) => { const v = SEEDS.map((s) => run(N, R[name], 30, s).steady); return Math.max(...v); });
  maxIgn[name] = Math.max(...row);
  line(`  ${name.padStart(14)} ` + row.map((x) => fmt(x).padStart(7)).join('') + `   ${fmt(maxIgn[name])}`);
}
line();
line('--- state-reading control ---');
for (const name of Object.keys(SR)) {
  const row = Ns.map((N) => { const v = SEEDS.map((s) => run(N, SR[name], 30, s).steady); return Math.min(...v); });
  line(`  ${name.padStart(14)} ` + row.map((x) => fmt(x).padStart(7)).join('') + `   min=${fmt(Math.min(...row))}`);
}
line();
const globalMaxIgn = Math.max(...Object.values(maxIgn));
const worstRule = Object.entries(maxIgn).sort((a, b) => b[1] - a[1])[0];
line(`--- VERDICT ---`);
line(`  highest beast-ignoring steady across ALL rules, N and seeds: ${fmt(globalMaxIgn)} (${worstRule[0]})`);
line(`  => k must exceed ${fmt(globalMaxIgn)} to defeat EVERY beast-ignoring rule.`);
line(`     smallest such integer k = ${Math.floor(globalMaxIgn) + 1}`);
line(`  k=29 defeats all beast-ignoring rules: ${globalMaxIgn < 29 ? 'YES' : 'NO'}`);
line(`  k=30 defeats all beast-ignoring rules: ${globalMaxIgn < 30 ? 'YES' : 'NO'}`);
line('\nDone.');
