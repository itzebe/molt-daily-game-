# ENGINE BEHAVIOUR PRESERVATION

**Mission 10 · MOLT · Date:** 2026-11-18
Evidence: `evidence/mission10-full-diff.patch`, `evidence/independent-verification-output.txt`.

---

## 1. Method

A pristine baseline engine (git worktree at `bc49714`) and the Mission 10 engine were imported into
one process and driven with **identical inputs** across a large randomised differential
(`analysis/independent-verification.ts`). Any difference in a preserved mechanic would be a failure.

## 2. Result — the only divergence is the integrity boundary

| Differential | Count | Result |
|---|---|---|
| `integrityFor` runtime values | 13 | changed values are exactly `30·n`; baseline reproduces old sqrt |
| `damageFor` (random states/strikes/shares) | 400 | **identical** |
| `crowdFactor` | 400 | **identical** |
| `molt` (from identical resolutions) | 300 | **identical whenever the outcome is identical**; differs only when the outcome differs (the §3.7 escape penalty reads `outcome`) |
| Full-day resolve (random crowds, N up to 120) | 300 | N, `totalDamage`, `aggregate`, and every per-submission damage/isRead **identical** |
| Day outcomes vs baseline | 300 | 4 divergences — **each** verified to lie strictly between the two integrity targets `[min,max)` |
| **Total** | **2923** | **PASS 2923 / FAIL 0** |

The 4 outcome divergences and the 4 molt divergences coincide exactly and are fully explained by the
changed threshold: `totalDamage` sits between `30·N` and the old `min(1000√N,12000)`, so one engine
says SLAIN and the other ESCAPED, and the §3.7 penalty then (correctly) propagates that into the molt.

## 3. What is provably unchanged

- **Damage calculation** — `damageFor` byte-identical behaviour (400/400).
- **Tool coefficients / zone coefficients** — `TOOL_MULT`, `ZONE_VALUE` untouched (in `rules.ts`
  diff, only the integrity constants changed).
- **Crowd factor / fatigue / ridge** — inside `damageFor`; identical (400/400).
- **Molt / mutation / over-use / neglect / escape / ridge rules** — identical whenever the outcome
  matches (the escape penalty's dependence on outcome is intended and pre-existing).
- **Individual scoring, shared scoring (except the constant), daily strike limits, action semantics**
  — no diff.

## 4. Files touched (complete list)

```
src/engine/resolve.ts        (integrityFor + removed unused import)
src/engine/rules.ts          (INTEGRITY_COEFF 1000->30; removed INTEGRITY_CAP)
tests/engine.test.ts         (integrity expectations + C1/C2 regressions)
tests/adversarial.test.ts    (2 sqrt-based expectations updated to linear)
GAME_MECHANICS_SPECIFICATION.md, WINNING_GAME_DESIGN.md, and 4 mission03 docs (documentation)
```

No other source file changed. `src/server/*`, `src/client/*`, `src/engine/molt.ts`,
`src/engine/game.ts` are **untouched**.
