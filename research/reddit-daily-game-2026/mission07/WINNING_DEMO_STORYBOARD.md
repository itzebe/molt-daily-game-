# Winning Demo Storyboard (60 seconds)

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18 · Target: the **MOLT-K** recommendation (linear `Integrity = k·N`).

**Honesty constraints (binding):** no fabricated player counts, no invented leaderboard
positions, no fake transactions, no mocked backend presented as live. Every number shown must
come from the running engine. Where a human element is needed (e.g. "the community"), it is
shown as the **agent's own simulated crowd, labelled as a simulation**, not as real players.

---

## 0. What must be REAL for the demo to be verifiable

| Element | Status | Note |
|---|---|---|
| The strike picker (5 zones × 3 tools) | **real** | frozen prototype client |
| The damage + crowd-factor calculation | **real** | frozen engine, 42/42 tests |
| The multi-striker aggregation (the "community") | **real, simulated** | N local profiles; **labelled "simulated crowd"** |
| The molt (silhouette change + log) | **real** | frozen `molt()` |
| The shared goal (SLAIN/ESCAPE) vs Integrity | **real** | with the **proposed** `k` shown as a labelled proposal |
| A "correct read" vs a "poor read" | **real** | two actual strike choices, actual damage |
| Leaderboard position | **real** | computed from the actual strikes in the demo |

The demo **must** run against the frozen engine. The only labelled-proposal element is the
`k·N` integrity target (a one-line change), shown as "proposed".

---

## 1. The 60-second storyboard

### 0–10s · The hook — the creature is already in trouble
- Screen: the beast silhouette, **crown armoured, tail raw**, a red **INTEGRITY bar** nearly full.
- Caption: *"One beast. One subreddit. It molts every night."*
- The bar reads **Integrity 27,000** (proposed `k=27`, N=1000) vs **damage so far 0**.
- **Hook line:** "Yesterday it escaped. Today 1,000 people get one strike each. Will it die?"

### 10–20s · The central mechanic — one strike, and the crowd matters
- The player picks **tail + pierce** (a neglected, raw zone).
- On commit, the engine shows the **live aggregate** of the *simulated* crowd:
  *"612 of 1,000 strikes are on crown"* (the obvious zone).
- Caption: *"Hit where everyone else is, and the crowd factor cuts your damage. Hit where they
  aren't, and it multiplies."*
- Damage pop: **tail+pierce = 57** (read band ×1.9) vs the crown-striker's **21** (herd band ×0.7).

### 20–35s · The distinctive feature — reading the crowd is the skill
- Side-by-side: **Player A (blind spread)** picks a random combo → **29 damage**.
  **Player B (reader)** picks the neglected raw tail → **57 damage**.
- Caption: *"Same beast. Same day. One player read the crowd; one didn't. 57 vs 29."*
- (These are two real engine computations from the demo's own crowd — not invented.)

### 35–45s · The Reddit-native component — the shared goal
- The community damage total ticks up: **24,300 / 27,000**.
- Caption: *"The beast only dies if the whole subreddit, together, clears the bar."*
- Show the **proposed** `k·N` target labelled *"proposed formula (research)"*.
- Caption: *"Last night it was 300 short. The subreddit is talking about it right now."*
- (The discussion claim is **aspirational framing**, not a fabricated screenshot. The demo shows
  only the in-engine total vs the target.)

### 45–55s · Daily progression — the consequence becomes the creature
- The molt fires: **tail → armoured** (it was over-hit), **crown → exposed** (neglected).
- The silhouette visibly changes; the molt log reads:
  *"tail hit 58% → armoured · crown neglected 4% → exposed."*
- Caption: *"Tomorrow the beast remembers. The zone you avoided today is the weakness you can
  exploit tomorrow."*
- A "day 2" panel: the same reader now targets the **newly exposed crown** for a big hit.

### 55–60s · The payoff — the community's fingerprints on the beast
- Final shot: the beast's silhouette as a **record of the subreddit's behaviour**.
- Caption: *"Nobody drew this creature. The community did — one strike at a time."*
- One-line close: **"MOLT. The monster you make together."**

---

## 2. Why this demonstrates the recommendation

The storyboard's decisive beat is **20–35s**: **57 vs 29** for reader vs spreader, computed by the
engine. That is the exact finding of `T6_INDEPENDENT_REPRODUCTION.md` (§3.3) made visible. The
35–45s beat shows the **shared goal** that the `k·N` recommendation fixes. Together they show
both halves of the thesis:

1. **Reading the crowd is rewarded** (individual axis — already true).
2. **The shared goal is a skill goal** (shared axis — the fix).

---

## 3. What would falsify the demo

- If a human playtest shows players cannot tell the reader from the spreader (comprehension
  failure), the demo's core beat is not legible → revisit.
- If the chosen `k` makes the shared goal trivially winnable, the 35–45s beat is dishonest →
  raise `k`.
- If the molt change is not visible, the 45–55s beat fails → strengthen the silhouette diff.

---

## 4. Build requirements (for a future, authorised implementation — NOT this mission)

- Reuse the frozen prototype client and engine unchanged.
- Expose the live aggregate (a crowd-reading signal) — **a UI addition, currently unspecified**.
- Parameterise `integrityFor(n)` to `k·n` behind a single constant (the proposal).
- Label any simulated crowd clearly in the demo UI.

**No implementation is authorised by this mission.** This storyboard is a plan, not a build order.
