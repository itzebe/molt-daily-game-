# EXECUTIVE VERDICT — Mission 04: MOLT prototype & validation

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Scope:** build a playable prototype and
verify it mechanically. **No deployment, no submission, no change to any existing product repository.**

---

## FINAL DECISION — **CONDITIONAL GO (unchanged, now better evidenced)**

> Mission 03 left exactly one high-severity assumption open: **is MOLT genuinely enjoyable, for both
> experienced gamers and non-gamers?** Mission 04 set out to settle it. It **did not** — because
> settling it requires real human players, which this mission could not provide.
>
> What Mission 04 **did** establish, with reproducible evidence, is everything *around* that question:
> MOLT is technically feasible, faithfully implements its specification, runs end-to-end, is
> deterministic and robust, is **not strategically degenerate**, and meets WCAG 2.2 AA on the checks
> run. The fun question is now **instrumented** — a ready-to-run playtest protocol exists — but it
> remains **unanswered**.
>
> Therefore the verdict is **CONDITIONAL GO**, not an unconditional GO. The condition is now precise:
> **run `MOLT_PLAYTEST_PROTOCOL.md` with ≥8 real participants and clear its thresholds.**

---

## A. What Mission 04 delivered

| Milestone | Status | Evidence |
| --- | --- | --- |
| M0 — platform feasibility | **DONE** | React/TS/SVG + Hono architecture builds and runs; `evidence/build-output.txt` |
| M1 — playable prototype | **DONE** | Full daily loop works in a real browser; `evidence/ui-verification-output.txt` |
| Automated rules tests | **DONE** | 15/15, reproducing the spec §4 worked example exactly; `evidence/spec-example-reproduction.txt` |
| Adversarial tests | **DONE** | 14/14; `evidence/test-output.txt` |
| Balance / non-degeneracy | **DONE** | 7/7 incl. payoff matrix; `evidence/balance-payoff-matrix.txt` |
| Accessibility & responsive | **DONE** | 13/13 WCAG AA at 390/834/1440 px; `evidence/a11y-audit-output.txt` |
| **M2 — real-player playtest** | **NOT DONE** | requires real humans; protocol prepared, not run |

**Totals:** 42/42 automated tests pass, typecheck clean, build clean, 11/11 browser UI checks, 13/13
accessibility checks.

---

## B. What is now proven (vs Mission 03, where it was argued)

| Claim | Mission 03 status | Mission 04 status |
| --- | --- | --- |
| The rules are implementable and unambiguous | argued | **proven** — engine reproduces the spec's worked example exactly (53, 34) |
| The loop runs end-to-end | argued | **proven** — real browser, full strike→molt→bestiary cycle |
| The game is deterministic | claimed | **proven** — 1000/1000 identical, and identical histories give identical outcomes |
| The game resists obvious abuse | argued | **proven** for the tested attacks (coordination, alt-accounts, crowding, low turnout) |
| The strategic space is non-degenerate | asserted | **proven** — payoff matrix: no static dominant strategy; the crowd-mirror is the worst position in every column |
| The UI is accessible & responsive | planned | **proven** — WCAG 2.2 AA checks pass at three widths; 5/5 zones keyboard-operable |

---

## C. What is still NOT proven — stated plainly

| # | Unproven | Severity | Consequence |
| --- | --- | --- | --- |
| U1 | **Fun / enjoyment for real humans** | **HIGH** | The whole concept rests on it; a non-degenerate loop is not a fun loop |
| U2 | Devvit runtime parity | medium | The prototype is plain Node; Redis/scheduler semantics untested |
| U3 | Real concurrent load | medium | In-memory, single-process; atomicity under traffic unproven |
| U4 | Multi-day retention with a real cohort | medium | Retention argued from design, not measured |
| D1 | Spec `STATE_MULT` contradiction | low (prototype) | Design owner must decide §1.2 vs §2/§4 before implementation |

Full list: `KNOWN_LIMITATIONS.md`.

---

## D. The one thing that matters, and why it is not resolved

Mission 03's verdict hinged on a single line: *"whether the core crowd-read mechanic is genuinely fun
... must be settled by a prototype playtest."* Mission 04 built the prototype but could not run the
playtest.

The honest position is therefore: **the highest-value question is exactly the one still open.** It
would be easy — and wrong — to present a working, well-tested, accessible prototype as if it answered
that question. It does not. A polished prototype is evidence of *engineering*, not evidence of *fun*.

The balance simulation is a genuine partial result: it shows the loop will not collapse into a
solvable or static puzzle. That is necessary but far from sufficient.

---

## E. The condition, made concrete

MOLT moves from CONDITIONAL to unconditional GO **only if** `MOLT_PLAYTEST_PROTOCOL.md` is run with
≥8 real participants (4 gamers, 4 non-gamers) and **all** of these hold:

- **P1/P2/P7** — non-gamers complete a first strike unaided, can name ≥3 zones in 30 s, median time to
  first strike ≤ 60 s (≥3 of 4 each);
- **P3** — ≥5 of 8 explain the crowd factor unaided;
- **P4** — ≥5 of 8 form a day-2 plan;
- **P5** — ≥4 of 8 connect crowd behaviour to the molt;
- **P6** — ≥5 of 8 would return tomorrow.

If any of P1/P2/P7 fail for the non-gamer group, the concept's "immediately demonstrable / broad
appeal" pillar is overstated and Mission 03's 86/100 score must be revisited downward. If P3/P5 fail,
the mechanic itself is not legible and the concept needs a mechanic-level rethink, not a UI fix.

---

## F. Risks to this verdict

- **This verdict is an engineering verdict.** It says the *build* is sound and the *design is not
  disproven*. It does not say the *game is good*. Those are different claims.
- **The prototype may have flattered the design.** A single-player prototype with a seeded crowd
  cannot reproduce the social texture of a real subreddit (the banter, the "war room" the concept
  depends on). Real play may be better *or* worse.
- **Devvit risk is deferred, not retired.** The highest *technical* risk (does the platform behave as
  assumed?) was not touched; it was only made cheaper to test later.

---

## G. Recommendation

1. **Do not treat this prototype as authorisation to build MOLT for submission.** This mission
   authorised research and prototyping only.
2. **Run the playtest protocol next** — it is the cheapest, highest-information step remaining, and it
   gates everything else.
3. **In parallel (cheap, low-risk), retire the Devvit risk** with a minimal Redis + scheduler spike, so
   that if the playtest passes, implementation is not blocked on platform uncertainty.
4. **Resolve the `STATE_MULT` spec contradiction** with the design owner before implementation, since it
   materially changes balance.

**Bottom line:** MOLT is a **technically de-risked concept with an unresolved desirability question.**
That is a genuine advance on Mission 03 — but it is a CONDITIONAL GO, and the condition is the whole
point.
