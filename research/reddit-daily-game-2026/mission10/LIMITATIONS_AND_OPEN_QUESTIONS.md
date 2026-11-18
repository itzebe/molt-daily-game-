# LIMITATIONS AND OPEN QUESTIONS

**Mission 10 · MOLT · Date:** 2026-11-18

---

## 1. Material limitations

1. **No human validation.** 0 of 8 participants; nothing recruited, contacted, or deployed. The
   k = 30 choice is model-backed only. The playtest (prepared, not run) is the gating evidence.
2. **Thin integrity margin.** k = 30 clears the best beast-ignoring rule by ~0.9 per player, and the
   failure cliff is between **30.00 and 30.02**. The choice is balanced but sits close to the edge.
3. **Turnout sensitivity.** A sub-majority-engaged crowd may not clear the goal at k = 30. The model
   assumes a substantial engaged share; real turnout is unknown.
4. **Modelled horizon is 150 days.** Long-run (season+) drift is not characterised.
5. **Benchmark tooling is reconstructed, not byte-identical to Mission 09's `lib9`.** It reproduces
   every reported headline exactly, but is not the same code (Mission 09's library is frozen and
   intentionally no longer imports the changed engine).
6. **Accessibility audit is a proxy.** `audit-a11y.mjs` measures contrast/targets/focus via CDP; it is
   not a screen-reader pass. It checks the WCAG 2.2 AA **minimum** target size (≥24px); the design
   *goal* is 44px — the harness does not assert 44px.
7. **The prototype is a local stand-in for Devvit.** It runs the same Hono app the Devvit deployment
   would mount, but the Devvit Web runtime, Redis persistence, and real Reddit identity were **not**
   exercised (no Devvit deployment exists yet).
8. **Documentation drift fixed, not exhaustive.** Only the spec/design files that stated the
   resolved rules were corrected; historical mission reports (04–09) retain their original text as
   point-in-time records and were deliberately not rewritten — with **one** exception: a live claim
   in `mission04/MISSION04_PROTOTYPE_REPORT.md` §3.1 ("Integrity scales with √N") was corrected to the
   linear formula and tagged *(Updated in Mission 10)*.
9. **Mission 04 checksum manifest.** `mission04/evidence/SHA256SUMS.txt` lists per-file hashes
   computed at Mission 04. Five entries no longer match: the 4 files the authorised change necessarily
   modifies (`resolve.ts`, `rules.ts`, `engine.test.ts`, `adversarial.test.ts`) plus the one report
   line above. The manifest was **left unmodified** as the historical record — Mission 10's own
   `mission10/SHA256SUMS.txt` is the authoritative manifest for the current tree. (Mission 09's
   manifest, by contrast, still verifies 40/40: the change touched none of its files.)

## 2. Open questions

| # | Question | Why it matters | How to close |
|---|---|---|---|
| Q1 | Can a real 8-person crowd clear day 1 at k = 30? | The cliff margin is 0.02 | the prepared playtest |
| Q2 | Is the engaged share high enough in a real subreddit? | Turnout sensitivity | playtest + (later) a live beta |
| Q3 | Does the k = 30 lock-in feel *exciting* or *unfair*? | Bistability can read as punishing | playtest (measures 8–10) |
| Q4 | Does the Devvit deployment preserve the engine semantics? | The prototype is a stand-in | a Devvit build spike (future mission) |
| Q5 | Do the corrected docs match the intended design in the owner's head? | C1/C2 were owner decisions | owner sign-off |

## 3. What is NOT a limitation (verified)

- The formula is exactly `30 × N` at runtime (13/13) and in the live API (integrity 180 for 6 strikers).
- No residual sqrt/cap integrity path.
- All preserved mechanics are byte-identical (2923/2923 differential).
- Rollback is proven to restore the exact original.
- Tests 44/44, typecheck clean, build clean, UI 11/11, a11y 13/13.
