# C1 / C2 Relevance Review

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · Categories: `[PROOF]` · `[ENGINE]`
**Evidence:** `evidence/c1c2-sensitivity-output.txt`; source `mission05/MECHANICS_CONTRADICTION_ANALYSIS.md`

**C1 and C2 are NOT resolved here and NO specification is edited.** This document only answers the
Mission 08 question: *do C1/C2 affect the integrity decision?* **Yes — as a dependency. The k
analysis follows the engine; if either contradiction were resolved the other way, k must be
re-derived.**

---

## 1. What C1 and C2 are (from the primary evidence)

| # | Contradiction | Documents | Engine's side |
|---|---|---|---|
| **C1** | `STATE_MULT` (§1.2: armoured 0.55, raw 1.70) is **absent** from the damage formula (§2) and the worked example (§4). | §1.2 vs §2+§4 | §2+§4 — `damageFor` does **not** apply `STATE_MULT` |
| **C2** | `pierce` vs `exposed`: design doc §2.2 says **1.6×** (strong); spec §1.3/§4 say **1.0×** (neutral). | design §2.2 vs spec §1.3+§4 | §1.3+§4 — engine uses **1.0** |

The engine is the authoritative behavioural reference for Mission 08. Both the Mission 06 decision
and this mission therefore follow the **as-built** behaviour.

---

## 2. Sensitivity of the ceilings to C1 [PROOF]

`c1c2-sensitivity.ts`, `crown:cleave` on an **armoured** zone:

| reading | damage |
|---|--:|
| engine (C1 not applied) | **34** |
| hypothetical C1 applied (×0.55) | **18** |

**C1 changes evolved-state damage by a factor of `STATE_MULT` (0.55 armoured / 1.70 raw).** Since
the beast spends most of its life with armoured/raw zones, **C1 shifts every evolved-state ceiling
and therefore the feasible k window.**

On the **genesis (all-exposed)** beast, `STATE_MULT[exposed] = 1.0`, so C1 has **no** effect — which
is precisely why Mission 07 (genesis-only) did not see it.

---

## 3. Sensitivity of the ceilings to C2 [PROOF]

`crown:pierce` vs an **exposed** zone:

| reading | damage |
|---|--:|
| engine (1.0) | 21 |
| hypothetical C2 (0.6) | 13 |

**C2 changes pierce-vs-exposed damage by ~40%**, and the genesis DP-optimal ceiling moves from
**34.79 → 30.09** (a ~13% drop) if C2 were read the other way. A ~13% drop in the ceiling is
**larger than the k window itself** (~1 unit on ~30). So **C2 is also load-bearing.**

---

## 4. Verdict — relevance to the integrity decision

| Question | Answer |
|---|---|
| Does C1 affect the integrity decision? | **YES** — it changes evolved-state damage by 0.55–1.70×, shifting the k window. |
| Does C2 affect the integrity decision? | **YES** — it changes pierce-vs-exposed by ~40% and the genesis ceiling by ~13%. |
| Are they resolved here? | **NO.** Not resolved, not edited. |
| Does Mission 08's k follow the engine? | **YES** — the as-built formula (C1 not applied; pierce:exposed = 1.0). |
| What if C1/C2 are resolved the other way? | **The k window MUST be re-derived** before the integrity change is implemented. |

**Ordering note for the design owner:** C1 and C2 are **upstream** of the integrity decision. They
should be settled (as documentation corrections, per Mission 06's recommendation) **before** k is
fixed, so that the k is derived against the final damage tables. Mission 08 does **not** combine
these documentation corrections with the integrity change (per the brief).

---

## 5. What Mission 08 does NOT do

- Does **not** resolve C1 or C2.
- Does **not** edit any specification or design document.
- Does **not** re-derive k under the alternative readings (out of scope); it only **flags** that
  this would be required.
