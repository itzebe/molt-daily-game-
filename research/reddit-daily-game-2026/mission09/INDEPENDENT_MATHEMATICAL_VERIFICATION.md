# Independent Mathematical Verification

**Mission 09 · MOLT · Date:** 2026-11-18
**Categories:** `[PROOF]` exact · `[ENGINE]` engine-verified · `[SIM]` seeded simulation

This document is the **independent check**: an adversarial attempt to *falsify* Mission 09's
conclusions. Each claim is stated, then tested by an independent method. Where a claim survived, the
test is given; where it did not, the claim is corrected.

---

## 1. Fidelity: does the parametric model equal the frozen engine? `[ENGINE]`

**Claim:** `lib9.ts` with the engine reading reproduces the frozen engine exactly.

**Method:** `fidelity9.ts` compares, over the **full input space**:

| comparison | count | result |
|---|---|---|
| `dmg` vs `damageFor` (all zones × tools × states × 10 share bands) | 450 | **450 pass** |
| fatigue + ridge variants | 90 | pass (included above) |
| `integritySqrt` vs `integrityFor` | 11 | **11 pass** |
| `resolveDay9` vs `resolveDay` (random states + crowds) | 400 | **400 pass** |
| **TOTAL** | **906** | **906 pass, 0 fail** |

**Verdict: confirmed.** Every "engine reading" number in Mission 09 is engine-verified, not claimed.
The Reading-B (§1.2) numbers come from the *same* verified library with one flag flipped, so they are
the exact arithmetic consequence of §1.2.

---

## 2. Reproduction of Mission 08 `[SIM]`

**Claim:** Mission 08's headline numbers are correct.

| Mission 08 claim | Independently reproduced |
|---|---|
| max beast-ignoring ceiling ≈ 29.50 | **29.50** (zoneMajor15, N=22) |
| smallest defeating integer k | **30** |
| k=30 → 148/150 SLAIN | **148/150** |
| k=30.5 → 0/150 | **0/150** (cliff at 30.02) |
| beast-reader clears k=30 | **98.7 %** |

**Verdict: confirmed.** The battery reproduces the headline exactly.

---

## 3. The window: a methodological correction `[SIM]`

**Mission 08 claim (from `separation.ts`):** the feasible window is `[floor(maxIgnoring)+1, floor(minReading)]`,
with `maxIgnoring`/`minReading` measured **under the current √N formula**.

**Independent test:** this mixes two methods — it evolves the state under √N, then applies k. The
correct test evolves the state **under the candidate k** (the escape penalty depends on the outcome,
which depends on k).

**Finding:** the two methods give **different** answers.

| method | k=30 SLAIN (engaged crowd) | verdict on k=30 |
|---|---|---|
| Method A (state under √N) | ~0 % | k=30 looks **too hard** |
| **Method B (state under k=30)** | **98.7 %** | **k=30 PASSES** |

**Verdict: Mission 08's window method is biased pessimistic for large k.** The **SLAIN-rate test
(Method B) is the correct one** and is what Mission 09 uses. This is a **correction to the method**, not
to Mission 08's core finding (that k=30 is the smallest integer defeating the even spread, which is a
static-ceiling fact and stands).

**Honest consequence:** the "window" framing (`[k_min, k_max]`) is fragile to battery composition; the
**SLAIN-rate decision table is the robust artefact.** Mission 09 relies on the latter.

---

## 4. Is k = 30 really unique? `[SIM]`

**Claim:** k = 30 is the unique integer meeting both criteria.

**Independent test:** for every integer k in 26–37, measure (a) the max SLAIN % over the 15-rule
beast-ignoring battery and (b) the engaged-crowd SLAIN %, across N ∈ {25,50,200,1000}.

| k | max ignoring SLAIN | engaged SLAIN | verdict |
|---|---|---|---|
| 28 | 100 % | 100 % | too easy |
| 29 | 50 % | 99.3 % | too easy |
| **30** | **0.7 %** | **98.7 %** | **PASS** |
| 31 | 0 % | 0 % | too hard |

**Verdict: confirmed.** Only k = 30 has both (ignoring < 5 %) and (engaged > 90 %). The 31→0 %
collapse is the cliff.

---

## 5. Falsification attempt: is there a beast-ignoring rule that clears k = 30? `[SIM]`

**Adversarial goal:** find *any* rule that does not read the beast state and clears k = 30.

**Method:** 15 rules (cycle15, zoneMajor15, toolMajor15, even5, all-cleve/pierce/burn, fixed-uniform,
fixed-crown-heavy, fixed-tail-heavy, staticTop5, staticTop8, fixedRandomAlloc, randomDaily,
herdObvious), 9 seeds, N ∈ {10…2000}, state evolving under k = 30.

**Result:** the **maximum** steady over all of them is **29.1** (randomDaily, N=200), i.e. **below 30**
at every N and seed. The nearest competitors (zoneMajor15, cycle15) reach ~28.5.

**Verdict: the claim survives.** No beast-ignoring rule reaches k = 30.

**Caveat (honest):** `randomDaily` reaches 29.1 at N=200 — within 0.9 of k=30. A future rules tweak
could close that gap. k=30's margin over the *best* ignoring rule is **0.9**, not large.

---

## 6. Falsification attempt: does the selfish equilibrium defeat k = 30? `[SIM]`

**Adversarial goal:** show that self-interested play (iterated best response) breaks the design.

**Result:** the equilibrium reaches **33.8** > 30, so it **clears** the goal. But it does not *break* the
design — it is a legitimate crowd-reading strategy (spreading to low-share combos) and it **contributes
to** the shared goal.

**Verdict: the claim (that k=30 is reachable) is strengthened, not falsified.** The equilibrium is the
upper end of legitimate play.

---

## 7. Falsification attempt: is the cliff real or a simulation artefact? `[SIM]`

**Adversarial goal:** show the "cliff" is noise.

**Method:** fine k sweep (29.8 → 30.5) over 9 seeds; per-seed breakdown at k=30; day-by-day trace.

**Result:**
- The transition is **98.7 % → 0 % between k = 30.00 and k = 30.02** — far sharper than seed noise.
- At k = 30, **every one of 9 seeds** gives exactly 148/150 — **deterministic**, not noisy.
- The day-by-day trace shows the mechanism: the state tips into a **high-damage attractor** (k=30) or a
  **low-damage attractor** (k=30.02) on **day 3**.

**Verdict: the cliff is real and deterministic.** It is a **bistable lock-in**, not a noise artefact.
This is the most important honest finding of Mission 09.

---

## 8. Falsification attempt: is the C1 death-spiral claim real? `[PROOF]` `[SIM]`

**Adversarial goal:** show Reading B (§1.2) does *not* create a death spiral.

**Method:** exact DP of the ceiling as armour accumulates, under both readings.

| # armoured zones | A (engine) ceiling | B (§1.2) ceiling |
|---|---|---|
| 0 | 34.79 | 34.79 |
| 1 | 39.98 ↑ | 32.11 ↓ |
| 3 | 45.60 ↑ | 27.74 ↓ |
| 5 | 47.23 ↑ | 25.95 ↓ |

**Verdict: the claim survives.** Under B, hardening **monotonically lowers** the ceiling while the §3.7
escape penalty **adds** armour — a positive feedback loop. Under A, hardening raises it (self-correcting).

---

## 9. Summary of verification

| # | Claim | Method | Result |
|---|---|---|---|
| 1 | lib9 == frozen engine | 906 checks | **confirmed** |
| 2 | Mission 08 headlines | reproduction | **confirmed** |
| 3 | Mission 08 window method | independent re-test | **corrected** (Method B) |
| 4 | k = 30 unique | integer sweep | **confirmed** |
| 5 | no ignoring rule clears k=30 | 15-rule battery | **confirmed** (margin 0.9) |
| 6 | equilibrium defeats k=30? | equilibrium run | **not falsified** (clears, legitimately) |
| 7 | cliff real? | fine sweep + trace | **confirmed** (deterministic, bistable) |
| 8 | C1 death-spiral | DP ceiling vs armour | **confirmed** |

**Net:** one methodological correction (window → SLAIN-rate), everything else confirmed. The two
honest caveats are the **0.9 margin** over the best ignoring rule and the **+0.02 cliff margin**.

---

## 10. What could NOT be verified

- **Real human behaviour** (engagement, comprehension, enjoyment) — requires the playtest.
- **Whether the current √N "liveness" is intended** — not stated in any document; inferred from §3.7.
- **Long-run attractor stability beyond 150 days** — modelled to 150 days only; a longer horizon is
  possible future work but unlikely to change the day-3 tipping point.
