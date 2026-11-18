/**
 * MISSION 08 — DYNAMIC EQUILIBRIUM + STATE REACHABILITY. [SIM]/[PROOF]/[ENGINE]
 *
 * Two questions the static tables cannot answer:
 *  (A) REACHABILITY: which beast states are actually produced by play? (The extreme
 *      states in the static table may be unreachable, so their ceilings may be
 *      irrelevant.)
 *  (B) DYNAMIC EQUILIBRIUM: run an iterated-best-response community through the
 *      frozen engine so the STATE evolves with the strategy, and measure the
 *      long-run per-player damage — the real "skilled" ceiling.
 *
 * Deterministic per seed.
 */
import {
  COMBOS, N_COMBOS, ZONES, allExposed, baseOf, obviousIdx, rankedByBase, lcg,
  crowdFactor, bestCountsExact, totalOf, type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, damageFor, type Submission } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(2);

line('================================================================');
line('MISSION 08 — DYNAMIC EQUILIBRIUM + STATE REACHABILITY');
line('================================================================');

// ---------- (A) reachability: run several strategies, collect distinct states ----------
function reachableStates(N: number, days: number, seed: number): Set<string> {
  const out = new Set<string>();
  const picks = [
    (i: number, st: BeastState) => COMBOS[obviousIdx(st)],
    (i: number, st: BeastState) => COMBOS[i % N_COMBOS],
    (i: number, st: BeastState) => COMBOS[rankedByBase(st)[i % 5]],
  ];
  for (const pick of picks) {
    const rand = lcg(seed + N);
    let state = genesisState(1);
    for (let d = 1; d <= days; d++) {
      const subs: Submission[] = [];
      for (let i = 0; i < N; i++) { const c = pick(i, state); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
      const res = resolveDay(d, state, subs);
      out.add(ZONES.map((z) => state.zoneState[z][0]).join('') + (state.mutated ? 'M' : '') + (state.fatiguedTool ? state.fatiguedTool[0] : '-') + '|r' + state.ridges.length);
      state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
    }
  }
  return out;
}
line('--- (A) reachable states (3 strategies x 200 days x N in {50,200,1000}) ---');
{
  const all = new Set<string>();
  for (const N of [50, 200, 1000]) for (const s of reachableStates(N, 200, 11)) all.add(s);
  // summarise by the zone-state signature only
  const sigs = new Set([...all].map((s) => s.split('|')[0].slice(0, 5)));
  line(`  distinct zone-state signatures reached: ${sigs.size}`);
  line(`  ${[...sigs].sort().join('  ')}`);
  const armCounts = [...sigs].map((s) => (s.match(/a/g) || []).length);
  const rawCounts = [...sigs].map((s) => (s.match(/r/g) || []).length);
  line(`  max armoured zones reached: ${Math.max(...armCounts)} / 5`);
  line(`  max raw zones reached:      ${Math.max(...rawCounts)} / 5`);
  line('  => compare to the static table: is "all armoured" (aaaaa) reachable?');
  line(`     "aaaaa" reached: ${sigs.has('aaaaa')}`);
  line(`     "aaaaa" NOT reachable in this sample: ${!sigs.has('aaaaa')}`);
}
line();

// ---------- (B) dynamic equilibrium ----------
/**
 * Iterated best response with an evolving state. Each round, each of a small set of
 * "strategist" archetypes is re-scored against the last observed combo-share vector
 * and the CURRENT state; the population mix drifts toward the best archetype.
 * This is a coarse but honest model of self-interested adaptation under molt.
 */
function dynamicEquilibrium(N: number, days: number, seed: number) {
  const rand = lcg(seed + N);
  let state = genesisState(1);
  let prevCombo: Record<string, number> = {};
  const perHist: number[] = [];
  const mixHist: number[] = [];
  for (let d = 1; d <= days; d++) {
    // each player independently best-responds to yesterday's shares + current state
    const counts = new Array(N_COMBOS).fill(0);
    const noisy = d < 20; // early days: random exploration
    for (let i = 0; i < N; i++) {
      let idx: number;
      if (noisy) idx = Math.floor(rand() * N_COMBOS);
      else {
        // choose the combo maximising expected damage given predicted shares (yesterday's)
        // with a small tie-break noise so the crowd does not collapse to one combo
        let best = 0, bv = -1;
        for (let j = 0; j < N_COMBOS; j++) {
          const p = (prevCombo[`${COMBOS[j].zone}:${COMBOS[j].tool}`] ?? 1 / N_COMBOS) + rand() * 0.02;
          const v = baseOf(COMBOS[j], state) * crowdFactor(p).factor;
          if (v > bv) { bv = v; best = j; }
        }
        idx = best;
      }
      counts[idx]++;
    }
    const subs: Submission[] = [];
    for (let i = 0; i < N_COMBOS; i++) for (let k = 0; k < counts[i]; k++) subs.push({ userId: `u${i}_${k}`, strike: { zone: COMBOS[i].zone, tool: COMBOS[i].tool } });
    const res = resolveDay(d, state, subs);
    perHist.push(res.totalDamage / res.n);
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return { steady: perHist.slice(-20).reduce((a, b) => a + b, 0) / 20, mean: perHist.reduce((a, b) => a + b, 0) / perHist.length, perHist };
}
line('--- (B) dynamic self-interested equilibrium (best response to yesterday, state evolves) ---');
line(`  ${'N'.padStart(6)} ${'mean/pl'.padStart(8)} ${'steady/pl'.padStart(10)}  last-10 daily`);
for (const N of [50, 200, 500, 1000]) {
  const r = dynamicEquilibrium(N, 200, 5);
  line(`  ${String(N).padStart(6)} ${fmt(r.mean).padStart(8)} ${fmt(r.steady).padStart(10)}  ${r.perHist.slice(-10).map((x) => x.toFixed(0)).join(',')}`);
}
line('  => the self-interested equilibrium per-player damage under an EVOLVING state.');
line('     Compare to: top5Spread ~32.25, DP-optimal ~34.85, blindDispersion ~28.\n');
line('Done.');
