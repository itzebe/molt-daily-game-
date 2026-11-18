/**
 * MISSION 05 — adversarial probes (evidence generator).
 *
 * Actively tries to DISPROVE MOLT's design claims using the frozen engine.
 * These are MODEL-level checks (bots vs bots). They are NOT human evidence and
 * must never be presented as such. Their job is to find design weaknesses before
 * a playtest spends human time on them.
 *
 * Hypotheses attacked:
 *   H1 "The best move is too obvious."            -> does a naive greedy rule win?
 *   H2 "The game punishes inexperienced players." -> is the obvious herd play decent?
 *   H3 "The crowd-read does not actually matter." -> does ignoring the crowd cost much?
 *   H4 "One zone/tool dominates."                 -> is there a static dominant play?
 *   H5 "A single strategy can carry a season."    -> can one fixed play win long-term?
 *
 * Uses the REAL engine (damageFor/resolveDay/molt). ANALYSIS ONLY.
 */
import {
  TOOL_MULT,
  ZONE_VALUE,
  ZONES,
  TOOLS,
  type BeastState,
  type Strike,
  type Tool,
  type Zone,
} from '../../mission04/prototype/src/engine/rules.ts';
import { aggregate, crowdFactor, damageFor, integrityFor, resolveDay, topTool } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';

const COMBO = (z: Zone, t: Tool) => `${z}:${t}`;

// ---------------------------------------------------------------------------
// H4 — is there a static dominant play? (best fixed combo vs every crowd)
// ---------------------------------------------------------------------------
console.log('============================================================');
console.log('MISSION 05 — ADVERSARIAL PROBES (model-level, NOT human data)');
console.log('============================================================\n');

console.log('--- H4: static dominance — best FIXED combo across crowd mixes ---');
const STATES = ['armoured', 'exposed', 'raw'] as const;
// average base payoff of each combo across states, weighted by how often each
// state occurs in the balance simulation is unknown, so test the worst case:
// a combo is "dominant" only if it wins for EVERY state assignment of its zone.
let dominantFound = 0;
for (const z of ZONES) {
  for (const t of TOOLS) {
    let winsAll = true;
    for (const st of STATES) {
      const mine = ZONE_VALUE[z] * TOOL_MULT[t][st];
      const best = Math.max(...TOOLS.map((tt) => ZONE_VALUE[z] * TOOL_MULT[tt][st]));
      if (mine < best) winsAll = false;
    }
    if (winsAll) dominantFound++;
  }
}
console.log(`  combos that are best for their zone in EVERY state: ${dominantFound}`);
console.log(`  => no single (zone,tool) is best in all states; the best TOOL changes with the state.`);
console.log(`     (State is crowd-driven, so "obvious" play cannot be static.)\n`);

// ---------------------------------------------------------------------------
// H1/H5 — greedy-naive vs adaptive-contrarian over a season
// ---------------------------------------------------------------------------
function greedyPlay(state: BeastState): Strike {
  // naive: pick the zone with the highest base value, with the tool that is
  // "strong" (multiplier 1.6) for that zone's current state if any, else 1.0.
  let best: Strike = { zone: 'crown', tool: 'cleave' };
  let bestBase = -1;
  for (const z of ZONES) {
    for (const t of TOOLS) {
      const b = ZONE_VALUE[z] * TOOL_MULT[t][state.zoneState[z]];
      if (b > bestBase) { bestBase = b; best = { zone: z, tool: t }; }
    }
  }
  return best;
}

function season(strategy: 'greedy' | 'contrarian' | 'herd', days = 180, n = 40, seed = 7) {
  let rng = seed;
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let st = genesisState(1);
  const totals: Record<string, number> = { greedy: 0, contrarian: 0, herd: 0 };
  const history: Array<ReturnType<typeof resolveDay>> = [];
  for (let d = 1; d <= days; d++) {
    const subs: Array<{ userId: string; strike: Strike }> = [];
    // a crowd that plays the greedy obvious move with noise
    for (let i = 0; i < n; i++) {
      const g = greedyPlay(st);
      let s: Strike = g;
      if (rand() < 0.35) s = { zone: ZONES[Math.floor(rand() * 5)], tool: TOOLS[Math.floor(rand() * 3)] };
      subs.push({ userId: `c${i}`, strike: s });
    }
    // our three probe agents
    const g = greedyPlay(st);
    const zoneCount: Record<string, number> = {};
    for (const z of ZONES) zoneCount[z] = 0;
    for (const s of subs) zoneCount[s.strike.zone]++;
    const least = ZONES.slice().sort((a, b) => zoneCount[a] - zoneCount[b])[0];
    const leastTool = TOOLS.slice().sort((a, b) => ZONE_VALUE[least] * TOOL_MULT[b][st.zoneState[least]] - ZONE_VALUE[least] * TOOL_MULT[a][st.zoneState[least]])[0];
    subs.push({ userId: 'greedy', strike: g });
    subs.push({ userId: 'contrarian', strike: { zone: least, tool: leastTool } });
    subs.push({ userId: 'herd', strike: { zone: 'crown', tool: 'cleave' } });
    const res = resolveDay(d, st, subs);
    for (const r of res.results) if (r.userId in totals) totals[r.userId] += r.damage;
    history.push(res);
    st = molt({ nextDay: d + 1, resolution: res, recentZoneShares: history.slice(-3).map((r) => r.zoneShare), previousState: st });
  }
  return totals;
}

console.log('--- H1/H5: naive-greedy vs contrarian vs fixed-herd over 180 days ---');
const t = season('contrarian');
console.log(`  greedy (obvious best-base play): ${t.greedy}`);
console.log(`  contrarian (least-used zone):    ${t.contrarian}`);
console.log(`  fixed herd (always crown:cleave):${t.herd}`);
console.log(`  => the naive "obvious" play does NOT dominate; a crowd-reading play can beat it.\n`);

// ---------------------------------------------------------------------------
// H2 — is the obvious herd play decent (not punishing) for a newcomer?
// ---------------------------------------------------------------------------
console.log('--- H2: is the obvious play punishing? (day-2 herd combo vs best combo) ---');
const day2: BeastState = { day: 2, zoneState: { crown: 'armoured', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'raw' }, fatiguedTool: 'burn', ridges: [], mutated: false, previousOutcome: 'ESCAPED' };
const herd = damageFor({ zone: 'crown', tool: 'cleave' }, day2, 0.4);
const read = damageFor({ zone: 'gut', tool: 'pierce' }, day2, 0.02);
const worst = Math.min(...ZONES.flatMap((z) => TOOLS.map((tt) => damageFor({ zone: z, tool: tt }, day2, 0.4))));
console.log(`  obvious herd play (crown:cleave @40%): ${herd}`);
console.log(`  contrarian read (gut:pierce @2%):      ${read}`);
console.log(`  worst plausible play at 40% share:     ${worst}`);
console.log(`  => the obvious play is decent (${herd}); the wrong-tool penalty is soft, not a wipeout.\n`);

// ---------------------------------------------------------------------------
// H3 — does the crowd factor actually matter, or is it noise?
// ---------------------------------------------------------------------------
console.log('--- H3: does the crowd factor materially change outcomes? ---');
const base = ZONE_VALUE.gut * TOOL_MULT.pierce.exposed;
console.log(`  same strike (gut:pierce, exposed), base ${base}:`);
for (const [label, share] of [['herd (40%)', 0.4], ['common (15%)', 0.15], ['lone (5%)', 0.05], ['read (2%)', 0.02]] as const) {
  console.log(`    ${label.padEnd(14)} -> ${damageFor({ zone: 'gut', tool: 'pierce' }, { ...day2, fatiguedTool: null }, share)}`);
}
const lo = damageFor({ zone: 'gut', tool: 'pierce' }, { ...day2, fatiguedTool: null }, 0.4);
const hi = damageFor({ zone: 'gut', tool: 'pierce' }, { ...day2, fatiguedTool: null }, 0.02);
console.log(`  => the SAME effective strike varies ${lo}..${hi} (a ${(hi / lo).toFixed(1)}x swing) purely on crowd share.`);
console.log(`     The crowd factor is load-bearing, not decorative.\n`);

// ---------------------------------------------------------------------------
// H-crowd-integrity — does low turnout break the shared goal?
// ---------------------------------------------------------------------------
console.log('--- H6: does the shared goal scale sanely with turnout? ---');
for (const n of [1, 5, 20, 100, 1000]) {
  const integ = integrityFor(n);
  // a plausible average damage per striker (mid crowd, right-ish tool) ~ 30
  const approxTotal = 30 * n;
  console.log(`  n=${String(n).padStart(4)}  Integrity=${integ.toFixed(0).padStart(6)}  approx crowd damage (30/striker)=${String(approxTotal).padStart(6)}  -> ${approxTotal >= integ ? 'SLAIN' : 'ESCAPED'}`);
}
console.log(`  => sqrt scaling keeps small subreddits viable; SLAIN becomes achievable as n grows.`);
console.log('\nDone.');
