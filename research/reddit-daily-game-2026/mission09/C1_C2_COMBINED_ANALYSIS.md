# Combined C1 × C2 Analysis

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/combined-k-decision-output.txt`,
`evidence/combined-c1c2-output.txt`, `evidence/window-battery-output.txt`
**Categories:** `[PROOF]` · `[ENGINE]` · `[SIM]`

C1 and C2 are **not independent**. This document tests all **four combinations** and asks one question:
**does any single integrity constant remain robust under all plausible rule readings?**

---

## 1. The four combinations

| # | C1 (STATE_MULT) | C2 (pierce/exposed) | source of each reading |
|---|---|---|---|
| I | **engine** (§2/§4) | **1.0** (§1.3/§4) | engine + spec + tests (recommended) |
| II | engine | 1.6 (§2.2) | C2 alternative |
| III | **§1.2** (apply STATE_MULT) | 1.0 | C1 alternative |
| IV | §1.2 | 1.6 | both alternatives |

All four are run through the **same** parametric library (`lib9.ts`), which is `[ENGINE]`-verified
against the frozen engine for combination I (**906/906**, `fidelity9.ts`).

---

## 2. The decisive test: does a valid k exist?

For each combination, the state evolves **under each candidate k**, and we measure:
- **max beast-ignoring SLAIN %** — the worst trivial strategy across the battery, over N ∈ {25, 50, 200, 1000};
- **engaged-crowd (top5) SLAIN %** — the deliberate players.

A combination is **playable** iff some integer k has *both* (ignoring ≈ 0 %) **and** (top5 ≈ 100 %).

| Combination | smallest k closing the trivial path | engaged crowd at that k | **verdict** |
|---|---|---|---|
| **I — engine × 1.0** | **30** | **98.7 %** | **✅ PASS — unique k = 30** |
| II — engine × 1.6 | 37 | 0.7 % | ❌ no valid k |
| III — §1.2 × 1.0 | 29 | 0.0 % | ❌ no valid k |
| IV — §1.2 × 1.6 | 37 | 0.7 % | ❌ no valid k |

**Only combination I (the engine reading of both C1 and C2) admits any valid integrity constant, and
it is exactly k = 30.**

---

## 3. Why the three alternatives fail (the mechanism)

### C1 = §1.2 (combinations III, IV): the escape death-spiral

Applying `STATE_MULT` makes **hardening lower the ceiling** (C1 doc §4–5). The spec's §3.7 escape
penalty **adds armour** on every escape. Result: a failed day makes the next day *harder*, so the sub
locks into permanent escape. The engaged crowd's ceiling collapses below the trivial rules' at small N:

| N | §1.2 max ignoring | §1.2 engaged crowd | comment |
|---|---|---|---|
| 10 | 27.4 | 24.7 | **trivial play beats deliberate play** |

At k ≤ 28 the trivial rules still win 100 %; at k ≥ 29 the engaged crowd collapses to 0 %. **There is
no k that separates them.**

### C2 = 1.6 (combinations II, IV): the scale shift with no separation

`pierce`-vs-exposed = 1.6 lifts **every** strategy's damage by ~36 % (C2 doc §5), including
beast-ignoring ones. So the whole window shifts up but **does not open**: at k ≤ 33 the trivial rules
still win 100 %; at k ≥ 34 the engaged crowd collapses to ~0 %. **There is no k that separates them.**

---

## 4. The full matrix: is k robust across combinations?

| k | I engine×1.0 | II engine×1.6 | III §1.2×1.0 | IV §1.2×1.6 |
|---|---|---|---|---|
| 27 | too easy | too easy | too easy | too easy |
| 29 | too easy | too easy | too hard | too easy |
| **30** | **PASS** | too easy | too hard | too easy |
| 31 | too hard | too easy | too hard | too easy |
| 34 | too hard | fail | too hard | fail |
| 37 | too hard | too hard | too hard | too hard |

**No single k passes more than one combination.** The constant is **entirely dependent on the C1/C2
resolution**. There is no "robust across interpretations" answer — which is exactly why C1 and C2 must
be **decided before** the constant.

---

## 5. Individual and shared payoffs under each combination `[SIM]`

Steady per-player, N = 200, state evolves, sqrt integrity (so the *ceiling* is what is compared):

| strategy | I | II | III | IV |
|---|---|---|---|---|
| herd (obvious) | 24.0 | 24.0 | 19.2 | 24.0 |
| even5 spread | 23.0 | 23.0 | 12.8 | 12.8 |
| top5 (beast-read) | 29.7 | 33.0 | 24.7 | 28.3 |
| **gap (top5 − best ignoring)** | **+1.7** | **+3.0** | **+5.5** | **+4.3** |

- Under **I** the *absolute* ceiling is highest for the engaged crowd but the *gap* is modest, because
  the beast-ignoring spreads are already near the ceiling.
- Under **III/IV** the gap *looks* larger, but the ceiling is **falling with hardening** (the spiral):
  the "gap" is against a collapsing baseline, not a healthy one.

**Reading the gap alone is misleading.** The correct test is whether a *stable* k exists — and only I
has one.

---

## 6. Long-term stability

| Combination | multi-day behaviour |
|---|---|
| I (engine × 1.0) | ceiling rises as the beast hardens (self-correcting); a stable attractor exists |
| II (engine × 1.6) | stable attractor, but **no k** separates trivial from deliberate play |
| III (§1.2 × 1.0) | **escape death-spiral**; the sub can lock into permanent escape |
| IV (§1.2 × 1.6) | death-spiral **and** no separating k |

---

## 7. Conclusion

1. **C1 and C2 are jointly load-bearing.** The integrity constant depends on both.
2. **Only the engine reading of both (I) is balanced** — it is the only combination with a valid k,
   and that k is **30**.
3. **Averaging incompatible readings is not legitimate** and is not done here: III and IV are not
   "slightly different", they are **structurally unplayable** (no valid k; C1 adds a death-spiral).
4. Therefore the recommendation is **sequential, not simultaneous**: **approve C1 = engine, C2 = 1.0
   first**, then **approve k = 30**.
