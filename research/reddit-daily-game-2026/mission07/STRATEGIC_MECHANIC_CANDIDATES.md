# Strategic Mechanic Candidates

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · Evidence categories: [PROOF] · [ENGINE] · [SIM] · [HYPOTHESIS]

This document evaluates the **forecast-and-strike** hypothesis and four alternative
extensions, against the frozen engine. Each is scored qualitatively here; quantitative
scoring is in `COMPETITIVE_SCORING.md`. **No mechanic is approved.** These are proposals.

---

## 0. What problem are we solving?

MOLT already has a **real strategic equilibrium** (see `T6_INDEPENDENT_REPRODUCTION.md`):
self-interested play converges to ~34.1/player, well above blind dispersion (29.1). The
individual game is *not* shallow. The open problem is narrower:

> **The shared goal (SLAIN) can be met by a trivial spread rule under `k=27`, and the
> herd-zone forecast — the "obvious" prediction mechanic — is trivial and gameable.**

So the question is not "add depth" (depth exists). It is: **should we add a forecast, and if
so, what forecast is non-trivial and skill-correlated?** And separately: **can the shared goal
be made a skill goal without breaking the game?**

---

## 1. The forecast-and-strike hypothesis (three versions)

### V1 — Herd-zone call
*Player predicts which zone gets the most attacks today; +bonus if correct.*

**Result: REJECT.** [ENGINE]
- The correct answer is trivially "the obvious zone" **100%** of the time (entropy ≈0.00 bits)
  whenever the crowd is even mildly predictable (`forecast-reflexivity.ts` Part 2).
- The bonus is **reflexively manipulable**: a coordinated bloc that chases the bonus moves the
  "correct" answer (herd zone flips from `crown` to `gut` once chasers exceed ~50%,
  `forecast-reflexivity.ts` Part 1).
- It adds a second daily decision, violating the "one strike per day" identity.

### V2 — Synced call-and-strike
*Player predicts the herd zone; damage ×1.25 if the call is right AND they strike a different
zone ("call the herd, go elsewhere").*

**Result: REJECT (as written).** [ENGINE]
- Same trivial-call problem: "always call the obvious zone" hits 100% (`prediction-experiments.ts`).
- Measured: it barely moves any score (≤0.06/day). `skilledReader` (27.81) and `blindDispersion`
  (27.26) remain **statistically tied**, and the ×1.25 bonus rarely fires because the near-uniform
  crowd makes the herd call a near-coin-flip. It does **not** make crowd-reading dominant.
- The "go elsewhere" condition is satisfied by the trivial dispersion rule anyway.

### V3 — Molt-zone call
*Player predicts which zone becomes ARMOURED after the molt; +bonus if correct.*

**Result: REJECT.** [ENGINE]
- The armoured zone is **100% predictable** from "always the obvious zone" (entropy 0.00 bits,
  `alternative-mechanics.ts` M1). The molt rule (`>=35%` over-use → armoured) fires on the
  obvious zone essentially every day.
- Measured: `alwaysCallObvious` (33.92) **dominates** the genuine crowd-reader (29.20). The
  mechanic rewards a constant, not understanding.

### Verdict on the forecast hypothesis

**The forecast as proposed is REJECTED.** The reason is structural and worth stating plainly:

> **A single "most X" prediction over a 5-zone, single-answer space is either trivial (the
> answer is the obvious zone) or a coin-flip (the crowd is dispersed). There is no regime where
> the herd-zone call is BOTH non-trivial AND skill-correlated.** (`forecast-reflexivity.ts`,
> Part 2.)

This is not a tuning problem. A bonus attached to "guess the top zone" is a quiz, and the quiz
has one easy answer or no answer. **Adding it would violate MOLT's identity** (Section 1 of the
mission: "must not become an arbitrary bonus quiz").

**However** — one *narrow* version survives on a different axis. See §2.

---

## 2. The surviving forecast: **the shared-goal forecast** (a different question)

The failed forecasts all ask about *the crowd's zone choice*, which is trivially the obvious
zone. But there is a **genuinely uncertain, genuinely skill-correlated** daily question:

> **"Will the beast be SLAIN today?"** — a single binary call on whether the community's
> combined damage clears Integrity.

Why this is different [ENGINE + HYPOTHESIS]:
- The answer depends on **turnout × coordination**, not on a zone pick. It is **not** trivially
  "yes" or "no".
- It is **skill-correlated**: a player who reads the subreddit (turnout, recent outcomes, the
  displayed share so far) can estimate it; a player who guesses cannot.
- It is **reflexive in a good way**: if everyone believes "SLAIN", more players engage, which
  *makes* it happen — the call is a genuine coordination device, and getting it right is a real
  read of the community.
- It creates the **shared-goal conversation** MOLT wants ("we're 300 short, push!").

**Caveat [HYPOTHESIS]:** the first version of this is a binary coin-flip in information terms
(one bit). It needs a **confidence** element (e.g. three bands: *certainly slain / too close /
certainly escapes*) to have texture. This is a **research proposal, not a recommendation**, and
it depends on decisions that remain open (see §5 and `RECOMMENDED_RULES_FOR_APPROVAL.md`).

---

## 3. Alternative mechanics (four tested)

### M1 — Molt-memory
*The beast's 3-day history influences interpretation of its current vulnerabilities.*

**Test [ENGINE]:** the next armoured zone is **100% predictable** from persistence
(`alternative-mechanics.ts` M1: entropy 0.00 bits). So as a *forecast target* it is trivial.
**But as an *observation/atmosphere* feature it is strong:** players see *why* the beast looks
the way it does. This is **flavour + legibility**, not a scoring mechanic.

**Verdict: ADOPT AS PRESENTATION (already present via the molt log), not as a mechanic.**

### M2 — Feints (community deception)
*Players can deliberately create misleading patterns.*

**Test [ENGINE]:** a 60-strong bloc faking a low-value zone (`tail`) on day 1 arms that zone on
day 2. A follower who chases the visible pattern is punished by **45 damage** vs the best strike
(`alternative-mechanics.ts` M2).

**Verdict: PROMISING, but it emerges from the EXISTING rules** — no new mechanic is required.
Because the molt is deterministic and public, coordinated groups *already* can mislead. MOLT
does not need a "feint button"; it needs the crowd-reading to be worth doing (which it is). The
design implication is **to protect this emergent behaviour**, not to build a feature for it.

### M3 — Strategic sacrifice
*A low-damage strike that changes the community's future opportunity.*

**Test [ENGINE]:** a "neglect the tail to make it raw, then pierce it" two-day plan scored
**7845** vs **9000** for two greedy days — a **loss of 1155** (`alternative-mechanics.ts` M3).
**Verdict: REJECT.** Greedy play dominates; sacrifice is a trap, not a strategy. (The molt
rewards *attacking*, and the setup day costs more than the payoff day gains.)

### M4 — Crowd-reading signals
*Visible evidence from previous rounds predicts the next collective action.*

**Test [ENGINE]:** "yesterday's top zone = today's top zone" is **100%** accurate under a
persistent crowd (`alternative-mechanics.ts` M4). Signals are **highly informative**.
**Verdict: ALREADY PRESENT** — the molt log and previous-outcome display are exactly this. The
finding is that MOLT **already** gives players the signals; the gap is that nothing *rewards*
reading them on the shared axis.

---

## 4. What actually needs to change (the honest conclusion)

The evidence points away from **adding mechanics** and toward **rebalancing the shared goal**:

1. **Do NOT add a forecast as a bonus quiz.** It is trivial or random, and it dilutes identity.
2. **The individual game already rewards crowd-reading** (equilibrium 34.1 > dispersion 29.1).
   This is MOLT's strongest existing asset — it should be *surfaced*, not replaced.
3. **The one real defect is the shared goal** (`k=27` is reachable by dispersion). Fix the
   **coefficient** so the shared goal becomes a *skill* goal (see
   `POPULATION_SCALING_REASSESSMENT.md`).
4. **The optional forecast** — *if* the owner wants one — must be the **shared-goal call**
   (§2), which is genuinely uncertain and coordination-relevant, never the zone quiz.

**This is a smaller, sharper intervention than the mission brief anticipated, and the evidence
supports it over adding a forecast mechanic.**

---

## 5. Open questions requiring owner input

- Does the owner want **any** forecast, given the evidence that the zone forecast fails?
- Is the **shared-goal call** (§2) an acceptable "prediction" under MOLT's identity?
- Should the **shared goal coefficient** rise to make the goal a skill goal
  (`POPULATION_SCALING_REASSESSMENT.md` recommends a value)?
- Should the **displayed live share** (a crowd-reading signal) be part of the client? This is
  the single change that most increases the *value of reading the crowd* without adding a
  mechanic — but it is a UI change and is out of scope for this research mission.
