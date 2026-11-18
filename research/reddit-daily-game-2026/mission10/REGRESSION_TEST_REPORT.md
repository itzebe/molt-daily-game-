# REGRESSION TEST REPORT

**Mission 10 · MOLT · Date:** 2026-11-18
Evidence: `evidence/test-suite-output.txt`, `evidence/typecheck-output.txt`, `evidence/build-output.txt`.

---

## 1. Exact commands and results

| Check | Command | Result |
|---|---|---|
| Unit/integration tests | `npm test` (`vitest run`) | **44 passed / 0 failed** (4 files) |
| Type check | `npx tsc --noEmit` | **exit 0**, no errors |
| Production build | `npm run build` (`vite build`) | **built in ~840 ms**, no errors |

Test files: `engine.test.ts` (17), `adversarial.test.ts` (14), `balance.test.ts` (7),
`server.test.ts` (6).

## 2. Tests updated for the approved change

Three assertions encoded the **old sqrt** behaviour and were updated to the approved linear formula
(this is a rule change, so the old expectations are legitimately obsolete):

| File | Before | After |
|---|---|---|
| `engine.test.ts` | `integrityFor(1)=1000, (100)=10000, (1000)=12000` (capped) | `(1)=30, (100)=3000, (1000)=30000`; linearity ratios |
| `adversarial.test.ts` | `d2/d1 < 10` (sub-linear, sqrt) | `d2/d1 === 10` (exactly linear); `Δ = 30·90` |
| `adversarial.test.ts` | `res.integrity === 1000` for 1 player | `=== 30` |

These are **not** weakened tests: they now assert the *shipped* rule precisely, including a
strict-equality linearity check the sqrt form could never satisfy.

## 3. New regression tests added

| Test | Guards |
|---|---|
| *integrity is linear in the number of distinct strikers* | `30·N`, no cap, exact linearity |
| *C1 regression: no separate STATE_MULT* | `crown:cleave`(armoured)=34, raw counter=91 |
| *C2 regression: pierce vs exposed is 1.0* | `TOOL_MULT.pierce.exposed===1.0`, §4 golden 53, full exposed column |

## 4. Unchanged tests (must still pass — they do)

The §4 golden worked example, the determinism test (same history → same outcome), the low-participation
tests (0 and 1 player), the duplicate-strike test, the balance/payoff-matrix suite, and all six
server API tests pass **without modification**, confirming the change did not disturb the mechanics
they cover.

## 5. Skipped tests

**None.** No test is skipped or environment-gated in this suite; every listed test ran.
