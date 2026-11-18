# Independent Mathematical Verification

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · Categories: `[PROOF]` exact · `[ENGINE]` frozen-engine verified · `[SIM]` seeded
**Evidence:** `evidence/fidelity8-output.txt`, `verify-math-output.txt`, `dynamic-k-output.txt`,
`robustness-output.txt`, `separation-output.txt`, `diagnostic-output.txt`, `diagnostic2-output.txt`

This document reproduces — and where the evidence requires, **refutes** — Mission 07's
linear-integrity conclusions. The frozen engine is the authoritative reference.

---

## 0. Fidelity: the model equals the engine [ENGINE]

`fidelity8.ts`:

| Check | Result |
|---|---|
| `lib8.dmg` vs engine `damageFor` (8 000 random combo/share pairs) | 8000 / 8000 |
| `lib8` total vs engine `resolveDay` (400 random crowds, N ∈ {1…1000}) | 400 / 400 |
| `lib8.integritySqrt` vs engine `integrityFor` | 5 / 5 |
| **OVERALL** | **8405 pass, 0 fail** |

Every number below is therefore faithful to the engine.

---

## 1. Exact formulas, rounding and boundaries [PROOF]

Current engine (`resolve.ts:81–82`): `integrityFor(n) = Math.min(1000 * Math.sqrt(n), 12000)`.

| N | current `min(1000√N,12000)` | `27N` | `30N` | current **per-player** bar |
|--:|--:|--:|--:|--:|
| 1 | 1000 | 27 | 30 | 1000.00 |
| 15 | 3872.98 | 405 | 450 | 258.20 |
| 100 | 10000 | 2700 | 3000 | 100.00 |
| 144 | 12000 | 3888 | 4320 | 83.33 |
| 1000 | 12000 | 27000 | 30000 | 12.00 |
| 100000 | 12000 | 2700000 | 3000000 | 0.12 |

**Structural fact [PROOF]:** the current per-player bar `1000/√N` **falls** with N (population gate
at small N, auto-win at large N); a linear `k·N` bar is **constant = k**. This is Mission 07's
central claim and it is **correct**.

**Rounding / boundaries [ENGINE]:**

- The current target is a **non-integer** for non-square N (e.g. `integrityFor(7) = 2645.751…`),
  compared to the **integer** `totalDamage` with `>=`. A linear `k·N` is always an integer.
- Damage is `Math.round(base × toolMult × crowdFactor × fatigue × ridge)` per strike.
- Crowd-band boundaries are **inclusive at the lower bound** (`share >= minShare`):
  `0.0299999 → read (1.9×)`, `0.03 → lone (1.4×)`, `0.0999999 → lone`, `0.1 → common (1.0×)`,
  `0.2999999 → common`, `0.3 → herd (0.7×)`.

**Ambiguities Mission 07 left unstated** (recorded, not invented): no minimum/floor; no explicit
rounding convention for the target; the exact location is inferred (`resolve.ts:81`, `rules.ts:78–79`).

---

## 2. Strategy ceilings are STATE-DEPENDENT — the gap Mission 07 left [PROOF]

Mission 07 measured ceilings only on the **genesis (all-exposed)** beast. The beast's state is
**endogenous** (derived by `molt()` from the day's outcome). Exact ceilings at N=2000 across states:

| state | herd | cycle15 | top5 | rightTool | equilibrium | DP-optimal |
|---|--:|--:|--:|--:|--:|--:|
| genesis (all exposed) | 21.00 | 29.08 | 28.00 | 24.00 | 34.16 | 34.79 |
| crown armoured | 34.00 | 30.75 | 31.60 | 27.60 | 36.26 | 39.98 |
| crown+gut armoured | 34.00 | 32.35 | 35.00 | 31.00 | 43.25 | 43.80 |
| all armoured | 34.00 | 35.81 | 39.20 | 38.40 | 47.23 | 47.23 |
| tail raw | 21.00 | 30.94 | 28.40 | 26.00 | 36.49 | 36.75 |
| 2 raw 2 arm | 34.00 | 37.41 | 40.80 | 36.40 | 49.08 | 49.34 |

- **blind dispersion (`cycle15`) ranges 29.08 → 37.41** across states.
- **`top5` spread ranges 28.00 → 40.80**; **DP-optimal ranges 34.79 → 49.34**.

**Consequence [PROOF]:** a single static genesis number (**29.1**) **cannot** set k. Any fixed k is
above some states' ceilings and below others'. The question must be answered **dynamically**.

**Reachability [SIM]:** not all states are reachable. Across three strategies × 200 days × N ∈
{50,200,1000}, the reached signatures include `eeeee, eeaee, aaaer, aaerr, aarrr, aeaar, aerar,
araer, arrrr`; **`aaaaa` (all armoured) was NOT reached** (max 3 armoured, 4 raw). The extreme
all-armoured ceiling (47–49) is therefore **not representative**; the reachable range is narrower.

---

## 3. Dynamic verification — the state evolves under the candidate formula [SIM]/[ENGINE]

**Methodological correction.** `molt()` uses the day's **outcome** for the escape penalty (§3.7), so
the state trajectory **depends on which integrity formula is in force**. Mission 07 measured a
*static* state. `dynamic-k.ts` runs the frozen engine 150 days, **evolving the state under each
candidate formula**, 9 seeds, and reports the steady per-player damage (last 20 days) and the
SLAIN rate. (The engine's `resolveDay` computes damage; only the *outcome label fed to `molt`* is
switched to compare against `k·N`. The engine is **not modified**.)

**Steady per-player (median of 9 seeds):**

| N | formula | herd | random | blind15 (even spread) | top5 (beast-reading spread) | reader (crowd-reading) |
|--:|---|--:|--:|--:|--:|--:|
| 50 | sqrt | 24.00 | 22.82 | 28.46 | 29.70 | 29.00 |
| 50 | **k=27** | 24.00 | 22.82 | **27.32** | 32.25 | 27.20 |
| 50 | **k=30** | 24.00 | 22.82 | **28.46** | 32.37 | 29.00 |
| 200 | **k=27** | 24.00 | 24.91 | **27.60** | 32.25 | 27.20 |
| 200 | **k=30** | 24.00 | 24.91 | **28.21** | 32.37 | 29.00 |
| 1000 | **k=27** | 24.00 | 27.65 | **27.26** | 32.25 | 27.20 |
| 1000 | **k=30** | 24.00 | 28.41 | **27.62** | 32.37 | 29.00 |

**SLAIN rate (% of days cleared):**

| N | formula | herd | random | blind15 | top5 | reader |
|--:|---|--:|--:|--:|--:|--:|
| 50 | **k=27** | 0% | 0% | **100%** | 100% | 66% |
| 50 | **k=30** | 0% | 0% | **0%** | 99% | 50% |
| 200 | **k=27** | 0% | 7% | **50%** | 100% | 66% |
| 200 | **k=30** | 0% | 0% | **0%** | 99% | 50% |
| 1000 | **k=27** | 0% | **67%** | **50%** | 100% | 66% |
| 1000 | **k=30** | 0% | 1% | **0%** | 99% | 50% |
| any | sqrt | 100% | 100% | 100% | 100% | 100% |

**Findings:**

1. **Under the current `√N` formula, EVERY strategy clears the goal at N=1000 (100%).** The shared
   goal is cosmetic at scale — independently confirming Mission 07's auto-win finding.
2. **Under k=27, a trivial even spread clears the goal 50–100% of days**, and at N=1000 even
   **random** play clears 67%. **k=27 does not close the trivial path. It is refuted.**
3. **Under k=30, no beast-ignoring rule clears** (herd 0%, random ≤1%, even spread 0%), while the
   beast-reading spread clears 99%. **k=30 closes the trivial path and is achievable.**
4. **Crowd-reading (`reader`) clears only ~50% under k≥29** — see §5.

---

## 4. The feasible window [SIM]

`separation.ts` (9 seeds) and `robustness.ts` (5 seeds) compute, per N,
`k_min = 1 + floor(worst beast-ignoring steady)` and `k_max = floor(best beast-reading steady)`:

| N | worst beast-ignoring | best beast-reading | window | k=27? | k=29? | k=30? |
|--:|--:|--:|:--:|:--:|:--:|:--:|
| 15 | 28.20 | 29.00 | 29–29 | NO | ok | NO |
| 50 | 28.46 | 29.00 | 29–29 | NO | ok | NO |
| 100 | 27.80 | 29.00 | 28–29 | NO | ok | NO |
| 200 | 28.21 | 29.00 | 29–29 | NO | ok | NO |
| 500 | 28.17 | 29.00 | 29–29 | NO | ok | NO |
| 1000 | 28.41 | 29.00 | 29–29 | NO | ok | NO |
| 2000 | 28.33 | 29.00 | 29–29 | NO | ok | NO |

- **k = 27 is below the window at every N** (the worst beast-ignoring rule reaches ~28.5).
- The window's **lower bound is ~29** (worst beast-ignoring ≈ 28.5).
- The **static** upper bound is **~32** (the beast-reader ceiling) — but the **dynamic** upper bound
  is **~30.3**: above it the goal is not merely hard but **unwinnable** (the bistability cliff,
  `bistability.ts`). So the **realistic dynamic window is `[29, ~30.3]`**, and **k = 30 sits at its
  top edge**.

**This is the decisive result.** The window's **lower bound is set by the beast-ignoring even spread
(~28.5, so k ≥ 29)** and its **upper bound by the bistability cliff (~30.3, so k ≤ 30)**. Within
`[29, 30]`:

- **k = 29** is the **only** integer clearable even by a *crowd-reading* population (ceiling 29.0),
  and it keeps a ~1.3 margin below the cliff — but it fails at tiny N (<30).
- **k = 30** is the **only** integer that defeats every beast-ignoring rule **at every N**, cleared
  by the *beast-reading* spread (99%) — but it sits ~0.3 below the cliff.

Both are defensible; **k = 27 is below the window everywhere and is refuted.**

---

## 5. Individual vs shared: two different winning skills [PROOF]/[SIM]

`ceiling-dynamic.ts` §2 (a single player inside a fixed crowd, N=500, 150 days):

| crowd | perfect reader (individual) | crowd average |
|---|--:|--:|
| herd | **85.12** | 24.00 |
| random | 42.00 | 25.03 |
| blind dispersion | 42.00 | 26.91 |
| top5 spread | **51.83** | 32.25 |

**On the INDIVIDUAL axis, crowd-reading is the winning skill** (51.8 vs the crowd's 32.25 — a 61%
premium; Mission 07's static finding reproduced).

**On the SHARED axis the opposite holds:** a whole population of crowd-readers (`reader`) reaches
only 27.2–29.0, *below* the beast-reading spread (`top5`, 29.7–32.4). Why: if everyone best-responds
to the crowd, they pile onto the same combo, which becomes the **herd band (0.7×)** — the crowd is
**self-defeating** (`diagnostic.ts`: the equilibrium sits at ~6% in the read band; a *population* of
readers cannot all fit there).

**Therefore the shared goal rewards *reading the beast and spreading*, while the individual
leaderboard rewards *reading the crowd*. These are different skills.** See
`INDIVIDUAL_VS_SHARED_OUTCOME_ANALYSIS.md`.

---

## 6. Edge cases [PROOF]

| Case | Result |
|---|---|
| Zero participation (n=0) | `totalDamage = 0`; the engine special-cases `n=0` (no division). Under `k·N`, target = 0 → a 0-day would be "SLAIN" if compared naively. **The spec must preserve the engine's `n>0` guard.** |
| One striker (N=1, best) | total 21; `k=27` → 27, `k=30` → 30 → **escapes** (correct: one player cannot fell a beast). |
| Concentrated (all on obvious) | N=100: 21.00/player (herd band) — the *worst* coordinated outcome. |
| Full participation | N=1000: even spread 27.6, beast-reading 32.4. |
| Small N (<15) | the linear target is clearable by a single combo; the game is trivially small below ~12 (see `verify-math.ts` §7). Not a real subreddit regime. |
| Large N (≥500) | ceilings flat; the window is stable (scale-invariance holds, confirming Mission 07). |

---

## 7. Verdict of the mathematical verification

| Mission 07 claim | Mission 08 finding |
|---|---|
| `√N` → gate + auto-win; linear fixes it | **CONFIRMED** [PROOF] |
| Genesis ceilings (herd 21, dispersion 29.08, equilibrium 34.16) | **REPRODUCED EXACTLY** [ENGINE] |
| k=27 is the "winnable default" | **REFUTED** — trivial rules clear k=27 (50–100%) [SIM] |
| k=30 "defeats the trivial spread rule" | **CONFIRMED** — no beast-ignoring rule clears k=30 [SIM] |
| "29.1" is the trivial ceiling | **INCOMPLETE** — it is the *genesis-static* value; the *dynamic* ceiling is ~28.5, and *state-dependent* ceilings reach 37.4 [PROOF] |
| ceilings are ~constant in N | **CONFIRMED** for N ≥ 60 [PROOF] |

**Bottom line:** the linear formula is correct in structure, but **k = 27 is too low**, and the
correct k is **not a single robust number** — it sits in a **narrow window around 29–30**, whose
lower bound is set by the beast-ignoring even spread and whose upper bound depends on which skill
the shared goal is meant to reward. See `K27_VS_K30_DECISION.md`.
