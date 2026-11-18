/**
 * MISSION 08 — INDEPENDENT MATHEMATICAL VERIFICATION. [PROOF]/[ENGINE]
 *
 * Reproduces (or refutes) Mission 07's linear-integrity conclusions, and tests them
 * ACROSS BEAST STATES (Mission 07 measured only the genesis/all-exposed beast).
 *
 * Tests: exact formula, aggregation, rounding/integer boundaries, min/max, small-N,
 * large-N, zero/partial/full participation, maximum coordination, concentrated
 * attacks, and state-dependence of the strategy ceilings.
 *
 * Deterministic (no seed except the disclosed equilibrium search).
 */
import {
  COMBOS, N_COMBOS, ZONES, allExposed, baseOf, dmg, obviousIdx, rankedByBase,
  bestTotalExact, bestCountsExact, equilCounts, countsHerd, countsCycle15, countsTop5,
  countsRightTool, totalOf, perOf, mkState, integritySqrt, integrityK27, integrityK30,
  crowdFactor, type BeastState,
} from './lib8.ts';
import { integrityFor } from '../../mission04/prototype/src/engine/resolve.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);

line('================================================================');
line('MISSION 08 — INDEPENDENT MATHEMATICAL VERIFICATION');
line('================================================================');
line('Categories: [PROOF] exact, [ENGINE] frozen-engine verified. Deterministic.\n');

// ---------------------------------------------------------------------------
// 1. EXACT FORMULA + ROUNDING + EDGE CASES
// ---------------------------------------------------------------------------
line('--- 1. FORMULAS: current sqrt vs linear (exact) ---');
line(`  ${'N'.padStart(8)} ${'sqrt(1000)cap12k'.padStart(15)} ${'27N'.padStart(8)} ${'30N'.padStart(8)} ${'per-player sqrt'.padStart(14)}`);
for (const N of [0, 1, 2, 5, 14, 15, 40, 100, 144, 348, 1000, 5000, 10000, 100000]) {
  const s = integrityFor(N), a = integrityK27(N), b = integrityK30(N);
  const perS = N > 0 ? (s / N).toFixed(2) : 'inf';
  line(`  ${String(N).padStart(8)} ${String(s).padStart(15)} ${String(a).padStart(8)} ${String(b).padStart(8)} ${perS.padStart(14)}`);
}
line('  => sqrt per-player requirement DECREASES with N (gate at small N, auto-win at large N).');
line('     linear per-player requirement is CONSTANT (=k). This is the structural claim.\n');

line('--- 1b. ROUNDING / INTEGER BOUNDARIES (exact) ---');
line('  Integrity: sqrt path is Math.min(1000*sqrt(N),12000) -> non-integer for non-squares,');
line('  compared against an INTEGER total damage via `>=`. Linear k*N is always an integer.');
line('  Damage: every per-strike value is Math.round(base * toolMult * crowdFactor * fatigue * ridge).');
line('  Verify a few boundary cases against the engine (delegated):');
{
  const st = allExposed;
  const c = COMBOS[obviousIdx(st)]; // crown:cleave, base 30
  for (const share of [0.0299999, 0.03, 0.0999999, 0.1, 0.2999999, 0.3]) {
    const band = crowdFactor(share);
    line(`    share=${share.toFixed(7)} band=${band.label} factor=${band.factor} dmg=${dmg(c, st, share)}`);
  }
  line('    => band boundaries are inclusive at the lower bound (share>=minShare).');
  const nSqrt = 7; line(`    integrityFor(7)=${integrityFor(7)} (1000*sqrt(7)=${(1000*Math.sqrt(7)).toFixed(3)}) -> non-integer target`);
}
line();

// ---------------------------------------------------------------------------
// 2. STATE-DEPENDENT STRATEGY CEILINGS (the gap Mission 07 left)
// ---------------------------------------------------------------------------
line('--- 2. STRATEGY CEILINGS ACROSS BEAST STATES (exact, N=2000) ---');
const states: Array<[string, BeastState]> = [
  ['genesis (all exposed)', mkState({})],
  ['crown armoured', mkState({ crown: 'armoured' })],
  ['crown+gut armoured', mkState({ crown: 'armoured', gut: 'armoured' })],
  ['all armoured', mkState({ crown: 'armoured', hide: 'armoured', gut: 'armoured', claw: 'armoured', tail: 'armoured' })],
  ['tail raw', mkState({ tail: 'raw' })],
  ['crown arm + tail raw', mkState({ crown: 'armoured', tail: 'raw' })],
  ['gut raw + claw raw', mkState({ gut: 'raw', claw: 'raw' })],
  ['2 raw 2 arm (mixed)', mkState({ crown: 'armoured', hide: 'raw', gut: 'armoured', claw: 'raw' })],
];
line(`  ${'state'.padStart(24)} ${'herd'.padStart(7)} ${'cycle15'.padStart(8)} ${'top5'.padStart(7)} ${'rightTool'.padStart(10)} ${'equil'.padStart(7)} ${'DP-opt'.padStart(7)}`);
const ceilTable: Record<string, Record<string, number>> = {};
for (const [name, st] of states) {
  const N = 2000;
  const herd = perOf(countsHerd(N, st), st, N);
  const cyc = perOf(countsCycle15(N), st, N);
  const t5 = perOf(countsTop5(N, st), st, N);
  const rt = perOf(countsRightTool(N, st), st, N);
  const eq = perOf(equilCounts(N, st), st, N);
  const opt = bestTotalExact(N, st) / N;
  ceilTable[name] = { herd, cyc, t5, rt, eq, opt };
  line(`  ${name.padStart(24)} ${fmt(herd).padStart(7)} ${fmt(cyc).padStart(8)} ${fmt(t5).padStart(7)} ${fmt(rt).padStart(10)} ${fmt(eq).padStart(7)} ${fmt(opt).padStart(7)}`);
}
line('  => the ceilings MOVE with state. cycle15 (blind dispersion) ranges from');
{
  const cycVals = states.map(([n]) => ceilTable[n].cyc);
  const eqVals = states.map(([n]) => ceilTable[n].eq);
  const optVals = states.map(([n]) => ceilTable[n].opt);
  line(`     ${fmt(Math.min(...cycVals))} to ${fmt(Math.max(...cycVals))} (blind dispersion).`);
  line(`     equilibrium ranges ${fmt(Math.min(...eqVals))} to ${fmt(Math.max(...eqVals))}.`);
  line(`     DP-optimal ranges ${fmt(Math.min(...optVals))} to ${fmt(Math.max(...optVals))}.`);
  line(`     global-min DP-optimal = ${fmt(Math.min(...optVals))} (the worst-case ceiling).`);
  line(`     global-max blind dispersion = ${fmt(Math.max(...cycVals))}.`);
}
line('  THIS IS THE DECISIVE TABLE for k: a k must be above the blind-dispersion');
line('  ceiling in EVERY state (else the trivial rule still wins somewhere), and');
line('  below the coordination ceiling in EVERY state (else the goal is unwinnable).');
line();

// ---------------------------------------------------------------------------
// 3. THE FEASIBLE k WINDOW
// ---------------------------------------------------------------------------
line('--- 3. THE FEASIBLE k WINDOW (exact, across all states, N=2000) ---');
{
  const maxBlind = Math.max(...states.map(([n]) => ceilTable[n].cyc));
  const minEquil = Math.min(...states.map(([n]) => ceilTable[n].eq));
  const minOpt = Math.min(...states.map(([n]) => ceilTable[n].opt));
  const minTop5 = Math.min(...states.map(([n]) => ceilTable[n].t5));
  const maxTop5 = Math.max(...states.map(([n]) => ceilTable[n].t5));
  line(`  max blind dispersion across states: ${fmt(maxBlind)}`);
  line(`  min equilibrium across states:      ${fmt(minEquil)}`);
  line(`  min DP-optimal across states:       ${fmt(minOpt)}`);
  line(`  top5 spread range:                  ${fmt(minTop5)} .. ${fmt(maxTop5)}`);
  line(`  => to defeat blind dispersion EVERYWHERE: k > ${fmt(maxBlind)}  -> integer k >= ${Math.floor(maxBlind) + 1}`);
  line(`  => to be winnable by equilibrium EVERYWHERE: k <= ${fmt(minEquil)} -> integer k <= ${Math.floor(minEquil)}`);
  line(`  => top5 is the tighter trivial rule: to defeat it, k > ${fmt(maxTop5)} -> k >= ${Math.floor(maxTop5) + 1}`);
  line(`  FEASIBLE WINDOW (equilibrium-winnable AND beats blind dispersion):`);
  line(`     ${Math.floor(maxBlind) + 1} <= k <= ${Math.floor(minEquil)}   (using equilibrium as the coordination ceiling)`);
  line(`  Using DP-optimal as the coordination ceiling (central coordination):`);
  line(`     ${Math.floor(maxBlind) + 1} <= k <= ${Math.floor(minOpt)}`);
  line(`  NOTE: top5 spread (a DIFFERENT trivial rule) tops out at ${fmt(maxTop5)}; defeating it`);
  line(`        needs k >= ${Math.floor(maxTop5) + 1}, which may exceed the winnable ceiling in some states.`);
}
line();

// ---------------------------------------------------------------------------
// 4. POPULATION SCALING OF THE CEILINGS
// ---------------------------------------------------------------------------
line('--- 4. SCALING OF CEILINGS WITH N (genesis beast, exact) ---');
line(`  ${'N'.padStart(7)} ${'cycle15'.padStart(8)} ${'top5'.padStart(7)} ${'equil'.padStart(7)} ${'DP-opt'.padStart(7)} ${'opt/I(27N)'.padStart(11)} ${'opt/I(30N)'.padStart(11)}`);
for (const N of [5, 10, 15, 30, 60, 100, 250, 500, 1000, 2000, 5000]) {
  const cyc = perOf(countsCycle15(N), allExposed, N);
  const t5 = perOf(countsTop5(N, allExposed), allExposed, N);
  const eq = perOf(equilCounts(N), allExposed, N);
  const opt = bestTotalExact(N, allExposed) / N;
  line(`  ${String(N).padStart(7)} ${fmt(cyc).padStart(8)} ${fmt(t5).padStart(7)} ${fmt(eq).padStart(7)} ${fmt(opt).padStart(7)} ${fmt(opt / 27).padStart(11)} ${fmt(opt / 30).padStart(11)}`);
}
line('  => ceilings are flat in N above ~60 (scale-invariance holds); small-N wobble is');
line('     integer-rounding granularity. opt/I(kN) is the "coordination margin".\n');

// ---------------------------------------------------------------------------
// 5. EDGE CASES: zero / partial / full participation; concentrated attacks
// ---------------------------------------------------------------------------
line('--- 5. EDGE CASES (exact) ---');
{
  const N = 100;
  // zero participation
  const res0 = totalOf(new Array(N_COMBOS).fill(0), allExposed, 1);
  line(`  zero participation: total=${res0} (no submissions). Engine: resolveDay with n=0.`);
  // one striker
  const one = new Array(N_COMBOS).fill(0); one[obviousIdx(allExposed)] = 1;
  line(`  one striker (N=1) best: total=${totalOf(one, allExposed, 1)}; I(27N)=27; I(30N)=30 -> ${totalOf(one, allExposed, 1) >= 27 ? 'SLAIN at k27' : 'escape'} / ${totalOf(one, allExposed, 1) >= 30 ? 'SLAIN at k30' : 'escape'}`);
  // concentrated attacks (all on one combo) vs spread, N=100
  const conc = new Array(N_COMBOS).fill(0); conc[obviousIdx(allExposed)] = N;
  line(`  concentrated (all ${N} on obvious): per=${fmt(perOf(conc, allExposed, N))} total=${totalOf(conc, allExposed, N)}`);
  line(`  spread cycle15 (${N}):              per=${fmt(perOf(countsCycle15(N), allExposed, N))} total=${totalOf(countsCycle15(N), allExposed, N)}`);
  line(`  DP-optimal (${N}):                  per=${fmt(bestTotalExact(N, allExposed) / N)} total=${bestTotalExact(N, allExposed)}`);
  line(`  I(27N)=${27 * N}  I(30N)=${30 * N}  (compare to the totals above)`);
  // partial participation: 50% of a nominal 200 -> N=100 with a mixed crowd
  line('  partial participation is modelled as a smaller N (the engine uses distinct strikers).');
  line('  => a half-turnout day has HALF the total but the SAME per-player requirement under linear;');
  line('     under sqrt it is EASIER (the target grows slower than N). See section 6.');
}
line();

// ---------------------------------------------------------------------------
// 6. WHY LINEAR REMOVES THE TURNOUT DEPENDENCE (analytic proof)
// ---------------------------------------------------------------------------
line('--- 6. TURNOUT DEPENDENCE (analytic) [PROOF] ---');
line('  Under linear I=kN, SLAIN iff total >= kN iff (total/N) >= k iff per-player >= k.');
line('  The per-player aggregate depends on the STRATEGY MIX, not on N (scale-invariant).');
line('  => the outcome is determined by HOW the community plays, independent of turnout.');
line('  Under sqrt I=1000*sqrt(N) (cap 12000), SLAIN iff total >= 1000*sqrt(N)');
line('     iff (total/N) >= 1000/sqrt(N) -> the per-player bar FALLS as N grows.');
line('  => under sqrt the outcome is dominated by TURNOUT; under linear it is not.');
line();

// ---------------------------------------------------------------------------
// 7. MINIMUM N FOR WHICH LINEAR IS "FAIR" (integer effects)
// ---------------------------------------------------------------------------
line('--- 7. SMALL-N INTEGER EFFECTS (linear) ---');
line(`  ${'N'.padStart(5)} ${'DP-opt total'.padStart(12)} ${'27N'.padStart(6)} ${'30N'.padStart(6)} ${'k27'.padStart(5)} ${'k30'.padStart(5)}`);
for (const N of [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20]) {
  const opt = bestTotalExact(N, allExposed);
  line(`  ${String(N).padStart(5)} ${String(opt).padStart(12)} ${String(27 * N).padStart(6)} ${String(30 * N).padStart(6)} ${(opt >= 27 * N ? 'WIN' : 'esc').padStart(5)} ${(opt >= 30 * N ? 'WIN' : 'esc').padStart(5)}`);
}
line('  => at very small N the integer target can be cleared by a single good combo;');
line('     the linear rule is well-behaved but the game is trivially small below ~15.');
line('\nDone.');
