# ADVERSARIAL FINDINGS — Mission 05

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

> **Scope and honesty.** These findings are **model-level** results from the frozen engine (bot-vs-bot
> simulation and parameter analysis). They are **not** human evidence and must never be presented as
> such. Their purpose is to find design weaknesses *before* a playtest spends human time on them.
> Every number is reproducible from `analysis/` (outputs in `evidence/`).

The mission asks me to "actively look for evidence against MOLT" and to be adversarial. Below, the
design claims are attacked one by one, with the result and the evidence.

---

## Summary table

| # | Hypothesis attacked | Verdict | Severity |
| --- | --- | --- | --- |
| A1 | "The best move is too obvious." | **Not supported** — no static dominant play | — |
| A2 | "The game punishes inexperienced players." | **Not supported** — the obvious play is decent | — |
| A3 | "The crowd-read does not actually matter." | **Not supported** — the crowd factor swings damage 2.6× | — |
| A4 | "One zone/tool dominates." | **Not supported** — 0 combos dominate in all states | — |
| **A5** | **"The shared goal (SLAIN) is reachable."** | **CONTRADICTED — SLAIN needs ≥ ~348 strikers even in the best coordinated case** | **HIGH** |
| A6 | "A single strategy carries a season." | **Not supported** — naive greedy ties a fixed herd; a reader beats both | — |
| A7 | "The mechanics contradiction is harmless." | **Partially contradicted** — it is *two* contradictions, one affecting the demo | MEDIUM |

---

## A1 — "The best move is too obvious." → not supported

A naive agent that always picks the highest-base-value `(zone,tool)` for the current state does **not**
dominate. Over 180 days (40-player naive crowd, real molt rules):

| Strategy | Season damage |
| --- | --- |
| naive greedy (obvious best-base play) | 4317 |
| contrarian (least-used zone, best tool) | **7631** |
| fixed herd (always `crown:cleave`) | 4317 |

The crowd-reading play beats the obvious play by ~77 %. Evidence:
`evidence/adversarial-probes-output.txt`.

## A2 — "The game punishes inexperienced players." → not supported

On a representative day-2 beast:

| Play | Damage |
| --- | --- |
| obvious herd play (`crown:cleave` @40 %) | **34** |
| contrarian read (`gut:pierce` @2 %) | 53 |
| worst plausible play at 40 % share | 7 |

The obvious play is **decent** (34); the wrong-tool penalty is soft. A newcomer is not wiped out.
Evidence: `evidence/adversarial-probes-output.txt`.

## A3 — "The crowd-read does not actually matter." → not supported

The **same** effective strike (`gut:pierce`, exposed) varies with crowd share:

| Crowd share | Damage |
| --- | --- |
| herd (40 %) | 20 |
| common (15 %) | 28 |
| lone (5 %) | 39 |
| read (2 %) | **53** |

A 2.6× swing on identical play. The crowd factor is **load-bearing**, not decorative. Evidence:
`evidence/adversarial-probes-output.txt`.

## A4 — "One zone/tool dominates." → not supported

**Zero** `(zone,tool)` combos are the best choice for their zone in every state. The best *tool*
changes with the state, and the state is crowd-driven. So "obvious" play cannot be static. Evidence:
`evidence/adversarial-probes-output.txt`.

## A6 — "A single strategy carries a season." → not supported

As A1: naive greedy (4317) ties a fixed herd (4317) and both lose to a reader (7631). One fixed
strategy does not carry a season. Evidence: `evidence/adversarial-probes-output.txt`.

---

## A5 — **"The shared goal (SLAIN) is reachable." → CONTRADICTED (HIGH severity)**

This is the most important finding of the mission.

### The claim under test

The design (Mission 03 §2.5) says the community has a **shared goal**: deal enough damage and the beast
is **SLAIN** (reward: trophies, a cosmetic skin, flair); fall short and it **ESCAPES** (penalty: it
starts hardened tomorrow). The daily "war room" argument depends on this being a *real, contested*
goal.

### What the numbers show

`Integrity = min(1000·√N, 12000)`. Damage grows roughly *linearly* in the number of strikers `N`
(each striker adds damage), while Integrity grows only as `√N` up to the cap. So the **best possible**
damage-to-Integrity ratio grows like `√N` — meaning there is a **population threshold** below which the
beast *cannot* be slain no matter how well the crowd plays.

A hill-climbing **optimiser** computed the maximum total damage a perfectly coordinated crowd of size
`N` could deal to the genesis beast (all zones exposed) — the best case for the crowd
(`evidence/integrity-bestcase-output.txt`, `evidence/integrity-bestcase-crossover.txt`):

| N (strikers) | Integrity | BEST coordinated total | reachable? |
| --- | --- | --- | --- |
| 10 | 3162 | 280 | **no** |
| 50 | 7071 | 1574 | **no** |
| 100 | 10000 | 3321 | **no** |
| 200 | 12000 | 6815 | **no** |
| 300 | 12000 | 10320 | **no** |
| 340 | 12000 | 11726 | **no** |
| **350** | 12000 | **12068** | **YES** |
| 400 | 12000 | 13797 | YES |
| 1000 | 12000 | 34659 | YES |

Under realistic crowd models the practical crossover is a little higher still — ~450 strikers for a
spread crowd, ~500 for a herd crowd (`evidence/integrity-probe-output.txt`).

**Best-case crossover: ≈ 348–350 strikers. Realistic crossover: ≈ 450–500 strikers.**

### Why it matters

For **any** subreddit with fewer than ~350 daily strikers — which includes essentially every new or
mid-size subreddit, and certainly any demo — the **SLAIN branch is unreachable** and the **ESCAPED
penalty fires every day**. The shared "kill the beast together" goal is then **decorative**: the
community cannot win, so the tension the design relies on does not exist. Worse, the beast would
**harden every single day** (escape penalty), a monotonic drift with no counterweight.

This is a **model-level** finding and it is a *parameter* problem, not a mechanic problem: the concept
is sound, but `INTEGRITY_COEFF = 1000` makes the goal unreachable at small N. Note the design doc
itself flags `Integrity coefficient (1000)` as a balance lever (Mission 03 spec §9) — this finding is
the evidence that the lever needs turning.

### Caveats (stated to avoid over-claiming)

- This assumes the genesis/all-exposed beast. A **hardened** beast with a `raw` zone actually yields
  *more* damage per striker (the `raw` 1.6 multipliers), so the threshold could be slightly lower on a
  scarred beast — but the effect is second-order (see `evidence/hardened-crossover-check.txt`) and does
  not remove the threshold.
- This is a simulation, not real play. Real crowds are neither perfectly uniform nor a clean 80/20
  herd. But **the optimiser result is an upper bound**: *no* real crowd can beat the best coordinated
  crowd, so if the optimum cannot slay at N=200, **nothing can**.

### Smallest evidence-supported correction (proposed, NOT applied)

Per Mission 05 §8, if the experiment fails, propose the *smallest* correction, do not redesign. The
smallest correction is a **single constant**: lower `INTEGRITY_COEFF` so that a modest, engaged
subreddit can occasionally slay. For example, so that a perfectly-played crowd of ~50–100 can reach the
goal (a value near `1000·√50 ≈ 7000` is already the cap at N≈144; lowering the coefficient to ~`300`–`400`
would make SLAIN attainable from ~N≈50–100). **This changes balance and therefore requires explicit
approval and a re-run of the balance tests and the playtest.** It is *not* applied here.

---

## A7 — "The mechanics contradiction is harmless." → partially contradicted

Mission 04 disclosed one contradiction. There are **two**, and one of them touches the demo's headline
example. Full analysis in `MECHANICS_CONTRADICTION_ANALYSIS.md`. Severity MEDIUM because the recommended
resolution changes only documents, not the engine — but the design owner must decide.

---

## The questions Mission 05 asks, answered honestly

| Mission 05 question | Answer from the evidence |
| --- | --- |
| Is it enjoyable only because the novelty is new? | **Unknown** — requires humans. |
| Do players understand the community-driven transformation? | **Unknown** — requires humans. |
| Does the crowd-reading mechanic actually influence decisions? | **It influences outcomes** (A3, 2.6× swing). Whether it influences *human decisions* is unknown. |
| Is the best move too obvious? | **No** — no static dominant play (A1, A4, A6). |
| Does the game punish inexperienced players? | **No** — the obvious play is decent (A2). |
| Do experienced players find meaningful strategic depth? | **Plausibly yes at model level** (a reader beats the greedy by 77 %, A1) — but *human* depth is unknown. |
| Do non-gamers enjoy it without extensive instruction? | **Unknown** — requires humans. |
| Does it remain interesting after multiple decisions? | **Model says the best play keeps moving** (12–14 distinct bests/120 days) — human interest unknown. |
| Do players care about the creature, the competition, or neither? | **Unknown** — requires humans. |
| Is the daily return loop compelling enough to stand alone? | **Unknown** — requires humans; and A5 shows the shared goal may be unreachable at small N, which would weaken the loop. |

**The adversarial pass did not disprove the core mechanic.** It *did* find one high-severity parameter
flaw (A5) and one documentation flaw (A7) that must be fixed before the game is buildable as designed.
