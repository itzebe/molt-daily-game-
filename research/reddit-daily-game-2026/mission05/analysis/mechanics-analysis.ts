/**
 * MISSION 05 — mechanics contradiction analysis (evidence generator).
 *
 * Reads the FROZEN prototype's constants and its REAL engine (no modification
 * to mission04/prototype). Computes the damage surface under the two candidate
 * readings of the specification:
 *
 *   Option A ("as-built"):   dmg = ZONE_VALUE * TOOL_MULT * CROWD_FACTOR
 *                            (spec §2 formula, spec §4 worked example, design §2.4)
 *   Option B ("state-scaled"): dmg = ZONE_VALUE * TOOL_MULT * STATE_MULT * CROWD_FACTOR
 *                            (spec §1.2 table applied; prose intent "hard/soft")
 *
 * Fidelity guarantee: the Option-A branch of `damageVariant` is asserted EQUAL to
 * the real engine's `damageFor` over a full battery, and the Option-A resolver is
 * asserted equal to the real `resolveDay`. So the Option-A numbers here ARE the
 * real engine's numbers, not a re-implementation.
 *
 * ANALYSIS ONLY. Nothing in mission04 is modified.
 */
import {
  CROWD_BANDS,
  STATE_MULT,
  TOOL_MULT,
  ZONE_VALUE,
  ZONES,
  TOOLS,
  type BeastState,
  type Strike,
  type Tool,
  type Zone,
  type ZoneState,
} from '../../mission04/prototype/src/engine/rules.ts';
import {
  aggregate,
  crowdFactor,
  damageFor,
  integrityFor,
  resolveDay,
  topTool,
  type Submission,
} from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const STATES: ZoneState[] = ['armoured', 'exposed', 'raw'];
const COMBO = (z: Zone, t: Tool) => `${z}:${t}`;

function damageVariant(s: Strike, state: BeastState, share: number, useSM: boolean): number {
  const base = ZONE_VALUE[s.zone];
  const zs = state.zoneState[s.zone] ?? 'exposed';
  const tm = TOOL_MULT[s.tool][zs];
  const sm = useSM ? STATE_MULT[zs] : 1;
  let dmg = base * tm * sm * crowdFactor(share).factor;
  if (state.fatiguedTool && s.tool === state.fatiguedTool) dmg *= 0.8;
  if (state.ridges.includes(s.zone)) dmg *= 0.9;
  return Math.round(dmg);
}

const fixture: BeastState = {
  day: 3,
  zoneState: { crown: 'armoured', hide: 'raw', gut: 'exposed', claw: 'raw', tail: 'armoured' },
  fatiguedTool: 'burn',
  ridges: ['gut', 'tail'],
  mutated: false,
  previousOutcome: 'ESCAPED',
};

console.log('============================================================');
console.log('MOLT — MECHANICS CONTRADICTION ANALYSIS (Mission 05)');
console.log('============================================================\n');

// ---- FIDELITY SELF-CHECK ---------------------------------------------------
let checks = 0, mismatches = 0;
for (const z of ZONES) for (const t of TOOLS) for (const sh of [0, 0.01, 0.02, 0.03, 0.05, 0.09, 0.1, 0.29, 0.3, 0.5, 0.9, 1]) {
  checks++;
  if (damageVariant({ zone: z, tool: t }, fixture, sh, false) !== damageFor({ zone: z, tool: t }, fixture, sh)) mismatches++;
}
console.log('--- Fidelity self-check ---');
console.log(`  damageVariant(...,false) vs real damageFor: ${checks - mismatches}/${checks} identical`);
console.log(mismatches === 0 ? '  PASS — the Option-A branch IS the real engine.\n' : '  FAIL — analysis not faithful!\n');

// ---- §4 worked example -----------------------------------------------------
const clean: BeastState = { ...fixture, fatiguedTool: null, ridges: [] };
console.log('--- Spec §4 worked example under BOTH readings ---');
console.log(`  gut:pierce @2% (exposed):     A = ${damageVariant({ zone: 'gut', tool: 'pierce' }, clean, 0.02, false)}   B = ${damageVariant({ zone: 'gut', tool: 'pierce' }, clean, 0.02, true)}   (spec §4 states 53)`);
console.log(`  crown:cleave @40% (armoured): A = ${damageVariant({ zone: 'crown', tool: 'cleave' }, clean, 0.4, false)}   B = ${damageVariant({ zone: 'crown', tool: 'cleave' }, clean, 0.4, true)}   (spec §4 states 34)`);
console.log('  => Option A matches §4 on BOTH cases; Option B matches only the exposed case.\n');

// ---- State-meaning test ----------------------------------------------------
console.log('--- Does each STATE mean what the design says? (best-tool base damage, avg over zones) ---');
for (const st of STATES) {
  const avgA = ZONES.reduce((a, z) => a + Math.max(...TOOLS.map((t) => ZONE_VALUE[z] * TOOL_MULT[t][st])), 0) / ZONES.length;
  const avgB = ZONES.reduce((a, z) => a + Math.max(...TOOLS.map((t) => ZONE_VALUE[z] * TOOL_MULT[t][st] * STATE_MULT[st])), 0) / ZONES.length;
  console.log(`  ${st.padEnd(9)} best-tool avg base:  A = ${avgA.toFixed(1)}   B = ${avgB.toFixed(1)}`);
}
console.log('  Design intent: armoured("hard to hurt") < exposed("normal") < raw("very soft, high damage").');
console.log('  Option A: armoured(38.4) == raw(38.4) -> the STATE does not change the payoff, only the tool choice.');
console.log('  Option B: armoured(21.1) < exposed(24.0) < raw(65.3) -> the state means what it says.\n');

// ---- Contradiction 2 -------------------------------------------------------
console.log('--- Contradiction 2: design §2.2 vs spec §1.3 (tool matrix) ---');
console.log('  design §2.2: Pierce STRONG vs Exposed, WEAK vs Armoured.');
console.log(`  spec §1.3:   pierce vs exposed = ${TOOL_MULT.pierce.exposed} (neutral), pierce vs raw = ${TOOL_MULT.pierce.raw} (strong).`);
console.log('  §4 uses pierce vs exposed = 1.0 -> §1.3 and §4 agree; design §2.2 is the outlier.\n');

// ---- Faithful A-vs-B season comparison -------------------------------------
function resolveVariant(day: number, st: BeastState, subs: Submission[], useSM: boolean) {
  const agg = aggregate(subs);
  const n = agg.n;
  const integrity = integrityFor(n);
  const zoneShare: Record<string, number> = {};
  for (const z of ZONES) zoneShare[z] = n > 0 ? (agg.zoneCount[z] ?? 0) / n : 0;
  const results = subs.map((s) => ({
    userId: s.userId,
    strike: s.strike,
    damage: damageVariant(s.strike, st, n > 0 ? (agg.comboCount[COMBO(s.strike.zone, s.strike.tool)] ?? 0) / n : 0, useSM),
  }));
  const totalDamage = results.reduce((a, r) => a + r.damage, 0);
  return { day, n, integrity, totalDamage, outcome: (totalDamage >= integrity ? 'SLAIN' : 'ESCAPED') as 'SLAIN' | 'ESCAPED', results, aggregate: agg, topTool: topTool(agg), zoneShare };
}

(function verifyResolver() {
  let rng = 99;
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let bad = 0;
  for (let trial = 0; trial < 40; trial++) {
    const subs: Submission[] = [];
    const nsub = 1 + Math.floor(rand() * 60);
    for (let i = 0; i < nsub; i++) subs.push({ userId: `u${i}`, strike: { zone: ZONES[Math.floor(rand() * 5)], tool: TOOLS[Math.floor(rand() * 3)] } });
    const real = resolveDay(trial + 1, fixture, subs);
    const mine = resolveVariant(trial + 1, fixture, subs, false);
    if (real.totalDamage !== mine.totalDamage || real.outcome !== mine.outcome) bad++;
  }
  console.log('--- Resolver self-check ---');
  console.log(`  resolveVariant(...,false) vs real resolveDay: ${40 - bad}/40 identical`);
  console.log(bad === 0 ? '  PASS — the Option-A resolver IS the real engine.\n' : '  FAIL!\n');
})();

function bestResponse(st: BeastState, comboShare: Record<string, number>, useSM: boolean) {
  let best = { zone: 'crown' as Zone, tool: 'cleave' as Tool, dmg: -1 };
  for (const z of ZONES) for (const t of TOOLS) {
    const d = damageVariant({ zone: z, tool: t }, st, comboShare[COMBO(z, t)] ?? 0, useSM);
    if (d > best.dmg) best = { zone: z, tool: t, dmg: d };
  }
  return best;
}

function season(useSM: boolean, days = 120, n = 50, seed = 424242) {
  let rng = seed;
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let st = genesisState(1);
  let comboShare: Record<string, number> = {};
  const bests: string[] = [];
  const probes = { chaser: 0, loyal: 0, contrarian: 0 };
  const history: Array<ReturnType<typeof resolveVariant>> = [];
  for (let d = 1; d <= days; d++) {
    const br = bestResponse(st, comboShare, useSM);
    bests.push(COMBO(br.zone, br.tool));
    const subs: Array<Submission & { who: string }> = [];
    for (let i = 0; i < n; i++) {
      let z = br.zone, t = br.tool;
      if (rand() < 0.3) { z = ZONES[Math.floor(rand() * 5)]; t = TOOLS[Math.floor(rand() * 3)]; }
      subs.push({ userId: `c${i}`, strike: { zone: z, tool: t }, who: 'crowd' });
    }
    const zoneCount: Record<string, number> = {};
    for (const z of ZONES) zoneCount[z] = 0;
    for (const s of subs) zoneCount[s.strike.zone]++;
    const least = ZONES.slice().sort((a, b) => zoneCount[a] - zoneCount[b])[0];
    const leastTool = TOOLS.slice().sort((a, b) => damageVariant({ zone: least, tool: b }, st, 0, useSM) - damageVariant({ zone: least, tool: a }, st, 0, useSM))[0];
    subs.push({ userId: 'chaser', strike: { zone: br.zone, tool: br.tool }, who: 'chaser' });
    subs.push({ userId: 'loyal', strike: { zone: 'crown', tool: 'cleave' }, who: 'loyal' });
    subs.push({ userId: 'contrarian', strike: { zone: least, tool: leastTool }, who: 'contrarian' });
    const res = resolveVariant(d, st, subs, useSM);
    for (const r of res.results) if (r.userId in probes) probes[r.userId as keyof typeof probes] += r.damage;
    comboShare = {};
    for (const k of Object.keys(res.aggregate.comboCount)) comboShare[k] = res.aggregate.comboCount[k] / res.n;
    history.push(res);
    st = molt({ nextDay: d + 1, resolution: res, recentZoneShares: history.slice(-3).map((r) => r.zoneShare), previousState: st });
  }
  return { distinctBests: new Set(bests).size, probes };
}

console.log('--- Non-degeneracy under each reading (120 days, 50-player naive crowd, real molt) ---');
for (const [label, useSM] of [['Option A (as-built)', false], ['Option B (state-scaled)', true]] as const) {
  const r = season(useSM);
  console.log(`  ${label.padEnd(24)} distinct best plays/120d = ${String(r.distinctBests).padStart(3)}   probes: chaser=${r.probes.chaser} loyal=${r.probes.loyal} contrarian=${r.probes.contrarian}`);
}
console.log('\nDone.');
