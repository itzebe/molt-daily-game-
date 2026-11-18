# Mission 07 — Executive Verdict

**MOLT — The Living Beast: Strategic Depth, Crowd Psychology & the Next Evolution**
**Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · **Authority:** research only — nothing implemented, nothing changed.
**Baseline:** HEAD `4b41b86`; prototype frozen at `410b3ba`; 47/47 + 35/35 + 49/49 evidence checksums
verified; 42/42 tests pass; Mission 07 model fidelity 5325/5325.

---

## Verdict: **CONDITIONAL GO**

A **strong, evidence-backed design direction has emerged** — but it is a **balance fix, not a new
mechanic**, and it remains **conditional on a human playtest** and on owner decisions. MOLT is
**not** strategically shallow (the central fear is refuted), and the one real defect is fixable at
near-zero cost.

**Score of the recommended direction: 93/100** (`COMPETITIVE_SCORING.md`).
Frozen MOLT scores 84/100; prediction-and-exploitation MOLT scores 60/100 (rejected).

---

## The eight required answers

### 1. Is MOLT more interesting with the proposed prediction mechanic?
**No — the zone forecast (V1–V3) should be rejected.** It is **trivial** (the correct zone is the
obvious zone 100% of the time when the crowd is predictable; entropy 0.00 bits) or **random**
(when the crowd is dispersed). A constant rule captures any such bonus, and a coordinated bloc can
flip the answer. It adds a second decision for no strategic space and would dilute MOLT's identity.
**One narrow survivor** (the shared-goal call, V4) is worth a playtest *only if* the shared goal is
made genuinely uncertain — it is `[HYPOTHESIS]`, not proven.

### 2. Does it genuinely reward understanding the crowd?
**Yes — this is MOLT's strongest existing asset, and it is already in the frozen engine.** [PROOF]
A player who correctly reads the crowd scores **57.0** vs **37.9** for blind dispersion (+50%).
Blind dispersion is **not** a dominant strategy — it is **exploitable** (+29 to a single deviator),
and self-interested play converges to a **Nash equilibrium at 34.1**, **+17% above** dispersion and
**+63% above** the lazy herd. **T6's premise — that the game rewards a trivial spread — is refuted
on the individual axis.**

### 3. Has T6 been resolved, or merely hidden?
**Both diagnosed and resolved in direction.** T6 is **real but mis-scoped**: it lives on the
**shared pool** (which sums damage, so dispersion raises the total), **not** on the individual
score (which rewards reading). The shared-pool defect is fixed by **raising the integrity
coefficient**: with a **linear** target, `k ≥ 30` makes the trivial dispersion rule (29.1) **lose**
while genuine coordination (34.1) wins. **Not hidden — relocated to the correct axis and given a
one-constant fix.**

### 4. Does population scaling work?
**The `√N` formula does not; a linear formula does.** [PROOF] `√N` creates a hard **population
gate** (small subs cannot win even with perfect play) and an **auto-win** for large subs (the herd
clears the cap). A **linear** target `Integrity = k·N` makes the per-player requirement **constant**
(scale-invariant): the achievable per-player aggregate for a given mix is **flat in N** (verified:
a 30%-skilled mix yields 25.9 → 27.1/player from N=50 to N=10000), small subs win iff skilled, and
the herd never wins (k ≥ 22). **Recommendation: `k=27` (default) or `k=30` (also defeats the
trivial rule). Not applied.**

### 5. Can both gamers and non-gamers enjoy the same experience?
**Structurally yes — with one caveat and one gap.** [ENGINE] The same one action serves both:
"hit the obvious zone" scores 21 (casual, valid, contributing); "find the neglected high-value
combo" scores up to 57 (gamer, mastery). Neither needs a separate mode. **Caveat:** if `k` is set
too high (≥33), the casual contribution is insufficient and the non-gamer feels useless — the
argument for `k=27`. **Gap:** we have **zero** human data; enjoyment is `[HYPOTHESIS]`.

### 6. What is the single strongest design direction?
> **Keep the frozen game exactly as it is, and change ONE constant: replace the `√N` integrity
> target with a linear `k·N` (recommended `k = 27`, option `k = 30`).** Add **no** mechanic.
>
> The forecast fails; sacrifice is dominated; molt-memory and signals are already present; feints
> emerge for free. The individual game already rewards crowd-reading (equilibrium 34.1 > dispersion
> 29.1). The only defect is that the **shared goal** can be met by a trivial rule — and a linear
> coefficient is the smallest change that fixes it while touching nothing else.

### 7. What exact decisions require owner approval?
| ID | Decision | Recommendation |
|---|---|---|
| **M7-1** | Replace `min(1000√N,12000)` with `k·N` | **APPROVE** |
| **M7-2** | Choose `k` | **k=27** default; **k=30** to also defeat the trivial rule |
| **M7-3** | Add a zone forecast (V1–V3) | **REJECT** (closed on evidence) |
| **M7-4** | Add a shared-goal call (V4) | **CONDITIONAL — playtest first** |
| **M7-5** | Add molt-memory/feints/sacrifice/signals | **REJECT** (present or dominated) |
| **M7-6** | Display a live crowd share | **PROPOSE (UI, out of scope)** |
| **C1** | `STATE_MULT` §1.2 | (Mission 06) keep engine, fix spec — **OPEN** |
| **C2** | pierce vs exposed | (Mission 06) keep 1.0, fix design — **OPEN** |

### 8. What must be proven with real human players before further development?
- **Comprehension:** ≥6/8 reach a first meaningful strike in ≤30 s unaided.
- **Crowd-reading:** ≥4/8 deliberately try to predict the crowd by day 3.
- **Molt understanding:** ≥6/8 can explain the day-1→2 change.
- **Return intent:** mean ≥3.5/5 in **both** gamer and non-gamer groups.
- **Non-gamer floor:** no non-gamer scores 0 on comprehension.
- **The `k` choice:** confirm casuals still contribute meaningfully at the chosen `k`.

Until these are met, **the verdict stays CONDITIONAL GO.**

---

## Decision sheet (one line per proposed rule change)

| ID | Change | Evidence | Status |
|---|---|---|---|
| M7-1 | Integrity → `k·N` (linear) | [PROOF] population gate removed; scale-invariant | **recommend APPROVE** |
| M7-2 | `k=27` (or `k=30`) | [ENGINE] herd 21 < 27; dispersion 29.1; k≥30 beats dispersion | **recommend k=27** |
| M7-3 | Zone forecast | [ENGINE] 100% trivial hit; reflexive | **REJECT** |
| M7-4 | Shared-goal call | [HYPOTHESIS] uncertain only if k high | **defer to playtest** |
| M7-5 | Alt mechanics | [ENGINE] present or dominated | **REJECT** |
| M7-6 | Live share display | [HYPOTHESIS] raises value of reading | **PROPOSE (UI)** |
| C1/C2 | spec doc fixes | Mission 06 | **OPEN (unchanged)** |

---

## What this mission did NOT do

- Did **not** change the engine, the UI, the rules, or any spec.
- Did **not** add a forecast to the prototype.
- Did **not** resolve C1, C2 or A5.
- Did **not** commit, push, merge, deploy, or submit.
- Did **not** claim any human validation — **zero humans participated**.

---

## One-paragraph summary for the owner

MOLT is **not** strategically shallow: its individual game already rewards reading the crowd
(a real mixed-strategy equilibrium, +17% over the best trivial rule), and the fear that "blind
spreading wins" was a **mis-reading of the shared pool, not the player score**. The **only**
measured defect is that the shared goal can be met by a trivial spread rule under the proposed
`k=27` — and that is fixed by **raising the coefficient** (linear `k·N`, `k=30` to close the
trivial path), **not** by adding a mechanic. The forecast idea is **rejected on evidence** (it is a
quiz with a printed answer). **Recommendation: approve the linear integrity target, add nothing
else, and run the 8-person playtest before any further development.** Verdict: **CONDITIONAL GO**.
