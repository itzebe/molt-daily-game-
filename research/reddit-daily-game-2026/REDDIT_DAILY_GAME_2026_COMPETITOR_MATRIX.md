# Reddit's Game of the Day Hackathon 2026 — Competitor Matrix

**Compiled:** 2026-11-18. **Method:** Devpost project-gallery JSON-LD extraction (archived),
individual `devpost.com/software/{slug}` pages, `developers.reddit.com` blog, You.com (YDC) index.

> **Field status.** The **2026 "Game of the Day" project gallery is NOT published** — the page reads
> *"The hackathon managers haven't published this gallery yet"*
> (`evidence/phase1_current_gallery_unpublished.html`). So this matrix characterises the **most
> relevant available proxy: the field of Reddit's previous daily-games hackathon** (Jan–Feb 2026,
> "The Reddit Daily Games Hackathon", Reddit × GameMaker, **525 submissions, 2,975 participants**),
> plus the Fun-and-Games-with-Devvit-Web hackathon (Aug–Sep 2025). Those games are exactly the
> games we would be measured against, because the same community and the same reviewers recur.

---

## A. Previous daily-games hackathon — awarded games (VERIFIED)

Source: Devpost submission gallery JSON-LD, `redditdailygames2026.devpost.com`. 14 awards extracted.

| Award | Game | Devpost | One-line mechanic (verified) |
| --- | --- | --- | --- |
| **Best Daily Game** | **BridgeDit! Cosy Bridge-Building** | `/software/bridgedit-cosy-bridge-building` | 3D physics bridge-builder; **user-generated levels**, compete on lowest cost / shortest time; earthquakes. Built with Devvit Web + Three.js. |
| **Best Use of GameMaker** | **Sneakle** | `/software/sneakle` | "Boggle meets Battleship" — find one hidden word in a letter grid; daily + unlimited; leaderboards. |
| **Best Use of User Contributions** | **krawlings** | `/software/krawlings` | Virtual pet ("feed in your feed"); daily care + streaks unlock cosmetics; platformer level editor; social "wave" micro-interactions that post a GIF comment. Three.js + React. |
| **Best Mobile Game Play** | **SerpenTiles** | `/software/serpentiles` | Daily hextile-laying puzzle (Tantrix-inspired); seeded daily set, shareable solution link, multiple modes. |
| Honorable Mention | Fully Packed | `/software/fully-packed` | Daily packing puzzle. |
| Honorable Mention | Iso Chess | `/software/iso-chess` | Isometric chess vs AI + historic puzzles. |
| Honorable Mention | Just Golf It | `/software/just-golf-it` | Daily mini-golf. |
| Honorable Mention | Just Meme It | `/software/just-meme-it` | Daily meme battle — submit, vote, leaderboard. |
| Honorable Mention | ModDesk 98 | `/software/moderator-please` | Retro-desktop moderation game ("Papers Please meets Reddit moderation"). |
| Honorable Mention | Monster Dating | `/software/monster-dating` | Dating-app parody with an in-game "monster money" economy. |
| Honorable Mention | Quipit | `/software/quipit` | Daily phrase puzzle; drag connected letter tiles onto a grid. |
| Honorable Mention | Spectrum 6 | `/software/spectrum-6` | Colour-fusion puzzle. |
| Honorable Mention | Totalled | `/software/totalled` | Drag numbers to hit targets. |
| Honorable Mention | XO Math Puzzles | `/software/xo-math-puzzles` | 5 daily math challenges + **user-created puzzles**, leaderboards, 09:00 UTC drop. |

**Field composition (VERIFIED, from the 525-entry gallery page 1 and search snippets):** the
overwhelming majority are **single-player daily puzzles** (words, numbers, colour, packing, golf) plus
a few **virtual-pet / arcade / idle** games and a handful of **social/voting** experiments (Comment
Duel, The Forgotten Hero community-votes-on-fate, Mafia Detective hourly AI mystery, R/OGUE noir
detective, SWORD 'N' SHIELDS idle RPG). **Community-generated content appears in the winners**
(BridgeDit levels, krawlings pets, XO user puzzles) but is rare overall.

---

## B. Fun and Games with Devvit Web (Aug–Sep 2025) — awarded games (VERIFIED)

Source: `redditfunandgames.devpost.com/project-gallery` JSON-LD. Selected awards:

| Award | Game | Note |
| --- | --- | --- |
| Best App – Daily Challenge | **Hexaword** | Daily word game: arrange 6 tiles to form words and match a target shape (hex grids). |
| Best App – UGC Challenge | **Oneline** | User-generated-content challenge winner. |
| Honorable Mentions | Split Sketch, Space Tournament, MiceMazeRace, Wreflecto (daily word square), Blokkit, Snoo's Crown, Word Soro, Exquisite Deck, Out Floop, Tankdit!, Wordpaths, **BlockJam – A Community-Powered Puzzle**, Reddiverse, Training Data Microgames | — |

`Chook` (a 3D low-poly multiplayer "feed a chicken together" game) won **first prize** in an earlier
2025 hackathon and was profiled by Reddit as a case study (React + Phaser + Payments API). The
Phaser team notes `Soul Thieves` (competitive tower platformer) won a Reddit hackathon and **$15,000**
(You.com-indexed `phaser.io`, 2026-05).

---

## C. Named projects from the mission brief — independent verification

| Project | Claim in brief | Verified status |
| --- | --- | --- |
| **BridgeDit** | a previous winner | **VERIFIED** — Winner, *Best Daily Game*, Reddit Daily Games Hackathon (Jan 2026). 3D Three.js bridge builder with UGC levels. |
| **Hexaword** | a previous winner | **VERIFIED** — Winner, *Best App – Daily Challenge*, Fun and Games with Devvit Web (Sep 2025). Also listed in the r/GamesOnReddit daily-game directory. |
| **Sneakle** | a previous winner | **VERIFIED** — Winner, *Best Use of GameMaker*, Reddit Daily Games Hackathon (Jan 2026). r/Sneakle. |
| **krawlings** | a previous winner | **VERIFIED** — Winner, *Best Use of User Contributions*, Reddit Daily Games Hackathon (Jan 2026). |
| **SerpenTiles** | a previous winner | **VERIFIED** — Winner, *Best Mobile Game Play*, Reddit Daily Games Hackathon (Jan 2026). Also released on itch.io. |

All five are genuine prior winners; the brief's list is accurate.

---

## D. Competitor matrix — the most dangerous *types* (not invented individuals)

We cannot name 2026 entrants (gallery unpublished). What we *can* do — and what is decision-useful —
is profile the **archetypes that have repeatedly won**, because those are the patterns our entry
must beat.

| Archetype | Canonical example | Core mechanic | Daily loop | Reddit integration | Presentation | Differentiation | Weakness / gap | Threat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Polished 3D physics sandbox + UGC** | BridgeDit | Build a bridge under cost/time constraints | New level(s) regularly; UGC keeps content infinite | Level builder shares into the community; compare solutions | High — modern 3D | UGC + physics depth | Heavy build; physics tuning risky; not a *shared* world | **Very high** |
| **Daily word/puzzle (NYT-style)** | Hexaword, Sneakle, Quipit, Syllo, PocketGrids | Guess/arrange letters or numbers | One seeded puzzle/day + streak + share grid | Score share in comments; subreddit | Medium–high | Novel twist on a familiar loop | **Saturated**; organiser's "common ideas" penalty; low differentiation | High (volume) |
| **Virtual pet / care loop** | krawlings | Feed/play a creature; streaks unlock cosmetics | Daily care + streak | Visit others' pets; "wave" GIF comments | Medium | Emotional attachment + social micro-interactions | Needs art; retention depends on habit not depth | High |
| **User-generated content engine** | Oneline, XO Math Puzzles, BridgeDit | Solve community-made challenges | Fresh UGC every day | Creators post; solvers discuss | Medium | Infinite content; community ownership | Cold-start: needs creators; moderation burden | High |
| **Social/voting narrative** | The Forgotten Hero, Comment Duel, Just Meme It | Community votes steer outcomes | One vote/day, results tomorrow | Native (comments/votes) | Low–medium | Genuinely Reddit-native | Thin gameplay; "collaborative storytelling" is on the NOT-wanted list | Medium |
| **Idle / incremental** | SWORD 'N' SHIELDS, Tick Me +1 | Numbers go up; offline progress | Daily check-in | Leaderboards | Medium | Long-tail retention | Weak "delightful UX"; shallow first 30s | Medium |

---

## E. What the winners have in common (INFERENCE from the verified list)

1. **One obvious verb in the first 30 seconds.** Every winner is understandable without a tutorial
   (build a bridge, find a word, feed a pet, lay a tile).
2. **A seeded daily object everyone shares**, so players compare results — the Wordle share-grid
   effect.
3. **Content that does not run out.** Either UGC (BridgeDit, XO) or a huge puzzle space (words).
4. **Visible craft.** The 3D bridge builder and the pet game both look deliberately made.
5. **At least one genuinely Reddit-native hook** (UGC posted into the community, GIF comments,
   comment-shared scores) — this is the "Reddit-y" criterion.

**The gap the winners do NOT fill (INFERENCE):** almost nothing in either field is a **shared,
persistent, stateful world where one player's daily action measurably changes what every other
player sees tomorrow.** The field is overwhelmingly *parallel* single-player play (everyone solves
the same puzzle alone) rather than *interdependent* play (my action alters your world). The nearest
attempts — community-votes-on-fate and meme battles — are **narrative/voting** rather than
**simulation**. This is the most underexplored, highest-differentiation space, and it is where the
existing IP in `EXISTING_IP_ASSESSMENT.md` is strongest.

---

## F. Honest limits of this matrix

- **No named 2026 competitors.** The gallery is unpublished; any named-competitor list for *this*
  edition would be fabricated, and this mission forbids invention.
- **Award data is from the prior edition**, which is the best available proxy but not the same field.
- **"Registered participants ≠ completed submissions."** Devpost shows 1,660 registrations; the prior
  edition drew 525 submissions from 2,975 registrations (~18% completion). A realistic 2026
  submission count is therefore **a few hundred**, not 1,660.
- Reddit discussion text is from **indexed snippets** only (IP block); treat as indicative.
