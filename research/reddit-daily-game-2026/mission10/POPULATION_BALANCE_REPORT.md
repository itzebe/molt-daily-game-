# POPULATION BALANCE REPORT

**Mission 10 · MOLT · Date:** 2026-11-18
Evidence: `evidence/benchmark-reproduction-output.txt`.

---

## 1. The question

Does `Integrity = 30 × N` hold the intended balance across population sizes — closing the trivial
path without making the shared goal unreachable for an engaged crowd?

## 2. Result by population (steady per-player / SLAIN %, 9 seeds, 150 days)

**Engaged crowd (`TOP5`, reads the beast):**

| N | k=29 | k=30 | k=31 |
|---|---|---|---|
| 25 | 32.4 / 99 % | **32.4 / 99 %** | 29.7 / 0 % |
| 50 | 32.4 / 99 % | **32.4 / 99 %** | 29.7 / 0 % |
| 200 | 32.4 / 99 % | **32.4 / 99 %** | 29.7 / 0 % |
| 1000 | 32.4 / 99 % | **32.4 / 99 %** | 29.7 / 0 % |

The engaged crowd clears the goal at **every N** for k = 29 and k = 30, and **never** at k = 31.

**Beast-ignoring ceiling (max over 12 ignoring rules):**

| N | k=29 | k=30 | k=31 |
|---|---|---|---|
| 25 | 28.7 / 50 % | 29.2 / 1 % | 29.2 / 0 % |
| 50 | 28.5 / 1 % | 28.5 / 0 % | 28.5 / 0 % |
| 200 | 28.3 / 1 % | 28.3 / 0 % | 28.3 / 0 % |
| 1000 | 28.3 / 16 % | 28.4 / 1 % | 28.4 / 0 % |

At **k = 30** the best trivial (beast-ignoring) rule clears at most **1 %** of days at any N; at
**k = 29** it clears up to **50 %** (N=25, `zoneMajor15`) and 16 % (N=1000, `randomDaily`). So k = 29
leaves the trivial path open; **k = 30 closes it at every population size.**

## 3. Why k = 30 and not 31

The engaged ceiling is ~32.4 per player; the best trivial ceiling is ~29.2. The admissible window is
therefore roughly **(29.2, 32.4)**. k = 30 sits inside it with ~0.9 margin below (over the best
trivial rule) and ~2.4 above. k = 31 exceeds the engaged crowd's steady ceiling → the goal becomes
unwinnable (0 % SLAIN everywhere). **k = 30 is the unique integer in the window.**

## 4. The thin-margin caveat (unchanged from Mission 09)

- The **k = 30 margin over the best trivial rule is ~0.9** — not large. `zoneMajor15` at N=25 scores
  29.2, just 0.8 below the target.
- The **failure cliff is razor-thin** (30.00 → 30.02, see benchmark report). If real crowds clear the
  opening days, k = 30 succeeds; if not, the day-3 lock-in fails the goal. This is precisely why the
  human playtest (k = 29 vs k = 30) is the gating evidence before any launch.
- Population balance is **stable across N** (25 → 1000): the linear target does not become easier or
  harder with scale, which is the property the old sqrt form lacked (it made large crowds trivial).

## 5. Turnout sensitivity (the real product risk)

Mission 09 showed that a **half-engaged** crowd (a fraction playing the trivial rule) can fail the
goal at high k. At k = 30 the 0.9 margin means a subreddit whose players mostly ignore the beast may
not clear. This is a **design/tuning** risk, not a correctness defect, and it is the second thing the
playtest probes.
