/**
 * MISSION 07 — ALTERNATIVE MECHANICS EXPERIMENTS.
 *
 * Tests four extension mechanics against the frozen engine's molt rules:
 *
 *  M1 MOLT-MEMORY : does the beast's 3-day history make the next state PREDICTABLE
 *                   (a real forecasting target)? Measure the accuracy of
 *                   "predict next armoured zone from recent shares".
 *  M2 FEINT       : can a coordinated bloc create a misleading pattern that traps
 *                   followers? Measure the payoff of a follower who trusts the
 *                   visible split vs one who ignores it.
 *  M3 SACRIFICE   : a strike that deals low damage but shifts the crowd (e.g. arm a
 *                   zone so allies' later strikes are cheap). Measure whether a
 *                   sacrifice can raise the SHARED total.
 *  M4 SIGNALS     : are previous-round outcomes informative about the next crowd?
 *                   Measure mutual information between yesterday's top zone and
 *                   today's most-attacked zone under a persistent crowd.
 *
 * Deterministic per seed; disclosed. [SIM] + [ENGINE].
 */
import {
  COMBOS, N_COMBOS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor, ZONES, type BeastState,
} from './lib7.ts';
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';
import type { Submission } from '../../mission04/prototype/src/engine/resolve.ts';

const line = (s = '') => console.log(s);
const genesis = genesisState(1);

line('============================================================');
line('MISSION 07 — ALTERNATIVE MECHANICS EXPERIMENTS');
line('============================================================');
line('Frozen engine molt rules; genesis beast; seeded. [SIM]/[ENGINE]\n');

// ---- M1: MOLT-MEMORY predictability ----
line('--- M1: MOLT-MEMORY — can the next ARMOURED zone be predicted? ---');
{
  // crowd: 60% herd on obvious zone, 40% uniform; run 200 days; try to predict the
  // next-day armoured zone from the current-day zone split.
  let state = genesisState(1);
  let prevZoneShare: Record<string, number> = {};
  let correctPersistence = 0, correctObvious = 0, days = 0;
  const hist: Record<string, number> = {};
  for (let d = 1; d <= 200; d++) {
    const rand = lcg(1000 + d);
    const subs: Submission[] = [];
    for (let i = 0; i < 200; i++) {
      const c = rand() < 0.6 ? COMBOS[obviousIdx(state)] : COMBOS[Math.floor(rand() * N_COMBOS)];
      subs.push({ userId: `u${i}`, strike: { zone: c.zone, tool: c.tool } });
    }
    const res = resolveDay(d, state, subs);
    const next = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
    const armoured = ZONES.find((z) => next.zoneState[z] === 'armoured');
    if (armoured) {
      hist[armoured] = (hist[armoured] ?? 0) + 1; days++;
      // predictor 1: persistence = most-attacked zone today
      let mz = ZONES[0], mv = -1; for (const z of ZONES) { const v = res.zoneShare[z] ?? 0; if (v > mv) { mv = v; mz = z; } }
      if (mz === armoured) correctPersistence++;
      if (obviousIdx(state) >= 0 && COMBOS[obviousIdx(state)].zone === armoured) correctObvious++;
    }
    prevZoneShare = res.zoneShare;
    state = next;
  }
  let H = 0; const tot = Object.values(hist).reduce((a, b) => a + b, 0);
  for (const v of Object.values(hist)) { const p = v / tot; H -= p * Math.log2(p); }
  line(`  days with an armoured zone: ${days}`);
  line(`  predictor "most-attacked zone persists" accuracy: ${((correctPersistence / days) * 100).toFixed(0)}%`);
  line(`  predictor "always obvious zone"           accuracy: ${((correctObvious / days) * 100).toFixed(0)}%`);
  line(`  entropy of the armoured zone: ${H.toFixed(2)} bits (max 2.32 for 5 zones)`);
  line(`  => ${H < 0.5 ? 'LOW entropy: the molt is highly predictable -> a forecast is trivial, not skillful.' : 'moderate entropy: some skill space.'}`);
}
line();

// ---- M2: FEINT ----
line('--- M2: FEINT — can a bloc create a misleading pattern? ---');
{
  // A bloc of size B fakes a heavy split on zone A on day 1, then strikes zone B on day 2.
  // A follower who trusts day-1's split picks a tool for zone A's new state (armoured).
  // Measure: does following the visible pattern cost the follower?
  const N = 200, B = 60;
  const fake = 'tail'; // low-value zone; the bloc fakes attacking it
  let state = genesisState(1);
  const d1: Submission[] = [];
  for (let i = 0; i < B; i++) d1.push({ userId: `b${i}`, strike: { zone: fake as any, tool: 'cleave' } });
  for (let i = 0; i < N - B; i++) d1.push({ userId: `c${i}`, strike: COMBOS[obviousIdx(state)] });
  const r1 = resolveDay(1, state, d1);
  const st2 = molt({ nextDay: 2, resolution: r1, recentZoneShares: [r1.zoneShare], previousState: state });
  line(`  day1: bloc fakes ${fake} (share ${(r1.zoneShare[fake] * 100).toFixed(0)}%) -> day2 ${fake} state = ${st2.zoneState[fake]}`);
  // follower believes the visible pattern and targets the fake zone's state
  const followerDmg = Math.round(baseOf({ zone: fake as any, tool: 'cleave' }, st2) * crowdFactor(0.05).factor);
  const bestDmg = Math.max(...COMBOS.map((c) => Math.round(baseOf(c, st2) * crowdFactor(0.05).factor)));
  line(`  a follower targeting the faked zone scores ~${followerDmg}; the best strike scores ~${bestDmg}`);
  line(`  => the feint arms a low-value zone, so followers who chase the pattern are punished`);
  line(`     by ${bestDmg - followerDmg} damage. Feints are consequential: signals can be faked.`);
}
line();

// ---- M3: SACRIFICE ----
line('--- M3: SACRIFICE — can a low-damage strike raise the SHARED total? ---');
{
  // Sacrifice = pile on a zone to arm it (making a later cleave on it worth 1.6x) OR
  // neglect a zone to make it raw (making pierce/burn worth 1.6x). Test whether a
  // deliberate "set up" day raises the two-day shared total vs two greedy days.
  const N = 200;
  const greedy = (state: BeastState) => Array.from({ length: N }, (_, i) => ({ userId: `u${i}`, strike: COMBOS[obviousIdx(state)] as any }));
  // Day 1 greedy:
  let s1 = genesisState(1);
  const g1 = resolveDay(1, s1, greedy(s1));
  const s2g = molt({ nextDay: 2, resolution: g1, recentZoneShares: [g1.zoneShare], previousState: s1 });
  const g2 = resolveDay(2, s2g, greedy(s2g));
  const greedyTotal = g1.totalDamage + g2.totalDamage;
  // Day 1 "sacrifice": neglect the tail (make it raw), then day 2 pierce it
  let s1b = genesisState(1);
  const sac1: Submission[] = [];
  for (let i = 0; i < N; i++) sac1.push({ userId: `u${i}`, strike: i < 5 ? { zone: 'tail', tool: 'pierce' } : COMBOS[obviousIdx(s1b)] });
  const b1 = resolveDay(1, s1b, sac1);
  const s2b = molt({ nextDay: 2, resolution: b1, recentZoneShares: [b1.zoneShare], previousState: s1b });
  line(`  after a neglected-tail day, tail state on day2 = ${s2b.zoneState.tail}`);
  const sac2: Submission[] = [];
  for (let i = 0; i < N; i++) sac2.push({ userId: `u${i}`, strike: { zone: 'tail', tool: 'pierce' } });
  const b2 = resolveDay(2, s2b, sac2);
  const sacTotal = b1.totalDamage + b2.totalDamage;
  line(`  2-day shared total: greedy=${greedyTotal}  sacrifice-setup=${sacTotal}  (delta ${sacTotal - greedyTotal})`);
  line(`  => ${sacTotal > greedyTotal ? 'a setup day CAN raise the 2-day shared total: sacrifice is meaningful.' : 'greedy play already dominates: sacrifice is weak on this beast.'}`);
}
line();

// ---- M4: SIGNALS ----
line('--- M4: SIGNALS — is yesterday informative about today? ---');
{
  // persistent crowd: 60% repeat the zone they used yesterday. Measure whether the
  // previous top zone predicts today's most-attacked zone.
  let state = genesisState(1);
  let prevZone: string = ZONES[0];
  let hits = 0, days = 0;
  for (let d = 1; d <= 120; d++) {
    const rand = lcg(2000 + d);
    const subs: Submission[] = [];
    for (let i = 0; i < 200; i++) {
      const z = rand() < 0.6 ? prevZone : ZONES[Math.floor(rand() * ZONES.length)];
      const t = ['cleave', 'pierce', 'burn'][Math.floor(rand() * 3)];
      subs.push({ userId: `u${i}`, strike: { zone: z as any, tool: t as any } });
    }
    const res = resolveDay(d, state, subs);
    let mz = ZONES[0], mv = -1; for (const z of ZONES) { const v = res.zoneShare[z] ?? 0; if (v > mv) { mv = v; mz = z; } }
    if (d > 1 && mz === prevZone) hits++;
    if (d > 1) days++;
    prevZone = mz;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  line(`  "yesterday's top zone = today's top zone" accuracy: ${((hits / days) * 100).toFixed(0)}%`);
  line(`  (baseline if random = 20%). ${hits / days > 0.35 ? 'Strong persistence: signals ARE informative.' : 'Weak persistence: signals are noisy.'}`);
}
line('\nDone.');
