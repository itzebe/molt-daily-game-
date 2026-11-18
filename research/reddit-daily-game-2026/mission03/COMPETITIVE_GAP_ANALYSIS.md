# COMPETITIVE GAP ANALYSIS — Mission 03

**Compiled:** 2026-11-18 · **Purpose:** establish, from verified evidence, exactly which mechanics are
saturated, which are weakly represented, and where a genuinely differentiated entry can win.

---

## 1. The field, by the numbers (VERIFIED)

Source: `guilyx/awesome-daily-minigames` `data/games.yml` (303 entries, cloned 2026-11-18).

| Bucket | Count | Share |
| --- | --- | --- |
| Single-player word games (guessing + connections + grids + crosswords) | 92 | **30%** |
| Single-player logic/deduction | 38 | 13% |
| Single-player visual/estimation | 22 | 7% |
| Single-player trivia/knowledge (incl. geo, history, movies, music, sports, science) | 105 | 35% |
| Arcade/skill (mostly single-player daily runs) | 10 | 3% |
| Board/card (single-player puzzles) | 10 | 3% |
| Multi-game hubs | 19 | 6% |
| **Shared / interdependent / asynchronous multiplayer** | **1** | **0.3%** |

**Read:** more than 95% of the catalogue is a *solitary* daily puzzle. The multiplayer share is
statistically negligible. The field has a **structural monoculture.**

---

## 2. Previous winners and why they won (VERIFIED — prior Reddit hackathons)

| Game | Award | Core mechanic | Why it won | What it does NOT do |
| --- | --- | --- | --- | --- |
| **BridgeDit!** | Best Daily Game (Jan 2026) | 3D physics bridge-builder with **UGC levels**; cost/time contests | Infinite content via UGC; visible 3D craft; community-shared levels | No shared *state* — each level is played in isolation |
| **Sneakle** | Best Use of GameMaker | "Boggle meets Battleship" — find a hidden word in a grid | Novel fusion of two familiar loops; elegant | Single-player |
| **krawlings** | Best Use of User Contributions | Virtual pet; feed/care; streaks unlock cosmetics; "wave" GIF comments | Emotional attachment + native social micro-interactions | The pet is *yours*, not the community's |
| **SerpenTiles** | Best Mobile Game Play | Daily hextile-laying puzzle (Tantrix-inspired) | Deep solo puzzle; seeded daily; shareable solution | Single-player |
| **Hexaword** | Best App – Daily Challenge (Sep 2025) | Arrange 6 tiles into words matching a target shape | Fresh twist on the word genre | Single-player |
| **Chook** | Overall winner (earlier 2025) | 3D low-poly **multiplayer** "feed a chicken together" | Genuinely *together* play; 3D craft; Reddit Payments | Real-time-ish; not a *daily* loop |
| **Soul Thieves** | Winner (per Phaser) | Competitive tower platformer | Won $15,000; strong core action | Not a daily game |

**Pattern (High confidence):** winners win on **craft + a fresh fusion + community content**. The one
*shared-play* winner (Chook) is the outlier and was *not* a daily game. **No previous winner is a
daily game whose shared state persists and evolves from the community's own behaviour.**

---

## 3. Saturated mechanics — do NOT build these (penalty risk)

Verbatim from the official page, the organisers see too many of: **space shooters, clones of popular
games, simple platformers, collaborative storytelling apps, trivia apps**. The catalogue adds the
over-supplied puzzle genres: **word guessing, connections, crosswords, letter grids, sudoku/logic
grids, colour/estimation, trivia, "guess the X from clues"**.

**A new entry in any of these is fighting for a slice of a 90%+ occupied pie, against hundreds of
incumbents, under an explicit "Common Ideas" penalty.**

---

## 4. Weakly represented categories (the openings)

| Opening | Evidence | Why it is open |
| --- | --- | --- |
| **Shared, persistent world state** | 1/303 catalogue entries are multiplayer; no daily game does it | Requires server-authoritative state, which the puzzle monoculture avoids |
| **Community-as-adversary / emergent difficulty** | L4D "Director" adapts to *one* match; no daily game adapts to a *crowd across days* | Needs aggregate telemetry + a deterministic response model |
| **Delayed, compounding consequence** | Delayed-consequence design is praised (`nichegamer.com`) but absent from daily games | Daily games reset; nobody carries a penalty forward |
| **Asymmetric roles over days** | Werewolf-over-days exists (`werewolv.es`) but not as a *daily game on Reddit* | Slow, written deduction is a proven format not yet ported to the daily genre |
| **Minority/crowd-reading as a daily ritual** | *Majority* proves the appeal **[indexed snippet]** | Present as trivia-flavoured, not as a *game with state and consequence* |

---

## 5. The convergence: the gap we will attack

The catalogue shows the field is **solitary**. The judges explicitly want **community, meritocracy,
discussion, and fresh recurring content**. The psychology literature shows **delayed consequence +
streaks** drive retention. Reddit's own platform gives us **shared Redis state, a scheduler, comments,
flair, and streaks**.

**The unoccupied cell is: a daily game where every player's choice is an act of *prediction against a
living, shared adversary*, and the adversary's body is literally the community's collective record —
so that what the whole crowd does today is visibly carved into what everyone faces tomorrow.**

Nothing in the 303-game catalogue does this. It cannot be a "clone" because it is not a genre that
exists yet in the daily space. It scores on all four criteria at once (delightful UX via a living
creature; polish via a bounded deterministic engine; Reddit-y because the community *is* the game;
daily content because the creature changes every day from real behaviour).

---

## 6. Features competitors could copy — and what is hard to copy

| Feature | Copyable in a weekend? | Note |
| --- | --- | --- |
| A daily monster you attack | **Yes** | Trivial |
| A shared health bar | **Yes** | Trivial |
| **An adversary whose body encodes the crowd's aggregate behaviour** | **No** | Needs a telemetry→shape model + server-authoritative aggregation + a legible visual language |
| **Weaknesses that emerge from *which* strategy the crowd over-uses** | **No** | Needs strategy classification and a deterministic adaptation rule |
| **A permanent, legible visual record of each day's crowd** | **No** | Needs both the data model and the art direction |
| The "precommit → reveal" tension | **Partly** | The core psychological beat; hard to fake convincingly |

**This is the defensibility test:** the concept must be *easy to describe, hard to reproduce*. A
crowd-shaped adversary with emergent weaknesses passes that test; a shared health bar does not.

---

## 7. Threats and how we answer them

| Threat | Likelihood | Answer |
| --- | --- | --- |
| A polished single-player puzzle wins on pure craft | High | We match craft (Visual Craft criterion) *and* add the community axis they lack |
| A UGC engine wins on content volume | Medium | We use *behaviour* as content — it renews itself with zero authoring |
| Our mechanic is "novelty without fun" | Medium | Adversarial review + a mandatory first-30-seconds fun test (see ADVERSARIAL_REVIEW.md) |
| Judges read it as "about Reddit" | Low | The creature is a fictional beast, not Snoo/karma — we deliberately avoid on-the-nose theming |
| Cold start (empty crowd = empty creature) | Medium | The beast is seeded from a scripted prior day and scales to any crowd size |

---

## 8. Conclusion

The competitive gap is **not** a new puzzle. It is the **near-empty multiplayer/emergent-state cell**,
and specifically the sub-cell **"the crowd's behaviour becomes the adversary and the record."** The
concept shortlist (next document) targets exactly this.
