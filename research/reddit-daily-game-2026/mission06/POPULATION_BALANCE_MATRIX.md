# POPULATION BALANCE MATRIX — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Per-population analysis at the levels Mission 06 §3 requires. Two target formulas are compared:
the **current** `Integrity = min(1000·√N, 12000)` and the **recommended** linear `Integrity = 27·N`.
Evidence: `evidence/population-matrix-output.txt`, `evidence/coefficient-window-output.txt`.

---

## 1. Current formula — `I(N) = min(1000·√N, 12000)`

`coord-gap = (req − c_herd) / (c_best − c_herd)`, where `req = I(N)/N` is the required damage/striker,
`c_herd` is the casual-herd ceiling, `c_best` the optimal ceiling.
`coord-gap ≤ 0` ⇒ the herd suffices (no skill needed); `> 1` ⇒ impossible even with optimal play;
`0…1` ⇒ a real skill band exists.

| N | I(N) | req/striker | c_herd | c_best | coord-gap | SLAIN possible? | Realistic? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1000 | 1000.00 | 20.10 | 21.00 | 1088.8 | **No** | impossible |
| 4 | 2000 | 500.00 | 20.92 | 29.00 | 59.3 | **No** | impossible |
| 8 | 2828 | 353.55 | 20.86 | 29.00 | 40.9 | **No** | impossible |
| 12 | 3464 | 288.68 | 21.89 | 32.42 | 25.3 | **No** | impossible |
| 20 | 4472 | 223.61 | 22.05 | 30.45 | 24.0 | **No** | impossible |
| 50 | 7071 | 141.42 | 23.31 | 32.78 | 12.5 | **No** | impossible |
| 100 | 10000 | 100.00 | 23.45 | 33.72 | 7.45 | **No** | impossible |
| 250 | 12000 | 48.00 | 24.15 | 34.36 | 2.33 | **No** | impossible |
| 350 | 12000 | 34.29 | 24.22 | 34.48 | 0.98 | **Yes (near-perfect only)** | fragile |
| 500 | 12000 | 24.00 | 24.19 | 34.55 | −0.02 | **Yes** | herd suffices |
| 1000 | 12000 | 12.00 | 24.23 | 34.66 | −1.17 | **Yes** | trivial |

**Reading:** for N ≤ ~348 SLAIN is **impossible** (coord-gap > 1). At N = 350 it needs **near-perfect**
play (gap ≈ 0.98). At N ≥ 500 the **lazy herd** wins for free (gap ≤ 0). The outcome is a step function
of population, not of skill. This is the A5 finding in tabular form.

## 2. Recommended formula — `I(N) = 27·N` (linear, no cap)

| N | I(N) | req/striker | c_herd | c_best | coord-gap | herd80 | uniform | spread |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 27 | 27.00 | 20.10 | 21.00 | 7.67 | fail | fail | fail |
| 4 | 108 | 27.00 | 20.92 | 29.00 | 0.75 | fail | fail | **SLAIN** |
| 8 | 216 | 27.00 | 20.86 | 29.00 | 0.75 | fail | fail | **SLAIN** |
| 12 | 324 | 27.00 | 21.89 | 32.42 | 0.49 | fail | fail | **SLAIN** |
| 20 | 540 | 27.00 | 22.05 | 30.45 | 0.59 | fail | fail | **SLAIN** |
| 50 | 1350 | 27.00 | 23.31 | 32.78 | 0.39 | fail | fail | **SLAIN** |
| 100 | 2700 | 27.00 | 23.45 | 33.72 | 0.35 | fail | **SLAIN** | **SLAIN** |
| 250 | 6750 | 27.00 | 24.15 | 34.36 | 0.28 | fail | **SLAIN** | **SLAIN** |
| 350 | 9450 | 27.00 | 24.22 | 34.48 | 0.27 | fail | **SLAIN** | **SLAIN** |
| 500 | 13500 | 27.00 | 24.19 | 34.55 | 0.27 | fail | **SLAIN** | **SLAIN** |
| 1000 | 27000 | 27.00 | 24.23 | 34.66 | 0.27 | fail | **SLAIN** | **SLAIN** |

**Reading:** `req/striker = 27` is **constant** across N — the same bar at every size. The **lazy herd
always fails** (c_herd ≈ 24 < 27). A coordinated crowd wins from **N ≈ 4**. The coord-gap stabilises at
**≈ 0.27** for N ≥ 100 — a *fixed* effort requirement, independent of population.

## 3. The small-N band handicap (honest caveat)

The crowd factor is a **fraction** of N, so a lone striker (share `1/N`) only reaches the `read` band
(< 0.03) when **N > 33**. Consequences (`evidence/coefficient-window-output.txt`):

| N | c_best | c_herd | highest band reachable by a lone striker |
| --- | --- | --- | --- |
| 1–3 | 21.0 | ~20 | herd (0.7) — everyone piles, everyone is penalised |
| 4–33 | 29.0 | ~21 | common (1.0) |
| ≥ 34 | 33.9–34.9 | ~24 | read (1.9) |

So the ceiling rises with N up to ~34 and is then flat. This means a **very small** subreddit (N ≤ 3)
has a genuinely lower roof — a real, if minor, structural handicap that no coefficient choice removes
(it is inherent to fractional shares). It is **far smaller** than the current formula's gate (which
makes N ≤ 348 impossible regardless of play).

## 4. Minimum coordination required (current vs recommended)

`p_min` = fraction of the crowd that must play the anti-herd spread for SLAIN
(`evidence/coefficient-sensitivity-output.txt`):

| N | current sqrt(1000) | linear k=27 |
| --- | --- | --- |
| 50 | impossible (−) | 0.00–0.5 (≈0.1 at N=100) |
| 100 | impossible (−) | 0.50 |
| 250 | impossible (−) | 0.30 |
| 350 | impossible (−) | 0.28 |
| 500 | 0.20 | 0.26 |
| 1000 | 0.00 (herd wins) | 0.26 |

The current formula demands *either* an impossible crowd (small N) *or* nothing at all (large N). The
linear formula demands a **consistent ~26–30 %** of the crowd to read against the grain — a stable,
legible community target.

## 5. How much do individual decisions matter?

| Regime | Individual decision influence |
| --- | --- |
| Current, N < 348 | **None on the outcome** — the beast escapes regardless; only personal score moves |
| Current, N > 500 | **None on the outcome** — the beast is slain regardless |
| Recommended (any N) | **Material** — the outcome hinges on whether ~27 % of strikers deviate from the herd |

Only under the linear formula does the *shared* outcome depend on what the community chooses. Under the
current formula the shared outcome is decided by the head-count alone.
