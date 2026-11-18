/**
 * MISSION 08 — FIDELITY CHECK: lib8 reproduces the frozen engine exactly. [ENGINE]
 */
import { COMBOS, N_COMBOS, dmg, lcg, integritySqrt } from './lib8.ts';
import { damageFor, resolveDay, integrityFor } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';

const state = genesisState(1);
let pass = 0, fail = 0;
const rand = lcg(20261119);

for (let i = 0; i < 8000; i++) {
  const c = COMBOS[Math.floor(rand() * N_COMBOS)];
  const share = rand();
  const a = dmg(c, state, share), b = damageFor(c, state, share);
  if (a === b) pass++; else { fail++; if (fail < 5) console.log(`MISMATCH dmg ${c.zone}:${c.tool}@${share.toFixed(4)}: ${a} vs ${b}`); }
}
let tp = 0, tf = 0;
for (const N of [1, 2, 3, 5, 13, 40, 100, 250, 500, 1000]) {
  for (let t = 0; t < 40; t++) {
    const counts = new Array(N_COMBOS).fill(0);
    for (let i = 0; i < N; i++) counts[Math.floor(rand() * N_COMBOS)]++;
    const subs = [];
    for (let i = 0; i < N_COMBOS; i++) for (let k = 0; k < counts[i]; k++) subs.push({ userId: `u${i}_${k}`, strike: COMBOS[i] });
    const res = resolveDay(1, state, subs);
    let model = 0; for (let i = 0; i < N_COMBOS; i++) if (counts[i] > 0) model += counts[i] * dmg(COMBOS[i], state, counts[i] / N);
    if (model === res.totalDamage) tp++; else { tf++; if (tf < 5) console.log(`MISMATCH total N=${N}: ${model} vs ${res.totalDamage}`); }
  }
}
let ip = 0, ifail = 0;
for (const n of [0, 1, 100, 1000, 1e6]) { if (integritySqrt(n) === integrityFor(n)) ip++; else ifail++; }

console.log(`lib8 dmg vs engine damageFor:      ${pass} pass, ${fail} fail`);
console.log(`lib8 total vs engine resolveDay:   ${tp} pass, ${tf} fail`);
console.log(`lib8 integrity vs engine:          ${ip} pass, ${ifail} fail`);
console.log(`OVERALL: ${pass + tp + ip} pass, ${fail + tf + ifail} fail`);
console.log(`(current engine formula: min(1000*sqrt(N),12000); e.g. N=1000 -> ${integrityFor(1000)})`);
