# Recommended Rules for Approval

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Status: NOT APPLIED. Every item below requires explicit design-owner approval.**
**Date:** 2026-11-18

This is the decision sheet. Each proposed change states its evidence, its trade-off, and its
recommendation. **Nothing here has been implemented.** C1, C2 and A5 (Missions 05/06) remain
**open** and are **not** silently resolved.

---

## 1. Decision summary

| ID | Proposed change | Recommendation | Status |
|---|---|---|---|
| **M7-1** | Replace `Integrity = min(1000√N, 12000)` with `Integrity = k·N` | **APPROVE (k=27)**; see M7-2 | OPEN |
| **M7-2** | Choose `k` | **k=27** default; `k=30` if the owner wants the shared goal to defeat the trivial spread rule | OPEN |
| **M7-3** | Add a zone forecast bonus (V1–V3) | **REJECT** | CLOSED (evidence) |
| **M7-4** | Add a shared-goal call (V4) | **CONDITIONAL — defer to playtest** | OPEN |
| **M7-5** | Add molt-memory / feints / sacrifice / signals as mechanics | **REJECT** (already present or dominated) | CLOSED (evidence) |
| **M7-6** | Display a live crowd share in the client | **PROPOSE (out of scope)** — needs UI decision | OPEN |
| **C1** | `STATE_MULT` §1.2 vs §2/§4 | (Mission 06) keep engine, fix spec §1.2 | OPEN (unchanged) |
| **C2** | pierce vs exposed | (Mission 06) keep 1.0, fix design §2.2 | OPEN (unchanged) |
| **A5** | population gate | superseded by M7-1 | OPEN (unchanged) |

---

## 2. M7-1 / M7-2 — The integrity formula

**Proposal.** `Integrity(N) = k · N`, no cap. Default **k = 27**; acceptable range 25–30;
**k = 30** if the owner wants the shared goal to also defeat the trivial dispersion rule.

**Evidence [PROOF]/[ENGINE]:**
- `√N` target ⇒ a hard population gate (small subs cannot win even with perfect play) and an
  auto-win for large subs (herd clears the cap). `population-scaling.ts` (a)/(b).
- Linear target ⇒ per-player requirement constant = k ⇒ scale-invariant; herd (21) never wins
  for k ≥ 22; small subs win iff skilled. `population-scaling.ts` (a)/(b)/(c).
- Measured ceilings (genesis): herd 21.0 · blind dispersion 29.1 · equilibrium 34.1.
  `t6-reproduction.ts`.
- Required skilled fraction is ~constant in N (scale-invariance verified:
  30%-skilled mix 25.9→27.1/player from N=50 to N=10000).

**Trade-off:**
- **k = 27:** shared goal winnable for engaged casuals; **does not** defeat the trivial spread
  rule by itself (dispersion 29.1 > 27).
- **k = 30:** shared goal becomes a genuine **skill** goal (dispersion 29.1 < 30); raises the
  casual bar (needs ~80–90% engagement).

**Recommendation.** **Approve M7-1.** For M7-2, recommend **k=27** as the safe default and
**k=30** as the option that fully resolves T6; the choice is a deliberate owner trade-off.

**Does NOT change:** the beast, the molt rules, the crowd-factor bands, the tool/zone tables,
or the one-strike-per-day structure.

---

## 3. M7-3 — Zone forecast (V1–V3): REJECT

**Evidence [ENGINE]:** the "correct" herd/molt zone is the obvious zone **100%** of the time when
the crowd is predictable (entropy 0.00 bits); a constant rule captures any such bonus; a
coordinated bloc flips the answer. `prediction-experiments.ts`, `forecast-reflexivity.ts`.

**Reason to reject:** trivial or random; adds a second decision for no strategic space; violates
the one-strike identity. **Closed.**

---

## 4. M7-4 — Shared-goal call (V4): CONDITIONAL

**Proposal.** Attach to the same single strike a hidden call on whether the beast will be SLAIN
today, in three bands. Scores the individual only; does not touch the beast.

**Condition for viability:** the shared goal must be **genuinely uncertain**, which requires
M7-2 at the **upper** end (k=30) and a visible turnout/share signal (M7-6).

**Evidence:** [HYPOTHESIS]. The zone-call failure is proven; the outcome-call's value is argued,
not measured. **Defer to a human playtest.** Not recommended for implementation now.

---

## 5. M7-5 — Alternative mechanics: REJECT

| Mechanic | Reason |
|---|---|
| Molt-memory as a *forecast* | 100% predictable → trivial (`alternative-mechanics.ts` M1). Keep as **presentation** (already present). |
| Feints | emerges from existing rules; no button needed (`M2`). **Protect**, don't build. |
| Sacrifice | loses 1155 vs greedy over two days (`M3`). Dominated. |
| Signals | already present (molt log) (`M4`). No change. |

---

## 6. M7-6 — Live crowd-share display: PROPOSE (out of scope)

The single change that most increases the **value of reading the crowd** without adding a
mechanic is showing the live aggregate. It is a **UI change** and therefore **out of scope** for
this research mission. Flagged for a future, separately-authorised design task.

---

## 7. What remains frozen and untouched

- The engine (`mission04/prototype/src/engine/*`) — **unchanged**.
- The prototype UI — **unchanged**.
- C1 / C2 / A5 — **open**, not resolved here.
- No commit, push, merge, deploy, or submission.

---

## 8. Owner decision form

| ID | APPROVE | REJECT | MORE EVIDENCE |
|---|---|---|---|
| M7-1 (linear integrity) | ☐ | ☐ | ☐ |
| M7-2 (k=27 vs k=30) | ☐ | ☐ | ☐ |
| M7-4 (shared-goal call) | ☐ | ☐ | ☐ |
| M7-6 (live share display) | ☐ | ☐ | ☐ |
| C1 (keep engine, fix spec §1.2) | ☐ | ☐ | ☐ |
| C2 (keep 1.0, fix design §2.2) | ☐ | ☐ | ☐ |
