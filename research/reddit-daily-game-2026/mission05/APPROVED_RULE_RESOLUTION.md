# APPROVED RULE RESOLUTION — Mission 05

**Status: ⛔ AWAITING USER APPROVAL — NOT YET APPROVED. No rule or code change has been applied.**

This file is the approval gate required by Mission 05 §3. It is a **placeholder** until the user decides.
Nothing here authorises a change.

---

## The decision requested

Mission 05 identified **two** contradictions in the MOLT specification (full analysis:
`MECHANICS_CONTRADICTION_ANALYSIS.md`). The user must choose a resolution. Until then, the game rules
are **not settled**, and **no playtest may run** (Mission 05 §3).

### Decision 1 — the state multiplier (C1)

The recommended resolution is: **keep the as-built formula** (`ZONE_VALUE × TOOL_MULT × CROWD_FACTOR`;
`STATE_MULT` §1.2 not applied), because §2 (the normative algorithm) and §4 (the worked example) agree
and are cross-corroborated by the demo storyboard. This means **no engine change**; the fix is to
correct `GAME_MECHANICS_SPECIFICATION.md` §1.2.

- [ ] **APPROVE** — keep the as-built formula; correct the spec §1.2 (delete or relabel `STATE_MULT`).
- [ ] **REJECT** — apply `STATE_MULT` (Option B). *This is a gameplay change*: it changes `crown:cleave`
      from 34 → 18, requires editing `resolve.ts`, the §4 example, the storyboard numbers, tests
      `engine.test.ts` (lines 119–123) and `adversarial.test.ts` (lines 56–57), and a full re-run.

### Decision 2 — the tool matrix (C2)

The recommended resolution is: **keep the as-built matrix** (spec §1.3/§4; `pierce` neutral vs exposed),
because §1.3 and §4 agree and the storyboard uses the spec's numbers. This means **no engine change**;
the fix is to correct `WINNING_GAME_DESIGN.md` §2.2.

- [ ] **APPROVE** — keep the as-built matrix; correct the design doc §2.2.
- [ ] **REJECT** — change the matrix to match the design doc (`pierce` strong vs exposed). *Gameplay
      change*: the demo's headline `gut:pierce` becomes 85, not 53.

### Decision 3 — the state-multiplier *design* question (independent of the docs)

Even after the documents are fixed, one design question remains (analysis §7):

> Should a `raw` zone deal materially more than an `armoured` zone with the *right* tool (Option B,
> ~3.1× spread), or should the state only determine *which tool* is right (Option A, equal magnitude)?

- [ ] **Option A** (as-built; less swingy)
- [ ] **Option B** (matches the words "hard to hurt / very soft")
- [ ] **Other** (specify)

### Decision 4 — the Integrity constant (adversarial finding A5)

`ADVERSARIAL_FINDINGS.md` A5 shows the shared goal (SLAIN) is unreachable below ~348–500 strikers even
in the best coordinated case, because `INTEGRITY_COEFF = 1000` scales as `√N` while damage scales ~`N`.

- [ ] **Acknowledge and defer** (keep 1000 for now; revisit before implementation)
- [ ] **Approve a correction** (specify a new coefficient; requires re-running the balance tests)
- [ ] **Reject the finding** (explain why)

---

## Current state (until a decision is recorded)

- Engine: **unchanged** (`src/engine/*.ts` hashes in `PLAYTEST_BUILD_MANIFEST.md` §2 still valid).
- Documents: **uncorrected** (the two contradictions still stand).
- Playtest: **blocked** — the mission forbids starting it before the rule is settled.

**When the user approves, record the decision here, date it, and (if any gameplay change is approved)
apply it, re-run all 42 tests, regenerate the affected evidence, and regenerate this file.**
