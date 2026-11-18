/**
 * Mission 10 — Mission 09 BENCHMARK REPRODUCTION.
 *
 * Drives the REAL, CURRENT engine (mission04/prototype) — the shipped code — and
 * reproduces the Mission 09 integrity findings with the candidate-specific
 * evolving-state methodology (the state evolves UNDER the candidate k, because the
 * §3.7 escape penalty depends on the outcome, which depends on k).
 *
 * Fidelity: at k = 30 this harness's threshold MUST equal the engine's own outcome
 * (the engine now ships Integrity = 30·N). We assert that every day.
 *
 * Run: node --experimental-strip-types analysis/benchmark-reproduction.ts
 */
import {
  resolveDay, ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, MAW,
  type Strike, type Tool, type Zone, type BeastState,
} from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/game.ts';
import { genesisState, molt } from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/molt.ts';

const COMBOS = ZONES.flatMap((z: Zone) => TOOLS.map((t: Tool) => ({ zone: z, tool: t })));
const NC = COMBOS.length;
type Sub = { userId: string; strike: Strike };
function toSubs(counts: number[]): Sub[] {
  const s: Sub[] = [];
  for (let i = 0; i < NC; i++) for (let k = 0; k < counts[i]; k++) s.push({ userId: `u${s.length}`, strike: COMBOS[i] });
  return s;
}
function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0x100000000); }

// ---- strategies (count vectors). Faithful to mission09/analysis/lib9.ts + battery.ts ----
// rank by pure base = ZONE_VALUE × TOOL_MULT (matches lib9 rankedByBase at ENGINE_RULES)
function baseOf(c: { zone: Zone; tool: Tool }, st: BeastState): number {
  const zs = st.zoneState[c.zone] ?? 'exposed';
  const base = c.zone === ('maw' as Zone) ? MAW.value : ZONE_VALUE[c.zone];
  return base * TOOL_MULT[c.tool][zs];
}
function rankByBase(st: BeastState): number[] {
  return COMBOS.map((c, i) => ({ i, v: baseOf(c, st) })).sort((a, b) => b.v - a.v).map((x) => x.i);
}
function obviousIdx(st: BeastState): number { let bi = 0, bv = -1; for (let i = 0; i < NC; i++) { const v = baseOf(COMBOS[i], st); if (v > bv) { bv = v; bi = i; } } return bi; }
function countsTop5(N: number, st: BeastState): number[] { const c = new Array(NC).fill(0); const r = rankByBase(st); for (let i = 0; i < N; i++) c[r[i % 5]]++; return c; }
function countsHerd(N: number, st: BeastState): number[] { const c = new Array(NC).fill(0); c[obviousIdx(st)] = N; return c; }
function countsCycle15(N: number): number[] { const c = new Array(NC).fill(0); for (let i = 0; i < N; i++) c[i % NC]++; return c; }
function countsEven5(N: number): number[] { const c = new Array(NC).fill(0); for (let i = 0; i < N; i++) c[i % 5]++; return c; }
function countsZoneMajor15(N: number): number[] { const c = new Array(NC).fill(0); for (let i = 0; i < N; i++) { const z = ZONES[i % 5]; const t = TOOLS[((i / 5) | 0) % 3]; c[COMBOS.findIndex((x) => x.zone === z && x.tool === t)]++; } return c; }
function countsToolMajor15(N: number): number[] { const c = new Array(NC).fill(0); for (let i = 0; i < N; i++) { const z = ZONES[((i / 3) | 0) % 5]; const t = TOOLS[i % 3]; c[COMBOS.findIndex((x) => x.zone === z && x.tool === t)]++; } return c; }
function countsSingleTool(N: number, tool: Tool): number[] { const c = new Array(NC).fill(0); for (let i = 0; i < N; i++) c[COMBOS.findIndex((x) => x.zone === ZONES[i % 5] && x.tool === tool)]++; return c; }
function countsUniformExpect(N: number): number[] { return new Array(NC).fill(N / NC).map(Math.round); }
function fixedAlloc(N: number, w: number[]): number[] { const c = new Array(NC).fill(0); const tot = w.reduce((a, b) => a + b, 0); let rem = N; for (let i = 0; i < NC && rem > 0; i++) { const k = Math.min(Math.floor((w[i] / tot) * N), rem); c[i] = k; rem -= k; } let i = 0; while (rem > 0) { c[i % NC]++; rem--; i++; } return c; }
function countsRandom(N: number, rand: () => number): number[] { const c = new Array(NC).fill(0); for (let i = 0; i < N; i++) c[Math.floor(rand() * NC)]++; return c; }

interface Rule { name: string; ignores: boolean; make: (N: number, seed: number) => (st: BeastState) => number[]; }
const RULES: Rule[] = [
  { name: 'randomDaily', ignores: true, make: (N, seed) => { const r = lcg(seed + N * 131); return () => countsRandom(N, r); } },
  { name: 'zoneMajor15', ignores: true, make: (N) => () => countsZoneMajor15(N) },
  { name: 'cycle15', ignores: true, make: (N) => () => countsCycle15(N) },
  { name: 'toolMajor15', ignores: true, make: (N) => () => countsToolMajor15(N) },
  { name: 'even5-1tool', ignores: true, make: (N) => () => countsEven5(N) },
  { name: 'allCleave5z', ignores: true, make: (N) => () => countsSingleTool(N, 'cleave') },
  { name: 'allPierce5z', ignores: true, make: (N) => () => countsSingleTool(N, 'pierce') },
  { name: 'allBurn5z', ignores: true, make: (N) => () => countsSingleTool(N, 'burn') },
  { name: 'fixed-uniform', ignores: true, make: (N) => () => countsUniformExpect(N) },
  { name: 'fixed-crown-heavy', ignores: true, make: (N) => () => fixedAlloc(N, [3, 2, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1]) },
  { name: 'fixed-tail-heavy', ignores: true, make: (N) => () => fixedAlloc(N, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5]) },
  { name: 'herdObvious', ignores: true, make: (N) => (st) => countsHerd(N, st) },
  { name: 'TOP5 (engaged)', ignores: false, make: (N) => (st) => countsTop5(N, st) },
];

// Resolve a day with an arbitrary k, using the REAL engine for damage/aggregate/molt.
function resolveK(day: number, state: BeastState, subs: Sub[], k: number) {
  const res = resolveDay(day, state, subs); // real engine: 30N
  const target = k * res.n;
  const outcome: 'SLAIN' | 'ESCAPED' = res.totalDamage >= target ? 'SLAIN' : 'ESCAPED';
  return { ...res, integrity: target, outcome };
}

function simulate(N: number, strat: (st: BeastState) => number[], k: number, days: number, seed: number) {
  let state = genesisState(1);
  let slain = 0; const recent: number[] = []; const sharesHist: Array<Record<string, number>> = [];
  let fidelityOk = true;
  for (let d = 1; d <= days; d++) {
    const counts = strat(state);
    const subs = toSubs(counts);
    const rk = resolveK(d, state, subs, k);
    const real = resolveDay(d, state, subs);
    if (k === 30 && (rk.outcome !== real.outcome || rk.integrity !== real.integrity || rk.totalDamage !== real.totalDamage)) fidelityOk = false;
    if (rk.outcome === 'SLAIN') slain++;
    recent.push(rk.n > 0 ? rk.totalDamage / rk.n : 0);
    if (recent.length > 20) recent.shift();
    sharesHist.push(rk.zoneShare);
    state = molt({ nextDay: d + 1, resolution: rk as any, recentZoneShares: sharesHist, previousState: state });
  }
  return { steady: recent.reduce((a, b) => a + b, 0) / recent.length, slainPct: 100 * slain / days, fidelityOk };
}

const SEEDS = [1, 2, 3, 7, 42, 101, 1234, 9001, 90210];
const KS = [29, 30, 31];
const Ns = [25, 50, 200, 1000];

console.log('============================================================');
console.log('MISSION 10 — MISSION 09 BENCHMARK REPRODUCTION (REAL engine)');
console.log('============================================================');
console.log(`seeds=${SEEDS.length}  N=${Ns.join(',')}  days=150  state evolves under each k\n`);

let fidelityAllOk = true;
const summary: Record<string, Record<string, { maxIgnore: number; top5Min: number }>> = {};
for (const N of Ns) {
  console.log(`########## N = ${N} ##########`);
  console.log(`  ${'rule'.padEnd(18)} ${KS.map((k) => ('k=' + k).padStart(14)).join('')}`);
  const per: Record<string, { maxIgnore: number; top5Min: number }> = {};
  for (const k of KS) per[k] = { maxIgnore: 0, top5Min: 100 };
  for (const rule of RULES) {
    const cells: string[] = [];
    for (const k of KS) {
      let steadySum = 0, slainSum = 0, days = 0;
      for (const seed of SEEDS) {
        const r = simulate(N, rule.make(N, seed), k, 150, seed);
        if (!r.fidelityOk) fidelityAllOk = false;
        steadySum += r.steady; slainSum += r.slainPct; days++;
      }
      const steady = steadySum / SEEDS.length, slainPct = slainSum / SEEDS.length;
      cells.push(`${steady.toFixed(1)}/${slainPct.toFixed(0)}%`.padStart(14));
      if (rule.ignores) per[k].maxIgnore = Math.max(per[k].maxIgnore, slainPct);
      else per[k].top5Min = Math.min(per[k].top5Min, slainPct);
    }
    console.log(`  ${rule.name.padEnd(18)} ${cells.join('')}`);
  }
  summary[`N=${N}`] = per;
}

console.log('\n########## VERDICT (across all N) ##########');
console.log('  k   max SLAIN% over beast-ignoring rules   TOP5 engaged SLAIN% (min over N)');
for (const k of KS) {
  let maxIgnore = 0, top5Min = 100;
  for (const N of Ns) { maxIgnore = Math.max(maxIgnore, summary[`N=${N}`][k].maxIgnore); top5Min = Math.min(top5Min, summary[`N=${N}`][k].top5Min); }
  console.log(`  ${k}   ${maxIgnore.toFixed(1).padStart(6)}%                              ${top5Min.toFixed(1).padStart(6)}%`);
}
console.log(`\nk=30 fidelity vs shipped engine on every day: ${fidelityAllOk ? 'PASS' : 'FAIL'}`);
