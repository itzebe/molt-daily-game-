# Prediction Mechanic Spec (Research Proposal — NOT Approved)

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Status:** PROPOSAL. Not approved. Not implemented. No engine change made.
**Evidence:** `STRATEGIC_MECHANIC_CANDIDATES.md`, `evidence/prediction-experiments-output.txt`,
`evidence/forecast-reflexivity-output.txt`.

---

## 0. Summary of the investigation

Three forecast designs were specified, implemented as research overlays, and tested against the
frozen engine. **All three are rejected.** A fourth, on a different axis, is proposed for
consideration.

| Version | Question asked | Trivial hit rate | Skill-correlated? | Verdict |
|---|---|--:|:--:|---|
| V1 herd-zone call | "Which zone gets the most attacks?" | 100% | No | **REJECT** |
| V2 synced call+elsewhere | "Call the herd, hit elsewhere" | 100% | No | **REJECT** |
| V3 molt-zone call | "Which zone becomes armoured?" | 100% | No | **REJECT** |
| V4 shared-goal call | "Will the beast be SLAIN today?" | n/a (not trivial) | Yes (plausible) | **PROPOSE** |

---

## 1. Why V1–V3 fail (the structural reason)

A "most-X" prediction over 5 zones has only two regimes (`forecast-reflexivity.ts` Part 2):

| crowd herd fraction p | correct-answer entropy | trivial rule accuracy |
|--:|--:|--:|
| 0.00 | 2.31 bits | 20% (coin-flip) |
| 0.20 | 0.00 bits | 100% |
| 0.50 | 0.00 bits | 100% |
| 1.00 | 0.00 bits | 100% |

- **Predictable crowd (p ≥ 0.2):** the answer is *always* the obvious zone → the forecast is a
  constant → it is a **quiz with a printed answer**.
- **Dispersed crowd (p = 0):** the answer is uniform-random → the forecast is **luck**.

There is **no p** where the call is both non-trivial and skill-correlated. Adding a bonus on top
does not create skill; it creates a **free point for anyone who reads one sentence of the rules**
("pick the obvious zone"). Worse, it is **reflexively manipulable**: a coordinated bloc chasing
the bonus flips the herd zone once it exceeds ~50% of the crowd (`forecast-reflexivity.ts` Part 1).

**This is fatal, not fixable by tuning the bonus size.**

---

## 2. V4 — The shared-goal call (the proposal)

### 2.1 The one daily question

> **"Will the community slay the beast today?"**

Answered in **three bands** (not yes/no, to give it texture):
`CERTAINLY SLAIN` · `TOO CLOSE TO CALL` · `CERTAINLY ESCAPES`.

### 2.2 Why this is different from V1–V3

| Property | V1–V3 (zone quiz) | V4 (shared-goal call) |
|---|---|---|
| What is predicted | a *choice* (a zone) | an *outcome* (slain or not) |
| Is the answer printed in the rules? | yes (obvious zone) | no |
| What creates the answer | the crowd's zone pick | **turnout × coordination** |
| Skill required | reading one rule | reading the subreddit's behaviour |
| Reflexive? | badly (bonus chases flip it) | well (belief → engagement → outcome) |
| Couples to the shared goal | no | **yes** |
| Identity fit | adds a second turn | same one action, richer consequence |

### 2.3 Mechanics (proposed, minimal)

- The forecast is attached to the **same single strike** — no extra turn.
- The forecast is committed **before** the day's resolution and **hidden** until the molt reveal.
- The forecast affects **individual score only** (a small bonus for a correct band); it does
  **not** change the beast or the shared outcome. *(Keeps the shared goal clean.)*
- Scored bands: correct *certainly* call > correct *too close* call > wrong. "Too close to call"
  is the honest hedge and should score positively when the outcome is within a margin.

### 2.4 Why it can reward understanding, not luck

- A player who ignores the game guesses ~⅓.
- A player who checks **turnout** (visible: yesterday's striker count), **recent outcomes**
  (visible: the molt log), and **the displayed share-so-far** can estimate the total vs Integrity.
  That is a genuine read of the community.

### 2.5 Honest risks (why this is PROPOSE, not RECOMMEND)

1. **It is only one bit of information** (three bands). It may feel thin.
2. **It depends on a visible turnout/share signal** to be skillful. That is a **UI change**, out
   of scope here, and currently unspecified.
3. **It is unproven with humans.** We have no playtest data (`HUMAN_PLAYTEST_PLAN.md`).
4. It interacts with the shared-goal coefficient: if `k` makes SLAIN near-certain, the call is
   trivial again. **V4 only works if the shared goal is genuinely uncertain** — which requires
   the coefficient decision in `POPULATION_SCALING_REASSESSMENT.md`.

**Therefore V4 is CONDITIONAL: it is worth a human playtest only if (a) the shared-goal
coefficient makes SLAIN genuinely uncertain and (b) a turnout/share signal is displayed.**

---

## 3. What the research does NOT support

- ❌ A "guess the zone" bonus (any form). Trivial or random.
- ❌ A second daily action. Violates the one-strike identity.
- ❌ A forecast that changes the beast. That would couple the individual bonus to the shared
  outcome and re-open the T6 reflexivity.
- ❌ Statistics, currencies, crafting, or progression to "add depth". The depth already exists on
  the individual axis.

---

## 4. Decision requested

| ID | Decision | Recommendation |
|---|---|---|
| P1 | Add the V1–V3 zone forecast? | **NO** (evidence: trivial/gameable) |
| P2 | Consider the V4 shared-goal call? | **CONDITIONAL YES** — only with a genuine shared-goal uncertainty and a visible signal; requires a human playtest first |
| P3 | Add any forecast to the prototype now? | **NO** (research-only mission; also P2 unresolved) |
