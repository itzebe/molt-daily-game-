/**
 * MISSION 06 — exact strategy ceilings (to choose k honestly).
 *
 * Measures, in the asymptotic regime (N large), the mean damage per striker for
 * a ladder of strategies from laziest to optimal:
 *   obvious (all on crown:cleave), herd80 (80% obvious), uniform (blind random
 *   over 15 combos), spread-top5 (cycle the 5 highest-base combos),
 *   spread-all (cycle all 15), best (exact DP optimum).
 *
 * The design (§2.4) requires: lazy play FAILS and blind randomness is NOT
 * rewarded, while deliberate coordination WINS. These ceilings define the only
 * k values consistent with that intent.
 *
 * Deterministic; disclosed seeds. Model-level only.
 */
import { bestTotal, realisticTotal, dmgFor, lcg, COMBOS, baseFor, allExposed, N_COMBOS, type CrowdModel } from './lib.ts';

const N = 4000; // deep asymptotic regime
const strategies: Array<{ name: string; model?: CrowdModel; best?: boolean }> = [
  { name: 'obvious (lazy herd)', model: 'obvious' },
  { name: 'herd80 (casual)', model: 'herd80' },
  { name: 'uniform (blind random)', model: 'uniform' },
  { name: 'spread-top5 (deliberate)', model: 'spread-top5' },
  { name: 'spread-all (full spread)', model: 'spread-all' },
  { name: 'best (DP optimum)', best: true },
];

console.log('============================================================');
console.log('MISSION 06 — EXACT STRATEGY CEILINGS (mean damage/striker)');
console.log('============================================================');
console.log(`Asymptotic regime N=${N}; 200 trials; seed 424242+N; model-level only.\n`);
const ceilings: Array<[string, number]> = [];
for (const s of strategies) {
  const total = s.best ? bestTotal(N) : realisticTotal(N, s.model!, allExposed, 424242, 400);
  const per = total / N;
  ceilings.push([s.name, per]);
  console.log(`  ${s.name.padEnd(26)} ${per.toFixed(2).padStart(7)}`);
}
console.log();

// Deterministic (analytic) ceilings for the fixed spread strategies:
// spread-all: each of 15 combos gets share 1/15=0.0667 -> lone band (1.4).
console.log('Analytic cross-check (deterministic, share-based):');
for (const [name, share] of [['spread-all (1/15)', 1 / 15], ['spread-top5 (1/5)', 1 / 5], ['single-combo herd (1.0)', 1.0]] as const) {
  let sum = 0;
  const combos = name.startsWith('spread-top5')
    ? [...COMBOS].map((c, i) => ({ c, i, b: baseFor(c, allExposed) })).sort((a, b) => b.b - a.b).slice(0, 5).map((x) => x.c)
    : COMBOS;
  for (const c of combos) sum += dmgFor(c, allExposed, share);
  const per = sum / combos.length;
  console.log(`  ${name.padEnd(26)} ${per.toFixed(2).padStart(7)}`);
}
console.log();

console.log('============================================================');
console.log('CONSISTENT k RANGE');
console.log('============================================================');
const [, cObvious] = ceilings[0];
const [, cHerd] = ceilings[1];
const [, cUniform] = ceilings[2];
const [, cTop5] = ceilings[3];
const [, cBest] = ceilings[5];
console.log(`  lazy herd fails:        k > ${cObvious.toFixed(2)} (and > ${cHerd.toFixed(2)} for casual)`);
console.log(`  blind random fails:     k > ${cUniform.toFixed(2)}`);
console.log(`  deliberate spread wins: k <= ${cTop5.toFixed(2)}`);
console.log(`  full spread wins:       k <= ${cTop5.toFixed(2)}`);
console.log(`  optimum always wins:    k <= ${cBest.toFixed(2)}`);
console.log();
console.log(`  => Design-intent-consistent range: ${cUniform.toFixed(1)} < k <= ${cTop5.toFixed(1)}`);
console.log(`     (i.e. blind randomness fails, deliberate coordination wins).`);
console.log();
console.log('  k   obvious  herd80  uniform  top5  best   verdict');
for (const k of [24, 26, 27, 28, 29, 30, 31, 32, 33, 34]) {
  const f = (c: number) => (k > c ? 'fail' : 'win ');
  const ok = k > cUniform && k <= cTop5;
  console.log(`  ${String(k).padStart(2)}   ${f(cObvious).padEnd(7)} ${f(cHerd).padEnd(7)} ${f(cUniform).padEnd(8)} ${f(cTop5).padEnd(5)} ${f(cBest).padEnd(5)}  ${ok ? '<-- consistent' : ''}`);
}
console.log('\nDone.');
