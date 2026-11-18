# Competitive Scoring

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · Scores justified by evidence, not enthusiasm. Max 100.

Weights (from the mission brief):

| Criterion | Weight |
|---|--:|
| Strategic depth and meaningful decisions | 20 |
| Originality and innovation | 20 |
| Enjoyment for gamers and non-gamers | 20 |
| Reddit/community identity | 15 |
| Daily replay and discovery | 10 |
| Demo clarity and feasibility | 10 |
| Resistance to dominant strategies | 5 |
| **Total** | **100** |

---

## 1. Candidate A — Frozen MOLT (current, `√N` integrity, no forecast)

| Criterion | Score | Justification |
|---|--:|---|
| Strategic depth | **17**/20 | [PROOF] a real mixed-strategy equilibrium (~34.1) above all trivial rules; the shared goal is trivial under k=27, weakening the "meaningful decisions" claim. |
| Originality | **18**/20 | Community morphing beast; distinctive vs generic daily puzzles. |
| Enjoyment both audiences | **15**/20 | Same one action serves both; gap 21→34 is fair. **No human data** → capped. |
| Reddit/community identity | **14**/15 | One beast per sub; shared outcome; discussion fuel. |
| Daily replay and discovery | **9**/10 | New molt each day; strong. |
| Demo clarity and feasibility | **9**/10 | Frozen prototype exists, 42/42 tests, verified build. |
| Resistance to dominant strategies | **2**/5 | [ENGINE] the shared goal is met by a trivial spread rule under k=27 (T6). |
| **TOTAL** | **84**/100 | |

**Qualifies (≥80)** but carries a **known defect** (T6 on the shared axis). Not the recommendation
because the defect is fixable at near-zero cost.

---

## 2. Candidate B — Prediction-and-exploitation MOLT (V1–V3)

| Criterion | Score | Justification |
|---|--:|---|
| Strategic depth | **10**/20 | [ENGINE] the forecast adds a second decision but **no** strategic space — it is trivial (100% hit) or random. |
| Originality | **10**/20 | "Predict the crowd" is a common trope; here it is a quiz with a printed answer. |
| Enjoyment both audiences | **12**/20 | Adds friction to casuals; adds nothing for gamers. |
| Reddit/community identity | **11**/15 | The forecast does not touch the beast; weaker community coupling. |
| Daily replay and discovery | **8**/10 | No new discovery; same molt. |
| Demo clarity and feasibility | **8**/10 | Easy to build — but easy to build *badly*. |
| Resistance to dominant strategies | **1**/5 | [ENGINE] "always call the obvious zone" wins the bonus 100% of the time. |
| **TOTAL** | **60**/100 | |

**Does NOT qualify.** Rejected on evidence (trivial, gameable, reflexive). See
`PREDICTION_MECHANIC_SPEC.md`.

---

## 3. Candidate C — MOLT-K (linear `Integrity = k·N`, k ≈ 27–30) — **RECOMMENDED**

| Criterion | Score | Justification |
|---|--:|---|
| Strategic depth | **19**/20 | [PROOF] keeps the mixed equilibrium; **adds** the shared goal as a skill goal (k≥30 defeats the trivial rule). |
| Originality | **18**/20 | Unchanged MOLT identity — distinctive. |
| Enjoyment both audiences | **16**/20 | Same one action; casual still contributes (21/player); gamer now *matters* to the group. **No human data** → capped. |
| Reddit/community identity | **15**/15 | A hard-won shared goal is the strongest possible community story. |
| Daily replay and discovery | **10**/10 | Every day the goal is genuinely in doubt. |
| Demo clarity and feasibility | **10**/10 | **One constant changes.** No new UI, no new mechanic, no new turn. |
| Resistance to dominant strategies | **5**/5 | [ENGINE] at k≥30 the static spread bot **loses**; no trivial dominant rule remains. |
| **TOTAL** | **93**/100 | |

**Qualifies and is recommended.** It fixes T6 with the **smallest possible change**, adds zero
complexity, and strengthens every community-facing criterion.

---

## 4. Comparison and why C wins

| Criterion | A (frozen) | B (prediction) | **C (MOLT-K)** |
|---|--:|--:|--:|
| Strategic depth | 17 | 10 | **19** |
| Originality | 18 | 10 | 18 |
| Enjoyment both | 15 | 12 | **16** |
| Reddit identity | 14 | 11 | **15** |
| Daily replay | 9 | 8 | **10** |
| Demo clarity | 9 | 8 | **10** |
| Resistance | 2 | 1 | **5** |
| **Total** | **84** | **60** | **93** |

**C is stronger than A** because it removes the only measured defect (T6) while touching nothing
else. **C is stronger than B** because B adds a mechanic that the evidence rejects, while C adds
no mechanic and fixes the real problem. **C beats B on every criterion**, including demo clarity
(a constant change is trivially demonstrable and honest).

---

## 5. Honesty notes on the scores

- **Enjoyment is capped at 15–16/20 for every candidate** because **no human has played MOLT**.
  A higher score would be fabricated. This is the single largest source of uncertainty.
- The **Resistance** criterion is the decisive differentiator and rests on **exact** computation
  (`t6-reproduction.ts`), not simulation — high confidence.
- Scores are **relative within this mission's evidence**; they are not comparable to other
  teams' games, which we have not measured.
- The recommendation is **CONDITIONAL on a human playtest** confirming casuals can contribute at
  the chosen k.
