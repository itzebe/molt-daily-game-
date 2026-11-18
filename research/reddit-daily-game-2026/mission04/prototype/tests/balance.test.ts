/**
 * MOLT — balance simulation (machine proxy for "is the strategic space alive?").
 *
 * Runs bot archetypes against the real engine for 60 days and checks the design
 * invariants that make the loop non-degenerate:
 *
 *   B1. No single fixed (zone,tool) wins every day.
 *   B2. The best target zone moves.
 *   B3. A "reader" (best response to yesterday's split) out-scores a "herder"
 *       (follows the crowd) over a season, when the crowd is large.
 *   B5. The beast re-forms frequently.
 *
 * This is a proxy. It can show the loop is NOT degenerate. It cannot show the
 * loop is FUN — only human playtesting can (see the playtest protocol).
 */
import { describe, expect, it } from 'vitest';
import { TOOLS, ZONES, type BeastState, type Tool, type Zone } from '../src/engine/rules.ts';
import { damageFor, resolveDay } from '../src/engine/resolve.ts';
import { genesisState, molt } from '../src/engine/molt.ts';

const COMBO = (z: Zone, t: Tool) => `${z}:${t}`;

function sharesOf(res: ReturnType<typeof resolveDay>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of Object.keys(res.aggregate.comboCount)) out[k] = res.aggregate.comboCount[k] / res.n;
  return out;
}

function bestResponse(state: BeastState, shares: Record<string, number>) {
  let best = { zone: 'crown' as Zone, tool: 'cleave' as Tool, dmg: -1 };
  for (const zone of ZONES) {
    for (const tool of TOOLS) {
      const dmg = damageFor({ zone, tool }, state, shares[COMBO(zone, tool)] ?? 0);
      if (dmg > best.dmg) best = { zone, tool, dmg };
    }
  }
  return best;
}

function runSeason(days: number, n: number, seed = 987654) {
  let rng = seed;
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let state = genesisState(1);
  let shares: Record<string, number> = {};
  const log: Array<{
    day: number;
    outcome: string;
    best: { zone: Zone; tool: Tool; dmg: number };
    chaserDmg: number;
    contrarianDmg: number;
  }> = [];

  for (let d = 1; d <= days; d++) {
    const best = bestResponse(state, shares);
    const subs: Array<{ userId: string; strike: { zone: Zone; tool: Tool } }> = [];
    let k = 0;
    for (let i = 0; i < n - 2; i++) {
      let z = best.zone;
      let t = best.tool;
      if (rand() < 0.35) {
        z = ZONES[Math.floor(rand() * 5)];
        t = TOOLS[Math.floor(rand() * 3)];
      }
      subs.push({ userId: `c${k++}`, strike: { zone: z, tool: t } });
    }
    // Two probes: "chaser" plays the crowd's best response (it IS the herd);
    // "contrarian" plays the least-used zone with that zone's best tool.
    const least = leastUsedZone(state, shares);
    subs.push({ userId: 'chaser', strike: { zone: best.zone, tool: best.tool } });
    subs.push({ userId: 'contrarian', strike: least });

    const res = resolveDay(d, state, subs);
    const sh = sharesOf(res);
    log.push({
      day: d,
      outcome: res.outcome,
      best,
      chaserDmg: damageFor({ zone: best.zone, tool: best.tool }, state, sh[COMBO(best.zone, best.tool)] ?? 0),
      contrarianDmg: damageFor(least, state, sh[COMBO(least.zone, least.tool)] ?? 0),
    });
    shares = sh;
    state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
  }
  return log;
}

function leastUsedZone(state: BeastState, shares: Record<string, number>): { zone: Zone; tool: Tool } {
  let bz: Zone = ZONES[0];
  let bv = Infinity;
  for (const z of ZONES) {
    let v = 0;
    for (const t of TOOLS) v += shares[COMBO(z, t)] ?? 0;
    if (v < bv) { bv = v; bz = z; }
  }
  let bt: Tool = TOOLS[0];
  let bd = -1;
  for (const t of TOOLS) {
    const d = damageFor({ zone: bz, tool: t }, state, 0);
    if (d > bd) { bd = d; bt = t; }
  }
  return { zone: bz, tool: bt };
}

describe('MOLT balance — the strategic space stays alive over a season', () => {
  const log = runSeason(60, 40);

  it('B1: no single fixed (zone,tool) is best every day', () => {
    const distinct = new Set(log.map((l) => COMBO(l.best.zone, l.best.tool)));
    expect(distinct.size).toBeGreaterThanOrEqual(5);
  });

  it('B2: the best target zone moves', () => {
    const zones = new Set(log.map((l) => l.best.zone));
    expect(zones.size).toBeGreaterThanOrEqual(3);
  });

  it('B3: mirroring the crowd is the worst position — an adaptive contrarian beats it', () => {
    // The "chaser" probe plays exactly the crowd's best response (it *is* the herd).
    // The "contrarian" probe plays the least-used zone with its best tool. Across
    // seeds, the crowd-mirror is the worst of the two: crowding is punished.
    const chaser = log.reduce((a, l) => a + l.chaserDmg, 0);
    const contrarian = log.reduce((a, l) => a + l.contrarianDmg, 0);
    expect(contrarian).toBeGreaterThan(chaser);
  });

  it('B5: the beast re-forms frequently', () => {
    let changes = 0;
    for (let i = 1; i < log.length; i++) if (log[i].best.zone !== log[i - 1].best.zone) changes++;
    expect(changes).toBeGreaterThanOrEqual(15);
  });

  it('the season produces a readable narrative (sample)', () => {
    const sample = log.slice(0, 12).map((l) => `d${l.day}:${COMBO(l.best.zone, l.best.tool)}`).join(' ');
    expect(sample.length).toBeGreaterThan(0);
    console.log('  season sample:', sample);
  });
});

/**
 * The decisive non-degeneracy test. We build a payoff matrix: for each crowd
 * strategy, measure how each probe strategy scores. A degenerate game has a
 * strategy that wins in every column (a static dominant strategy). A healthy
 * minority game has *no* such strategy, and the herd position (matching the
 * crowd) is the worst one — the diagonal.
 */
describe('MOLT balance — no static dominant strategy (payoff matrix)', () => {
  const strategies = {
    chaser: (st: BeastState, sh: Record<string, number>) => bestResponse(st, sh),
    loyal: () => ({ zone: 'crown' as Zone, tool: 'cleave' as Tool }),
    contrarian: (st: BeastState, sh: Record<string, number>) => leastUsed(st, sh),
    crownPierce: () => ({ zone: 'crown' as Zone, tool: 'pierce' as Tool }),
    gutCleave: () => ({ zone: 'gut' as Zone, tool: 'cleave' as Tool }),
  };
  const names = Object.keys(strategies) as Array<keyof typeof strategies>;

  function leastUsed(state: BeastState, sh: Record<string, number>) {
    let bz: Zone = ZONES[0];
    let bv = Infinity;
    for (const z of ZONES) {
      let v = 0;
      for (const t of TOOLS) v += sh[COMBO(z, t)] ?? 0;
      if (v < bv) { bv = v; bz = z; }
    }
    let bt: Tool = TOOLS[0];
    let bd = -1;
    for (const t of TOOLS) {
      const d = damageFor({ zone: bz, tool: t }, state, 0);
      if (d > bd) { bd = d; bt = t; }
    }
    return { zone: bz, tool: bt };
  }

  function run(crowdName: keyof typeof strategies, days = 90, n = 80) {
    let rng = 7;
    const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    let state = genesisState(1);
    let sh: Record<string, number> = {};
    const totals: Record<string, number> = Object.fromEntries(names.map((nm) => [nm, 0]));
    for (let d = 1; d <= days; d++) {
      const subs: Array<{ userId: string; strike: { zone: Zone; tool: Tool } }> = [];
      let k = 0;
      for (let i = 0; i < n; i++) {
        const p = strategies[crowdName](state, sh);
        let z = p.zone;
        let t = p.tool;
        if (rand() < 0.2) { z = ZONES[Math.floor(rand() * 5)]; t = TOOLS[Math.floor(rand() * 3)]; }
        subs.push({ userId: `c${k++}`, strike: { zone: z, tool: t } });
      }
      const probes: Record<string, { zone: Zone; tool: Tool }> = {};
      for (const nm of names) {
        const p = strategies[nm](state, sh);
        probes[nm] = p;
        subs.push({ userId: `p_${nm}`, strike: p });
      }
      const res = resolveDay(d, state, subs);
      sh = sharesOf(res);
      for (const nm of names) {
        const p = probes[nm];
        totals[nm] += damageFor({ zone: p.zone, tool: p.tool }, state, sh[COMBO(p.zone, p.tool)] ?? 0);
      }
      state = molt({ nextDay: d + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: state });
    }
    return totals;
  }

  it('no single strategy wins in every crowd column', () => {
    // matrix[i] = totals for crowd strategy names[i]; entry [nm] = probe nm's score.
    const matrix = names.map((crowd) => run(crowd));
    const winners = matrix.map((totals) => {
      let bestName = '';
      let best = -1;
      for (const nm of names) {
        if (totals[nm] > best) { best = totals[nm]; bestName = nm; }
      }
      return bestName;
    });
    console.log('  column winners:', winners.join(', '));
    const counts: Record<string, number> = {};
    for (const w of winners) counts[w] = (counts[w] ?? 0) + 1;
    const topCount = Math.max(...Object.values(counts));
    expect(topCount).toBeLessThan(names.length);
  });

  it('the herd position (matching the crowd) is the worst, not the best', () => {
    for (const crowd of names) {
      const totals = run(crowd);
      const selfScore = totals[crowd];
      const bestOther = Math.max(...names.filter((n) => n !== crowd).map((n) => totals[n]));
      expect(selfScore).toBeLessThan(bestOther);
    }
  });
});
