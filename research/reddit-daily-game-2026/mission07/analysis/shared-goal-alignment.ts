/**
 * MISSION 07 — SHARED-GOAL ALIGNMENT (can the target reward skill over dispersion?).
 *
 * T6's root cause: the shared pool SUMS damages, and the crowd factor is concave in
 * share, so DISPERSION raises the sum. The individual score rewards READING.
 *
 * This experiment models a 3-TYPE population and measures the aggregate as a
 * function of the mix:
 *   HERD    : all pile on the obvious zone (lazy)
 *   DISPERSE: cycle all 15 combos (a trivial rule — the T6 "exploiter")
 *   SKILLED : play the crowd-reading best response (the self-interested equilibrium)
 *
 * It then finds, for each target coefficient k, what mix is required — so we can see
 * whether ANY k separates the trivial dispersion rule from genuine skill.
 *
 * Deterministic (equilibrium via iterated best response); [SIM] + [PROOF].
 */
import {
  COMBOS, N_COMBOS, baseOf, obviousIdx, lcg, crowdFactor, type BeastState,
} from './lib7.ts';
import { allExposed } from './lib7.ts';

const state: BeastState = allExposed;
const line = (s = '') => console.log(s);

function perPlayer(counts: number[], N: number): number {
  let t = 0;
  for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) t += counts[i] * Math.round(baseOf(COMBOS[i], state) * crowdFactor(counts[i] / N).factor);
  return t / N;
}
function equilCounts(N: number, seed = 7): number[] {
  const rand = lcg(seed + N);
  const c = new Array(N_COMBOS).fill(0);
  for (let i = 0; i < N; i++) c[Math.floor(rand() * N_COMBOS)]++;
  let moved = true;
  while (moved) {
    moved = false;
    let fromIdx = -1, fromPay = Infinity;
    for (let i = 0; i < N_COMBOS; i++) if (c[i] > 0) { const p = Math.round(baseOf(COMBOS[i], state) * crowdFactor(c[i] / N).factor); if (p < fromPay) { fromPay = p; fromIdx = i; } }
    let toIdx = 0, toPay = -1;
    for (let j = 0; j < N_COMBOS; j++) { const p = Math.round(baseOf(COMBOS[j], state) * crowdFactor((c[j] + 1) / N).factor); if (p > toPay) { toPay = p; toIdx = j; } }
    if (fromIdx >= 0 && toPay > fromPay) { c[fromIdx]--; c[toIdx]++; moved = true; }
  }
  return c;
}
/** Build a 3-type mix: h herd, d dispersion, s skilled (fractions summing to 1). */
function mixCounts(N: number, h: number, d: number, s: number): number[] {
  const c = new Array(N_COMBOS).fill(0);
  const nH = Math.round(N * h), nD = Math.round(N * d), nS = N - nH - nD;
  c[obviousIdx(state)] += nH;
  for (let i = 0; i < nD; i++) c[i % N_COMBOS]++;
  if (nS > 0) { const eq = equilCounts(nS); for (let i = 0; i < N_COMBOS; i++) c[i] += eq[i]; }
  return c;
}

line('============================================================');
line('MISSION 07 — SHARED-GOAL ALIGNMENT (3-type model)');
line('============================================================');
line('Aggregate damage/player for a mix of HERD / DISPERSE / SKILLED. Genesis beast. [SIM]/[PROOF]\n');

line('--- the strategy ceilings (exact, N=1000) ---');
const herdC = (() => { const c = new Array(N_COMBOS).fill(0); c[obviousIdx(state)] = 1000; return c; })();
const dispC = (() => { const c = new Array(N_COMBOS).fill(0); for (let i = 0; i < 1000; i++) c[i % N_COMBOS]++; return c; })();
const eqC = equilCounts(1000);
line(`  herd only            ${perPlayer(herdC, 1000).toFixed(2)}`);
line(`  disperse only        ${perPlayer(dispC, 1000).toFixed(2)}   <-- the T6 trivial rule`);
line(`  skilled only (equil) ${perPlayer(eqC, 1000).toFixed(2)}`);
line();

line('--- aggregate as SKILLED fraction rises (rest split 50/50 herd/disperse) ---');
line(`  ${'skilled%'.padStart(9)} ${'agg/player'.padStart(11)}`);
for (const s of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 1.0]) {
  const rest = 1 - s;
  line(`  ${(s * 100).toFixed(0).padStart(9)} ${perPlayer(mixCounts(1000, rest / 2, rest / 2, s), 1000).toFixed(2).padStart(11)}`);
}
line();

line('--- can any k separate the trivial DISPERSE rule from skill? ---');
const cDisp = perPlayer(dispC, 1000), cSkill = perPlayer(eqC, 1000);
line(`  pure disperse = ${cDisp.toFixed(2)};  pure skilled = ${cSkill.toFixed(2)};`);
line(`  => a k in (${cDisp.toFixed(1)}, ${cSkill.toFixed(1)}] makes the SHARED goal fail for`);
line(`     the trivial rule and succeed for skill.  Integer candidates: 30..34.`);
line();
line('--- how much SKILLED fraction does each k require? (mix = herd casuals + skilled) ---');
line(`  ${'k'.padStart(3)} ${'skilled fraction needed'.padStart(24)}`);
for (const k of [27, 29, 30, 31, 32, 33, 34]) {
  let need = 'never';
  for (let s = 0; s <= 1.0001; s += 0.05) { if (perPlayer(mixCounts(1000, 1 - s, 0, s), 1000) >= k) { need = `${(s * 100).toFixed(0)}%`; break; } }
  line(`  ${String(k).padStart(3)} ${need.padStart(24)}`);
}
line('  => k<=29 needs little/no skill. k=31-33 needs a real skilled fraction.');
line('     Trade-off: higher k rewards skill but demands more of it.');
line('\nDone.');
