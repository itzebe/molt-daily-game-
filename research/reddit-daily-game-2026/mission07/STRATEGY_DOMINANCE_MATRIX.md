# Strategy Dominance Matrix

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · Evidence: `evidence/tournament-output.txt`, `evidence/predictability-sweep-output.txt`,
`evidence/depth-tournament-output.txt`, `evidence/t6-reproduction-output.txt`
**Categories:** [PROOF] exact · [ENGINE] frozen-engine verified · [SIM] seeded

---

## 0. The question

Does **strategic prediction** outperform **blind dispersion** across realistic population sizes?
And is any single strategy **dominant** (i.e. beats everything, so the game is shallow)?

---

## 1. The full strategy roster tested

| Strategy | What it does | Class |
|---|---|---|
| `random` | uniform random combo | baseline |
| `casualHerd` | 70% obvious zone, 30% random | casual |
| `alwaysCallObvious` / herd | always the obvious zone | lazy |
| `blindDispersion` | cycles all 15 combos (i mod 15) | **T6 trivial rule** |
| `top5Spread` | cycles the 5 highest-base combos | naive-spread |
| `rightTool` | best tool per zone, spread | naive-smart |
| `misleader` | piles onto a rotating zone | adversary |
| `contrarian` | highest-base combo least-hit yesterday | crowd-reading |
| `predictorUniform` | best-response to a uniform prior | crowd-reading (L1) |
| `predictorPersistence` | best-response to yesterday's shares | crowd-reading (L2) |
| `learnerEWMA` | best-response to an EWMA of shares | crowd-reading |
| `skilledReader` | high-base + least-attacked combo, predicts herd/molt | skilled |
| `perfectPredictor` | best-response to the *true* crowd | oracle |
| `equilibrium` | iterated best-response fixed point | self-interested |

---

## 2. Individual-axis results (the decisive axis) [SIM]/[PROOF]

### 2.1 Mixed tournament — mean daily damage/player

`tournament.ts`, mixed population, 60 days × 5 seeds, genesis beast:

| Rank | N=60 | N=200 | N=600 |
|--:|---|--:|---|
| 1 | top5Spread 31.09 | top5Spread 30.23 | top5Spread 30.39 |
| 2 | blindDispersion 28.92 | blindDispersion 28.27 | blindDispersion 28.82 |
| 3 | predictorUniform 27.38 | random 27.89 | random 28.67 |
| 4 | casualHerd 26.60 | casualHerd 27.61 | casualHerd 28.10 |
| 5 | random 25.54 | predictorUniform 27.53 | predictorUniform 27.83 |
| … | … | … | … |
| last | contrarian 22.27 | contrarian 22.38 | learnerEWMA 22.51 |

**Read carefully.** In a *mixed* crowd, `top5Spread`/`blindDispersion` rank high — but this does
**not** mean they are dominant. It means that when *everyone else is also spreading or herding*,
the spreaders collect the good crowd-factor bands. The naive "predictor" strategies in this
tournament (best-response to a **static** prior) rank low **because they collapse to the herd**
(all pick the obvious combo → 21.0), which is the "everyone predicts → self-defeating" trap
(`predictability-sweep.ts` §2).

### 2.2 The isolated probe — prediction vs dispersion [PROOF]

`predictability-sweep.ts`: a **single** player against a fixed crowd of N. This isolates the
value of reading, with no self-defeating feedback:

| crowd p(herd) | N | random | herd | blindDispersion | **perfectPredictor** | edge |
|--:|--:|--:|--:|--:|--:|--:|
| 0.95 | 1000 | 34.0 | 21.0 | 37.9 | **57.0** | **+19.1** |
| 0.80 | 1000 | 34.0 | 21.0 | 37.9 | **57.0** | **+19.1** |
| 0.50 | 1000 | 27.5 | 21.0 | 31.6 | **50.7** | **+19.1** |
| 0.00 | 1000 | 25.0 | 42.0 | 29.9 | 42.0 | +12.1 |

A correct reader scores **57 vs 37.9** for the spreader — a **50% premium**. **Prediction
decisively outperforms dispersion.**

### 2.3 Self-interested equilibrium [PROOF]

`depth-tournament.ts` / `t6-reproduction.ts`: iterated best-response converges to a stable
**non-trivial mix** at **~34.1/player** (N=1000), a **Nash equilibrium** (no profitable single
deviation; gain = 0). It sits **+17% above blind dispersion** (29.1) and **+63% above the herd**
(21.0). The equilibrium is **not** a single combo and **not** uniform — it is a genuine mixed
strategy with ~6% of players in the top crowd-factor band.

---

## 3. Dominance analysis — is any strategy dominant? [PROOF]

| Candidate | Beats all others? | Nash? | Verdict |
|---|:--:|:--:|---|
| herd / always-obvious | no (exploited +36) | no | dominated |
| blindDispersion | no (exploited +29) | no | **exploitable, not dominant** |
| top5Spread | no (exploited +22) | no | exploitable |
| static "predictor" | no (collapses to herd) | no | self-defeating |
| **equilibrium** | self-consistent, gain 0 | **YES** | **the target** |
| optimal DP | yes on the **shared** total | no | shared-goal optimum, not individual |

**No strategy is trivially dominant on the individual axis.** The equilibrium is a *mixed*
strategy, and it is **above** every trivial rule. This is the opposite of "a trivial distribution
rule wins". The trivial rules are **stepping stones that get punished** once a minority reads the
crowd.

---

## 4. Shared-axis results [ENGINE]

On the **shared** pool, the ordering inverts: dispersion (29.1) beats the herd (21.0), because
the pool **sums** damage and the crowd factor is concave in share. Under `k=27`, the trivial
dispersion rule clears the bar (`population-scaling.ts`). **This is the T6 defect, and it lives
only on the shared axis.** Under `k ≥ 30`, dispersion no longer clears the bar and the shared
goal becomes a skill goal.

---

## 5. Conclusion

1. **T6 (as an individual-skill claim) is refuted.** Blind dispersion is exploitable; the
   equilibrium is ~17% above it; a genuine reader gets a ~50% premium over dispersion.
2. **T6 (as a shared-goal claim) is confirmed.** The shared total rewards dispersion; under
   `k=27` a trivial rule wins the day. This is a **coefficient** problem, not a mechanic problem.
3. **No trivial dominant strategy exists** on the individual axis. MOLT is **not** shallow.
4. **The fix is not a new mechanic** (the forecast fails — see `PREDICTION_MECHANIC_SPEC.md`);
   it is **raising k** so the shared goal separates spreaders from readers.

---

## 6. Adversarial strategies and loopholes

| Adversary | Effect | Evidence |
|---|---|---|
| **Coordinated bloc chasing a herd-call bonus** | flips the "correct" herd zone at >50% | `forecast-reflexivity.ts` |
| **Minority piling to force an escape** | can push the shared outcome (T4, Mission 06) | Mission 06 |
| **Free-rider** (reads crowd while others spread) | individually optimal, raises own score, free-rides the shared goal | §2.2 |
| **Static "always spread" bot** | wins the shared goal under k≤29; **punished** individually | §2.3 |
| **Scoring loophole in a forecast bonus** | the "always obvious" constant captures any herd-call bonus | `prediction-experiments.ts` |

**The most dangerous exploit is the free-rider**, and it is *good* for the game: it is exactly
the tension that makes the shared goal a community problem (and generates discussion). Raising
`k` turns the free-rider's advantage into a shared-goal failure, which the community must
coordinate against — MOLT's intended drama.
