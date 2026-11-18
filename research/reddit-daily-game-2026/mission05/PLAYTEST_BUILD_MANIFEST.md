# PLAYTEST BUILD MANIFEST — Mission 05 (the freeze)

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Purpose:** record exactly what will be tested,
so that every participant sees the same build and the same rules, and so the test is reproducible.

> **Freeze status.** The build below is frozen **provisionally**, pending the user's decision on the
> mechanics contradiction (`MECHANICS_CONTRADICTION_ANALYSIS.md`, §5) and on the state-multiplier design
> question (§7). **Per Mission 05 §3, no playtest may begin until the rule is settled and the test build
> is consistent with the approved specification.** If the user approves the recommended resolution
> (keep the engine; fix the two documents), this freeze is final and the hashes below are the tested
> build. If the user instead chooses Option B (`STATE_MULT` applied), the engine hash for `resolve.ts`
> and the test hashes change and this manifest must be regenerated before any playtest.

---

## 1. Tested commit

| Item | Value |
| --- | --- |
| Repository | `/workspace/project` (no remote) |
| Branch | `master` |
| **Tested commit** | **`410b3ba42a7f42ee0a7000850ab097bdfc5a27ad`** |
| Prototype path | `research/reddit-daily-game-2026/mission04/prototype/` |
| Runtime | Node v24.22.2 · npm 12.2.2 |
| Servers | API on `:8787` (`src/server/dev-server.ts`) · client on `:5173` (`vite`) |

## 2. Frozen source-file hashes (SHA-256)

These are the exact bytes the playtest runs. Any change invalidates the freeze.

### Gameplay-affecting (the engine)

| File | SHA-256 |
| --- | --- |
| `src/engine/rules.ts` | `7f3acade4a7d7e3e70b2f072a83df81af29674950b172b3f42e6fb998905221d` |
| `src/engine/resolve.ts` | `bef86050d9d73d39a8ab87485f8520d8b72de0378b1b19ad461d84423499ebdd` |
| `src/engine/molt.ts` | `c4af735bdcb448b23765d1ce1b49f7cf8af11e2f2e4cac69d793afe612212d79` |
| `src/engine/game.ts` | `55ebf720eede05a7434557480925dc851bd6b6e3da94314693dbf3de3d879de3` |

### Server / wire

| File | SHA-256 |
| --- | --- |
| `src/server/app.ts` | `44f8f8a80d0236e3321558325c9dcbae7f06bd6fc3a3426790e3e11947889f97` |
| `src/server/store.ts` | `58bc9a6fb7973bec86f8ed292bb3b2c9ae779da4f5e32a8e6fcf748b2c6ce146` |
| `src/server/view-types.ts` | `b8da9914f5eb7807a32a02df800ea9d5565d264f5cd1e6a77d45cc0c6b097f0c` |

### Client (the UI the participant sees)

| File | SHA-256 |
| --- | --- |
| `src/client/App.tsx` | `844d7ae9b526299befc95cedeb7e7a44358263c6eefa846b18d85993e9997d22` |
| `src/client/Beast.tsx` | `07a88aa01dd7d37e308831c4f4928b29231de3b9a79632fb448533efdb433d45` |
| `src/client/app.css` | `e9edb88e640e4c938269cd873f32de6a716d4b1ecafca44b31be634c0179d488` |
| `src/client/tokens.css` | `acd19af66163a562440a98c8d60652b67d57273ee981d67adb6475635d64f557` |
| `src/client/main.tsx` | `f35eeb719c13334e9723d3457caec9466397c4372950a9217c04e223a27358a7` |
| `index.html` | `ba1727a4ebf0714b09fe6e7686cfa097487a172e4d33d569530dda7d09ef2eda` |

### Config

| File | SHA-256 |
| --- | --- |
| `package.json` | `bf210dbcb264b31bdf1fb0ad63aa83c4a0167d72aa6201c673e3aabe61cb990d` |
| `vite.config.ts` | `3adb6653fb90c18cc06a72f62a018c1fdc26e37b7660082e24ce1cf2be16cb2f` |
| `tsconfig.json` | `f84f70ca77a0c1c1d4e7398ef220991f249146b90da04a59afa0b3fed582b729` |

## 3. Frozen game rules (what the participant is playing)

For the record, the rules as the frozen build implements them (see
`mission03/GAME_MECHANICS_SPECIFICATION.md`; the two documentation errors are noted in
`MECHANICS_CONTRADICTION_ANALYSIS.md`):

- **5 zones**: crown 30, hide 22, gut 28, claw 24, tail 16.
- **3 tools**: cleave (strong vs armoured), pierce (strong vs raw), burn (strong vs raw, weak vs
  exposed). Tool multipliers per spec §1.3.
- **Crowd factor** by exact `(zone,tool)` share: ≥30% → 0.7 · 10–30% → 1.0 · 3–10% → 1.4 · <3% → 1.9.
- **Damage** = `ZONE_VALUE × TOOL_MULT × CROWD_FACTOR`, ×0.8 if the tool is the previous day's
  most-used, ×0.9 if the zone carries a ridge; rounded. (`STATE_MULT` §1.2 is **not** applied — the
  contradiction under review.)
- **Molt**: over-use (≥35% zone share) → armoured; neglect (≤5%) → raw; most-used tool fatigued next
  day; ridge on ≥25% over the last three days; mutation if zone shares are very even; an ESCAPED day
  forces the least-hit zone armoured.
- **Integrity** = `min(1000·√(distinct strikers), 12000)`; SLAIN if total damage ≥ Integrity.
- **One strike per participant per day**, enforced server-side.

## 4. Frozen participant instructions

The exact words a participant hears (verbatim; do not paraphrase during a session). From
`MOLT_PLAYTEST_PROTOCOL.md` §2–3, unchanged:

> **Introduction (the only thing said before play):**
> *"This is a daily game. You have one strike a day. Try it."*

Task prompts, verbatim:

1. *"Play your first strike. Say out loud what you are doing and why."*
2. *"Why did you get that number? What would you do differently tomorrow?"*
3. *"What changed, and why?"* (after the day is advanced)
4. *"Play the next two days. Play to win."*
5. *"Would you come back tomorrow to play again? Why or why not? What was the best and worst part?"*

**Do not** explain the crowd factor, the tool matrix, or the molt rules up front.

## 5. Frozen measurement instrument

- **Enjoyment**: a single five-point scale, asked identically of both groups:
  `1 = did not enjoy · 2 = slightly · 3 = neutral · 4 = enjoyed · 5 = enjoyed a lot`.
- **Observation sheet**: the fields in `MOLT_PLAYTEST_PROTOCOL.md` §4 (reproduced as
  `playtest-kit/OBSERVATION_SHEET.csv`).
- **Thresholds**: the seven P-criteria in `MOLT_PLAYTEST_PROTOCOL.md` §5, **as additionally tightened
  by Mission 05** (§7 of this mission): first-strike completion ≥90 %, first strike ≤30 s ≥80 %,
  rule comprehension ≥80 %, transformation comprehension ≥80 %, average enjoyment ≥4/5 **per group**,
  voluntary replay intention ≥70 % **per group**.
- **Analysis unit**: the **individual participant**, reported **separately per group**. Raw counts are
  reported alongside every percentage. **No statistical-significance claim is made** — n = 4 per group.

## 6. Freeze procedure (what "frozen" means operationally)

1. Record `git rev-parse HEAD` → `410b3ba…` (done, §1).
2. Record SHA-256 of every source file (§2). Re-check before the first session:
   `sha256sum` each file and compare. If any differs, **stop** — the build is not the tested build.
3. Only **genuine test-blocking defects** may be fixed during the freeze, each with a written note in
   `PLAYTEST_RESULTS.md` (what changed, why, new hashes) and a re-run of the full suite. **No cosmetic
   redesign, no feature additions.**
4. All participants use the **same** build and the **same** rules.

## 7. Environment capability check (prerequisite to a real molt)

Before any session, confirm the environment can produce a **genuine** community molt — i.e. distinct
participants' strikes aggregate into one shared day, and advancing the day rebuilds the beast from
**their** combined behaviour, not a fixture.

**Verified 2026-11-18** (evidence: `evidence/environment-molt-test-output.txt`): eight distinct user
ids struck one shared day; the day aggregated to `n = 8`; a duplicate strike was refused with HTTP 409;
advancing the day produced a **real** molt — Crown armoured (over-use), Hide armoured (escape penalty),
`cleave` fatigued — and the Bestiary recorded the real result. **The environment supports a genuine
community molt.** The Mission 05 STOP condition "testing environment cannot support a genuine
community-driven molt" is **not** triggered.

## 8. What is NOT frozen / still open

- The **rule decision** (Option A vs B) — awaiting user approval. **Blocks the playtest.**
- The **participants** — none recruited (the agent cannot recruit humans; see
  `PARTICIPANT_RECRUITMENT_REPORT.md`).
- Therefore **no playtest has run**; this manifest is prepared, not exercised.
