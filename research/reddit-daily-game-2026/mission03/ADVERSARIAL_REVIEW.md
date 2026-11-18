# ADVERSARIAL REVIEW — **MOLT**

**Compiled:** 2026-11-18 · **Purpose:** attempt to *reject* the leading concept. Each attack is answered
with evidence or an honest admission. A concept that cannot survive this must be dropped.

**Verdict of this review:** MOLT survives, with **three material risks** that must be mitigated during
the build (R1 legibility, R2 cold start, R3 "is it really a game?"). None is fatal.

---

## Attack 1 — "Why might judges consider it generic?"

**The attack.** "A boss you hit once a day" could read as a thin tap-to-damage loop — a clicker wearing a
monster costume. If a judge sees only the strike screen, they see one tap and a number.

**Response.** The generic reading is possible **only if we fail to show the molt**. The differentiator is
not the strike; it is that **the beast's body is rebuilt from the crowd's behaviour**, and that the
**optimal play changes every day because the crowd changed it**. The demo (0–32 s) and the daily post
must lead with the beast's *transformation*, not the strike. If a judge understands only one thing, it
must be: *"the community's behaviour becomes tomorrow's adversary."* **Residual risk: Medium.**
Mitigation: make the molt the hero of the post and the demo; never ship a strike-only first impression.

---

## Attack 2 — "What existing game is most similar?"

**The attack.** Left-4-Dead's "Director", adaptive boss AI, and shared-health-bar raid bosses all exist.
Is this a clone?

**Response.** Each similar thing differs in a load-bearing way:
- **L4D Director** adapts within *one* real-time match for *one* team. MOLT adapts across *days* for a
  *whole subreddit*, and the adaptation is *visible on the creature's body* as a permanent record.
- **Adaptive boss AI** (e.g. `r/gameai` discussions) adapts to a *single player's* tactics. MOLT adapts
  to the *crowd's aggregate*, which is a different information problem and a different social dynamic.
- **Shared-health raid bosses** (gacha games) are real-time co-op DPS races. MOLT is asynchronous, one
  decision per player per day, with **no DPS race** and a **contrarian** skill axis.
- **Nothing in the 303-game daily catalogue** is a shared adversary at all (1/303 are multiplayer).

**Residual risk: Low.** It is not a clone; it is a new combination, and the "record on the body" is novel.

---

## Attack 3 — "Why would users stop playing after two days?"

**The attack.** One tap a day is a thin habit. After novelty fades, why return?

**Response.** Three retention engines, each grounded in evidence:
1. **The beast changes because of them** — the curiosity to see the consequence (delayed-consequence
   investment, `nichegamer.com`).
2. **The streak** — loss aversion (`gamerorbis.com`).
3. **The crowd factor creates a genuine, daily, solvable puzzle**: *where will the crowd be wrong today?*
   That question is different every day because the crowd's habits change, and it rewards a skill the
   player can improve (reading crowds) — a mastery loop.

The honest counter: a *single* tap is thin **if the player never engages with the crowd**. The design
therefore makes the crowd reading **the core loop**, and the comment thread the second loop. Players who
just tap will churn; players who play the *read* will not — the same way Wordle retained people who
played the *guess* and lost people who just wanted a crossword.

**Residual risk: Medium.** Mitigation: instrument day-2 and day-7 return in the demo town; add a
"streak insurance" read (show what you'd have scored had you struck differently) to deepen the loop.

---

## Attack 4 — "Could competitors reproduce the mechanic in a weekend?"

**The attack.** Shared health bar + daily reset = a weekend clone.

**Response.** The *visible* surface (a beast, a bar) is trivially copyable. The **defensible** parts are
not:
- the **telemetry→shape model** (classify the crowd's aggregate, derive armour/raw/fatigue/ridges/
  mutation deterministically);
- the **crowd-factor scoring** that makes contrarian reads the skill;
- the **legible visual language** that renders behaviour as anatomy;
- the **permanent record** (bestiary + accumulated scars).

Copying the surface without the model produces a clicker, not MOLT. Copying the model requires the same
design work we are doing now. **Residual risk: Low–Medium.** Mitigation: make the molt rules the
*visible* heart of the app, so the depth is on display and hard to fake.

---

## Attack 5 — "Does the game genuinely need Reddit?"

**The attack.** If it is async and deterministic, could it live anywhere?

**Response.** Yes, the *engine* could live anywhere — but the *game* needs Reddit specifically:
- the **crowd is the subreddit**; the game's content is a function of that community's behaviour;
- **comments are the war room** — the strategy conversation is load-bearing, not decorative;
- **flair and streaks** are Reddit-native identity/progression;
- the **daily post** is the native re-engagement surface.
Strip Reddit and you lose the crowd, the discussion, and the identity — i.e. the game. This directly
satisfies the "Reddit-y" criterion as the organisers define it ("human-first, embracing community,
meritocracy… use of all the things subreddits have to offer"). **Residual risk: Low.**

---

## Attack 6 — "Is the daily loop meaningful or artificially imposed?"

**The attack.** Many "daily" games just put a wall clock on content that could be continuous.

**Response.** MOLT's daily boundary is **load-bearing**, not cosmetic: the molt is *defined* by a
completed day of aggregate behaviour. You cannot molt mid-day, because "what the crowd did today" is not
known until the day ends. The 24-hour boundary is what makes the crowd's behaviour *legible as a unit*
and what creates the shared consequence. Remove the boundary and the mechanic dissolves. **Residual
risk: Low.**

---

## Attack 7 — "Is the demo exciting enough?"

**The attack.** A one-tap game may not film well.

**Response.** The demo's excitement comes from the **transformation** (0–32 s) and the **collective
stakes** (42–52 s), not from twitch gameplay. The storyboard leads with the beast's scars, shows the
molt, and ends on the accumulated record — three strong visual beats. It is as filmable as BridgeDit
(which won) and more filmable than a word grid. **Residual risk: Medium.** Mitigation: invest in the
plate's craft and the molt animation; these are the filmable assets.

---

## Attack 8 — "Can we finish a polished implementation before the deadline?"

**The attack.** ~19 days; the Devvit loop is slow; scope creep is fatal.

**Response.** The scope is deliberately small: **one decision per day, no real-time, no engine, no AI,
no external services, no user content.** The hard part (the rules) is pure functions that are fast to
write and test. The real schedule risk is the **Devvit platform loop**, not the game code — so the plan
front-loads platform spikes (see `DEVELOPMENT_AND_RELEASE_PLAN.md`). **Residual risk: Medium.**
Mitigation: day-1 platform spikes; a hard scope freeze at day 10; a fallback to a text-simple plate if
the SVG/animation work overruns.

---

## Attack 9 — "Is the crowd-factor mechanic actually fun, or just novel?"

**The attack.** Scoring that rewards contrarianism could feel arbitrary or punishing.

**Response.** This is the single most important risk and it is **empirical, not arguable**. The crowd
factor is calibrated so that:
- the **herd play is still decent** (0.7×, not a trap) — no one is punished for playing normally;
- the **good read is clearly better** (1.4×–1.9×) — skill is rewarded;
- the **effect is legible** (a READ badge and a percentage), so players learn the skill.
The danger is the opposite failure: if the bands are mis-set, either everyone piles onto one combo (boring)
or randomness dominates (unfair). **Residual risk: High until playtested.** Mitigation: this is the
**first thing to prototype and playtest**; the bands are constants tuned in one module. If playtesting
shows the read is not fun, we tune the bands — or, if it cannot be made fun, we fall back to a
*cooperative* framing (the crowd must *spread* damage, rewarding coordination rather than contrarianism),
which uses the same engine.

---

## Attack 10 — "Will it read as AI slop or as 'about Reddit'?"

**The attack.** The organisers penalise AI slop and on-the-nose Reddit theming.

**Response.**
- **No AI in the product**: the beast is a deterministic function of aggregate data; there is no LLM, no
  generated art at runtime, no chatbot. The art direction is a specific, hand-authored naturalist plate
  — the opposite of generic AI output.
- **Not about Reddit**: the creature is a fictional beast; there is no Snoo, karma, or subreddit-as-topic.
  "Reddit-y" is satisfied the way the organisers define it — community, meritocracy, discussion — not by
  theming. **Residual risk: Low.**

---

## Summary of residual risks

| # | Risk | Severity | Mitigation | Owner decision point |
| --- | --- | --- | --- | --- |
| R1 | Reads as a generic tap/boss game | Medium | Lead every surface with the molt/record | Design (immediate) |
| R2 | Cold start with few players | Medium | Seed day 1 from a scripted prior; sqrt Integrity scaling | Build (day 1–3) |
| R3 | Crowd-factor not fun | **High** | Prototype + playtest first; tune bands; cooperative fallback | **Gate before full build** |
| R4 | Devvit platform loop slow | Medium | Day-1 platform spikes; scope freeze at day 10 | Plan (day 1) |
| R5 | Demo not filmable | Medium | Invest in plate craft + molt animation | Design (mid-build) |

**Conclusion:** MOLT survives adversarial review. The one **high** risk (R3, is the read fun?) is
explicitly a **build-gate**: it must be prototyped and playtested *before* committing to the full
implementation. This is the honest condition attached to the recommendation.
