# Mission 09 — Baseline Integrity Report

**MOLT · Rule Integrity, Mathematical Revalidation & Human Playtest Readiness**
**Date:** 2026-11-18 · **Mode:** research only · **Implementation authority: NOT GRANTED**

Everything in this file was **verified against the working tree at the start of Mission 09**, not
assumed. Commands are given so the check is reproducible.

---

## 1. Repository, branch, worktree

| Check | Command | Result |
|---|---|---|
| HEAD | `git log --oneline -8` | `0697eb2` (Mission 08) |
| Branch | `git branch --show-current` | `master` |
| Remotes | `git remote -v` | **none** (local-only, as expected) |
| Worktree | `git status --short` | clean except untracked `.openhands/` (gitignored) |

**History matches the expected chain exactly:**

```
0697eb2 Mission 08 — MOLT integrity decision gate
d6a4338 Mission 07 — MOLT living beast
4b41b86 Mission 06 — MOLT shared-victory balance
ec9bcb4 Mission 05 — screenshot evidence
433a828 Mission 05 — M2 playtest prep, mechanics analysis
410b3ba Mission 04 — MOLT prototype and mechanical validation
```

## 2. Prior mission checksums (re-verified now)

| Mission | Manifest | Verified | Expected |
|---|---|---|---|
| Mission 04 | `mission04/evidence/SHA256SUMS.txt` | **47/47** | 47 |
| Mission 05 | `mission05/.../SHA256SUMS.txt` | **35/35** | 35 |
| Mission 06 | `mission06/.../SHA256SUMS.txt` | **49/49** | 49 |
| Mission 07 | `mission07/SHA256SUMS.txt` | **36/36** | 36 |
| Mission 08 | `mission08/SHA256SUMS.txt` | **58/58** | 58 |

> **Note on Mission 04 paths.** Its manifest stores paths relative to `mission04/`
> (`evidence/README.md`, …), so `sha256sum -c` must be run **from `mission04/`**, not from
> `mission04/evidence/`. Run from the wrong directory it reports 0/47 — a path artefact, **not**
> drift. Verified correctly: 47/47.

## 3. Frozen prototype identity

The prototype is **byte-identical to Mission 04** (`git diff 410b3ba -- .../prototype/` is empty).

Engine hashes match the Mission 05 `PLAYTEST_BUILD_MANIFEST.md` §2 **exactly**:

| File | SHA-256 |
|---|---|
| `src/engine/rules.ts` | `7f3acade4a7d7e3e70b2f072a83df81af29674950b172b3f42e6fb998905221d` |
| `src/engine/resolve.ts` | `bef86050d9d73d39a8ab87485f8520d8b72de0378b1b19ad461d84423499ebdd` |
| `src/engine/molt.ts` | `c4af735bdcb448b23765d1ce1b49f7cf8af11e2f2e4cac69d793afe612212d79` |
| `src/engine/game.ts` | `55ebf720eede05a7434557480925dc851bd6b6e3da94314693dbf3de3d879de3` |

## 4. Tests, typecheck, build

| Check | Command | Result |
|---|---|---|
| Tests | `npm test` | **42/42 passed** (4 files) |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | ✓ built (230.78 kB js / 5.01 kB css) |

## 5. Unapproved changes

**None.** The worktree is clean; the prototype is untouched; no prior evidence was modified.

---

## 6. Discrepancies between the mission brief and the repository

These are recorded because the brief must be verifiable, and two of its citations do not resolve
verbatim. **Neither affects any conclusion.**

1. **Filename.** The brief names `MISSION08_EXECUTIVE_VERDICT.md`. The actual file is
   `mission08/EXECUTIVE_VERDICT.md` (no `MISSION08_` prefix). Every other Mission 08 filename in the
   brief matches. Read in full from the actual path.
2. **Section numbering.** The brief refers to "specification §1.2 / §1.3 / §2 / §4" — these match
   `mission03/GAME_MECHANICS_SPECIFICATION.md`. The design-document reference "§2.2" matches
   `mission03/WINNING_GAME_DESIGN.md` §2.2. All resolve.

## 7. What Mission 09 adds (scope)

- Resolve C1 and C2 **from primary sources** (spec, design, engine, tests, worked examples).
- Test both readings in **isolated parametric models** and in **all four combinations**.
- **Re-derive** the integrity window dynamically under each combination.
- Prepare the **eight-person human playtest** (protocol, recruitment, moderator script, templates).
- Produce the **independent decision sheet** (C1, C2, integrity, playtest — separately approvable).

**No rule, coefficient, engine file, or prior artifact is modified. Nothing is deployed or submitted.**

---

## 8. Research infrastructure built for Mission 09

| File | Purpose |
|---|---|
| `analysis/lib9.ts` | parametric engine (C1×C2×integrity), reuses the frozen `molt` verbatim |
| `analysis/fidelity9.ts` | proves `lib9` == frozen engine for the engine reading (**906/906**) |
| `analysis/battery.ts` | shared beast-ignoring + beast-reading rule set |
| `analysis/c1-investigation.ts` | C1 equations, damage table, death-spiral, implied k |
| `analysis/c2-investigation.ts` | C2 multiplier, tool incentive, implied k |
| `analysis/window-battery.ts` | authoritative window per C1×C2 combination |
| `analysis/revalidation.ts` | Mission 08 reproduction, wide seeds, cliff, turnout |
| `analysis/adversarial-individual.ts` | adversarial battery + individual/shared axes |

All outputs are in `evidence/*-output.txt` and sealed in `SHA256SUMS.txt`.
