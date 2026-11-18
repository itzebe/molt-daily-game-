# C1 RULE RESOLUTION — `STATE_MULT`

**Decision A · Status:** RESOLVED (documentation only; **no engine change**)
Evidence: `evidence/spec-doc-diff.patch`, `research/reddit-daily-game-2026/mission09/C1_FULL_INVESTIGATION.md`.

---

## 1. The contradiction

`GAME_MECHANICS_SPECIFICATION.md` §1.2 defined a per-state "multiplier on damage"
(`armoured` 0.55, `exposed` 1.00, `raw` 1.70). The normative algorithm (§2) and the worked example
(§4) omit any such factor — damage is `ZONE_VALUE × TOOL_MULT × CROWD_FACTOR`. The engine and all
tests implement §2/§4. This is the `STATE_MULT` contradiction recorded in Mission 04
(`KNOWN_LIMITATIONS.md` D1) and re-analysed in Mission 09.

## 2. Resolution

**There is no separate `STATE_MULT`.** A zone's state changes damage **only** through
`TOOL_MULT[tool][state]` (§1.3). The §1.2 table was a **double-count**: the state's effect is already
encoded in which tool counters it.

## 3. Supporting evidence (primary sources, same document)

| Source | What it shows |
|---|---|
| §2 (normative algorithm) | `dmg = ZONE_VALUE × TOOL_MULT × CROWD_FACTOR` — no state factor |
| §4 (worked example) | `crown:cleave` (armoured) = `30 × 1.6 × 0.7 = 34`. With `STATE_MULT[armoured]=0.55` it would be **18** — contradicted |
| `WINNING_GAME_DESIGN.md` §2.4 | scoring formula has no state factor |
| Engine (`resolve.ts:damageFor`) | implements §2/§4; comment explicitly records the contradiction |
| Tests (`engine.test.ts` §4 golden test) | pins 34 and 53 — only true with no `STATE_MULT` |

## 4. Why the alternative (apply `STATE_MULT`) is rejected

Mission 09 (`C1_FULL_INVESTIGATION.md`) showed that applying §1.2's multipliers makes the beast
**harder as it hardens** (ceiling falls 34.79 → 25.95), and combined with §3.7 (escape adds armour)
creates a **death spiral**: the shared goal becomes unreachable and **no valid integrity constant
exists**. The alternative is not merely under-documented; it breaks the design.

## 5. The change made

`GAME_MECHANICS_SPECIFICATION.md` §1.2 — the table now reads "effect on damage" with the state
applying "through `TOOL_MULT` (§1.3)", plus an explicit note that no separate `STATE_MULT` exists and
that the earlier per-state multipliers are **rejected** (double-count). §7's alt-accounting row was
corrected to the linear integrity scale. **No engine line was changed for C1.**

## 6. Regression check added

`tests/engine.test.ts` → *"C1 regression: no separate STATE_MULT — state acts only through TOOL_MULT"*:
asserts `crown:cleave` (armoured) = **34** and a raw-zone counter = **91** (not `×1.70`). Fails if any
state factor is reintroduced.
