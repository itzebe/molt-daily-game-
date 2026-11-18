/**
 * MOLT engine facade — the public, pure API the server uses.
 *
 * A single `Game` value models one subreddit's beast across days. All functions
 * are pure: `Game` in, `Game` out. This is what makes the daily loop testable
 * without a clock, a network, or Redis.
 */
import type { BeastState, Strike } from './rules.ts';
import { type DayResolution, resolveDay, type Submission } from './resolve.ts';
import { genesisState, molt } from './molt.ts';

export interface Game {
  currentDay: number;
  state: BeastState;
  /** submissions for the current (open) day, keyed by userId (one per user) */
  submissions: Map<string, Strike>;
  /** resolved history, most-recent-last */
  history: DayResolution[];
}

export function newGame(): Game {
  return { currentDay: 1, state: genesisState(1), submissions: new Map(), history: [] };
}

export interface SubmitResult {
  ok: boolean;
  reason?: 'duplicate' | 'invalid-zone' | 'invalid-tool';
}

export function submit(game: Game, userId: string, strike: Strike): SubmitResult {
  if (game.submissions.has(userId)) return { ok: false, reason: 'duplicate' };
  game.submissions.set(userId, strike);
  return { ok: true };
}

/** Resolve the current day and advance to the next (the overnight molt). */
export function advanceDay(game: Game): DayResolution {
  const subs: Submission[] = [...game.submissions.entries()].map(([userId, strike]) => ({
    userId,
    strike,
  }));
  const resolution = resolveDay(game.currentDay, game.state, subs);
  game.history.push(resolution);

  const recentZoneShares = game.history.slice(-3).map((r) => r.zoneShare);
  const next = molt({
    nextDay: game.currentDay + 1,
    resolution,
    recentZoneShares,
    previousState: game.state,
  });
  game.state = next;
  game.currentDay += 1;
  game.submissions = new Map();
  return resolution;
}

export * from './rules.ts';
export * from './resolve.ts';
export * from './molt.ts';
