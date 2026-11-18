# Implementation Specification

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · **Status: SPECIFICATION ONLY — NOT IMPLEMENTED. No code was changed.**

This is the exact change that *would* be made if the owner approves a constant. It is **small and
isolated**: one function and two constants. **Nothing in this document has been applied.** C1/C2 are
**not** touched.

---

## 1. Current formula and location

`research/reddit-daily-game-2026/mission04/prototype/src/engine/resolve.ts:81–82`:

```ts
export function integrityFor(n: number): number {
  return Math.min(INTEGRITY_COEFF * Math.sqrt(n), INTEGRITY_CAP);
}
```

Constants at `src/engine/rules.ts:78–79`:

```ts
export const INTEGRITY_COEFF = 1000; // §1.5
export const INTEGRITY_CAP = 12000;  // §1.5
```

Call site: `resolve.ts:137` → `const integrity = integrityFor(n);` (used in the `SLAIN`/`ESCAPED`
comparison at `resolve.ts` and stored on `DayResolution.integrity`).

---

## 2. Proposed replacement formula

```ts
// rules.ts
export const INTEGRITY_LINEAR_K = 30; // or 29; see §4

// resolve.ts
export function integrityFor(n: number): number {
  if (n <= 0) return 0;            // preserve the engine's n=0 semantics (see §3)
  return INTEGRITY_LINEAR_K * n;
}
```

**Exact constant:** **`k = 30`** (primary recommendation) or **`k = 29`** (gentler alternative).
Both are defensible; **k = 27 is not** (`K27_VS_K30_DECISION.md`).

---

## 3. Integer and rounding semantics

- `k · n` is an **integer** for integer `k` and integer `n` — no rounding needed.
- The comparison stays `totalDamage >= integrity`, where `totalDamage` is an **integer** (sum of
  `Math.round`-ed per-strike damages). This is unchanged.
- **`n = 0` must remain a special case.** The current engine's `resolveDay` guards `n > 0` for the
  share denominator; `integrityFor(0) = min(1000·0, 12000) = 0` today. The new function must
  **preserve** `integrityFor(0) = 0` (or be guarded at the call site) so that a zero-participation
  day is **not** mislabelled `SLAIN`. **This is the one subtle edge case.**
- **No cap.** The current `INTEGRITY_CAP = 12000` is removed from the formula (it may be retained as
  a dead constant or deleted; deleting it is cleaner, but it is referenced in `resolve.ts:17` so the
  import must be updated).

---

## 4. Edge-case behaviour

| Case | Behaviour under `k·n` |
|---|---|
| `n = 0` | target 0; must be treated as ESCAPED (preserve the guard) |
| `n = 1` | target `k`; one strike (~21) cannot clear 29–30 → escapes (correct) |
| small `n` (< 25) | the game is trivially small; recommend a **minimum viable `n`** display/guard (see §7) |
| large `n` | linear; no cap; the per-player bar is constant |

---

## 5. Expected test changes

The frozen prototype's 42 tests reference `integrityFor`. The change would affect tests that assert
the `√N` behaviour. Expected:

- Any test asserting `integrityFor(n)` equals `min(1000·√n, 12000)` → **updated** to `k·n`.
- Tests asserting SLAIN/ESCAPED outcomes on specific days → **re-derived** (the goal is harder).
- **No behavioural test outside integrity should change** (damage, molt, aggregate are untouched).

## 6. New regression tests (required)

1. `integrityFor(0) === 0` and a zero-participation day resolves `ESCAPED`.
2. `integrityFor(n) === k·n` for a table of `n` (1, 15, 100, 1000, 100000).
3. **Monotonicity:** `integrityFor` is non-decreasing in `n`.
4. **Scale-invariance:** for a fixed strategy mix, the SLAIN/ESCAPED outcome is independent of `n`
   for `n ≥ 60` (a property test over a synthetic crowd).
5. **Trivial-rule defeat:** a beast-ignoring even spread does **not** clear `k·n` (the T6 regression).
6. **Skill sufficiency:** the beast-reading spread **does** clear `k·n`.

## 7. Required balance invariants (must hold after the change)

| ID | Invariant |
|---|---|
| BI-1 | The **lazy herd** (all on the obvious zone) never clears `k·n` for any `n`. |
| BI-2 | **No beast-ignoring rule** (herd, random, even spread, single-tool) clears `k·n` for any `n ≥ 25`. |
| BI-3 | The **beast-reading spread** clears `k·n` for `n ≥ 60` on ≥90% of days. |
| BI-4 | The outcome is **independent of `n`** for a fixed strategy mix (scale-invariance). |
| BI-5 | `integrityFor(0) = 0` and a 0-participation day is `ESCAPED`. |
| BI-6 | **Recovery:** a community that fails one day can clear the next (no permanent lock-in). |

**BI-6 is the riskiest.** The `bistability.ts` analysis shows a genuine lock-in risk at high k. If
BI-6 cannot be satisfied with `k=30`, the owner must either choose `k=29` or add a **recovery valve**.

## 8. The recovery valve (optional, only if BI-6 fails)

If playtests or simulation show the escape lock-in traps casual subs, a **minimal** valve (no new
mechanic) could be: *the escape penalty (§3.7) does not fire on two consecutive escapes.* This is a
**molt-rule** change and is **out of scope for Mission 08** — flagged only.

## 9. Rollback criteria

Revert to the current `√N` formula if **any** of:

- BI-1..BI-5 fail in the regression suite.
- A playtest shows casual subs cannot clear the goal (mean SLAIN < 40% for a mixed crowd at k=29).
- The bistability lock-in (BI-6) is observed in a 5-day playtest.

## 10. Evidence required after implementation

1. The updated test suite: **all tests pass**, with counts reported.
2. The `population-scaling` and `trivial-battery` scripts re-run against the **modified engine**,
   confirming BI-1..BI-5 (these scripts currently import the engine read-only; after the change they
   would read the new formula).
3. A `SHA256SUMS.txt` of the new engine + tests.
4. A short report stating which invariants passed and which (if any) did not.

## 11. Scope discipline

- **Touches:** `rules.ts` (one constant), `resolve.ts` (one function + one import), the tests.
- **Does NOT touch:** `molt.ts`, `game.ts`, the UI, the crowd bands, the tool/zone tables, C1, C2,
  or any prior mission evidence.
- **Preserves:** one strike per day, five zones × three tools, the crowd factor, the molt, the
  escape penalty (unless the valve is separately approved).

---

## 12. Explicit non-authorization

> This specification is **not** an implementation order. **No code has been changed.** The
> implementation requires explicit design-owner approval of a constant (see
> `DESIGN_OWNER_DECISION_SHEET.md`) and should follow a human playtest.
