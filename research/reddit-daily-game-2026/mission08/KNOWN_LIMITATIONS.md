# Known Limitations

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18

Every limitation that bears on the integrity recommendation. **None is hidden.** Confidence levels:
`high` (reproducible, engine-verified) · `medium` (sound but assumption-dependent) · `low` (untested).

---

## 1. No human playtest (highest-impact)

- **0 humans have played MOLT** (Mission 05, 07 and 08). Every UX claim is `[HYPOTHESIS]`.
- The simulation models **rational bots**, not people. Real players may not read the beast, may not
  coordinate, and may not return.
- **Effect on the decision:** the *mathematical* window (~29–30) is `high` confidence; the *choice
  within it* is `low` confidence and needs `HUMAN_PLAYTEST_REQUIREMENTS.md`.
- **Unresolved question:** can a real mixed crowd clear k=30? Unknown.

## 2. Bots are more rational than humans (medium)

- The strategy classes (`top5`, `reader`, `even spread`) are **idealised**. The `top5` spread is a
  **lockstep** coordination no real crowd reproduces exactly.
- `noisy-crowd.ts` (the honest model) shows a realistic reader crowd reaches only **~25–30**, i.e.
  **k=30 is at the realistic ceiling** and **k=29 is more comfortable**.
- **Effect:** the "beast-read spread clears 99%" figure is an **upper bound** for real play.

## 3. C1 and C2 are unresolved (medium)

- `STATE_MULT` (C1) and `pierce`-vs-`exposed` (C2) both **shift the ceilings**
  (`C1_C2_RELEVANCE_REVIEW.md`). C1 changes evolved-state damage by 0.55–1.70×; C2 by ~40% on
  pierce-vs-exposed.
- Mission 08 follows the **engine** (C1 not applied; pierce:exposed = 1.0).
- **Effect:** if either is resolved the other way, **k must be re-derived**. Not resolved here.

## 4. The bistability lock-in (high)

- `bistability.ts`: the state trajectory is **path-dependent**. An early escape fires the §3.7
  penalty, locks a low-damage attractor, and the sub may never recover.
- **Effect:** k=30 is only **~0.3** below a total-failure cliff (k≈30.3). This is a **real UX risk**
  and the main argument for k=29 (margin ~1.3) or a recovery valve.
- **Unresolved question:** does a real sub recover after a failed day? Needs playtest (BI-6).

## 5. "Beast-ignoring" is a modelling choice (low)

- The battery of beast-ignoring rules (`trivial-battery.ts`) is a **sample**, not exhaustive. A
  cleverer non-reading rule might exist.
- The strongest found reaches **29.50**; k=30 defeats all found. A not-yet-imagined rule at ≥30
  cannot be ruled out, but none was found across 9 rules × 7 N × 9 seeds.

## 6. Small-N regime (low)

- Below N ≈ 25 the integer target is coarse; single combos swing the outcome. k=29 is defeated by
  an even spread at N ≈ 22–25. This is **not a realistic Reddit regime** but is documented.

## 7. Deterministic seeds (low)

- All simulations use a fixed LCG. Results are **exactly reproducible** (verified: 10 scripts,
  identical hashes on re-run) but sample a **finite** seed set (5–9 seeds). Seed variance was
  checked (`mixed-defection.ts` §A) and is small.

## 8. Model fidelity is verified but the model is still a model (low)

- `fidelity8.ts`: the analysis library reproduces the engine **8405/8405**. So the analysis is
  faithful **to the engine**. But the engine is a **simplification** of real play (one strike,
  perfect information, deterministic crowd bands).

## 9. Molt-state transition specifics (low)

- The escape-penalty mechanism (§3.7) drives the bistability. It was read from `molt.ts` and used
  as-is. If `molt.ts` is later changed, the bistability result must be re-checked.

## 10. Scope boundary (by design)

- Mission 08 does **not** resolve C1/C2, does **not** re-derive k under alternative readings, does
  **not** test the shared-goal call (T7, out of scope), and does **not** implement anything.

---

## What is NOT limited

| Claim | Confidence |
|---|---|
| The analysis library == the engine (8405/8405) | **high** |
| `√N` is population-dependent; linear is not | **high** (`[PROOF]`) |
| k=27 is cleared by trivial rules (50–100%) | **high** (`[SIM]`, engine-verified, 9 seeds) |
| No beast-ignoring rule reaches 30 at any N tested | **high** (`[SIM]`, 9 rules × 7 N × 9 seeds) |
| The individual axis rewards crowd-reading, k-independent | **high** (`[PROOF]`) |
| A failure cliff exists near k≈30.3 | **medium** (`[SIM]`, 1 state/seed shown; bistable mechanism verified) |

---

## Bottom line

The **mathematics is solid** (linear structure confirmed; k=27 refuted; k=30 defensible; window
~29–30). The **open risk is human**: whether real casual players can clear a hard goal and recover
after a loss. **That is why the verdict is CONDITIONAL, not GO.**
