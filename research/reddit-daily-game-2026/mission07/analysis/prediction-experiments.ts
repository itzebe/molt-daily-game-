/**
 * MISSION 07 — PREDICTION MECHANIC EXPERIMENTS.
 *
 * Implements and tests THREE distinct forecast-and-strike designs plus the
 * no-change baseline, using the FROZEN engine for damage and a documented
 * scoring overlay (the overlay is a RESEARCH MODEL, not engine code).
 *
 *   V0 baseline : score = damage                                  (no forecast)
 *   V1 herd-call: + BONUS if the player correctly calls the most-attacked ZONE
 *   V2 synced   : damage × (1 + s) if the player calls the herd zone AND strikes
 *                 a DIFFERENT zone (call-the-herd + go elsewhere)
 *   V3 molt-call: + BONUS if the player correctly predicts which ZONE becomes
 *                 ARMOURED next day (the molt)
 *
 * For each version we measure: (a) does a skilled predictor beat a blind
 * disperser? (b) is the bonus gameable by a trivial constant rule? (c) is the
 * correct call non-trivial (entropy of the correct answer)? (d) does it change
 * the shared goal?
 *
 * Deterministic per seed; disclosed. [SIM] + [ENGINE]. Scoring overlay = research model.
 */
import {
  COMBOS, N_COMBOS, baseOf, obviousIdx, rankedByBase, lcg, crowdFactor,
  ZONES, TOOLS, type Combo, type BeastState,
} from './lib7.ts';
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';
import type { Submission } from '../../mission04/prototype/src/engine/resolve.ts';

const line = (s = '') => console.log(s);
const bestToolFor = (z: string, state: BeastState): string => {
  let bt = 'cleave', bv = -1;
  for (const t of ['cleave', 'pierce', 'burn']) { const v = baseOf({ zone: z as any, tool: t as any }, state); if (v > bv) { bv = v; bt = t; } }
  return bt;
};

// ---- player archetypes ----
interface Ctx { i: number; N: number; state: BeastState; prevComboShare: Record<string, number>; prevZoneShare: Record<string, number>; rand: () => number; }
type Player = { name: string; strike: (c: Ctx) => Combo; callHerd?: (c: Ctx) => string; callMolt?: (c: Ctx) => string };

const herdZone = (state: BeastState) => COMBOS[obviousIdx(state)].zone;
const mostAttackedZone = (zs: Record<string, number>): string => {
  let bz = ZONES[0], bv = -1;
  for (const z of ZONES) { const v = zs[z] ?? 0; if (v > bv) { bv = v; bz = z; } }
  return bz;
};
// prediction of the armoured zone next day: over-use (>=0.35) wins; else escape penalty
// (least-hit zone) if escaped. The predictor does not know the outcome, so it bets on over-use.
const predictArmoured = (c: Ctx): string => mostAttackedZone(c.prevZoneShare);

const PLAYERS: Player[] = [
  { name: 'random', strike: (c) => COMBOS[Math.floor(c.rand() * N_COMBOS)], callHerd: (c) => ZONES[Math.floor(c.rand() * 5)], callMolt: (c) => ZONES[Math.floor(c.rand() * 5)] },
  { name: 'blindDispersion', strike: (c) => COMBOS[c.i % N_COMBOS], callHerd: (c) => herdZone(c.state), callMolt: (c) => predictArmoured(c) },
  { name: 'casualHerd', strike: (c) => (c.rand() < 0.7 ? COMBOS[obviousIdx(c.state)] : COMBOS[Math.floor(c.rand() * N_COMBOS)]), callHerd: (c) => herdZone(c.state), callMolt: (c) => herdZone(c.state) },
  { name: 'alwaysCallObvious', strike: (c) => COMBOS[obviousIdx(c.state)], callHerd: (c) => herdZone(c.state), callMolt: (c) => herdZone(c.state) },
  // skilled reader: strikes the highest-base combo that was least-attacked yesterday,
  // and predicts the herd/molt from yesterday's realised zone split (real crowd-reading).
  { name: 'skilledReader', strike: (c) => {
      const scored = COMBOS.map((cc) => ({ cc, s: baseOf(cc, c.state) * (1 - (c.prevComboShare[`${cc.zone}:${cc.tool}`] ?? 0)) }));
      scored.sort((a, b) => b.s - a.s);
      return scored[0].cc;
    }, callHerd: (c) => mostAttackedZone(c.prevZoneShare), callMolt: (c) => predictArmoured(c) },
];

interface VersionSpec { name: string; apply: (baseDmg: number, herdCall: string, moltCall: string, actualHerdZone: string, actualArmoured: string, struckZone: string) => number; }

const VERSIONS: VersionSpec[] = [
  { name: 'V0 baseline (no forecast)', apply: (d) => d },
  { name: 'V1 herd-call +8 bonus', apply: (d, hc, _mc, ah) => d + (hc === ah ? 8 : 0) },
  { name: 'V2 synced (call+go elsewhere, x1.25)', apply: (d, hc, _mc, ah, sz) => Math.round(d * (1 + (hc === ah && hc !== sz ? 0.25 : 0))) },
  { name: 'V3 molt-call +10 bonus', apply: (d, _hc, mc, _ah, _sz, armoured) => d + (mc === armoured ? 10 : 0) },
];

function runVersion(N: number, days: number, seed: number, ver: VersionSpec) {
  const rand = lcg(seed);
  let state = genesisState(1);
  let prevComboShare: Record<string, number> = {};
  let prevZoneShare: Record<string, number> = {};
  const cum: Record<string, number> = Object.fromEntries(PLAYERS.map((p) => [p.name, 0]));
  const correctHerd: Record<string, number> = Object.fromEntries(PLAYERS.map((p) => [p.name, 0]));
  const correctMolt: Record<string, number> = Object.fromEntries(PLAYERS.map((p) => [p.name, 0]));
  const herdZoneHist: Record<string, number> = {};
  let trivialHerdHits = 0, daysCounted = 0, slain = 0;
  const per = Math.floor(N / PLAYERS.length);
  const counts = PLAYERS.map((_, k) => (k === PLAYERS.length - 1 ? N - per * (PLAYERS.length - 1) : per));

  for (let d = 1; d <= days; d++) {
    const subs: Submission[] = []; const owner: string[] = []; const calls: { herd: string; molt: string }[] = [];
    let p = 0;
    for (let k = 0; k < PLAYERS.length; k++) {
      for (let j = 0; j < counts[k]; j++) {
        const ctx: Ctx = { i: p, N, state, prevComboShare, prevZoneShare, rand };
        const s = PLAYERS[k].strike(ctx);
        const hc = PLAYERS[k].callHerd ? PLAYERS[k].callHerd(ctx) : herdZone(state);
        const mc = PLAYERS[k].callMolt ? PLAYERS[k].callMolt(ctx) : herdZone(state);
        subs.push({ userId: `${PLAYERS[k].name}#${j}`, strike: { zone: s.zone, tool: s.tool } });
        owner.push(PLAYERS[k].name); calls.push({ herd: hc, molt: mc }); p++;
      }
    }
    const res = resolveDay(d, state, subs);
    // actual most-attacked zone
    let actualHerd = ZONES[0], av = -1;
    for (const z of ZONES) { const v = res.zoneShare[z] ?? 0; if (v > av) { av = v; actualHerd = z; } }
    herdZoneHist[actualHerd] = (herdZoneHist[actualHerd] ?? 0) + 1;
    if (actualHerd === herdZone(state)) trivialHerdHits++;
    daysCounted++;
    // next-day armoured zone (apply the molt rules)
    const nextState = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
    const armoured = ZONES.find((z) => nextState.zoneState[z] === 'armoured') ?? '';
    const perPlayer: Record<string, { sum: number; n: number }> = {};
    for (let s = 0; s < res.results.length; s++) {
      const nm = owner[s]; const r = res.results[s];
      const sc = ver.apply(r.damage, calls[s].herd, calls[s].molt, actualHerd, armoured, r.strike.zone);
      (perPlayer[nm] ??= { sum: 0, n: 0 }); perPlayer[nm].sum += sc; perPlayer[nm].n++;
      if (calls[s].herd === actualHerd) correctHerd[nm]++;
      if (armoured && calls[s].molt === armoured) correctMolt[nm]++;
    }
    for (const nm of Object.keys(perPlayer)) cum[nm] += perPlayer[nm].sum / perPlayer[nm].n; // MEAN per player
    const out = res.totalDamage >= 27 * res.n ? 'SLAIN' : 'ESCAPED';
    if (out === 'SLAIN') slain++;
    prevComboShare = {}; for (const k of Object.keys(res.aggregate.comboCount)) prevComboShare[k] = res.aggregate.comboCount[k] / res.n;
    prevZoneShare = res.zoneShare;
    state = nextState;
  }
  // entropy of the actual herd zone over days (how predictable the "correct" call is)
  const tot = Object.values(herdZoneHist).reduce((a, b) => a + b, 0);
  let H = 0; for (const v of Object.values(herdZoneHist)) { const p = v / tot; H -= p * Math.log2(p); }
  const ranking = PLAYERS.map((p) => ({ n: p.name, score: cum[p.name] / days, herdAcc: correctHerd[p.name] / days, moltAcc: correctMolt[p.name] / days })).sort((a, b) => b.score - a.score);
  return { ranking, trivialHerdHitRate: trivialHerdHits / daysCounted, herdEntropy: H, herdZoneHist, slainRate: slain / days };
}

line('============================================================');
line('MISSION 07 — PREDICTION MECHANIC EXPERIMENTS');
line('============================================================');
line('Scoring overlay is a RESEARCH MODEL (not engine code); damage from frozen engine.');
line('Scores are mean/day across 60 days x 4 seeds. [SIM]\n');

for (const ver of VERSIONS) {
  line(`########## ${ver.name} ##########`);
  for (const N of [60, 300]) {
    const SEEDS = [1, 2, 3, 4];
    const acc: Record<string, { s: number; h: number; m: number }> = {};
    let trivial = 0, slain = 0, entropy = 0;
    for (const seed of SEEDS) {
      const r = runVersion(N, 60, seed, ver);
      trivial += r.trivialHerdHitRate; slain += r.slainRate; entropy += r.herdEntropy;
      for (const row of r.ranking) { (acc[row.n] ??= { s: 0, h: 0, m: 0 }); acc[row.n].s += row.score; acc[row.n].h += row.herdAcc; acc[row.n].m += row.moltAcc; }
    }
    line(`  N=${N}  (trivial 'always-call-obvious' hit rate = ${((trivial / SEEDS.length) * 100).toFixed(0)}%; herd-zone entropy = ${(entropy / SEEDS.length).toFixed(2)} bits; shared SLAIN ${((slain / SEEDS.length) * 100).toFixed(0)}%)`);
    const rows = Object.entries(acc).map(([n, a]) => ({ n, s: a.s / SEEDS.length, h: a.h / SEEDS.length, m: a.m / SEEDS.length })).sort((a, b) => b.s - a.s);
    for (const r of rows) line(`    ${r.n.padStart(16)} score/day ${r.s.toFixed(2).padStart(7)}  herd-acc ${r.h.toFixed(2).padStart(5)}  molt-acc ${r.m.toFixed(2).padStart(5)}`);
  }
  line();
}
line('Questions answered: does a skilled reader beat blind dispersion under each');
line('version? Is the bonus gameable (trivial hit rate high)? Is the call non-trivial?');
line('\nDone.');
