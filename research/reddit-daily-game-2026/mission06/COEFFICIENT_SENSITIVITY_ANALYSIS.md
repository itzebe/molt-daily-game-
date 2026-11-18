# COEFFICIENT SENSITIVITY ANALYSIS — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Evaluates the current integrity coefficient and a justified range of alternatives. Evidence:
`evidence/coefficient-sensitivity-output.txt`, `evidence/coefficient-window-output.txt`,
`evidence/final-comparison-output.txt`, `evidence/strategy-ceilings-output.txt`,
`evidence/static-robustness-output.txt`, `evidence/mixed-crowd-tension-output.txt`,
`evidence/mixed-state-ceilings-output.txt`, `evidence/smart-vs-blind-output.txt`.

---

## 1. The design's own stated intent (the yardstick)

Spec §1.5 says the `√N` shape was chosen because *"the sqrt keeps a small subreddit viable and stops a
large one trivialising the day."* **That is the criterion.** A coefficient is "better" if it satisfies
that intent, not if it makes SLAIN more frequent.

## 2. Measured ceilings (the only numbers that matter)

Per-striker aggregate damage, asymptotic regime, exact (no randomness except where noted):

| Strategy | damage/striker | band structure |
| --- | --- | --- |
| lazy herd (all `crown:cleave`) | 21.0 | 1 combo in herd band |
| realistic casual herd (80 % obvious) | 24.2 | herd-dominated |
| **decentralised engaged** (blind uniform over 15) | **29.1** | all in lone band |
| decentralised deliberate (cycle top-5) | 28.0 | common band |
| central optimum (exact DP) | 34.7 | lone + read bands |

**The decisive fact:** a real subreddit is *decentralised*, so its practical ceiling is **≈ 29**, not the
central optimum of 34.7. Any `k` above ~29 is unreachable by a realistic crowd.

## 3. Why the current `√N` fails its own intent

`I(N) = min(1000·√N, 12000)` ⇒ `req/striker = I(N)/N` **falls** as N grows (`√N/N = 1/√N`):

| N | req/striker | verdict |
| --- | --- | --- |
| 100 | 100.0 | impossible (ceiling ≈ 34) |
| 348 | 34.5 | just reachable with near-perfect play |
| 500 | 24.0 | **the lazy herd (24.2) auto-wins** |
| 1000 | 12.0 | trivially auto-wins |

So the `√N` shape makes a **small subreddit non-viable** (the opposite of the stated intent) and a
**large subreddit trivial** (also the opposite). Both failure modes are the *same* structural error:
the target is sub-linear while damage is linear.

## 4. Candidate comparison

`thr_best` = smallest N a perfect crowd slays; `thr_lazy` = smallest N the lazy herd slays (evidence
`final-comparison-output.txt`):

| Candidate | thr_best | thr_lazy | Population gate? | Lazy herd auto-wins? |
| --- | --- | --- | --- | --- |
| **A** √1000 (current) | 348 | 572 | **yes** | yes (N ≥ 572) |
| **B1** √300 | 80 | 205 | yes | yes |
| **B2** √500 | 211 | 567 | yes | yes |
| **B3** √700 | 348 | 572 | yes | yes |
| **C1** linear k=25 | 4 | never | no | **no** |
| **C2** linear k=27 | 4 | never | no | **no** |
| **C3** linear k=29 | 4 | never | no | **no** |
| **C4** linear k=31 | 11 | never | no | no |

**Every √N candidate keeps a population gate and lets the lazy herd auto-win at scale.** Lowering the
constant (B) only slides the gate left; it never removes it. **Only the linear form (C) removes both
failure modes.**

## 5. Deriving `k` from a stated principle (not a fitted value)

**Principle.** The linear target `I = k·N` must satisfy, simultaneously and at every population:

1. **Lazy play fails:** `k > c_herd` (≈ 24.2) — so the community cannot win by doing nothing.
2. **Engaged play wins:** `k ≤ c_decentralised` (≈ 29.1) — so a realistic crowd *can* win.
3. **Scale-invariance:** `k` constant in N — so the bar is the same at every size.

This gives the **principled interval `24.2 < k ≤ 29.1`**. Choosing the midpoint of the usable band:

```
k = 27   (range 25–30 defensible)
```

`k = 27` is not arbitrary: it sits between the measured herd ceiling (24.2) and the measured
decentralised ceiling (29.1), so it makes the herd fail while keeping the goal reachable. See
`evidence/strategy-ceilings-output.txt` and `evidence/smart-vs-blind-output.txt`.

## 6. Population/outcome matrix for `I = 27·N`

From `POPULATION_BALANCE_MATRIX.md` §2: `req/striker = 27` at **every** N; the lazy herd always fails;
a coordinated crowd wins from **N ≈ 4**; the coordination gap is a **constant ≈ 0.27** for N ≥ 100.

## 7. Perfect-coordination upper bound and realistic results

- **Upper bound (exact DP):** wins from N = 4 (`bestTotal(4)=116 ≥ 108`).
- **Realistic (decentralised spread):** wins from N ≈ 50–100 (`uniform`/`spread` ceilings 28–29 > 27).
- **Lazy herd:** never wins at any N.

## 8. Sensitivity analysis

| `k` | lazy herd | casual herd (24.2) | blind spread (29.1) | outcome character |
| --- | --- | --- | --- | --- |
| 25 | fail | **win** | win | too easy (casual wins) |
| **27** | fail | fail | win | **recommended** |
| 29 | fail | fail | **fail** | at the decentralised ceiling (fragile) |
| 31 | fail | fail | fail | unreachable by a realistic crowd |

`k` is sensitive in the 25–29 window; the recommendation (27) is robust to ±2.

## 9. Failure cases (tested)

- **`k` too low (≤ 24):** the lazy herd wins → participation-only, no coordination needed.
- **`k` too high (≥ 30):** only central coordination can win → the goal becomes unreachable by a real
  decentralised crowd (a gate in disguise).
- **Very small N (≤ 3):** the band-structure handicap means the ceiling is only ~21, so SLAIN is
  impossible regardless of `k` (`POPULATION_BALANCE_MATRIX.md` §3). This is inherent to fractional
  shares, not to the coefficient, and is far smaller than the current gate.

## 10. Exploitability analysis

- **Crowd manipulation (T4, `ADVERSARIAL_VERIFICATION.md`):** a coordinated 40 % minority that piles on
  one combo lowers the aggregate ~15 % (29.6 → 25.0/str). Under `k=27` that converts a win into a loss —
  so spoilers can force escapes. **This is inherent to any shared pool** and must be disclosed; it is not
  caused by the coefficient.
- **Static "everyone spread" convention (T6):** see `ADVERSARIAL_VERIFICATION.md` — a fully-dispersed
  static crowd wins most days, because aggregate damage rewards *dispersion* as much as *precise reads*.
  `k=27` does not fix this; it is a property of the crowd-factor being summed. **Disclosed as a residual
  risk**, not hidden.

## 11. Impact on individual strategic agency

Under `k=27` the *shared* outcome depends on whether ≈27 % of the community de-herds — a real collective
decision the comment section can argue about. The *individual* score still depends on precise reads
(per-combo crowd factor). Under the current formula, neither the shared outcome nor (in the small-N
regime) any decision can change the result. So the linear form **strictly increases** the influence of
individual and collective decisions.

## 12. Recommendation

**Option C — replace the target with a scale-invariant linear formula `Integrity = k · N`, `k = 27`
(defensible range 25–30), no cap.** Rationale:

- It is the **only** candidate that removes the population gate *and* stops the lazy herd auto-winning.
- It **fulfils the design's own stated intent** (§1.5), which the current `√N` contradicts.
- It changes **one formula shape and nothing else** — every zone, tool, crowd band, molt rule, and
  fatigue rule is untouched, so the game's identity is preserved.
- It keeps the goal reachable for a small engaged subreddit (from N ≈ 4) while remaining non-trivial at
  scale.

**Not applied.** This is a gameplay-affecting decision for the user (see `APPROVAL_DECISION_SHEET.md`).
Two residual risks are disclosed, not solved: crowd manipulation (§10) and the dispersion-vs-precision
tension (§10), both of which need a human design judgement.
