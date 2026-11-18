# MISSION 04 — MOLT PROTOTYPE REPORT

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Scope:** build a playable prototype of
MOLT (the Mission 03 winning concept) and verify it mechanically. **No deployment, no submission, no
change to any existing product repository.**

**Status:** M0 (feasibility), M1 (playable prototype), and the automated verification layers are
**COMPLETE**. M2 (real-player playtest) is **NOT COMPLETE** — it requires real human participants and
cannot be performed by the agent. See §6 and the playtest protocol.

---

## 1. What was built

A complete, locally-runnable prototype of MOLT under
`research/reddit-daily-game-2026/mission04/prototype/`:

- **Pure engine** (TypeScript, no I/O) — the whole game rule set, deterministic.
- **Server** (Hono) — the submission API, per-user daily lock, shared-state view, day resolution.
- **Client** (React + hand-authored SVG) — the beast plate, zone selection, tool selection, the
  one-tap STRIKE action, result card, molt explanation, and bestiary.
- **Tests** — 42 automated tests across four suites.
- **Verification harnesses** — independent browser (CDP) UI drive and a WCAG 2.2 AA audit.

The prototype is structured so the server layer maps onto Devvit's server runtime and Redis store, but
it runs today as a plain Node + Vite app. **No Devvit account, install, or deployment was used.**

### File inventory (prototype)

```
prototype/
  index.html
  package.json  tsconfig.json  vite.config.ts
  src/engine/rules.ts        constants, tables, types
  src/engine/resolve.ts      aggregation, crowd factor, damage, day resolution
  src/engine/molt.ts         genesis state, the nightly molt
  src/engine/game.ts         facade + in-memory store
  src/server/store.ts        Store interface (Redis-implementable)
  src/server/view-types.ts   shared view types
  src/server/app.ts          Hono API
  src/server/dev-server.ts   dev server
  src/client/main.tsx        entry
  src/client/App.tsx         game loop UI
  src/client/Beast.tsx       the SVG field plate
  src/client/tokens.css      design tokens
  src/client/app.css         layout
  tests/engine.test.ts       15 tests
  tests/adversarial.test.ts  14 tests
  tests/balance.test.ts       7 tests
  tests/server.test.ts        6 tests
  scripts/verify-ui.mjs      independent browser UI verification (CDP)
  scripts/audit-a11y.mjs     WCAG 2.2 AA audit (CDP)
  scripts/spec-example.mjs   reproduces the spec §4 worked example
  scripts/balance-matrix.mjs payoff-matrix simulation
  scripts/seed-demo.mjs      seeds a multi-day history for demos
```

---

## 2. Fidelity to the Mission 03 specification

The engine is built **directly from** `mission03/GAME_MECHANICS_SPECIFICATION.md`. The strongest single
fidelity check is the specification's own worked example (§4), which the engine reproduces **exactly**:

| Spec §4 case | Spec value | Engine output |
| --- | --- | --- |
| `gut:pierce` at 2% share (exposed) | 53 | **53** |
| `crown:cleave` at 40% share (armoured) | 34 | **34** |
| `tail` base value (§1.1) | 16 | **16** |

Evidence: `evidence/spec-example-reproduction.txt`.

### A real specification contradiction (disclosed, not silently resolved)

`GAME_MECHANICS_SPECIFICATION.md` defines a `STATE_MULT` table in **§1.2** (`armoured` ×0.55,
`exposed` ×1.00, `raw` ×1.70) but the **normative formula in §2** and the **worked example in §4** both
compute damage as `ZONE_VALUE × TOOL_MULT × CROWD_FACTOR` and **do not apply `STATE_MULT`**. The §4
example is decisive: applying `STATE_MULT[armoured]=0.55` to `crown:cleave` would yield **18**, not the
spec's stated **34**.

**Decision:** follow §2/§4 (two sources) over §1.2 (one source). `STATE_MULT` is therefore **dead
config** in the current spec. This is recorded in `KNOWN_LIMITATIONS.md` as a spec defect to be fixed
by the design owner — **the design owner, not this mission, decides whether §1.2 or §2/§4 is
authoritative.** The engine isolates the decision in one line so the choice is a one-line change.

---

## 3. Automated verification — results

All commands run from `research/reddit-daily-game-2026/mission04/prototype/`.

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npx tsc --noEmit` | **clean** (0 errors) |
| Unit / rules tests | `npx vitest run tests/engine.test.ts` | **15/15 pass** |
| Adversarial tests | `npx vitest run tests/adversarial.test.ts` | **14/14 pass** |
| Balance tests | `npx vitest run tests/balance.test.ts` | **7/7 pass** |
| Server API tests | `npx vitest run tests/server.test.ts` | **6/6 pass** |
| **Full suite** | `npx vitest run` | **42/42 pass** (4 files) |
| Production build | `npx vite build` | **built** — 231 KB JS / 72 KB gzip, 5 KB CSS / 1.6 KB gzip |
| Browser UI drive | `node scripts/verify-ui.mjs http://localhost:5173` | **11/11 checks pass** |
| WCAG 2.2 AA audit | `node scripts/audit-a11y.mjs http://localhost:5173` | **13/13 checks pass** |

Evidence files: `evidence/test-output.txt`, `evidence/typecheck-output.txt`,
`evidence/build-output.txt`, `evidence/ui-verification-output.txt`,
`evidence/a11y-audit-output.txt`.

### 3.1 What the adversarial tests actually attack

`tests/adversarial.test.ts` tries to prove the game is broken and asserts the safe behaviour:

- **One zone becomes permanently dominant** → over-use arms the zone and fatigues its tool; a
  contrarian read then out-scores the herd play.
- **Optimal strategy is obvious/repetitive** → the best target moves once the crowd acts on it.
- **Randomness overwhelms decisions** → there is *zero* randomness; identical input gives identical
  output 1000/1000 times.
- **A coordinated group manipulates the beast** → 100% coordination arms the zone (self-defeating);
  a perfectly even crowd triggers a mutation, so the board cannot be frozen.
- **One player exploits scoring** → the crowd factor is capped (1.9×); alt-accounts add sub-linear
  value because Integrity scales with √N.
- **Newcomers are punished** → the obvious herd play is decent (≥30), and the wrong tool is a soft
  penalty (×0.6), not a wipeout.
- **Low participation** → 1 player and 0 players both resolve without crash or NaN.
- **Duplicate submissions** → a user cannot strike twice per day (engine + HTTP 409).
- **Determinism** → two identical histories produce identical outcomes.

### 3.2 Balance simulation — is the strategic space alive?

`tests/balance.test.ts` runs bot archetypes for a 60–90 day season and checks non-degeneracy. The
decisive result is the **payoff matrix** (`evidence/balance-payoff-matrix.txt`): for each crowd
strategy, how does each probe strategy score?

```
probe            chaser      loyal contrarian crownPierce  gutCleave
chaser             2435       5869       4623       6309       5366
loyal              3924       2157       3265       6526       3587
contrarian         3878       4162       1696       5530       4098
crownPierce        3308       2609       4174        822       4913
gutCleave          3667       3233       3027       4006       2067
```

Findings:

- **No static dominant strategy.** No probe wins in every column (winners across columns:
  contrarian, chaser, chaser, loyal, chaser). A strategy that always wins would make MOLT trivial.
- **The diagonal is the worst.** Playing exactly what the crowd plays is the lowest-scoring position
  in every column (2,435 / 2,157 / 1,696 / 822 / 2,067). MOLT behaves as a **minority game**: crowding
  a position is punished by the crowd factor and by the zone arming the next day.
- **The best target moves.** Over 60 days the best (zone,tool) changes at least 15 times.

**This shows the loop is not degenerate. It does NOT show the loop is fun** — only human playtesters
can (see §6).

---

## 4. Visual & accessibility verification (real browser, not assumed)

Rendered in headless Chromium 156 via the DevTools Protocol at **390×844 (mobile), 834×1112
(tablet), 1440×900 (desktop)**. Screenshots: `evidence/screenshots/{mobile,tablet,desktop}.png`.

The independent UI drive (`scripts/verify-ui.mjs`) exercises the real interface and asserts on the
resulting DOM — it is not a screenshot of the builder's own claim:

1. beast renders 5 selectable zones
2. primary STRIKE action present
3. selecting a zone updates the readout
4. a tool can be selected
5. a strike produces a result card with a damage number
6. a second strike is blocked after the first
7. the server rejects a duplicate strike (HTTP 409)
8. advancing the day changes the day counter
9. a molt explanation is shown to the player
10. the bestiary records the previous round
11. zones expose accessible names and states

**11/11 pass.**

The accessibility audit (`scripts/audit-a11y.mjs`) measures the rendered result rather than eyeballing
it:

- no horizontal overflow at any of the three widths;
- **every text node meets WCAG 2.2 AA contrast** (4.5:1 normal, 3:1 large) — 30 nodes checked;
- **every interactive target is ≥ 24×24 CSS px**;
- **all 5 beast zones are keyboard-reachable** and operable;
- the UI still renders with `prefers-reduced-motion: reduce`.

**13/13 pass.** One genuine defect was found and fixed during this audit: the footer link was 13 px
tall (below the 24 px minimum). Fixed in `src/client/app.css`; re-audit passes.

### 4.1 Design-intent verification (objective)

Rather than assert the visual direction subjectively, the screenshot palettes were measured:

| Viewport | bone ground | armour slate | ink | vermilion accent |
| --- | --- | --- | --- | --- |
| mobile 390 | 78.4% | 1.8% | 1.8% | <0.05% |
| tablet 834 | 85.5% | 2.1% | 1.4% | <0.05% |
| desktop 1440 | 92.6% | 1.3% | 0.9% | <0.05% |

This confirms the Mission 03 direction: a flat bone field, ink structure, armour in cool slate, and a
single vermilion accent used sparingly — **no gradients, no glass, no glow, no decorative blobs**. Zone
state is encoded three ways (fill + hatch pattern + ridge marks) so it is never colour-alone.

---

## 5. How to run it

```bash
cd research/reddit-daily-game-2026/mission04/prototype
npm install
node --experimental-strip-types src/server/dev-server.ts   # API on :8787
npx vite --port 5173                                        # client on :5173
# verification (client + server must be running):
node scripts/verify-ui.mjs http://localhost:5173
node scripts/audit-a11y.mjs http://localhost:5173
npx vitest run
```

---

## 6. M2 — real-player playtest: NOT DONE (the critical open item)

Mission 03 left exactly one **high-severity** assumption unresolved: **is the crowd-read mechanic
genuinely fun, for both experienced gamers and people who rarely play games?** That is a question about
human enjoyment. It cannot be settled by code, by simulation, or by this agent.

**The agent cannot complete M2.** It requires real people. The mission therefore ends with M2 open.

What *was* produced is a ready-to-run protocol: `MOLT_PLAYTEST_PROTOCOL.md`. It defines the
participant groups, the scripted tasks, the exact observations to record, and the pass/fail thresholds.

The balance simulation in §3.2 is a **proxy only**. It demonstrates the loop is not *degenerate*. It
says nothing about whether a first-time player finds it *delightful*. Treating the simulation as
evidence of fun would be exactly the kind of unverified claim the constitution forbids.

---

## 7. Honest summary of what is verified and what is not

**Verified (with reproducible evidence):**

- the engine implements the specification, reproducing the §4 worked example exactly;
- the full daily loop works end-to-end in a real browser;
- the game is deterministic, robust at low participation, resistant to the attacks tested, and its
  strategic space is non-degenerate;
- the interface is responsive, keyboard-operable, and meets WCAG 2.2 AA on the checks run.

**Not verified (stated plainly):**

- **fun / enjoyment for real humans — untested** (M2, the critical item);
- behaviour under *real* concurrent load (the prototype is single-process in-memory);
- Devvit runtime parity (the prototype is plain Node; Devvit Redis/scheduler semantics were not
  exercised);
- retention over multiple days with real players (no real cohort).

**Known limitations:** see `KNOWN_LIMITATIONS.md`.
