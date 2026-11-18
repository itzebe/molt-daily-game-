/**
 * MISSION 06 — recommended coefficient derivation + hardened-beast analysis.
 *
 * (1) Hardened-beast ceiling: as ESCAPEs accumulate armour (spec §3.7), does the
 *     achievable damage/striker drop (a "death spiral")? Tested for BOTH readings
 *     of C1 (A = engine/§2/§4, no STATE_MULT; B = §1.2 STATE_MULT applied).
 * (2) Derive the recommended scale-invariant coefficient k from a stated
 *     principle, not a fitted value.
 * (3) Verify the linear formula is scale-invariant and does not death-spiral.
 *
 * Deterministic; model-level only.
 */
import { ZONE_VALUE, TOOL_MULT, STATE_MULT, ZONES, type BeastState, type Zone, type ZoneState } from '../../mission04/prototype/src/engine/rules.ts';
import { crowdFactor, integrityFor } from '../../mission04/prototype/src/engine/resolve.ts';
import { COMBOS, bestTotal, realisticTotal, N_COMBOS, type CrowdModel } from './lib.ts';

const r = Math.round;
function mkState(armoured: Zone[], raw: Zone[] = []): BeastState {
  const zoneState = {} as Record<Zone, ZoneState>;
  for (const z of ZONES) zoneState[z] = armoured.includes(z) ? 'armoured' : raw.includes(z) ? 'raw' : 'exposed';
  return { day: 1, zoneState, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
}
const byValue = [...ZONES].sort((a, b) => ZONE_VALUE[b] - ZONE_VALUE[a]); // crown, gut, claw, hide, tail

// Reading-B DP (STATE_MULT applied)
function bestTotalB(N: number, st: BeastState): number {
  const val = COMBOS.map((c) => {
    const a = new Array<number>(N + 1).fill(0);
    for (let k = 1; k <= N; k++) a[k] = k * r(ZONE_VALUE[c.zone] * STATE_MULT[st.zoneState[c.zone]] * TOOL_MULT[c.tool][st.zoneState[c.zone]] * crowdFactor(k / N).factor);
    return a;
  });
  let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
  for (let i = 0; i < N_COMBOS; i++) { const nd = new Array<number>(N + 1).fill(-Infinity); for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + val[i][k]; if (v > nd[u + k]) nd[u + k] = v; } } dp = nd; }
  return dp[N];
}

const NCEIL = 2000; // asymptotic ceiling regime
console.log('============================================================');
console.log('MISSION 06 — HARDENED-BEAST CEILING (death-spiral check)');
console.log('============================================================');
console.log(`Per-striker ceiling at N=${NCEIL}, as ESCAPEs add armour to the highest-value zones:\n`);
console.log('  #armoured   zones armoured        c_best(A,engine)   c_best(B,STATE_MULT)');
for (let k = 0; k <= 5; k++) {
  const arm = byValue.slice(0, k);
  const st = mkState(arm);
  const a = bestTotal(NCEIL, st) / NCEIL;
  const b = bestTotalB(NCEIL, st) / NCEIL;
  console.log(`  ${String(k).padStart(9)}   ${(arm.join(',') || '(none)').padEnd(20)} ${a.toFixed(2).padStart(14)}   ${b.toFixed(2).padStart(18)}`);
}
console.log('\n=> Reading A (engine): hardening does NOT lower the ceiling (an armoured zone');
console.log('   still yields 1.6x with the right tool). No death spiral.');
console.log('=> Reading B: hardening lowers the ceiling. Repeated escapes could spiral.\n');

// (2) Principle: require alpha of the crowd to deviate from the lazy herd.
const cHerd = realisticTotal(1000, 'herd80') / 1000;
const cObvious = realisticTotal(1000, 'obvious') / 1000;
const cUniform = realisticTotal(1000, 'uniform') / 1000;
const cBest = bestTotal(1000) / 1000;
console.log('============================================================');
console.log('MISSION 06 — RECOMMENDED COEFFICIENT DERIVATION');
console.log('============================================================');
console.log(`Measured asymptotic damage/striker: obvious=${cObvious.toFixed(2)} herd80=${cHerd.toFixed(2)} uniform=${cUniform.toFixed(2)} best=${cBest.toFixed(2)}\n`);
console.log('Principle: the target k must satisfy');
console.log('  (i)  the lazy herd FAILS:      k > c_herd80');
console.log('  (ii) an engaged spread WINS:   k <= c_uniform');
console.log('  (iii) scale-invariance:        k constant (independent of N)');
const alpha = 0.30;
const kStar = cHerd + alpha * (cBest - cHerd);
console.log(`\nChoose k = c_herd + ${alpha}*(c_best - c_herd) = ${cHerd.toFixed(2)} + ${alpha}*${(cBest - cHerd).toFixed(2)} = ${kStar.toFixed(2)}`);
console.log(`  -> round to k = 27  (range 25..30 defensible)\n`);
console.log('  k     obvious fails?  herd80 fails?  uniform wins?  coordination gap');
for (const k of [21, 24, 25, 26, 27, 28, 29, 30, 32]) {
  const gap = (k - cHerd) / (cBest - cHerd);
  console.log(`  ${String(k).padStart(2)}      ${k > cObvious ? 'yes' : 'no '}            ${k > cHerd ? 'yes' : 'no '}           ${k <= cUniform ? 'yes' : 'no '}          ${gap.toFixed(2)}`);
}
console.log();

// (3) Linear-formula verification across N (scale invariance).
console.log('============================================================');
console.log('MISSION 06 — LINEAR FORMULA I(N)=k*N VERIFICATION (k=27)');
console.log('============================================================');
console.log('    N   I=kN    c_herd   c_best   coord-gap   obvious  herd80  uniform');
for (const N of [4, 8, 12, 20, 50, 100, 250, 500, 1000, 5000]) {
  const I = 27 * N;
  const ch = realisticTotal(N, 'herd80') / N;
  const cb = bestTotal(N) / N;
  const gap = (27 - ch) / (cb - ch);
  const oc = (m: CrowdModel) => (realisticTotal(N, m) >= I ? 'S' : '.');
  console.log(`  ${String(N).padStart(4)}  ${String(I).padStart(6)}   ${ch.toFixed(2).padStart(6)}   ${cb.toFixed(2).padStart(6)}   ${gap.toFixed(2).padStart(9)}   ${oc('obvious').padStart(6)}  ${oc('herd80').padStart(6)}  ${oc('uniform').padStart(6)}`);
}
console.log('\n=> coord-gap is ~constant (~0.27) across N: the SAME effort wins at any size.');
console.log('   Scale-invariant. The lazy herd fails; an engaged spread succeeds.\n');
console.log('Done.');
