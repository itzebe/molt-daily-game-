# Mission 08 — Executive Verdict

**MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · **Mode:** research only · **Implementation authority: NOT GRANTED**
**Baseline:** `d6a4338` (Mission 07) · all prior evidence intact (47/35/49/36) · prototype byte-identical

---

## 1. The one-paragraph answer

Mission 07 proposed replacing `Integrity = min(1000·√N, 12000)` with a linear `k·N`, defaulting to
**k = 27**. Independent, engine-verified re-analysis **confirms the linear structure but refutes the
default**: the load-bearing number is not the *static genesis* value 29.1, but the *dynamic*
beast-ignoring ceiling, which reaches **29.50**. **k = 27 is cleared by a trivial even spread on
50–100% of days (and by uniform-random on 67% at N=1000)** — it fails Mission 07's own objective.
**k = 30 is the smallest integer that defeats every beast-ignoring strategy at every population
size tested** (the objective fully met), at the top of the dynamic window **[29, ~30.3]**. **k = 29 is the gentler
alternative** (safer margin below the failure cliff, fails only at tiny N). The recommended change is
a **single constant and a single function**; **nothing has been implemented.**

---

## 2. What changed from Mission 07 (the three corrections)

1. **Static → dynamic.** The beast's state is endogenous (`molt` uses the day's outcome). Measuring
   the ceilings on a **fixed** state (Mission 07) is not enough; the correct test evolves the state
   **under each candidate formula**. Done here (`dynamic-k.ts`).
2. **"Trivial" mislabelled.** Mission 07 treated the *even cycle* as the trivial rule and the
   *state-reading spread* as less dangerous. The opposite is true: reading the beast's weak points
   (`top5`) is the **strong** rule (29.7–32.4); the even cycle is **weaker** (26.9–28.5). This is why
   Mission 07's "29.1" did not generalise.
3. **A failure cliff exists.** Near **k ≈ 30.3** the goal flips from "cleared 99%" to "cleared 0%"
   (bistability). This was invisible statically and is decisive for the margin analysis.

**Net effect:** the constant moves from **27 → 30** (primary) or **29** (alternative). 27 is out.

---

## 3. The evidence (all engine-verified, all reproducible)

| Result | Value | Category | Evidence |
|---|---|---|---|
| Analysis library == engine | 8405/8405 | `[ENGINE]` | `fidelity8.ts` |
| `√N` is population-dependent; linear is not | — | `[PROOF]` | `verify-math.ts`, `separation.ts` |
| Genesis ceilings (herd 21.0, dispersion 29.08, equilibrium 34.16) | reproduced exactly | `[ENGINE]` | `verify-math.ts` |
| Dynamic even-spread ceiling | 26.9–29.5 (N-dependent) | `[SIM]` | `separation.ts`, `final-curves.ts` |
| k=27 cleared by trivial rules | 50–100% of days | `[SIM]` | `dynamic-k.ts`, `mixed-under-k.ts` |
| Max beast-ignoring steady (9 rules × 7 N × 9 seeds) | **29.50** | `[SIM]` | `trivial-battery.ts`, `final-curves.ts` |
| k=30 cleared by beast-reading spread | 99% | `[SIM]` | `dynamic-k.ts` |
| Failure cliff | k ≈ 30.3 | `[SIM]` | `bistability.ts` |
| Individual crowd-reading premium | +56–255%, k-independent | `[PROOF]` | `ceiling-dynamic.ts` |
| C1/C2 shift the ceilings | C1 0.55–1.70×; C2 ~40% | `[PROOF]` | `c1c2-sensitivity.ts` |

---

## 4. Final recommendation

> ## CONDITIONAL GO — **approve `k = 30`** (alternative `k = 29`); **reject `k = 27`**
>
> - **Formula:** `Integrity(N) = k·N`, no cap.
> - **Primary constant:** **k = 30** — the smallest integer that defeats every beast-ignoring rule
>   at every N tested (objective fully met), at the top of the dynamic window [29, ~30.3].
> - **Alternative:** **k = 29** — gentler, ~1.3 margin below the cliff, but fails at N < 30.
> - **Rejected:** **k = 27** — trivial rules clear it (50–100%).

**Why CONDITIONAL and not GO:** the *mathematics* is settled (high confidence), but **no human has
played MOLT**, and the k=30 choice sits **~0.3 below a failure cliff**. The human playtest
(`HUMAN_PLAYTEST_REQUIREMENTS.md`) is the tie-breaker between 29 and 30. **Nothing is implemented.**

**Ordering note:** C1/C2 (both load-bearing on the ceilings) should be settled as **documentation
corrections** *before* k is fixed, so k is derived against the final damage tables.

---

## 5. The three possible verdicts, and why CONDITIONAL

| Verdict | Fit |
|---|---|
| **GO** | Would require a validated 80+ opportunity **and** resolved human evidence. The human evidence is absent → not GO. |
| **CONDITIONAL GO** | **Chosen** — the opportunity is real and the mathematics is verified, but the constant choice and the lock-in risk need a human playtest. |
| **NO-GO** | Not chosen — the linear fix is sound, the k is determinable, and no fatal flaw was found. |

---

## 6. What is authorised vs not

| Action | Status |
|---|---|
| Research, analysis, verification, recommendations | **DONE** |
| Editing the engine / constant / UI / rules | **NOT DONE, NOT AUTHORISED** |
| Changing C1 / C2 | **NOT DONE, NOT AUTHORISED** |
| Committing Mission 08 to git | **local commit only, no push** |
| Applying the integrity change | **AWAITS EXPLICIT USER APPROVAL** |

---

## 7. Deliverables in this mission

| File | Content |
|---|---|
| `BASELINE_INTEGRITY_REPORT.md` | repository/baseline verification |
| `MISSION07_RECOMMENDATION_REVIEW.md` | what Mission 07 decided, and its gaps |
| `INDEPENDENT_MATHEMATICAL_VERIFICATION.md` | formula, rounding, boundaries, state-dependence |
| `POPULATION_SCALING_COMPARISON.md` | `√N` vs linear scaling |
| `K27_VS_K30_DECISION.md` | the decision, with the full comparison table |
| `ADVERSARIAL_STRATEGY_RESULTS.md` | the 10 strategy families + the beast-ignoring battery |
| `INDIVIDUAL_VS_SHARED_OUTCOME_ANALYSIS.md` | the two axes, reported separately |
| `C1_C2_RELEVANCE_REVIEW.md` | whether C1/C2 affect the decision (yes, as a dependency) |
| `PLAYER_EXPERIENCE_RISK_ANALYSIS.md` | non-gamer/gamer risks, as testable predictions |
| `IMPLEMENTATION_SPECIFICATION.md` | the exact change (not applied) |
| `HUMAN_PLAYTEST_REQUIREMENTS.md` | the experiment that closes the question |
| `DESIGN_OWNER_DECISION_SHEET.md` | the owner's decision, with the 8 required statements |
| `KNOWN_LIMITATIONS.md` | every limitation, honestly |
| `EXECUTIVE_VERDICT.md` | this document |
| `SHA256SUMS.txt` | reproducibility manifest |

---

## 8. Bottom line

Mission 07 was **right about the structure** (linear, not `√N`) and **wrong about the constant**
(27 is too easy; the trivial rule still wins). The correct range is **k ∈ {29, 30}**, and the
evidence now points to **30 as primary** — the smallest integer that fully closes the trivial path.
The only thing standing between this and a GO is a **human playtest** of the failure cliff.

> **STOP — awaiting explicit user approval. No gameplay change is authorised.**
