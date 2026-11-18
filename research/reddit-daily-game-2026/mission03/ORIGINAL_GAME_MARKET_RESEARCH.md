# ORIGINAL GAME MARKET RESEARCH — Mission 03

**Mission:** invent an original, highly competitive daily game for Reddit's Game of the Day Hackathon 2026.
**Compiled:** 2026-11-18 · **Method:** You.com (YDC) search index + primary sources (Devpost rules/overview,
`reddit/devvit-docs` clone, a full catalogue of daily minigames).
**Evidence:** `evidence/` (see `SHA256SUMS.txt`).

> **Method honesty.** `reddit.com` is IP-blocked from this sandbox (403 on HTML/JSON/RSS) and the Tavily
> MCP search tool is over its plan limit (HTTP 432). All research used the **You.com (YDC) API** plus
> direct primary-source fetches (Devpost, `developers.reddit.com`, GitHub). Reddit *discussion* content
> is marked **[indexed snippet]** — read via the search index, not the live page. Nothing is fabricated.

---

## 1. The single most important market fact

There is a **public, actively-maintained catalogue of the entire daily-puzzle landscape**:
`github.com/guilyx/awesome-daily-minigames` (created 2026-08-10, last push 2026-11-18; 8 stars).
Its data file is the **single source of truth** for the field. I cloned it and quantified it.

**Quantified saturation (verbatim from `data/games.yml`, 2026-11-18):**

| Metric | Value |
| --- | --- |
| Total daily games catalogued | **303** |
| Platform: web | 283 |
| Platform: **Reddit (Devvit)** | **20** |
| Games tagged `multiplayer` | **1** (out of 303) |
| Games tagged `nyt` (NYT-style) | 10 |

**By category (count):** logic 38 · word-guessing 27 · word-grids 26 · visual 22 · word-connections 21 ·
trivia 20 · hubs 19 · crosswords 18 · geography 17 · video-games 15 · movies-tv 13 · music 11 ·
numbers-math 10 · sports 10 · arcade 10 · board-card 10 · history 9 · science-nature 7.

**The 20 Reddit games in the catalogue are all single-player puzzles** (word-guessing, crosswords,
word-grids, logic, visual, arcade). Not one is a shared, interdependent multiplayer experience.

**Conclusion (High confidence):** the daily-games field is **saturated with single-player puzzles** and
**almost entirely empty of genuinely shared, interdependent, asynchronous multiplayer play** (1/303).
That is the one structural gap worth attacking.

---

## 2. What Reddit's judges actually reward and punish (VERIFIED, primary source)

From the official overview page (`redditgameofday2026.devpost.com`, fetched 2026-11-18):

**"Things that will make your Daily Game stand out" (verbatim):**
- **Intuitive Onboarding** — "Get players to meaningful play quickly by minimizing setup screens… Rely on contextual hints rather than overwhelming wall-of-text instructions."
- **Visual Craft** — "Establish a clear visual identity with accessible contrast, legible text, un-cluttered controls, and responsive feedback. Avoid distracting visuals or unstyled generic components."
- **Calibrated Daily Content** — "Deliver fresh, bite-sized daily value with sufficient variety and replayability… legible, fair, and solvable with a well-calibrated difficulty curve."
- **Focused Gameplay** — "Streamline start screens… remove clutter or secondary actions during active play."
- **Clear End States & Re-engagement Loops** — "Conclude each session with a clear result card that offers a meaningful next step… stats, streaks, a place to comment, or a subreddit subscription prompt."
- **Journey Event Instrumentation** — "Add eventing to your game with Devvit Journeys to reliably track users through game loops for proper analytics, leaderboard tracking, and streak verification."

**"What we're NOT looking for" (verbatim):**
- **AI Slop** — "it shouldn't be obvious the moment we open your app."
- **On-the-nose Reddit theming** — "Reddit-y does not mean the game is about Reddit, karma, subreddits, Snoo, etc. Reddit-y means human-first, embracing community, meritocracy, creativity… it's in the spirit of the app and your use of all the things subreddits have to offer (comments/discussion, flair, feeds, community)."
- **Common Ideas** — "we see a lot of: space shooters, clone apps of popular games, simple platformers, collaborative storytelling apps, and trivia apps. If you do make one of these… make sure it's extremely unique."
- **Games not on Reddit** — "You simply cannot place in this hackathon if your game isn't running on Reddit."

**Design implication:** the winning shape is **human-first, community-shaped, visually crafted, instantly
legible, instrumented** — and **not** a puzzle clone, not trivia, not "about Reddit", not a story app.

---

## 3. Player psychology and retention (secondary sources — labelled)

Findings are consistent across the sources below; treat as **medium** confidence (secondary/opinion):

| Finding | Evidence | Source (secondary) |
| --- | --- | --- |
| Streaks exploit **loss aversion** — breaking a streak feels like losing an asset, not skipping a reward | "Streaks tap into loss aversion — once you've built one up, stopping feels like losing something you already have." | `gamerorbis.com/mobile-game-psychology/` |
| **High-stakes, delayed-consequence choices** create durable emotional investment | "The more a game makes individual decisions feel consequential, the more invested players become… and the more likely they are to return." | `nichegamer.com/why-gamers-are-drawn-to-high-risk-high-reward-mechanics/` |
| The most common **churn cliff** in casual puzzle games is mid-early (levels 15–30) — a difficulty/content spike | "the most common churn cliff in casual puzzle games occurs between levels 15 and 30." | `galaxy4games.com/.../why-is-my-casual-game-not-retaining-users-long-term` |
| **Asynchronous** play has a larger potential audience than synchronous | "the potential audience for asynchronous multi-player games is much greater than… synchronous." | Soren Johnson, `gamedeveloper.com/game-platforms/analysis-asynchronicity-in-game-design` |
| **Minority / crowd-reading** games have enduring appeal ("kept Family Feud alive for 40 years") | "the predict-the-crowd idea is good, it is the same thing that kept family feud alive for 40 years." | r/WebGames **[indexed snippet]** on *Majority* |

**Design implication:** build a loop that (a) uses a **streak**, (b) makes each daily decision
**consequential with a delayed payoff**, and (c) has **no early difficulty cliff** because the content
is *generated from the community*, not authored.

---

## 4. The mechanic space: what is under-explored (research directions, not yet concepts)

I searched each of the mission's suggested directions. Findings:

| Direction | State of the art | Exploited by daily games? |
| --- | --- | --- |
| Players influence a **common evolving environment** | EVE Online, persistent-world MMOs; the r/place model | **No daily game does this with a stateful adversary** |
| **Delayed consequences** of decisions | Civilisation, Detroit: Become Human | **No** daily game |
| **Distributed information** among players | Zendo, Eleusis, hidden-rule induction; a Wordle-style Zendo exists (`r/wordgames` **[indexed snippet]**) | Rarely; usually single-player |
| **Asymmetric roles**, async | Werewolf/Mafia over days (`werewolv.es`), Evolve | Not in the daily-puzzle field |
| Compete **without simultaneous sessions** | Polytopia, Solium Infernum, "ghost races" | Not in daily games |
| **Daily challenge evolves** from previous outcomes | Left-4-Dead "Director" (adapts to *one* match) | **No daily game** |
| Community **collectively creates new possibilities** | UGC engines (Oneline, XO Puzzles) | Yes — but that's content, not *state* |
| Individual action **changes what everyone experiences tomorrow** | — | **Effectively unoccupied** |

**Conclusion:** the strongest unoccupied cell is **"the community's collective behaviour becomes the
game's tomorrow."** It combines shared state + delayed consequence + async competition + community
discussion, and it is the exact inverse of the field's parallel single-player puzzles.

---

## 5. Reddit-native patterns that work (from winners and community discussion)

- **UGC posted into the community** (BridgeDit levels; Oneline) drives engagement **[indexed snippet]**.
- **Comment-as-clubhouse**: games where "one tap posts your score to the day's post, turning the
  comment section into the daily bragging thread" (Subreddit Sleuth README) — a strong, low-cost pattern.
- **Flair** for identity/meritocracy; **streaks** for habit.
- **Known friction**: daily games on Devvit struggle with **date-rollover testing** — the harness does
  not advance time ("The testing docs say time does not advance in the harness. How are other daily
  games handling date rollover in testing?" — r/Devvit **[indexed snippet]**). This is a real technical
  risk to plan around.

---

## 6. Confidence summary

| Finding | Confidence | Basis |
| --- | --- | --- |
| Field is 303 games, 18 categories, 1/303 multiplayer, 20 Reddit games | **High** | Primary data file, cloned & counted |
| Judges reward craft/community/legibility; punish clones/trivia/AI-slop | **High** | Verbatim official page |
| Four equally-weighted criteria | **High** | Official rules |
| Streaks/loss-aversion/delayed-consequence retention effects | **Medium** | Secondary sources |
| The "community-becomes-tomorrow" cell is unoccupied | **High** | Exhaustive catalogue scan + directed searches |
| Reddit discussion specifics | **Low–Medium** | Indexed snippets only (IP block) |
