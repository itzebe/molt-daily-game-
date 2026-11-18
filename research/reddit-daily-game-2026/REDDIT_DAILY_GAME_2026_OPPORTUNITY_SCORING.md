# Reddit's Game of the Day Hackathon 2026 — Opportunity Scoring

**Compiled:** 2026-11-18. **Method:** five genuinely distinct concepts, each scored 0–100 on the
mission's weighted rubric, each attacked adversarially before scoring. Scores are calibrated against
the verified field in `REDDIT_DAILY_GAME_2026_COMPETITOR_MATRIX.md` and the verified criteria in
`REDDIT_DAILY_GAME_2026_COMPETITION_INTELLIGENCE.md`.

---

## Scoring rubric (mission-specified)

| Dimension | Weight | What a high score requires |
| --- | --- | --- |
| Problem / entertainment importance | 15 | Immediately fun or compelling; legible to a newcomer |
| Innovation | 20 | A mechanic the platform has not seen; not a reskin |
| Originality & differentiation | 20 | Cannot be confused with an existing entry or a "common idea" |
| Judging-criteria alignment | 20 | Strong on **all four** equally-weighted criteria (UX, Polish, Reddit-y, Daily Content) |
| Demo feasibility | 15 | Provable end-to-end in the ~2-week window, on Devvit |
| Adoption & retention | 10 | A daily habit that survives week two |

---

## The five concepts

| # | Codename | One line | Type |
| --- | --- | --- | --- |
| 1 | **TOWN** | A persistent market town the whole subreddit runs together: daily gather/trade moves real prices; merchants go bankrupt and can be revived by collective investment. | **Port** (Ledgertown) |
| 2 | **FRONTIER** | A shared contested hex map; each player gets **one claim per day**; territory is taken, held and lost; alliances and betrayals become subreddit lore. | New build |
| 3 | **VAULT** | A daily collective lock: each player's input reveals a *different* fragment; the community must pool clues in the comments to open the vault before reset. | New build |
| 4 | **FORGE** | A UGC engine: players author a 30-second puzzle, the community plays yesterday's top-rated one; a rotating creator leaderboard. | New build |
| 5 | **LAST BREATH: DAWN** | A daily seeded survival run where the arena AI adapts to the **community's aggregate playstyle**, so tomorrow's enemies counter what the community did today. | **Port** (LAST BREATH) |

---

## Scorecard

| Dimension (weight) | TOWN | FRONTIER | VAULT | FORGE | LB: DAWN |
| --- | --- | --- | --- | --- | --- |
| Entertainment importance (15) | 11 | 13 | 11 | 12 | 14 |
| Innovation (20) | 16 | 13 | 13 | 12 | 15 |
| Originality & differentiation (20) | 17 | 13 | 14 | 12 | 12 |
| Judging-criteria alignment (20) | 17 | 18 | 16 | 17 | 15 |
| Demo feasibility (15) | 13 | 14 | 11 | 12 | 11 |
| Adoption & retention (10) | 8 | 8 | 6 | 7 | 7 |
| **TOTAL (100)** | **82** | **79** | **71** | **72** | **74** |
| **Qualifies (≥80)?** | **YES** | No | No | No | No |

Only **TOWN** reaches the bar. The reasoning for each is below, including the adversarial attack
that produced each score.

---

## Concept 1 — TOWN (Ledgertown port) — **82 / 100 — QUALIFIES**

**The actual game.** A small market town rendered as a single Reddit post. Four AI-run shops trade
four goods. The whole subreddit shares one market: every member's daily action moves the same prices.
Flood the iron market and the smith's cash goes negative — the shop **closes**; the community can
**reopen** it by investing. The economy is deterministic and rule-driven (no randomness, no dev
patch), so the town's story is *earned* by the players.

**Core mechanic.** One daily "market move": gather a good, or buy/sell at the live board, or invest in
a struggling shop. The scheduled daily **tick** applies every player's action at once and re-prices
the town.

**First 30 seconds.** The post opens on today's town: a price board, four shop cards showing stock,
cash, and a plain-language risk line, and **one highlighted action** — "Iron is 40% below fair value
at the smith; gather or buy." The player taps once and sees their net worth change and the town's
numbers update.

**Why players return tomorrow.** The town has *moved* because of what the community did. "Did the
smith reopen? Did the price war end? Who's bankrupt now?" The consequence is shared, legible and
different every day — the strongest possible answer to the "Daily Content" criterion, and the reason
a shared world out-retains a parallel puzzle.

**Why it is Reddit-native.** The market is *the subreddit*. Discussion in the comments is the
strategy layer ("everyone sell iron now"), flairs can mark "town investor", and a daily post is the
town's front page. It brings a community together around one shared object — the literal definition
of the "Reddit-y" criterion.

**Why it is different from existing entries.** Per the competitor matrix, essentially **no** entry in
either prior field is a **shared, persistent, interdependent** world. The field is parallel
single-player puzzles. TOWN is the only concept that makes one player's action change another
player's tomorrow.

**Why judges would care.** It scores on all four criteria at once: Delightful UX (a live market with
visible drama), Polish (the engine is already built and tested), Reddit-y (community-owned economy),
Daily Content (a scheduled tick and a new town every day). It also earns the **ported** subcategory
(IP owned) without weakening the original vision.

**Technical architecture (see `WINNING_DEMO_SPEC.md` for detail).** Devvit Web: client (React, reusing
`web/economy.js` + `web/game.js` pure functions), server (Hono/Express endpoints), **Redis** for
market state and per-user daily actions, **scheduler** cron for the 00:00 UTC tick and daily post,
**post-data** for the fast first paint, **Journeys** for instrumentation. No blockchain, no wallet —
a fictional in-game currency only (Devvit-Rules compliant).

**Development difficulty.** Moderate. The hard part — the economy — is *already validated* (25 tests,
39 exploit probes, exact parity between two independent implementations). The new work is a UI, a
Redis schema, a cron tick, and a compliance re-implementation. Bounded and well-understood.

**How it could fail.** (a) **Compliance** — if any crypto/NFT/wallet language survives, app review
fails and "Polish" collapses. (b) **Legibility** — economics can feel dry; a bad first screen kills
the "Delightful UX" score. (c) **Cold-start** — a shared economy is only fun with enough daily
players; a near-empty town is a dead town. (d) **Port-qualification ambiguity** — if the organiser
does not accept the Devvit version as a "port", the $6k subcategory edge is lost (the $15k main
category is still open).

**How competitors could outperform.** A competitor could ship a **more visually spectacular** shared
world (e.g. a 3D shared city), or a **more immediately fun** shared mechanic (e.g. a shared
co-operative arcade). A polished UGC engine (FORGE-like) also competes well on the Reddit-y axis.

**How we defend.** (1) Keep the economy **compliant by construction** — an explicit "no blockchain"
review gate. (2) Lead with a **single-tap first screen** and a dramatic, human-readable consequence
("The smith closed. 412 redditors caused this."). (3) Seed the town with a scripted **troubled start**
so there is drama on day one even with few players. (4) Target the **ported** subcategory explicitly
in the submission text and request a port clarification from the organiser early.

---

## Concept 2 — FRONTIER (shared contested map) — **79 / 100 — below bar**

**The game.** A shared hex map; one claim per player per day; territory taken, held, lost; alliances
and betrayals become lore.

**Adversarial attack.** Territory-claiming is a **known genre** (r/place, Risk-likes, territory.io
games). It is highly Reddit-native and very demoable — hence its 18 on alignment and 14 on demo
feasibility — but it is **not original** enough to clear the "common ideas / clone" bar, and it
carries a serious **abuse/trolling** surface (a single griefing clan can ruin a map). Innovation 13,
Originality 13.

**Verdict.** Strong on alignment and demo, weak on originality. **Below 80.** A reasonable fallback
if TOWN's port qualification fails, but not the recommendation.

---

## Concept 3 — VAULT (collective daily lock) — **71 / 100 — below bar**

**The game.** A daily multi-step lock; each player's input reveals a different fragment; the
community pools clues in comments to open it.

**Adversarial attack.** Collective problem-solving is genuinely community-native (16 alignment), but
it sits **adjacent to the penalised "collaborative storytelling"** pattern, and it imposes a brutal
**content-authoring burden**: a fresh, fair, solvable multi-step puzzle *every day* for ~20+ days.
That is the exact failure mode the criteria's "well-calibrated difficulty curve" warns about. Demo
feasibility 11, retention 6 (frustration churn).

**Verdict.** **Below 80.** The daily content cost is the killer.

---

## Concept 4 — FORGE (UGC daily-challenge engine) — **72 / 100 — below bar**

**The game.** Players author a 30-second puzzle; the community plays yesterday's top-rated one; a
creator leaderboard rotates daily.

**Adversarial attack.** UGC is a **proven winner pattern** (Oneline won the UGC award; XO Math Puzzles
shipped user puzzles) — which means it is *not* a gap; it is the field's incumbent strength.
Originality 12. It also carries a **moderation burden** that threatens the "Polish/compliance" score
and a **cold-start** dependency on creators. Self-renewing content (Daily Content 5) is its main
strength, giving alignment 17.

**Verdict.** **Below 80.** Good, proven, but not differentiated.

---

## Concept 5 — LAST BREATH: DAWN (adaptive-AI port) — **74 / 100 — below bar**

**The game.** A daily seeded survival run; the arena AI adapts to the community's *aggregate*
playstyle, so tomorrow's enemies counter what the community did today.

**Adversarial attack.** The game is **immediately fun** (entertainment 14) and the community-adaptive
AI is genuinely novel (innovation 15). But: (a) it is a **top-down survival shooter** — the organiser
explicitly lists "space shooters… clone apps of popular games" as a **penalty** (originality 12);
(b) it is **single-player action**, so the "Reddit-y / bring a community together" criterion is weak
(alignment 15); (c) the codebase is **large and Supabase-coupled**, and a daily-seeded mobile-first
slice plus a Phaser port plus a Supabase→Redis rewrite is **not safely deliverable in two weeks**
(demo feasibility 11).

**Verdict.** **Below 80.** Compliant and technically impressive, but a weaker *daily-game* fit than
TOWN and a heavier in-window build.

---

## Adversarial review of the winner (independent-reviewer pass)

Attacking TOWN as a senior reviewer who did not write it:

- **"Is it actually production-ready-able?"** The economy engine is; the *game feel* is not yet
  demonstrated. Mitigation: the demo spec in `WINNING_DEMO_SPEC.md` requires the working loop, not a
  mock.
- **"Is the architecture appropriate?"** Yes — Redis + cron + pure-function client is the correct,
  minimal Devvit architecture; it avoids the "no long-running connections" and "no cross-subreddit
  Redis" limits (single-subreddit design).
- **"Any security/abuse gaps?"** Yes, one real one: **who may act, and how often.** Must be solved
  with per-user daily-action keys in Redis and server-side validation (never trust the client's
  "I gathered 50"). This is a *design requirement*, not a blocker.
- **"Hidden regressions?"** None — it is a new Devvit app; no existing product is touched.
- **"Acceptance evidence?"** The score is supported by verified criteria and a verified field; the
  port claim is *not yet verified* (organiser clarification outstanding).

The reviewer finds **no fatal flaw**, one **material unresolved item** (port qualification) and one
**material design requirement** (server-authoritative daily actions).

---

## Final shortlist ranking

| Rank | Concept | Score | Status |
| --- | --- | --- | --- |
| **1** | **TOWN (Ledgertown port)** | **82** | **Recommended (≥80)** |
| 2 | FRONTIER | 79 | Strong fallback |
| 3 | LAST BREATH: DAWN | 74 | Not recommended |
| 4 | FORGE | 72 | Not recommended |
| 5 | VAULT | 71 | Not recommended |

**One concept qualifies.** The recommendation is **TOWN**, conditional on the port-qualification and
Nigerian-payout clarifications being closed (see the verdict file).
