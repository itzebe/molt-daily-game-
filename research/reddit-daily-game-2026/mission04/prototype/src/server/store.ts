/**
 * MOLT store — persistence seam.
 *
 * The prototype uses `MemoryStore`. The Devvit deployment would implement the
 * same interface over `@devvit/web/server` Redis (keys per §5 of the mechanics
 * spec). Keeping this seam means the game logic is identical in both, and the
 * prototype can be verified locally without Devvit.
 */
import { type Game, newGame, type Strike, advanceDay, type DayResolution, submit } from '../engine/game.ts';

export interface GameStore {
  get(subreddit: string): Game;
  submit(subreddit: string, userId: string, strike: Strike): { ok: boolean; reason?: string };
  advance(subreddit: string): DayResolution;
  reset(subreddit: string): void;
}

export class MemoryStore implements GameStore {
  private games = new Map<string, Game>();

  get(subreddit: string): Game {
    let g = this.games.get(subreddit);
    if (!g) {
      g = newGame();
      this.games.set(subreddit, g);
    }
    return g;
  }

  submit(subreddit: string, userId: string, strike: Strike) {
    return submit(this.get(subreddit), userId, strike);
  }

  advance(subreddit: string): DayResolution {
    return advanceDay(this.get(subreddit));
  }

  reset(subreddit: string): void {
    this.games.delete(subreddit);
  }
}
