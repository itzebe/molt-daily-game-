# MOLT PLAYTEST RUNBOOK (turnkey, for a human facilitator)

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Purpose:** everything a human needs to run
Mission 05's M2 playtest without the agent, and to produce a scored, honest result.

> **This runbook is a tool, not a result.** No playtest has been run. The agent cannot recruit or
> observe human participants (see `../PARTICIPANT_RECRUITMENT_REPORT.md`). A human must execute this.

---

## 0. Prerequisites

1. **The rule decision must be settled first.** Per Mission 05 §3, do not run the playtest until the
   user has approved a resolution of the mechanics contradiction (`../MECHANICS_CONTRADICTION_ANALYSIS.md`
   §5). If the recommended resolution is approved (keep the engine, fix the documents), the frozen
   build in `../PLAYTEST_BUILD_MANIFEST.md` is the tested build. If Option B is chosen, regenerate the
   manifest first.
2. **Verify the build is the frozen build.** From `mission04/prototype/`:
   `sha256sum src/engine/*.ts src/server/*.ts src/client/*.tsx` and compare to
   `../PLAYTEST_BUILD_MANIFEST.md` §2. If any hash differs, stop.
3. **Recruit 8 real people**: 4 who rarely/never play games (group **N**), 4 who play regularly
   (group **G**). They must not have worked on MOLT. Get **informed consent** to record observations.
   Collect **no** personal data beyond a first name or code.

## 1. Start the app

```bash
cd research/reddit-daily-game-2026/mission04/prototype
npm install
node --experimental-strip-types src/server/dev-server.ts    # API on :8787  (leave running)
npx vite --port 5173                                        # client on :5173 (leave running)
```

Confirm `http://localhost:5173` loads the beast.

## 2. How to give each participant a genuine, distinct identity

The client stores its identity in `localStorage`, so **each separate browser profile is a distinct
striker**. Choose ONE of these:

- **Separate devices** (simplest): each participant opens `http://<host>:5173` on their own phone or
  laptop on the same network. Each device = one striker. This is the most faithful to a real subreddit.
- **Separate browser profiles on one machine**: create a profile per participant
  (`chrome --user-data-dir=/tmp/molt-p01`, etc.) and open `:5173` in each. Each profile = one striker.
- **A shared device, one at a time**: use a fresh **incognito window per participant** (closing it
  clears `localStorage`). Participants strike in sequence on the same day.

**All participants must strike the SAME day** for the molt to be community-driven. Do not advance the
day until everyone has struck.

## 3. Run the session (per participant)

Say **only** this first: *"This is a daily game. You have one strike a day. Try it."*

Then run the five scripted tasks from `../MOLT_PLAYTEST_PROTOCOL.md` §3, **without coaching**:

| # | Prompt (verbatim) | Record |
| --- | --- | --- |
| T1 | *"Play your first strike. Say out loud what you are doing and why."* | seconds to first strike; could they name ≥3 zones; did they know a tool was needed |
| T2 | *"Why did you get that number? What would you do differently tomorrow?"* | crowd-factor comprehension; a day-2 plan |
| T3 | *"What changed, and why?"* (advance the day first) | crowd→molt comprehension |
| T4 | *"Play the next two days. Play to win."* | strategy change; do they read the beast first |
| T5 | *"Would you come back tomorrow to play again? Why or why not? What was the best and worst part?"* | replay intention; enjoyment (1–5); verbatim quote |

**The molt must be real.** To advance the day, either click the "advance day (test)" link in the UI, or
call `POST http://localhost:8787/api/advance`. The new beast is derived from **the participants' actual
combined strikes** — verified working (`../evidence/environment-molt-test-output.txt`). **Never** present
seeded/fixture behaviour as real community behaviour; if you use the seed script for a demo, say so.

**Enjoyment scale** (ask identically of both groups): `1` did not enjoy · `2` slightly · `3` neutral ·
`4` enjoyed · `5` enjoyed a lot.

## 4. Record results

Open `OBSERVATION_SHEET.csv` and fill one row per participant. Use `P01–P08`; put `N` or `G` in
`group`. Leave a cell **blank** if uncollected — the scorer treats blanks as missing, never as a pass.

## 5. Score

```bash
node playtest-kit/score-playtest.mjs playtest-kit/OBSERVATION_SHEET.csv
```

This prints P1–P7 (pass/fail), enjoyment per group, replay intention per group, and the secondary
signals — with raw counts beside every percentage. It makes **no** statistical claim (n = 4/group).

## 6. Interpretation (do not bend the thresholds after seeing results)

- **All P1–P7 pass, enjoyment ≥4/5 both groups, replay ≥70% both groups** → the concept's desirability
  assumption is supported on this small sample → the verdict can move toward GO (still not proof of
  market demand).
- **P1/P2/P7 fail for group N** → MOLT is not non-gamer-legible; the "immediately demonstrable" pillar
  is overstated; the concept must be simplified or re-scored.
- **P3/P5 fail** → the core mechanic is not legible; this is a mechanic-level problem, not a UI fix.
- **P6 or enjoyment fail** → the loop is not desirable even if comprehensible; retention case is
  unsupported.

## 7. What to hand back

- the filled `OBSERVATION_SHEET.csv`,
- the scorer output,
- the verbatim quotes (anonymised),
- any bug list,
- the participant count actually run and the group split.

A truthful "we ran 5 participants, here is what failed" is a valid and useful result. Do not inflate it.
