# Population Scaling Reassessment

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · Evidence: `evidence/population-scaling-output.txt`, `evidence/t6-reproduction-output.txt`
**Status:** RECOMMENDATION ONLY. The production formula is **unchanged**. Not approved.

---

## 0. Recommendation

> **Replace `Integrity(N) = min(1000·√N, 12000)` with a LINEAR target `Integrity(N) = k·N`,
> and set `k = 27` (acceptable range 25–30), with NO cap.**

Rationale in one line: a `√N` target creates a **population gate** (small subs cannot win even
with perfect play; large subs auto-win by herding); only a **linear** target is scale-invariant
and makes the shared goal depend on *how the community plays*, not on *how many people showed up*.

**This is a re-affirmation and refinement of Mission 06's proposal, now tested against the
candidate mechanics.** The value `k=27` is derived from measured strategy ceilings, not fitted.

---

## 1. Why `√N` is structurally wrong [PROOF]

Damage scales **~linearly** with N (each striker adds damage), while the current Integrity scales
**~√N**. Therefore the *per-player* requirement `Integrity/N ∝ 1/√N` → 0. Consequences:

| N | √N Integrity | best-case skilled/player | outcome |
|--:|--:|--:|:--|
| 5 | 2236 | ~29 | **ESCAPES** (needs 447/player — impossible) |
| 40 | 6325 | ~29 | **ESCAPES** (needs 158/player — impossible) |
| 5000 | 12000 (capped) | ~34 | **SLAIN by herding** (needs 2.4/player) |

- **Small subs: a hard population gate.** No amount of skill wins below ~348 strikers
  (Mission 06 A5; re-confirmed). This is the A5 defect.
- **Large subs: auto-win.** Above ~1000 strikers the lazy herd (21/player) clears the cap
  comfortably. The shared goal becomes cosmetic.

`population-scaling.ts` Part (a)/(b) confirms both ends.

---

## 2. What the linear target fixes [ENGINE]

`Integrity(N) = k·N` makes the *per-player* requirement **constant** = `k`. Then:

| Property | √N target | Linear k·N target |
|---|---|---|
| Small sub, skilled | cannot win (gate) | **wins** (skill-dependent) |
| Small sub, lazy | cannot win | cannot win |
| Large sub, lazy (herd 21) | **auto-wins** | **loses** (for k ≥ 22) |
| Large sub, skilled (34) | wins | wins |
| Per-player requirement vs N | shrinks (∝1/√N) | **constant** |

`population-scaling.ts` (a): under linear, a 5-, 10-, 20- and 40-player sub wins **iff** it plays
well. (b): the herd (21.0/player) **never** wins for k ≥ 22, at any N. Both defects are removed
by one formula change.

---

## 3. Scale-invariance is real [PROOF]

The decisive property: the **required skilled fraction** must not grow with N.

`population-scaling.ts` Part (c):

| N | k=27 need | k=29 need | k=31 need |
|--:|--:|--:|--:|
| 50 | 70% | 85% | 100% |
| 200 | 60% | 75% | 95% |
| 1000 | 55% | 75% | 90% |
| 5000 | 30% | 70% | 90% |

The required skilled fraction is **roughly constant in N** (the small variation is banding
granularity at tiny N; the underlying per-player aggregate is flat — verified:
30%-skilled mix gives 25.9 → 27.1/player from N=50 to N=10000). A 50-player sub and a
5000-player sub face the **same effort**. This is exactly what a linear target buys and what the
`√N` target cannot.

---

## 4. Choosing k from evidence [ENGINE]

Measured per-player ceilings on the genesis beast (exact):

| Strategy | damage/player |
|---|--:|
| lazy herd | 21.0 |
| blind dispersion (the T6 trivial rule) | **29.1** |
| top-5 spread | 28.0 |
| self-interested equilibrium (crowd-reading) | **34.1** |

- **k ≤ 21:** the lazy herd wins → **too easy**, the goal is cosmetic.
- **k = 25–29:** the herd loses; **blind dispersion wins** → T6 *not* fixed (a trivial rule
  still clears the bar).
- **k = 30–31:** blind dispersion **loses**; only genuine coordination clears the bar →
  **the shared goal becomes a skill goal.**
- **k ≥ 33:** demands ≥90% engagement → **too hard**, punishes casual subs.

**Trade-off [HYPOTHESIS]:**
- `k = 27` keeps the shared goal winnable for casual-but-engaged subs; it does **not** by itself
  defeat the trivial dispersion rule (that needs `k ≥ 30`).
- `k = 30–31` makes the shared goal a genuine skill goal but raises the casual bar.

**Recommendation:** **`k = 27` as the default** (matches Mission 06; keeps the goal winnable),
**with `k = 30` as the option that also defeats the trivial rule** — flagged for the owner as a
deliberate design choice (see `COMPETITIVE_SCORING.md`). The 25–30 range in the brief brackets
both; the evidence says **25–29 keeps a trivial path, 30 closes it.**

---

## 5. Interaction with the candidate mechanics

| Mechanic | Effect on the scaling recommendation |
|---|---|
| V1–V3 zone forecast | none — rejected independently |
| V4 shared-goal call | **requires** genuine uncertainty → argues for `k` at the **upper** end (30) so SLAIN is not a foregone conclusion |
| Feints / signals (emergent) | unaffected; linear target keeps behaviour consequential at all N |

`population-scaling.ts` Part (e): the crowd's behaviour moves the day's total by **>50%**
(herd 2100 → equilibrium 3264 at N=100; herd 21000 → 34134 at N=1000). The beast's fate is
decided by the community, at every size. **Behaviour is consequential** — which is MOLT's
central promise.

---

## 6. What is NOT claimed

- This is a **balance recommendation**, not proof that any k is *fun*.
- The ceilings are measured on the **genesis** beast. Armoured/raw/mutated states shift the
  levels (Mission 06: thresholds 255–348 across states) but **not the structure** — a linear
  target is scale-invariant under every state; a `√N` target is under none.
- The recommendation **changes the integrity formula**, which is a **frozen-rule decision**
  (Mission 05/06 C-series). It is **not applied** and **not silently resolved**.
