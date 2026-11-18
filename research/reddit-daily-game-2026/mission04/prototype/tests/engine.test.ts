import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  aggregate,
  crowdFactor,
  damageFor,
  genesisState,
  integrityFor,
  molt,
  newGame,
  resolveDay,
  submit,
  topTool,
  TOOL_MULT,
  type BeastState,
  type Strike,
  type Zone,
} from '../src/engine/game.ts';

const exposed = (): BeastState => genesisState(1);

describe('rules tables (mechanics spec §1)', () => {
  it('armoured and raw each have a counter tool; exposed is neutral', () => {
    // Per §1.3, every *armoured* and *raw* state has a tool that counters it (>1.0).
    // 'exposed' is the neutral state: all tools are 1.0 against it (no counter).
    for (const state of ['armoured', 'raw'] as const) {
      const best = Math.max(...(['cleave', 'pierce', 'burn'] as const).map((t) => TOOL_MULT[t][state]));
      expect(best).toBeGreaterThan(1.0);
    }
    expect(TOOL_MULT.cleave.exposed).toBe(1.0);
    expect(TOOL_MULT.pierce.exposed).toBe(1.0);
    expect(TOOL_MULT.burn.exposed).toBe(0.6); // burn is weak vs exposed (§1.3)
    // cleave is the ONLY tool strong vs armoured
    expect(TOOL_MULT.cleave.armoured).toBe(1.6);
    expect(TOOL_MULT.pierce.armoured).toBe(0.6);
    expect(TOOL_MULT.burn.armoured).toBe(1.0);
    // exact table (§1.3)
    expect(TOOL_MULT).toEqual({
      cleave: { armoured: 1.6, exposed: 1.0, raw: 0.6 },
      pierce: { armoured: 0.6, exposed: 1.0, raw: 1.6 },
      burn: { armoured: 1.0, exposed: 0.6, raw: 1.6 },
    });
  });

  it('crowd factor bands match §1.4 boundaries', () => {
    expect(crowdFactor(0.42).factor).toBe(0.7);
    expect(crowdFactor(0.3).factor).toBe(0.7); // boundary inclusive
    expect(crowdFactor(0.299).factor).toBe(1.0);
    expect(crowdFactor(0.1).factor).toBe(1.0);
    expect(crowdFactor(0.099).factor).toBe(1.4);
    expect(crowdFactor(0.03).factor).toBe(1.4);
    expect(crowdFactor(0.029).factor).toBe(1.9);
    expect(crowdFactor(0.0).factor).toBe(1.9);
  });

  it('integrity is linear in the number of distinct strikers (§1.5, Mission 09/10)', () => {
    // Integrity = 30 × N. No cap, no sqrt.
    expect(integrityFor(0)).toBe(0);
    expect(integrityFor(1)).toBe(30);
    expect(integrityFor(100)).toBe(3000);
    expect(integrityFor(1000)).toBe(30000);
    expect(integrityFor(1_000_000)).toBe(30_000_000);
    // linear: doubling N doubles the target (the property the sqrt form lacked)
    expect(integrityFor(200) / integrityFor(100)).toBe(2);
    expect(integrityFor(10_000) / integrityFor(100)).toBe(100);
  });

  it('C1 regression: no separate STATE_MULT — state acts only through TOOL_MULT (§1.2/§1.3)', () => {
    // The §4 worked example pins these. If a STATE_MULT (0.55/1.70) were applied,
    // crown:cleave (armoured) would be 18, not 34, and gut:pierce (exposed) would be
    // 53 × 1.0 = 53 only if no extra factor. Both numbers below must match §4 exactly.
    const armouredCrown: BeastState = {
      day: 2,
      zoneState: { crown: 'armoured', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'exposed' },
      fatiguedTool: null, ridges: [], mutated: false, previousOutcome: null,
    };
    // 30 (crown) × 1.6 (cleave vs armoured) × 0.7 (≥30% crowd) = 34  [§4]
    expect(damageFor({ zone: 'crown', tool: 'cleave' }, armouredCrown, 0.4)).toBe(34);
    // A raw zone with the counter tool: 30 × 1.6 × 1.9 = 91 (NOT 91 × 1.70 = 155)
    const rawCrown: BeastState = { ...armouredCrown, zoneState: { ...armouredCrown.zoneState, crown: 'raw' } };
    expect(damageFor({ zone: 'crown', tool: 'burn' }, rawCrown, 0.02)).toBe(91);
  });

  it('C2 regression: pierce vs exposed is 1.0 (neutral), not 1.6 (§1.3/§4)', () => {
    expect(TOOL_MULT.pierce.exposed).toBe(1.0);
    // gut:pierce on an exposed zone at 2% = 28 × 1.0 × 1.9 = 53  [§4]
    expect(damageFor({ zone: 'gut', tool: 'pierce' }, genesisState(1), 0.02)).toBe(53);
    // exposed is neutral for ALL tools except burn (which is weak, 0.6)
    expect(TOOL_MULT.cleave.exposed).toBe(1.0);
    expect(TOOL_MULT.burn.exposed).toBe(0.6);
  });
});

describe('spec worked example (§4) — golden test', () => {
  // Day D: crown 42, hide 21, gut 17, claw 12, tail 8 of 100 → crown armoured, topTool burn.
  it('derives crown=armoured and fatiguedTool=burn (§4 scenario: day was SLAIN, so no escape penalty)', () => {
    const subs = [] as { userId: string; strike: Strike }[];
    const push = (zone: Zone, tool: Strike['tool'], n: number) => {
      for (let i = 0; i < n; i++) subs.push({ userId: `${zone}-${tool}-${i}`, strike: { zone, tool } });
    };
    push('crown', 'burn', 42);
    push('hide', 'burn', 21);
    push('gut', 'burn', 17);
    push('claw', 'burn', 12);
    push('tail', 'burn', 8);
    const res = resolveDay(1, exposed(), subs);
    expect(res.n).toBe(100);
    expect(res.zoneShare.crown).toBeCloseTo(0.42, 5);
    expect(res.topTool).toBe('burn');
    // §4's worked example assumes the crowd SLAIN the beast that day, so §3.7 does not fire.
    const next = molt({
      nextDay: 2,
      resolution: { ...res, outcome: 'SLAIN' },
      recentZoneShares: [res.zoneShare],
      previousState: exposed(),
    });
    expect(next.zoneState.crown).toBe('armoured'); // ≥0.35
    expect(next.fatiguedTool).toBe('burn');
    expect(next.zoneState.tail).toBe('exposed'); // 0.08 is not ≤0.05
  });

  it('the same crowd, if the day ESCAPED, forces the least-hit zone (tail) armoured (§3.7)', () => {
    const subs = [] as { userId: string; strike: Strike }[];
    const push = (zone: Zone, tool: Strike['tool'], n: number) => {
      for (let i = 0; i < n; i++) subs.push({ userId: `${zone}-${tool}-${i}`, strike: { zone, tool } });
    };
    push('crown', 'burn', 42);
    push('hide', 'burn', 21);
    push('gut', 'burn', 17);
    push('claw', 'burn', 12);
    push('tail', 'burn', 8);
    const res = resolveDay(1, exposed(), subs);
    expect(res.outcome).toBe('ESCAPED'); // low damage vs integrity 10000
    const next = molt({ nextDay: 2, resolution: res, recentZoneShares: [res.zoneShare], previousState: exposed() });
    expect(next.zoneState.tail).toBe('armoured'); // least-hit forced armoured
  });

  it('contrarian read scores 53; herd on armoured crown scores 34 (or 27 with fatigue)', () => {
    const day2: BeastState = {
      day: 2,
      zoneState: { crown: 'armoured', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'exposed' } as Record<Zone, BeastState['zoneState'][Zone]>,
      fatiguedTool: 'burn',
      ridges: [],
      mutated: false,
      previousOutcome: 'ESCAPED',
    };
    // pierce on gut at 2% share → 28 × 1.0 × 1.9 = 53.2 → 53
    expect(damageFor({ zone: 'gut', tool: 'pierce' }, day2, 0.02)).toBe(53);
    // cleave on armoured crown at 40% → 30 × 1.6 × 0.7 = 33.6 → 34 (no fatigue: cleave≠burn)
    expect(damageFor({ zone: 'crown', tool: 'cleave' }, day2, 0.4)).toBe(34);
    // burn (fatigued) on crown: 30 × 1.0 × 0.7 × 0.8 = 16.8 → 17
    expect(damageFor({ zone: 'crown', tool: 'burn' }, day2, 0.4)).toBe(17);
  });
});

describe('molting rules (§3)', () => {
  const mkRes = (zoneShares: Record<string, number>, top: Strike['tool'], outcome: 'SLAIN' | 'ESCAPED' = 'SLAIN') => {
    const n = 100;
    const zoneShare = zoneShares;
    const agg = aggregate([]);
    return { day: 1, n, integrity: 1000, totalDamage: 0, outcome, results: [], aggregate: agg, topTool: top, zoneShare };
  };

  it('over-use → armour (§3.1), neglect → raw (§3.2)', () => {
    const res = mkRes({ crown: 0.5, hide: 0.2, gut: 0.15, claw: 0.11, tail: 0.04 }, 'cleave');
    const next = molt({ nextDay: 2, resolution: res as never, recentZoneShares: [res.zoneShare], previousState: exposed() });
    expect(next.zoneState.crown).toBe('armoured');
    expect(next.zoneState.tail).toBe('raw');
    expect(next.zoneState.hide).toBe('exposed');
  });

  it('mutation fires only for an even crowd (§3.5)', () => {
    const even = mkRes({ crown: 0.2, hide: 0.2, gut: 0.2, claw: 0.2, tail: 0.2 }, 'cleave');
    const uneven = mkRes({ crown: 0.5, hide: 0.2, gut: 0.15, claw: 0.1, tail: 0.05 }, 'cleave');
    expect(molt({ nextDay: 2, resolution: even as never, recentZoneShares: [even.zoneShare], previousState: exposed() }).mutated).toBe(true);
    expect(molt({ nextDay: 2, resolution: uneven as never, recentZoneShares: [uneven.zoneShare], previousState: exposed() }).mutated).toBe(false);
  });

  it('escape penalty hardens the least-hit zone (§3.7)', () => {
    const res = mkRes({ crown: 0.5, hide: 0.2, gut: 0.15, claw: 0.1, tail: 0.05 }, 'cleave', 'ESCAPED');
    const next = molt({ nextDay: 2, resolution: res as never, recentZoneShares: [res.zoneShare], previousState: exposed() });
    expect(next.zoneState.tail).toBe('armoured'); // least-hit forced armoured despite being low
  });

  it('scarring ridge is permanent across days (§3.4)', () => {
    const d1 = mkRes({ crown: 0.4, hide: 0.2, gut: 0.2, claw: 0.1, tail: 0.1 }, 'cleave');
    const s2 = molt({ nextDay: 2, resolution: d1 as never, recentZoneShares: [d1.zoneShare], previousState: exposed() });
    expect(s2.ridges).toContain('crown');
    const d2 = mkRes({ crown: 0.1, hide: 0.4, gut: 0.2, claw: 0.2, tail: 0.1 }, 'cleave');
    const s3 = molt({ nextDay: 3, resolution: d2 as never, recentZoneShares: [d1.zoneShare, d2.zoneShare], previousState: s2 });
    expect(s3.ridges).toContain('crown'); // carried over
    expect(s3.ridges).toContain('hide');
  });

  it('determinism: identical inputs → identical outputs', () => {
    const res = mkRes({ crown: 0.5, hide: 0.2, gut: 0.15, claw: 0.11, tail: 0.04 }, 'cleave');
    const a = molt({ nextDay: 2, resolution: res as never, recentZoneShares: [res.zoneShare], previousState: exposed() });
    const b = molt({ nextDay: 2, resolution: res as never, recentZoneShares: [res.zoneShare], previousState: exposed() });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('submission rules & day advance', () => {
  it('rejects a duplicate strike for the same user (§7)', () => {
    const g = newGame();
    expect(submit(g, 'u1', { zone: 'crown', tool: 'cleave' }).ok).toBe(true);
    const dup = submit(g, 'u1', { zone: 'tail', tool: 'pierce' });
    expect(dup.ok).toBe(false);
    expect(dup.reason).toBe('duplicate');
    expect(g.submissions.size).toBe(1);
  });

  it('advanceDay resolves, records history, and opens a fresh day', () => {
    const g = newGame();
    for (let i = 0; i < 10; i++) submit(g, `u${i}`, { zone: 'crown', tool: 'cleave' });
    const res = advanceDay(g);
    expect(res.n).toBe(10);
    expect(g.currentDay).toBe(2);
    expect(g.submissions.size).toBe(0);
    expect(g.history.length).toBe(1);
    expect(g.state.previousOutcome).toBe(res.outcome);
  });

  it('empty day does not crash and yields zero integrity', () => {
    const g = newGame();
    const res = advanceDay(g);
    expect(res.n).toBe(0);
    expect(res.integrity).toBe(0);
    expect(res.outcome).toBe('SLAIN'); // 0 >= 0
  });
});

describe('aggregate & topTool tie-breaking', () => {
  it('topTool breaks ties by tool order and returns null when empty', () => {
    expect(topTool(aggregate([]))).toBeNull();
    const a = aggregate([
      { userId: 'a', strike: { zone: 'crown', tool: 'cleave' } },
      { userId: 'b', strike: { zone: 'crown', tool: 'pierce' } },
    ]);
    expect(topTool(a)).toBe('cleave'); // tie → first in order
  });
});
