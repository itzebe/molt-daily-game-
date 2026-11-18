/**
 * MISSION 06 — fidelity check: my DP model vs the REAL engine.
 *
 * Proves `bestTotal` (and `dmgFor`) reproduce the engine's resolveDay exactly for
 * concrete crowds, so the A5 derivation is grounded in the real code, not a
 * re-implementation that could drift.
 *
 * Deterministic.
 */
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';
import { bestTotal, dmgFor, COMBOS, allExposed, N_COMBOS } from './lib.ts';
import { lcg } from './lib.ts';

let pass = 0, fail = 0;
const check = (label: string, a: number, b: number) => { if (a === b) { pass++; } else { fail++; console.log(`  MISMATCH ${label}: model=${a} engine=${b}`); } };

// 1) dmgFor vs engine damageFor across many (combo, share) samples.
import { damageFor } from '../../mission04/prototype/src/engine/resolve.ts';
const rand = lcg(20261118);
for (let i = 0; i < 3000; i++) {
  const c = COMBOS[Math.floor(rand() * N_COMBOS)];
  const share = rand();
  check(`dmgFor ${c.zone}:${c.tool}@${share.toFixed(4)}`, dmgFor(c, allExposed, share), damageFor(c, allExposed, share));
}
console.log(`dmgFor vs engine damageFor: ${pass} pass, ${fail} fail`);

// 2) totalDamage vs engine for random crowds of various N.
let tp = 0, tf = 0;
for (const N of [1, 2, 3, 5, 7, 11, 17, 29, 40, 64, 100, 250, 400]) {
  for (let trial = 0; trial < 40; trial++) {
    const counts = new Array<number>(N_COMBOS).fill(0);
    for (let i = 0; i < N; i++) counts[Math.floor(rand() * N_COMBOS)]++;
    const subs = [];
    for (let i = 0; i < N_COMBOS; i++) for (let k = 0; k < counts[i]; k++) subs.push({ userId: `u${i}_${k}`, strike: COMBOS[i] });
    const res = resolveDay(1, genesisState(1), subs);
    let model = 0; for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) model += counts[i] * dmgFor(COMBOS[i], allExposed, counts[i] / N);
    if (model === res.totalDamage) tp++; else { tf++; console.log(`  MISMATCH N=${N} trial=${trial}: model=${model} engine=${res.totalDamage}`); }
  }
}
console.log(`totalDamage vs engine resolveDay: ${tp} pass, ${tf} fail`);
console.log(`\nOVERALL: ${pass + tp} pass, ${fail + tf} fail`);
