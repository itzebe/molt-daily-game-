# KNOWN LIMITATIONS — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Honest, complete list of what Mission 06 did **not** establish, and what is known to be weak. Nothing here
is buried in the report's prose.

---

## 1. Scope and authority

- This mission **changed no gameplay** and **no engine/spec/design file**. Every recommendation is a
  proposal awaiting user approval.
- All analysis is **model-level** (bots vs bots, exact maths, and simulations). **No human played anything.**

## 2. Limitations of the analysis itself

| # | Limitation | Why it matters | How to reduce it |
| --- | --- | --- | --- |
| L1 | **Crowd models are assumptions.** The "realistic" thresholds (415–572) assume uniform/80-20 herd behaviour; real subreddits differ. | Realistic numbers are model-dependent. | The **best-case** threshold (348) is a hard upper bound and does not depend on the model. |
| L2 | **Bots are not people.** Bot archetypes may not reflect how humans actually play (e.g. humans may copy the top comment, not a uniform spread). | Could shift the practical `k` window. | Human playtest (Mission 05 kit). |
| L3 | **`k=27` is derived from aggregate ceilings** (herd 24.2, decentralised 29.1), not from a fielded subreddit. | The exact best `k` may differ once real behaviour is known. | Treat 27 as the centre of a 25–30 range; re-measure with real play. |
| L4 | **The dispersion-vs-precision tension (T6) is characterised but not resolved.** A blind spread ≈ a smart spread at the aggregate level. | The shared goal may reward *participation convention* more than *skill*. | A design decision (possibly a mechanic change beyond a constant) — outside this mission's authority. |
| L5 | **Aggregate ceilings ignore tool fatigue and ridges.** Fatigue only lowers damage (0.8×), so ignoring it favours the crowd; the true ceilings are slightly lower. | The recommended `k=27` may be marginally optimistic. | Included in the multi-day simulations (`static-robustness`, `equilibrium-sim`), which apply the real rules. |
| L6 | **The state-threshold sweep used the genesis beast for the headline number.** Genesis (all exposed) is the **worst case** (highest threshold); evolved beasts have lower thresholds (255–348). | The headline "348" is the *maximum* gate, not the typical one. | Stated explicitly in `A5_MATHEMATICAL_DERIVATION.md` §8 and `state-thresholds-output.txt`. |

## 3. Findings that ARE solid

| # | Finding | Confidence |
| --- | --- | --- |
| F1 | A5 is real; best-case SLAIN threshold = 348 (exact DP, engine-faithful) | **High** |
| F2 | Cause: `Integrity ∝ √N` vs `damage ∝ N` → a population gate is inevitable for any `√N` target | **High (mathematical)** |
| F3 | Only a **linear** target removes the gate and stops the lazy-herd auto-win | **High** |
| F4 | C1: the code's reading is authoritative; §1.2 double-applies the state | **High** |
| F5 | C2: the code's 1.0 is authoritative; design §2.2's Pierce row is the outlier | **High** |
| F6 | The three defects interact (C1×A5 death spiral; C2 masks A5) | **High** |

## 4. Carried-over open items (unchanged)

- **Mission 05 M2 (human playtest) is still unrun.** Mission 06 does not address fun/legibility.
- U2/U3/U5 from Mission 04 (no concurrent load, no Devvit runtime parity, emulated mobile) remain open.
- The Mission 05 `APPROVED_RULE_RESOLUTION.md` decision sheet is **superseded** by this mission's
  `APPROVAL_DECISION_SHEET.md` (which resolves C1/C2 with independent evidence and replaces the A5 option
  list with a concrete, derived recommendation).

## 5. What would make this mission's recommendations final

1. The user records decisions in `APPROVAL_DECISION_SHEET.md`.
2. If A5 is approved: change the one formula, **re-run the 42 tests** (expect the balance tests at n=40 to
   need review, since n=40 is inside the current gate), re-run the simulations, regenerate evidence.
3. Decide the T6 dispersion question (does the shared goal reward dispersion by design?).
4. Run the **human playtest** before any GO.

## 6. Reproduction

Every number in this mission is reproducible from the documented commands. See `analysis/README.md` and
`SHA256SUMS.txt`. Seeds, trial counts, and methods are disclosed in each script.
