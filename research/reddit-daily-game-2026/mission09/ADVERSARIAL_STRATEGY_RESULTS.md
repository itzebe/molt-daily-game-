# Adversarial Strategy Results

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/adversarial-individual-output.txt`,
`evidence/k-decision-output.txt`
**Categories:** `[PROOF]` · `[SIM]`

Every plausible strategy family was run dynamically (state evolves) at multiple N and k, to find any
rule that defeats the recommended constant or exploits the rules.

---

## 1. The strategy families tested

| family | reads the beast state? | reads the crowd? | example |
|---|---|---|---|
| lazy herd | no | no | always the biggest-value combo |
| even spread (15) | no | no | cycle all 15 combos |
| zone-major spread | no | no | even over 5 zones × 3 tools |
| single-tool spread | no | no | all cleave, across zones |
| fixed allocation | no | no | same combo every day |
| static-ranked spread | no (genesis only) | no | top-5 from the *genesis* ranking, frozen |
| random (daily) | no | no | re-draw each day |
| beast-reading spread | **yes** | no | spread over the beast's current weak points |
| right-tool-by-state | yes | no | each zone's best tool |
| selfish equilibrium | yes | **yes** | iterated best response |
| single deviator | — | yes | one player against a herd |

---

## 2. Steady per-player by strategy and k (N = 200, 150 days) `[SIM]`

| strategy | √N | k=27 | k=29 | k=30 | k=31 |
|---|---|---|---|---|---|
| herd (obvious) | 24.0 | 24.0 | 24.0 | 24.0 | 24.0 |
| even5 spread | 23.0 | 23.0 | 23.0 | 23.0 | 23.0 |
| cycle15 | 28.2 | 27.6 | 28.2 | 28.2 | 28.2 |
| uniform-agnostic | 28.2 | 27.5 | 28.2 | 28.2 | 28.2 |
| rightTool/zone | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 |
| **equil (selfish)** | 33.2 | 33.8 | 33.8 | 33.8 | 33.8 |
| **top5 (beast-read)** | 29.7 | 32.3 | 32.4 | **32.4** | 29.7 |
| random (seed 1) | 29.1 | 27.9 | 28.5 | 29.1 | 29.1 |

**Key observations:**
- **No beast-ignoring rule exceeds ~29.1** (random) — well below k = 30.
- The **engaged top5 crowd** reaches **32.4** — comfortably above k = 30.
- **The selfish equilibrium reaches 33.8**, the highest of all. This is a genuine *finding*, not a
  defeat: the self-interested play *is* a form of crowd-reading (spreading away from others), so it
  naturally sits high. It does **not** break k = 30 (33.8 > 30); it *clears* it. See §5.

---

## 3. Which rules clear which k? `[SIM]`

| k | lazy herd | even5 | cycle15 | uniform | rightTool | equil | top5 | random |
|---|---|---|---|---|---|---|---|---|
| 27 | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| 29 | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| 30 | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |

At k = 30, only **state-aware or crowd-aware** rules clear (equil, top5). **Every beast-ignoring,
crowd-ignoring rule fails.** This is exactly the design intent.

---

## 4. Single-deviator premium (individual axis) `[PROOF]`

One player against a herd of N−1 on the obvious combo, genesis state:

| k | herd damage | deviator (crown:pierce) | premium |
|---|---|---|---|
| 27 | 21 | 57 | **+171 %** |
| 30 | 21 | 57 | **+171 %** |

**The individual premium is +171 % and is independent of k** — k is the *shared* target and does not
touch a player's own damage. This confirms the two axes are **decoupled**: k governs the shared goal,
the crowd factor governs the individual payoff.

---

## 5. Does the selfish equilibrium defeat k = 30? `[SIM]`

**No — and this is important.** The iterated best response (selfish play) reaches 33.8 > 30, so it
*clears* the goal. But:

1. It **helps** the shared goal (it contributes high damage).
2. It is **hard to sustain** — it requires every player to continuously re-optimise against the crowd,
   which real casual players will not do.
3. Its high value comes from the **crowd factor** (spreading to low-share combos), which is the
   intended individual skill.

So the equilibrium is not an exploit; it is the **upper end of legitimate play**. It does not threaten
k = 30; it strengthens the case that k = 30 is reachable by skilled crowds.

---

## 6. The one real exploit-shaped finding: turnout

**A 50 %-engaged crowd clears no k ≥ 28** (0/150, §turnout in `DYNAMIC_INTEGRITY_REVALIDATION.md`).
This is the honest weakness: **the shared goal depends on a majority of players engaging.** It is not
an exploit (no one benefits from disengaging — they get 23 vs 32), but it means **a low-engagement
subreddit will never slay the beast**. This is a product risk, not a rules defect, and it is exactly
what the human playtest must measure.

---

## 7. Conclusion

- **No beast-ignoring rule reaches k = 30.** The constant holds against the full battery.
- **State-aware and crowd-aware rules clear it** (32.4 and 33.8), so it is not too hard.
- **The individual premium (+171 %) is intact and k-independent.**
- **The only real risk is turnout** — a product question for the playtest, not a mathematical one.
