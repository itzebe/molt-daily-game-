# PARTICIPANT RECRUITMENT REPORT — Mission 05

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

---

## Result: 0 participants recruited. 0 tested.

| Group | Target | Recruited | Tested |
| --- | --- | --- | --- |
| **N — non-gamers** | 4 | **0** | **0** |
| **G — gamers** | 4 | **0** | **0** |
| **Total** | **8** | **0** | **0** |

## Why

The mission requires **real human participants**. The executing agent is a software agent operating in a
container. It cannot:

- recruit or contact people,
- obtain informed consent,
- observe a human playing in real time,
- conduct an interview or capture a verbatim quote.

The Mission 05 rules are explicit and were followed:

- *"Do not invent participant identities."* — none invented.
- *"Generate fake feedback."* — none generated.
- *"Use simulated agents as human participants."* — none used.
- *"Count the implementation agent as a participant."* — not counted.
- *"Pretend that automated browser tests represent human enjoyment."* — not pretended. The Mission 04
  CDP UI checks are **engineering** checks; they are **not** human-playtest evidence and are not counted
  as such here.
- *"Claim that eight participants establish statistical market validation."* — not claimed.

The mission also states: *"If recruitment cannot be completed, report the actual number recruited and
tested. Leave M2 inconclusive. Do not mark the playtest complete merely because the protocol exists."*
This report does exactly that: **the actual number is zero; M2 is inconclusive.**

## What was done instead (within the authorised scope)

Mission 05 authorises *"M2 human playtesting preparation"*. Preparation was completed and made turnkey
so that a human can run the test with minimal effort and get a scored, honest result:

- **`playtest-kit/RUNBOOK.md`** — step-by-step facilitator instructions, including exactly how to give
  eight people eight distinct, genuine identities and how to produce a **real** community molt.
- **`playtest-kit/OBSERVATION_SHEET.csv`** — the recording sheet, one row per participant.
- **`playtest-kit/score-playtest.mjs`** — a scorer that turns the sheet into the P1–P7 verdicts and the
  per-group enjoyment/replay metrics, with raw counts and no statistical over-claim.
- **`../MOLT_PLAYTEST_PROTOCOL.md`** (from Mission 04) — the frozen instrument.

The scorer was **self-tested** on a clearly-labelled synthetic sheet
(`playtest-kit/SELF_TEST_synthetic_NON_DATA.csv`, output in `evidence/scorer-selftest-output.txt`) to
prove the tool runs. **Those rows are not data and are labelled "not real" in every row**; they are a
tool test, never a result.

## Environment capability (verified, so the human is not blocked)

The single biggest technical risk to a real playtest — *can the prototype produce a genuine
community-driven molt, or only a fixture?* — was **retired**:

> Eight distinct user ids struck one shared day; the day aggregated to `n = 8`; a duplicate strike was
> refused (HTTP 409); advancing the day produced a **real** molt derived from the eight submissions
> (Crown armoured by over-use, Hide armoured by the escape penalty, `cleave` fatigued), and the Bestiary
> recorded the real result.
>
> Evidence: `evidence/environment-molt-test-output.txt`.

So the Mission 05 STOP condition *"the testing environment cannot support a genuine community-driven
molt"* is **not** triggered. A human facilitator is unblocked on the technical side; the only missing
ingredient is the humans themselves.

## What would unblock this

1. The user (or another human) recruits 8 people per `playtest-kit/RUNBOOK.md`.
2. The rule decision is settled first (`MECHANICS_CONTRADICTION_ANALYSIS.md` §5).
3. The facilitator runs the session and returns the filled sheet + scorer output.

## Honesty statement

No participant data appears anywhere in this mission's deliverables, because none exists. Every
document that would normally contain results (`PLAYTEST_RESULTS.md`,
`GAMER_VS_NON_GAMER_ANALYSIS.md`, `QUALITATIVE_FEEDBACK.md`) states plainly that the test was **not
run**. Nothing has been fabricated to fill those documents.
