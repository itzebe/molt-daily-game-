# Reddit's Game of the Day Hackathon 2026 — Winning Demo Specification

**Candidate:** **TOWN** — the Ledgertown port (score 82/100).
**Compiled:** 2026-11-18. **Scope:** design the demonstration *before* any development, so that what
must be built is defined by what must be shown.

> **Honesty rules applied throughout.** This storyboard describes functionality that must be **real
> and independently verifiable**. No simulated player counts presented as real, no fabricated
> leaderboard positions, no fake transactions, no mocked backend presented as live. Where a number
> would be illustrative, the spec says so and requires it to be labelled.

---

## 1. What "TOWN" is (one paragraph, for the README and the submission text)

A small market town rendered as a single Reddit post. Four AI-run shops trade four goods on one
**shared** market. Every redditor's daily action — gather, buy, sell, or invest — moves the same
prices for everyone. If the community floods a market, a shop's cash goes negative and it **closes**;
the community can **reopen** it by investing. The economy is deterministic and rule-driven, so the
town's story each day is earned by the players, not scripted. It is a **port** of Ledgertown to
Reddit's Developer Platform, re-implemented as a compliant simulation (no blockchain, no wallet, no
real-value tokens).

---

## 2. The 60-second demo storyboard

Target: **one minute**, uploaded to YouTube, showing the game **running on Reddit** (mobile portrait
and desktop), per the submission requirements. Timecodes are for the edited video.

| Time | Beat | On screen (must be REAL) |
| --- | --- | --- |
| **0–10s** | **Immediate hook** | Open on a Reddit post in the town's subreddit: **"Day 51 — the smith is 2 credits from closing."** The price board is visible; iron is flashing **40% below fair value**. One big button: **Gather iron**. The viewer understands the whole game in one line. |
| **10–20s** | **Central mechanic** | Tap **Gather iron** → the player's cargo fills, net worth ticks up. Then tap **Sell to the smith** → the smith's cash bar visibly drops and the iron price moves. The point: *my trade just moved a real price everyone else sees.* |
| **20–35s** | **Distinctive feature** | Cut to the **town ledger**: show the smith's cash crossing zero and the shop flipping to **CLOSED** with a timestamp and the number of contributing redditors. Then show a second redditor **investing** and the shop flipping back to **REOPENED**. This is the shared-consequence moment — the thing no parallel puzzle has. |
| **35–45s** | **Reddit-native component** | Cut to the **comment thread** under the daily post: real comments reacting to the closure ("we killed the smith 😭", "I'm investing 40"). Show a **flair** on a commenter ("Town Investor") and the daily post's **upvote/comment counts** as they actually are at record time. Do **not** inflate them. |
| **45–55s** | **Daily progression** | Show the **streak + stats card** ("Your day 51 result"), and the **"tomorrow"** preview: "Next tick 00:00 UTC — the smith restocks; the price war with the miller continues." Show a streak counter and a per-day net-worth sparkline drawn from real stored state. |
| **55–60s** | **Memorable payoff** | Final frame: the town's one-line history — **"Day 22: CLOSED. Day 31: REOPENED. Day 51: contested."** — then the game name and **r/<town-subreddit>**. One clean, quotable image. |

**Editing constraints.** No stock footage, no mockups, no invented numbers. If the demo subreddit has
few real participants at record time, **say so on screen** ("demo town, N players") rather than
implying a crowd.

---

## 3. What must work for the demo to be independently verifiable

The judges will open the **demo post** and play. The following must genuinely function (not be
mocked), and each is listed with how a third party verifies it:

| # | Required functionality | How it is verified |
| --- | --- | --- |
| V1 | The app is **installed and running** in a public subreddit; the daily post opens the game inline. | Judge opens the demo link; the game loads and is playable. |
| V2 | **Gather / buy / sell / invest** each work and are **server-authoritative** (client cannot fake amounts or frequency). | Judge performs each action; the resulting state is consistent on reload; a second account sees the change. |
| V3 | The market is **shared**: one account's trade changes the price/stock a **different** account sees. | Judge trades in account A, reloads in account B, observes the change. |
| V4 | The **scheduled daily tick** runs and produces a **new day** with updated prices and a new post. | Judge checks the post's day number advances on the next UTC day (or the app exposes a "last tick" timestamp). |
| V5 | **Closure and revival** actually occur from real actions (not a scripted animation). | Judge can reproduce closure by flooding a market, and revival by investing, within the demo. |
| V6 | The **result card** shows the player's real numbers and a streak that increments on consecutive days. | Judge plays two consecutive days (or inspects stored state). |
| V7 | **Devvit Journeys** instrumentation fires (App.Ready, Journey.Start/Progress/End). | Visible in the app's analytics; noted in the README. |

**Not required to be real for the demo, but must be clearly labelled if shown:** a large player
population; a long historical timeline (the timeline shown must be from the *demo town's* real days,
labelled as such).

---

## 4. Required Devvit architecture (minimal, compliant)

```
src/
  client/        React + the ported pure economy functions (web/economy.js, web/game.js)
    index.html   single-screen town UI (no inline scrolling; fits the viewport)
  server/        Hono/Express endpoints, all under /api/
    state        read town + user state
    act          validate + apply one user action (server-authoritative)
    tick         the scheduled daily tick (called by scheduler)
devvit.json      post config, scheduler task, triggers, permissions, redis
```

| Capability | Use | Source of truth |
| --- | --- | --- |
| **Redis** | Market state (shops, prices, stock, cash), per-user daily-action guard, streaks, sorted-set leaderboard | `developers.reddit.com/docs/capabilities/server/redis` |
| **Scheduler** | 00:00 UTC daily `tick` + daily post creation | `.../capabilities/server/scheduler` |
| **Post Data (2 KB)** | Small fast first-screen payload (today's headline, day number) | `.../capabilities/server/post-data` |
| **Triggers / menu** | `onAppInstall` creates the first post; a mod menu item can (re)create the daily post | `.../capabilities/server/triggers` |
| **Devvit Journeys** | Session telemetry for the "Journey Instrumentation" bonus | `.../capabilities/analytics/devvit-journeys` |

**Deliberately NOT used:** any external service, any blockchain, any LLM at runtime (the merchant
policy is a deterministic function), and any cross-subreddit data (Devvit Redis is per-installation —
a single-subreddit design avoids that limit entirely).

**Compliance gate (mandatory before upload):** a review pass that confirms **no** wallet, token, NFT,
chain, crypto, or real-money reference exists anywhere in code, UI, README or demo video.

---

## 5. Feasibility of the demo in the ~2-week window (INFERENCE)

| Workstream | Estimate | Risk |
| --- | --- | --- |
| Devvit Web scaffold (React template) + dev subreddit + upload loop | 2 days | Low |
| Redis schema + server-authoritative `act`/`state` endpoints | 3 days | Medium |
| Port `economy.js`/`game.js` + build the town UI | 4 days | Medium |
| Scheduler tick + daily post + closure/revival events | 2 days | Medium |
| Streaks, result card, leaderboard, Journeys instrumentation | 2 days | Low |
| Compliance review, README, demo video, submission packaging | 2 days | Low |
| Buffer | 2 days | — |

Total ≈ **15 working days**, consistent with the ~19 days remaining (deadline 2026-12-09 02:00 UTC).
**The single largest schedule risk is the Devvit upload/review loop**, not the code (domain
allow-lists are reviewed in 1–2 business days; inline-webview approval can be longer — hence the spec
starts from the **splash-screen** first screen and treats inline webview as an upgrade, exactly as the
docs recommend).

---

## 6. What would make the demo *win* rather than merely *pass*

1. **The first line is the whole game.** "The smith is 2 credits from closing." A judge understands
   TOWN in five seconds.
2. **A visible shared consequence.** The closure/revival moment is the differentiator; it must be on
   screen by 0:35.
3. **Craft.** The town UI must look deliberately designed (per the design constitution: one accent,
   a real type scale, no generic component soup) — because "Polish" is a quarter of the score.
4. **An honest town.** Show the real player count, whatever it is; credibility beats inflation.
