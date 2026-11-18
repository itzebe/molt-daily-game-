# Adversarial Strategy Results

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · Categories: `[PROOF]` · `[ENGINE]` · `[SIM]`
**Evidence:** `evidence/trivial-battery-output.txt`, `mixed-defection-output.txt`, `mixed-under-k-output.txt`,
`ceiling-dynamic-output.txt`, `separation-output.txt`

The ten strategy families required by the brief, plus a battery of semi-trivial attacks.
**Shared victory and individual success are reported separately** (they are different questions).

---

## 1. Shared-goal results (does the community clear `k·N`?) [SIM]

Steady per-player and SLAIN rate, state evolving under each k, 9 seeds. (`—` = not applicable.)

| # | Strategy | Class | steady (realistic N) | k=27 SLAIN | k=30 SLAIN |
|--:|---|---|--:|--:|--:|
| 1 | uniform random | beast-ignoring | 24.9–28.6 | 7–67% | 0–1% |
| 2 | even spread (cycle all 15) | beast-ignoring | 26.9–28.5 | **50–100%** | **0%** |
| 3 | concentrated (all on one combo) | beast-ignoring | 21.0–24.0 | 0% | 0% |
| 4 | deliberate crowd prediction | crowd-reading | 27.2–29.0 | 66% | 50% |
| 5 | adaptive (react to yesterday) | crowd-reading | 27.2–29.0 | 66% | 50% |
| 6 | coordinated majority | = concentrated | 21–24 | 0% | 0% |
| 7 | coordinated minority (neglected zone) | crowd-reading | 27.2–29.0 | 66% | 50% |
| 8 | low-effort (herd the obvious) | beast-ignoring | 24.0 | 0% | 0% |
| 9 | strategic deviation by one player | see §3 | (individual) | — | — |
| 10 | self-interested equilibrium | crowd-reading | ~27.2–29.0 | 66% | 50% |

**Beast-reading spread** (`top5`, the intended skill) is the **only** family that clears k=30
reliably (99%).

---

## 2. The brief's specific concerns, answered [SIM]

| Concern | Finding |
|---|---|
| Does either k make **lazy participation sufficient**? | **k=27: YES** (even spread 50–100%, random 67% at N=1000). **k=30: NO** (0%). |
| Does either make victory **impossible for small communities**? | Neither — under linear, small subs win iff skilled (both k=27 and k=30 are winnable at N=50 by the beast-read spread). |
| Does either **reward coordination excessively**? | k=30 rewards **state-reading** coordination (99%), not brute concentration (concentrated = 21–24, loses). Good: it rewards the intended skill. |
| Does either make **individual crowd-reading less valuable**? | **No** — k affects only the shared goal; the individual axis is unchanged (§3). |
| Does either create a **new trivial dominant strategy**? | **k=27 leaves the even spread trivial** (its defect). **k=30 leaves none** among the 9 beast-ignoring rules tested. |
| Does shared success depend **almost entirely on turnout**? | Under **linear: NO** (population-independent). Under the **current √N: YES** (100% at N=1000, 0% at N=50). |

---

## 3. Individual vs shared — the decisive separation [PROOF]/[SIM]

`ceiling-dynamic.ts` §2, one player inside a fixed crowd (N=500, 150 days):

| crowd | individual perfect reader | crowd average | individual premium |
|---|--:|--:|--:|
| herd | 85.12 | 24.00 | +255% |
| random | 42.00 | 25.03 | +68% |
| even spread | 42.00 | 26.91 | +56% |
| beast-read spread | 51.83 | 32.25 | +61% |

**On the INDIVIDUAL axis, crowd-reading dominates** (Mission 07's finding reproduced).
**On the SHARED axis, a whole crowd of crowd-readers self-defeats** (they pile onto one combo →
herd band 0.7×): the reader population reaches only 27.2–29.0, *below* the beast-reading spread's
29.7–32.4. **The two axes reward different skills.** This is a feature, not a defect (see
`INDIVIDUAL_VS_SHARED_OUTCOME_ANALYSIS.md`).

---

## 4. The beast-ignoring battery — the k lower bound [SIM]

`trivial-battery.ts` and `final-curves.ts`: nine beast-ignoring rules, N ∈ {10…2000}, 9 seeds,
state evolving under k=30.

| Rule | global max steady |
|---|--:|
| herdObvious | 24.00 |
| uniformRandom | 28.62 |
| even spread (cycle15) | 28.46 |
| **even spread, best ordering (zoneMajor)** | **29.50** (at N=22) |
| staticTop5 (fixed, genesis-ranked) | 23.40 |
| staticTop8 | 22.82 |
| allCleave / allPierce / allBurn | 22.0 / 17.2 / 13.6 |

**Highest beast-ignoring steady = 29.50.** ⇒ **the smallest integer k that defeats every
beast-ignoring rule is 30.** k=29 fails at N ≈ 22–25; k=27 fails everywhere.

---

## 5. Defection / free-riding [SIM]

`mixed-defection.ts`, inside a beast-reading crowd (N=500): the payoff of deviating to a neglected
combo.

| defectors | crowd/player | defector/player | gain |
|--:|--:|--:|--:|
| 0 | 32.25 | 35.45 | +3.20 |
| 25 | 32.41 | 35.45 | +3.04 |
| 50 | 32.57 | 35.45 | +2.88 |
| 125 | 27.09 | 26.00 | −1.09 |
| 250 | 26.73 | 26.00 | −0.73 |

A **single defector gains +3.2** (the free-rider is individually rational), but **mass defection
collapses the crowd total below k=30**. So the shared goal is a genuine **collective-action
problem**: individuals are tempted to free-ride, and enough free-riding sinks the goal. This is
**desirable tension**, and it strengthens the case for a non-trivial k (k=27 lets the crowd win
even with mass defection).

---

## 6. Behavioural concerns

| Concern | Finding |
|---|---|
| Does a k encourage **less interesting play**? | k=30 does the opposite: it makes the **beast-reading spread necessary**, so the interesting skill matters. |
| Does a k encourage **degenerate coordination**? | A "coordinated minority" that always hits one neglected zone is a **crowd-reading** rule (27.2–29.0) — it cannot clear k=30 alone, so it does not degenerate into a single-combo exploit. |
| Does a k create a **death spiral**? | Yes, mildly: the escape penalty hardens the beast, and under a hard k a locked-out community stays locked out (§`bistability.ts`). **This is a design risk, not a reason to pick 27** — it argues for a **recovery valve** (see `IMPLEMENTATION_SPECIFICATION.md` §7 and `PLAYER_EXPERIENCE_RISK_ANALYSIS.md`). |

---

## 7. Summary verdict

- **Shared goal:** k=30 defeats every beast-ignoring rule; k=27 does not.
- **Individual axis:** unaffected by k; crowd-reading remains the winning individual skill.
- **Collective action:** k=30 creates a real free-rider tension; k=27 makes the goal too easy.
- **No new dominant strategy** appears under k=30 in the tested set.
- **Risk to disclose:** bistability (a sharp failure cliff near k≈30.3) and a possible escape
  lock-in.
