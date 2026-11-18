# Mission 09 — Executive Verdict

**MOLT · Rule Integrity, Mathematical Revalidation & Human Playtest Readiness**
**Date:** 2026-11-18 · **Mode:** research only · **Implementation authority: NOT GRANTED**
**Baseline:** `0697eb2` (Mission 08) · branch `master` · worktree clean · engine untouched

---

## Verdict

> ## **CONDITIONAL GO**
>
> A concrete, mathematically-validated integrity fix exists and is ready to implement **on your
> authorisation**: replace `min(1000·√N, 12000)` with **`Integrity = 30·N`** (engine rules). It is the
> **unique** integer constant that closes the trivial path at every population size while remaining
> winnable by an engaged crowd (98.7 %).
>
> The condition is **one unresolved empirical question**: *can a real crowd clear the opening days at
> k = 30?* The model cannot answer it, and the failure cliff is razor-thin (+0.02). The human playtest
> is prepared to resolve it.
>
> **A second condition:** the fix is contingent on resolving **C1 and C2 in favour of the engine
> reading** — under either alternative reading, **no valid constant exists**.

**This is not a GO** because two evidence questions remain open. **It is not a NO-GO** because the fix
is fully specified, verified, and one playtest away from certainty.

---

## 1. What was investigated (and how)

Everything was verified against primary sources; the parametric model was proven equal to the frozen
engine (**906/906**). Method categories: `[PROOF]` exact arithmetic · `[ENGINE]` engine-verified ·
`[SIM]` seeded simulation.

| Investigation | Deliverable |
|---|---|
| C1 — `STATE_MULT` | `C1_FULL_INVESTIGATION.md` |
| C2 — pierce vs exposed | `C2_FULL_INVESTIGATION.md` |
| C1 × C2 combined | `C1_C2_COMBINED_ANALYSIS.md` |
| dynamic revalidation | `DYNAMIC_INTEGRITY_REVALIDATION.md` |
| failure cliff | `FAILURE_CLIFF_ANALYSIS.md` |
| k comparison | `K27_K29_K30_COMPARISON.md` |
| adversarial strategies | `ADVERSARIAL_STRATEGY_RESULTS.md` |
| individual vs shared | `INDIVIDUAL_VS_SHARED_OUTCOME_ANALYSIS.md` |
| independent verification | `INDEPENDENT_MATHEMATICAL_VERIFICATION.md` |
| baseline | `BASELINE_INTEGRITY_REPORT.md` |

---

## 2. The headline findings

### F1 — The integrity formula should be linear, and k = 30 `[SIM]`

| constant | max beast-ignoring SLAIN % | engaged-crowd SLAIN % | verdict |
|---|---|---|---|
| current √N | ~100 % at N ≥ 1000 | 100 % | **cosmetic** |
| k = 27 | 100 % | 100 % | **too easy** |
| k = 29 | 50 % | 99.3 % | **too easy** |
| **k = 30** | **0.7 %** | **98.7 %** | **✅ the unique solution** |
| k = 31 | 0 % | 0 % | too hard |

**k = 30 is the unique integer** that (a) closes the trivial path and (b) stays winnable. The current
√N formula makes the shared goal cosmetic at scale.

### F2 — The failure cliff is real and razor-thin `[SIM]`

The engaged crowd's SLAIN collapses **98.7 % → 0 % between k = 30.00 and k = 30.02**. The mechanism is a
**bistable lock-in**: the beast tips into a high-damage or low-damage attractor on **day 3**, decided by
whether the opening days clear. It is **deterministic** (all 9 seeds identical), not noise. **k = 30
sits exactly on the edge** (margin +0.02).

### F3 — C1 and C2 are load-bearing; the engine reading is the only playable one `[SIM]`

| combination | valid k? |
|---|---|
| **engine C1 × 1.0 C2** | **✅ k = 30** |
| engine × 1.6 | ❌ none |
| §1.2 × 1.0 | ❌ none (escape death-spiral) |
| §1.2 × 1.6 | ❌ none |

Under **either** alternative reading there is **no valid constant**. The engine reading is not merely
better-documented; it is the **only balanced** one. **C1 and C2 must be settled before k.**

### F4 — The individual game is untouched by k `[PROOF]`

k enters only the shared comparison `Σ damage ≥ k·N`. A player's own damage, and the **+171 %**
single-deviator premium, are **identical** at every k. Changing k cannot harm the individual experience.

---

## 3. The four decisions (recommended)

| Decision | Recommendation | Engine change? |
|---|---|---|
| **A — C1** | keep the engine reading; fix §1.2's table (docs only) | no |
| **B — C2** | keep `pierce/exposed = 1.0`; fix §2.2's row (docs only) | no |
| **C — integrity** | **`Integrity = 30·N`** (fallback k = 29) | yes (one constant + one function) |
| **D — playtest** | authorise the 8-person test | no |

**Ordering:** A and B first (they determine C). Full detail: `DESIGN_OWNER_DECISION_SHEET.md`.

---

## 4. Why CONDITIONAL and not GO

| Open question | Why it matters | How it closes |
|---|---|---|
| Can a real crowd clear the opening at k = 30? | The +0.02 cliff margin means an under-engaged crowd never clears | the playtest (Decision D) |
| Is C1/C2 the engine reading by intent? | The fix is contingent on it | your Decision A/B |

Neither is a flaw in the analysis; both are **empirical/intent** questions only you can close.

---

## 5. Why not NO-GO

- The fix is **fully specified**: one constant, one function, one call site.
- It is **verified**: 906/906 against the frozen engine; k = 30 confirmed unique across 15 rules,
  9 seeds, 14 population sizes.
- It is **low-risk**: the individual game is provably untouched; the change is one line + one function.
- The remaining uncertainty is **one playtest away** from resolution.

---

## 6. Honest limitations

1. **The +0.02 cliff margin** is genuinely thin. If the playtest shows casual crowds cannot clear the
   opening, k = 30 fails in practice and the fallback is k = 29 (accepting a tiny-N trivial gap) or a
   recovery-valve gameplay change (out of scope).
2. **The 0.9 margin** over the best beast-ignoring rule (randomDaily, 29.1) is not large.
3. **Methodological correction to Mission 08:** its window method evolved the state under √N; the
   correct test evolves it under the candidate k. The window framing is fragile; the **SLAIN-rate
   decision table** is the robust artefact and is what Mission 09 relies on. Mission 08's core finding
   (k = 30 defeats the even spread) **stands**.
4. **No human data.** 0 of 8 participants; nothing contacted, nothing deployed.
5. **Long-run stability** modelled to 150 days only.

---

## 7. What is requested

1. **Approve or reject Decisions A and B** (rule readings — documentation only).
2. **Approve or reject Decision C** (the integrity change — conditional on A & B).
3. **Authorise or decline Decision D** (the playtest).

**On approval of A, B, and C, implementation is one focused change** (a single constant and function in
the engine, plus the documentation corrections). **On approval of D, the playtest runs and produces the
final GO/NO-GO.**

**No implementation, deployment, or submission is performed until you explicitly authorise it.**
