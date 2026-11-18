# MOLT PROTOTYPE — KNOWN LIMITATIONS

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Honest, complete list of what the prototype does **not** do, what is unverified, and what is a known
defect. Nothing here is hidden in the report's prose.

---

## 1. Unverified — the most important items

| # | Limitation | Why it matters | How to resolve |
| --- | --- | --- | --- |
| U1 | **Fun is untested.** No real human has played MOLT. | This was Mission 03's only high-severity assumption. A non-degenerate loop is not a fun loop. | Run `MOLT_PLAYTEST_PROTOCOL.md` with ≥8 real participants (4 gamers, 4 non-gamers). |
| U2 | **No real concurrent load.** The prototype is a single-process in-memory store. | Redis transaction semantics and cross-instance atomicity under real traffic are unproven. | Port the `Store` interface to Devvit Redis and load-test. |
| U3 | **No Devvit runtime parity.** The prototype is plain Node + Vite. | Devvit's server/client split, scheduler, and storage APIs were not exercised. The `scripts`/`scheduler` daily reset is simulated by a manual endpoint. | Build a Devvit "hello world" that uses Redis + scheduler and run the engine against it. |
| U4 | **No multi-day retention with a real cohort.** | Retention is argued from design, not measured. | Requires a real deploy and cohort; out of scope for a prototype. |
| U5 | **Mobile verification is emulated, not on-device.** | Touch behaviour on real hardware was not tested; only emulated viewport + CDP input. | Test on real iOS/Android devices. |

---

## 2. Specification defect carried into the build

**D1 — `STATE_MULT` contradiction.** `GAME_MECHANICS_SPECIFICATION.md` §1.2 defines a per-state damage
multiplier (`armoured` ×0.55, `exposed` ×1.00, `raw` ×1.70), but §2 (the normative formula) and §4 (the
worked example) both omit it. The §4 example is decisive — applying `STATE_MULT` would give 18 where
the spec states 34 — so the engine follows §2/§4 and treats §1.2 as dead config.

**Impact:** low for the prototype (the choice is isolated to one line in `src/engine/resolve.ts`), but
the **design owner must decide** which is authoritative before any real implementation, because the two
readings produce materially different balance (`raw` zones would deal ~1.7× more under §1.2).

---

## 3. Deliberate prototype shortcuts (not defects)

| # | Shortcut | Rationale | Production requirement |
| --- | --- | --- | --- |
| S1 | Client identity is a `localStorage` random id. | No Reddit auth in the prototype. | In Devvit, the server supplies the Reddit user id; the client must never assert it. |
| S2 | Day advance is a manual test endpoint (`POST /api/advance`). | No scheduler in plain Node. | Devvit scheduled job at a fixed daily boundary. |
| S3 | In-memory store. | Fastest path to a playable build. | Redis (the `Store` interface is written to be Redis-implementable). |
| S4 | No leaderboard UI. | Not needed to test the core read. | Season + daily boards (spec §5 defines the Redis keys). |
| S5 | Seed scripts (`seed-demo.mjs`) fabricate a crowd. | To exercise the molt in a demo. | Never present seeded numbers as real players (see §4). |

---

## 4. Honesty boundary for any demo

Any demonstration built from this prototype must state clearly that **the crowd is seeded**, not real
users. The prototype contains a `seed-demo.mjs` script that injects synthetic submissions; those must
never appear in a public demo as if they were real players, real leaderboard positions, or real
transactions. This mirrors the Mission 03 storyboard's honesty rules.

---

## 5. Technical notes for the next engineer

- `npm` blocked the `esbuild@0.21.5` postinstall script in this environment (`install-scripts`
  warning). The Vite build still succeeds (verified — `evidence/build-output.txt`), so the block did
  not affect the build, but a production CI must confirm esbuild's binary is present.
- The engine is pure and I/O-free by design; every rule is unit-testable without a server or browser.
- The single source of truth for rules is `src/engine/rules.ts`. Do not duplicate constants elsewhere.
