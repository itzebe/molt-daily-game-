# Design Owner Decision Sheet

**Mission 09 · MOLT · Date:** 2026-11-18 · **Status:** ⛔ AWAITING USER APPROVAL

Four decisions, each **separately approvable**. Nothing is implemented until you approve. The
recommended answer is stated, with the evidence and the alternative in one line.

---

## Decision A — C1: `STATE_MULT`

**Question:** should damage apply the §1.2 `STATE_MULT` (armoured 0.55 / exposed 1.00 / raw 1.70) **in
addition to** `TOOL_MULT`?

**Options**
- **A1 (recommended):** No. Keep the engine/§2/§4 formula. Fix §1.2's table to be informational only.
- A2: Yes. Implement §1.2 as a gameplay change (edit `resolve.ts`, §2, §4, the tests together).

**Evidence**
- §2 (normative), §4 (worked example), design §2.4, the engine, and the tests **all omit `STATE_MULT`**.
- `TOOL_MULT` **already encodes** the state relationship, so §1.2 **double-counts** it.
- Reading A is **stable**; Reading B creates an **escape death-spiral** (hardening *lowers* the ceiling).
- Reading B makes the ruleset **structurally unbalanced**: at small N, a trivial spread **out-performs**
  deliberate play. No valid integrity constant exists under B.

**Recommendation: A1.** Documentation-only correction; no engine change.

**If you disagree:** state that the state is *intended* to act twice. Then A2 becomes a gameplay change
**and k must be re-derived to the ≈20–24 window**, and the balance must be redesigned (B is unplayable
as-is).

- [ ] Approve A1 (recommended)
- [ ] Choose A2 (gameplay change — requires re-derivation)
- [ ] Hold / request more evidence: ____________________

---

## Decision B — C2: `pierce` vs `exposed`

**Question:** is `pierce` **strong vs exposed** (1.6, design §2.2 prose) or **neutral** (1.0, spec
§1.3/§4)?

**Options**
- **B1 (recommended):** 1.0. Keep the implemented matrix. Fix §2.2's Pierce row to "strong vs Raw".
- B2: 1.6. Implement as a gameplay change and re-run all integrity analysis.

**Evidence**
- §1.3, §4, design §2.4, the engine, and the tests **all say 1.0**.
- §2.2 **contradicts its own document** (§2.4 uses the spec matrix).
- 1.0 keeps tool symmetry (one strong tool per state); 1.6 makes pierce **dominant** on every exposed zone.
- **Decisive:** under 1.0 a valid k exists (k=30). Under 1.6 **no integer k** both closes the trivial
  path and keeps the engaged crowd winning.

**Recommendation: B1.** Documentation-only correction; no engine change.

**If you disagree:** B2 is a gameplay change **and**, because 1.6 alone leaves no valid k, the counter
matrix would need **redesigning**, not a single-number edit.

- [ ] Approve B1 (recommended)
- [ ] Choose B2 (gameplay change — requires matrix redesign)
- [ ] Hold / request more evidence: ____________________

---

## Decision C — Integrity formula & constant

**Question:** replace `min(1000·√N, 12000)` with a linear `k·N`; if so, which k?

**Options**
- **C1 (recommended):** `Integrity = 30·N`.
- C2: `Integrity = 29·N` (gentler, but the trivial path is open at tiny N).
- C3: keep the current √N (rejected: cosmetic at scale).

**Evidence** (engine rules — i.e. contingent on A1 & B1)
- Current √N: at N = 1000 even the lazy herd clears **100 %** → the shared goal is cosmetic.
- **k = 30** is the **unique** integer that closes the trivial path (max ignoring SLAIN **0.7 %**) while
  the engaged crowd still clears (**98.7 %**). k = 29 leaves the trivial path open (50 %); k = 31 makes
  it unwinnable (0 %).
- **Risk:** the failure cliff is razor-thin — between k = 30.00 and k = 30.02 (+0.02 margin). The
  outcome is **path-dependent**: it is decided by the first 2–3 days.
- k = 29 has a comfortable margin (+1.02) but fails the decisive criterion.

**Recommendation: C1 (k = 30), with k = 29 documented as the fallback** contingent on Decision D.

**If you prefer margin over strictness:** choose k = 29 and accept the tiny-N trivial gap.

- [ ] Approve C1 → **k = 30** (recommended)
- [ ] Approve k = 29 (safer margin; trivial path open at tiny N)
- [ ] Keep current √N (not recommended)
- [ ] Hold pending Decision D

---

## Decision D — Authorise the human playtest

**Question:** authorise a **test build** (k=29 vs k=30, counterbalanced, 8 participants) to resolve the
one question the model cannot — *can a real crowd clear the opening at k = 30?*

**Options**
- **D1 (recommended):** Authorise the playtest (test build only; not the shipped game).
- D2: Skip the playtest; ship k = 30 on the model evidence alone.
- D3: Skip the playtest; ship k = 29 conservatively.

**Evidence**
- The model cannot tell whether a real mixed crowd engages enough to clear the opening.
- The failure cliff's thin margin (+0.02) makes this the **single highest-value open question**.
- A 50 %-engaged crowd clears no k ≥ 28, so the outcome hinges on real engagement.

**Recommendation: D1.** The test is prepared and ready (`HUMAN_PLAYTEST_PROTOCOL.md`); no participant
has been contacted.

- [ ] Authorise the playtest (recommended)
- [ ] Skip → ship k = 30
- [ ] Skip → ship k = 29
- [ ] Hold

---

## Summary

| Decision | Recommendation | Engine change? |
|---|---|---|
| A — C1 | keep engine (A1) | no (docs only) |
| B — C2 | keep 1.0 (B1) | no (docs only) |
| C — integrity | **k = 30** | yes (one constant + one function) |
| D — playtest | authorise | no |

**Ordering matters:** A and B must be settled **before** C, because C's constant is contingent on the
rule reading (see `C1_C2_COMBINED_ANALYSIS.md`).
