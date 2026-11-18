# Design Owner Decision Sheet

**Mission 08 · MOLT · The Integrity Decision Gate**
**Date:** 2026-11-18 · **This is a recommendation. It is NOT design-owner authorization.**
**Nothing has been implemented.**

---

## 1. Final decision

> ## REQUEST APPROVAL — **recommend `k = 30`**
>
> - **`k = 27` is REJECTED** — refuted by evidence: a beast-ignoring even spread clears it on
>   50–100% of days (and uniform-random clears 67% at N=1000). It fails Mission 07's own objective.
> - **`k = 30` is RECOMMENDED** — the **smallest integer** that defeats **every** beast-ignoring
>   strategy at **every** population size tested (the stated objective, fully achieved). It sits at
>   the **top of the dynamic window** `[29, ~30.3]` (static window `[29, 32]`), **~0.3 below the
>   failure cliff**.
> - **`k = 29` is the documented ACCESSIBILITY ALTERNATIVE** — it defeats the trivial rules at
>   realistic population sizes (N ≥ 30) and keeps a larger margin below the failure cliff, at the
>   cost of a tiny-N gap.
>
> **Supported range: `k ∈ {29, 30}`.** Choose **30** as the primary (objective fully met); choose
> **29** if the playtest shows casual subreddits cannot sustain the higher bar. **Choose neither 27.**

### Why 30 and not 29 (the honest tie-break)

| | k = 29 | k = 30 |
|---|---|---|
| Defeats trivial rules at **all** N | **NO** (fails at N < 30) | **YES** |
| Margin above the trivial ceiling (29.5) | +~0.5 (at realistic N, ceiling 28.5) | +~0.5 |
| Margin below the failure cliff (~30.3) | **+~1.3** | +~0.3 |
| Position in the dynamic window [29, 30.3] | lower-middle | **top edge** |
| Realistic noisy-crowd clearability | easier (~20–30% readers) | harder (~40–50% readers) |

**k = 30 fully achieves the objective (T6 closed everywhere) but sits at the top of the dynamic
window; k = 29 is safer against the bistability cliff and friendlier to casual subs, at the cost of
the tiny-N gap.** Both are defensible; the human playtest is the tie-breaker. **The mission
recommends 30 as primary, 29 as the alternative.**

---

## 2. The eight required statements

### 2.1 Exact proposed formula

```
Integrity(N) = k · N        (k integer; no cap)
```
replacing `Integrity(N) = min(1000·√N, 12000)` at `resolve.ts:81–82`.

### 2.2 Exact constant

**`k = 30`** (recommended). Documented alternative: **`k = 29`**. Rejected: **`k = 27`**.

### 2.3 Why it is preferable to the alternatives

| Alternative | Why not |
|---|---|
| **k = 27** | The dynamic beast-ignoring ceiling reaches **28.5** at realistic N (29.5 at tiny N). 27 < 28.5 ⇒ **trivial rules clear it** (50–100%). It fails Mission 07's own objective. |
| **k = 29** | Defeats every beast-ignoring rule at realistic N (≥30), with a **~1.3 margin** below the cliff — **gentler**, but it **fails at tiny N (<30)**, where the even spread (ceiling 29.16–29.50) still clears. A real but narrow gap. |
| **k = 30** | The **smallest integer that defeats every beast-ignoring rule at every N tested** — the objective fully achieved — at the **top of the dynamic window `[29, ~30.3]`** (static window `[29, 32]`). Its one weakness: only **~0.3** below the failure cliff, so it needs a playtest (and possibly a recovery valve). |

### 2.4 What evidence supports it

| Evidence | File | Category |
|---|---|---|
| Model == engine (8405/8405) | `fidelity8.ts` | `[ENGINE]` |
| Linear is scale-invariant; `√N` is not | `verify-math.ts`, `separation.ts` | `[PROOF]` |
| Beast-ignoring max = 29.50 (N=22), 29.16 (N=25), ~28.5 (N≥30) | `final-curves.ts`, `trivial-battery.ts` | `[SIM]` |
| k=27 cleared by trivial rules 50–100%; k=29/30 not | `dynamic-k.ts`, `mixed-under-k.ts` | `[SIM]` |
| Failure cliff at k≈30.3 (k=30 clears, k=30.5 does not) | `bistability.ts` | `[SIM]` |
| Realistic noisy crowd reaches ~25–30 | `noisy-crowd.ts` | `[SIM]` |
| Individual crowd-reading rewarded (+56–255%), k-independent | `ceiling-dynamic.ts` | `[PROOF]` |

### 2.5 What risks remain

| Risk | Severity | Note |
|---|---|---|
| **Bistability lock-in** — a sub that fails early stays failed | **High** | `bistability.ts`; argues for a recovery valve + playtest. |
| **k=29 defeated by an even spread at N < 30** | Low | Only tiny communities; not a realistic Reddit regime. |
| **No human data** | **High** | 0 participants; all UX claims are `[HYPOTHESIS]`. |
| **C1/C2 unresolved** | Medium | Both shift the ceilings; k must be re-derived if they change. |
| **Bots more rational than people** | Medium | Magnitudes are optimistic. |
| **Genesis/static numbers** are not the dynamic ones | — | Resolved by this mission (dynamic analysis added). |

### 2.6 What implementation would change

See `IMPLEMENTATION_SPECIFICATION.md`. In short: **one constant** (`rules.ts`), **one function**
(`resolve.ts`), and the tests. **No** change to `molt.ts`, `game.ts`, the UI, the crowd bands, the
tool/zone tables, C1, or C2.

### 2.7 What must be tested with humans

`HUMAN_PLAYTEST_REQUIREMENTS.md`: 8 people (4 gamers, 4 non-gamers), the tested constant, measuring
(a) can a non-gamer contribute, (b) does the sub recover after an escape (the lock-in), (c) do
gamers learn to spread, (d) does the strike feel consequential, (e) return intent ≥3.5/5.

### 2.8 Does the original MOLT identity remain intact?

**YES.** The change is a single constant in the integrity target. Every identity element is
untouched: one shared creature, one strike per day, zone+tool choice, community-driven molt,
hardening/neglect, individual reward for anticipating the crowd, the evolving silhouette. The
change **strengthens** the identity by making the shared goal a genuine community skill rather than
a formality.

---

## 3. The comparison table (required by the brief)

| Measure | k=27 | k=29 | k=30 |
|---|---|---|---|
| Small-community win (N=50) | even spread **100%** | even spread 0% | even spread **0%** |
| Medium-community win (N=200) | even spread **50%**, random 7% | even spread 0% | even spread **0%** |
| Large-community win (N=1000) | even spread **50%**, random **67%** | even spread 0% | even spread **0%** |
| Blind-dispersion outcome | **clears (T6 open)** | defeated (N≥30) | **defeated (all N)** |
| Deliberate-prediction outcome (shared) | reader 66% | reader ~50% | reader ~50% |
| Coordinated-player outcome | even spread clears | only beast-read clears | only beast-read clears |
| Individual strategic advantage | unchanged (+56–255%) | unchanged | unchanged |
| Lazy-play vulnerability | **high** (random/even clear) | low | **none** |
| Risk of discouraging newcomers | low (goal easy) | **moderate** | higher (thin margin) |
| Margin below failure cliff | large | **~1.5** | **~0.3** |
| Realistic-crowd clearability | high | **good (~20–30% readers)** | hard (~40–50% readers) |

---

## 4. Is the "29.1" result stable? (the brief's explicit question)

**No.** `K27_VS_K30_DECISION.md` §1: 29.1 is the **genesis-static** value. The dynamic ceiling is
**29.50** (tiny N) / **~28.5** (realistic N); the state-dependent static ceiling reaches **37.41**.
**30 is justified against 29.50, not 29.1; 29 against ~28.5.** Neither is chosen merely because it
exceeds one experiment.

---

## 5. Owner sign-off form

| Decision | Choose |
|---|---|
| **APPROVE k = 30** (recommended: objective fully met) | ☐ |
| **APPROVE k = 29** (gentler alternative) | ☐ |
| **APPROVE k = 27** | ☐ (not recommended) |
| **HOLD** (request a playtest first) | ☐ |
| Add the recovery valve (if BI-6 fails) | ☐ |
| Settle C1/C2 before fixing k | ☐ |

> **STOP.** No gameplay change is authorised by this document. Wait for explicit user approval.
