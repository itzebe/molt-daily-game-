# Reddit's Game of the Day Hackathon 2026 — Competition Intelligence

**Mission:** identify and validate a potentially winning entry (RESEARCH ONLY).
**Compiled:** 2026-11-18. **Compiler:** OpenHands agent.
**Primary sources:** official Devpost overview + full Official Rules (fetched and archived), Reddit
developer documentation (git clone of `reddit/devvit-docs`), `support.reddithelp.com` program terms.
**Evidence archive:** `evidence/` in this directory (see `SHA256SUMS.txt`).

> **Honesty note on method.** This sandbox is IP-blocked by `reddit.com`/`old.reddit.com`
> (HTTP 403 on HTML, `.json` and `.rss`; the block page is archived as
> `evidence/phase1_reddit_blocked_evidence.json`). The Tavily MCP search/extract tools returned a
> plan-limit error (`432`) after two calls. Reddit *discussion* content below is therefore taken from
> the **You.com search index (YDC API)** and is marked **[indexed snippet]** where I could not read
> the page directly. Everything attributed to Devpost, `developers.reddit.com`, `reddithelp.com` or
> GitHub was read from the primary source.

---

## 1. Identity and schedule (VERIFIED — primary source)

| Field | Value | Source |
| --- | --- | --- |
| Event | Reddit's Game of the Day Hackathon ("the Hackathon") | `redditgameofday2026.devpost.com` |
| Sponsor & Administrator | **Reddit, Inc.**, 548 Market St #16093, San Francisco, CA 94104 | Official Rules §2 |
| Submission Period | **2026-11-11 12:00 PT → 2026-12-08 18:00 PT** (18:00 PST = 21:00 EST = 2026-12-09 02:00 UTC) | Official Rules §1 |
| Feedback Period | Same as Submission Period | Official Rules §1 |
| Judging Period | 2026-12-09 00:00 PT → 2026-12-16 18:00 PT | Official Rules §1 |
| Winners announced | ~2026-12-17 15:00 PT | Official Rules §1 |
| Registrations at time of research | **1,660 participants** (Devpost, 2026-11-18); an independent tracker reported 1,344 by 2026-11-16 | Devpost page; `tierones.io` |
| Prize pool | **$35,000 cash** | Devpost page |

Confidence: **High** (verbatim from archived primary sources).

---

## 2. Prize structure (VERIFIED)

| Prize | Amount | Qty | Eligible pool |
| --- | --- | --- | --- |
| **Best Daily Game** (grand) | $15,000 | 1 | All eligible submissions |
| **Best Ported Daily Game** | $6,000 | 1 | All eligible submissions |
| **Honorable Mentions** | $1,000 | 10 | All eligible submissions |
| **Devvit Helpers** (bonus) | $500 | 6 | Community contributors (individuals) |
| **Feedback Awards** | $200 | 5 | Feedback survey submissions (individuals) |

Rules on stacking (VERIFIED): a project can win **only one (1) prize**; Devvit Helpers and Feedback
awards go to **individuals, not projects**, and are separate from project prizes.

**Interpretation (INFERENCE).** "Best Ported Daily Game" is a *subcategory award*, not a separate
contest — the rules state the subcategory winner is "one top scoring game", and every prize lists "All
Eligible Submissions" as its eligible pool. A port therefore competes for **both** Best Ported Daily
Game ($6,000) and Best Daily Game ($15,000); the single-prize rule caps it at one.

---

## 3. Judging criteria and weights (VERIFIED)

Two stages (Official Rules §6):

- **Stage One (pass/fail):** does the project "reasonably fit the theme and reasonably apply the
  required APIs/SDKs" — i.e. it must actually run on Devvit.
- **Stage Two:** scored on **four equally-weighted criteria** (no published numeric weights beyond
  "equally weighted"):

| Criterion | Official wording (abridged) |
| --- | --- |
| **Delightful UX** | "built with exciting layouts and themes… easy and fun to uncover what the app has to offer" |
| **Polish** | "as close to publishable as possible and compliant with Devvit Rules… the closer to launch quality, the higher the score" |
| **Reddit-y** | "community-minded… the best apps will bring a community together" |
| **Daily Content** | "recurring content, challenges, and intrigue… make smart use of fresh content" |

The Devpost *overview* page adds a **non-binding** "what will make your Daily Game stand out" list
(VERIFIED, page text): Intuitive Onboarding; Visual Craft; Calibrated Daily Content; Focused
Gameplay; Clear End States & Re-engagement Loops; **Journey Event Instrumentation** (Devvit
Journeys). It also names an explicit **"what we're NOT looking for"** list: **AI Slop**, **on-the-nose
Reddit theming**, **Common Ideas** ("space shooters, clone apps of popular games, simple platformers,
collaborative storytelling apps, and trivia apps"), and **games not on Reddit**.

Confidence: **High**. This is the single most important alignment signal in the whole mission — the
four Stage-Two criteria are the *actual* scorecard, and "Common Ideas" is called out as a scoring
penalty.

---

## 4. Eligibility — and the Nigeria question (VERIFIED)

Official Rules §3. **Open to** individuals "at least the age of majority where they reside", teams of
such individuals, and organizations. **NOT open to** residents/entities of a country where US or
local law prohibits participation or prize receipt, explicitly naming:

> Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, Syria, and any other country designated by
> the United States Treasury's Office of Foreign Assets Control (OFAC).

**Nigeria is not named**, is not on OFAC's comprehensive-embargo list, and no US prohibition on
Nigerian participation or prize receipt was found. **Nigeria is therefore an eligible jurisdiction**,
subject to the individual being of the age of majority in Nigeria (18).

**Prize payment to Nigeria (VERIFIED mechanics; INFERENCE on the path).** Rules §8:
- Prize is payable to the entrant (or representative/org); a **monetary prize is mailed to the
  winner's address or sent electronically to a bank account**, only after the winner affidavit and
  "Required Forms" are returned (deadline: **10 business days** after forms are sent; payment within
  **60 days** of receipt).
- Non-US residents may be required to file a **W-8BEN**; the sponsor may **withhold US tax**.
- Winners bear **all fees** (wiring, FX) and **all taxes** in their jurisdiction.
- Devpost's own prize-claim guidance states winners need a **PayPal, Payoneer or Wise** account that
  **can receive international transfers and USD**, with no per-transaction cap below the prize.

Path to Nigeria (INFERENCE, medium confidence): Payoneer and Wise business/personal USD receiving
accounts are widely used in Nigeria; Payoneer is Devpost's named option and works for Nigerian
recipients (You.com-indexed sources, 2026: `mctaba.com`, `turnetfinance.ng`, `anatech.com.ng`).
Residual risk: Devpost may fall back to wire/PayPal, and PayPal receive-functionality for Nigeria is
historically restricted. **Action item before any GO:** confirm with the hackathon manager
(`devpost` email / Reddit contact) that a Nigerian winner can be paid via Payoneer/Wise USD, and that
no withholding blocks the net amount.

Confidence: **High** on eligibility; **Medium** on frictionless payment.

---

## 5. Submission requirements (VERIFIED)

Required:
1. **App listing** — link to the app on `developers.reddit.com/apps/{app-name}` (created after upload).
2. **Demo post** — link to a **public subreddit and a public post running the game**. Rules §4
   *Testing*: the post should be in a **public subreddit with fewer than 200 members**; the app must
   be free and unrestricted for judges until the Judging Period ends. **"Judging will score your game
   based on the demo link."**
3. **README.md** in the app root describing the game and how to play.
4. **Text description** of features/functionality.
5. **Optional** demo video, **< 1 minute** ("judges are not required to watch beyond one minute"),
   publicly hosted on YouTube/Vimeo/Facebook/Youku, showing the project **functioning on the device
   for which it was built**.
6. **Optional** public code repository.
7. **Optional** developer-feedback survey (Feedback Award).

Constraints:
- **Do NOT publish the app** during the hackathon. "Once uploaded to Devvit, the app can remain
  private to qualify." Publishing is for launch-ready apps; the hackathon wants upload + playtest.
- **New & existing:** projects existing before the Submission Period must be **"significantly
  updated after the start of the Hackathon Submission Period"**, and entrants must explain how.
- **Projects that won any previous Reddit hackathon are ineligible.**
- **IP:** submission must be the entrant's original work product; the entrant must own or license all
  materials. Submissions remain the entrant's IP; Reddit gets a paid, non-exclusive license to use
  them for running/judging the Hackathon.
- **Language:** English (or full English translation).
- **Financial/preferential support:** projects developed with support from the Sponsor are
  disqualified.

Confidence: **High**.

---

## 6. Platform requirements — Devvit Web (VERIFIED)

From the Devpost overview and `developers.reddit.com`:
- Must be built on **Devvit Web** using **Interactive Posts**; must actually run on Reddit ("You
  simply cannot place in this hackathon if your game isn't running on Reddit").
- Permitted tooling: **React, Phaser, Three.js**, or a **game engine (Godot, GameMaker, Unity, etc.)**
  compiled to web. Engines must produce HTML/CSS/JS for the Devvit webview.
- Bonus for layering Reddit features: **Devvit Journeys**, **flair**, **comments**, **snoovatars**,
  **streaks**.
- Must be **compliant with the Devvit Rules**.
- Reference daily games the organiser points to: **r/hotandcold, r/colorpuzzlegame, r/syllo,
  r/pocketgrids**.

**Critical Devvit Rule constraint (VERIFIED, `developers.reddit.com/docs/devvit_rules`):**
> "You should not create an app or functionality that promotes or facilitates transactions in a
> prohibited or regulated industry such as (but not limited to) **gambling**, healthcare,
> **financial and cryptocurrency products and services**, political, alcohol, recreational drugs…"

Also prohibited: **linking out to external apps / promoting an off-platform version** ("no linking
out to external apps"), **third-party IP without permission** ("no copycat or clone apps"), and use
of **Reddit trademarks/Snoo**. LLM use is restricted to **approved models (Google Gemini, OpenAI
ChatGPT)**; self-hosted LLMs are not approved.

Confidence: **High**. This rule directly constrains any economic/crypto-derived concept (see
`EXISTING_IP_ASSESSMENT.md`).

---

## 7. Category reachability for our situation (INFERENCE)

| Category | Reachable? | Reasoning |
| --- | --- | --- |
| **Best Daily Game ($15k)** | Yes, but hard | Open to all; requires a top overall score on the four criteria. Field is large (525 entries in the prior edition). |
| **Best Ported Daily Game ($6k)** | **Most reachable** | Requires owning existing IP **and** actually porting it to Devvit. Far smaller qualifying pool because most entrants build new games. This is our structural edge. |
| **Honorable Mentions ($1k ×10)** | Yes, realistic floor | Ten slots; a polished, on-theme entry has a credible shot even without winning. |
| **Devvit Helpers ($500 ×6)** | Partially | Awarded to individuals for community help in Discord / r/devvit. Requires active support participation, not a game. Low effort, independent of the game. |
| **Feedback Award ($200 ×5)** | Yes, easy | One survey per entrant with actionable feedback. Low effort, independent of the game. |

**Strategic reading (INFERENCE).** The port category is the only place where owning prior IP is a
*structural* advantage rather than a tiebreak. A credible plan should target **Best Ported Daily
Game as the primary objective, Honorable Mention as the floor, and claim the two low-effort bonus
prizes regardless.**

---

## 8. Deadline arithmetic and the time budget (VERIFIED + INFERENCE)

- Today (per mission clock): **2026-11-18**.
- Deadline: **2026-12-08 18:00 PT** = **2026-12-09 02:00 UTC**.
- **Time remaining: ~20 days** (≈19.3 days at time of writing).
- Realistic build window after allowing for a demo video, README, subreddit setup, app upload, and
  buffer: **~14–16 usable working days**.

This is the binding constraint. Any concept must be **demonstrable end-to-end within ~2 weeks** by a
small team, with the Devvit upload/review loop (domain allow-lists "reviewed within 1–2 business
days"; app uploads and inline-webview approval can take longer) accounted for.

---

## 9. Open questions that remain unresolved (must be closed before a GO)

1. **Current 2026 field.** The **project gallery is not published** — the page currently reads *"The
   hackathon managers haven't published this gallery yet"* (archived as
   `evidence/phase1_current_gallery_unpublished.html`). We therefore **cannot** yet confirm what we
   would be competing against in this edition. (Prior edition: 525 submissions.)
2. **Port qualification.** Whether a NEAR-native prototype **re-implemented on Devvit** (no
   blockchain, which the Devvit Rules prohibit) counts as a "port" for the ported subcategory, and
   whether the change is "significant" enough under §4 *New & Existing*. Needs a written
   clarification request to the organiser (Rules §11 encourages this before the deadline).
3. **Nigerian prize payment path.** Confirm Payoneer/Wise USD payout to a Nigerian winner.
4. **Reddit discussion detail.** The organiser's "few answers" post and the unofficial FAQ could not
   be read directly (IP block); their content is only available as indexed snippets and may be
   incomplete.

---

## 10. Confidence summary

| Finding | Confidence |
| --- | --- |
| Dates, prizes, criteria, requirements (verbatim primary sources) | **High** |
| Nigeria eligible; payment mechanics | **High / Medium** (eligibility high, frictionless payout medium) |
| Devvit Rules prohibit financial/crypto apps | **High** |
| Current 2026 competitor field | **Unverified** (gallery unpublished) |
| Port-qualification nuance | **Unverified** (needs organiser clarification) |
| Reddit-discussion content | **Low–Medium** (indexed snippets only) |
