# EXECUTIVE VERDICT — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Baseline:** `ec9bcb4` (Mission 05 HEAD) ·
**Scope:** shared-victory balance, C1/C2 mechanics resolution, adversarial verification.

> **This is a design and validation verdict. It is NOT authorisation for implementation.**
> No gameplay, engine file, specification, or design document was changed. Awaiting user approval on the
> three decisions in `APPROVAL_DECISION_SHEET.md`.

---

## VERDICT: **READY FOR RULE APPROVAL**

All three decisions (C1, C2, A5) have **reproducible evidence** and a **clear recommendation**. The A5
result was **independently reproduced** with an exact method (not the Mission 05 hill-climber), and its
cause was derived analytically. The recommended fix is a single formula change that preserves the game's
identity. **The one caveat that stops this being an unconditional "everything is solved"** is that the
recommended coefficient does not fully resolve a deeper dispersion-vs-precision tension (T6), which is a
design judgement for the user — hence "ready for rule approval", with that limitation stated, rather than
"the balance is solved".

---

## A. What was asked and what was found

| Question | Answer | Evidence |
| --- | --- | --- |
| Is A5 real? | **Yes** — reproduced exactly (best-case threshold **N = 348**; realistic **415–572**) | `A5_MATHEMATICAL_DERIVATION.md` |
| Why? | `Integrity ∝ √N` while `damage ∝ N` → an inevitable population gate | `A5_MATHEMATICAL_DERIVATION.md` §2 |
| Is there a fix that keeps the game's identity? | **Yes** — a scale-invariant linear target `Integrity = 27·N` | `COEFFICIENT_SENSITIVITY_ANALYSIS.md` |
| C1: which state rule is authoritative? | **The code's (§2/§4)**; §1.2's table is a draft to correct | `C1_STATE_MULT_ANALYSIS.md` |
| C2: is pierce strong vs exposed? | **No (1.0)**; the design doc §2.2 is the outlier to correct | `C2_PIERCE_EXPOSED_ANALYSIS.md` |
| Do the three interact? | **Yes** — C1×A5 risks a death spiral; C2 masks A5; C1×C2 unbalances tools | `COMBINED_RULES_INTERACTION_ANALYSIS.md` |

## B. The three recommendations (nothing applied)

1. **C1 — keep the engine's rule** (state effect via the tool matrix); correct spec §1.2's wording. No code change.
2. **C2 — keep 1.0** (pierce neutral vs exposed); correct design §2.2's Pierce row. No code change.
3. **A5 — replace `min(1000·√N, 12000)` with `Integrity = 27·N`** (range 25–30, no cap). One formula change.

## C. Why A5 is a parameter-shape problem, not a mechanic failure

The shared-victory *idea* — a community pool with a SLAIN/ESCAPED outcome and a collective consequence —
is sound and is exactly what the judging criteria reward. The defect is purely in the **shape** of the
target: `√N` cannot match linear damage. A linear target keeps every mechanic (zones, tools, crowd
factors, molting, fatigue, the escape penalty) and makes the outcome depend on **community coordination**
instead of **head-count**. This is the mission's execution principle realised: *reward meaningful
collective decisions, not population size*.

## D. The honest caveat (why not an unconditional "solved")

`ADVERSARIAL_VERIFICATION.md` T6: because the shared pool **sums** damage and the crowd factor rewards
**low share**, the aggregate is nearly maximised by **mere dispersion** — a blind spread (29.1/str) beats
"smart" spreads, and a simple "everyone pick a different combo" convention wins most days. So `k=27`
removes the population gate and makes the outcome depend on a real collective choice, but it does **not**
make the shared goal reward **precision** over **dispersion**. Two further inherent issues are disclosed:
a piling minority can force escapes (T4). These are **design-level** questions (should the shared goal
reward dispersion?) that a coefficient cannot answer, and they are left for the user, not papered over.

## E. Does this change the Mission 05 CONDITIONAL GO?

**No — it refines it.** Mission 05's condition F said MOLT moves to unconditional GO only if the rules are
decided and A5 is resolved. Mission 06 supplies the evidence for those rule decisions and a concrete,
identity-preserving A5 fix. But the **human playtest (Mission 05 M2) is still unrun**, and T6 adds a new
design question. So the project remains **CONDITIONAL GO**, now with a clear, evidence-backed path to
resolution:

1. **User decides** C1 / C2 / A5 (`APPROVAL_DECISION_SHEET.md`).
2. If A5 approved: change one formula, re-run the 42 tests and the balance/adversarial sims (report the
   results), and decide the T6 dispersion question.
3. **Human playtest** (Mission 05 kit) — still required for the fun/legibility question.

## F. Confidence and reproduction

| Claim | Confidence | Reproduced by |
| --- | --- | --- |
| A5 threshold N = 348 (best case) | **High** — exact DP, 3520/3520 fidelity to the engine | `analysis/a5-derivation.ts`, `analysis/fidelity-check.ts` |
| Realistic threshold 415–572 | Medium — model-dependent (crowd behaviour assumed) | `analysis/a5-derivation.ts` |
| Only a linear target removes the gate | **High** — mathematical (Lemma 1/2) | `A5_MATHEMATICAL_DERIVATION.md` §2 |
| `k=27` separates lazy from engaged play | **High** — from measured ceilings | `analysis/strategy-ceilings.ts` |
| Dispersion auto-wins (T6) | **High** — exact aggregate computation | `analysis/smart-vs-blind.ts` |
| C1/C2 authoritative reading | **High** — two normative sources + code + tests agree | `C1…md`, `C2…md` |

## G. Stop conditions (Mission 06 §11)

**None triggered.** Mechanics reconstructed; A5 reproduced; the proposed correction is a formula-shape
change that keeps the approved identity; no fundamental redesign is required; the prototype baseline is
consistent (42/42, tsc clean, hashes stable); no result depends on a fabricated assumption. (See
`BASELINE_VERIFICATION.md` §9.)

## H. Bottom line

Mission 06 **confirms** the Mission 05 A5 finding with an exact method, **explains** it as a structural
consequence of `√N` against linear damage, and **proposes** a single, identity-preserving fix
(`Integrity = 27·N`) that is the only candidate removing both the small-subreddit gate and the
large-subreddit auto-win. It resolves C1 and C2 as documentation defects (no code change). It **discloses**
one unresolved design tension (dispersion vs precision) rather than hiding it. **Ready for rule approval.**
