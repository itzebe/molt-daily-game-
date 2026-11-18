# HUMAN PLAYTEST READINESS

**Mission 10 · MOLT · Date:** 2026-11-18
**Status:** PREPARED — NOT STARTED · **Participants: 0 of 8 · No one contacted · Nothing deployed.**

> This document is a **preparedness** statement, not a results report. No participant has been
> recruited, no session has run, and no human feedback exists. Any claim of human validation would be
> fabricated and is explicitly withheld.

---

## 1. The cohort (as required)

- **8 real participants:** **4 gamers + 4 non-gamers.**
- **Identical rules for both groups.** There is **one** ruleset; "gamer" and "non-gamer" are a
  *recruitment label* used only to check that the game is understandable to both — never a separate
  mode or different rules (separate modes are forbidden scope).

## 2. The 10 required measurements

| # | Measure | How it is captured |
|---|---|---|
| 1 | Understands the objective | post-round question + moderator observation |
| 2 | Identifies a meaningful first action | timed "first strike" observation (target: within 30 s) |
| 3 | Understands **why the creature changes** after a molt | can explain the molt in their own words |
| 4 | Understands **community behaviour → creature evolution** | explains how the crowd shaped the beast |
| 5 | Recognises opportunities to **outthink the crowd** | names a contrarian/effective play unprompted |
| 6 | Understands their **individual score** | reads their own damage correctly |
| 7 | Understands the **shared outcome** | reads SLAIN/ESCAPED and the integrity target |
| 8 | Enjoyment | 1–5 rating |
| 9 | Confusion / frustration | open text + moderator flags |
| 10 | Would return tomorrow | yes / no / maybe |

## 3. Materials (prepared)

Consolidated Mission 09 sheets, reused verbatim (they already cover the 10 measures):

| Material | File |
|---|---|
| Protocol (design, counterbalancing, criteria P1–P5) | `../mission09/HUMAN_PLAYTEST_PROTOCOL.md` |
| Recruitment + informed consent | `../mission09/PARTICIPANT_RECRUITMENT_AND_CONSENT.md` |
| Moderator script + observation sheet | `../mission09/MODERATOR_SCRIPT_AND_OBSERVATION_SHEET.md` |
| Analysis template | `../mission09/PLAYTEST_ANALYSIS_TEMPLATE.md` |

**Design summary:** counterbalanced within-subjects, two conditions (A = k = 29, B = k = 30), two
groups of 4 (2 gamers + 2 non-gamers each), order counterbalanced. Each condition = 3 compressed days.
Because only 4 play per session, each real strike is **replicated into a fixed, disclosed synthetic
crowd of N = 200**; the synthetic crowd is labelled as such to participants — never presented as real
players. Only the integrity constant differs between conditions, and this is stated honestly.

## 4. Pre-registered success criteria (decided before any data)

| # | Criterion | Threshold |
|---|---|---|
| P1 | Crowd clears **day 1** | ≥ 6/8 understand the goal **and** day-1 damage ≥ k·N |
| P2 | Crowd clears **a majority of 3 days** | ≥ 2 of 3 |
| P3 | Understands **why the beast molts** | ≥ 6/8 can explain |
| P4 | **Would return** | mean ≥ 4/5 |
| P5 | k = 29 and k = 30 **distinguishable** | chosen design defensible from the data |

**Decision rule:** if P1–P2 fail at k = 30 but pass at k = 29 → recommend **k = 29**; if both fail →
**HOLD** (a recovery-valve rules change is needed, out of this mission's scope).

## 5. Readiness checklist

| Item | State |
|---|---|
| Cohort size and composition fixed (4 + 4) | ✅ prepared |
| Single ruleset, no separate modes | ✅ |
| Protocol, consent, moderator sheet, analysis template | ✅ prepared (Mission 09) |
| Counterbalancing and honest synthetic-crowd disclosure | ✅ specified |
| Success criteria pre-registered | ✅ |
| Build to test | ✅ the Mission 10 build runs (`npm run build`, dev server verified) |
| k = 29 and k = 30 arms both runnable | ✅ parameterised threshold in the analysis scripts |
| **Participants recruited** | ❌ **0 — requires owner authorisation** |
| **Sessions run** | ❌ **0** |
| **Human feedback collected** | ❌ **none** |

## 6. Explicit boundary

Recruitment, public posting, external contact, and disclosure of any private information require the
owner's **separate explicit authorisation** (see mission §8 and §9). Mission 10 prepared the test; it
did **not** run it and does **not** claim any human validation. The CONDITIONAL verdict stands until
real participants complete the test.
