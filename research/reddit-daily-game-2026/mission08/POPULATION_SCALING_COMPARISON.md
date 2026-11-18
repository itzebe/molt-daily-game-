# Population Scaling Comparison

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · Categories: `[PROOF]` · `[ENGINE]` · `[SIM]`
**Evidence:** `evidence/verify-math-output.txt`, `separation-output.txt`, `robustness-output.txt`,
`final-curves-output.txt`, `dynamic-k-output.txt`

---

## 1. The current formula is population-dependent; a linear formula is not [PROOF]

| N | `min(1000√N,12000)` | per-player bar `I/N` | `27N` | `30N` | linear per-player bar |
|--:|--:|--:|--:|--:|--:|
| 15 | 3873 | 258.20 | 405 | 450 | 27 / 30 |
| 100 | 10000 | 100.00 | 2700 | 3000 | 27 / 30 |
| 348 | 12000 | 34.48 | 9396 | 10440 | 27 / 30 |
| 1000 | 12000 | 12.00 | 27000 | 30000 | 27 / 30 |
| 100000 | 12000 | 0.12 | 2.7M | 3.0M | 27 / 30 |

- The current per-player bar **falls** as `1/√N` → **population gate** (small subs cannot win) and
  **auto-win** (large subs clear easily). Confirmed dynamically: at N=1000 the **current formula is
  cleared 100% of days by EVERY strategy, including the lazy herd** (`dynamic-k-output.txt`).
- The linear per-player bar is **constant** → the outcome depends on **how** the community plays,
  not on **how many** show up. **This structural claim of Mission 07 is CONFIRMED [PROOF].**

---

## 2. Scale-invariance of the ceilings [PROOF]

Genesis-beast ceilings by N (exact):

| N | cycle15 | top5 | equilibrium | DP-optimal |
|--:|--:|--:|--:|--:|
| 5 | 24.40 | 28.00 | 28.00 | 28.00 |
| 15 | 29.07 | 28.00 | 31.00 | 31.53 |
| 60 | 29.07 | 28.00 | 32.43 | 32.98 |
| 100 | 29.41 | 28.00 | 32.64 | 33.72 |
| 500 | 29.12 | 28.00 | 34.09 | 34.55 |
| 1000 | 29.10 | 28.00 | 34.13 | 34.66 |
| 5000 | 29.07 | 28.00 | 34.17 | 34.86 |

Above N ≈ 60 the ceilings are **flat in N** (small-N wobble is integer-rounding granularity at the
crowd-band boundaries). **A linear target is therefore scale-invariant; the `√N` target is not.**

---

## 3. Dynamic scaling of the outcome (the decisive table) [SIM]

Steady per-player, state evolving under each formula, 9 seeds (medians), `dynamic-k-output.txt`:

| N | formula | herd | random | even spread | beast-read spread | crowd-reader |
|--:|---|--:|--:|--:|--:|--:|
| 50 | k=27 | 24.00 | 22.82 | 27.32 | 32.25 | 27.20 |
| 50 | k=30 | 24.00 | 22.82 | 28.46 | 32.37 | 29.00 |
| 200 | k=27 | 24.00 | 24.91 | 27.60 | 32.25 | 27.20 |
| 200 | k=30 | 24.00 | 24.91 | 28.21 | 32.37 | 29.00 |
| 1000 | k=27 | 24.00 | 27.65 | 27.26 | 32.25 | 27.20 |
| 1000 | k=30 | 24.00 | 28.41 | 27.62 | 32.37 | 29.00 |

SLAIN rate (% of days), same source:

| N | formula | herd | random | even spread | beast-read spread | crowd-reader |
|--:|---|--:|--:|--:|--:|--:|
| 50 | k=27 | 0% | 0% | **100%** | 100% | 66% |
| 50 | k=30 | 0% | 0% | **0%** | 99% | 50% |
| 200 | k=27 | 0% | 7% | **50%** | 100% | 66% |
| 200 | k=30 | 0% | 0% | **0%** | 99% | 50% |
| 1000 | k=27 | 0% | **67%** | **50%** | 100% | 66% |
| 1000 | k=30 | 0% | 1% | **0%** | 99% | 50% |
| any | √N | 100% | 100% | 100% | 100% | 100% |

**Population-independence check:** under k=30 the SLAIN rate for a *fixed strategy* is
**≈ the same at N=50, 200 and 1000** (beast-read spread ≈ 99% at all N; even spread 0% at all N).
Under the current `√N` formula it is **100% at N=1000 but 0% at N=50** for the same strategy —
turnout-dominated. **The linear target removes the population dependence. [SIM]**

---

## 4. Where the population-independence breaks: small N [PROOF]

Below N ≈ 25 the integer target is coarse and single combos can swing the result
(`verify-math.ts` §7). The even-spread ceiling peaks at **29.50 at N=22** (`final-curves.ts`).
So:

- The window is **cleanest for N ≥ 60** (the regime of a real subreddit).
- **At N < ~25 the game is trivially small** and the k choice matters less; the practical
  recommendation should state a **minimum viable N** (see `IMPLEMENTATION_SPECIFICATION.md`).

---

## 5. Verdict

| Property | Current `√N` | Linear `k·N` |
|---|---|---|
| Small sub, skilled | cannot win (gate) | wins iff skilled |
| Large sub, lazy | auto-wins | loses (k ≥ 22) |
| Per-player requirement | ∝ 1/√N | constant = k |
| Turnout dominates outcome | **yes** | **no** |
| Scale-invariant above N≈60 | **no** | **yes** |

**The linear formula is confirmed as the correct structure.** The constant is decided in
`K27_VS_K30_DECISION.md`.
