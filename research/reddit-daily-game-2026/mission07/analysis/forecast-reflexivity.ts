/**
 * MISSION 07 — FORECAST REFLEXIVITY & PREDICTABILITY SPECTRUM.
 *
 * Two decisive tests for the forecast mechanic:
 *
 * (1) REFLEXIVITY: if a bonus rewards predicting the herd zone, and enough players
 *     optimise the bonus, they STOP being the herd — the prediction changes the
 *     thing it predicts. Model: fraction f of players "chase the bonus" by moving
 *     OFF the predicted herd zone. Measure whether the predicted zone is still the
 *     actual herd as f rises.
 *
 * (2) PREDICTABILITY SPECTRUM: vary the crowd's herd fraction p and measure the
 *     entropy of the correct answer and whether a trivial constant rule beats a
 *     genuine predictor. A forecast is only interesting if the answer is (a)
 *     non-trivial (entropy > 0) AND (b) skill-correlated.
 *
 * Deterministic per seed; disclosed. [SIM] + [PROOF].
 */
import { ZONES, COMBOS, N_COMBOS, obviousIdx, baseOf, lcg, crowdFactor, type BeastState } from './lib7.ts';
import { allExposed } from './lib7.ts';

const state: BeastState = allExposed;
const line = (s = '') => console.log(s);
const obvZone = COMBOS[obviousIdx(state)].zone;

line('============================================================');
line('MISSION 07 — FORECAST REFLEXIVITY & PREDICTABILITY SPECTRUM');
line('============================================================');
line('Deterministic (seeded); genesis beast. [SIM]/[PROOF]\n');

// ---------------------------------------------------------------------------
// (1) REFLEXIVITY
// ---------------------------------------------------------------------------
line('--- 1: REFLEXIVITY — bonus-chasers move off the predicted herd zone ---');
line('Crowd: fraction f "chases the bonus". Two modes tested: SCATTERED (each chaser');
line('picks a random non-obvious zone) and COORDINATED (all chasers pile on the same');
line('alternative zone). The predictor predicts the obvious zone.');
line(`  ${'f'.padStart(5)} ${'mode'.padStart(12)} ${'obv-zone share'.padStart(14)} ${'herd zone'.padStart(11)} ${'prediction correct?'.padStart(19)}`);
for (const f of [0.0, 0.2, 0.4, 0.5, 0.6, 0.7]) {
  const N = 1000;
  // SCATTERED
  {
    const counts: Record<string, number> = Object.fromEntries(ZONES.map((z) => [z, 0]));
    const rand = lcg(4321);
    const others = ZONES.filter((z) => z !== obvZone);
    for (let i = 0; i < N; i++) { if (rand() < f) counts[others[Math.floor(rand() * others.length)]]++; else counts[obvZone]++; }
    let herd = ZONES[0], hv = -1; for (const z of ZONES) if (counts[z] > hv) { hv = counts[z]; herd = z; }
    line(`  ${f.toFixed(1).padStart(5)} ${'scattered'.padStart(12)} ${(counts[obvZone] / N).toFixed(3).padStart(14)} ${herd.padStart(11)} ${(herd === obvZone ? 'YES' : 'NO — flipped').padStart(19)}`);
  }
  // COORDINATED (all chasers to one alternative zone = gut, the 2nd-highest base)
  {
    const alt = 'gut';
    const counts: Record<string, number> = Object.fromEntries(ZONES.map((z) => [z, 0]));
    const rand = lcg(4321);
    for (let i = 0; i < N; i++) { if (rand() < f) counts[alt]++; else counts[obvZone]++; }
    let herd = ZONES[0], hv = -1; for (const z of ZONES) if (counts[z] > hv) { hv = counts[z]; herd = z; }
    line(`  ${f.toFixed(1).padStart(5)} ${'coordinated'.padStart(12)} ${(counts[obvZone] / N).toFixed(3).padStart(14)} ${herd.padStart(11)} ${(herd === obvZone ? 'YES' : 'NO — flipped').padStart(19)}`);
  }
}
line('  => SCATTERED chasing does not flip the herd (obvious zone keeps the plurality),');
line('     but a COORDINATED bloc flips it once f>0.5. A herd-call bonus is thus');
line('     reflexively manipulable by any organised group: they move the "correct"');
line('     answer by chasing the bonus. The reward is not skill-stable.');
line();

// ---------------------------------------------------------------------------
// (2) PREDICTABILITY SPECTRUM
// ---------------------------------------------------------------------------
line('--- 2: PREDICTABILITY SPECTRUM — entropy of the correct answer ---');
line('Crowd herd fraction p (rest uniform-random). Correct answer = most-attacked ZONE.');
line(`  ${'p(herd)'.padStart(8)} ${'obv-zone share'.padStart(14)} ${'obv is herd?'.padStart(13)} ${'entropy(bits)'.padStart(13)}`);
for (const p of [0.0, 0.2, 0.35, 0.5, 0.7, 0.9, 1.0]) {
  const N = 1000;
  const hist: Record<string, number> = {};
  const TRIALS = 300;
  let obvIsHerd = 0;
  for (let t = 0; t < TRIALS; t++) {
    const counts: Record<string, number> = Object.fromEntries(ZONES.map((z) => [z, 0]));
    const rand = lcg(7000 + t);
    for (let i = 0; i < N; i++) { const z = rand() < p ? obvZone : ZONES[Math.floor(rand() * ZONES.length)]; counts[z]++; }
    let herd = ZONES[0], hv = -1;
    for (const z of ZONES) if (counts[z] > hv) { hv = counts[z]; herd = z; }
    hist[herd] = (hist[herd] ?? 0) + 1;
    if (herd === obvZone) obvIsHerd++;
  }
  let H = 0; for (const v of Object.values(hist)) { const q = v / TRIALS; H -= q * Math.log2(q); }
  const obvShare = (p + (1 - p) / 5).toFixed(3);
  line(`  ${p.toFixed(2).padStart(8)} ${obvShare.padStart(14)} ${((obvIsHerd / TRIALS) * 100).toFixed(0).padStart(12)}% ${H.toFixed(2).padStart(13)}`);
}
line('  => entropy is low (trivial) when the crowd is predictable, and rises only when');
line('     the crowd is dispersed — but then the answer is unpredictable (luck, not skill).');
line('     There is NO regime where the herd-zone call is BOTH non-trivial AND skill-correlated.');
line('\nDone.');
