# Baseline Integrity Report

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · **Mode:** research only · **Implementation authority:** NOT GRANTED

Verified **before** any analysis. All commands are reproducible.

---

## 1. Repository state — MATCHES the expected baseline

| Item | Expected | Verified | Match |
|---|---|---|---|
| HEAD | `d6a4338` | `d6a433868cd9fd1b9370b0d7cc12bf5a910d4c52` | ✅ |
| Branch | `master` | `master` | ✅ |
| Remotes | none | none (`git remote -v` empty) | ✅ |
| Worktree | clean except gitignored | only `?? .openhands/` (gitignored) | ✅ |

`git log --oneline -8`:

```
d6a4338 Mission 07 — MOLT living beast: strategic depth, crowd psychology, T6 resolution
4b41b86 Mission 06 — MOLT shared-victory balance, mechanics resolution, adversarial verification
ec9bcb4 research(reddit-daily-game-2026): add Mission 05 screenshot evidence of the frozen build
433a828 research(reddit-daily-game-2026): M2 playtest prep, mechanics analysis, adversarial findings (Mission 05)
410b3ba research(reddit-daily-game-2026): add MOLT prototype and mechanical validation (Mission 04)
```

All five historical commits present. **No discrepancy → proceeding.**

---

## 2. Prior mission evidence integrity (SHA256)

| Mission | Manifest | `sha256sum -c` | Expected | Match |
|---|---|---|---|---|
| 04 | `mission04/evidence/SHA256SUMS.txt` | 47 OK | 47 | ✅ |
| 05 | `mission05/SHA256SUMS.txt` | 35 OK | 35 | ✅ |
| 06 | `mission06/SHA256SUMS.txt` | 49 OK | 49 | ✅ |
| 07 | `mission07/SHA256SUMS.txt` | 36 OK | 36 | ✅ |

Prior evidence is **untouched and intact**. No prior artifact was modified.

---

## 3. Frozen prototype identity

`git diff --stat 410b3ba -- research/reddit-daily-game-2026/mission04/prototype/` → **empty**
(prototype byte-identical since Mission 04).

Engine SHA-256, cross-checked against `mission05/PLAYTEST_BUILD_MANIFEST.md`:

| File | SHA-256 | Manifest | Match |
|---|---|---|---|
| `src/engine/rules.ts` | `7f3acade…05221d` | `7f3acade…05221d` | ✅ |
| `src/engine/resolve.ts` | `bef86050…499ebdd` | `bef86050…499ebdd` | ✅ |
| `src/engine/molt.ts` | `c4af735b…12212d79` | `c4af735b…12212d79` | ✅ |
| `src/engine/game.ts` | `55ebf720…3d879de3` | `55ebf720…3d879de3` | ✅ |

---

## 4. Build / test / typecheck results

Run in `research/reddit-daily-game-2026/mission04/prototype/`:

| Check | Command | Result |
|---|---|---|
| Tests | `npm test` | **4 files, 42/42 tests pass** ✅ |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors ✅ |
| Build | `npm run build` | ✅ built in 849 ms (37 modules) ✅ |

`dist/` is gitignored (verified with `git check-ignore`), so the build left no tracked change.

---

## 5. Unapproved-gameplay-change scan

| Check | Result |
|---|---|
| `git diff --stat` (tracked files) | empty ✅ |
| `git status --short` | only `?? .openhands/` (gitignored) ✅ |
| `git diff --name-only 410b3ba -- mission03 mission04` | empty ✅ |

**No unapproved gameplay change has appeared.** The integrity formula is still the frozen
`min(1000·√N, 12000)` (`resolve.ts:81–82`).

---

## 6. Conclusion

> The repository is exactly in the expected state. Baseline integrity is **VERIFIED**.
> No blocker. Mission 08 may proceed — research only.

**Nothing in this mission modifies** the engine, the prototype UI, gameplay rules, the integrity
constant, C1, C2, or any prior mission evidence.
