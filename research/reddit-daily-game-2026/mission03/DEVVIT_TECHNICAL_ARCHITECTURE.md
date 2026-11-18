# DEVVIT TECHNICAL ARCHITECTURE — **MOLT**

**Compiled:** 2026-11-18 · **Basis:** `reddit/devvit-docs` (cloned 2026-11-18) and the official Devpost
rules. Every capability cited is a documented Devvit feature; every limit is quoted or paraphrased from
the docs.

---

## 1. Chosen stack (justified)

**Devvit Web: React + TypeScript client, Hono server, Redis state, scheduler, Journeys.**
No Phaser/Three.js and no game engine: MOLT is a **turn-based, one-decision** game rendered as a crisp
2D field plate. A 2D vector/DOM renderer (React + inline SVG) gives us the illustration fidelity the art
direction needs, at a fraction of the bundle and complexity of a physics engine. This is a *deliberate*
choice, not a limitation: it maximises reliability, mobile performance, and the "Polish" criterion.

| Layer | Technology | Why |
| --- | --- | --- |
| Client | React 19 + TypeScript + inline SVG | Fits the naturalist-plate art direction; tiny bundle; instant mobile paint |
| Server | Hono on Devvit Web | The documented server pattern; simple typed endpoints |
| State | **Devvit Redis** | Shared, server-authoritative; supports hashes, numbers, sorted sets, transactions |
| Schedule | **Devvit Scheduler** (cron) | Daily molt + daily post at 00:00 UTC |
| Telemetry | **Devvit Journeys** | The criterion the judges explicitly ask for |
| Post integration | Interactive Post + `postData` | Fast first paint; native feed surface |

---

## 2. Verified Devvit capabilities and limits (primary source: `reddit/devvit-docs`)

| Capability | What the docs say | Use in MOLT |
| --- | --- | --- |
| **Redis** | "supports… Transactions… Strings… Numbers… Sorted sets for creating leaderboards… Hashes" | All game state |
| **Redis scoping** | "Each installation of an app is uniquely name-spaced… Redis data is siloed by subreddit" | Each subreddit has its own beast — by design |
| **Redis key listing** | "Redis does not support listing every key in an installation" | We use stable, well-known key names (§5 of the mechanics spec) |
| **Scheduler** | "perform actions at specific times… recurring and one-off jobs… `cron`… standard UNIX cron format" | `"0 0 * * *"` for the daily molt |
| **Journeys** | "telemetry stream… `App.Ready`, `Journey.Start`, `Journey.Progress`, `Journey.Interaction`, `Journey.End`" | Instrument the strike loop; streak verification |
| **Launch screens / entry points** | inline vs expanded mode; multiple entrypoints; `_direct_launch` reserved entrypoint | Inline teaser → expanded play |
| **Post data** | small payload attached to the post for the client | Day number, headline verdict, beast silhouette hash |

**Documented limits that shape the design:**
- **No cross-subreddit Redis** → we deliberately build single-subreddit; no shared service needed.
- **Date rollover in the test harness**: "The testing docs say time does not advance in the harness"
  (r/Devvit **[indexed snippet]**). → We must build a **mod-menu "advance day" trigger** and a
  **clock-injection seam** so the molt is testable without waiting for midnight.
- **Scheduler tasks must hit endpoints matching `/internal/.+`** → our molt endpoint is
  `/internal/scheduler/molt`.
- **Journey maps must be reviewed/approved** before activation → budget review time; instrument early.

---

## 3. Component architecture

```
devvit.json                     # post entrypoints, scheduler task, triggers, permissions
src/
  client/                       # runs in the expanded webview
    App.tsx                     # routes: Splash | Beast | Result | Bestiary
    plate/                      # SVG field-plate renderer (zones, states, ridges, wounds)
      Beast.tsx
      tokens.css                # design tokens: bone/ink/vermilion/slate, type scale, 8px rhythm
    components/
      ZonePicker.tsx
      ToolRow.tsx               # shows effective/risky labels for the selected zone
      CrowdBar.tsx              # coarse, delayed shared meter
      ResultCard.tsx            # damage, read badge, streak, comment button
    api.ts                      # typed client for the server endpoints
    journeys.ts                 # Devvit Journeys instrumentation
  server/
    index.ts                    # Hono app
    routes/
      state.ts   GET  /api/state      # today's beast + user's lock + coarse split
      strike.ts  POST /api/strike     # validate + lock one (zone,tool); returns your damage band
      result.ts  GET  /api/result     # resolution card + bestiary entry
    engine/
      rules.ts        # ZONE_VALUE, TOOL_MULT, CROWD_FACTOR  (pure, no I/O)
      resolve.ts      # damage + outcome computation (pure)
      molt.ts         # derive day D+1 from day D (pure)
      rng.ts          # deterministic seeded PRNG (for skins/mutation cosmetics only)
    store/
      redis.ts        # typed Redis accessors, transactional writes
    scheduler/
      molt.ts         # /internal/scheduler/molt  (calls engine/molt.ts, writes D+1, posts)
    triggers/
      onInstall.ts    # creates the first post, seeds day 1
  shared/
    types.ts          # Zone, Tool, ZoneState, Submission, DayState, Result
```

**Purity boundary (mirrors the engineering constitution):** `engine/*` are **pure, I/O-free functions**
with no Redis, no network, no clock. They are unit-testable offline and are the single source of truth
for all rules. `store/*` and `scheduler/*` are the only side-effecting modules.

---

## 4. Request flows

### 4.1 First paint (inline → expanded)
1. The Interactive Post renders `splash.html` inline with `postData` = `{day, headline, silhouetteHash}`.
2. The user taps → expanded mode → `game.html` loads `App.tsx`.
3. `GET /api/state` returns today's beast, the user's lock status, and a **coarse** split band.
4. `journeys.AppReady()` fires.

### 4.2 A strike
1. `ZonePicker` + `ToolRow` → user taps **Strike**.
2. `POST /api/strike {zone, tool}`.
3. Server (in one Redis transaction):
   - `HGET day:{D}:subs {userId}` → if present, **reject** (one strike per day).
   - `HSET day:{D}:subs {userId} "{zone}:{tool}"`.
   - `HINCRBY day:{D}:counts {zone}:{tool} 1` and the per-zone counter.
   - `SET strike:{userId}:{D}` for a fast lock.
4. Server computes **this user's damage** using the current counts (a *provisional* value) and returns a
   damage **band** plus the coarse crowd position. The **exact** damage is finalised at resolution.
5. `journeys.Journey.Start/Progress/End` fire around the interaction.

### 4.3 Resolution (scheduler, 00:00 UTC)
1. `/internal/scheduler/molt` fires.
2. Load `day:{D}` submissions and counts.
3. `engine/resolve.ts` computes each submission's damage, `total_damage`, and the outcome.
4. Write `day:{D}:board` (sorted set) and `bestiary[D]`.
5. `engine/molt.ts` derives `day:{D+1}:state` (armour/raw/fatigue/ridges/mutation/escape penalty).
6. Award flairs (via Reddit API), unlock skins, then **create the daily post** for `D+1`.

---

## 5. Persistent storage requirements

| Requirement | Redis feature | Notes |
| --- | --- | --- |
| One submission per user per day | Hash + lock key, transactional | Integrity of the core rule |
| Live crowd split | Hash counters | Read for the coarse band |
| Per-day leaderboard | Sorted set | `day:{D}:board` |
| Season leaderboard | Sorted set | `season:board` |
| User progression | String/number keys | streak, trophies, reads |
| Bestiary | Hash | `D → result` |
| Beast state | JSON string | small, bounded |

All bounded and small; no unbounded growth (the bestiary is one hash entry per day).

---

## 6. Identity and sessions

- User identity is the **Reddit user id** supplied by the Devvit runtime to the server. The client
  never asserts identity; all submissions are keyed by the server-side user id.
- No passwords, no external auth, no PII stored. We store only gameplay state.
- **Respect deletions:** if a user is deleted or content removed, the triggers event lets us purge their
  keys (per Devvit Rules "Enable and respect user deletions").

---

## 7. Multiplayer / asynchronous interaction

MOLT is **asynchronous by construction**: there is no real-time session, no matchmaking, no websockets.
Players act independently across the day; the shared state is the aggregate. This is the most reliable
possible multiplayer model on Devvit (no long-running connections, no streaming), and it matches the
documented constraint that Devvit has no websockets.

---

## 8. Daily reset mechanism

- **Scheduler** task `molt` with cron `"0 0 * * *"`.
- The task is **idempotent**: it checks `bestiary[D]` and no-ops if day `D` is already resolved, so a
  retried or duplicated fire cannot double-resolve.
- A **mod-menu "advance day"** trigger calls the same endpoint with an explicit day id, so the day can
  be advanced on demand for testing and for the demo (the documented workaround for the harness's
  frozen clock).

---

## 9. Data integrity

- All writes that must be atomic (lock + counters) run in a **Redis transaction**.
- Rules are pure functions, so a given `(state, submissions)` always yields the same result → the day's
  outcome is **auditable and reproducible** from stored data.
- The client is never trusted for damage, counts, or identity.

---

## 10. Leaderboards and progression

- **Today's board:** `day:{D}:board` sorted set by damage.
- **Season board:** `season:board` sorted set by reads (sub-3% effective strikes).
- **Progression:** streak, trophies, reads, flair — all server-computed and stored.
- No currency, no purchases, no Devvit Payments (keeps us clear of the financial-services prohibition).

---

## 11. Journey instrumentation (the explicit criterion)

| Journey event | When | Payload |
| --- | --- | --- |
| `App.Ready` | Beast loaded and interactive | — |
| `Journey.Start` | First interaction of the session | — |
| `Journey.Progress` | Zone selected → 0.3; tool selected → 0.6 | `action` |
| `Journey.Interaction` | Strike submitted | `action:"strike"`, `actionDetails:{zone,tool}` |
| `Journey.End` | Result card shown | `complete:true`, `game:{win: outcome=="SLAIN", score: damage}` |

This gives the judges exactly what they asked for: "eventing… to reliably track users through game
loops for proper analytics, leaderboard tracking, and streak verification."

---

## 12. Abuse prevention (technical)

- One strike per user per day, enforced transactionally.
- Damage computed server-side only.
- Coarse, delayed split to prevent timing-snipe copying of the crowd's exact choices.
- Integrity uses distinct-user counting with a sqrt scale, so alt-farming is marginal.
- No user text/images in the loop → no moderation surface inside the game.
- No outbound links, no external services → Devvit-Rules compliant by construction.

---

## 13. Mobile browser performance

- Bundle is small (React + SVG, no game engine). Target: interactive in < 1.5 s on mid-tier mobile.
- The beast is a single SVG with a bounded node count (5–6 zones, a fixed set of hatch/wound patterns).
- No per-frame loops, no physics, no canvas churn — the screen is static except for the result
  animation (which respects `prefers-reduced-motion`).
- Post data is a tiny payload for the fast inline first paint.

---

## 14. Deployment and testing

- **Playtest loop:** `devvit playtest` on a dev subreddit; the app stays **private** for the hackathon
  (verified: "the app can remain private to qualify").
- **Testing strategy:**
  - `engine/*` — pure unit tests (Vitest): damage math, molt derivation, idempotency, edge cases
    (N=0, N=1, all-same-zone, tie-breaks).
  - `store/*` — route tests against an **in-memory Redis stub** (the pattern used by real Devvit apps),
    exercising the real routes: double-strike rejection, atomic counters, resolution.
  - **Clock injection** — the engine takes `now` as a parameter so the molt can be tested without
    waiting for midnight (the harness's frozen clock is the documented pain point).
- **Mod-menu "advance day"** for manual end-to-end verification of the daily loop.
- **Domain allow-list / app review** — no external domains are needed, so the allow-list step is trivial.

---

## 15. Riskiest technical assumptions (must be tested first)

| # | Assumption | How to de-risk (early spike) |
| --- | --- | --- |
| A1 | Redis transaction semantics are sufficient for the lock + counters | Build the strike route against the in-memory stub; then verify on a real dev install |
| A2 | The scheduler fires reliably at 00:00 UTC and the task is idempotent | Deploy a trivial scheduled task on day 1; observe two fires |
| A3 | The harness's frozen clock can be bypassed with an explicit day id | Prototype the mod-menu advance-day on day 1 |
| A4 | Inline → expanded transition works with the splash/entrypoint config | Prototype the two-entrypoint config from the docs on day 1 |
| A5 | SVG beast renders crisply and fast on mobile at 320 px | Render the plate on a real device early |
| A6 | Journeys events are approved and emitted | Submit the journey map for review early (docs: requires approval) |
| A7 | `postData` size is sufficient for the inline headline | Confirm the 2 KB budget covers `{day, headline, silhouetteHash}` |

**Every one of A1–A7 is testable within the first two days**, which is the correct way to spend the
schedule: prove the risky platform assumptions before polishing gameplay.

---

## 16. What we deliberately do NOT use

- No blockchain, crypto, wallets, tokens, or real-value currency (prohibited by Devvit Rules).
- No external servers, no third-party APIs, no paid services.
- No runtime LLM or AI API (the beast is a deterministic function of aggregate data — so the game
  cannot be "AI slop", and it remains fully playable with no AI cost).
- No websockets/real-time (unsupported, and unnecessary for an async game).
- No user-generated text/images in the core loop (removes the moderation burden).
