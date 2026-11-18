/**
 * MISSION 09 — failure-cliff characterisation.
 *
 * Locates the cliff precisely and shows the mechanism (bistability: the state locks
 * into a low-damage attractor after an early escape, so the ceiling is set by the
 * EARLY days, not the steady state).
 */
import { simulate, integrityLinear, countsTop5, countsEven5, genesisState, ENGINE_RULES, type BeastState } from './lib9.ts';

const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const N = 200;

console.log('============================================================');
console.log('MISSION 09 — FAILURE CLIFF CHARACTERISATION');
console.log('============================================================');

// 1. fine k around the cliff
console.log('\n--- 1. FINE k SWEEP (top5 engaged crowd, N=200, 9 seeds) ---');
for (const k of [29.8, 29.9, 30.0, 30.02, 30.05, 30.1, 30.2, 30.5]) {
  let slain = 0, days = 0;
  for (const seed of SEEDS) { const r = simulate(N, (st) => countsTop5(N, st, ENGINE_RULES), ENGINE_RULES, integrityLinear(k), 150, seed); slain += r.slainDays; days += 150; }
  console.log(`  k=${String(k).padEnd(6)} SLAIN = ${slain}/${days} (${(100 * slain / days).toFixed(1)}%)`);
}

// 2. the mechanism: ceiling by day-window (early vs late)
console.log('\n--- 2. MECHANISM: per-player damage in early vs late windows ---');
for (const k of [30, 30.1]) {
  // run one seed, capture per-day
  let state = genesisState(1); const per: number[] = [];
  const days = 150;
  // reuse simulate's logic inline to capture per-day
  const { resolveDay9, countsToSubmissions, molt } = await import('./lib9.ts');
  const sharesHist: Array<Record<string, number>> = [];
  for (let d = 1; d <= days; d++) {
    const counts = countsTop5(N, state, ENGINE_RULES);
    const res = resolveDay9(d, state, countsToSubmissions(counts), ENGINE_RULES, integrityLinear(k));
    per.push(res.perPlayer);
    sharesHist.push(res.zoneShare);
    state = molt({ nextDay: d + 1, resolution: res as any, recentZoneShares: sharesHist, previousState: state });
  }
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  console.log(`  k=${k}: days 1-10 mean=${mean(per.slice(0, 10)).toFixed(2)}  days 11-30=${mean(per.slice(10, 30)).toFixed(2)}  days 100-150=${mean(per.slice(100, 150)).toFixed(2)}  overall=${mean(per).toFixed(2)}`);
}

// 3. stability: does the outcome vary with seed?
console.log('\n--- 3. SEED STABILITY AT k=30 (per-seed SLAIN) ---');
for (const seed of SEEDS) {
  const r = simulate(N, (st) => countsTop5(N, st, ENGINE_RULES), ENGINE_RULES, integrityLinear(30), 150, seed);
  console.log(`  seed=${String(seed).padEnd(6)} steady=${r.steady.toFixed(2)} slain=${r.slainDays}/150`);
}

console.log('\nDone.');
