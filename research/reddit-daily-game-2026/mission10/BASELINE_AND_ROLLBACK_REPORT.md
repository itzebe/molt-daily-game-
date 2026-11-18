# BASELINE AND ROLLBACK REPORT

**Mission 10 · MOLT · Date:** 2026-11-18 · **Mode:** execution (research artifacts, engine change authorised)
Raw evidence: `evidence/BASELINE_VERIFICATION.txt`, `evidence/ORIGINAL_INTEGRITY_IMPL.txt`,
`evidence/rollback-verification.txt`.

---

## 1. Authoritative baseline (verified before any change)

| Check | Result |
|---|---|
| Working directory | `/workspace/project` |
| Branch | `master` |
| HEAD | `bc49714e13b5decc5a1c5b8faaf35c2ae0990dab` = "Mission 09 — …" |
| Working tree | clean except untracked `.openhands/` and the new `mission10/` (expected) |
| Git remotes | **none** at baseline |
| Mission 09 deliverables | present (16 `.md`) |
| Mission 09 checksums | **40/40 OK** (`sha256sum -c`) |
| Frozen prototype vs Mission 04 reference (`410b3ba`) | **byte-identical** (`git diff --stat` empty) |
| Engine file hashes | match the values recorded in Mission 05 |

Engine hashes at baseline (unchanged by Mission 10 except the two integrity files):

```
7f3acade…05221d  src/engine/rules.ts
bef86050…499ebdd  src/engine/resolve.ts
c4af735b…612212d  src/engine/molt.ts
55ebf720…879de3  src/engine/game.ts
```

**No STOP condition was triggered.** The repository is the expected MOLT project, the baseline
matches exactly, Mission 09 evidence is intact, and the frozen reference is unchanged.

---

## 2. The integrity function at baseline

File `research/reddit-daily-game-2026/mission04/prototype/src/engine/resolve.ts`, lines 80–83:

```ts
/** §1.5 Integrity target for a day. */
export function integrityFor(n: number): number {
  return Math.min(INTEGRITY_COEFF * Math.sqrt(n), INTEGRITY_CAP);
}
```

Constants in `src/engine/rules.ts` (lines 78–79):

```ts
export const INTEGRITY_COEFF = 1000; // §1.5
export const INTEGRITY_CAP = 12000; // §1.5
```

- **Signature:** `integrityFor(n: number): number`
- **Call sites:** `resolveDay` (`resolve.ts:137`) and the server's `buildState` (`app.ts:61`).
- **Original `resolve.ts` hash:** `bef86050d9d73d39a8ab87485f8520d8b72de0378b1b19ad461d84423499ebdd`
- **Original `rules.ts` hash:** `7f3acade4a7d7e3e70b2f072a83df81af29674950b172b3f42e6fb998905221d`

---

## 3. Rollback reference

The exact original implementation, constants, and hashes are preserved verbatim in
`evidence/ORIGINAL_INTEGRITY_IMPL.txt`. The pristine baseline is also available as a git worktree:

```
git worktree add /tmp/molt-baseline bc49714
```

---

## 4. Rollback procedure (verified)

```
# 1. restore the two engine files from the baseline worktree
cp /tmp/molt-baseline/.../src/engine/resolve.ts  src/engine/resolve.ts
cp /tmp/molt-baseline/.../src/engine/rules.ts    src/engine/rules.ts
# 2. (optionally) revert the test/doc edits
git checkout bc49714 -- research/reddit-daily-game-2026/mission03 research/reddit-daily-game-2026/mission04/prototype/tests
```

**Verification (non-destructive, `evidence/rollback-verification.txt`):** restoring the baseline files
reproduced the original hashes exactly (`bef86050…`, `7f3acade…`) and `integrityFor(1000)` returned
**12000** (the old capped sqrt). Restoring the Mission 10 files returned `integrityFor(1000) = 30000`
(linear). The working tree was left in the Mission 10 state and `npm test` re-run: **44/44 pass**.

| | resolve.ts | rules.ts | integrityFor(1000) |
|---|---|---|---|
| baseline (bc49714) | `bef86050…` | `7f3acade…` | 12000 |
| Mission 10 | `63efe037…` | `ab33facb…` | 30000 |

---

## 5. Destination-repository finding (recorded, see §12 of the mission)

The authorised destination `https://github.com/itzebe/molt-daily-game` returns **HTTP 404 (Not
Found)** to the authenticated API. A repository **`itzebe/molt-daily-game-`** (trailing hyphen)
exists, is **empty** (size 0, no branches, no commits), and its description matches MOLT exactly
("A community-driven daily game where players outthink the crowd and evolve a shared creature."),
created 2026-11-18. This name discrepancy is reported in `GITHUB_PUSH_VERIFICATION.md` and in the
executive report; it is treated as a decision point for the owner, not silently resolved.
