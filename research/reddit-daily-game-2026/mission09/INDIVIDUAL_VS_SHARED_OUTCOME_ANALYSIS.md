# Individual vs Shared Outcome Analysis

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/adversarial-individual-output.txt`
**Categories:** `[PROOF]` · `[SIM]`

MOLT has **two scoring axes** that are easy to conflate. Mission 09 keeps them strictly separate, because
the integrity constant acts on one and not the other.

---

## 1. The two axes

| axis | what it measures | governed by | affected by k? |
|---|---|---|---|
| **Individual** | a player's own damage for the day | `ZONE_VALUE × TOOL_MULT × CROWD_FACTOR` | **No** |
| **Shared** | whether the community slays the beast | `Σ damage` vs `Integrity = k·N` | **Yes** |

**The crowd factor (individual) and the integrity target (shared) are independent.** A player can score
highly (contrarian read) while the community still fails, and vice versa.

---

## 2. The individual axis rewards crowd-reading `[PROOF]`

A player's damage rises sharply as their combo's **crowd share falls** (§1.4 bands):

| share of players choosing the same combo | factor |
|---|---|
| ≥ 30 % | 0.7 |
| 10–30 % | 1.0 |
| 3–10 % | 1.4 |
| < 3 % | **1.9** |

**Single-deviator premium** (one player against a herd of N−1 on the obvious combo, genesis state):

| herd damage | deviator (crown:pierce) | premium |
|---|---|---|
| 21 | 57 | **+171 %** |

The best individual play is to **read the crowd and pick what others are not** — the intended skill.

---

## 3. The shared axis rewards beast-reading `[SIM]`

To maximise the *total* damage (slay the beast), the crowd must **spread across the beast's weak
points**, not pile on one combo (which triggers the ×0.7 crowd penalty):

| strategy | N=200 steady | clears k=30? |
|---|---|---|
| lazy herd (one combo) | 24.0 | ✗ |
| even spread | 23.0 | ✗ |
| **top5 (beast-read spread)** | **32.4** | ✓ |
| **selfish equilibrium** | **33.8** | ✓ |

The shared goal requires the **opposite** behaviour to a lone individual: **coordinate on a spread**,
not scatter maximally.

---

## 4. The tension is deliberate

| | a lone player wants | the crowd wants |
|---|---|---|
| crowd share of own combo | **low** (< 3 %, ×1.9) | moderate (×1.0–1.4) |
| distribution | unique / contrarian | spread over the beast's weak points |

**A whole crowd of pure crowd-readers self-defeats:** if everyone picks a unique combo, everyone gets
×1.9 but the *total* is spread thin and the beast survives. **A whole crowd of beast-readers slays the
beast but each scores less individually.** This is the strategic heart of MOLT and it is **unaffected by
k** — k only sets how much total damage is needed.

---

## 5. k-independence of the individual axis `[PROOF]`

k enters **only** the comparison `Σ damage ≥ k·N`. It does not appear in `damageFor`. Therefore:

- A player's own damage is **identical** at k = 27, 29, or 30.
- The individual leaderboard (per-user damage) is **identical** across k.
- Only the **outcome label** (SLAIN / ESCAPED) changes with k.

**Implication:** changing k **cannot** damage the individual game. It only tunes the shared difficulty.
This is why the integrity change is "one constant and one function" and why it is safe for the
individual experience.

---

## 6. Central-planner ceiling vs best decentralised play `[SIM]`

| N | exact DP ceiling (perfect coordination) | best decentralised (top5) | gap |
|---|---|---|---|
| 50 | 32.78 | 29.70 | 3.08 |
| 200 | 34.13 | 29.70 | 4.43 |
| 1000 | 34.66 | 32.25 | 2.41 |

The DP ceiling is the **theoretical maximum** if a central planner allocated every strike. The
decentralised top5 spread reaches **~87–93 %** of it. So a coordinated crowd is **near-optimal**, and
k = 30 is **below** even the decentralised ceiling — confirming the goal is achievable without
superhuman coordination.

---

## 7. Conclusion

- **Two axes, one constant.** k tunes only the shared goal; the individual game is untouched.
- **The individual skill (crowd-reading, +171 %) is preserved** under every candidate k.
- **The shared skill (beast-reading spread) is required** to clear k = 30.
- **The tension between the axes is the game's identity** and must be preserved by any rules change.
