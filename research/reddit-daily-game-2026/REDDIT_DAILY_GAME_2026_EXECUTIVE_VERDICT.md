# Reddit's Game of the Day Hackathon 2026 — Executive Verdict

**Mission:** identify and validate a potentially winning entry. **RESEARCH ONLY.**
**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Evidence:** `evidence/` + 5 companion
documents in this directory.

---

## H. FINAL VERDICT — **CONDITIONAL GO**

> A genuinely competitive opportunity exists and scores **82/100**, but **two material items remain
> unresolved** and must be closed before any implementation is authorised. If both close favourably,
> this becomes a **GO**; if the port qualification fails, the fallback is still viable but the primary
> edge (the $6k ported subcategory) is lost.

**Recommended concept:** **TOWN** — a port of **Ledgertown** to Reddit's Devvit Web, re-implemented
as a compliant simulation. Primary target: **Best Ported Daily Game ($6,000)**; floor: **Honorable
Mention ($1,000)**; plus the two low-effort bonus prizes (**Feedback $200**, **Devvit Helper $500**).

**Why not an unconditional GO:** (1) the 2026 competitor gallery is unpublished, so the field is
unverified; (2) whether a re-implemented (non-blockchain) Ledgertown counts as a "port" is unconfirmed
by the organiser; (3) frictionless prize payment to Nigeria is probable but not confirmed.

**Why not a NO-GO:** a defensible, differentiated, achievable concept exists, it aligns with all four
judging criteria, it exploits the one structural advantage we hold (owned prior IP + an already-
validated economy engine), and it fits the ~2-week window.

---

## A. Competition assessment (VERIFIED — see `COMPETITION_INTELLIGENCE.md`)

- **Sponsor/Admin:** Reddit, Inc. **Prize pool $35,000.** **Deadline 2026-12-08 18:00 PT** (=
  2026-12-09 02:00 UTC); ~**19–20 days** remain.
- **Prizes:** Best Daily Game $15k · Best Ported Daily Game $6k · 10 × Honorable Mention $1k ·
  6 × Devvit Helper $500 · 5 × Feedback $200. **One prize per project.**
- **Judging:** pass/fail stage one (runs on Devvit), then **four equally-weighted criteria**:
  Delightful UX, Polish (incl. Devvit-Rules compliance), Reddit-y, Daily Content.
- **Requirements:** Devvit Web + Interactive Posts; app listing; **demo post in a public subreddit
  (<200 members)**; README; optional <1-minute video. **Do not publish** the app.
- **Eligibility:** open to those of the age of majority in their country. **Nigeria is eligible**
  (not named, not OFAC-embargoed). Payment via PayPal/Payoneer/Wise, W-8BEN, sponsor may withhold US
  tax; winner bears fees.
- **Key constraint:** **Devvit Rules prohibit financial and cryptocurrency products/services.** This
  governs how Ledgertown may be ported.

## B. Competitive landscape (VERIFIED proxy — see `COMPETITOR_MATRIX.md`)

- **2026 field is unpublished** — cannot be named; naming entrants would be fabrication.
- **Best proxy = the Jan–Feb 2026 Reddit Daily Games Hackathon: 525 submissions, 2,975
  registrations.** Awarded games verified: **BridgeDit** (Best Daily Game), **Sneakle**,
  **krawlings**, **SerpenTiles**, plus 10 Honorable Mentions. The five brief-named projects
  (BridgeDit, Hexaword, Sneakle, krawlings, SerpenTiles) are **all verified prior winners**.
- **The field is overwhelmingly parallel single-player puzzles.** The **unoccupied opportunity** is a
  **shared, persistent, interdependent world** where one player's daily action changes what everyone
  else sees — which almost nothing in either prior field does.
- **Most dangerous archetypes:** polished 3D + UGC (BridgeDit), and high-volume NYT-style daily
  puzzles (Hexaword/Sneakle). Our entry must beat both on *interdependence*.

## C. Existing IP assessment (VERIFIED — see `EXISTING_IP_ASSESSMENT.md`)

- **Ledgertown** (`itzebe/ledgertown`, MIT, HEAD `f499f01`): a validated, deterministic agent-run
  market economy; playable NEAR prototype; pure reusable logic (`economy.js`, `game.js`, `RULES.md`).
  **Port-eligible in principle, but the blockchain layer must be removed** to satisfy the Devvit
  Rules — the *economy engine* is the IP and it survives the port intact.
- **LAST BREATH** (`itzebe/last-breath`, HEAD `e231b43`): a mature React+Phaser adaptive-AI survival
  shooter. **Compliant and engine-supported (Phaser is an official Devvit template)**, but a weaker
  *daily-game* fit and a heavier in-window build.
- **Ownership:** both public, owned by the same account as this workspace. Clear.

## D. Opportunity shortlist (see `OPPORTUNITY_SCORING.md`)

| Rank | Concept | Score | ≥80? |
| --- | --- | --- | --- |
| **1** | **TOWN (Ledgertown port)** | **82** | **YES** |
| 2 | FRONTIER (shared contested map) | 79 | No |
| 3 | LAST BREATH: DAWN (community-adaptive daily) | 74 | No |
| 4 | FORGE (UGC daily-challenge engine) | 72 | No |
| 5 | VAULT (collective daily lock) | 71 | No |

## E. Winning candidate (see `OPPORTUNITY_SCORING.md` §Concept 1)

**TOWN.** A shared market town; daily gather/trade/invest; merchants go bankrupt and are revived by
collective action; a scheduled daily tick. **Reason for selection:** it is the only concept that
simultaneously (a) is a genuine **port** of owned IP, (b) fills the field's biggest gap (a *shared*
world), (c) scores on **all four** criteria, and (d) reuses an **already-validated** engine so the
build is bounded. **Biggest rejection risks:** Devvit-Rules compliance, port-qualification ambiguity,
first-screen legibility, and cold-start with few players.

## F. Demo specification (see `WINNING_DEMO_SPEC.md`)

A 60-second storyboard: hook ("the smith is 2 credits from closing") → central mechanic (a trade moves
a shared price) → the closure/revival moment → real comment thread + flair → streak/result card →
the town's one-line history. **Seven verifiable requirements** (V1–V7) define what must genuinely
work, each with an independent verification method. **No fabricated numbers.**

## G. Development feasibility (see `WINNING_DEMO_SPEC.md` §4–5)

**Engine:** Devvit Web (React client + Hono/Express server). **Architecture:** Redis (state,
server-authoritative daily actions, leaderboard) + scheduler (00:00 UTC tick + daily post) + post-data
(fast first paint) + Journeys (instrumentation). **No blockchain, no external service, no runtime
LLM.** **Effort:** ≈15 working days across 7 workstreams, within the ~19-day window. **Main risk:**
the Devvit upload/review loop, not the code.

---

## The two unresolved items that gate a GO

1. **Port qualification.** Send a written clarification to the hackathon manager (the Rules §11
   explicitly invite clarification requests): *does a Devvit re-implementation of an existing
   non-Reddit game, with the non-compliant blockchain layer removed, qualify for "Best Ported Daily
   Game" under §4 "significantly updated"?*
2. **Nigerian prize payment.** Confirm with the organiser/Devpost that a Nigerian winner can be paid
   via **Payoneer/Wise in USD**, and the expected withholding/fees.

*(A third item — the unpublished 2026 gallery — cannot be closed by us; it should be re-checked
periodically and before submission.)*

---

## Honest statement of what is and is not verified

**Verified (primary sources):** competition dates, prizes, judging criteria, submission rules,
eligibility text, Devvit Web capabilities and limits, Devvit Rules constraints, prior-edition winners
and field size, both existing repositories' contents and ownership.

**Not verified:** the 2026 competitor field; the organiser's stance on port qualification; the
Reddit-discussion FAQ content (the sandbox is IP-blocked from reddit.com; only indexed snippets were
available); Tavily search/extract was unavailable (plan limit) after two calls; You.com (YDC) was the
working research API throughout.

**Boundaries honoured:** no game was implemented; no existing repo, branch, or product spec was
modified; nothing was published, deployed, or submitted; no money was spent. This is research output
only, and it does **not** authorise implementation.

---

## Recommended next actions (if a GO is authorised later)

1. Close the two clarifications above.
2. Stand up a Devvit dev subreddit and confirm the end-to-end upload/playtest loop (the real schedule
   risk).
3. Build the compliance-first simulation slice (Redis + tick + one action) before any visual polish.
4. Only then design and record the demo against the V1–V7 verification checklist.
