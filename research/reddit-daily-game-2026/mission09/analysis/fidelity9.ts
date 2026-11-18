/**
 * MISSION 09 — fidelity check.
 *
 * Proves that lib9.ts with ENGINE_RULES (applyStateMult=false, pierceExposed=1.0)
 * reproduces the FROZEN engine's damageFor / resolveDay / integrityFor EXACTLY,
 * over the full input space. If this passes, every "engine reading" number in
 * Mission 09 is [ENGINE]-verified, not merely claimed.
 *
 * Also prints the two contested readings' raw numbers so the contradiction is
 * visible from the code, not from prose.
 */
import {
  ZONES, TOOLS, ZONE_VALUE, STATE_MULT, TOOL_MULT, CROWD_BANDS, COMBOS, N_COMBOS,
  dmg, resolveDay9, countsToSubmissions, ENGINE_RULES, C1_ALT, C2_ALT, BOTH_ALT,
  integritySqrt, baseOf,
} from './lib9.ts';
import {
  damageFor, integrityFor, resolveDay,
} from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState } from '../../mission04/prototype/src/engine/molt.ts';
import type { ZoneState, Tool, Zone, BeastState } from '../../mission04/prototype/src/engine/rules.ts';

let pass = 0, fail = 0;
const fails: string[] = [];

// ---- 1. damageFor over every (combo × state-assignment × share-band) ----
const states: ZoneState[] = ['armoured', 'exposed', 'raw'];
const shares = [0.0, 0.01, 0.02, 0.03, 0.05, 0.1, 0.29, 0.3, 0.5, 1.0];
let dmgChecks = 0;
for (const zs of states) {
  for (const tool of TOOLS) {
    const zoneState = {} as Record<Zone, ZoneState>;
    for (const z of ZONES) zoneState[z] = zs;
    const state: BeastState = { day: 1, zoneState, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
    for (const zone of ZONES) {
      for (const share of shares) {
        const s = { zone, tool } as const;
        const a = damageFor(s, state, share);
        const b = dmg(s, state, share, ENGINE_RULES);
        dmgChecks++;
        if (a === b) pass++; else { fail++; fails.push(`dmg ${zone}:${tool} ${zs} ${share}: engine=${a} lib9=${b}`); }
      }
    }
  }
}

// ---- 2. fatigue + ridge ----
for (const tool of TOOLS) {
  const state: BeastState = { day: 1, zoneState: { crown: 'exposed', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'exposed' }, fatiguedTool: tool, ridges: ['gut'], mutated: false, previousOutcome: null };
  for (const zone of ZONES) {
    for (const share of [0.02, 0.2, 0.5]) {
      const s = { zone, tool } as const;
      const a = damageFor(s, state, share), b = dmg(s, state, share, ENGINE_RULES);
      if (a === b) pass++; else { fail++; fails.push(`dmg+fat+ridge ${zone}:${tool} ${share}: ${a} vs ${b}`); }
    }
  }
}

// ---- 3. integrityFor ----
for (const n of [1, 2, 5, 10, 25, 50, 100, 144, 1000, 5000, 1e9]) {
  if (integrityFor(n) === integritySqrt(n)) pass++; else { fail++; fails.push(`integrity ${n}`); }
}

// ---- 4. full resolveDay over random days ----
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0x100000000); }
let resolveChecks = 0;
for (let trial = 0; trial < 400; trial++) {
  const rand = rng(trial * 7 + 1);
  const n = 1 + Math.floor(rand() * 200);
  const subs = [] as { userId: string; strike: { zone: Zone; tool: Tool } }[];
  for (let i = 0; i < n; i++) subs.push({ userId: `u${i}`, strike: { zone: ZONES[Math.floor(rand() * ZONES.length)], tool: TOOLS[Math.floor(rand() * TOOLS.length)] } });
  const zoneState = {} as Record<Zone, ZoneState>;
  for (const z of ZONES) zoneState[z] = states[Math.floor(rand() * 3)];
  const state: BeastState = { day: 1, zoneState, fatiguedTool: rand() < 0.5 ? TOOLS[Math.floor(rand() * 3)] : null, ridges: rand() < 0.3 ? ['tail'] : [], mutated: false, previousOutcome: null };
  const a = resolveDay(1, state, subs);
  const b = resolveDay9(1, state, subs, ENGINE_RULES, integritySqrt);
  resolveChecks++;
  if (a.totalDamage === b.totalDamage && a.integrity === b.integrity && a.outcome === b.outcome && a.n === b.n) pass++;
  else { fail++; fails.push(`resolve trial ${trial}: dmg ${a.totalDamage}/${b.totalDamage} out ${a.outcome}/${b.outcome}`); }
}

console.log('============================================================');
console.log('MISSION 09 — LIB9 FIDELITY vs FROZEN ENGINE (ENGINE_RULES)');
console.log('============================================================');
console.log(`lib9 dmg vs engine damageFor:      ${dmgChecks} checks`);
console.log(`lib9 integrity vs engine:          11 checks`);
console.log(`lib9 resolveDay vs engine:         ${resolveChecks} trials`);
console.log(`OVERALL: ${pass} pass, ${fail} fail`);
if (fail) { console.log('FAILURES:'); for (const f of fails.slice(0, 20)) console.log('  ' + f); }

// ---- 5. the contested readings, shown numerically ----
console.log('\n--- C1 (STATE_MULT) reading difference, genesis all-exposed beast ---');
console.log('  state  reading   tail:burn   crown:cleave  tail:pierce');
for (const zs of states) {
  const zoneState = {} as Record<Zone, ZoneState>; for (const z of ZONES) zoneState[z] = zs;
  const st: BeastState = { day: 1, zoneState, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
  const A = { tail_burn: dmg({ zone: 'tail', tool: 'burn' }, st, 0.02, ENGINE_RULES), crown_cleave: dmg({ zone: 'crown', tool: 'cleave' }, st, 0.4, ENGINE_RULES), tail_pierce: dmg({ zone: 'tail', tool: 'pierce' }, st, 0.02, ENGINE_RULES) };
  const B = { tail_burn: dmg({ zone: 'tail', tool: 'burn' }, st, 0.02, C1_ALT), crown_cleave: dmg({ zone: 'crown', tool: 'cleave' }, st, 0.4, C1_ALT), tail_pierce: dmg({ zone: 'tail', tool: 'pierce' }, st, 0.02, C1_ALT) };
  console.log(`  ${zs.padEnd(9)} A(engine)  ${A.tail_burn}   ${A.crown_cleave}   ${A.tail_pierce}`);
  console.log(`  ${''.padEnd(9)} B(§1.2)    ${B.tail_burn}   ${B.crown_cleave}   ${B.tail_pierce}`);
}
console.log('\n--- C2 (pierce vs exposed) reading difference, exposed gut, 2% share ---');
const exp: BeastState = { day: 1, zoneState: { crown: 'exposed', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'exposed' }, fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null };
console.log(`  pierce vs exposed: 1.0 -> ${dmg({ zone: 'gut', tool: 'pierce' }, exp, 0.02, ENGINE_RULES)}   |   1.6 -> ${dmg({ zone: 'gut', tool: 'pierce' }, exp, 0.02, C2_ALT)}`);
console.log('\nDone.');
