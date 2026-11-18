# REPOSITORY AND BASELINE VERIFICATION — Mission 05

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Purpose:** verify the state Mission 05
inherits before any analysis or experiment. Nothing here is assumed from Mission 04's prose; every
claim is re-derived.

---

## 1. Repository identity

| Item | Value | How verified |
| --- | --- | --- |
| Workspace | `/workspace/project` | working directory |
| Git repository | present (`.git`) | `git rev-parse` succeeds |
| Branch | `master` | `git rev-parse --abbrev-ref HEAD` |
| Remote | **none configured** | `git remote -v` → empty |
| Commits | **1** (root commit) | `git log --oneline` |
| HEAD | `410b3ba42a7f42ee0a7000850ab097bdfc5a27ad` | `git rev-parse HEAD` |
| Parent commit | **none** (root) | `git log --format='%H %P'` → no second field |

`410b3ba` **exists** and is the current HEAD. It is the repository's only commit, so there is no
"parent" in the usual sense — this is confirmed, not assumed.

The repository has no remote. It has **not** been pushed, published, merged, or deployed. This matches
the Mission 05 boundary (no push, no publish, no merge).

## 2. Working-tree status

`git status --short` reports only:

```
?? .openhands/
```

`.openhands/` is agent memory, excluded by `.gitignore`. The tracked tree is **clean** — nothing is
modified or staged. No existing evidence or product file has been altered by this mission.

## 3. Commit 410b3ba contents

- **91 files**, 31,379 insertions.
- 49 of those files are under `research/reddit-daily-game-2026/mission04/`.
- The commit contains Mission 03 deliverables (`research/reddit-daily-game-2026/mission03/`), Mission 04
  deliverables and the prototype, and the top-level Mission 02 deliverables. It does not touch any
  product repository (`itzebe/ledgertown`, `itzebe/last-breath` are not present here).

## 4. Evidence integrity (the 47 checksums)

Mission 04 shipped `mission04/evidence/SHA256SUMS.txt` with 47 entries. Verified two ways:

1. **In place** — from `mission04/`: `sha256sum -c evidence/SHA256SUMS.txt` → **47/47 OK**.
2. **From a fresh checkout of HEAD** — created a clean `git worktree` at commit `410b3ba` and ran the
   same check there → **47/47 OK**.

The only files under `mission04/` not covered by the checksum file are `.gitignore` and
`SHA256SUMS.txt` itself (correctly self-excluded). All 47 checksums are intact; **no evidence has been
overwritten or corrupted**.

## 5. Documents read in full (not skimmed)

- `mission03/GAME_MECHANICS_SPECIFICATION.md` — the implementation spec (the authority for §1–§5).
- `mission03/WINNING_GAME_DESIGN.md` — the approved design (§2 rules, §3 first session, §7 identity).
- `mission03/60_SECOND_DEMO_STORYBOARD.md` — the demo contract.
- `mission04/MISSION04_PROTOTYPE_REPORT.md` — what was built and verified.
- `mission04/EXECUTIVE_VERDICT.md` — the CONDITIONAL GO and its condition.
- `mission04/KNOWN_LIMITATIONS.md` — the U/D/S item lists.
- `mission04/MOLT_PLAYTEST_PROTOCOL.md` — the M2 instrument.

## 6. Prototype re-verified (independent of Mission 04's claims)

Run from `mission04/prototype/` on Node v24.22.2, npm 12.2.2, `node_modules` present:

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npx tsc --noEmit` | **clean** (0 errors) |
| Tests | `npx vitest run` | **42/42 pass** (4 files) |
| Build | `npx vite build` | **built** — 230.78 KB JS / 72.37 KB gzip, 5.01 KB CSS |

These reproduce Mission 04's reported numbers exactly. The Mission 04 report is **corroborated**, not
merely trusted.

## 7. Source-file hashes of the build under evaluation

SHA-256 of every gameplay-affecting source file at HEAD (recorded for the freeze in
`PLAYTEST_BUILD_MANIFEST.md`):

| File | SHA-256 |
| --- | --- |
| `prototype/src/engine/rules.ts` | `7f3acade4a7d7e3e70b2f072a83df81af29674950b172b3f42e6fb998905221d` |
| `prototype/src/engine/resolve.ts` | `bef86050d9d73d39a8ab87485f8520d8b72de0378b1b19ad461d84423499ebdd` |
| `prototype/src/engine/molt.ts` | `c4af735bdcb448b23765d1ce1b49f7cf8af11e2f2e4cac69d793afe612212d79` |
| `prototype/src/engine/game.ts` | `55ebf720eede05a7434557480925dc851bd6b6e3da94314693dbf3de3d879de3` |
| `prototype/src/server/app.ts` | `44f8f8a80d0236e3321558325c9dcbae7f06bd6fc3a3426790e3e11947889f97` |
| `prototype/src/server/store.ts` | `58bc9a6fb7973bec86f8ed292bb3b2c9ae779da4f5e32a8e6fcf748b2c6ce146` |
| `prototype/src/server/view-types.ts` | `b8da9914f5eb7807a32a02df800ea9d5565d264f5cd1e6a77d45cc0c6b097f0c` |
| `prototype/src/client/App.tsx` | `844d7ae9b526299befc95cedeb7e7a44358263c6eefa846b18d85993e9997d22` |
| `prototype/src/client/Beast.tsx` | `07a88aa01dd7d37e308831c4f4928b29231de3b9a79632fb448533efdb433d45` |
| `prototype/src/client/app.css` | `e9edb88e640e4c938269cd873f32de6a716d4b1ecafca44b31be634c0179d488` |
| `prototype/src/client/tokens.css` | `acd19af66163a562440a98c8d60652b67d57273ee981d67adb6475635d64f557` |
| `prototype/src/client/main.tsx` | `f35eeb719c13334e9723d3457caec9466397c4372950a9217c04e223a27358a7` |
| `prototype/index.html` | `ba1727a4ebf0714b09fe6e7686cfa097487a172e4d33d569530dda7d09ef2eda` |
| `prototype/package.json` | `bf210dbcb264b31bdf1fb0ad63aa83c4a0167d72aa6201c673e3aabe61cb990d` |
| `prototype/vite.config.ts` | `3adb6653fb90c18cc06a72f62a018c1fdc26e37b7660082e24ce1cf2be16cb2f` |
| `prototype/tsconfig.json` | `f84f70ca77a0c1c1d4e7398ef220991f249146b90da04a59afa0b3fed582b729` |

## 8. Verdict of this verification

- The repository is identified safely; the mission may proceed.
- HEAD `410b3ba` exists and matches Mission 05's stated baseline.
- All 47 Mission 04 evidence checksums verify, including from a fresh checkout.
- The prototype reproduces Mission 04's reported test/typecheck/build results exactly.
- **One correction to Mission 04's framing is noted** (see `MECHANICS_CONTRADICTION_ANALYSIS.md`): the
  specification contradiction is not a single `STATE_MULT` issue but **two** related inconsistencies.
  This does not change the verification result; it sharpens it.
