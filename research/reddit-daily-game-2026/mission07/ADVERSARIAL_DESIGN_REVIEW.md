# Adversarial Design Review

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · We attack our own proposals. Negative findings are reported, not buried.

---

## 0. The ten questions, applied to each candidate

Candidates reviewed: **(A) frozen MOLT**, **(B) prediction-and-exploitation MOLT**,
**(C) the strongest alternative = "raise the shared-goal coefficient" (call it MOLT-K)**.

---

## A. Frozen MOLT

| # | Question | Finding |
|--:|---|---|
| 1 | Boring? | No — a mixed-strategy equilibrium and a community goal. But the shared goal can be won by a trivial spread rule (k=27), which can make mastery feel optional. |
| 2 | Insufficiently original? | No — a morphing community beast is distinctive. |
| 3 | Simpler game same enjoyment? | Possibly, but the community-molt is the differentiator. |
| 4 | Basic bot exploit? | **Yes (shared):** a static spread bot wins the shared goal under k≤29. **No (individual):** the bot is punished. |
| 5 | Coordinated manipulation? | **Yes:** a bloc can force an escape (T4) and can flip a herd-call answer. |
| 6 | More meaningful evolution? | Yes — the silhouette records the community. |
| 7 | Reddit identity? | Yes — one beast per sub, shared outcome, discussion fuel. |
| 8 | Daily return? | Plausible (new day, new molt) — **unverified**. |
| 9 | Complexity without enjoyment? | No — the rules are simple. |
| 10 | Evidence to reject? | If the shared goal stays trivial at all k, or if playtests show no return intent. |

**Verdict: keep, fix the coefficient.** The one defect is fixable without a mechanic.

---

## B. Prediction-and-exploitation MOLT

| # | Question | Finding |
|--:|---|---|
| 1 | Boring? | **Yes, potentially** — a "guess the zone" bonus is a coin-flip or a free point. |
| 2 | Insufficiently original? | **Yes** — "predict the crowd" is a common daily-game trope; here it is trivially the obvious zone. |
| 3 | Simpler game same enjoyment? | **Yes** — MOLT without the forecast is simpler and loses nothing measurable. |
| 4 | Basic bot exploit? | **Yes, fatally** — "always call the obvious zone" hits **100%** (`prediction-experiments.ts`). |
| 5 | Coordinated manipulation? | **Yes** — a bloc chasing the bonus flips the answer (`forecast-reflexivity.ts`). |
| 6 | More meaningful evolution? | **No** — the forecast does not change the beast. |
| 7 | Reddit identity? | **Weak** — adds a quiz, not a community dynamic. |
| 8 | Daily return? | No new reason. |
| 9 | Complexity without enjoyment? | **Yes** — a second decision for a trivial payoff. |
| 10 | Evidence to reject? | **We have it:** 100% trivial hit rate, 0.00-bit entropy, reflexive manipulation. |

**Verdict: REJECT (V1–V3).** The evidence meets the rejection bar the mission set.

**The narrow survivor (V4, shared-goal call)** survives only if the shared goal is genuinely
uncertain — i.e. only if the coefficient is raised. So V4 **depends on** candidate C.

---

## C. MOLT-K — raise the shared-goal coefficient (k ≈ 27–30, linear)

| # | Question | Finding |
|--:|---|---|
| 1 | Boring? | No more than frozen MOLT; it *adds* stakes. |
| 2 | Insufficiently original? | It is a balance change, not a novelty claim — originality comes from MOLT itself. |
| 3 | Simpler game same enjoyment? | It **is** the simpler game; it removes the trivial-win. |
| 4 | Basic bot exploit? | At **k ≥ 30** the static spread bot **loses** — the exploit is closed. |
| 5 | Coordinated manipulation? | A bloc can still force an escape, but now skill is required to reach SLAIN, so manipulation has a cost. |
| 6 | More meaningful evolution? | Yes — the outcome now depends on *how* the community plays, not its size. |
| 7 | Reddit identity? | **Strengthened** — a hard-to-reach shared goal is a stronger community story. |
| 8 | Daily return? | Stronger — every day the goal is in doubt. |
| 9 | Complexity without enjoyment? | **No new complexity** — one constant changes. |
| 10 | Evidence to reject? | If a human playtest shows casual players cannot contribute meaningfully at the chosen k. |

**Verdict: STRONGEST.** It fixes T6 with the **smallest possible change** (one constant),
adds no complexity, and preserves every mechanic and the identity.

---

## D. Alternative mechanics — adversarial verdicts

| Mechanic | Strongest attack | Survives? |
|---|---|---|
| M1 molt-memory (as forecast) | 100% predictable → trivial | **No** (as forecast); **Yes** as presentation |
| M2 feints | emerges from existing rules; no button needed | **Yes, emergent** — protect it |
| M3 sacrifice | loses 1155 vs greedy (two-day test) | **No** — dominated |
| M4 signals | already present (molt log) | **Yes, already present** |

---

## E. The strongest objections to our own recommendation

1. **"You are only changing a constant — is that enough to be 'a strong, demonstrably better
   design'?"** Fair. The honest answer: the *design* is unchanged; the **balance** is fixed.
   The mission's own evidence (T6) is a balance defect, so a balance fix is the correct-sized
   response. Adding a mechanic to "look bigger" would be the error.
2. **"Your k recommendation is from a genesis-only model."** True; Mission 06 shows the
   thresholds move with state but the *structure* (linear needed) holds. The exact k should be
   re-derived across states before implementation.
3. **"You still have no human data."** True and disclosed. Nothing here proves MOLT is fun.
4. **"Could raising k make the game frustrating?"** Yes, if too high. This is why the
   recommendation is `k=27` (winnable) with `k=30` flagged as the option that also closes the
   trivial path — a deliberate owner trade-off, not a silent choice.

---

## F. Things this review could NOT settle

- Whether the shared-goal uncertainty at `k=27` is enough for V4 to be non-trivial.
- Whether a displayed live share is desirable (UI decision, out of scope).
- Whether the equilibrium's ~6% read-band usage is stable under real human play (bots may be
  more rational than people).
- Everything about enjoyment.

**None of these blocks the recommendation; all are listed in `KNOWN_LIMITATIONS.md`.**
