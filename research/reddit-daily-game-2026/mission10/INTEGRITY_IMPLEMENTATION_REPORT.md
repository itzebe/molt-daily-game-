# INTEGRITY IMPLEMENTATION REPORT — `Integrity = 30 × N`

**Decision C · Status:** IMPLEMENTED · **Formula:** `Integrity(day) = 30 × N_distinct_strikers`
Evidence: `evidence/mission10-full-diff.patch`, `evidence/server-integrity-path.txt`,
`evidence/independent-verification-output.txt`.

---

## 1. What changed

Two engine lines and their spec:

| File | Change |
|---|---|
| `src/engine/rules.ts` | `INTEGRITY_COEFF = 1000` → **`30`**; removed `INTEGRITY_CAP` |
| `src/engine/resolve.ts` | `integrityFor`: `Math.min(INTEGRITY_COEFF * Math.sqrt(n), INTEGRITY_CAP)` → **`INTEGRITY_COEFF * n`**; removed the now-unused `INTEGRITY_CAP` import |
| `GAME_MECHANICS_SPECIFICATION.md` §1.5 | formula text updated to `30 * N_distinct_strikers`, with history note |

The function's **signature is unchanged** (`integrityFor(n: number): number`), and `n` retains its
original definition: the number of **distinct strikers** (`aggregate().n`). No rounding change: `30 × n`
is an exact integer, so integer semantics are preserved (the old form already produced integers).

```ts
// before
export function integrityFor(n: number): number {
  return Math.min(INTEGRITY_COEFF * Math.sqrt(n), INTEGRITY_CAP);
}
// after
export function integrityFor(n: number): number {
  return INTEGRITY_COEFF * n;   // INTEGRITY_COEFF = 30
}
```

## 2. Why 30, not 29 (no fallback)

Mission 09 (`mission09/K27_K29_K30_COMPARISON.md`, `combined-k-decision.ts`) established **k = 30** as
the unique integer that closes the trivial path at every population size **and** keeps the engaged
goal reachable. Mission 10 reproduced this exactly (§ benchmark report). The mission explicitly
forbids a k = 29 fallback, and the evidence supports 30, so **30 is shipped**. k = 29 is documented
only as the *playtest comparison arm* and as the rollback-adjacent tuning option, **not** as a
shipped fallback.

## 3. Preserved mechanics (unchanged)

`damageFor`, `crowdFactor`, `aggregate`, `topTool`, `molt`, `genesisState`, `submit`, `advanceDay`,
and **every coefficient** (`TOOL_MULT`, `ZONE_VALUE`, `CROWD_BANDS`, `FATIGUE_PENALTY`,
`RIDGE_PENALTY`, `OVERUSE_THRESHOLD`, `NEGLECT_THRESHOLD`, `RIDGE_THRESHOLD`, `MUTATION_STDDEV`,
`MAW`) are untouched. The independent differential harness (§ `INDEPENDENT_VERIFICATION_REPORT.md`)
proves the only behavioural divergence between baseline and changed engines is the SLAIN/ESCAPED
boundary — i.e. exactly the integrity change.

## 4. Formula is in the real execution path

`integrityFor` is called by `resolveDay` (`resolve.ts:136`), which is the engine the server's
`POST /api/advance` and `GET /api/state` use. Live check (`evidence/server-integrity-path.txt`):

```
6 distinct strikers -> integrity = 180   (30 × 6)
```

and the UI showed "shared integrity 30" for a single striker (`evidence/ui-verification-output.txt`).

## 5. No residual sqrt integrity path

`grep` of `src/` finds **no** `Math.sqrt(n)` and **no** `INTEGRITY_CAP`. The only `Math.sqrt` in the
engine is in `molt.ts` (`Math.sqrt(variance)` for the §3.5 mutation), which is unrelated and
preserved.

## 6. Scope discipline

- No gameplay coefficient altered.
- No mechanic re-tuned "to make benchmarks look better".
- The change is limited to the integrity formula and its strictly-necessary tests/doc updates.
- k = 29 fallback **not** applied.
