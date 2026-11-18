# Individual vs Shared Outcome Analysis

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · Categories: `[PROOF]` · `[ENGINE]` · `[SIM]`
**Evidence:** `evidence/ceiling-dynamic-output.txt`, `dynamic-equilibrium-output.txt`,
`strategy-table-output.txt`, `noisy-crowd-output.txt`

The brief: *"Do not equate shared victory with individual strategic success. Report both
separately."* This document does exactly that. It is also the conceptual key that explains why
Mission 07's static analysis and Mission 08's dynamic analysis appear to disagree.

---

## 1. The two axes are different questions

| Axis | Question | What decides it |
|---|---|---|
| **Shared** | Does the community clear `Integrity = k·N`? | the **sum** of everyone's damage (a concave function of the crowd's distribution) |
| **Individual** | Does a given player out-score others? | that player's damage **relative to the crowd** |

They can, and do, point in **opposite** directions.

---

## 2. The individual axis: crowd-reading wins [PROOF]

`ceiling-dynamic.ts` §2 — one player inside a fixed crowd (N=500, 150 days):

| crowd | perfect individual reader | crowd average | premium |
|---|--:|--:|--:|
| herd (all on obvious) | **85.12** | 24.00 | +255% |
| random | 42.00 | 25.03 | +68% |
| even spread | 42.00 | 26.91 | +56% |
| beast-read spread | 51.83 | 32.25 | +61% |

The individual's winning move is to **read the crowd and strike where it is not**. Mission 07's
static finding (reader 57.0 vs spreader 37.9) reproduces dynamically (reader ~51.8 vs 32.25).

---

## 3. The shared axis: crowd-reading self-defeats [SIM]

`dynamic-equilibrium.ts` and `strategy-table.ts`: when the **whole population** best-responds to
yesterday's shares:

| population | steady/player |
|---|--:|
| herd | 24.00 |
| random | 24.9–28.6 |
| even spread | 26.9–28.5 |
| **beast-read spread (`top5`)** | **29.7–32.4** |
| **crowd-reader (whole population)** | **27.2–29.0** |
| DP-optimal (central planner) | 33.2–34.9 |

A **population of crowd-readers under-performs a population of beast-readers**, because if everyone
reads the crowd they **all pile onto the same combo**, which becomes the **herd band (0.7×)**.
`diagnostic.ts`: the self-interested equilibrium keeps only ~6% of the crowd in the read band; the
band cannot hold everyone.

---

## 4. Why this is a feature, not a bug

MOLT's identity is **one action, two rewards**:

- **The individual leaderboard** rewards the **crowd-reader** (the player who anticipates where the
  crowd will not be). This is Mission 07's "genuinely rewarding to experienced gamers" — **confirmed**.
- **The shared goal** rewards the **beast-reader** who spreads across the beast's weak points. This
  is "a community that wins together" — the collective skill.

A player can pursue either, or both. The tension between them (free-riding helps you individually
but can sink the group) is **the game's central drama** (`ADVERSARIAL_STRATEGY_RESULTS.md` §5).

---

## 5. What this means for the k decision

The k decision is a **shared-axis** decision only:

- k does **not** change the individual axis (damage per strike is unchanged).
- k **does** decide whether the shared goal is a real skill goal or a trivial one.
- **k=27** leaves the shared goal trivially clearable (even spread 50–100%) → the shared axis is
  not a skill test. **k=30** makes the shared axis reward the beast-reading skill → the two axes
  become genuinely distinct skills.

**Therefore k=30 strengthens MOLT's identity** (two distinct skills), while k=27 collapses the
shared axis into a non-skill.

---

## 6. The subtlety: which "skill" should the shared goal reward?

There are two candidate "skilled" populations on the shared axis:

| Candidate | steady/player | clears k=30? |
|---|--:|:--:|
| beast-reading spread (`top5`) | 29.7–32.4 | **yes (99%)** |
| crowd-reader population | 27.2–29.0 | no (50%) |

The shared goal at k=30 rewards the **beast-reader** (spread the damage), **not** the
crowd-reader. That is the correct choice for a *shared* goal: the community should **spread damage
over the beast**, and the individual should **read the crowd** for personal glory. The two
incentives are aligned in the right way (personal crowd-reading does not hurt the group; group
beast-reading helps everyone).

**Caveat:** a crowd of *noisy* beast-readers (a realistic crowd) reaches only ~28–30
(`noisy-crowd.ts`), so k=30 is at the realistic ceiling. This is why **k=29** is the documented
gentler alternative.

---

## 7. Verdict

| Claim | Status |
|---|---|
| Individual crowd-reading is rewarded | **CONFIRMED** [PROOF] |
| The shared goal rewards *beast-reading*, not crowd-reading | **CONFIRMED** [SIM] |
| The two axes are distinct skills | **CONFIRMED** |
| k=27 makes the shared axis non-skill | **CONFIRMED** [SIM] |
| k=30 makes the shared axis a real skill | **CONFIRMED** [SIM], at the realistic ceiling |
