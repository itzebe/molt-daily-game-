# C1 — STATE_MULT: Full Investigation

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/c1-investigation-output.txt`,
`evidence/fidelity9-output.txt`, `evidence/combined-c1c2-output.txt`
**Categories:** `[PROOF]` exact · `[ENGINE]` engine-verified · `[SIM]` seeded simulation

**No file is modified. This is a recommendation only.**

---

## 1. The contradiction, stated exactly

Two rule documents disagree about whether a **zone-state multiplier** (`STATE_MULT`) is applied in
addition to the tool matrix.

**`mission03/GAME_MECHANICS_SPECIFICATION.md` §1.2** defines:

| state | multiplier on damage |
|---|---|
| `armoured` | 0.55 |
| `exposed` | 1.00 |
| `raw` | 1.70 |

**`…SPECIFICATION.md` §2** (the *normative* daily-resolution algorithm, the one the server runs) and
**§4** (the worked example) compute damage **without** it:

```
dmg(s) = ZONE_VALUE[zone] × TOOL_MULT[tool][state] × CROWD_FACTOR(share)
```

**`mission03/WINNING_GAME_DESIGN.md` §2.4** gives the same formula (no `STATE_MULT`).

The engine (`resolve.ts:damageFor`) and the tests (`tests/engine.test.ts`) implement **§2/§4**.

### The two readings

- **Reading A (engine, §2, §4, design §2.4, tests):**
  ```
  dmg = ZONE_VALUE × TOOL_MULT[tool][state] × CROWD(share)
  ```
- **Reading B (§1.2):**
  ```
  dmg = ZONE_VALUE × STATE_MULT[state] × TOOL_MULT[tool][state] × CROWD(share)
  ```

### Why B is a **double-application** (the crux)

`TOOL_MULT` **already encodes the state relationship**:

| tool | armoured | exposed | raw |
|---|---|---|---|
| cleave | **1.6** | 1.0 | 0.6 |
| pierce | 0.6 | 1.0 | **1.6** |
| burn | 1.0 | 0.6 | **1.6** |

The state's *entire gameplay effect* is "which tool is right". §1.3's own note says so: the matrix
"guarantees every state has at least one counter". Applying `STATE_MULT` **on top** multiplies the
state a **second** time. That is the defect.

---

## 2. Evidence hierarchy

Ranked by authority, strongest first. **Implementation does not automatically equal intent** — so
each source is weighed, not merely counted.

| Rank | Source | Reading | Why it carries weight |
|---|---|---|---|
| 1 | **§2 — the normative algorithm** | **A** | This is *the algorithm the server executes*. It is the operative definition of "damage". |
| 2 | **§4 — the worked example** | **A** | Concrete, cross-checked numbers (`28 × 1.0 × 1.9 = 53`; `30 × 1.6 × 0.7 = 34`). Under B, the herd number would be 18, contradicting the printed 34. |
| 3 | **Engine `damageFor`** | **A** | Working, tested implementation; matches §2/§4. |
| 4 | **Unit tests** | **A** | `engine.test.ts:31` pins `TOOL_MULT.pierce.exposed = 1.0`; `:119` pins `gut:pierce@2% = 53`; `:120` pins `crown:cleave@40% = 34`. |
| 5 | **Design §2.4 formula** | **A** | `WINNING_GAME_DESIGN.md` §2.4 writes the formula **without** `STATE_MULT` — the design doc contradicts its own §2.2-style prose elsewhere and agrees with A here. |
| 6 | **§1.2 table** | **B** | A **descriptive** table ("multiplier on damage") that §2 does not use. Isolated; contradicted by every normative source. |

**No source supports Reading B except §1.2 itself.** There is no design rationale anywhere that
argues for applying the state twice. §1.2 is best read as an **early draft** superseded by §2/§4.

> **Verification of the double-count claim `[ENGINE]`:** `fidelity9.ts` proves `lib9` with
> `ENGINE_RULES` reproduces `damageFor`/`resolveDay`/`integrityFor` **906/906**. The Reading-B numbers
> are produced by the *same* library with `applyStateMult = true`, so they are the exact arithmetic
> consequence of §1.2, not an approximation.

---

## 3. The two readings, numerically `[PROOF]`

Exact damage, share < 3 % (crowd ×1.9). Full 15-combo table in the evidence file.

| zone:tool | state | A (engine) | B (§1.2) | B/A |
|---|---|---|---|---|
| crown:cleave | armoured | **91** | 50 | 0.55 |
| gut:pierce | exposed | 53 | 53 | 1.00 |
| tail:burn | raw | 49 | 83 | 1.69 |
| crown:cleave | raw | 34 | 58 | 1.70 |
| tail:pierce | armoured | 18 | 10 | 0.55 |

- **Exposed zones:** identical (STATE_MULT[exposed] = 1.0). This is why the *genesis* ceiling is
  unchanged (§4) — and why a static genesis-only test misses the effect.
- **Armoured zones:** B **halves** them (0.55×).
- **Raw zones:** B **inflates** them (1.70×).

---

## 4. Effect on the achievable ceiling `[PROOF]`

Best total damage per striker (exact DP over the 15 combos), N = 2000:

| beast state | A (engine) | B (§1.2) | B/A |
|---|---|---|---|
| genesis (all exposed) | 34.79 | 34.79 | 1.000 |
| 1 armoured (crown) | 39.98 | 32.11 | 0.803 |
| 2 armoured | 43.80 | 29.67 | 0.677 |
| 3 armoured | 45.60 | 27.74 | 0.608 |
| 5 armoured | 47.23 | 25.95 | 0.549 |

**This is the decisive structural difference.**

- **Reading A:** hardening a zone **raises** the ceiling. An armoured zone still yields 1.6× with
  the *right* tool, so the ceiling climbs 34.79 → 47.23 as the beast hardens.
- **Reading B:** hardening **lowers** the ceiling (34.79 → 25.95). The state multiplier fights the
  tool multiplier.

---

## 5. The death-spiral consequence `[PROOF]` + `[SIM]`

§3.7 of the spec says: **an ESCAPED day adds armour** to the beast. Combine that with the ceilings:

| escapes (armour added) | A ceiling | B ceiling |
|---|---|---|
| 0 | 34.79 | 34.79 |
| 1 | 39.98 ↑ | 32.11 ↓ |
| 2 | 43.80 ↑ | 29.67 ↓ |
| 5 | 47.23 ↑ | 25.95 ↓ |

- Under **A**, escaping makes the beast **easier** next day (self-correcting).
- Under **B**, escaping makes the beast **harder** next day → **death spiral**: the sub can lock into
  permanent escape.

Dynamically `[SIM]` (150 days, state evolves, mean of last 20):

| reading | even-5 spread (beast-ignoring) | top5 spread (beast-reading) |
|---|---|---|
| A (engine) | 23.00 | 29.70 – 32.25 |
| B (§1.2) | 12.80 | 24.70 – 45.10 |

Under B the beast-ignoring ceiling **drops to 12.80**, and the beast-reading floor **falls below**
the beast-ignoring ceiling at small N (24.70 vs 27.44) — see §7.

---

## 6. Implied integrity constant under each reading `[SIM]`

Feasible window = (max beast-ignoring, min beast-reading]:

| reading | max beast-ignoring | min beast-reading | implied k window |
|---|---|---|---|
| A (engine) | 24.00 | 29.70 | **[24, 29]** |
| B (§1.2) | 19.20 | 24.70 | **[20, 24]** |

**C1 shifts the required k by roughly 5–7 units.** A k chosen for Reading A (≈29–30) would be
*wrong* under Reading B (which would want ≈20–24). **C1 is load-bearing on the integrity decision.**

---

## 7. Interaction with C2 and the empty window

Full analysis in `C1_C2_COMBINED_ANALYSIS.md`. The headline: under Reading B **no integer k
satisfies both constraints at every N** — the beast-ignoring ceiling exceeds the beast-reading floor,
i.e. **a trivial strategy out-performs deliberate play**. That is a *rule-set* failure, not a
constant-tuning problem.

---

## 8. Recommendation

> **Recommendation: retain the engine interpretation (Reading A) and correct the documentation.**
> In `GAME_MECHANICS_SPECIFICATION.md` §1.2, relabel the numeric column as **informational only**
> (the state's damage effect is applied through `TOOL_MULT` §1.3, not a second multiplier), or delete
> it. **No engine change.** This is a documentation-only correction.

**Rationale (in order of strength):**

1. §2 (normative) and §4 (worked example) both omit `STATE_MULT`; the design doc §2.4 agrees.
2. `TOOL_MULT` already encodes the state, so §1.2's table double-counts it.
3. Reading A is **stable** (no escape death-spiral); Reading B creates one.
4. Reading B makes the rule-set **structurally unbalanced** (trivial play beats deliberate play at
   some N) and shifts the required k by ~5–7, invalidating Mission 08's constant.

**What would change the recommendation:** a **written design rationale** (a spec section, a design
note, or a commit message) that states the state is *intended* to act twice — i.e. that an armoured
zone should be ~3.1× worse than a raw one *with the right tool*. **No such rationale exists in the
repository.** If the design owner states this intent, then Reading B must be implemented as a
**gameplay change** (edit `resolve.ts`, §4, §2, and the tests together), and **k must be re-derived**
to the ≈20–24 window. **Not recommended.**

**Request further evidence?** Only the design owner can supply the intent. Absent that, the evidence
favours A decisively.

**Hold?** Not warranted: the evidence for A is strong and multiply corroborated.
