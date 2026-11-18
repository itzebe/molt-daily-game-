# A5 MATHEMATICAL DERIVATION — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Independent derivation of the shared-victory (SLAIN) threshold. **Reproduced, not re-run** — this mission
re-derives the threshold from scratch with an **exact dynamic-programming optimum** (Mission 05 used a
hill-climber), and reaches the same answer. Every number is reproducible via `analysis/a5-derivation.ts`
(output: `evidence/a5-derivation-output.txt`).

---

## 1. The rules being modelled (from source, §BASELINE_VERIFICATION)

For a day with `N` distinct strikers, each submitting one `(zone, tool)`:

```
base(zone,tool)   = ZONE_VALUE[zone] × TOOL_MULT[tool][state[zone]]
share(zone,tool)  = count(zone,tool) / N
crowd(share)      = 0.7 if share ≥ 0.30 ; 1.0 if 0.10 ≤ share < 0.30 ;
                    1.4 if 0.03 ≤ share < 0.10 ; 1.9 if share < 0.03
dmg(submission)   = round( base(zone,tool) × crowd(share) )      [×0.8 if fatigued tool]
total_damage      = Σ dmg(submission)
Integrity(N)      = min(1000·√N, 12000)
outcome           = SLAIN if total_damage ≥ Integrity(N) else ESCAPED
```

## 2. The structural theorem (why a population gate is inevitable)

Let `d(N) = total_damage / N` be the mean damage per striker.

**Lemma 1 (damage is linear in N).** For any fixed *distribution over the 15 combos* (i.e. fixed
fractions `p_i` with `Σp_i = 1`), the share of each combo is `p_i` **independent of N**. Therefore each
striker's expected damage is a constant `c = Σ p_i · base_i · crowd(p_i)`, and

```
total_damage = N · c ,    so   d(N) = c   is INDEPENDENT of N.
```

**Lemma 2 (Integrity is sub-linear).** `Integrity(N) = 1000·√N` grows as `√N` (until the cap).

**Corollary (the gate).** SLAIN requires `N·c ≥ 1000·√N`, i.e.

```
√N ≥ 1000 / c    ⇔    N ≥ (1000/c)².
```

So for any achievable per-striker damage `c`, there is a **minimum population** `N_min = (1000/c)²`
below which SLAIN is **mathematically impossible**, and above which it is **automatic**. The outcome is
governed by `N`, not by the crowd's decisions. Mission 05's claim is therefore not an artefact — it is a
consequence of `Integrity ∝ √N` against `damage ∝ N`.

## 3. The achievable per-striker damage `c` (exact)

`c` is maximised by choosing the count distribution `{c_i}` over the 15 combos that maximises
`Σ c_i · dmg(combo_i, c_i/N)` subject to `Σ c_i = N`. This is solved **exactly** by dynamic programming
(`analysis/lib.ts:bestTotal`), and the model is proven identical to the engine (3520/3520 fidelity).

Measured asymptotic ceilings (`N=1000`, genesis beast, all zones exposed):

| Play | damage/striker `c` |
| --- | --- |
| lazy herd (`crown:cleave`, all) | 21.00 |
| casual herd (80 % obvious) | 24.23 |
| blind uniform random | 29.06 |
| deliberate spread (all 15, evenly) | 29.07 |
| **exact optimum (central coordination)** | **34.66** |

## 4. The exact threshold (reproduction of Mission 05's claim)

Scanning `N` upward, the smallest `N` with `bestTotal(N) ≥ Integrity(N)` is:

```
N = 348   (bestTotal(348) = 12018 ≥ 12000 = Integrity(348))
N = 347   (bestTotal(347) = 11993 <  12000)
```

**This independently reproduces Mission 05's "≈348 best-case" claim exactly.** Under realistic crowds
(mean of 200 trials, seed 424242+N):

| Crowd model | SLAIN threshold N |
| --- | --- |
| uniform random | 415 |
| 80 % herd | 495 |
| always-obvious | 572 |

These bracket Mission 05's "≈450–500 realistic" claim.

## 5. The population matrix (required levels)

`evidence/a5-derivation-output.txt`:

| N | Integrity | best DP | best/striker | uniform | herd80 | obvious | SLAIN? (best) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1000 | 21 | 21.00 | 15 | 20 | 21 | no |
| 4 | 2000 | 116 | 29.00 | 80 | 84 | 84 | no |
| 8 | 2828 | 232 | 29.00 | 161 | 167 | 168 | no |
| 12 | 3464 | 389 | 32.42 | 293 | 263 | 252 | no |
| 20 | 4472 | 609 | 30.45 | 462 | 441 | 420 | no |
| 50 | 7071 | 1639 | 32.78 | 1297 | 1165 | 1050 | no |
| 100 | 10000 | 3372 | 33.72 | 2740 | 2345 | 2100 | no |
| 250 | 12000 | 8591 | 34.36 | 7199 | 6037 | 5250 | no |
| 350 | 12000 | 12068 | 34.48 | 10135 | 8476 | 7350 | **yes** |
| 500 | 12000 | 17274 | 34.55 | 14512 | 12097 | 10500 | yes |
| 1000 | 12000 | 34659 | 34.66 | 29056 | 24228 | 21000 | yes |

## 6. Assumptions (explicit)

- **A-1** Genesis beast (all five zones `exposed`). Verified in §8 below that hardening does not lower
  the ceiling under the engine's formula (so genesis is representative, not favourable to a critique).
- **A-2** No tool fatigue and no ridges on the threshold day. Fatigue only *lowers* damage (0.8×), so
  ignoring it gives the crowd the **benefit of the doubt** — the true threshold can only be **higher**.
- **A-3** Mean-of-trials for stochastic crowd models; the exact optimum is deterministic.
- **A-4** "Distinct strikers" = distinct user ids (engine counts distinct userIds; verified in
  `mission05/evidence/environment-molt-test-output.txt`).

## 7. Which quantities are upper bounds vs realistic

- `bestTotal(N)` is an **upper bound** on *any* crowd: no real crowd can exceed the exact optimum. So
  "SLAIN impossible at N=250" is a **hard statement**, not a model choice.
- The realistic thresholds (415–572) are **model-dependent** (they assume particular crowd behaviour);
  they are reported as a range and labelled as such.

## 8. Robustness: does a hardened beast change the conclusion?

`evidence/recommended-coefficient-output.txt` (section 1). Under the **engine's** formula (no
`STATE_MULT`), as escapes add armour to the highest-value zones, the per-striker ceiling at N=2000
**rises** (34.79 → 47.23) because an armoured zone still yields ×1.6 with the right tool. So hardening
does **not** lower the ceiling and the gate stands. (Under the rejected `STATE_MULT` reading it *would*
fall 34.79 → 25.95 — a separate reason to keep the engine's reading; see `C1_STATE_MULT_ANALYSIS.md`.)

## 9. Conclusion

Mission 05's A5 finding is **confirmed and strengthened**:

- The best-case SLAIN threshold is **N = 348** (exact); realistic **415–572**.
- The cause is structural: `Integrity ∝ √N` while `damage ∝ N`. Any `Integrity = k·√N` keeps a
  population gate; the only way to remove it is to make the target **linear in N** (scale-invariant).
- Below the gate, the ESCAPED penalty fires **every** day, so the beast hardens monotonically and the
  shared goal is decorative — exactly the Mission 05 concern.

**This is a parameter-shape problem, not a mechanic problem.** See `COEFFICIENT_SENSITIVITY_ANALYSIS.md`
for the candidate that removes the gate while preserving every other rule.
