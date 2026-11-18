# C2 — Pierce vs Exposed: Full Investigation

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/c2-investigation-output.txt`,
`evidence/fidelity9-output.txt`, `evidence/combined-k-decision-output.txt`
**Categories:** `[PROOF]` · `[ENGINE]` · `[SIM]`

**No file is modified. Recommendation only.**

---

## 1. The contradiction, stated exactly

`mission03/WINNING_GAME_DESIGN.md` §2.2 lists the tools as "strong vs / weak vs":

| Tool | Strong vs | Weak vs |
|---|---|---|
| Cleave | Armoured | Raw |
| **Pierce** | **Exposed** | Armoured |
| Burn | Raw | Exposed |

→ design prose implies **`pierce` vs `exposed` = 1.6** (strong).

`mission03/GAME_MECHANICS_SPECIFICATION.md` §1.3 gives the numeric matrix
`TOOL_MULT[tool][state]`:

| tool | armoured | exposed | raw |
|---|---|---|---|
| cleave | **1.6** | 1.0 | 0.6 |
| **pierce** | 0.6 | **1.0** | **1.6** |
| burn | 1.0 | 0.6 | **1.6** |

→ spec says **`pierce` vs `exposed` = 1.0** (neutral); pierce is strong vs **raw**.

**The disagreement is exactly one cell: `pierce` vs `exposed`.** Every other cell agrees between
the two documents.

### Where the multiplier enters

```
dmg = ZONE_VALUE × TOOL_MULT[tool][state] × CROWD(share)   (× fatigue × ridge)
                     ^^^^^^^^^^^^^^^^^^^^^
                     C2 changes only the [pierce][exposed] entry
```

**Both readings:** the same equation; only the `TOOL_MULT.pierce.exposed` value differs (1.0 vs 1.6).

---

## 2. Evidence hierarchy

| Rank | Source | Reading | Weight |
|---|---|---|---|
| 1 | **§1.3 numeric matrix** | **1.0** | The machine-readable source of truth for `TOOL_MULT`; the engine table is copied verbatim from it. |
| 2 | **§4 worked example** | **1.0** | Uses `28 × 1.0 × 1.9 = 53` — i.e. pierce-vs-exposed = **1.0**, explicitly. |
| 3 | **Design §2.4 formula** | **1.0** | `WINNING_GAME_DESIGN.md` §2.4 writes `TOOL_MULT[tool][zoneState]` — the spec matrix — not the §2.2 prose. **The design doc contradicts itself: §2.4 uses 1.0.** |
| 4 | **Engine `TOOL_MULT`** | **1.0** | `rules.ts` copies §1.3 exactly. |
| 5 | **Tests** | **1.0** | `engine.test.ts:31` `expect(TOOL_MULT.pierce.exposed).toBe(1.0)`; `:119` `gut:pierce@2% = 53`. |
| 6 | **Design §2.2 prose table** | **1.6** | A "strong/weak" summary table. **Internally inconsistent:** it says cleave strong-vs-armoured and burn strong-vs-raw (matching the spec) but lists pierce strong-vs-exposed — a lone outlier. |

**Every normative/numeric source says 1.0. Only §2.2's prose table says 1.6 — and §2.2 is contradicted
by §2.4 of its own document.**

> **Verification `[ENGINE]`:** `fidelity9.ts` proves `lib9` reproduces `damageFor` **906/906**; the C2
> numbers use the same library with `pierceExposed = 1.6`.

---

## 3. Numerical consequence `[PROOF]`

On an exposed zone, pierce, share < 3 % (crowd ×1.9):

| zone | 1.0 | 1.6 | diff |
|---|---|---|---|
| crown | 57 | 91 | +34 |
| hide | 42 | 67 | +25 |
| gut | **53** | **85** | +32 |
| claw | 46 | 73 | +27 |
| tail | 30 | 49 | +19 |

The demo's headline read (`gut:pierce`) becomes **85 instead of 53** — a **+60 %** change to the
single number the design uses to teach "the obvious play is not the best play".

---

## 4. Effect on tool incentives `[PROOF]`

On an **exposed** zone:

| zone | cleave | pierce(1.0) | pierce(1.6) | burn | best under 1.0 | best under 1.6 |
|---|---|---|---|---|---|---|
| crown | 57 | 57 | 91 | 34 | cleave (tie) | **pierce** |
| gut | 53 | 53 | 85 | 32 | cleave (tie) | **pierce** |
| tail | 30 | 30 | 49 | 18 | cleave (tie) | **pierce** |

- Under **1.0**, `cleave` and `pierce` **tie** on an exposed zone (both 1.0) — a deliberate symmetry:
  each state has exactly one *strong* tool, and exposed is "neutral for two, weak for one".
- Under **1.6**, `pierce` becomes the **sole best tool on every exposed zone**, breaking the "one
  strong tool per state" symmetry the §1.3 note relies on ("every state has at least one counter").

---

## 5. Effect on the achievable ceiling `[PROOF]`

Best total damage per striker (exact DP, genesis all-exposed):

| N | 1.0 | 1.6 | ratio |
|---|---|---|---|
| 100 | 33.72 | 46.27 | 1.372 |
| 500 | 34.55 | 47.16 | 1.365 |
| 2000 | 34.79 | 47.23 | 1.358 |

**C2 raises the genesis ceiling by ~36 %.** Crucially, **it does so for every strategy, including
beast-ignoring ones** — so it does not separate skill; it shifts the whole scale up. See §7.

---

## 6. Effect on the DP-optimal play `[PROOF]`

At N = 200, genesis, the exact DP-optimal allocation:

- **1.0:** `crown:pierce=59 crown:cleave=19 hide:pierce=19 gut:cleave=19 gut:pierce=19 claw:cleave=19`
  (a genuine spread across tools/zones).
- **1.6:** `crown:pierce=59 gut:pierce=59 crown:cleave=19 hide:pierce=19 claw:pierce=19 crown:burn=5`
  (pierce-dominated).

Under 1.6 the optimal play **collapses onto pierce**, reducing the tool-choice decision — the opposite
of the design intent ("the crowd can specialise").

---

## 7. Effect on the integrity decision `[SIM]` (decisive)

Because C2 lifts *all* strategies, the window between "beast-ignoring" and "beast-reading" **shifts up
but does not open**. From the combined k-decision (`combined-k-decision.ts`, state evolves under each
k, 5 seeds, N ∈ {25,50,200,1000}):

| C2 | smallest k closing the trivial path | engaged crowd clears at | verdict |
|---|---|---|---|
| **1.0** | **30** | 98.7 % at k=30 | **PASS (unique k=30)** |
| 1.6 | 37 | 0.7 % at k=37 | **no valid k** |

Under **1.6 there is no integer k** that both closes the trivial path and keeps the engaged crowd
winning: at k ≤ 33 the trivial rules still win 100 %; at k ≥ 34 the engaged crowd collapses to ~0 %.
**The 1.6 reading destroys the game's balance.** This is the strongest possible argument for 1.0.

---

## 8. Recommendation

> **Recommendation: retain the implemented multiplier (`pierce` vs `exposed` = 1.0) and correct the
> design document.** In `WINNING_GAME_DESIGN.md` §2.2, change the Pierce row to
> **strong vs Raw, weak vs Armoured** (and note it is neutral vs Exposed), matching §1.3/§2.4/§4, the
> engine, and the tests. **No engine change.** Documentation-only.

**Rationale (in order of strength):**

1. **§1.3, §4, and design §2.4 all say 1.0**; the engine and tests implement 1.0.
2. **§2.2 contradicts its own document** (§2.4 uses the spec matrix).
3. **1.0 preserves tool symmetry** (one strong tool per state); 1.6 makes pierce dominant.
4. **1.0 admits a valid integrity constant (k=30); 1.6 admits none** — 1.6 makes the game unwinnable
   by deliberate play at any k that also closes the trivial path.

**What would change the recommendation:** a design rationale stating pierce is *intended* to be strong
vs exposed (so that two tools beat exposed). **No such rationale exists.** If the design owner asserts
this intent, C2 must be implemented as a **gameplay change** (edit `rules.ts`, §4, the tests) and **the
entire integrity analysis re-run** — and, per §7, would **require redesigning the counter matrix**, not
merely changing one number, because 1.6 alone leaves no valid k.

**Request further evidence / Hold?** Not warranted: the evidence for 1.0 is decisive, and 1.6 is
shown to be *unbalanced*, which is a stronger reason to reject it than a documentation mismatch alone.
