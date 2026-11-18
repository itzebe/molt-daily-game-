# MOLT — REAL-PLAYER PLAYTEST PROTOCOL (M2)

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Status:** instrument prepared; **NOT
executed** — requires real human participants, which the agent cannot recruit or observe.

This document is the tool that settles MOLT's one high-severity open assumption:

> **Is the crowd-read mechanic genuinely enjoyable — for experienced gamers AND for people who rarely
> or never play games?**

The automated balance simulation (`tests/balance.test.ts`) proves the loop is not *degenerate*. Only
this protocol can show whether it is *fun*.

---

## 1. Why two participant groups

Mission 03's judging-alignment argument depends on MOLT being readable by a non-gamer in one tap while
retaining depth for a strategist. That is a two-population claim. If it fails for either group, the
"immediately demonstrable / broad appeal" pillar weakens and the score must be revisited.

| Group | Definition | n (minimum) |
| --- | --- | --- |
| **G — gamers** | Plays games ≥ 3×/week; comfortable with tactics games | 4 |
| **N — non-gamers** | Plays games ≤ a few times a year, or never | 4 |

Total minimum 8 participants. Recruit individuals who did **not** work on MOLT.

---

## 2. What to give each participant

- The running prototype at `http://localhost:5173` (mobile-sized window, ≈390 px).
- No explanation of the rules beyond: *"This is a daily game. You have one strike a day. Try it."*
- A timer, and the observation sheet in §4.

Do **not** explain the crowd factor, the tool matrix, or the molt rules up front. The first task
measures whether the interface teaches the game by itself.

---

## 3. Scripted tasks

### Task 1 — First 30 seconds (comprehension, unaided)

> *"Play your first strike. Say out loud what you are doing and why."*

Record: time to first strike; whether the participant can name the beast's zones; whether they
understand a tool is needed.

### Task 2 — The read (mechanic comprehension)

After their first strike, show them the result card and ask:

> *"Why did you get that number? What would you do differently tomorrow?"*

Record: do they understand the crowd factor ("fewer people chose this → more damage")? Can they form a
plan for day 2?

### Task 3 — The molt (delayed-consequence comprehension)

Advance the day (the prototype has a test control). Show the molt note and the re-formed beast. Ask:

> *"What changed, and why?"*

Record: do they connect yesterday's crowd behaviour to today's zone states?

### Task 4 — Deliberate play (day 2–3)

> *"Play the next two days. Play to win."*

Record: do they change strategy? Do they read the beast before choosing? Do they express a theory?

### Task 5 — Desirability (open)

> *"Would you come back tomorrow to play again? Why or why not? What was the best and worst part?"*

Record: verbatim answer; any unprompted mention of returning, sharing, or discussing with others.

---

## 4. Observation sheet (one per participant)

| Field | Value |
| --- | --- |
| Participant id / group (G or N) | |
| T1: seconds to first strike | |
| T1: could name ≥3 zones unaided? (Y/N) | |
| T1: understood a tool was required? (Y/N) | |
| T2: explained the crowd factor unaided? (Y/N) | |
| T2: formed a day-2 plan? (Y/N) | |
| T3: connected crowd → molt correctly? (Y/N) | |
| T4: changed strategy across days? (Y/N) | |
| T4: read the beast before choosing? (Y/N) | |
| T5: would return tomorrow? (Y/N) | |
| T5: verbatim quote | |
| Friction points (where they hesitated) | |
| Bugs / broken states observed | |

---

## 5. Pass / fail thresholds

MOLT passes M2 only if **all** of the following hold:

| # | Criterion | Threshold |
| --- | --- | --- |
| P1 | Non-gamers complete a first strike unaided | ≥ 3 of 4 group-N participants |
| P2 | Non-gamers can name ≥ 3 zones after 30 s | ≥ 3 of 4 |
| P3 | Any participant explains the crowd factor unaided | ≥ 5 of 8 |
| P4 | Any participant forms a day-2 plan | ≥ 5 of 8 |
| P5 | Any participant connects crowd → molt | ≥ 4 of 8 |
| P6 | "Would return tomorrow" | ≥ 5 of 8 |
| P7 | Median time to first strike | ≤ 60 s for group N |

**Interpretation:**

- **All pass** → M2 cleared; MOLT's "fun" assumption is supported by real observation; proceed.
- **P1/P2/P7 fail for group N** → the game is not non-gamer-legible; the score's "immediately
  demonstrable" pillar is overstated and the concept must be simplified or re-scored.
- **P3/P5 fail** → the core mechanic is not legible; the "read the crowd" premise is not landing and
  the concept needs a mechanic-level rethink, not a UI fix.
- **P6 fails** → the loop is not desirable even if comprehensible; retention case is unsupported.

---

## 6. Honesty requirements for whoever runs this

- Record real observations only. Do not smooth, round up, or extrapolate.
- Report the participant count actually run, and the group split.
- Report failures verbatim. A failed criterion is a finding, not an embarrassment.
- Do not present a simulated run as a real one.
- This protocol authorises **no** code change; if it reveals a defect, that becomes a new, separately
  authorised task.
