# BASELINE VERIFICATION — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Mission:** 06 (MOLT shared-victory balance)

All statements below were **executed**, not recalled. Commands and outputs are in the
`evidence/` directory and reproducible from `analysis/`.

---

## 1. Repository identity

| Property | Value | How verified |
| --- | --- | --- |
| Working tree | `/workspace/project` | `git rev-parse --show-toplevel` |
| Remote | **none configured** | `git remote -v` → empty |
| Branch | `master` | `git rev-parse --abbrev-ref HEAD` |
| HEAD | `ec9bcb46d717c96375e2378c3f281ee80f0d46a4` | `git rev-parse HEAD` |
| Working tree status | clean except git-ignored `.openhands/` | `git status --short` |

## 2. Required commits

| Commit | Present? | Subject |
| --- | --- | --- |
| `410b3ba` | **yes** (`commit`) | Mission 04 — MOLT prototype + mechanical validation |
| `433a828` | **yes** (`commit`) | Mission 05 — playtest prep, mechanics analysis, adversarial findings |
| `ec9bcb4` | **yes** (`commit`) | Mission 05 — screenshot evidence |

`git log --oneline -6` shows the three commits in linear order on `master`.

## 3. Mission 03–05 deliverables present

- `mission03/GAME_MECHANICS_SPECIFICATION.md`, `mission03/WINNING_GAME_DESIGN.md` — read in full (relevant sections).
- `mission04/prototype/` (frozen engine + tests), `mission04/evidence/` (47 checksummed artifacts).
- `mission05/` — 12 deliverables + playtest kit + `SHA256SUMS.txt` (35 checksummed artifacts).

## 4. Evidence checksums

| Suite | Command | Result |
| --- | --- | --- |
| Mission 04 | `sha256sum -c evidence/SHA256SUMS.txt` | **47 / 47 OK** |
| Mission 05 | `sha256sum -c SHA256SUMS.txt` | **35 / 35 OK** |

## 5. Frozen prototype integrity

- `git diff --stat 410b3ba -- research/reddit-daily-game-2026/mission04/prototype/` → **empty** (unchanged since Mission 04).
- Prototype tests: `npm test` → **42 / 42 passed** (4 files: engine 15, adversarial 14, balance 7, server 6).
- Type check: `npx tsc --noEmit` → **exit 0** (clean).

## 6. Actual engine formulas (read from source, not summarised)

`src/engine/rules.ts`:
```
ZONE_VALUE   = { crown:30, hide:22, gut:28, claw:24, tail:16 }
STATE_MULT   = { armoured:0.55, exposed:1.0, raw:1.7 }         // §1.2
TOOL_MULT[tool][state]:
  cleave { armoured:1.6, exposed:1.0, raw:0.6 }
  pierce { armoured:0.6, exposed:1.0, raw:1.6 }
  burn   { armoured:1.0, exposed:0.6, raw:1.6 }
CROWD_BANDS  = [ {>=0.30:0.7}, {>=0.10:1.0}, {>=0.03:1.4}, {>=0.0:1.9} ]
INTEGRITY_COEFF = 1000 ; INTEGRITY_CAP = 12000                 // §1.5
```
`src/engine/resolve.ts`:
```
damageFor  = round( ZONE_VALUE[zone] * TOOL_MULT[tool][state] * CROWD_FACTOR(share) )   // STATE_MULT NOT applied
integrityFor(n) = min(INTEGRITY_COEFF * sqrt(n), INTEGRITY_CAP)
outcome = totalDamage >= integrity ? 'SLAIN' : 'ESCAPED'
```

## 7. Tests that pin the disputed rules

- `tests/engine.test.ts:31` — `expect(TOOL_MULT.pierce.exposed).toBe(1.0)` → **C2 is locked to the spec's 1.0**, not the design doc's 1.6.
- `tests/engine.test.ts:56–61` — `integrityFor(1)=1000`, `integrityFor(100)=10000`, `integrityFor(1000)=12000` (cap) → the sqrt+cap formula is a **tested invariant**.
- `tests/engine.test.ts:109–121` — the §4 example: `gut:pierce@2% = 53`, `crown:cleave@40% = 34` → the engine reproduces §4 exactly (no STATE_MULT).
- `tests/balance.test.ts` — encodes the **design intent**: no static dominant strategy; the herd position is the worst; the beast re-forms. **All run at n=40** — i.e. entirely *below* the A5 threshold (see §9).

## 8. Analysis-model fidelity (so the A5 derivation is grounded, not re-implemented)

`analysis/fidelity-check.ts` proves the analysis model equals the engine:

| Check | Result |
| --- | --- |
| `dmgFor` vs engine `damageFor` (3000 samples) | **3000 / 3000** |
| `totalDamage` vs engine `resolveDay` (520 crowds) | **520 / 520** |
| **Overall** | **3520 / 3520** |

## 9. Stop-condition check (Mission 06 §11)

| Stop condition | Status |
| --- | --- |
| Original mechanics cannot be reconstructed | **No** — reconstructed and pinned by tests |
| The reported A5 result cannot be reproduced | **No** — reproduced exactly (N=348, §A5 doc) |
| Proposed correction conflicts with approved identity | **No** — the linear form keeps every rule; it changes one constant's shape |
| A population-aware formula requires fundamental redesign | **No** — see `COEFFICIENT_SENSITIVITY_ANALYSIS.md` §5 |
| Prototype baseline inconsistent | **No** — 42/42, tsc clean, hashes stable |
| A result depends on fabricated assumptions | **No** — every assumption is stated; every number reproducible |

**No stop condition is triggered.** Proceeding to analysis.

## 10. Scope note

This mission changed **no** gameplay, **no** engine file, and **no** specification. All output is new
files under `research/reddit-daily-game-2026/mission06/`. The Mission 03–05 trees are untouched.
