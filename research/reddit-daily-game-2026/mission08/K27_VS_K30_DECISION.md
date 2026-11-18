# k = 27 vs k = 30 — The Decision

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · Categories: `[PROOF]` · `[ENGINE]` · `[SIM]`
**Evidence:** `evidence/dynamic-k-output.txt`, `trivial-battery-output.txt`, `final-curves-output.txt`,
`noisy-crowd-output.txt`, `bistability-output.txt`, `mixed-under-k-output.txt`, `separation-output.txt`

---

## 0. The headline

> **k = 27 is refuted. k = 30 is defensible.** The single most important correction to Mission 07:
> the load-bearing number is **not** the static genesis value **29.1**, but the **dynamic
> beast-ignoring ceiling, which reaches 29.50** across rules, N and seeds. **30 > 29.50; 27 < 28.5.**
> A **narrow alternative** for a gentler goal is **k = 29** (defensible for N ≥ 30 only).

---

## 1. Is the "29.1" blind-dispersion result stable? — NO [PROOF]/[SIM]

Mission 07's 29.1 came from **one state** (genesis) in **one static** evaluation. Under the
frozen engine with the state evolving:

| Measure | Value | Source |
|---|--:|---|
| genesis-static blind dispersion | 29.08 | `verify-math.ts` |
| dynamic even-spread, realistic N (50–2000) | 26.9 – 28.5 | `separation.ts` |
| dynamic even-spread, small N (22–25) | 29.16 – 29.50 | `final-curves.ts` |
| dynamic uniform-random, large N | 28.6 | `trivial-battery.ts` |
| **state-dependent static ceilings** (cycle15 across 8 states) | **29.08 – 37.41** | `verify-math.ts` |

**29.1 is neither a constant nor the maximum.** It is the genesis-static value; the dynamic
ceiling is **higher (29.50)** at small N and the state-dependent static ceiling is **much higher
(37.41)** for evolved beasts. **A value of 30 must therefore be justified against 29.50, not 29.1
— which the evidence does support — and 27 is refuted because it is below even the realistic-N
dynamic ceiling (~28.5).**

---

## 2. The direct comparison table

All values are measured; `[SIM]` = frozen engine, 150 days, state evolves under the candidate k,
median/mean of 9 seeds.

| Measure | **k = 27** | **k = 30** |
|---|---|---|
| **Small-community win (N=50)** | even spread **100%**, beast-read 100% | even spread **0%**, beast-read 99% |
| **Medium-community win (N=200)** | even spread **50%**, random 7%, beast-read 100%, reader 66% | even spread **0%**, beast-read 99%, reader 50% |
| **Large-community win (N=1000)** | even spread **50%**, random **67%**, beast-read 100% | even spread **0%**, random 1%, beast-read 99% |
| **Blind-dispersion outcome** | **clears 50–100%** → trivial rule wins (T6 NOT fixed) | **clears 0%** → trivial rule defeated (T6 fixed) |
| **Deliberate-prediction outcome (shared)** | crowd-reader 66% | crowd-reader 50% |
| **Coordinated-player outcome** | even-spread (no skill) clears; herd 0% | only beast-reading clears; no beast-ignoring rule clears |
| **Individual strategic advantage** | unchanged: reader 51.8 vs crowd 32.25 (+61%) | unchanged (k affects only the shared goal) |
| **Lazy-play vulnerability** | herd 0%, but **random/even-spread clear** | **nothing beast-ignoring clears** |
| **Risk of discouraging newcomers** | **low** — easy to clear; the goal feels achievable | **higher** — needs ~30–50% state-reading engagement |

---

## 3. Why k = 27 is refuted [SIM]

- At N=50/200/1000, a **beast-ignoring even spread clears k=27 on 50–100% of days**.
- At N=1000, **uniform-random play clears 67%** — pure noise beats the goal.
- Therefore k=27 does **not** deliver Mission 07's own objective ("the shared goal becomes a skill
  goal"). It leaves a trivial path open. **Reject.**

## 4. Why k = 30 is defensible [SIM]

- Across **9 beast-ignoring rules × 7 population sizes × 9 seeds**, the **maximum** steady
  per-player is **29.50** (`final-curves.ts`; 29.16 for the best at a realistic N). **No
  beast-ignoring rule reaches 30 at any N tested.**
- The **beast-reading spread clears k=30 on 99% of days** at N=50/200/1000 — the intended skill
  is sufficient.
- So k=30 **closes the trivial path at every N while remaining achievable by the intended skill.**

## 5. Why k = 29 is the documented alternative [SIM]

- k=29 defeats the even spread at **realistic N ≥ 30** (ceiling ~28.5) but **not at tiny N
  (22–25, ceiling 29.16–29.50)**.
- k=29 is **gentler**: the noisy-reader crowd clears it more often (e.g. 30% readers → 94–97%
  at N=500/1000), better for casual subreddits.
- **Recommend k=29 only if the owner accepts that sub-25-player communities can be cleared by an
  even spread** (a marginal regime).

---

## 6. The two conditions that make this delicate (both must be disclosed)

### 6.1 Bistability — a sharp cliff [SIM]

`bistability.ts`: the beast's state trajectory is **path-dependent**. If the community clears the
goal on the early days, the escape penalty (§3.7) never fires and the state settles into a
**high-damage attractor**; if it fails early, the penalty fires and it locks into a **low-damage
attractor**:

| k (beast-reading spread, N=200) | early min/player | steady/player | SLAIN days /150 |
|---|--:|--:|--:|
| 27 | 28.00 | 32.25 | 150 |
| 29 | 28.00 | 32.41 | 149 |
| 30 | 28.00 | 32.37 | 148 |
| **30.5** | 28.00 | 29.70 | **0** |
| 31 | 28.00 | 29.70 | 0 |

**There is a bifurcation at k ≈ 30.3.** k=30 clears; k=30.5 fails entirely. So **k=30 sits ~0.3
below a total-failure cliff** — a thin margin. **k=29 has ~1.5 of margin.** This is the strongest
argument for the alternative k=29.

### 6.2 The "beast-reading spread" is a lockstep idealisation [SIM]

The `top5` rule is a deterministic coordination (all readers pick the same 5 combos in the same
proportions). A **noisy** reader crowd (`noisy-crowd.ts`) achieves less:

| reader sharpness | N=100 | N=500 | N=1000 |
|---|--:|--:|--:|
| T=2 (mild) | 25.81 | 25.02 | 25.52 |
| T=4 | 27.47 | 27.26 | 27.25 |
| T=6 | 28.59 | 27.56 | 29.16 |
| T=8 (sharp) | 28.89 | 29.69 | 30.08 |

**A realistic (noisy) crowd reaches only ~28–30**, so **k=30 is at the realistic ceiling** and
**k=29 is comfortably within it**. This argues that **k=30 is a hard goal for a real subreddit**,
and that **k=29 is the safer pick if accessibility matters.**

---

## 7. Decision recommendation

| Option | Verdict |
|---|---|
| **k = 27** | **REJECT** — trivial rules clear it (50–100%) |
| **k = 30** | **DEFENSIBLE, primary recommendation** — the only integer that defeats every beast-ignoring rule at every N; achievable by the intended skill |
| **k = 29** | **DEFENSIBLE alternative** — gentler, ~1.5 margin below the cliff; fails only at N < 30 |
| k ≥ 31 | REJECT — above the bistability cliff; the goal becomes unwinnable |

> **Recommendation: k = 30 as the primary constant, with k = 29 documented as the
> lower-difficulty alternative.** Both are defensible; k = 27 is not. The choice between 29 and 30
> is a **deliberate accessibility-vs-strictness trade-off** that the design owner — not this
> research — should make, and which the human playtest should inform.

**This is not "30 because 30 > 29.1."** It is "30 because the dynamic beast-ignoring ceiling is
29.50, and 30 is the smallest integer above it; and 27 is below the realistic ceiling (~28.5)."
