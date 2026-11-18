# COMBINED RULES INTERACTION ANALYSIS — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

C1 (STATE_MULT), C2 (pierce-vs-exposed) and A5 (integrity coefficient) are **not independent**. This
document analyses their joint effect, so the recommendation is for the **complete ruleset**, not three
disconnected fixes. Evidence: `evidence/c1-c2-combined-output.txt`,
`evidence/state-thresholds-output.txt`, `evidence/adversarial-output.txt` (T5).

---

## 1. How each defect interacts with the others

| Defect | Effect on the achievable ceiling | Effect on the A5 threshold | Effect on tool balance |
| --- | --- | --- | --- |
| **C1** (apply STATE_MULT) | armoured −45 %, raw +70 % | none at genesis (all exposed); **creates a death-spiral** on evolved beasts | makes armour a near-lockout, raw a jackpot |
| **C2** (pierce→1.6) | +60 % on the pierce/exposed read only | **348 → 255** (bigger ceiling) | makes `pierce` a second "strong vs exposed" tool, weakening `cleave`'s uniqueness |
| **A5** (√N target) | n/a (target, not damage) | **defines the gate** (348 best / 415–572 realistic) | none |

## 2. C1 × A5 — the interaction that matters most

`evidence/c1-c2-combined-output.txt` (COMBINED section): applying `STATE_MULT` leaves the genesis
threshold at **348** — *apparently* neutral. But that is misleading, because it hides a **dynamical**
effect:

- Under the **engine reading (A)**, hardening *raises* the ceiling (34.79 → 47.23 as zones armour;
  `evidence/state-thresholds-output.txt`). The escape penalty is **self-correcting**: an escaping beast
  becomes *easier* to hit next day.
- Under the **STATE_MULT reading (B)**, hardening *lowers* the ceiling (34.79 → 25.95). Combined with the
  A5 escape penalty (each ESCAPE adds armour), this creates a **death spiral**: escapes harden the beast,
  which makes the next escape likelier.

**Therefore C1 and A5 cannot be decided separately.** Choosing Reading B *and* leaving the escape penalty
as-is would make a small subreddit spiral into permanent escape. Choosing Reading A (engine) removes that
risk. This is a decisive argument for C1 = keep the engine.

## 3. C2 × A5

`evidence/adversarial-output.txt` (T5): `pierce`-vs-exposed 1.0 → 1.6 lowers the best-case threshold
348 → 255. So C2 *partially* masks A5 by enlarging the ceiling — but the gate persists (255 is still far
above any small subreddit). Deciding C2 as "1.6" would **hide** the A5 problem behind a slightly higher
ceiling, which is exactly the "make the numbers look better" failure the mission forbids. Deciding C2 as
"1.0" (the spec/engine value) keeps A5 visible and honest.

## 4. C1 × C2 — tool balance

`TOOL_MULT` already gives each state exactly one *strong* tool per the §1.3 note:
`cleave`→armoured, `pierce`→raw, `burn`→raw, with `cleave` the only armoured counter. If C2 flips
`pierce`→exposed to strong (1.6), then **two tools** (`cleave` neutral, `pierce` strong) are good vs
exposed and the "one counter per state" symmetry is broken. Combined with C1's STATE_MULT (which
compresses armoured), the result is a **dominant anti-exposed/anti-raw play** and a **dead armoured
mechanic** — the opposite of the design's "crowd can specialise, then molting punishes it" intent.

## 5. Joint recommendation (the complete ruleset)

The three defects are best resolved by a **single coherent choice: keep the engine's ruleset exactly,
and fix the two documents** — because the engine's ruleset is the one that:

1. is implemented, tested, and matches the two normative sources (§2/§4);
2. avoids the C1×A5 death spiral;
3. keeps tool balance symmetric (one strong tool per state);
4. leaves the §4 printed numbers valid.

And then, **separately and explicitly**, change the A5 target to a **linear scale-invariant form**
(`Integrity = k·N`, `k = 27`), which is the only change that makes the shared goal meaningful across
populations.

**Summary of the combined recommendation:**

| Rule | Decision |
| --- | --- |
| C1 STATE_MULT | **Keep engine (Reading A); fix §1.2 doc** |
| C2 pierce/exposed | **Keep engine (1.0); fix design §2.2 doc** |
| A5 integrity target | **Replace `min(1000√N,12000)` with `27·N` (no cap)** |

## 6. Does the combined change alter population thresholds?

- C1: no change to the genesis threshold; **removes the evolved-beast death spiral**.
- C2: no change if kept at 1.0.
- A5: replaces the population gate with a **scale-invariant bar** (gate removed; see
  `POPULATION_BALANCE_MATRIX.md`).

Net: the combined ruleset has **no population gate**, **no death spiral**, **symmetric tool balance**,
and a **constant coordination requirement** of ≈27 % of the crowd.

## 7. Residual issues the combined change does NOT fix (disclosed)

- **Dispersion vs precision** (`ADVERSARIAL_VERIFICATION.md` T6): aggregate damage rewards spreading as
  much as precise reads; a fully-spread static crowd wins most days. This is inherent to summing the
  crowd factor and is **not** addressed by any coefficient. It needs a design decision (e.g. whether the
  shared goal *should* reward dispersion).
- **Crowd manipulation** (T4): a piling minority can force escapes. Inherent to a shared pool.
