# GAMER vs NON-GAMER ANALYSIS — Mission 05

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

## Status: NOT RUN — no comparative data exists

The Mission 05 objective is to determine whether **both** audiences enjoy MOLT, and to report the two
groups **separately** so a strong result in one does not conceal a weak result in the other. That
requires real participants in both groups.

**Zero participants were recruited or tested in either group.** There is therefore **no gamer result
and no non-gamer result to compare.** See `PARTICIPANT_RECRUITMENT_REPORT.md` and `PLAYTEST_RESULTS.md`.

| Group | n tested | Enjoyment (avg /5) | Replay intention | Comprehension |
| --- | --- | --- | --- | --- |
| **N — non-gamers** | 0 | — | — | — |
| **G — gamers** | 0 | — | — | — |

## Why the two-group split matters (design rationale, not a result)

The split exists because MOLT makes a **two-population claim** (from Mission 03's judging-alignment
argument): that a non-gamer can play it in one tap with no tutorial, *while* a strategist finds real
depth. If either population fails, the claim is overstated. This is the analysis the playtest is
designed to produce — but **it has not been produced**, and nothing here should be read as if it had.

## What the analysis *will* compute once data exists

`playtest-kit/score-playtest.mjs` already separates the groups and reports, per group:

- average enjoyment (five-point scale), threshold ≥4/5;
- voluntary replay intention, threshold ≥70%;
- first-strike completion and time-to-first-strike;
- secondary signals: perceived agency, fairness of scoring, curiosity about the next molt, enjoyment of
  the social-prediction mechanic.

It reports **raw counts beside every percentage** and makes **no statistical-significance claim**
(n = 4/group).

## The honest interim conclusion

The central question of Mission 05 — *"do real gamers and non-gamers genuinely enjoy MOLT?"* — **remains
unanswered.** MOLT stays at **CONDITIONAL GO**. A functioning prototype, a passing test suite, and a
beautiful interface are, exactly as the mission states, **not enough**.
