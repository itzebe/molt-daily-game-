/**
 * MISSION 09 — bistability mechanism trace (day-by-day).
 */
import {
  resolveDay9, countsToSubmissions, molt, countsTop5, genesisState, ENGINE_RULES,
  integrityLinear, ZONES,
} from './lib9.ts';

const N = 200;
for (const k of [30, 30.02]) {
  let state = genesisState(1); const sharesHist: Array<Record<string, number>> = [];
  const rows: string[] = [];
  for (let d = 1; d <= 20; d++) {
    const counts = countsTop5(N, state, ENGINE_RULES);
    const res = resolveDay9(d, state, countsToSubmissions(counts), ENGINE_RULES, integrityLinear(k));
    const sig = ZONES.map((z) => (state.zoneState[z] ?? 'exposed')[0]).join('');
    rows.push(`  day ${String(d).padStart(2)}: per=${res.perPlayer.toFixed(2)}  ${res.outcome.padEnd(7)} state=${sig}`);
    sharesHist.push(res.zoneShare);
    state = molt({ nextDay: d + 1, resolution: res as any, recentZoneShares: sharesHist, previousState: state });
  }
  console.log(`\n=== k=${k} ===`);
  console.log(rows.join('\n'));
}
console.log('\nDone.');
