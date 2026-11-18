# DEVELOPMENT AND RELEASE PLAN — **MOLT**

**Compiled:** 2026-11-18 · **Deadline:** 2026-12-08 18:00 PT = **2026-12-09 02:00 UTC** · **~19 days remain.**
**Status:** planning only — no implementation authorised by this document.

---

## 1. Guiding principles

1. **Prove the risky platform assumptions first** (Devvit is the schedule risk, not the game logic).
2. **Freeze scope at day 10.** No new features after that; only polish and demo.
3. **Deterministic, dependency-light, free infrastructure** throughout.
4. **Ship a demo that is honest** — no fabricated numbers, ever.

---

## 2. Milestones (relative days from authorisation; absolute dates assume a start on 2026-11-19)

| Milestone | Days | Date (approx) | Deliverable | Gate |
| --- | --- | --- | --- | --- |
| **M0 — Platform spikes** | 1–2 | Nov 19–20 | Devvit dev subreddit; app installs; splash→expanded transition works; a trivial scheduler task fires; in-memory Redis route test passes; `postData` budget confirmed | **A1–A4, A7** resolved |
| **M1 — Engine + tests** | 2–4 | Nov 20–22 | `engine/rules.ts`, `resolve.ts`, `molt.ts` written and unit-tested (Vitest) with edge cases (N=0, N=1, all-same-zone, ties, escape/slain) | 100% engine tests green |
| **M2 — Read-fun gate (R3)** | 3–5 | Nov 21–23 | A playable strike loop on a dev subreddit with a small real group; tune crowd-factor bands | **R3 resolved or fallback chosen** |
| **M3 — Shared state** | 5–8 | Nov 23–26 | Redis store, transactional strike route, live coarse split, per-day board | Double-strike rejected; two-account shared bar verified |
| **M4 — Molt + scheduler** | 8–10 | Nov 26–28 | Scheduler molt, idempotent resolution, advance-day mod menu, bestiary | Advance-day reproduces the molt from data |
| **M5 — Polish (Visual Craft)** | 10–14 | Nov 28–Dec 2 | Field-plate art direction, molt animation, result card, accessibility pass | **SCOPE FREEZE at day 10** |
| **M6 — Reddit-native layer** | 12–15 | Nov 30–Dec 3 | Daily post, flair grants, comment pre-fill, streaks, Journeys instrumentation | Journeys events observed |
| **M7 — Demo + submission** | 15–18 | Dec 3–6 | 60-second demo video, README, submission text, public subreddit (<200 members) | All W1–W8 verified |
| **M8 — Buffer** | 18–19 | Dec 7–8 | Fixes, final upload, submission before deadline | Submitted with margin |

---

## 3. Workstreams and effort

| Workstream | Owner-type | Effort (person-days) |
| --- | --- | --- |
| Platform spikes (M0) | Devvit/backend | 2 |
| Engine + tests (M1) | Game logic | 2 |
| Read-fun playtest (M2) | Design + dev | 2 |
| Redis/shared state (M3) | Backend | 3 |
| Molt + scheduler (M4) | Backend | 2 |
| Art + polish (M5) | Design/frontend | 4 |
| Reddit-native layer (M6) | Frontend/backend | 2 |
| Demo + submission (M7) | All | 2 |
| **Total** | | **~19 person-days** |

A single competent full-stack developer can deliver this in the window; two people give comfortable
buffer. The estimate assumes **no unfamiliar engine** (a deliberate choice).

---

## 4. Riskiest dependencies and mitigations

| Dependency | Risk | Mitigation |
| --- | --- | --- |
| Devvit app review / domain allow-list | Delay | No external domains needed → trivial; upload early |
| Journeys map approval | Delay | Submit the journey map on day 1 (docs require approval) |
| Scheduler reliability at 00:00 UTC | Missed molt | Idempotent task + advance-day manual control |
| Harness frozen clock | Can't test daily loop | Clock-injection seam + mod-menu advance-day (M0/M4) |
| Playtester availability (R3) | Can't validate fun | Recruit a small dev-subreddit group on day 1; run the gate early |
| Cold start | Sparse beast | Seed day 1 from a scripted prior day; sqrt Integrity scaling |

---

## 5. Scope discipline (what is explicitly OUT)

- No real-time, no websockets, no matchmaking.
- No game engine (no Phaser/Three.js) — SVG plate only.
- No AI/LLM at runtime.
- No currency, payments, purchases, or crypto.
- No user-generated text/images in the loop.
- No cross-subreddit features.
- No season meta-game beyond the bestiary + two leaderboards.
- No mobile-app build; Devvit webview only.

Any request to add to this list after day 10 is deferred post-hackathon.

---

## 6. Verification plan (mapped to the criteria)

| Judging criterion | How we verify before submission |
| --- | --- |
| **Delightful UX** | Manual play on mobile + desktop; first-30-seconds test with fresh users; accessibility pass (contrast, keyboard, reduced motion) |
| **Polish** | Engine unit tests green; route tests green; no console errors; Devvit-Rules compliance review (no crypto/links/AI) |
| **Reddit-y** | Comments/ flair/ streak/ daily post verified on a real subreddit; two-account shared-state test |
| **Daily Content** | Advance-day reproduces a new beast from data; bestiary persists; three consecutive days simulated |

---

## 7. Definition of done (submission-ready)

- [ ] App runs on Reddit in a public subreddit (<200 members), private/unpublished per the rules.
- [ ] One strike per user per day, server-authoritative (W2).
- [ ] Crowd factor demonstrably changes damage (W3).
- [ ] Two accounts share the beast's Integrity (W4).
- [ ] Advance-day molts the beast deterministically from data (W5).
- [ ] Resolution → SLAIN/ESCAPED → persisted bestiary (W6).
- [ ] Streak, trophies, reads, flair persist (W7).
- [ ] Journeys events fire (W8).
- [ ] 60-second demo video recorded and hosted; README written; submission text drafted.
- [ ] Compliance review passed (no crypto/links/AI/payments).

---

## 8. Honest risk statement

The **single greatest risk to the schedule is the Devvit platform loop**, not the game. The single
greatest risk to the *outcome* is **R3 — whether the crowd-read is genuinely fun** — which is why M2 is
an explicit gate before the expensive polish work. If M2 fails and the cooperative fallback also fails,
the honest action is to **stop and reassess**, not to push a novel-but-unfun mechanic to the judges.
