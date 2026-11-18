# K27 / K29 / K30 Comparison

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/k-decision-output.txt`,
`evidence/revalidation-output.txt`, `evidence/failure-cliff-output.txt`
**Categories:** `[PROOF]` · `[SIM]`

The constant selection is judged against the seven criteria the mission set. This document scores each
candidate honestly against them.

---

## 1. The candidates

| | formula |
|---|---|
| current | `min(1000·√N, 12000)` |
| k = 27 | `27·N` |
| k = 29 | `29·N` |
| k = 30 | `30·N` |

All are evaluated **dynamically** (state evolves under the candidate), engine rules.

---

## 2. The seven criteria

1. Close the trivial beast-ignoring path.
2. Avoid making the beast effectively impossible for ordinary communities.
3. Preserve individual strategic rewards.
4. Avoid excessive turnout dependency.
5. Work across population sizes.
6. Avoid a narrow failure cliff.
7. Preserve the daily excitement.

---

## 3. Scorecard

| Criterion | current √N | k = 27 | k = 29 | k = 30 |
|---|---|---|---|---|
| 1. Closes trivial path | **NO** (everyone clears at N≥1000) | **NO** (50–100 %) | **NO** (50 % at N=25) | **YES** (0.7 %) |
| 2. Not impossible | YES | YES | YES | YES (98.7 % engaged) |
| 3. Individual rewards | YES | YES | YES | YES (+171 % deviator) |
| 4. Turnout dependency | low | low | moderate | **moderate-high** |
| 5. Works across N | YES (but trivially) | YES | fails tiny N | **YES** |
| 6. Not a narrow cliff | n/a (no cliff) | n/a | **+1.02** | **+0.02** |
| 7. Daily excitement | **low** (auto-win) | **low** (auto-win) | medium | **high** |
| **meets criterion 1?** | ❌ | ❌ | ❌ | ✅ |
| **meets criterion 6?** | — | — | ✅ | ❌ |

**No candidate meets all seven.** k = 30 meets the *decisive* criterion (1) and fails the *risk*
criterion (6). k = 29 is the mirror image.

---

## 4. The numeric evidence

### 4.1 Trivial path (criterion 1) `[SIM]`

Max SLAIN % over the 15-rule beast-ignoring battery, all N, 9 seeds:

| k | max ignoring SLAIN % |
|---|---|
| 27 | 100 % |
| 28 | 100 % |
| 29 | 50 % |
| **30** | **0.7 %** |
| 31 | 0 % |

### 4.2 Achievability (criterion 2) `[SIM]`

Engaged crowd (top5) SLAIN %:

| k | engaged SLAIN % |
|---|---|
| 29 | 99.3 % |
| **30** | **98.7 %** |
| 31 | 0 % |

### 4.3 Cliff (criterion 6) `[SIM]`

Cliff between k = 30.00 and k = 30.02. Margin: k = 29 → +1.02; k = 30 → +0.02.

### 4.4 Turnout (criterion 4) `[SIM]`

A 50 %-engaged crowd clears **no** k ≥ 28 (0/150). The goal needs a **majority-engaged** crowd for
both 29 and 30; 30 needs slightly more.

---

## 5. Verdict per candidate

- **current √N — reject.** The shared goal is cosmetic at scale: at N = 1000 even the lazy herd clears
  100 %. It fails criterion 1 outright.
- **k = 27 — reject.** Refuted (Mission 08) and re-refuted here: the trivial path is wide open.
- **k = 29 — the safe alternative.** Meets criteria 2–7 but **fails criterion 1** (the even spread
  clears it at N ≤ 25; 50 % SLAIN). Acceptable **only** if the design owner accepts a small-population
  trivial gap in exchange for cliff margin.
- **k = 30 — recommended.** The **only** candidate that closes the trivial path at every N while
  remaining reachable (98.7 %). Its weakness is the **+0.02 cliff margin**.

---

## 6. Recommendation

> **Recommend k = 30** (unique solution to criterion 1) **with k = 29 documented as the fallback**,
> **and reject k = 27 and the current √N formula.** Because k = 30's cliff margin is thin, the
> **human playtest is the gate**: if a real crowd cannot clear the first days at k = 30, fall back to
> k = 29 (accepting the tiny-N gap) or introduce a recovery valve (a gameplay change, out of scope).
