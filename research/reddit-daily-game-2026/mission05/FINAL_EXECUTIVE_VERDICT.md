# FINAL EXECUTIVE VERDICT — Mission 05 (M2: human playtesting & fun validation)

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Baseline:** commit `410b3ba` ·
**Scope:** M2 only. **No deployment, no submission, no merge, no push, no product change.**

---

## FINAL DECISION — **CONDITIONAL GO** (unchanged)

> Mission 05 was authorised to answer one question: **do real gamers and non-gamers genuinely enjoy
> MOLT?** It **could not answer it.** The executing agent cannot recruit or observe human participants;
> **0 people were recruited and 0 tested.** The mission's own success criterion — *"we have genuine human
> evidence"* — is therefore **NOT met**, and saying otherwise would be the exact failure the mission
> forbids.
>
> The verdict remains **CONDITIONAL GO**, for the same reason as Mission 04, now stated more sharply:
> **the one question that decides everything is still open.** What Mission 05 added is (a) a turnkey
> instrument so a human can answer it, (b) proof that the environment can support a real community molt,
> and (c) two concrete new findings that must be fixed regardless of the playtest outcome.

---

## A. What Mission 05 established

| Item | Result | Evidence |
| --- | --- | --- |
| Baseline re-verified | HEAD `410b3ba`; **47/47** checksums OK (incl. fresh checkout); **42/42** tests reproduce | `REPOSITORY_AND_BASELINE_VERIFICATION.md` |
| Mechanics contradiction | Found **two**, not one (C1 `STATE_MULT`, C2 `pierce`/`exposed`); recommended resolution = keep engine, fix 2 docs | `MECHANICS_CONTRADICTION_ANALYSIS.md` |
| Build freeze | Provisional freeze + SHA-256 of all source files + frozen rules/instructions/thresholds | `PLAYTEST_BUILD_MANIFEST.md` |
| Environment can produce a real molt | 8 distinct strikers → one shared day → real molt | `evidence/environment-molt-test-output.txt` |
| Playtest kit | Turnkey runbook + observation sheet + scorer (self-tested) | `playtest-kit/` |
| **Human playtest** | **NOT RUN — 0 participants** | `PARTICIPANT_RECRUITMENT_REPORT.md` |
| Adversarial analysis (model-level) | Found **A5 (HIGH)**: shared goal unreachable below ~348–500 strikers | `ADVERSARIAL_FINDINGS.md` |

## B. The two things that must be fixed (independent of the playtest)

1. **The specification contradicts itself (C1, C2).** The engine follows a defensible reading, but the
   *documents* disagree. **Approval is requested** (`APPROVED_RULE_RESOLUTION.md`). Recommended: keep
   the engine, correct `GAME_MECHANICS_SPECIFICATION.md` §1.2 and `WINNING_GAME_DESIGN.md` §2.2.
2. **The shared goal is population-gated (A5).** With `INTEGRITY_COEFF = 1000`, the beast cannot be
   SLAIN below ~348 strikers *even if the crowd plays perfectly*, so the SLAIN branch never fires and
   the ESCAPED penalty fires every day for small subreddits. The "war room" the design depends on has no
   win condition at realistic size. **A single-constant correction is proposed but NOT applied** — it
   changes balance and needs approval.

## C. What remains UNANSWERED (the whole point)

- **Is MOLT enjoyable?** — unknown. No human has played it.
- **Do non-gamers find it legible and fun?** — unknown.
- **Does the crowd-read produce a *desire to return*?** — unknown; and A5 may weaken the return loop.
- **Is the social "war room" real, or a design hope?** — unknown; a single-player prototype cannot
  reproduce a real subreddit's banter.

## D. Why CONDITIONAL GO and not GO

GO requires: *"the core mechanic is understandable and enjoyable to both audiences, the acceptance
thresholds are met, and no critical unresolved issue remains."* **None of the three holds:**

- enjoyment is **untested** (thresholds not met — they were never evaluated);
- a **critical unresolved issue remains** (A5: the shared goal is unreachable at realistic size);
- and a **rule decision is pending** (C1/C2).

## E. Why CONDITIONAL GO and not NO-GO

The evidence does **not** show the mechanic is unfun or broken:

- the loop is **not degenerate** (no static dominant play; the crowd factor swings damage 2.6×);
- the obvious play is **not punishing** to newcomers;
- a crowd-reading play **beats** the naive play by ~77 % at model level;
- the environment **can** run a real community molt.

Nothing found so far *disproves* MOLT. The question is simply **not yet answered** — which is exactly
CONDITIONAL GO.

## F. The condition, made concrete (updated)

MOLT moves to unconditional GO **only if all of the following hold**:

1. **Rule decision recorded** in `APPROVED_RULE_RESOLUTION.md` (C1/C2 + the A5 constant).
2. **A5 resolved**: the shared goal is reachable at the intended subreddit size (or the design accepts a
   deliberately-large-subreddit target and says so).
3. **Playtest run** with ≥8 real participants (4 G, 4 N) per `playtest-kit/RUNBOOK.md`, and:
   - P1–P7 all pass (`MOLT_PLAYTEST_PROTOCOL.md` §5);
   - first-strike completion ≥90 %, first strike ≤30 s ≥80 %;
   - rule comprehension ≥80 %, transformation comprehension ≥80 %;
   - **average enjoyment ≥4/5 in EACH group**;
   - **voluntary replay intention ≥70 % in EACH group**.

If any of the non-gamer criteria fail, Mission 03's "immediately demonstrable / broad appeal" pillar is
overstated and the 86/100 score must be revised down. If comprehension criteria fail, the mechanic
itself needs a rethink, not a UI fix.

## G. Stop-and-report conditions (Mission 05 §11)

Mission 05 requires stopping for approval if certain conditions hold. Status:

| Condition | Status |
| --- | --- |
| The mechanics contradiction cannot be resolved from the approved design | **Not triggered** — resolvable by evidence (two normative sources); decision requested. |
| A change to gameplay rules is required | **Triggered (pending)** — C1/C2 and A5 may require gameplay changes; **approval requested, nothing applied.** |
| The prototype has a critical defect | **Not triggered** — prototype is sound (42/42 tests). |
| Participants cannot be recruited | **TRIGGERED** — 0 recruited; reported honestly. |
| The environment cannot support a genuine molt | **Not triggered** — verified working. |
| A paid service is required | **Not triggered.** |
| The test would change the original MOLT vision | **Not triggered** — the proposed A5 fix is a parameter, not a vision change. |

**This mission therefore stops and reports, as instructed.** It does not begin development.

## H. Honest bottom line

Mission 05 did everything an agent legitimately can toward M2: it re-verified the baseline, froze the
build, proved the environment can run a real community molt, built a turnkey playtest kit, and — through
adversarial model analysis — found a **high-severity parameter flaw** (A5) that Mission 03/04 had missed,
plus a **second specification contradiction**. It did **not** answer the one question that matters,
because that requires humans.

**MOLT remains a technically-sound, non-degenerate concept with an unresolved desirability question and
two now-known defects to fix before it is buildable as designed.** That is CONDITIONAL GO — and the
condition is, still, the whole point.
