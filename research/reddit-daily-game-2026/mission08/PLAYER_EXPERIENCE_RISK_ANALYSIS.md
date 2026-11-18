# Player Experience Risk Analysis

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · **All human-experience claims are `[HYPOTHESIS]` — no humans have played MOLT.**

The brief: *"Do not claim that either constant is fun or validated. Instead, derive testable
predictions."* This document does that. Every claim is tagged `[HYPOTHESIS]` and paired with a
playtest measurement in `HUMAN_PLAYTEST_REQUIREMENTS.md`.

---

## 0. The honest starting point

- **Zero humans have played MOLT** (Mission 05 and 07 both recorded 0 participants).
- The damage/clear numbers below are `[ENGINE]`/`[SIM]`; the *experience* claims are `[HYPOTHESIS]`.
- Nothing here says either k is fun. It says what each k would **require** and what to **measure**.

---

## 1. Non-gamers

| Question | k=27 `[HYPOTHESIS]` | k=30 `[HYPOTHESIS]` | Measurement |
|---|---|---|---|
| Can a new player contribute meaningfully? | Yes — even a lazy strike (24/player) is near the clear bar; their damage "counts". | **Partially** — a lazy strike is far below the bar, so a non-gamer's contribution is proportionally small; but they can still contribute by *spreading*. | Time-to-first-strike; "did my strike matter?" 1–5 |
| Does a community victory feel achievable? | Yes — the goal is cleared most days even by weak play. | **Only if the crowd coordinates** — a disorganised sub will fail and feel defeated. | "Could you tell if we would win?" |
| Does the creature's evolution remain understandable? | Yes (unchanged by k). | Yes (unchanged by k). | Explain the day-1→2 change |
| Could a high target make participation feel pointless? | No. | **Risk: YES** — if the sub fails repeatedly, non-gamers may feel their strike is irrelevant (the bistability lock-in). | "Did your strike feel consequential?" across ≥5 days |

**Derived prediction [HYPOTHESIS]:** k=30 risks a **demoralisation loop** for casual subs — an early
failure locks the state into a low-damage attractor (`bistability.ts`) and the sub cannot recover
without a coordinated change in play. **This is the single biggest UX risk of k=30 and the reason
k=29 is the documented gentler alternative.**

**Mitigation to test:** a **recovery valve** (see `IMPLEMENTATION_SPECIFICATION.md` §7) — e.g. the
escape penalty relaxing after consecutive escapes, or a visible "the beast is weakened" state after
a loss — so a failed day does not permanently trap a casual sub.

---

## 2. Experienced gamers

| Question | k=27 `[HYPOTHESIS]` | k=30 `[HYPOTHESIS]` | Measurement |
|---|---|---|---|
| Is there enough room for strategy? | The **individual** axis has full depth (crowd-reading). The **shared** axis does not (trivial). | Both axes reward skill (crowd-reading individually; beast-reading collectively). | "Did you try to predict the crowd?" |
| Can they influence the outcome? | Marginally — the goal is easy. | **Yes** — their spread choice materially changes whether the group clears. | "Did your choice change the group result?" |
| Does predicting the crowd matter? | **Individually yes** (unchanged by k); not for the shared goal. | **Individually yes; and beast-reading matters for the group.** | observed crowd-reading attempts |
| Can they exploit a trivial winning strategy? | **Yes** — the even spread wins the shared goal. | **No** — no beast-ignoring rule clears. | (from the engine analysis, `[SIM]`) |

**Derived prediction [HYPOTHESIS]:** experienced players will find the **individual leaderboard**
rewarding at either k (crowd-reading pays +56–255%), but will find the **shared goal** only
meaningful at k≥29. At k=27 the shared goal is "free", which may make mastery feel pointless for
the group.

---

## 3. The non-gamer / gamer balance

MOLT's design promise is **one action serves both** (`CASUAL_AND_EXPERIENCED_PLAYER_ANALYSIS.md`,
Mission 07). The k choice is the **only** lever that changes that balance:

| k | Non-gamer feel | Gamer feel |
|---|---|---|
| 27 | The goal is easy; participation feels rewarded but not earned. | Individual depth is there; the shared goal is not a challenge. |
| 29 | The goal is a real but reachable challenge; casuals contribute if the crowd spreads. | Both axes reward skill; moderate margin below the failure cliff. |
| 30 | The goal is hard; casuals risk demoralisation if the sub fails early. | Both axes reward skill; thin margin below the cliff. |

**Recommendation [HYPOTHESIS]:** **k=29 is the better *first* choice for a mixed audience** (it has
~1.5 margin below the cliff and is cleared by a noisy crowd), **with k=30 as the "strict" option**
once playtest data shows casuals can clear it. This is the accessibility-vs-strictness trade-off the
playtest must inform.

---

## 4. Testable predictions (for the playtest to confirm or refute)

| ID | Prediction | Refuted if… |
|---|---|---|
| PX-1 | Non-gamers reach a first meaningful strike in ≤30 s (k-independent). | median > 30 s |
| PX-2 | At k=29, a non-gamer can explain why spreading beats piling (after 3 days). | <4/8 can |
| PX-3 | At k=30, a non-gamer who fails day 1 reports low consequentiality (≤2/5). | reports ≥4/5 |
| PX-4 | Gamers attempt crowd-reading by day 3 (k-independent). | <4/8 do |
| PX-5 | At k=29, mean return-intent ≥3.5/5 in both groups. | <3.5 |
| PX-6 | The bistability lock-in is *not* visible in a 5-day playtest (i.e. a sub can recover). | a sub stays locked |

---

## 5. What is explicitly NOT claimed

- **Not claimed:** that k=27 or k=30 is fun.
- **Not claimed:** that any threshold is "validated" by humans.
- **Not claimed:** that the simulation predicts real behaviour (bots are more rational than people).
- **The honest position:** the mathematics constrains k to ~29–30; **which** of 29 or 30 is right is
  a **human** question that only the playtest can answer.
