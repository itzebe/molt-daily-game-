# Human Playtest Plan

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Status: NOT RUN. No humans have participated. Zero participants recorded.**
**Date:** 2026-11-18

> **This plan is a tool, not a result.** The agent cannot recruit or observe humans. Mission 05
> recorded **0 participants**; Mission 07 adds **no** human data. Every "enjoyment" statement in
> this mission is `[HYPOTHESIS]`. **Do not mark human validation complete until real people play.**

This plan supersedes `mission05/playtest-kit/RUNBOOK.md` by adding the Mission 07 questions
(crowd-reading behaviour, the shared-goal question, the effect of the `k` choice).

---

## 0. Prerequisites

1. **A rule decision must be settled.** Do not test until C1/C2 and M7-1/M7-2 are approved, so
   the tested build matches the intended rules. If M7-2 chooses a `k`, set `integrityFor` to
   `k·N` for the test build and record the value.
2. **Verify the frozen build** against `mission05/PLAYTEST_BUILD_MANIFEST.md`. If any engine hash
   differs, stop and re-baseline.
3. **Recruit 8 real people** (per the brief: ≥4 gamers, ≥4 non-gamers). They must not have worked
   on MOLT. Obtain **informed consent**; collect **no** personal data beyond a first name or code.

---

## 1. Sample and groups

| Group | n | Definition |
|---|--:|---|
| **N** (non-gamer) | 4 | Plays games rarely or never |
| **G** (gamer) | 4 | Plays games regularly |

Both groups play the **same rules and the same build**. No separate tutorial.

---

## 2. Session procedure (per participant, ~15 min)

1. **Consent + 30-second cold start.** Say only: *"There's a creature. You get one strike a day.
   Figure it out."* Start the timer. **Do not explain the rules.**
2. **Record time-to-first-strike** (the primary comprehension metric).
3. **Play 3 simulated days** (advance the day with the dev endpoint). Observe aloud-thinking.
4. **Ask the comprehension questions** (§4).
5. **Play one more day**, then ask the prediction/return questions (§4).
6. Debrief. Thank them. **Do not coach.**

---

## 3. What to measure (observation sheet fields)

| Field | Type | How |
|---|---|---|
| Time to first meaningful action (s) | number | stopwatch, cold start |
| Understood the goal unaided? | Y/N | did they state "kill the beast with the group"? |
| Understood the crowd factor? | Y/N | did they notice hitting the herd reduces damage? |
| **Attempted to predict the crowd?** | Y/N | did they deliberately avoid the obvious zone? |
| Reason for their strike (verbatim) | text | ask "why this zone/tool?" |
| Understood the molt (why it changed)? | Y/N | ask after day 1→2 |
| Decisions felt consequential? | 1–5 | "did your strike matter?" |
| Wanted to return tomorrow? | 1–5 | "would you play again tomorrow?" |
| Enjoyment | 1–5 | overall |
| Confusion points | text | verbatim |

A ready sheet is provided as `playtest/PLAYTEST_OBSERVATION_SHEET.csv` (Mission 07), extending
the Mission 05 sheet with the crowd-reading and return-intent columns.

---

## 4. Question set

**Comprehension (after 3 days):**
1. "What is the creature, in your words?"
2. "What happens when a zone gets hit a lot?"
3. "What happens to a zone nobody hits?"
4. "Does hitting the same zone as everyone else help or hurt your damage? How do you know?"

**Strategy (the core Mission 07 question):**
5. "Did you ever deliberately pick a zone you thought *others would avoid*? Why?"
6. "Could you tell what the rest of the crowd was doing?"

**Consequence & return:**
7. "Did your strike feel like it mattered to whether the beast died?"
8. "What would make you come back tomorrow?"

**Shared goal (only if M7-2/M7-4 are in the build):**
9. "Could you tell whether the group was going to win today?"

---

## 5. Scoring rubric (per participant)

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Comprehension | needed help | partial | unaided, correct |
| Crowd-reading attempt | never | once | repeated/strategic |
| Molt understanding | no | vague | correct |
| Consequentiality | 1–2 | 3 | 4–5 |
| Return intent | 1–2 | 3 | 4–5 |
| Enjoyment | 1–2 | 3 | 4–5 |

**Group success thresholds (pre-registered — set BEFORE testing):**
- **Comprehension:** ≥6/8 reach time-to-first-strike ≤30 s.
- **Crowd-reading:** ≥4/8 attempt to predict the crowd by day 3.
- **Molt:** ≥6/8 can explain the day-1→2 change.
- **Return:** mean return-intent ≥3.5/5 in **both** groups.
- **Non-gamer floor:** no non-gamer scores 0 on comprehension.

If the crowd-reading threshold fails, MOLT's central premise (reading the crowd is natural) is
in doubt and the design should be revisited.

---

## 6. Honesty rules for whoever runs this

- Record **what happened**, not what you hoped. Negative results are the point.
- Do **not** coach, hint, or explain the crowd factor mid-session.
- Do **not** fabricate participants, quotes, or numbers. If fewer than 8 show up, report the
  actual number and treat the result as preliminary.
- Store results in `playtest/RESULTS.md` and mark clearly as **real human data**.

---

## 7. What is needed to close Mission 05/07's open question

- 8 sessions run to this protocol, with raw sheets retained.
- Scored against the rubric with the pre-registered thresholds.
- A one-page honest summary: did players understand it, did they read the crowd, did they want
  to return — and where it failed.

**Until then, MOLT's verdict remains CONDITIONAL GO.**
