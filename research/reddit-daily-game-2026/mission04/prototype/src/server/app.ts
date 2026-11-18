/**
 * MOLT server — Hono API (mirrors the Devvit `/api/*` + `/internal/*` shape).
 *
 * Endpoints:
 *   GET  /api/state     → today's beast + coarse crowd bands + your lock status
 *   POST /api/strike    → validate + lock ONE (zone,tool); returns provisional band
 *   POST /api/advance   → overnight molt (the scheduler stand-in for local testing)
 *   GET  /api/history   → previous rounds (bestiary)
 *   POST /api/reset     → fresh game (test/dev only)
 *
 * The client is never trusted for damage, counts, or identity: the server derives
 * everything from the locked submission and the shared day state.
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MemoryStore, type GameStore } from './store.ts';
import { TOOLS, TOOL_MULT, ZONES, ZONE_VALUE, type Strike, type Tool, type Zone, type ZoneState } from '../engine/rules.ts';
import { aggregate, crowdFactor, damageFor, integrityFor } from '../engine/resolve.ts';
import type { CrowdBand, HistoryView, StateView, StrikeResponse, ZoneView } from './view-types.ts';

const ZONE_NAME: Record<Zone, string> = {
  crown: 'Crown',
  hide: 'Hide',
  gut: 'Gut',
  claw: 'Claw',
  tail: 'Tail',
};

/** Coarse, delayed band per zone from the current partial counts (§7 anti-sniping). */
function zoneBand(count: number, n: number): CrowdBand | null {
  if (n < 5) return null; // too few to reveal anything meaningful
  const share = count / n;
  if (share >= 0.3) return 'herd';
  if (share >= 0.1) return 'common';
  if (share >= 0.03) return 'lone';
  return 'read';
}

export function createApp(store: GameStore = new MemoryStore()) {
  const app = new Hono();
  app.use('*', cors());

  const sub = (c: { req: { header: (s: string) => string | undefined } }) =>
    c.req.header('x-subreddit') ?? 'demo';

  function buildState(subreddit: string, userId: string): StateView {
    const g = store.get(subreddit);
    const agg = aggregate([...g.submissions.entries()].map(([uid, strike]) => ({ userId: uid, strike })));
    const n = agg.n;
    const yourStrike = g.submissions.get(userId) ?? null;

    const zones: ZoneView[] = ZONES.map((z) => ({
      id: z,
      name: ZONE_NAME[z],
      state: g.state.zoneState[z],
      baseValue: ZONE_VALUE[z],
      crowdBand: zoneBand(agg.zoneCount[z] ?? 0, n),
      hasRidge: g.state.ridges.includes(z),
    }));

    const integrity = integrityFor(n);

    // Molt note: explain the previous day's transformation from real history.
    let moltNote: string | null = null;
    let previousDay: number | null = null;
    const last = g.history[g.history.length - 1];
    if (last) {
      previousDay = last.day;
      const armoured = ZONES.filter((z) => g.state.zoneState[z] === 'armoured');
      const raw = ZONES.filter((z) => g.state.zoneState[z] === 'raw');
      const bits: string[] = [];
      if (armoured.length) bits.push(`${armoured.map((z) => ZONE_NAME[z]).join(' & ')} armoured`);
      if (raw.length) bits.push(`${raw.map((z) => ZONE_NAME[z]).join(' & ')} left raw`);
      if (g.state.fatiguedTool) bits.push(`the beast grew used to ${g.state.fatiguedTool}`);
      moltNote = bits.length ? `After day ${last.day}: ${bits.join('; ')}.` : null;
    }

    return {
      day: g.currentDay,
      zones,
      mutated: g.state.mutated,
      fatiguedTool: g.state.fatiguedTool,
      previousOutcome: g.state.previousOutcome,
      previousDay,
      moltNote,
      alreadyStruck: yourStrike !== null,
      yourStrike,
      integrity,
      totalDamageSoFar: 0,
      strikerCount: n,
    };
  }

  app.get('/api/state', (c) => {
    const userId = c.req.query('userId') ?? c.req.header('x-user-id') ?? 'anon';
    return c.json(buildState(sub(c), userId));
  });

  app.post('/api/strike', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Partial<Strike> & { userId?: string };
    const userId = body.userId ?? c.req.header('x-user-id') ?? 'anon';
    const zone = body.zone as Zone;
    const tool = body.tool as Tool;

    if (!ZONES.includes(zone)) return c.json({ ok: false, reason: 'invalid-zone' }, 400);
    if (!TOOLS.includes(tool)) return c.json({ ok: false, reason: 'invalid-tool' }, 400);

    const subreddit = sub(c);
    const result = store.submit(subreddit, userId, { zone, tool });
    if (!result.ok) return c.json({ ok: false, reason: result.reason }, 409);

    // Provisional damage: computed server-side against the CURRENT partial split.
    const g = store.get(subreddit);
    const agg = aggregate([...g.submissions.entries()].map(([uid, strike]) => ({ userId: uid, strike })));
    const share = agg.n > 0 ? (agg.comboCount[`${zone}:${tool}`] ?? 0) / agg.n : 0;
    const damage = damageFor({ zone, tool }, g.state, share);
    const cf = crowdFactor(share);
    const tm = TOOL_MULT[tool][g.state.zoneState[zone] as ZoneState];
    const isRead = cf.label === 'read' && tm >= 1.0;

    const resp: StrikeResponse = {
      ok: true,
      damage,
      crowdLabel: cf.label as CrowdBand,
      share,
      isRead,
      state: buildState(subreddit, userId),
    };
    return c.json(resp);
  });

  app.post('/api/advance', (c) => {
    const subreddit = sub(c);
    const res = store.advance(subreddit);
    return c.json({
      ok: true,
      day: res.day,
      outcome: res.outcome,
      totalDamage: res.totalDamage,
      integrity: res.integrity,
      n: res.n,
      topTool: res.topTool,
      nextState: store.get(subreddit).state,
    });
  });

  app.get('/api/history', (c) => {
    const g = store.get(sub(c));
    const view: HistoryView = {
      entries: g.history.map((r) => ({
        day: r.day,
        outcome: r.outcome,
        totalDamage: r.totalDamage,
        integrity: r.integrity,
        n: r.n,
        topTool: r.topTool,
      })),
    };
    return c.json(view);
  });

  app.post('/api/reset', (c) => {
    store.reset(sub(c));
    return c.json({ ok: true });
  });

  return app;
}
