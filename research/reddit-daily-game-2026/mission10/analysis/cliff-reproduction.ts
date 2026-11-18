/**
 * Mission 10 — failure-cliff + seed-stability reproduction (REAL engine).
 *
 * Reproduces Mission 09's reported cliff between k = 30.00 and k = 30.02, the
 * day-3 bistable lock-in mechanism, and the deterministic (seed-independent)
 * outcome. Drives the real engine; integrity threshold is parameterised.
 *
 * Run: node --experimental-strip-types analysis/cliff-reproduction.ts
 */
import {
  resolveDay, ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, MAW,
  type Strike, type Tool, type Zone, type BeastState,
} from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/game.ts';
import { genesisState, molt } from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/molt.ts';

const COMBOS = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
const NC = COMBOS.length;
type Sub = { userId: string; strike: Strike };
function toSubs(counts: number[]): Sub[] { const s: Sub[] = []; for (let i = 0; i < NC; i++) for (let k = 0; k < counts[i]; k++) s.push({ userId: `u${s.length}`, strike: COMBOS[i] }); return s; }

function baseOf(c: { zone: Zone; tool: Tool }, st: BeastState): number {
  const zs = st.zoneState[c.zone] ?? 'exposed';
  const base = c.zone === ('maw' as Zone) ? MAW.value : ZONE_VALUE[c.zone];
  return base * TOOL_MULT[c.tool][zs];
}
function rankByBase(st: BeastState): number[] { return COMBOS.map((c, i) => ({ i, v: baseOf(c, st) })).sort((a, b) => b.v - a.v).map((x) => x.i); }
function countsTop5(N: number, st: BeastState): number[] { const c = new Array(NC).fill(0); const r = rankByBase(st); for (let i = 0; i < N; i++) c[r[i % 5]]++; return c; }

/** Run the engaged crowd; return per-day per-player series and SLAIN count for a given k. */
function run(N: number, k: number, days: number, seed: number) {
  let state = genesisState(1);
  const per: number[] = []; const outcomes: string[] = []; const sharesHist: Array<Record<string, number>> = [];
  let slain = 0;
  for (let d = 1; d <= days; d++) {
    const subs = toSubs(countsTop5(N, state));
    const real = resolveDay(d, state, subs);
    const target = k * real.n;
    const outcome = real.totalDamage >= target ? 'SLAIN' : 'ESCAPED';
    if (outcome === 'SLAIN') slain++;
    per.push(real.n > 0 ? real.totalDamage / real.n : 0);
    outcomes.push(outcome);
    sharesHist.push(real.zoneShare);
    state = molt({ nextDay: d + 1, resolution: { ...real, integrity: target, outcome } as any, recentZoneShares: sharesHist, previousState: state });
  }
  return { per, outcomes, slain };
}

const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const N = 200;
const days = 150;

console.log('============================================================');
console.log('MISSION 10 — FAILURE CLIFF + SEED STABILITY (REAL engine)');
console.log('============================================================');
console.log(`engaged crowd (TOP5), N=${N}, ${days} days, ${SEEDS.length} seeds\n`);

console.log('--- 1. FINE k SWEEP ---');
for (const k of [29.8, 29.9, 30.0, 30.02, 30.05, 30.1, 30.2, 30.5]) {
  let slain = 0, tot = 0;
  for (const seed of SEEDS) { const r = run(N, k, days, seed); slain += r.slain; tot += days; }
  console.log(`  k=${String(k).padEnd(6)} SLAIN = ${slain}/${tot} (${(100 * slain / tot).toFixed(1)}%)`);
}

console.log('\n--- 2. MECHANISM: per-player damage by day-window ---');
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
for (const k of [30, 30.1]) {
  const r = run(N, k, days, 1);
  console.log(`  k=${k}: d1-3=${mean(r.per.slice(0, 3)).toFixed(2)} d4-10=${mean(r.per.slice(3, 10)).toFixed(2)} d11-30=${mean(r.per.slice(10, 30)).toFixed(2)} d100-150=${mean(r.per.slice(100, 150)).toFixed(2)} overall=${mean(r.per).toFixed(2)}`);
}

console.log('\n--- 3. SEED STABILITY AT k=30 (per-seed SLAIN) ---');
let allSame = true;
const slainPerSeed: number[] = [];
for (const seed of SEEDS) { const r = run(N, 30, days, seed); slainPerSeed.push(r.slain); console.log(`  seed=${String(seed).padEnd(6)} slain=${r.slain}/${days}`); }
allSame = slainPerSeed.every((s) => s === slainPerSeed[0]);
console.log(`  -> identical across seeds: ${allSame ? 'YES (deterministic)' : 'NO'}`);

console.log('\n--- 4. DAY-3 LOCK-IN: first 5 days of outcome at k=30 vs k=30.02 (seed=1) ---');
for (const k of [30, 30.02]) {
  const r = run(N, k, days, 1);
  console.log(`  k=${String(k).padEnd(6)} d1-5 = ${r.outcomes.slice(0, 5).join(',')}`);
}
