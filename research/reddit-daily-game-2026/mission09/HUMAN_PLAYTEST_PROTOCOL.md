# Human Playtest Protocol

**Mission 09 · MOLT · Date:** 2026-11-18 · **Status:** PREPARED, NOT STARTED
**Participants:** 0 of 8 · **No participant has been contacted. Nothing is deployed.**

This protocol is ready to execute **the moment the design owner authorises a test build**. It is
written so the test can **distinguish k = 29 from k = 30** without misleading participants.

---

## 1. The question the test must answer

> **Can a real mixed crowd of gamers and non-gamers clear MOLT's shared goal on the first days, at
> k = 30 — and does the experience stay exciting, or does the failure cliff make it frustrating?**

The model cannot answer this. It is the **only** open question between CONDITIONAL GO and GO.

### Primary success criteria (decided in advance)

| # | Criterion | Threshold |
|---|---|---|
| P1 | A real crowd clears the **first day** | ≥ 6 of 8 understand the goal and the crowd's total damage ≥ k·N on day 1 |
| P2 | A real crowd clears a **majority of the 3 test days** | ≥ 2 of 3 days at the tested k |
| P3 | Players understand **why the beast molts** | ≥ 6 of 8 can explain it |
| P4 | Players **want to return tomorrow** | mean ≥ 4 of 5 |
| P5 | The k=29 and k=30 conditions are **distinguishable** | the chosen design is defensible from the data |

If **P1–P2 fail at k = 30 but pass at k = 29**, the recommendation becomes **k = 29**. If **both fail**,
the ruleset needs redesign (a recovery valve), and the verdict is HOLD.

---

## 2. Design: a counterbalanced within-subjects test

**Constraint from the mission:** do not expose participants to a confusing mixture of unapproved rules.

**Chosen design — counterbalanced, two conditions, one session each:**

- **Two conditions:** A = **k = 29**, B = **k = 30**. (Both are *candidate* values; neither is
  presented as "the real game" — participants are told they are helping test difficulty tuning.)
- **Assignment:** the 8 participants are split into **two groups of 4** (Group 1: 2 gamers + 2
  non-gamers; Group 2: 2 gamers + 2 non-gamers).
- **Order is counterbalanced:** Group 1 plays A then B; Group 2 plays B then A. This controls for
  **learning effects** (the second play is always easier because the rules are known).
- **Same rules, same prototype, same instructions** in both conditions. **Only the integrity constant
  differs** — participants are told this plainly: *"the beast's health is tuned slightly differently
  in the two rounds; we are testing which feels right."* This is honest and does not confuse them.
- **Each condition = 3 simulated days** (compressed), each day: read state → choose (zone, tool) →
  see the resolution. To simulate a *crowd* with only 4 players, each player's strike is **replicated**
  to a synthetic crowd of N = 200 whose composition is **fixed and disclosed** (see §4).

**Why within-subjects + counterbalancing:** 8 people is too few for a between-subjects test to have
power, but the **order effect** is the main threat — counterbalancing neutralises it.

**Why not a single condition:** one session cannot distinguish 29 from 30. The comparison is the point.

---

## 3. Session structure (≈ 40 minutes)

| Time | Activity |
|---|---|
| 0–5 min | Welcome, consent, privacy notice (§`PARTICIPANT_RECRUITMENT_AND_CONSENT.md`) |
| 5–10 min | Read the one-page rules; moderator does **not** explain strategy |
| 10–20 min | **Round 1** (3 days), think-aloud encouraged, moderator observes only |
| 20–22 min | Short in-session questionnaire (comprehension, enjoyment) |
| 22–25 min | Reset; moderator notes that only the beast's health changed |
| 25–35 min | **Round 2** (3 days) |
| 35–40 min | Post-session questionnaire + debrief |

**What the moderator may NOT do:** explain optimal strategy, hint at crowd-reading, or reveal the
other condition's outcome during play.

---

## 4. The synthetic crowd (disclosed)

With only 4 participants, the "crowd" is simulated. To avoid misleading anyone:

- The crowd is **N = 200**, composed of a **fixed, disclosed mix**: 60 % lazy (random), 25 % even
  spread, 15 % beast-reading (top5). This is stated in the participant instructions.
- Each real player's choice is **added** to the crowd (their strike replaces one crowd member's).
- The beast state, the crowd factor, and the resolution are the **real engine** — nothing is mocked.
- **No leaderboard position is fabricated** — the per-player damage shown is the real computed value.

---

## 5. Measures

Per participant, per condition (see `MODERATOR_SCRIPT_AND_OBSERVATION_SHEET.md`):

| measure | how |
|---|---|
| time to first action | stopwatch, first (zone,tool) submit |
| rule comprehension | 3 multiple-choice + 1 free-text ("why does the beast molt?") |
| understands zones & tools | MCQ |
| decision feels consequential | 5-point Likert |
| attempts to read the crowd | observed behaviour + self-report |
| can explain the outcome | free-text after the molt |
| enjoyment / frustration | 5-point Likert each |
| desire to return | 5-point Likert |

Community-level: day outcome (SLAIN/ESCAPED), participation spread, strategic diversity (number of
distinct combos chosen), and whether blind vs deliberate play differ.

---

## 6. Honesty rules

- **No fabricated results.** This file reports 0 participants until 8 real people have played.
- **No misleading claims.** The synthetic crowd is disclosed; nothing is presented as live traffic.
- **No data leaves the session** without consent.
- **The test does not run** until the design owner authorises a test build (§`DESIGN_OWNER_DECISION_SHEET.md`, Decision D).

---

## 7. Analysis

See `PLAYTEST_ANALYSIS_TEMPLATE.md`. The primary output is the **P1–P5 scorecard** and a
recommendation: **k = 29, k = 30, or redesign**.
