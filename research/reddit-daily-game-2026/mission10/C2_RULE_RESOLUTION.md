# C2 RULE RESOLUTION — pierce vs exposed

**Decision B · Status:** RESOLVED (documentation only; **no engine change**)
Evidence: `evidence/spec-doc-diff.patch`, `research/reddit-daily-game-2026/mission09/C2_FULL_INVESTIGATION.md`.

---

## 1. The contradiction

`WINNING_GAME_DESIGN.md` §2.2's prose table listed **Pierce: Strong vs Exposed**, implying a 1.6×
multiplier. The normative `TOOL_MULT` matrix (specification §1.3), the §4 worked example, the
design's own §2.4, the engine, and the tests all have **pierce vs exposed = 1.0** (neutral).

## 2. Resolution

**pierce vs exposed = 1.0.** `exposed` is the neutral state; **every** tool is 1.0 against it (except
`burn`, which is 0.6 — weak). Pierce is strong vs **raw** (1.6) and weak vs **armoured** (0.6).

## 3. Supporting evidence

| Source | pierce vs exposed |
|---|---|
| Spec §1.3 `TOOL_MULT` (normative matrix) | 1.0 |
| Spec §4 worked example (`gut:pierce` = 53 = `28 × 1.0 × 1.9`) | 1.0 |
| Design §2.4 scoring | consistent with 1.0 |
| Engine (`rules.ts` `TOOL_MULT`) | 1.0 |
| Tests (`engine.test.ts` §1.3 table + §4 golden) | 1.0 |

The only dissenting source is §2.2's own prose table, which also contradicts §2.4 in the **same
document** (a self-contradiction, not a competing authority).

## 4. Why 1.6 is rejected

Mission 09 (`C2_FULL_INVESTIGATION.md`) showed 1.6 makes `pierce` the **sole best tool on every
exposed zone**, collapsing the tool-choice skill axis and leaving **no valid integrity constant**
(the trivial path and the engaged path converge). It breaks both the balance and the k-decision.

## 5. The change made

`WINNING_GAME_DESIGN.md` §2.2 — the table now has a **Neutral vs** column, with **Pierce: Strong vs
Raw, Neutral vs Exposed, Weak vs Armoured**, plus a note that exposed is neutral for every tool and
that this matches the normative §1.3 matrix. **No engine line was changed for C2.**

## 6. Regression check added

`tests/engine.test.ts` → *"C2 regression: pierce vs exposed is 1.0 (neutral), not 1.6"*: asserts
`TOOL_MULT.pierce.exposed === 1.0`, the §4 golden value 53, and the full exposed column
(cleave 1.0, pierce 1.0, burn 0.6). Fails if 1.6 is reintroduced.
