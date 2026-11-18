/**
 * MISSION 06 — static-strategy robustness under the REAL molt rules (fatigue,
 * over-use, neglect, escape penalty).
 *
 * The §8 question: under linear I=kN, is there a STATIC crowd strategy that wins
 * EVERY day (a "solved" game)? Or does the molt ruleset (esp. tool fatigue) keep
 * punishing a fixed strategy so the community must adapt?
 *
 * For each k and each static strategy, run 120 days with the REAL engine and
 * report the SLAIN rate. Deterministic; disclosed seed.
 */
import { ZONES, TOOLS, type Zone, type Tool, type Strike, type BeastState } from '../../mission04/prototype/src/engine/rules.ts';
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';
import { COMBOS, baseFor, dmgFor, lcg, N_COMBOS } from './lib.ts';

type Strat = { name: string; pick: (i: number, state: BeastState, day: number) => number };
const byBase = (state: BeastState) => COMBOS.map((c, i) => ({ i, b: baseFor(c, state) })).sort((a, b) => b.b - a.b).map((x) => x.i);

const strategies: Strat[] = [
  { name: 'static obvious (crown:cleave)', pick: () => 0 },
  { name: 'static spread-all (cycle 15)', pick: (i) => i % N_COMBOS },
  { name: 'static spread-top5 (cycle 5)', pick: (i, s) => byBase(s)[i % 5] },
  { name: 'static right-tool (zone=best tool)', pick: (i, s) => byBase(s)[i % 5] },
  { name: 'adaptive: avoid fatigued tool', pick: (i, s) => {
      // pick a combo whose tool is NOT the fatigued tool, spread across combos
      const cand = COMBOS.map((c, idx) => ({ c, idx })).filter((x) => x.c.tool !== s.fatiguedTool);
      return cand[i % cand.length].idx;
    } },
  { name: 'adaptive: spread + avoid armour', pick: (i, s) => {
      // prefer combos on non-armoured zones, cycle
      const cand = COMBOS.map((c, idx) => ({ c, idx })).filter((x) => s.zoneState[x.c.zone] !== 'armoured');
      return cand.length ? cand[i % cand.length].idx : i % N_COMBOS;
    } },
];

function season(N: number, k: number, strat: Strat, days = 120, seed = 24680) {
  const rand = lcg(seed + N);
  let st = genesisState(1);
  const recent: Array<Record<string, number>> = [];
  let slain = 0;
  for (let d = 1; d <= days; d++) {
    const subs: Array<{ userId: string; strike: Strike }> = [];
    for (let i = 0; i < N; i++) subs.push({ userId: `u${i}`, strike: COMBOS[strat.pick(i, st, d)] });
    const res = resolveDay(d, st, subs);
    const out = res.totalDamage >= k * res.n ? 'SLAIN' : 'ESCAPED';
    if (out === 'SLAIN') slain++;
    recent.push(res.zoneShare);
    st = molt({ nextDay: d + 1, resolution: { ...res, outcome: out } as any, recentZoneShares: recent, previousState: st });
  }
  return slain / days;
}

console.log('============================================================');
console.log('MISSION 06 — STATIC vs ADAPTIVE ROBUSTNESS (real molt rules)');
console.log('============================================================');
console.log('SLAIN rate over 120 days; linear I=kN; 4 populations; 6 strategies.\n');
for (const k of [26, 27, 28]) {
  console.log(`########## k=${k} ##########`);
  console.log(`  ${'strategy'.padEnd(34)} ${[8, 50, 200, 1000].map((n) => `N=${n}`.padStart(7)).join(' ')}`);
  for (const s of strategies) {
    const rates = [8, 50, 200, 1000].map((N) => `${(season(N, k, s) * 100).toFixed(0)}%`.padStart(7));
    console.log(`  ${s.name.padEnd(34)} ${rates.join(' ')}`);
  }
  console.log();
}
console.log('Interpretation: a healthy design has static strategies with MIXED rates');
console.log('(no static strategy at 100%), while an adaptive strategy reaches 100%.');
console.log('If a static strategy is at 100% for all N, the game is "solved".');
console.log('\nDone.');
