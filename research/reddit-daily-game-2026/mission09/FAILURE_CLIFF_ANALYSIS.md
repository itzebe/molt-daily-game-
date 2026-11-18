# Failure Cliff Analysis

**Mission 09 · MOLT · Date:** 2026-11-18 · **Evidence:** `evidence/failure-cliff-output.txt`,
`evidence/bistability-trace-output.txt`
**Categories:** `[SIM]` · `[PROOF]`

The failure cliff is the single most important risk in the integrity decision. This document locates
it precisely and explains its **mechanism**, so the design owner can judge whether it is acceptable.

---

## 1. Where the cliff is `[SIM]`

Engaged crowd (top5), N = 200, 9 seeds (1350 day-resolutions):

| k | SLAIN % |
|---|---|
| 29.8 | 98.7 % |
| 29.9 | 98.7 % |
| **30.0** | **98.7 %** |
| **30.02** | **0.0 %** |
| 30.1 | 0.0 % |
| 30.5 | 0.0 % |

**The cliff is between k = 30.0 and k = 30.02.** The transition is **instantaneous** — 98.7 % → 0 %
over a 0.02 change in k. This is **not** a smooth difficulty curve; it is a **bistable lock-in**.

---

## 2. The mechanism: path dependence `[SIM]`

Day-by-day trace, engaged crowd, N = 200 (`bistability-trace.ts`):

**At k = 30 (clears):**

```
day  1: per=28.00  ESCAPED state=eeeee
day  2: per=29.40  ESCAPED state=aaaer
day  3: per=30.00  SLAIN   state=aeaar
day  4: per=32.80  SLAIN   state=araer   <- locks into the high-damage cycle
...
day 20: per=31.40  SLAIN   state=aaerr   (cycle repeats ~31.4–34.0)
```

**At k = 30.02 (never clears):**

```
day  1: per=28.00  ESCAPED state=eeeee
day  2: per=29.40  ESCAPED state=aaaer
day  3: per=30.00  ESCAPED state=aeaar
day  4: per=29.40  ESCAPED state=aaaer   <- locks into the LOW-damage cycle
...
day 20: per=29.40  ESCAPED state=aeaar   (cycle repeats 29.4–30.0, never reaching 30.02)
```

**What happens:** on days 1–2 the crowd **escapes**, so the §3.7 escape penalty adds armour. Under the
engine reading, armour **raises** the ceiling *if the crowd then hits the right tool*. Whether the
state tips into the **high-damage attractor** (days 3+, per ≈ 31–34) or the **low-damage attractor**
(per ≈ 29.4–30.0) depends on whether the **early days** push per-player damage past k:

- At k = 30, day 3 reaches exactly 30.00 → clears → the good attractor is entered.
- At k = 30.02, day 3 reaches 30.00 < 30.02 → escapes again → the beast stays hardened in the bad
  attractor → **permanent escape**.

**The long-run outcome is decided by the first 2–3 days, not the steady state.** A subreddit that has
a slightly unlucky opening (a slightly less coordinated first crowd) tips into permanent escape even
if its later play would have cleared k = 30.

---

## 3. Why this matters for the constant choice

| k | margin below the cliff | consequence |
|---|---|---|
| 29 | **+1.02** | comfortable; but the trivial path is open (50 % SLAIN at N=25) |
| **30** | **+0.02** | the objective is met, but the margin is **razor-thin** |
| 30.02+ | negative | the engaged crowd **never** clears |

**k = 30 sits exactly on the edge of the cliff.** It clears the objective, but any real-world factor
that lowers the crowd's early-day damage by ~1 % flips the sub into permanent escape.

---

## 4. Is the cliff *inherent* or an artefact?

**Inherent to the current ruleset, and traceable to §3.7.** The escape penalty (adding armour) is what
creates the two attractors. Under the engine reading, armour *raises* the ceiling when the right tool
is used — but it also *changes which combos are right*, and a spread that does not re-read perfectly
gets a *lower* ceiling in the hardened state. The two effects create the bistability.

**This is a design risk, not a numerical accident.** It can be mitigated by:
1. **A recovery valve** — e.g. cap the number of armour zones the escape penalty can add (so the beast
   cannot lock), or let a very good day undo an armour.
2. **Choosing k = 29** (accepting the tiny-N trivial gap) for margin.
3. **A gentler early game** — e.g. start the beast at genesis so the first day is winnable.

**None of these is recommended here** (they are gameplay changes beyond scope). They are listed so the
design owner can weigh them against k = 30's thin margin.

---

## 5. What the human playtest must resolve

The model cannot answer: **does a real crowd clear the first 2–3 days at k = 30?** That single question
decides whether the cliff is a theoretical risk or a practical failure. It is the primary success
criterion of the playtest (`HUMAN_PLAYTEST_PROTOCOL.md`).
