# Human Playtest Requirements

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · **Status: NOT RUN. 0 participants. No humans have played MOLT.**

> This is a **requirements** document — what the playtest must measure to decide between k=29 and
> k=30. It is a tool, not a result. It extends `mission07/HUMAN_PLAYTEST_PLAN.md` with the
> **constant-specific** measurements Mission 08 identified.

---

## 0. Prerequisites

1. A rule decision must be settled (C1/C2 as documentation corrections; a candidate `k` chosen) so
   the tested build matches the intended rules.
2. Verify the frozen build against `mission05/PLAYTEST_BUILD_MANIFEST.md`; if `integrityFor` is
   changed for the test, record the new constant and re-baseline.
3. Recruit **8 real people: 4 gamers, 4 non-gamers** (per the brief). Informed consent; no personal
   data beyond a first name or code.

---

## 1. The mission-specific questions

| ID | Question the playtest must answer | Why it decides the constant |
|---|---|---|
| Q1 | Can a **non-gamer** clear the goal (contribute) at the tested `k`? | k=30 risks demoralisation; k=29 is gentler. |
| Q2 | Does a **failed day** demoralise the group, or do they recover next day? | Tests the **bistability lock-in** (BI-6). |
| Q3 | Do gamers discover that **spreading** (beast-reading) beats piling? | The shared goal at k≥29 rewards this; if they cannot learn it, k is too hard. |
| Q4 | Do players feel their strike **matters to the group**? | The core "shared victory" promise. |
| Q5 | Do players attempt **crowd-reading** (the individual skill)? | Confirms the individual axis is legible (k-independent). |

---

## 2. Procedure (per participant, ~15 min)

1. **Consent + 30-second cold start.** Say only: *"There's a creature. You get one strike a day.
   Figure it out."* Start the timer. **Do not explain the rules.**
2. Record **time-to-first-strike**.
3. Play **5 simulated days** (advance via the dev endpoint). Observe aloud-thinking. **Include at
   least one forced/observed escape day** (to test Q2) — if none occurs naturally, the facilitator
   notes the sub never failed.
4. Ask the comprehension questions (§3).
5. Debrief. Do **not** coach.

**Cross-subreddit note:** run the same protocol with **k=29 and k=30** on separate groups (or
counterbalance), so the constant can be compared. If only one k can be tested, test **k=30** (the
stricter, riskier one) — if casuals clear k=30, k=29 is safe by construction.

---

## 3. Questions

**Comprehension:** "What is the creature?" · "What happens to an over-hit zone?" · "What happens to
a neglected zone?" · "Does hitting where everyone else hits help or hurt your damage?"

**Strategy:** "Did you ever deliberately pick a zone others would avoid?" · "Could you tell what the
crowd was doing?" · "Did you ever try to *spread* the group's damage?"

**Shared goal:** "Did your strike feel like it mattered to whether the beast died?" · "When the
beast escaped, how did that feel?" (Q2) · "Did you think the group could win tomorrow?" (Q2)

**Return:** "What would make you come back tomorrow?"

---

## 4. Observation sheet fields

Extends `mission07/playtest/PLAYTEST_OBSERVATION_SHEET.csv` with:

| Field | Type |
|---|---|
| tested_k | 29 / 30 |
| days_played | number |
| escape_days_observed | number |
| recovered_after_escape | Y/N |
| spread_attempted | Y/N |
| felt_strike_mattered_after_loss | 1–5 |
| group_could_win_tomorrow | 1–5 |

---

## 5. Pre-registered thresholds (set BEFORE testing)

| Metric | Threshold | Decides |
|---|---|---|
| First meaningful strike ≤30 s | ≥6/8 | comprehension |
| Crowd-reading attempted by day 3 | ≥4/8 | individual axis legible |
| Spreading attempted by day 5 | ≥4/8 | shared-goal skill learnable |
| Strike "mattered" | mean ≥3.5/5 in both groups | shared-victory promise |
| **Return intent** | **mean ≥3.5/5 in both groups** | the core verdict |
| Non-gamer comprehension | none scores 0 | accessibility floor |
| **Recovery after an escape** | ≥3/4 non-gamers believe the group can win tomorrow | **BI-6 / lock-in risk** |

**Decision rule:**
- If casuals clear **k=30** and recover after an escape → **choose k=30**.
- If casuals struggle at k=30 but clear **k=29** → **choose k=29**.
- If casuals struggle at **both** → the goal is too hard for the intended audience; reconsider the
  whole linear approach or add the recovery valve.

---

## 6. Honesty rules

- Record **what happened**, not what was hoped. Negative results are the point.
- Do **not** coach or explain the crowd factor mid-session.
- Do **not** fabricate participants, quotes, or numbers. If fewer than 8 attend, report the actual
  number and treat the result as preliminary.
- Store results in `playtest/RESULTS.md`, clearly marked as **real human data**.

---

## 7. What is needed to close this mission's open question

- 8 sessions (or 2×8 for both constants) to this protocol, raw sheets retained.
- Scored against the rubric with the pre-registered thresholds.
- A one-page honest summary: did casuals clear it, did they recover, did they want to return — and
  at which constant.

**Until then, the integrity recommendation remains CONDITIONAL and no change is authorised.**
