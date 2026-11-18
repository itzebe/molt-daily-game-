# C1 — STATE_MULT ANALYSIS — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Independent comparison of the competing definitions of the zone-state multiplier. Evidence:
`evidence/c1-c2-combined-output.txt`. **No file is modified.**

---

## 1. The competing formulas

**Specification §1.2** defines a `STATE_MULT` table:

| state | multiplier |
| --- | --- |
| armoured | 0.55 |
| exposed | 1.00 |
| raw | 1.70 |

**Specification §2 (the normative daily-resolution algorithm)** computes damage **without** it:

```
dmg(s) = ZONE_VALUE[s.zone] × TOOL_MULT[s.tool][state] × CROWD_FACTOR(share)
```

**Specification §4 (the worked example)** also omits it:

```
dmg = 28 (gut) × 1.0 (pierce vs exposed) × 1.9 = 53
dmg = 30 (crown) × 1.6 (cleave vs armoured) × 0.7 = 34
```

**Engine implementation** (`resolve.ts:damageFor`) omits it (matches §2/§4).
**Unit tests** pin the §2/§4 numbers (`engine.test.ts:109–121`): `gut:pierce@2% = 53`,
`crown:cleave@40% = 34`.

So the two readings are:

- **Reading A (§2 + §4 + engine + tests):** `dmg = ZONE_VALUE × TOOL_MULT × CROWD`
- **Reading B (§1.2):** `dmg = ZONE_VALUE × STATE_MULT × TOOL_MULT × CROWD`

## 2. Numerical examples showing the difference

| zone:tool | state | share | A (§2/§4) | B (§1.2) | B/A |
| --- | --- | --- | --- | --- | --- |
| crown:cleave | armoured | 0.40 | **34** | 18 | 0.53 |
| gut:pierce | exposed | 0.02 | **53** | 53 | 1.00 |
| crown:cleave | exposed | 0.40 | 21 | 21 | 1.00 |
| tail:burn | raw | 0.02 | 49 | **83** | 1.69 |
| crown:cleave | raw | 0.40 | 13 | **21** | 1.62 |

Reading B **double-counts** the state: it applies the state twice (once via `STATE_MULT`, once via
`TOOL_MULT`), because `TOOL_MULT` already encodes the counter-relationship per state.

## 3. Gameplay consequences

- **Reading B compresses the armoured case** (34 → 18) and **inflates the raw case** (49 → 83). It makes
  "hit a raw zone with the right tool" far more valuable and "chip an armoured zone" far less.
- **Reading B changes the demo's headline numbers.** §4's lesson — *"the obvious play is not the best
  play"* — is stated with 34 vs 53. Under B it becomes 18 vs 53: a *larger* gap, but the printed §4
  numbers (34/53) would be **wrong**.
- **Reading B affects the A5 threshold shape only marginally** (measured: threshold unchanged at 348 on
  the genesis beast, `evidence/c1-c2-combined-output.txt` §COMBINED), because it scales the achievable
  ceiling and the target consistently at genesis (all exposed → `STATE_MULT=1.0`). But it **creates a
  death-spiral risk**: under B, hardening lowers the ceiling (34.79 → 25.95 as zones arm;
  `evidence/recommended-coefficient-output.txt` §1), so repeated escapes could compound. Under A,
  hardening *raises* the ceiling (34.79 → 47.23) — no spiral.

## 4. Which definition best reflects the approved design

**Reading A.** Reasons, in order of strength:

1. **Two normative sources agree.** §2 is the *algorithm the server runs*; §4 is a worked example. Both
   omit `STATE_MULT`. §1.2 is a descriptive table that the algorithm does not use.
2. **The engine and its tests implement A**, and the tests were written against §2/§4.
3. **`TOOL_MULT` already contains the state relationship.** Applying `STATE_MULT` on top is a
   double-application; §1.3's own note describes the tool matrix as the mechanism that gives "every state
   at least one counter" — i.e. the state's *effect* is mediated through the tool, not multiplied
   separately.
4. **A is more stable** (no escape death-spiral) and preserves the §4 printed numbers.

The `STATE_MULT` table in §1.2 is best understood as an **early descriptive draft** superseded by §2/§4.

## 5. Exact documentation correction proposed (NOT applied)

In `mission03/GAME_MECHANICS_SPECIFICATION.md` §1.2, the table header reads
"multiplier on damage". The correction is to **remove the double-application** by relabelling it as
**informational only**, e.g.:

> **1.2 Zone states (3)** — *descriptive; the state's effect on damage is applied through `TOOL_MULT`
> (§1.3), not as a separate multiplier.* The table below is the state's **visual and accessibility**
> definition plus the equivalent per-state damage tendency implied by `TOOL_MULT`.

i.e. **delete or relabel the numeric `STATE_MULT` column** so it is not read as a second multiplier.
Alternatively, if the design *intends* the double-application, then §2, §4, `damageFor`, and the tests
must all change together (a gameplay change, rejected here).

## 6. Recommendation

**Keep Reading A (the engine). Correct §1.2 to remove the `STATE_MULT` double-application.** This is a
documentation-only change with no gameplay effect.
