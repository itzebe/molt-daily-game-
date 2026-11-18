# T6 Independent Reproduction

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · **Engine:** frozen `mission04/prototype` @ commit `410b3ba` (HEAD `4b41b86`)
**Evidence categories:** [PROOF] exact arithmetic · [ENGINE] verified against the frozen engine · [SIM] seeded simulation

---

## 0. Verdict up front

**T6 is CONFIRMED but MIS-SCOPED.**

Mission 06 measured T6 on the **shared pool** (aggregate damage ÷ N) and concluded that
"blind dispersion performs almost as well as deliberate prediction". That is **true for the
shared pool** and reproduced here exactly.

But MOLT scores the **individual player**, and on that axis the conclusion **inverts**:
blind dispersion is *not* a strong strategy — it is **exploitable**, and self-interested play
converges to a level **~17% above** it. The gap T6 describes is a **shared-goal** gap, not an
**individual-skill** gap.

| Claim | Status |
|---|---|
| Blind dispersion ≈ deliberate spread at the aggregate | **CONFIRMED** [ENGINE] |
| Blind dispersion is a *dominant individual strategy* | **REFUTED** [PROOF] |
| Crowd-reading is unrewarded | **REFUTED** [PROOF] |
| The shared goal can be met by a trivial rule under `k=27` | **CONFIRMED** [ENGINE] |

---

## 1. Baseline verification (executed, not assumed)

| Check | Command | Result |
|---|---|---|
| HEAD | `git rev-parse HEAD` | `4b41b86ce29038d4dac93e5467ed010c47c514c6` |
| Branch / remote | `git rev-parse --abbrev-ref HEAD` / `git remote -v` | `master`; **no remote** |
| Worktree | `git status --short` | clean except git-ignored `.openhands/` |
| Mission 04 evidence | `sha256sum -c evidence/SHA256SUMS.txt` | **47/47 OK** |
| Mission 05 evidence | `sha256sum -c SHA256SUMS.txt` | **35/35 OK** |
| Mission 06 evidence | `sha256sum -c SHA256SUMS.txt` | **49/49 OK** |
| Prototype unchanged | `git diff --stat 410b3ba -- mission04/prototype/` | **empty** |
| Prototype tests | `npm test` | **42/42 pass** |
| Mission 07 model fidelity | `fidelity7.ts` | **5325/5325 pass** |

Mission 07's analysis library (`analysis/lib7.ts`) reproduces the engine **exactly**: 5000/5000
`damageFor` checks, 320/320 `resolveDay` totals, 5/5 `integrityFor`. Every result below is
therefore engine-faithful. See `evidence/fidelity7-output.txt`.

---

## 2. Aggregate reproduction (matches Mission 06)

`analysis/t6-reproduction.ts`, Part 1 — exact, no seed. Damage/player by strategy, genesis beast:

| N | herd | top5 | rightTool | blindUnif | equilibrium | optimal |
|--:|--:|--:|--:|--:|--:|--:|
| 100 | 21.00 | 28.00 | 24.00 | 29.41 | 33.72 | 33.72 |
| 1000 | 21.00 | 28.00 | 24.00 | **29.10** | 34.13 | 34.66 |

**Cross-check vs Mission 06 (N=1000):** herd 21.00 ✓, blind **29.08 ≈ 29.10** ✓, top5 28.00 ✓,
optimal 34.66 ✓. Mission 06's headline numbers are **reproduced exactly** (the 0.02 delta is
Mission 06's simulation mean vs Mission 07's exact value). [ENGINE]

**So T6 is real at this level:** a trivial rule ("spread across all 15 combos") yields 29.1,
versus 21.0 for the lazy herd. The shared pool *does* reward dispersion.

---

## 3. The individual axis — T6 inverts here

### 3.1 Blind dispersion is NOT an equilibrium [PROOF]

`t6-reproduction.ts`, Part 2. Under a fixed N, a unilateral deviation keeps N constant: a player
on combo `i` scores `damageFor(i, counts[i]/N)` and can move to `j` for
`damageFor(j, (counts[j]+1)/N)`. Pure-Nash test: no occupied combo's player wants to move.

| N | strategy | crowd mean | best single move | gain | Nash? |
|--:|--|--:|--:|--:|:--:|
| 1000 | herd | 21.00 | 57.00 | **+36.00** | no |
| 1000 | top5 | 28.00 | 46.00 | **+22.00** | no |
| 1000 | **blindUnif** | 29.10 | 42.00 | **+29.00** | **no** |
| 1000 | equilibrium | 34.13 | 30.00 | 0.00 | **YES** |
| 1000 | optimal (DP) | 34.66 | 30.00 | +5.00 | no |

**A single player who reads the crowd beats blind dispersion by ~29 damage — a ~100% premium.**
Blind dispersion is a *sitting duck*, not a dominant strategy.

### 3.2 Self-interested play climbs ABOVE dispersion [PROOF/SIM]

`t6-reproduction.ts` Part 2b and `depth-tournament.ts` Part 2 — iterated best-response from a
random start:

| N | fixed point (agg/player) | read-band players | Nash? |
|--:|--:|--:|:--:|
| 50 | 32.36 | 4.0% | YES |
| 200 | 33.95 | 5.0% | YES |
| 1000 | 34.13 | 5.8% | YES |

Self-interested players converge to **~34.1**, **+17% above** blind dispersion (29.1) and **+63%
above** the herd (21.0). The fixed point is a **non-trivial mix** (not one combo, not uniform),
with ~6% of players in the highest crowd-factor band ("read").

### 3.3 Genuine prediction is richly rewarded [PROOF]

`predictability-sweep.ts` — a single probe against a fixed crowd of N (herd fraction p):

| crowd p(herd) | N | random | herd | blindDispersion | L1 (BR-uniform) | **perfectPredictor** |
|--:|--:|--:|--:|--:|--:|--:|
| 0.95 | 1000 | 34.0 | 21.0 | 37.9 | 21.0 | **57.0** |
| 0.80 | 1000 | 34.0 | 21.0 | 37.9 | 21.0 | **57.0** |
| 0.50 | 1000 | 27.5 | 21.0 | 31.6 | 21.0 | **50.7** |
| 0.00 | 1000 | 25.0 | 42.0 | 29.9 | 42.0 | 42.0 |

A player who **correctly predicts the crowd** scores **57.0 vs 37.9** for blind dispersion — a
**50% premium**. Prediction is decisively rewarded when the crowd is readable. [PROOF]

---

## 4. So what IS T6?

T6 is **real but about the wrong thing**. Two distinct facts were conflated:

1. **Shared-pool fact [ENGINE]:** the shared total is maximised by *dispersion*, because
   `crowdFactor(share)` is concave and the pool **sums** per-player damage. A trivial spread rule
   reaches 29.1/player. Under `Integrity = 27N`, this **wins the day** — so the shared goal is
   reachable without skill.
2. **Individual fact [PROOF]:** the *individual* score is maximised by *reading* the crowd. Blind
   dispersion is exploitable and converges below the equilibrium (29.1 → 34.1).

**These are not in conflict.** MOLT is a **two-axis** game:
- **Individual axis:** reading the crowd is rewarded. *Depth exists.*
- **Shared axis:** the pool rewards spreading. *T6 lives here.*

Mission 06's implicit model assumed that a strategy good for the shared pool is good for the
player. It is not — the shared pool is a **public good**, and free-riding (reading the crowd while
others spread) is individually optimal. This is a **coordination problem**, which is exactly the
kind of thing that generates Reddit discussion ("the beast is 300 short — stop spreading!").

---

## 5. Reproduction instructions

```bash
cd research/reddit-daily-game-2026/mission07
node --experimental-strip-types analysis/fidelity7.ts        # 5325/5325
node --experimental-strip-types analysis/t6-reproduction.ts  # Parts 1-3
node --experimental-strip-types analysis/predictability-sweep.ts
node --experimental-strip-types analysis/depth-tournament.ts
```
All deterministic except the disclosed seeds. Raw outputs in `evidence/*-output.txt`.

---

## 6. Confidence and open questions

- **[PROOF] high confidence:** dispersion is exploitable; the equilibrium sits above it; a
  perfect predictor scores ~50% above dispersion. These are exact computations.
- **[ENGINE] high confidence:** the aggregate numbers match Mission 06.
- **Open:** the equilibrium shape depends on the crowd-factor bands; a different banding could
  move the fixed point. Tested only on the genesis beast (all-exposed); armour/raw states shift
  the *levels* but not the *structure* (see `POPULATION_SCALING_REASSESSMENT.md`).
- **Open:** none of this proves MOLT is *fun*. It proves it is *not strategically shallow*.
