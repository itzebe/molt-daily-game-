/**
 * MISSION 07 — COGNITIVE-DEPTH TOURNAMENT (does deeper reasoning win?).
 *
 * A cognitive hierarchy (Camerer-style): level-k players best-respond to a belief
 * that everyone else is level-(k-1). This is the standard test for whether a game
 * rewards thinking one step further than the crowd.
 *
 * Also runs an ITERATED best-response population (each player moves to the best
 * response to yesterday's realised shares) to find whether self-interested play
 * converges to a stable, non-trivial equilibrium.
 *
 * Deterministic per seed; disclosed. [SIM] + [PROOF] (level payoffs are exact).
 */
import {
  COMBOS, N_COMBOS, baseOf, obviousIdx, lcg, crowdFactor, type Combo, type BeastState,
} from './lib7.ts';
import { allExposed } from './lib7.ts';

const state: BeastState = allExposed;
const line = (s = '') => console.log(s);
const idxOf = (c: Combo) => COMBOS.findIndex((x) => x.zone === c.zone && x.tool === c.tool);

/** damage of one player on `combo` when the crowd (incl. them) has `counts`. */
function payoff(combo: Combo, counts: number[], N: number): number {
  const share = (counts[idxOf(combo)] + 1) / (N + 1);
  return Math.round(baseOf(combo, state) * crowdFactor(share).factor);
}
/** best response given a *predicted* share vector (the player's belief about others). */
function bestResponse(pred: number[]): Combo {
  let best = COMBOS[0], bv = -1;
  for (let i = 0; i < N_COMBOS; i++) { const v = baseOf(COMBOS[i], state) * crowdFactor(pred[i]).factor; if (v > bv) { bv = v; best = COMBOS[i]; } }
  return best;
}
/** run the level-k recursion: L0 = uniform prior; L_{k} = BR to L_{k-1}'s induced share. */
function levelCombo(k: number, N: number): { combo: Combo; inducedShare: number[] } {
  let belief = new Array(N_COMBOS).fill(1 / N_COMBOS); // L0 = uniform
  let combo = bestResponse(belief);
  for (let lvl = 1; lvl <= k; lvl++) {
    // if the population all played `combo`, its share = 1
    const induced = new Array(N_COMBOS).fill(0);
    // a single level-l player expects others at level l-1: model the crowd as
    // mixing (l-1) uniformly-uncertain: use a small mass on `combo` and spread the rest
    // Simplest honest model: belief = half on the previous BR, half uniform.
    induced[idxOf(combo)] = 0.5; for (let i = 0; i < N_COMBOS; i++) induced[i] += 0.5 / N_COMBOS;
    belief = induced;
    combo = bestResponse(belief);
  }
  return { combo, inducedShare: belief };
}

line('============================================================');
line('MISSION 07 — COGNITIVE-DEPTH TOURNAMENT');
line('============================================================');
line('Level-k reasoning. If higher levels score more, MOLT rewards thinking ahead. [PROOF/SIM]\n');

line('--- 1: level-k combo and its payoff vs a mixed crowd (50% previous-BR, 50% uniform) ---');
line(`  ${'level'.padStart(5)} ${'combo'.padStart(16)} ${'base'.padStart(5)} ${'payoff'.padStart(7)}`);
for (let k = 0; k <= 4; k++) {
  const { combo } = levelCombo(k, 1000);
  const counts = new Array(N_COMBOS).fill(Math.floor(1000 * 0.5 / N_COMBOS));
  counts[idxOf(combo)] += 500;
  line(`  ${String(k).padStart(5)} ${(combo.zone + ':' + combo.tool).padStart(16)} ${String(baseOf(combo, state)).padStart(5)} ${String(payoff(combo, counts, 1000)).padStart(7)}`);
}

line('\n--- 2: iterated best-response population (everyone moves to BR of yesterday) ---');
line('  Each of N players moves to the best response to the previous day\'s realised');
line('  shares. Report the trajectory and the fixed point.');
for (const N of [100, 400, 1000]) {
  const counts = new Array(N_COMBOS).fill(0);
  const rand = lcg(77 + N);
  for (let i = 0; i < N; i++) counts[Math.floor(rand() * N_COMBOS)]++;
  let traj: number[] = [];
  let stable = 0;
  for (let iter = 0; iter < 300; iter++) {
    const shares = counts.map((k) => k / N);
    // best response for a player currently on the worst combo
    let fromIdx = -1, fromPay = Infinity;
    for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) { const p = Math.round(baseOf(COMBOS[i], state) * crowdFactor(counts[i] / N).factor); if (p < fromPay) { fromPay = p; fromIdx = i; } }
    let toIdx = 0, toPay = -1;
    for (let j = 0; j < N_COMBOS; j++) { const p = Math.round(baseOf(COMBOS[j], state) * crowdFactor((counts[j] + 1) / N).factor); if (p > toPay) { toPay = p; toIdx = j; } }
    if (fromIdx >= 0 && toPay > fromPay) { counts[fromIdx]--; counts[toIdx]++; stable = 0; } else stable++;
    if (iter % 20 === 0 || stable > 5) {
      const total = COMBOS.reduce((a, c, i) => a + counts[i] * Math.round(baseOf(c, state) * crowdFactor(counts[i] / N).factor), 0);
      traj.push(total / N);
    }
    if (stable > 5) break;
  }
  const total = COMBOS.reduce((a, c, i) => a + counts[i] * Math.round(baseOf(c, state) * crowdFactor(counts[i] / N).factor), 0);
  const reads = COMBOS.reduce((a, c, i) => a + ((crowdFactor(counts[i] / N).label === 'read' && baseOf(c, state) >= baseOf(c, state)) ? counts[i] : 0), 0);
  line(`  N=${String(N).padStart(4)}: converges in ${traj.length} samples; fixed-point agg/player=${(total / N).toFixed(2)}; trajectory ${traj.slice(0, 8).map((x) => x.toFixed(1)).join(' -> ')}`);
}
line('  => If the fixed point is a stable, non-trivial mix (not 1 combo, not uniform),');
line('     the individual game has a real strategic equilibrium above blind dispersion.');

line('\n--- 3: exploitability of the fixed point (can one player beat it?) ---');
{
  const N = 1000;
  const counts = new Array(N_COMBOS).fill(0);
  const rand = lcg(2026);
  for (let i = 0; i < N; i++) counts[Math.floor(rand() * N_COMBOS)]++;
  let moved = true;
  while (moved) {
    moved = false;
    let fromIdx = -1, fromPay = Infinity;
    for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) { const p = Math.round(baseOf(COMBOS[i], state) * crowdFactor(counts[i] / N).factor); if (p < fromPay) { fromPay = p; fromIdx = i; } }
    let toIdx = 0, toPay = -1;
    for (let j = 0; j < N_COMBOS; j++) { const p = Math.round(baseOf(COMBOS[j], state) * crowdFactor((counts[j] + 1) / N).factor); if (p > toPay) { toPay = p; toIdx = j; } }
    if (fromIdx >= 0 && toPay > fromPay) { counts[fromIdx]--; counts[toIdx]++; moved = true; }
  }
  const crowdMean = COMBOS.reduce((a, c, i) => a + counts[i] * Math.round(baseOf(c, state) * crowdFactor(counts[i] / N).factor), 0) / N;
  let best = 0, bestC = COMBOS[0];
  for (let j = 0; j < N_COMBOS; j++) { const p = Math.round(baseOf(COMBOS[j], state) * crowdFactor((counts[j] + 1) / N).factor); if (p > best) { best = p; bestC = COMBOS[j]; } }
  line(`  crowd mean=${crowdMean.toFixed(2)}; best single deviation=${best} on ${bestC.zone}:${bestC.tool}; gain=${(best - crowdMean).toFixed(2)}`);
  const readsN = COMBOS.reduce((a, c, i) => a + ((crowdFactor(counts[i] / N).label === 'read') ? counts[i] : 0), 0);
  line(`  read-band players at the fixed point: ${((readsN / N) * 100).toFixed(1)}%`);
  line('  => gain=0 means it is a Nash equilibrium (self-consistent, unexploitable).');
}
line('\nDone.');
