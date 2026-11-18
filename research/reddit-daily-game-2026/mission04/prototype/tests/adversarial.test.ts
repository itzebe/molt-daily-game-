/**
 * MOLT — adversarial tests.
 *
 * Actively tries to prove the game does NOT work. Each test states the attack and
 * the expected safe behaviour. Failures here are real findings, not test bugs.
 */
import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  crowdFactor,
  damageFor,
  genesisState,
  integrityFor,
  molt,
  newGame,
  resolveDay,
  submit,
  ZONE_VALUE,
  ZONES,
  type BeastState,
  type Strike,
  type Tool,
  type Zone,
} from '../src/engine/game.ts';

function mkSubs(spec: Array<[Zone, Tool, number]>): Array<{ userId: string; strike: Strike }> {
  const out: Array<{ userId: string; strike: Strike }> = [];
  let k = 0;
  for (const [zone, tool, n] of spec) {
    for (let i = 0; i < n; i++) out.push({ userId: `u${k++}`, strike: { zone, tool } });
  }
  return out;
}

function moltFrom(res: ReturnType<typeof resolveDay>, prev: BeastState = genesisState(1)): BeastState {
  return molt({ nextDay: res.day + 1, resolution: res, recentZoneShares: [res.zoneShare], previousState: prev });
}

function bestPlay(state: BeastState): { zone: Zone; tool: Tool; dmg: number } {
  let best = { zone: 'crown' as Zone, tool: 'cleave' as Tool, dmg: -1 };
  for (const zone of ZONES) {
    for (const tool of ['cleave', 'pierce', 'burn'] as Tool[]) {
      const dmg = damageFor({ zone, tool }, state, 0.0); // best case: contrarian share
      if (dmg > best.dmg) best = { zone, tool, dmg };
    }
  }
  return best;
}

describe('ATTACK: one popular zone becomes permanently dominant', () => {
  it('over-using a zone arms it, then a contrarian read beats the herd play', () => {
    const res = resolveDay(1, genesisState(1), mkSubs([['crown', 'cleave', 100]]));
    const next = moltFrom(res);
    expect(next.zoneState.crown).toBe('armoured');
    expect(next.fatiguedTool).toBe('cleave'); // the herd tool is now fatigued too
    const herd = damageFor({ zone: 'crown', tool: 'cleave' }, next, 0.4); // 30 × 1.6 × 0.7 × 0.8 = 27
    const read = damageFor({ zone: 'gut', tool: 'pierce' }, next, 0.02); // 28 × 1.0 × 1.9 = 53
    expect(read).toBeGreaterThan(herd);
  });
});

describe('ATTACK: optimal strategy is obvious and repetitive', () => {
  it('the reward surface moves day to day as the beast re-forms from a real crowd', () => {
    // Day 1: a realistic crowd concentrates on crown (best base value).
    const day1 = resolveDay(1, genesisState(1), mkSubs([
      ['crown', 'cleave', 70], ['gut', 'cleave', 15], ['hide', 'cleave', 8],
      ['claw', 'cleave', 5], ['tail', 'cleave', 2],
    ]));
    const day1Best = bestPlay(genesisState(1));
    expect(day1Best.zone).toBe('crown'); // before the crowd acts, crown is best

    // After that crowd, crown is over-used → armoured; tail is neglected → raw.
    const day2State = moltFrom(day1);
    expect(day2State.zoneState.crown).toBe('armoured');
    const day2Best = bestPlay(day2State);

    // The best target is no longer crown: the crowd's own behaviour moved it.
    expect(day2Best.zone).not.toBe('crown');
    expect(day2Best.dmg).toBeGreaterThan(0);
  });
});

describe('ATTACK: randomness overwhelms player decisions', () => {
  it('zero randomness in damage: same input → same output, 1000 times', () => {
    const s = genesisState(1);
    const first = damageFor({ zone: 'gut', tool: 'pierce' }, s, 0.02);
    for (let i = 0; i < 1000; i++) {
      expect(damageFor({ zone: 'gut', tool: 'pierce' }, s, 0.02)).toBe(first);
    }
  });
});

describe('ATTACK: a coordinated group manipulates the beast', () => {
  it('a 100% coordinated crowd cannot keep a soft zone — it becomes armoured', () => {
    const res = resolveDay(1, genesisState(1), mkSubs([['tail', 'pierce', 100]]));
    expect(moltFrom(res).zoneState.tail).toBe('armoured'); // over-use is self-defeating (§3.1)
  });

  it('a perfectly even crowd triggers a mutation — a fresh raw opening appears', () => {
    const res = resolveDay(1, genesisState(1), mkSubs([
      ['crown', 'cleave', 20], ['hide', 'cleave', 20], ['gut', 'cleave', 20],
      ['claw', 'cleave', 20], ['tail', 'cleave', 20],
    ]));
    expect(moltFrom(res).mutated).toBe(true); // the board cannot be frozen (§3.5)
  });
});

describe('ATTACK: one player exploits scoring', () => {
  it('a lone player cannot inflate damage — the crowd factor is capped at 1.9', () => {
    const s = genesisState(1);
    const best = damageFor({ zone: 'crown', tool: 'cleave' }, s, 0.0);
    const cap = ZONE_VALUE.crown * 1.6 * 1.9;
    expect(best).toBeLessThanOrEqual(Math.round(cap) + 1);
    expect(crowdFactor(0.0).factor).toBe(1.9);
  });

  it('alt-accounts add sub-linear value because Integrity scales with sqrt(N)', () => {
    const d1 = integrityFor(10);
    const d2 = integrityFor(100);
    expect(d2 / d1).toBeLessThan(100 / 10); // 10x users ≪ 10x integrity
  });
});

describe('ATTACK: newcomers are punished for intuitive choices', () => {
  it('the obvious play (herd on an armoured zone with the counter tool) is decent, not a trap', () => {
    const s: BeastState = {
      day: 2,
      zoneState: { crown: 'armoured', hide: 'exposed', gut: 'exposed', claw: 'exposed', tail: 'exposed' },
      fatiguedTool: null,
      ridges: [],
      mutated: false,
      previousOutcome: null,
    };
    expect(damageFor({ zone: 'crown', tool: 'cleave' }, s, 0.4)).toBeGreaterThanOrEqual(30);
  });

  it('choosing the "wrong" tool is a soft penalty, not a wipeout', () => {
    const s = genesisState(1); // all exposed
    const good = damageFor({ zone: 'crown', tool: 'cleave' }, s, 0.1); // 1.0 vs exposed
    const bad = damageFor({ zone: 'crown', tool: 'burn' }, s, 0.1); // 0.6 vs exposed
    expect(bad).toBeGreaterThan(0);
    expect(bad / good).toBeCloseTo(0.6, 1);
  });
});

describe('ATTACK: the transformation is not understandable', () => {
  it('a crown-heavy crowd always yields an armoured crown — legible rule §3.1', () => {
    const res = resolveDay(1, genesisState(1), mkSubs([
      ['crown', 'cleave', 60], ['hide', 'cleave', 20], ['gut', 'cleave', 20],
    ]));
    expect(moltFrom(res).zoneState.crown).toBe('armoured');
  });
});

describe('ATTACK: the game breaks with low participation', () => {
  it('1 player: no crash, deterministic, small integrity', () => {
    const res = resolveDay(1, genesisState(1), mkSubs([['crown', 'cleave', 1]]));
    expect(res.n).toBe(1);
    expect(res.integrity).toBe(1000);
    expect(Number.isFinite(res.totalDamage)).toBe(true);
    expect(ZONES.every((z) => moltFrom(res).zoneState[z])).toBe(true);
  });

  it('0 players: no crash, no NaN, neutral molt', () => {
    const res = resolveDay(1, genesisState(1), []);
    expect(res.n).toBe(0);
    expect(res.totalDamage).toBe(0);
    expect(Number.isNaN(res.integrity)).toBe(false);
    expect(moltFrom(res).fatiguedTool).toBeNull();
  });
});

describe('ATTACK: duplicate / invalid submissions', () => {
  it('the same user cannot strike twice in a day', () => {
    const g = newGame();
    expect(submit(g, 'x', { zone: 'crown', tool: 'cleave' }).ok).toBe(true);
    expect(submit(g, 'x', { zone: 'gut', tool: 'burn' }).ok).toBe(false);
    expect(g.submissions.size).toBe(1);
  });
});

describe('ATTACK: determinism of the whole day loop', () => {
  it('two identical game histories produce identical outcomes', () => {
    const run = () => {
      const g = newGame();
      submit(g, 'a', { zone: 'crown', tool: 'cleave' });
      submit(g, 'b', { zone: 'crown', tool: 'pierce' });
      submit(g, 'c', { zone: 'tail', tool: 'burn' });
      const r1 = advanceDay(g);
      submit(g, 'a', { zone: 'gut', tool: 'pierce' });
      const r2 = advanceDay(g);
      return JSON.stringify({ r1, r2, state: g.state });
    };
    expect(run()).toBe(run());
  });
});
