# GAME MECHANICS SPECIFICATION — **MOLT**

**Compiled:** 2026-11-18 · **Purpose:** a precise, implementation-ready specification of every rule,
number, and data shape in MOLT. **No implementation is authorised by this document.**

---

## 1. Entities and constants

### 1.1 Zones (fixed, 5)

| id | name | base value | default tendency |
| --- | --- | --- | --- |
| `crown` | Crown | 30 | crowd-favoured |
| `hide` | Hide | 22 | safe middle |
| `gut` | Gut | 28 | swingy |
| `claw` | Claw | 24 | punishing |
| `tail` | Tail | 16 | neglected (contrarian) |

### 1.2 Zone states (3)

| id | effect on damage | visual | accessibility cue |
| --- | --- | --- | --- |
| `armoured` | applies through `TOOL_MULT` (§1.3) | cross-hatched plates | hatch pattern + slate tint |
| `exposed` | neutral (all tools 1.0) | plain ink outline | none |
| `raw` | applies through `TOOL_MULT` (§1.3) | open wound | vermilion fill + shape |

> **There is no separate `STATE_MULT`.** A zone's state changes damage **only** by changing which tool
> counters it (the `TOOL_MULT[tool][state]` matrix in §1.3). Damage is
> `ZONE_VALUE × TOOL_MULT[tool][state] × CROWD_FACTOR` — see the normative algorithm in §2 and the
> worked example in §4. An earlier draft of this section listed per-state multipliers
> (`armoured` 0.55, `raw` 1.70); that was a **double-count** of the state, because the state's effect
> is already encoded in `TOOL_MULT`, and it is **rejected**. It is not applied by the engine and must
> not be applied.

### 1.3 Tools (3)

Effectiveness matrix `TOOL_MULT[tool][state]`:

| tool | armoured | exposed | raw |
| --- | --- | --- | --- |
| `cleave` | **1.6** | 1.0 | 0.6 |
| `pierce` | 0.6 | 1.0 | **1.6** |
| `burn` | 1.0 | 0.6 | **1.6** |

> Note: two tools are strong vs `raw`; the `burn` tool is strong vs `raw` but weak vs `exposed`, and
> `pierce` is strong vs `raw` and weak vs `armoured`. `cleave` is the only tool strong vs `armoured`.
> This guarantees every state has at least one counter and the crowd can specialise — which is exactly
> what the molting rules then punish.

### 1.4 Crowd factor (the skill axis)

| share of players choosing your exact `(zone,tool)` | factor |
| --- | --- |
| ≥ 0.30 | 0.7 |
| 0.10 – 0.30 | 1.0 |
| 0.03 – 0.10 | 1.4 |
| < 0.03 | 1.9 |

### 1.5 Beast Integrity (the shared pool)

```
Integrity(day) = 30 * N_distinct_strikers
```

`N_distinct_strikers` = number of unique users who submitted at least one strike that day (Reddit user
ids, counted server-side). The target scales **linearly** with the crowd: each striker must contribute
about **30 damage on average** to slay the beast. A linear target keeps a small subreddit viable and
stops a large one trivialising the day, and it is the constant validated in Mission 09.

> **History.** This was previously `min(1000 * sqrt(N), 12000)`. Mission 09 showed the sqrt form made
> the shared goal cosmetic at scale (at N = 1000 even a lazy herd cleared it 100 %), and that a linear
> `k·N` is the correct shape. The constant **k = 30** is the unique integer that defeats every
> beast-ignoring strategy at every population size tested while remaining winnable by an engaged crowd
> (≈98.7 %). See `research/reddit-daily-game-2026/mission09/` and `mission10/` for the evidence.

**Slain** if `total_damage ≥ Integrity`; else **Escaped**.

---

## 2. The daily resolution algorithm (server-authoritative, deterministic)

Inputs: for day `D`, the set of `(userId, zone, tool)` submissions.

```
1. N  = count(distinct userId)
2. share[(zone,tool)] = count(zone,tool) / N
3. zoneShare[zone]     = count(zone, any tool) / N
4. toolShare[tool]     = count(any zone, tool) / N
5. for each submission s:
      dmg(s) = ZONE_VALUE[s.zone]
             * TOOL_MULT[s.tool][state_D[s.zone]]
             * CROWD_FACTOR(share[(s.zone,s.tool)])
      if s.tool == "the most-used tool of day D-1":   # tool fatigue, see 3.3
          dmg(s) *= 0.8
      dmg(s) = round(dmg(s))
6. total_damage = sum(dmg(s))
7. outcome = "SLAIN" if total_damage >= Integrity else "ESCAPED"
```

Every submission's damage is computed **on the server** from the locked submission; the client only
ever displays it. The client never sends a damage number.

---

## 3. Molting rules — deriving day `D+1` from day `D`

Applied at **00:00 UTC** by a scheduled server task. All rules are deterministic functions of day `D`
aggregates, so the result is reproducible and auditable.

### 3.1 Over-use → armour
Any zone with `zoneShare[zone] ≥ 0.35` becomes **`armoured`** on day `D+1`.

### 3.2 Neglect → raw
Any zone with `zoneShare[zone] ≤ 0.05` becomes **`raw`** on day `D+1`.

### 3.3 Tool fatigue
Let `topTool(D)` = the most-used tool on day `D`. On day `D+1`, any strike using `topTool(D)` takes a
**×0.8** penalty. (Represented as a per-day field `fatiguedTool`, not a per-zone state.)

### 3.4 Scarring (permanent, cosmetic + light penalty)
A zone gains a **ridge** if it took `≥ 25%` of all strikes on any of the last three days. A ridged zone
that is hit again takes **×0.9**. Ridges persist for the season and are drawn permanently.

### 3.5 Mutation (rare reward for coordination)
If the standard deviation of `zoneShare` across the five zones is `< 0.06` (an unusually *even* crowd),
the beast **mutates**: a sixth zone, `maw`, is added for one day only, with value 34 and state `raw`.

### 3.6 Default fill
Any zone not set by 3.1/3.2/3.5 is `exposed`, unless it carried a ridge-only state (ridges do not change
state, only add the ×0.9 on re-hit).

### 3.7 Escape penalty
If day `D` was **ESCAPED**, the beast on `D+1` starts with **one additional** zone forced `armoured`
(the *least*-hit zone), representing the beast hardening after surviving.

### 3.8 Slain reward
If day `D` was **SLAIN**: no escape penalty; the subreddit unlocks a cosmetic skin for `D+1` and
`Slayer` flair is granted to that day's strikers.

---

## 4. Worked example (makes the numbers concrete)

Day D submissions (N = 100):

| zone | strikes | zoneShare | → state on D+1 |
| --- | --- | --- | --- |
| crown | 42 | 0.42 | **armoured** (≥0.35) |
| hide | 21 | 0.21 | exposed |
| gut | 17 | 0.17 | exposed |
| claw | 12 | 0.12 | exposed |
| tail | 8 | 0.08 | exposed |

`topTool(D) = burn` → on `D+1`, `burn` takes ×0.8.

Now a player on `D+1` faces an armoured Crown, a normal middle, and an **un-hit** Tail. A **contrarian
read** — e.g. `pierce` on `gut` (exposed) chosen by only 2% — scores:

```
dmg = 28 (gut) × 1.0 (pierce vs exposed) × 1.9 (<3% crowd) = 53
```

versus the herd's `cleave` on the armoured Crown at 40% share:

```
dmg = 30 (crown) × 1.6 (cleave vs armoured) × 0.7 (≥30% crowd) = 34   [× 0.8 if cleave were yesterday's top tool]
```

**The lesson is legible in one day:** *the obvious play is not the best play.*

---

## 5. Data model (Devvit Redis)

| Key | Type | Contents |
| --- | --- | --- |
| `day:{D}:state` | string (JSON) | zone states, fatiguedTool, ridges, mutated zone |
| `day:{D}:subs` | hash | `userId → "{zone}:{tool}"` (one entry per user) |
| `day:{D}:counts` | hash | running counters per `(zone,tool)` and per zone |
| `day:{D}:integrity` | string | the day's Integrity target |
| `user:{userId}:streak` | string | last-strike day + current streak length |
| `user:{userId}:trophies` | number | beasts helped slay |
| `user:{userId}:reads` | number | count of sub-3% effective strikes |
| `bestiary` | hash | `D → {outcome, total_damage, kill_count}` |
| `day:{D}:board` | sorted set | per-user damage leaderboard for the day |
| `season:board` | sorted set | season-long reads leaderboard |

**Atomicity:** submissions are written with a Redis transaction; the `(zone,tool)` counters are
incremented in the same transaction as the user's lock key, so the split is always consistent.

**Per-subreddit silo:** Devvit Redis is name-spaced per installation (verified in the docs), which is
exactly right — each subreddit gets its own beast and its own bestiary. No cross-subreddit data is
required, so the "no shared service" limitation is not a constraint.

---

## 6. State machine (per day)

```
  [MOLTING 00:00 UTC]  --derive state from D-1-->  [OPEN]
   [OPEN]  --players submit one (zone,tool) each-->  [OPEN] (until 23:59:59 UTC)
   [OPEN]  --scheduler fires at 00:00 UTC-->  [RESOLVING]  --compute damage/outcome-->
   [RESOLVED]  --publish daily post + bestiary entry-->  [MOLTING] ...
```

**Late submissions** after the cut are rejected server-side (the lock key includes the day id).

---

## 7. Anti-abuse and integrity rules

| Risk | Control |
| --- | --- |
| Client fabricates damage | Damage computed only on the server from locked submissions |
| Multiple strikes per user | `strike:{userId}:{day}` lock, written transactionally |
| Alt-account farming | Integrity uses *distinct* users with a linear scale (30 × N); the per-user strike lock means one account = one strike; Trophy/flair thresholds are per-day participation |
| Timing sniping (waiting to see the split) | The live split is shown only as a **delayed, coarse** band (e.g. "Crown: crowded") that updates on a fixed cadence, not per-second, and the exact percentages are revealed only at resolution |
| Harassment in comments | Standard Reddit moderation; the game itself contains no user text/images |
| Rule tampering | All rules live server-side; the client renders state it is given |

---

## 8. Accessibility and inclusivity

- Zone state is encoded by **pattern + shape + colour** (never colour alone).
- Contrast: ink `#1A1714` on bone `#F3EDE1` ≈ **15:1**; slate `#5B6670` on bone ≈ **5.4:1**;
  vermilion `#D9401F` used for large text and non-text indicators (≈ 4.9:1).
- Full keyboard operation (zones and tools are focusable buttons; Enter to strike).
- `prefers-reduced-motion` respected: the strike resolves without animation if requested.
- Copy is plain and short; the game is playable with no tutorial and no reading beyond one sentence.

---

## 9. Balance levers (for tuning during the build, not for the demo)

| Lever | Effect |
| --- | --- |
| Over-use threshold (0.35) | Higher → armour appears less; the herd is less punished |
| Neglect threshold (0.05) | Higher → more Raw zones; more contrarian opportunity |
| Crowd-factor bands | Higher contrarian reward → more discussion, more variance |
| Integrity coefficient (1000) | Higher → fewer Slains; more Escape penalties |
| Fatigue penalty (0.8) | Higher → tool variety is rewarded more strongly |

These are exposed as constants in one module so tuning is a one-line change and the engine stays
deterministic and testable.
