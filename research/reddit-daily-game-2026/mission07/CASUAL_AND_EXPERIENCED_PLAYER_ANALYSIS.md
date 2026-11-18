# Casual and Experienced Player Analysis

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · Evidence: [PROOF]/[ENGINE] engine facts; [HYPOTHESIS] where marked.

Both audiences play the **same game with the same rules**. This document checks whether each
gets what they need from the frozen design, and whether the proposed changes help or hurt.

---

## 1. Non-gamer perspective

| Question | Assessment | Basis |
|---|---|---|
| Can someone understand what the creature is? | **Yes.** One beast, a visible silhouette, five zones. | design [HYPOTHESIS] |
| Can they make an interesting strike without studying rules? | **Yes.** "Hit the big obvious zone" is a valid, understandable first action and scores 21–57. | [ENGINE] herd base 21; read band up to 57 |
| Is watching the molt enjoyable? | **Plausibly.** The silhouette changes and a log explains why. | [HYPOTHESIS] — needs playtest |
| Can they understand *why* it changed? | **Yes.** The molt log states "crown was hit 62% → armoured". | [ENGINE] molt rules deterministic |
| Do they want to return tomorrow? | **Unknown.** No human data. | `HUMAN_PLAYTEST_PLAN.md` |

**Key property:** a non-gamer's "hit the obvious zone" is **not punished into irrelevance** —
it scores 21, versus 29 for a perfect spread and 34 for mastery. The gap is real but not brutal.
The casual player still contributes meaningfully to the shared goal.

**Risk to casuals:** if `k` is set too high (≥33), the casual contribution is insufficient and
the goal fails — the non-gamer feels useless. This is the strongest argument for `k=27` over
`k=30`.

---

## 2. Experienced gamer perspective

| Question | Assessment | Basis |
|---|---|---|
| Is there meaningful strategic uncertainty? | **Yes.** The optimal combo depends on what everyone else does. | [PROOF] equilibrium is a mixed strategy |
| Can they outthink the crowd? | **Yes.** A reader scores ~50% above a spreader. | [PROOF] 57.0 vs 37.9 |
| Can they learn and adapt? | **Yes.** Yesterday's shares are visible; the equilibrium is learnable. | [PROOF] iterated BR converges |
| Are there competing strategies? | **Yes.** herd / dispersion / reading all viable at different levels. | [PROOF] §3 dominance matrix |
| Does the community produce surprising outcomes? | **Yes.** The outcome swings >50% with the crowd's behaviour. | [ENGINE] 2100 → 3413 (N=100) |
| Is mastery possible without a single dominant strategy? | **Yes.** No strategy is dominant; the equilibrium is mixed and above all trivial rules. | [PROOF] §3 |

**The gamer's asset is the "read band"** (crowd factor ×1.9): find a high-base combo the crowd
is *not* using, and damage nearly doubles. This is a genuine skill, invisible to the casual, and
it is **already in the frozen engine**.

**The gamer's frustration risk:** the shared goal can be met by a trivial spread rule under
`k=27`, so mastery may not *feel* necessary for the community to win. Raising `k` makes the
gamer's skill *matter to the group* — which is the point of a community game.

---

## 3. Do the two audiences want the same game?

**Yes, and this is MOLT's strongest structural feature.** The same one action serves both:

- **Casual:** "hit the obvious zone" → contributes, understands, participates.
- **Gamer:** "find the neglected high-value combo" → out-scores, and (with `k≥30`) *carries* the
  shared goal.

Neither needs a separate mode. Neither needs a forecast quiz. The **only** lever that changes
the balance between them is `k`.

---

## 4. The forecast's effect on the two audiences

The proposed zone forecast (V1–V3) **hurts both**:
- **Casual:** adds a second decision to understand ("what do I predict?") for a free point that
  rewards reading one rule — noise, not depth.
- **Gamer:** the forecast is trivial/gameable, so it adds **no** strategic space — it dilutes
  the real skill (reading) with a lucky guess.

The **shared-goal call (V4)** is neutral-to-positive **if** the shared goal is uncertain:
- **Casual:** "will we win?" is intuitive and creates the community feeling.
- **Gamer:** estimating turnout × coordination is a real read.

**Both audiences are better served by fixing `k` than by adding a forecast.**

---

## 5. Accessibility and non-gamer friction (design review, not measured)

- MOLT's 30-second first action is achievable: the strike picker is a 5×3 grid. [HYPOTHESIS]
- Colour-only meaning is a risk (zone state). The frozen design uses labels + shape. [design]
- No reading-heavy rules are required to strike. [design]
- **No accessibility testing was performed in Mission 07** (out of scope; Mission 04 measured
  13/13 WCAG AA at three widths on the frozen build — that result is unchanged and stands).

---

## 6. Honest gaps

- **Everything about enjoyment is [HYPOTHESIS].** We have engine facts and strategic-structure
  proofs; we have **zero** human playtest data (`HUMAN_PLAYTEST_PLAN.md`).
- The casual/gamer balance is argued from damage numbers, not from observed behaviour.
- The "return tomorrow" question is **unanswerable** without a human test.
