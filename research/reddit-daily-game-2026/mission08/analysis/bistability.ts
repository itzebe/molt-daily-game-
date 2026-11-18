/**
 * MISSION 08 — PATH DEPENDENCE / BISTABILITY. [SIM]/[ENGINE]
 *
 * Discovery: the beast's state trajectory is PATH-DEPENDENT. If the community clears
 * the goal early, the escape penalty (§3.7) is not applied and the state settles into a
 * HIGH-damage attractor; if it fails early, the penalty fires, the state settles into a
 * LOW-damage attractor, and the community may never recover. So the effective k ceiling
 * is set by the EARLY-days damage, not the steady state.
 *
 * This script measures, for the beast-reading spread (top5):
 *   - the per-day damage trajectory under each k,
 *   - the MINIMUM early-day per-player (the lock-in threshold),
 *   - the outcome (SLAIN/ESCAPED) trajectory,
 * to locate where bistability begins.
 *
 * Deterministic per seed.
 */
import {
  COMBOS, rankedByBase, obviousIdx, lcg, type Combo, type BeastState,
} from './lib8.ts';
import { resolveDay, type Submission, type DayResolution } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const line = (s = '') => console.log(s);
const fmt = (x: number, d = 2) => x.toFixed(d);
const top5 = (i: number, c: { state: BeastState }) => COMBOS[rankedByBase(c.state)[i % 5]];
const herd = (i: number, c: { state: BeastState }) => COMBOS[obviousIdx(c.state)];

function traj(N: number, pick: (i: number, c: any) => Combo, k: number, seed: number, days = 150) {
  const r = lcg(seed + N * 131);
  let state = genesisState(1); let prevCombo: Record<string, number> = {};
  const per: number[] = []; const out: string[] = [];
  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = [];
    for (let i = 0; i < N; i++) { const c = pick(i, { N, state, prevCombo, rand: r }); subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } }); }
    const res = resolveDay(d, state, subs);
    per.push(res.totalDamage / res.n);
    const target = k * res.n; const outcome: 'SLAIN' | 'ESCAPED' = res.totalDamage >= target ? 'SLAIN' : 'ESCAPED';
    out.push(outcome === 'SLAIN' ? 'S' : '.');
    prevCombo = {}; for (const kk of Object.keys(res.aggregate.comboCount)) prevCombo[kk] = res.aggregate.comboCount[kk] / res.n;
    state = molt({ nextDay: d + 1, resolution: { ...res, integrity: target, outcome } as DayResolution, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return { per, out };
}

line('================================================================');
line('MISSION 08 — PATH DEPENDENCE / BISTABILITY');
line('================================================================');
line('N=200, seed=1. "." = escaped day, "S" = slain day. [SIM]/[ENGINE]\n');

line('--- A. top5 (beast-reading spread) under increasing k ---');
line(`  ${'k'.padStart(4)} ${'minPer(1-20)'.padStart(12)} ${'minPer(all)'.padStart(12)} ${'steady'.padStart(8)} ${'slainDays'.padStart(10)}  outcome (first 40 days)`);
for (const k of [27, 29, 30, 30.5, 31, 32, 33]) {
  const t = traj(200, top5, k, 1);
  const early = Math.min(...t.per.slice(0, 20));
  const allMin = Math.min(...t.per);
  const steady = t.per.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const slain = t.out.filter((o) => o === 'S').length;
  line(`  ${String(k).padStart(4)} ${fmt(early).padStart(12)} ${fmt(allMin).padStart(12)} ${fmt(steady).padStart(8)} ${String(slain).padStart(10)}  ${t.out.slice(0, 40).join('')}`);
}
line('  => note the CLIFF: a small k increase flips top5 from ~99% to ~0% SLAIN,');
line('     because an early escape locks the state into a low-damage attractor.\n');

line('--- B. the lock-in threshold: first-20-day min per-player for top5 ---');
line(`  the highest k that top5 reliably clears = min over early days (it must clear EVERY early day).`);
{
  const t = traj(200, top5, 1, 1); // k=1: pure trajectory, all clear
  line(`  top5 first-20-day per-player: ${t.per.slice(0, 20).map((x) => x.toFixed(1)).join(', ')}`);
  line(`  min(first 20) = ${fmt(Math.min(...t.per.slice(0, 20)))}`);
  line(`  min(first 5)  = ${fmt(Math.min(...t.per.slice(0, 5)))}`);
  line(`  => if the community must clear EVERY day from day 1, the effective ceiling is`);
  line(`     the day-1..5 minimum (~${fmt(Math.min(...t.per.slice(0, 5)))}), NOT the steady ${fmt(t.per.slice(-20).reduce((a, b) => a + b, 0) / 20)}.`);
}
line();
line('--- C. is the lock-in permanent? (top5 at k=31, days 40-70) ---');
{
  const t = traj(200, top5, 31, 1);
  line(`  days 40-70 per-player: ${t.per.slice(40, 70).map((x) => x.toFixed(1)).join(', ')}`);
  line(`  days 40-70 outcomes:   ${t.out.slice(40, 70).join('')}`);
  line(`  => if the escaped-locked state persists, recovery does not happen without a`);
  line(`     change in play. This is a genuine trap, not a transient.`);
}
line('\nDone.');
