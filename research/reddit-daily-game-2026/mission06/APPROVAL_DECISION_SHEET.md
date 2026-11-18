# APPROVAL DECISION SHEET — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

> **Three decisions.** Each is written to be understandable **without** reading source code. For each,
> tick **APPROVE**, **REJECT**, or **REQUEST MORE ANALYSIS**. Nothing is preselected. **No change has
> been applied.** All evidence is reproducible from `analysis/` (outputs in `evidence/`).

---

## Decision 1 — C1: the zone-state multiplier (`STATE_MULT`)

**The conflict, in plain terms.** The rulebook has two places that describe how a zone's condition
(Armoured / Exposed / Raw) changes damage. One place (§1.2) gives a table saying "Armoured ×0.55, Exposed
×1.00, Raw ×1.70". Two other places — the actual step-by-step algorithm (§2) and the worked example (§4)
— **do not use that table at all**: they get the state's effect through the *tool* choice instead. The
code and its tests follow §2/§4. So one table in the rulebook is out of step with the rest of the
rulebook.

**Recommended authoritative definition.** Follow §2/§4 and the code: the state's effect is applied
**through the tool matrix**, not as a second multiplier. The §1.2 table is a leftover draft.

**Exact reason.** §2 (the algorithm the server runs) and §4 (the worked example) agree with each other and
with the code and tests. Applying §1.2 as well would count the state **twice**, would make the printed §4
numbers (34 and 53) wrong, and — critically — would make an escaping beast **harder** to hit each day (a
death spiral). Keeping the code's reading avoids all of that.

**Exact proposed documentation correction.** In `mission03/GAME_MECHANICS_SPECIFICATION.md` §1.2, relabel
the numeric table as **informational only** (or delete the numeric column), and state that the state's
damage effect is applied via `TOOL_MULT` (§1.3). **No code change.**

- [ ] **APPROVE** — keep the code's reading; fix §1.2's wording/table.
- [ ] **REJECT** — instead apply `STATE_MULT` as a second multiplier (a gameplay change: edits the code,
  §4, the tests, and the demo numbers, and introduces the escape death spiral).
- [ ] **REQUEST MORE ANALYSIS.**

---

## Decision 2 — C2: `pierce` against an **Exposed** zone

**The conflict, in plain terms.** The design document (§2.2) says the Pierce tool is **strong** against an
Exposed zone. The mechanics spec (§1.3) and the worked example (§4) say Pierce is **neutral** against
Exposed (it is strong against **Raw** instead). The code and tests follow the spec.

**Recommended authoritative multiplier.** Keep the spec's **1.0** (neutral) for Pierce-vs-Exposed.

**Exact reason.** §1.3 and §4 agree with the code and tests; the design doc's own scoring formula (§2.4)
also uses the spec matrix. Only the prose table in §2.2 disagrees. Changing it would break a passing test,
change the worked example, and — because the spec intends exactly **one** strong tool per state — would
make two tools strong against Exposed, unbalancing the tool triangle.

**Exact numerical consequence.** The demo's headline read (`pierce` on an exposed zone at 2 % share) is
**53** under the spec and would be **85** under the design doc's prose. No other combination differs.

**Exact proposed documentation correction.** In `mission03/WINNING_GAME_DESIGN.md` §2.2, change the Pierce
row to "Strong vs **Raw**, Weak vs Armoured" and add a note that it is neutral vs Exposed. **No code
change.**

- [ ] **APPROVE** — keep 1.0; fix the design doc's §2.2 Pierce row.
- [ ] **REJECT** — change Pierce-vs-Exposed to 1.6 (a gameplay change: edits the code, §4, and the tests).
- [ ] **REQUEST MORE ANALYSIS.**

---

## Decision 3 — A5: the Integrity target (the shared victory condition)

**The problem, in plain terms.** The shared goal is "the community does enough total damage and the beast
is SLAIN; otherwise it ESCAPES and starts hardened tomorrow." The amount needed is
`1000 × √(number of strikers)`, capped at 12,000.

Because the required amount grows only as the **square root** of the crowd while the damage the crowd can
deal grows **in proportion** to the crowd, the goal behaves badly at both ends:

- **Small subreddits cannot win at all.** Even if *every* player plays perfectly, the beast cannot be
  slain below about **348 daily strikers** (proven with an exact optimum; the realistic figure is
  **415–572**). Below that line the beast escapes **every day** and hardens without limit.
- **Large subreddits win for free.** Above ~500 strikers, even a lazy crowd that all picks the same move
  slays the beast with no coordination.

So the shared goal currently measures **head-count**, not community skill. This is the A5 finding Mission
05 raised; Mission 06 reproduces it exactly and finds the fix.

**Recommended value/formula.** Replace the target with a **scale-invariant linear** formula:

```
Integrity = k × (number of distinct strikers),   k = 27   (defensible range 25–30),   no cap
```

**Population behaviour before and after.**

| | Current `min(1000√N, 12000)` | Recommended `27·N` |
| --- | --- | --- |
| Required damage per striker | falls with N (100 at N=100, 12 at N=1000) | **constant 27 at every N** |
| Small sub (N ≤ 348) | **cannot win** (impossible) | can win from N ≈ 4 (engaged play) |
| Large sub (N ≥ 500) | **lazy herd auto-wins** | lazy herd **always fails** |
| Outcome depends on | population size | community's decision to de-herd |

**Strategic and exploitability implications.**
- The lazy herd (≈24/str) can never reach 27; a coordinated de-herd (≈29/str) can. So a real collective
  decision (~27 % of the crowd deviating) decides the outcome at **every** population.
- **Residual risks, disclosed and not solved by the coefficient:** (a) a coordinated **minority can force
  escapes** by piling on one move (~15 % damage loss); (b) because the pool **sums** damage, **mere
  dispersion** (everyone picking different moves) is nearly as good as precise reads — so a community can
  "solve" the goal with a simple spread convention. Both are inherent to a shared pool and need a human
  design judgement (see `ADVERSARIAL_VERIFICATION.md` T4 and T6).

**Exact reason for the recommendation.** A linear target is the **only** form that removes the population
gate *and* stops the lazy herd auto-winning, and it **fulfils the design's own stated intent** (spec §1.5
says the shape should "keep a small subreddit viable and stop a large one trivialising the day" — the
current `√N` does the opposite). It changes **one formula and nothing else**: every zone, tool, crowd band,
molt rule, and fatigue rule is untouched, so the game's identity is preserved. `k = 27` is derived from
measured ceilings (herd ≈24.2, decentralised ≈29.1), not fitted.

- [ ] **APPROVE** — replace `min(1000√N, 12000)` with `27·N` (no cap).
- [ ] **REJECT** — keep the current `√N` formula.
- [ ] **REQUEST MORE ANALYSIS.**
- [ ] **OTHER** (specify a different formula/constant): ______________________

---

## Combined recommendation (the three decisions together)

| Rule | Recommended decision | Applied? |
| --- | --- | --- |
| C1 STATE_MULT | Keep code's reading; fix spec §1.2 doc | **No** |
| C2 pierce/exposed | Keep 1.0; fix design §2.2 doc | **No** |
| A5 integrity | Replace with `27·N` | **No** |

These three are analysed together in `COMBINED_RULES_INTERACTION_ANALYSIS.md`; deciding C1 as "apply
STATE_MULT" while leaving the escape penalty as-is would create a death spiral, so the decisions should be
made as a set.

## What happens after approval (not done in this mission)

1. If **C1/C2 = APPROVE**: apply the two documentation corrections (no code change).
2. If **A5 = APPROVE**: change the single constant/formula in the engine, then **re-run all 42 tests**
   (the balance tests run at n=40, which is inside the current gate, so their expectations may need
   updating — that is expected and would be reported), re-run the balance/adversarial simulations, and
   regenerate the affected evidence.
3. If **A5 = APPROVE**: a **human playtest** (Mission 05 kit) is still required before any GO.

**No item above has been executed. The engine, the specification, and the design document are unchanged.**
