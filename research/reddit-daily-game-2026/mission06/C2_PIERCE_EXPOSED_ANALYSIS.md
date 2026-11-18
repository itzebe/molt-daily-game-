# C2 — PIERCE vs EXPOSED ANALYSIS — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Independent comparison of the documented pierce-vs-exposed relationship against the implementation.
Evidence: `evidence/c1-c2-combined-output.txt`, `evidence/adversarial-output.txt` (T5).
**No file is modified.**

---

## 1. The competing definitions

**Design document `WINNING_GAME_DESIGN.md` §2.2** states the tool relationships as:

| Tool | Strong vs | Weak vs |
| --- | --- | --- |
| Cleave | Armoured | Raw |
| **Pierce** | **Exposed** | Armoured |
| Burn | Raw | Exposed |

⇒ Design reading: `pierce` vs `exposed` = **1.6** (strong).

**Mechanics specification §1.3** states the matrix numerically:

| tool | armoured | exposed | raw |
| --- | --- | --- | --- |
| cleave | **1.6** | 1.0 | 0.6 |
| **pierce** | 0.6 | **1.0** | **1.6** |
| burn | 1.0 | 0.6 | **1.6** |

⇒ Spec reading: `pierce` vs `exposed` = **1.0** (neutral); `pierce` is strong vs **raw**.

**§4 worked example** uses the spec reading: `28 × 1.0 × 1.9 = 53`.
**`resolve.ts:damageFor`** uses the spec reading (no special-case).
**Tests** pin the spec reading: `engine.test.ts:31` `expect(TOOL_MULT.pierce.exposed).toBe(1.0)` and
`:119` `gut:pierce@2% = 53`.

## 2. Exact numerical consequence of each interpretation

| zone:tool | state | share | spec (1.0) | design (1.6) | difference |
| --- | --- | --- | --- | --- | --- |
| **gut:pierce** | exposed | 0.02 | **53** | **85** | +32 (+60 %) |
| crown:pierce | armoured | 0.02 | 34 | 34 | 0 (both 0.6) |
| tail:pierce | raw | 0.02 | 49 | 49 | 0 (both 1.6) |

The disagreement is **only** on `pierce` vs `exposed`. It is worth **+32 damage** on the demo's headline
read (`gut:pierce` on an exposed zone at 2 % share): 53 vs 85.

## 3. Which is authoritative

**The spec reading (1.0) is authoritative.** Reasons:

1. **§1.3 and §4 agree** and are the *numeric* sources; `damageFor` and the tests implement them.
2. **The design doc's own §2.4 formula** uses `TOOL_MULT[tool][zoneState]` — the spec matrix — not a
   "strong/weak" label. So §2.2's prose contradicts §2.4's formula *within the same document*.
3. **The design's §2.2 table is internally inconsistent with the rest of the design.** §2.2 lists Pierce
   strong-vs-Exposed; but §2.2 also says Cleave is strong-vs-Armoured and Burn strong-vs-Raw — matching
   the spec for those two tools. Only the Pierce row diverges.
4. **Replacing 1.0 with 1.6 would break a passing test** (`engine.test.ts:31`, `:119`) and change the §4
   printed example — a gameplay change.

## 4. Effect on A5 (interaction, cross-checked)

`evidence/adversarial-output.txt` (T5): setting `pierce`-vs-exposed to 1.6 lowers the best-case A5
threshold from **348 → 255** (a bigger ceiling), but does **not** remove the population gate. So C2 is
**not** a fix for A5; it is an independent documentation defect.

## 5. Exact documentation correction proposed (NOT applied)

In `mission03/WINNING_GAME_DESIGN.md` §2.2, change the Pierce row so it matches §1.3/§4:

> | **Pierce** (pointed) | **Raw** | **Armoured** |

and add the neutral case explicitly (as the other tools implicitly have), e.g. a footnote:

> *Pierce is strong vs Raw (×1.6), weak vs Armoured (×0.6), neutral vs Exposed (×1.0).*

This makes the design doc consistent with the spec, the engine, and the tests — a documentation-only
change with no gameplay effect.

## 6. Recommendation

**Keep the implemented multiplier (`pierce` vs exposed = 1.0). Correct `WINNING_GAME_DESIGN.md` §2.2's
Pierce row.** Documentation-only; no gameplay change.
