/**
 * MISSION 06 — multi-day equilibrium / degeneracy simulation.
 *
 * Runs the REAL engine (resolveDay + molt) for many days under several crowd
 * strategies, and asks the §8 question: does a STATIC strategy win forever
 * (trivially predictable), or does the molt ruleset keep the target moving so a
 * decision is required every day?
 *
 * Two target formulas are compared: current sqrt(1000) and linear k=27.
 * Deterministic; disclosed seeds; model-level only.
 */
import {
  ZONE_VALUE, TOOL_MULT, ZONES, TOOLS, type BeastState, type Strike, type Zone, type Tool,
} from '../../mission04/prototype/src/engine/rules.ts';
import { resolveDay, type DayResolution } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';
import { COMBOS, lcg, N_COMBOS, baseFor } from './lib.ts';

type Strategy = 'obvious' | 'spreadAll' | 'adaptiveHerd' | 'smartContrarian';

function crowdSubmissions(N: number, strategy: Strategy, state: BeastState, rand: () => number): Array<{ userId: string; strike: Strike }> {
  const subs: Array<{ userId: string; strike: Strike }> = [];
  const ranked = COMBOS.map((c) => ({ c, b: baseFor(c, state) })).sort((a, b) => b.b - a.b);
  const top = ranked[0].c;
  const leastZone = [...ZONES].sort((a, b) => {
    const za = subs.filter((s) => s.strike.zone === a).length;
    return za - subs.filter((s) => s.strike.zone === b).length;
  })[0];
  for (let i = 0; i < N; i++) {
    let s: Strike;
    if (strategy === 'obvious') s = top;
    else if (strategy === 'spreadAll') s = COMBOS[i % N_COMBOS];
    else if (strategy === 'adaptiveHerd') s = rand() < 0.75 ? top : COMBOS[Math.floor(rand() * N_COMBOS)];
    else {
      // smart: pick the zone with the best (base) that is NOT the most-attacked,
      // and the tool that counters its state
      const z = leastZone;
      const t = TOOLS.slice().sort((a, b) => TOOL_MULT[b][state.zoneState[z]] - TOOL_MULT[a][state.zoneState[z]])[0];
      s = { zone: z, tool: t };
    }
    subs.push({ userId: `u${i}`, strike: s });
  }
  return subs;
}

function runSeason(N: number, strategy: Strategy, days: number, target: (n: number) => number, seed = 31415) {
  const rand = lcg(seed + N);
  let st = genesisState(1);
  const recent: Array<Record<string, number>> = [];
  let slaIn = 0;
  const zoneTrajectory: string[] = [];
  let firstSlainDay = -1;
  for (let d = 1; d <= days; d++) {
    const subs = crowdSubmissions(N, strategy, st, rand);
    const res = resolveDay(d, st, subs);
    // override the engine's integrity with the candidate target for comparison
    const outcome = res.totalDamage >= target(res.n) ? 'SLAIN' : 'ESCAPED';
    if (outcome === 'SLAIN') { slaIn++; if (firstSlainDay < 0) firstSlainDay = d; }
    recent.push(res.zoneShare);
    if (d <= 6 || d % 20 === 0) zoneTrajectory.push(`d${d}:${ZONES.map((z) => st.zoneState[z][0]).join('')}${outcome === 'SLAIN' ? 'S' : 'e'}`);
    const resWithOutcome = { ...res, outcome } as DayResolution;
    st = molt({ nextDay: d + 1, resolution: resWithOutcome, recentZoneShares: recent, previousState: st });
  }
  return { slaIn, days, firstSlainDay, zoneTrajectory };
}

console.log('============================================================');
console.log('MISSION 06 — MULTI-DAY EQUILIBRIUM / DEGENERACY SIM');
console.log('============================================================');
console.log('Real engine (resolveDay+molt). Legend z:zoneState initials (e/a/r), S=slain e=escape.\n');

for (const [label, target] of [['CURRENT sqrt(1000)', (n: number) => Math.min(1000 * Math.sqrt(n), 12000)], ['LINEAR k=27', (n: number) => 27 * n]] as const) {
  console.log(`########## target = ${label} ##########`);
  for (const N of [8, 50, 200, 1000]) {
    for (const strategy of ['obvious', 'spreadAll', 'adaptiveHerd', 'smartContrarian'] as Strategy[]) {
      const r = runSeason(N, strategy, 120, target);
      console.log(`  N=${String(N).padStart(4)} ${strategy.padEnd(15)} slain ${String(r.slaIn).padStart(3)}/120  firstSlain=${String(r.firstSlainDay).padStart(4)}  ${r.zoneTrajectory.slice(0, 6).join('  ')}`);
    }
    console.log();
  }
}
console.log('Key question: does any STATIC strategy win ~every day (degenerate), or is');
console.log('the win rate sensitive to strategy (decision matters)?\n');
console.log('Done.');
