# Dynamic Integrity Revalidation

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/revalidation-output.txt`,
`evidence/k-decision-output.txt`, `evidence/combined-k-decision-output.txt`
**Categories:** `[PROOF]` · `[ENGINE]` · `[SIM]`

Mission 08's numbers are **reproduced here**, not assumed. Then the window is re-derived with a wider
seed set, a finer population grid, turnout variation, and a precise cliff location — always with the
state **evolving under the candidate k** (the correct method).

---

## 1. Reproduction of Mission 08 `[SIM]`

| Mission 08 claim | Reproduced | Status |
|---|---|---|
| max beast-ignoring (even-spread) steady ≈ 29.50 at tiny N | **29.50** at N=22 (zoneMajor15) | ✅ exact |
| smallest integer k defeating every even-spread | **30** | ✅ |
| k=30 → 148/150 SLAIN | **148/150** | ✅ |
| k=30.5 → 0/150 SLAIN | **0/150** (cliff between 30.25 and 30.5) | ✅ |
| beast-reading (top5) clears at k=30 | **98.7 %** across N | ✅ |

**The battery in `battery.ts` reproduces Mission 08's headline exactly** (29.50 → smallest k 30),
which validates the shared battery used throughout Mission 09.

---

## 2. Beast-ignoring battery, wide seeds and fine N `[SIM]`

15 beast-ignoring rules × N ∈ {10,12,…,2000} × 9 seeds. **GLOBAL MAX steady = 29.50 (N=22).**
Key rows (max over 9 seeds):

| N | cycle15 | zoneMajor | uniform-agnostic | randomDaily | herd | max |
|---|---|---|---|---|---|---|
| 22 | 26.9 | **29.50** | 28.2 | 27.5 | 24.0 | **29.50** |
| 25 | 28.4 | 29.16 | 28.2 | 26.6 | 24.0 | 29.16 |
| 50 | 28.5 | 28.5 | 28.2 | 26.5 | 24.0 | 28.5 |
| 200 | 28.2 | 28.3 | 28.2 | 29.1 | 24.0 | 29.1 |
| 1000 | 27.6 | 28.2 | 28.2 | 27.5 | 24.0 | 28.2 |
| 2000 | 26.9 | 26.9 | 26.9 | 27.9 | 24.0 | 27.9 |

**The beast-ignoring ceiling is ~28–29.5 and roughly flat in N** (scale-invariance holds), with the
maximum at very small N where a single combo's crowd factor dominates.

---

## 3. The definitive k-decision `[SIM]`

The methodologically correct test (state evolves under each k; `k-decision.ts`), **9 seeds**:

| k | max beast-ignoring SLAIN % (all rules, all N) | engaged crowd (top5) SLAIN % (min N) | verdict |
|---|---|---|---|
| 27 | 100.0 % | 100.0 % | **too easy** (trivial path open) |
| 28 | 100.0 % | 100.0 % | **too easy** |
| 29 | 50.0 % | 99.3 % | **too easy** |
| **30** | **0.7 %** | **98.7 %** | **✅ PASS** |
| 31 | 0.0 % | 0.0 % | **too hard** |

**k = 30 is the unique integer** that (a) closes the trivial path to < 1 % SLAIN and (b) keeps the
engaged crowd winning ~99 %. k = 29 leaves the trivial path open (50 %); k = 31 makes the game
unwinnable by anyone.

---

## 4. Worst-case vs typical (reported separately, never averaged) `[SIM]`

| N | even5 (worst ignoring) | randomDaily (typical, mean / max) | top5 (engaged) |
|---|---|---|---|
| 50 | 23.00 | 24.63 / 26.46 | 29.70 |
| 200 | 23.00 | 28.09 / 29.13 | 29.70 |
| 1000 | 23.00 | 27.06 / 27.55 | 32.25 |

- **Typical** (randomDaily mean) is 24–28.
- **Worst-case** (even spread / best fixed rule) reaches ~29.5.
- **Engaged** (top5) is 29.7–32.3.

The constant must be set against the **worst-case** (29.5), not the typical — hence k ≥ 30.

---

## 5. Turnout variation `[SIM]`

A mixed crowd (50 % engaged top5 + 50 % lazy even5), N = 200:

| k | mixed-crowd steady | SLAIN |
|---|---|---|
| 28–31 | 23.80 | **0/150** |

**A half-hearted crowd (half lazy) never clears k ≥ 28.** This is a *real* finding: the shared goal
requires a **majority-engaged** crowd, not a plurality. It is also the strongest argument for the
human playtest — the model cannot tell us whether real players engage enough.

---

## 6. The failure cliff `[SIM]`

Engaged crowd (top5), N = 200, 9 seeds (1350 day-resolutions):

| k | SLAIN % |
|---|---|
| 29.0 | 99.3 % |
| 29.5 | 98.7 % |
| **30.0** | **98.7 %** |
| **30.1** | **0.0 %** |
| 30.5 | 0.0 % |
| 31.0 | 0.0 % |

**The cliff is between k = 30.0 and k = 30.1** — a razor-thin 0.1 window. This is **not** a smoothly
softening difficulty curve; it is a **bistable lock-in** (see `FAILURE_CLIFF_ANALYSIS.md`). k = 30 sits
**exactly at the edge**.

---

## 7. k = 29 vs k = 30 (the honest comparison)

| | k = 29 | k = 30 |
|---|---|---|
| Closes the trivial path? | **NO** (50 % SLAIN at N=25) | **YES** (0.7 %) |
| Engaged crowd clears? | 99.3 % | 98.7 % |
| Margin below the cliff (30.05) | **+1.05** | **+0.05** |
| Tiny-N gap | fails (even spread clears) | none |
| Turnout needed | lower | higher |

**k = 30 is the only k that meets criterion 1 (close the trivial path). k = 29 is the only k with a
comfortable margin below the cliff.** They fail *opposite* criteria — this is the true tension.

---

## 8. Verdict

- **k = 30 is the unique constant meeting the stated objective** (close the trivial path at every N)
  while remaining reachable by the engaged crowd.
- **Its failure cliff is a genuine risk** (margin ≈ 0.05). This is why the verdict is **CONDITIONAL**:
  the human playtest (does a real crowd engage enough to clear k=30?) is the tie-breaker.
- **k = 29 is the safe fallback** if the playtest shows casual crowds cannot sustain k = 30 — accepting
  that the trivial path is then open at tiny N.
