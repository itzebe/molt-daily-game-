/**
 * Mission 10 — INDEPENDENT verification harness.
 *
 * This script does NOT trust the implementation agent's tests. It:
 *   1. imports the CHANGED engine and the PRISTINE baseline engine side by side
 *      (baseline from a separate git worktree at commit bc49714);
 *   2. proves the runtime integrity function is exactly 30 × N with N unchanged;
 *   3. proves every preserved mechanic is byte-for-byte identical between baseline
 *      and changed engines over a large randomised differential (damage, molt,
 *      crowd factor, outcome) — the ONLY divergence permitted is the SLAIN/ESCAPED
 *      boundary, which is exactly the integrity change;
 *   4. confirms the changed engine contains no active sqrt/Min integrity path.
 *
 * Run: node --experimental-strip-types analysis/independent-verification.ts
 */
import { integrityFor as changedIntegrity } from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/resolve.ts';
import { integrityFor as baseIntegrity } from '/tmp/molt-baseline/research/reddit-daily-game-2026/mission04/prototype/src/engine/resolve.ts';
import * as C from '/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/game.ts';
import * as B from '/tmp/molt-baseline/research/reddit-daily-game-2026/mission04/prototype/src/engine/game.ts';

let pass = 0;
let fail = 0;
const failures: string[] = [];
function ok(cond: boolean, msg: string) {
  if (cond) { pass++; } else { fail++; failures.push(msg); }
}

// ---- 1. runtime integrity is exactly 30 × N, N unchanged ----
const NS = [0, 1, 2, 3, 7, 10, 37, 100, 999, 1000, 5000, 100000, 1000000];
for (const n of NS) {
  ok(changedIntegrity(n) === 30 * n, `integrityFor(${n}) = ${changedIntegrity(n)} != ${30 * n}`);
}
// N semantics unchanged: integrity depends only on distinct-striker count.
ok(changedIntegrity(100) === 3000 && changedIntegrity(1000) === 30000, 'linear scaling');
// baseline was sqrt (sanity: the two differ, so the change is real)
ok(baseIntegrity(1000) !== changedIntegrity(1000), 'baseline and changed differ (change is live)');
ok(baseIntegrity(1000) === 12000, 'baseline reproduces the old capped sqrt value');

// ---- 2. no active sqrt/Min integrity path in the changed module ----
const src = await import('node:fs').then((fs) =>
  fs.readFileSync('/workspace/project/research/reddit-daily-game-2026/mission04/prototype/src/engine/resolve.ts', 'utf8'));
ok(!/Math\.sqrt\(n\)/.test(src), 'changed resolve.ts still contains Math.sqrt(n)');
ok(!/INTEGRITY_CAP/.test(src), 'changed resolve.ts still references INTEGRITY_CAP');
ok(/INTEGRITY_COEFF \* n/.test(src), 'changed resolve.ts does not compute INTEGRITY_COEFF * n');

// ---- 3. differential: preserved mechanics identical, only outcome boundary differs ----
function rngFactory(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}

const ZONES = ['crown', 'hide', 'gut', 'claw', 'tail'] as const;
const TOOLS = ['cleave', 'pierce', 'burn'] as const;
type Z = (typeof ZONES)[number];
type T = (typeof TOOLS)[number];

let damageChecks = 0;
let crowdChecks = 0;
let moltChecks = 0;
let outcomeBoundaryChecks = 0;
let outcomeDivergences = 0;

for (let seed = 1; seed <= 400; seed++) {
  const rand = rngFactory(seed * 2654435761);
  const state = {
    day: 1 + Math.floor(rand() * 20),
    zoneState: Object.fromEntries(ZONES.map((z) => [z, (['armoured', 'exposed', 'raw'] as const)[Math.floor(rand() * 3)]])) as any,
    fatiguedTool: (rand() < 0.5 ? null : TOOLS[Math.floor(rand() * 3)]) as T | null,
    ridges: ZONES.filter(() => rand() < 0.2) as unknown as Z[],
    mutated: rand() < 0.3,
    previousOutcome: (['SLAIN', 'ESCAPED', null] as const)[Math.floor(rand() * 3)],
  };
  const strike = { zone: ZONES[Math.floor(rand() * 5)] as Z, tool: TOOLS[Math.floor(rand() * 3)] as T };
  const share = rand();

  // damageFor must be identical (state, tool, zone coefficients untouched)
  const dc = C.damageFor(strike, state as any, share);
  const db = B.damageFor(strike, state as any, share);
  damageChecks++;
  ok(dc === db, `damageFor diverged seed=${seed} ${JSON.stringify(strike)} share=${share}: ${dc} vs ${db}`);

  // crowdFactor identical
  const cc = C.crowdFactor(share).factor;
  const cb = B.crowdFactor(share).factor;
  crowdChecks++;
  ok(cc === cb, `crowdFactor diverged seed=${seed} share=${share}: ${cc} vs ${cb}`);
}

// Full-day differential with a real crowd: only the SLAIN/ESCAPED boundary may differ.
for (let seed = 1; seed <= 300; seed++) {
  const rand = rngFactory(seed * 40503);
  const n = 1 + Math.floor(rand() * 120);
  const subs: Array<{ userId: string; strike: { zone: Z; tool: T } }> = [];
  for (let i = 0; i < n; i++) {
    subs.push({ userId: `u${i}`, strike: { zone: ZONES[Math.floor(rand() * 5)], tool: TOOLS[Math.floor(rand() * 3)] } });
  }
  const state = B.genesisState(1);
  const rc = C.resolveDay(1, state, subs);
  const rb = B.resolveDay(1, state, subs);
  // identical N, damage, aggregate, per-submission damage
  ok(rc.n === rb.n, `N diverged seed=${seed}`);
  ok(rc.totalDamage === rb.totalDamage, `totalDamage diverged seed=${seed}: ${rc.totalDamage} vs ${rb.totalDamage}`);
  ok(JSON.stringify(rc.aggregate) === JSON.stringify(rb.aggregate), `aggregate diverged seed=${seed}`);
  ok(
    rc.results.every((r, i) => r.damage === rb.results[i].damage && r.isRead === rb.results[i].isRead),
    `per-submission results diverged seed=${seed}`,
  );
  // integrity differs by design
  ok(rc.integrity === 30 * n, `changed integrity != 30N seed=${seed}`);
  // outcome: must equal the new rule totalDamage >= 30N; may differ from baseline
  const expected = rc.totalDamage >= 30 * n ? 'SLAIN' : 'ESCAPED';
  ok(rc.outcome === expected, `changed outcome wrong seed=${seed}`);
  outcomeBoundaryChecks++;
  if (rc.outcome !== rb.outcome) {
    outcomeDivergences++;
    // The divergence must be EXACTLY explained by the integrity boundary: totalDamage
    // must lie strictly between the two targets (one says SLAIN, the other ESCAPED).
    const lo = Math.min(rc.integrity, rb.integrity);
    const hi = Math.max(rc.integrity, rb.integrity);
    ok(
      rc.totalDamage >= lo && rc.totalDamage < hi,
      `outcome diverged but totalDamage ${rc.totalDamage} not between targets [${lo},${hi}) seed=${seed}`,
    );
  }

  // molt from the (identical) resolution: the ONLY permitted divergence is via the
  // §3.7 escape penalty, which reads resolution.outcome. So molt MUST be identical
  // whenever outcome is identical, and may differ only when outcome differs.
  const mc = C.molt({ nextDay: 2, resolution: rc, recentZoneShares: [rc.zoneShare], previousState: state });
  const mb = B.molt({ nextDay: 2, resolution: rb, recentZoneShares: [rb.zoneShare], previousState: state });
  moltChecks++;
  const moltSame = JSON.stringify(mc) === JSON.stringify(mb);
  if (rc.outcome === rb.outcome) {
    ok(moltSame, `molt diverged with SAME outcome seed=${seed}`);
  } else {
    // different outcome → molt may differ, but must still be a valid state
    ok(ZONES.every((z) => ['armoured', 'exposed', 'raw'].includes(mc.zoneState[z])), `invalid molt state seed=${seed}`);
  }
}

console.log('===== INDEPENDENT VERIFICATION =====');
console.log(`integrity runtime checks : ${NS.length}`);
console.log(`damageFor differentials : ${damageChecks}`);
console.log(`crowdFactor differentials: ${crowdChecks}`);
console.log(`molt differentials       : ${moltChecks}`);
console.log(`day outcome checks       : ${outcomeBoundaryChecks} (outcome divergences vs baseline: ${outcomeDivergences})`);
console.log(`PASS: ${pass}  FAIL: ${fail}`);
if (fail) { console.log('FAILURES:'); failures.slice(0, 20).forEach((f) => console.log(' - ' + f)); process.exit(1); }
console.log('RESULT: all independent checks passed');
