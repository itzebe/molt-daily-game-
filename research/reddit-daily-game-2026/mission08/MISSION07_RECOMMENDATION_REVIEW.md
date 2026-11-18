# Mission 07 Recommendation Review

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18

Read in full: `RECOMMENDED_RULES_FOR_APPROVAL.md`, `MISSION07_EXECUTIVE_VERDICT.md`,
`POPULATION_SCALING_REASSESSMENT.md`, `STRATEGY_DOMINANCE_MATRIX.md`, `ADVERSARIAL_DESIGN_REVIEW.md`,
`KNOWN_LIMITATIONS.md`, plus the analysis scripts (`population-scaling.ts`, `t6-reproduction.ts`,
`tournament.ts`, `predictability-sweep.ts`) and their raw outputs.

---

## 1. Exactly what Mission 07 proposed

| Item | Mission 07 proposal |
|---|---|
| **Formula** | Replace `Integrity(N) = min(1000·√N, 12000)` with **`Integrity(N) = k·N`**, **no cap** |
| **Default constant** | **k = 27** ("winnable default") |
| **Alternative** | **k = 30** ("defeats the trivial spread rule") |
| **Range** | 25–30 |
| **Derivation** | measured per-player ceilings on the **genesis (all-exposed) beast**: herd 21.0, blind dispersion **29.1**, top-5 spread 28.0, equilibrium **34.1** |
| **Status** | **NOT APPLIED.** Requires owner approval. C1/C2/A5 left open |

---

## 2. The exact decision rule Mission 07 used

> "k ≤ 21: herd wins (too easy). k = 25–29: blind dispersion wins (T6 not fixed).
> k = 30–31: blind dispersion loses (shared goal becomes a skill goal). k ≥ 33: too hard."

The load-bearing number is **29.1** — the blind-dispersion ceiling — and the load-bearing claim is
that **k = 30 > 29.1** therefore closes the trivial path.

---

## 3. Implementation details: what Mission 07 left AMBIGUOUS (recorded, not invented)

| Detail | Mission 07 text | Status |
|---|---|---|
| **Exact formula** | `Integrity = k·N` | **Defined** |
| **Cap** | "no cap" | **Defined** (none) |
| **Minimum value** | not stated | **AMBIGUOUS** — e.g. is there a floor at small N? (Mission 08 analysis shows `k·N → 0` as `N → 0`; the engine's `resolveDay` already special-cases `n = 0`.) |
| **Rounding** | not stated | **AMBIGUOUS** — `k·N` is an integer for integer k, but the **comparison** (`>=`) and the damage rounding (`Math.round`) interact at the boundary. Mission 07 did not specify the boundary convention. |
| **Where it lives** | not stated | **Inferred** (not stated by Mission 07): `resolve.ts:81–82`, `integrityFor()`; constants in `rules.ts:78–79` |
| **Damage ordering** | not discussed | Mission 07 did not state that integrity is compared to the **rounded integer total** |
| **k = 27 vs 30 tie-break** | "deliberate owner trade-off" | **Explicitly left to the owner** |
| **State-dependence** | "ceilings are measured on the genesis beast … the exact k should be re-derived across states before implementation" | **Flagged as a gap in `KNOWN_LIMITATIONS.md` §2 — and that gap is the central subject of Mission 08** |

**Mission 08 records these ambiguities rather than resolving them silently.** The
`IMPLEMENTATION_SPECIFICATION.md` states the conventions that would be required, but does not
apply them.

---

## 4. What Mission 07 got RIGHT (independently confirmed)

- The **structural** claim: `√N` creates a population gate at small N and an auto-win at large N;
  a linear target is scale-invariant. ✅ (Mission 08 §1/§6 of `INDEPENDENT_MATHEMATICAL_VERIFICATION.md`)
- The **individual axis is healthy**: a crowd-reader out-scores a blind spreader; no trivial
  dominant strategy. ✅
- The **zone forecast is correctly rejected**. ✅ (not re-litigated here)
- The **genesis-beast ceilings** (herd 21.0, blind dispersion 29.08, equilibrium 34.16) reproduce
  **exactly**. ✅

---

## 5. What Mission 07 got INCOMPLETE — and why it changes the decision

Mission 07 measured the ceilings **only on the genesis (all-exposed) beast** and **statically**
(a fixed state). Both simplifications matter:

1. **State-dependence.** The beast's state is **endogenous** — `molt()` derives day D+1 from day D's
   outcome, and the escape penalty (§3.7) forces the least-hit zone armoured. The ceilings **move**
   with state. Mission 08 measures them across states (`verify-math.ts` §2).
2. **Dynamic ceilings.** A strategy's long-run damage is what matters, not its one-day value on a
   fixed state. Mission 08 runs the frozen engine over 150 days with the state evolving under each
   candidate formula (`dynamic-k.ts`, `mixed-under-k.ts`).
3. **What "blind dispersion" means.** Mission 07 treated `blindDispersion` (cycle all 15 combos) as
   the trivial rule and `top5Spread` (28.0) as *less* dangerous. Mission 08 finds the opposite:
   the **state-reading** spread (`top5`) is the *strong* rule (~29.7–32.4), while the even cycle is
   *weaker* (~27–28.5) — because reading the beast is a skill Mission 07's "trivial" framing hid.

**These three points mean the 29.1 number is not a stable constant, and k=30 is not obviously
sufficient.** The evidence is in the companion documents.

---

## 6. Disposition of each Mission 07 decision item

| ID | Mission 07 item | Mission 08 disposition |
|---|---|---|
| M7-1 | linear integrity | **Re-examined, supported in structure** (see verdict) |
| M7-2 | k=27 vs k=30 | **Re-opened** — evidence points elsewhere (see `K27_VS_K30_DECISION.md`) |
| M7-3 | zone forecast | Not re-opened (correctly rejected) |
| M7-4 | shared-goal call | Out of scope for Mission 08 |
| M7-5 | alt mechanics | Out of scope |
| M7-6 | live-share display | Out of scope |
| C1 | `STATE_MULT` | **Reviewed for relevance** (`C1_C2_RELEVANCE_REVIEW.md`) — not resolved |
| C2 | pierce vs exposed | **Reviewed for relevance** — not resolved |
