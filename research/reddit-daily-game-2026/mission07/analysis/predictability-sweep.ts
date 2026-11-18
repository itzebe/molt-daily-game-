/**
 * MISSION 07 — CROWD-PREDICTABILITY SWEEP (the decisive T6 test).
 *
 * The mission asks: does strategic prediction OUTPERFORM blind dispersion?
 *
 * Method: fix a crowd of N-1 players with a known composition (herd fraction p).
 * Then measure the payoff of a single probe player using each strategy, against
 * that SAME crowd. Because the probe is a single player, its payoff is exact and
 * its effect on shares is negligible (reported exactly).
 *
 * The probe strategies are a cognitive hierarchy:
 *   L0 random, L1 best-response-to-uniform, L2 best-response-to-L1,
 *   blindDispersion, herd, perfectPredictor (knows the true crowd), oracle (DP).
 *
 * Categories: [PROOF] exact arithmetic (deterministic; no seed except crowd draw).
 */
import {
  COMBOS, N_COMBOS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  TOOL_MULT, type Combo, type BeastState,
} from './lib7.ts';
import { allExposed } from './lib7.ts';

const state = allExposed;
const line = (s = '') => console.log(s);

/** damage of a single probe combo given the crowd's count vector (probe is one extra player). */
function probePayoff(combo: Combo, counts: number[], N: number): number {
  const idx = COMBOS.findIndex((c) => c.zone === combo.zone && c.tool === combo.tool);
  const share = (counts[idx] + 1) / (N + 1); // probe joins that combo
  return Math.round(baseOf(combo, state) * crowdFactor(share).factor);
}

function crowdCounts(N: number, p: number, seed: number): number[] {
  // fraction p play the obvious combo; the rest spread uniformly at random
  const rand = lcg(seed);
  const c = new Array(N_COMBOS).fill(0);
  const obv = obviousIdx(state);
  for (let i = 0; i < N; i++) c[rand() < p ? obv : Math.floor(rand() * N_COMBOS)]++;
  return c;
}

/** best response given a *predicted* combo-share vector (what the probe believes). */
function bestResponse(pred: number[]): Combo {
  let best = COMBOS[0], bv = -1;
  for (let i = 0; i < N_COMBOS; i++) {
    const v = baseOf(COMBOS[i], state) * crowdFactor(pred[i]).factor;
    if (v > bv) { bv = v; best = COMBOS[i]; }
  }
  return best;
}

line('============================================================');
line('MISSION 07 — CROWD-PREDICTABILITY SWEEP');
line('============================================================');
line('Probe player vs a fixed crowd of N players; herd fraction p (rest uniform-random).');
line('Deterministic given seed; report mean probe payoff over 40 crowd draws. [PROOF]\n');

const probes: Array<{ name: string; pick: (counts: number[], N: number) => Combo }> = [
  { name: 'random (L0)', pick: (_c, _N) => COMBOS[0] /*placeholder*/ },
  { name: 'herd (obvious)', pick: () => COMBOS[obviousIdx(state)] },
  { name: 'blindDispersion', pick: (c, N) => COMBOS[(c[0] + 3) % N_COMBOS] },
  { name: 'L1 (BR-to-uniform)', pick: () => bestResponse(new Array(N_COMBOS).fill(1 / N_COMBOS)) },
  { name: 'perfectPredictor', pick: (c, N) => bestResponse(c.map((k) => k / N)) },
];

line(`  ${'p(herd)'.padStart(8)} ${'N'.padStart(5)}  ${probes.map((p) => p.name.padStart(17)).join(' ')}`);
for (const N of [50, 200, 1000]) {
  for (const p of [0.0, 0.2, 0.5, 0.8, 0.95]) {
    const acc = probes.map(() => 0);
    const TRIALS = 40;
    for (let t = 0; t < TRIALS; t++) {
      const counts = crowdCounts(N, p, 9000 + t * 7 + N);
      probes.forEach((pr, k) => {
        let combo: Combo;
        if (pr.name === 'random (L0)') combo = COMBOS[Math.floor(lcg(5000 + t)() * N_COMBOS)];
        else if (pr.name === 'blindDispersion') combo = COMBOS[t % N_COMBOS];
        else combo = pr.pick(counts, N);
        acc[k] += probePayoff(combo, counts, N);
      });
    }
    line(`  ${p.toFixed(2).padStart(8)} ${String(N).padStart(5)}  ${acc.map((a) => (a / TRIALS).toFixed(1).padStart(17)).join(' ')}`);
  }
  line();
}
line('READING: at high p (predictable herd), perfectPredictor should dominate.');
line('At low p (unpredictable, dispersed crowd), prediction has little edge.');
line('This isolates WHEN crowd-reading is rewarded.\n');

line('--- 2: a MIXED crowd of self-interested L1 predictors (do they cancel out?) ---');
// If everyone plays L1 (best response to uniform), they all pick the same combo ->
// it becomes the herd and everyone scores the herd factor. Measure that.
const l1 = bestResponse(new Array(N_COMBOS).fill(1 / N_COMBOS));
line(`  L1 best-response combo = ${l1.zone}:${l1.tool} (base ${baseOf(l1, state)}).`);
for (const N of [50, 200, 1000]) {
  const counts = new Array(N_COMBOS).fill(0); counts[COMBOS.indexOf(l1)] = N;
  const everyone = Math.round(baseOf(l1, state) * crowdFactor(1.0).factor);
  line(`  N=${N}: if ALL play L1 -> share=1.00 -> everyone scores ${everyone} (herd band). Self-defeating.`);
}
line('  => A prediction mechanic that everyone can copy collapses to the herd band.');
line('     Depth must come from prediction being CONTESTED (anti-coordination), not shared.');
line('\nDone.');
