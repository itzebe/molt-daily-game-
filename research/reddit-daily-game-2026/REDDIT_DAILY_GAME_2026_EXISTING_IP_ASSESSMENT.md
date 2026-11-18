# Reddit's Game of the Day Hackathon 2026 — Existing IP Assessment

**Compiled:** 2026-11-18. **Scope:** assess whether either existing project can credibly compete,
and specifically whether it can qualify for **Best Ported Daily Game**, **without rewriting its
product vision**.

**Repositories inspected (read-only clones to `/tmp`, no writes to any product repo):**
- **Ledgertown** — `github.com/itzebe/ledgertown` (public, MIT). HEAD
  `f499f01702fac9c5dfe9ee0e300510f327a74a78` (2026-11-10, "Merge pull request #11"). Owner `itzebe`
  = the same account as the BLACKHEART workspace, so ownership is **clear**.
- **LAST BREATH** — `github.com/itzebe/last-breath` (public). HEAD
  `e231b432eef89d29573ae0cba2f07dcce4d95014` (2026-11-02, "Merge pull request #4"). Located by
  listing `itzebe`'s repositories — the URL was **not guessed**; `itzebe/last-breath` is the only
  match ("AI-powered adaptive top-down survival shooter").

> Mission constraint honoured: this file **records findings only**. It does not change, branch,
> deploy, or re-specify either product.

---

## A. LEDGERTOWN

### A.1 What it actually is (VERIFIED from README, `docs/`, `web/`, `contract/`)

"A market town run by AI merchants, settled on NEAR. Four shops, four goods, one deterministic
economy." The repository contains a **playable NEAR-testnet prototype** plus the **validated economic
model** it is built on.

| Layer | Reality (verified) |
| --- | --- |
| Economy rules | `feasibility/RULES.md` + `simulate.py` reference engine; exact `Fraction` arithmetic; value-conservation assertion every day. Reported: 25 unit tests, 39 exploit probes, 11 scenarios, 22 sensitivity cases. |
| On-chain engine | `contract/src/lib.rs` (Rust + `near-sdk`, ~42 KB) — deterministic engine, i128 rational arithmetic; tested for **exact 30-day parity** vs the Python reference (`contract/tests/town.rs`), and live parity vs the deployed contract (`scripts/verify-parity.js`). |
| Merchants | Four real NEAR testnet subaccounts, each signing its own `merchant_decide` tx (`driver/agent.js` constrained policy). |
| Player actions | `tick`, `gather`, `buy`, `sell`, `invest` — real signed transactions (non-custodial via browser wallet). |
| Interface | `web/index.html` + `app.js`; price board, scarcity strip, per-shop risk lines, lifecycle timeline (CLOSED day 22 → REOPENED day 31 in the demo scenario). |
| Hosting | Vercel Hobby, read-only, no keys. |
| Tests | `node --test` (93 reported), `cargo test` (20 reported), pgTAP-style parity. |

**Core loop (VERIFIED):** gather goods → trade with autonomous merchants whose prices, stock and
cash are contract state → if you (or the town) flood a market a merchant goes **insolvent and closes**
→ it can be **revived by player investment**. Prices and closures are produced by *rules*, not by a
developer patch or randomness.

### A.2 Does it qualify for "Best Ported Daily Game"? (ANALYSIS)

Category text (VERIFIED): *"the best daily game that leverages a developer's existing IP or is ported
from another platform. Note you must own the original app/IP to qualify."*

| Requirement | Ledgertown | Verdict |
| --- | --- | --- |
| Own the original IP | MIT, owned by `itzebe` | **Met** |
| Be "ported from another platform" | It exists as a **NEAR** app; a Devvit version would be a platform port | **Plausibly met** |
| Preserve original identity | The identity is "agent-run market town; economy evolves by rules" — portable | **Met if preserved** |
| "Significantly updated after the start of the Submission Period" (§4) | Requires new, substantial work in Nov–Dec 2026 | **Met only if we build the Devvit layer during the window** |

**Critical blocker (VERIFIED, must not be glossed over):** the Devvit Rules state apps "should not…
promote or facilitate transactions in a prohibited or regulated industry such as… **financial and
cryptocurrency products and services**." A faithful Ledgertown port that keeps **NEAR, wallets, signed
transactions, or any real-value token** would very likely **fail app review** and could be rejected
outright — and "Polish" explicitly scores *compliance with Devvit Rules*. **A Ledgertown entry must be
re-implemented as a pure simulation with a fictional in-game currency and no blockchain, no wallet,
no external financial link, and no crypto references.**

**Does removing the blockchain destroy the vision?** No — and this is the key insight. Ledgertown's
*distinctive* claim in its own README is **"one deterministic economy… the agent proposes; the chain
decides… byte-reproducible."** The *deterministic rule engine* is the IP; the chain is the
*substrate*. Moving the same engine to a Devvit server (Redis + scheduled jobs) preserves the
identity — "an economy that evolves by rules, where AI merchants compete, go bankrupt and recover" —
while removing the non-compliant part. This is a **port**, not a rewrite, because the validated
`RULES.md` / `simulate.py` model and the `web/game.js` + `web/economy.js` derivation layer carry over
almost unchanged (both are **pure, I/O-free, dependency-light JS/Python**, ideal for reuse).

### A.3 What would need to change for a Reddit-native daily experience

- **Substrate:** NEAR contract → Devvit server logic (Redis for state, `scheduler` cron for the daily
  `tick`). `web/economy.js` / `web/game.js` port directly (pure functions, already unit-tested).
- **Identity of "AI merchants":** the merchant policy is already a **deterministic constrained
  function** (`driver/agent.js`), not an LLM at runtime. On Devvit it becomes a scheduled server
  function. This is compliant (no LLM needed; if an LLM were used it must be Gemini/ChatGPT per the
  rules).
- **Multiplayer:** the current prototype is effectively single-player-per-account against a shared
  market. On Reddit, the market is **shared by the whole subreddit** — every member's gather/trade
  moves the same prices. This is the natural upgrade and the source of the retention hook.
- **Daily loop:** one scheduled `tick` per day (00:00 UTC) plus a daily "market open" post; the day's
  consequence (a shop closing, a price crash) is visible to everyone the next morning.

### A.4 Verdict on Ledgertown (ANALYSIS)

Ledgertown is the **strongest candidate** for the ported category *if* re-implemented as a compliant
simulation. Its economics are already validated and deterministic; its UI derivation layer is
reusable; and it uniquely fills the "shared stateful world" gap identified in the competitor matrix.
The work is real but bounded: build a Devvit Web app around the existing pure logic. **It is NOT
automatically qualified** — it requires (a) a full compliance re-implementation, (b) substantial
in-window work, and (c) an organiser clarification that the port qualifies.

---

## B. LAST BREATH

### B.1 What it actually is (VERIFIED from README, `src/`, `supabase/`)

"A mobile-friendly, top-down 360° survival shooter where the arena studies how you fight." Built for
the **Loadout AI Game Competition**. React 18 + TypeScript + **Phaser 3** + Vite; **Supabase** auth +
PostgreSQL with RLS; Vitest; Vercel-ready static build.

**Architecture (verified):** a clean boundary between a **pure simulation** (`src/game/logic/`:
`simulation.ts`, `tacticalDirector.ts`, `behaviour.ts`, `enemies.ts`, `waves.ts`, `weapons.ts`) and
everything else. The `CombatSimulation` advances only when `step(dt)` is called — so combat, wave
pacing and the **adaptive AI** are testable headlessly and *provably* change behaviour. Server-side
scoring via `SECURITY DEFINER` functions; idempotent submissions; rate limits; plausibility checks.

**Game modes:** Survival (primary, scored), Deathmatch (vs labelled AI), Operations (scripted
missions). Seven enemy doctrines + THE EXECUTOR boss. Four weapons. Dodge roll, grenades, roguelite
upgrades. Status: "Part 4" — a mature, deep build.

### B.2 Can it qualify for the ported category? (ANALYSIS)

| Requirement | LAST BREATH | Verdict |
| --- | --- | --- |
| Own the IP | Public repo by `itzebe`; original | **Met** (confirm no third-party assets) |
| Ported from another platform | It is a **web app** (React/Phaser) — "another platform" relative to Reddit | **Met** |
| Preserve identity | "Adaptive-AI survival shooter" is portable | **Met** |
| Devvit compliance | No financial/crypto content — **compliant** | **Met** |
| Engine fit | Phaser 3 is an **officially supported** Devvit Web template | **Met** |

**This is the cleaner compliance story of the two.** Phaser is explicitly supported by Devvit Web
(`reddit/devvit-template-phaser`), the game has no prohibited content, and its pure simulation layer
would port to the Devvit client runtime directly.

### B.3 Can its mechanics support *daily* gameplay? (ANALYSIS — this is the problem)

LAST BREATH is a **real-time action game**. Its natural loop is "play a run, score it, climb a
leaderboard." That is *recurring* but not *daily-content* in the sense the criteria reward ("recurring
content, challenges, and intrigue… smart use of fresh content"). To make it a **daily game** you need
a seeded daily run (everyone faces the same arena/wave set), a daily leaderboard, and a reason the
*content* differs each day.

Two further concerns:
1. **"Common Ideas" penalty.** The organiser explicitly lists **space shooters, clone apps of popular
   games, simple platformers, collaborative storytelling, trivia** as scoring *penalties*, and warns
   that games resembling popular genres must be "extremely unique." A top-down survival shooter sits
   squarely in a crowded action genre. It would need a strong, legible hook (the adaptive-AI angle)
   to avoid the penalty.
2. **Build cost in-window.** LAST BREATH is a large, deep codebase; reducing it to a Devvit-hosted,
   daily-seeded, mobile-first slice in ~2 weeks is materially harder than the equivalent Ledgertown
   slice, and Supabase must be replaced by Devvit Redis/server logic.

### B.4 Verdict on LAST BREATH (ANALYSIS)

Compliant, engine-supported, and technically impressive — but its **mechanics are a weaker fit for a
"daily game"** than Ledgertown's, and it risks the "common ideas" penalty. Its **adaptive-AI behaviour
model** is genuinely distinctive and could be repurposed (e.g. a daily arena where the AI *learns the
community's* dominant strategy across the day and adapts tomorrow). That reframing — **"the arena
learns how the community plays, and adapts each day"** — is the only version with a defensible
differentiation story. As-is, it is a **moderate** candidate, behind Ledgertown.

---

## C. Side-by-side

| Dimension | Ledgertown | LAST BREATH |
| --- | --- | --- |
| Ownership evidence | MIT, `itzebe`, public | Public, `itzebe` |
| Devvit-Rules compliance as-is | **Blocked** (crypto) → needs re-implementation | **Clean** |
| Engine fit | React/DOM → direct | **Phaser (official template)** |
| Pure logic reusable | **Yes** (`economy.js`, `game.js`, `RULES.md`) | **Yes** (`game/logic/`) |
| Fit for a *daily* game | **Strong** (daily tick, shared market) | Weak (real-time action) |
| Distinctiveness vs field | **High** (shared stateful world) | Medium (crowded genre; AI hook helps) |
| 2-week feasibility | **Higher** (smaller, pure core) | Lower (large, Supabase-coupled) |
| "Common ideas" risk | Low | **Medium–High** |
| Port-category fit | **Best** | Good |

**Recommendation carried into scoring:** treat **Ledgertown-as-compliant-simulation** as the primary
port candidate; treat **LAST BREATH with a community-adaptive daily hook** as a secondary concept; and
close the port-qualification clarification before committing.
