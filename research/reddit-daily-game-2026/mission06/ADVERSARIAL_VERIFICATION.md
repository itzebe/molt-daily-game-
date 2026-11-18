# ADVERSARIAL VERIFICATION — Mission 06

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Attempts to **disprove the preferred recommendation** (C1 = engine, C2 = 1.0, A5 = linear `27·N`) and the
current design. Evidence: `evidence/adversarial-output.txt`, `evidence/equilibrium-sim-output.txt`,
`evidence/static-robustness-output.txt`, `evidence/mixed-crowd-tension-output.txt`,
`evidence/mixed-state-ceilings-output.txt`, `evidence/smart-vs-blind-output.txt`.

> All tests are model-level (bots vs bots). They are **not** human evidence and are never presented as
> such. A coefficient is not balanced merely because both outcomes are possible — hence this section.

---

## Summary

| # | Attack | Result | Severity |
| --- | --- | --- | --- |
| T1 | Tool repetition should be punished | **Confirmed** — fatigue fires day 2+ | — |
| T2 | Zone repetition should be punished | **Confirmed** — over-use arms the zone next day | — |
| T3 | Turnout variability should not decide the outcome | **Current formula FAILS**; linear passes | **HIGH** (for current) |
| T4 | A minority can force ESCAPED | **Confirmed** — piling minority lowers aggregate ~15 % | MEDIUM (inherent) |
| T5 | C2 sensitivity to A5 | C2 (1.6) lowers threshold 348→255; gate persists | LOW |
| T6 | A static strategy wins forever | **Confirmed under BOTH formulas** — dispersion auto-wins | **HIGH** (disclosed) |
| T7 | Hardening creates a death spiral | **No** under engine (A); **yes** under STATE_MULT (B) | — (supports C1=A) |

---

## T1 — Tool repetition → fatigue (confirmed)

`evidence/adversarial-output.txt`: a crowd that always uses `cleave` deals 2400 on day 1, then 2200 from
day 2 (cleave becomes yesterday's top tool → ×0.8). The mechanic works. **No defect.**

## T2 — Zone repetition → armour (confirmed)

A crowd piling 100 % on `crown` arms it next day (share 1.00 ≥ 0.35). The obvious target is
self-limiting. **No defect.**

## T3 — Turnout decides the outcome under the current formula (HIGH, for the current design)

`evidence/adversarial-output.txt` (T3):

| Turnout | Current `√N` formula | Linear `27·N` |
| --- | --- | --- |
| N=12 (low) | ESCAPED (dmg 379 vs I 3464) | SLAIN (379 ≥ 324) |
| N=200 (normal) | ESCAPED (dmg 5839 vs I 12000) | SLAIN (5839 ≥ 5400) |
| N=3000 (spike) | SLAIN (dmg 87200 vs I 12000) | SLAIN (87200 ≥ 81000) |

Under the current formula the **same per-striker play** escapes at N=12 and N=200 but slays at N=3000 —
the outcome is decided by turnout alone. Under the linear formula the same per-striker bar applies at
every turnout. **This is the A5 failure restated as an adversarial case.** It is the strongest evidence
*against* keeping `√N`.

## T4 — Crowd manipulation (MEDIUM, inherent)

`evidence/adversarial-output.txt` (T4): an honest crowd deals ~29/str; injecting a 40 % piling bloc drops
it to ~25/str (N=50: 1479→1250; N=500: 14559→12500). Under `k=27` that converts a win into a loss, so a
coordinated minority can **force escapes**. This is **inherent to any shared pool** — the current formula
has the same vulnerability in its large-N regime (a bloc cannot push a herd that already wins). **Disclosed
as a residual risk; not fixable by the coefficient.**

## T5 — C2 sensitivity (LOW)

Setting `pierce`-vs-exposed to 1.6 lowers the best-case threshold 348 → 255
(`evidence/adversarial-output.txt` T5). It enlarges the ceiling but **does not remove the gate**. So C2 is
not a fix for A5; it is an independent doc defect. Keeping 1.0 keeps A5 honest.

## T6 — Dispersion auto-wins (HIGH, disclosed — the biggest residual risk)

This is the most important adversarial result, and it **survives the recommended change**.

`evidence/smart-vs-blind-output.txt` and `evidence/mixed-state-ceilings-output.txt`: at the **aggregate**
(shared-pool) level, a **blind uniform spread** over all 15 combos deals **29.08/str** — *more* than
"smart" spreads like top-10 (24.3) or top-6 (27.3), and comparable to tool-aware top-5 (28.0). Because the
shared pool **sums** every striker's damage, and the crowd factor rewards *low share*, the aggregate is
maximised by **maximising dispersion**, not by precise reads.

`evidence/static-robustness-output.txt` (k=27): the static "spread-top5" and "right-tool" strategies win
**100 % of days at every N**, while "obvious" wins 0 %. So a community that simply agrees to spread
**solves the shared goal** — the shared goal rewards *dispersion*, which is closer to a participation
convention than to a per-day read.

`evidence/equilibrium-sim-output.txt` shows the same: under linear k=27, `spreadAll` wins 120/120 at N=50
and `adaptiveHerd` wins 110/120 at N=1000 — high, though not universal, and the win rate *does* move with
strategy (so the outcome is not completely flat).

**Why it happens:** the individual scoring problem ("predict the crowd, pick a low-share effective combo")
is a minority game, but the *shared* goal is a sum — and sums reward everyone moving to different combos.
The two objectives are not perfectly aligned.

**Honest conclusion:** `k=27` removes the population gate and makes the shared outcome depend on a real
collective choice (de-herd or not). But it does **not** make the shared goal reward *precision* over *mere
dispersion*. A community can win by adopting a simple "everyone pick a different combo" convention. This
is a **design-level tension** the coefficient cannot resolve, and it must be surfaced for a human
decision (see `APPROVAL_DECISION_SHEET.md`, A5 note, and `KNOWN_LIMITATIONS.md`).

`evidence/mixed-crowd-tension-output.txt` quantifies it: under the current formula the SLAIN rate is
**flat** (0 % for N≤200, 100 % for N=1000) regardless of the de-herd fraction `p` — i.e. no coordination
matters. Under linear `27·N` there is a **transition** as `p` rises (e.g. N=200: 0 % at p=0 → 88 % at
p=0.2), so *some* collective effort is required. The linear form is strictly better on this axis, even
though it does not fully separate dispersion from precision.

## T7 — Death spiral under STATE_MULT (supports C1 = engine)

`evidence/state-thresholds-output.txt` and `evidence/recommended-coefficient-output.txt` §1: under the
engine (Reading A) hardening *raises* the ceiling (no spiral). Under STATE_MULT (Reading B) hardening
*lowers* it, so escapes compound. **This is a decisive argument for C1 = keep the engine.**

## Attempts to make the game trivially predictable (searched, results)

| Parameter probe | Outcome |
| --- | --- |
| `k` ≤ 24 | lazy herd auto-wins → trivially predictable (rejected) |
| `k` ≥ 30 | only central coordination wins → unreachable (rejected) |
| any `√N` | population gate + lazy-herd auto-win at scale (rejected) |
| `k` = 27 | no gate; herd fails; dispersed crowd wins; **static spread still wins most days (T6)** |

**No coefficient value makes the shared goal simultaneously (a) gate-free, (b) non-trivial for lazy
play, and (c) resistant to a simple dispersion convention.** That combination may require a mechanic
change beyond a constant — which is outside this mission's authority and is reported as such.

## Verdict on the recommendation

The recommended ruleset (C1 = engine, C2 = 1.0, A5 = `27·N`) **survives** the attacks T1–T5 and T7, and is
**strictly better than the current formula** on T3 and T6. It does **not** fully resolve T6
(dispersion-vs-precision), which is disclosed as an open design question. The recommendation is therefore
made with that limitation stated plainly, not hidden.
