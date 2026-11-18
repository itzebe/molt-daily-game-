# MECHANICS CONTRADICTION ANALYSIS — Mission 05

**Compiled:** 2026-11-18 · **Author:** OpenHands agent · **Purpose:** resolve the contradiction Mission
04 disclosed (`STATE_MULT`), precisely and from primary sources. **Analysis only — no rule or code
change is applied. Approval is requested before anything changes.**

**Method:** every number below is produced by `analysis/mechanics-analysis.ts`, which reads the frozen
prototype's real engine. Its Option-A branch is asserted **equal to the real `damageFor` on 180/180
cases** and its resolver **equal to the real `resolveDay` on 40/40 days** (see the self-check output).
So the "as-built" column is the engine's actual behaviour, not a re-implementation. Raw output:
`evidence/mechanics-analysis-output.txt`. Source quotes: `evidence/spec-quotes.txt`.

---

## 0. Summary

Mission 04 disclosed **one** contradiction. Careful re-reading of the primary sources shows there are
**two independent inconsistencies**, and they point in **opposite directions**:

| # | Contradiction | Documents in conflict | Which side the engine follows |
| --- | --- | --- | --- |
| **C1** | The **state multiplier** `STATE_MULT` (§1.2: armoured ×0.55, raw ×1.70) is absent from the damage formula (§2) and the worked example (§4). | §1.2 **vs** §2 + §4 | §2 + §4 (as-built) |
| **C2** | The **tool matrix** (§1.3: `pierce` is *neutral* vs `exposed`) contradicts the **design doc** (§2.2: `pierce` is *strong* vs `exposed`). | design §2.2 **vs** spec §1.3 + §4 | spec §1.3 + §4 (as-built) |

Mission 04 only caught C1. **C2 was missed**, and it matters: it is the same kind of defect (prose
intent vs tabulated rule) and it affects the demo's headline example.

Crucially, **the two contradictions do not have the same answer**:

- For **C1**, the engine follows §2+§4, which is **also the correct resolution** — see §4.
- For **C2**, the engine follows §1.3+§4, which is **also defensible** — but it means the *design doc*
  is wrong, and the design doc is the "approved design" this mission is told to preserve.

The recommendation is **C1: keep the as-built formula; C2: keep the as-built matrix; correct the two
documents** so the specification stops contradicting itself. **No engine change is recommended.** The
reason is developed in §4 and §5.

---

## 1. The contradictory statements (verbatim)

### C1 — the state multiplier

- **§1.2** tabulates `armoured → 0.55`, `exposed → 1.00`, `raw → 1.70` and labels the column
  **"multiplier on damage"**.
- **§2**, the normative algorithm, computes damage as:
  ```
  dmg(s) = ZONE_VALUE[s.zone]
         * TOOL_MULT[s.tool][state_D[s.zone]]
         * CROWD_FACTOR(share[(s.zone,s.tool)])
  ```
  — `STATE_MULT` does **not** appear.
- **§4** states `crown:cleave` vs `armoured` at 40% share = **34**, i.e. `30 × 1.6 × 0.7`. Applying
  `STATE_MULT[armoured]=0.55` would give `30 × 1.6 × 0.55 × 0.7 = 18.5 → 18`, not 34.

### C2 — the tool matrix

- **Design doc §2.2** tabulates, in prose:

  | Tool | Strong vs | Weak vs |
  | --- | --- | --- |
  | Cleave | Armoured | Raw |
  | **Pierce** | **Exposed** | Armoured |
  | Burn | Raw | Exposed |

  and adds: *"**1.6×** if the tool counters the zone state, **0.6×** if it is the wrong tool, **1.0×**
  otherwise."* Under this reading, `pierce` vs `exposed` = **1.6** (it "counters" exposed).

- **Spec §1.3** tabulates `pierce` vs `exposed` = **1.0** (neutral), `pierce` vs `raw` = **1.6**.
- **Spec §4** uses `pierce` vs `exposed` = **1.0** in its worked example (`28 × 1.0 × 1.9 = 53`).

So the design doc and the spec disagree about which state `pierce` is *strong* against.

---

## 2. The actual mathematical difference

### C1: with vs without `STATE_MULT`

Best-tool base damage (before crowd factor), averaged over the five zones
(`evidence/mechanics-analysis-output.txt`):

| State | Option A (as-built, no `STATE_MULT`) | Option B (with `STATE_MULT`) |
| --- | --- | --- |
| `armoured` | **38.4** | 21.1 |
| `exposed` | 24.0 | 24.0 |
| `raw` | **38.4** | 65.3 |

The narrative meaning the design assigns to each state (§2.1 of the design doc) is:

> `armoured` = "Hard to hurt" · `exposed` = "Normal" · `raw` = "Very soft, high damage".

- **Option B** reproduces that ordering exactly: `armoured (21.1) < exposed (24.0) < raw (65.3)`.
- **Option A** does **not**: `armoured (38.4) == raw (38.4)`. Under the as-built rule, a *state* changes
  only *which tool is best*, never how much damage the best play yields. The words "hard to hurt" and
  "very soft, high damage" describe a magnitude difference that the as-built formula does not implement.

### C2: `pierce` vs `exposed`

- Design §2.2: `pierce` vs `exposed` = 1.6.
- Spec §1.3/§4: `pierce` vs `exposed` = 1.0.

Concretely, the demo's own headline example changes: `gut:pierce` at 2% share is **53** under the spec
(`28 × 1.0 × 1.9`) but would be **85** under the design doc (`28 × 1.6 × 1.9`). The 60-second
storyboard (beat 8–20 s) shows **53**. So the storyboard sides with the spec, not the design doc.

---

## 3. The specification's own tie-breakers

Neither contradiction is resolved by "read the newest document" — both documents are dated
2026-11-18. The resolution must come from internal evidence:

1. **The normative algorithm beats a parameter table.** §2 is titled *"The daily resolution algorithm
   (server-authoritative, deterministic)"*. It is the procedure that actually defines damage. §1.2 is a
   constant table. When a table and the algorithm that consumes it disagree, the algorithm is the
   behaviour; the table is a stale leftover. **This favours Option A for C1.**

2. **A worked example beats prose.** §4 gives concrete arithmetic (`30 × 1.6 × 0.7 = 34`,
   `28 × 1.0 × 1.9 = 53`) and a stated lesson. Worked examples are the last thing written and the
   hardest to fake. **This favours the spec (§1.3/§4) over the design doc for C2, and Option A for C1.**

3. **Majority of internal sources.** For C1, §2 and §4 both omit `STATE_MULT` — two normative sources
   against one table. For C2, §1.3 and §4 agree on `pierce` vs `exposed = 1.0` — two against the
   design doc's one.

4. **Cross-document corroboration.** The demo storyboard (a third document) uses **53** for
   `gut:pierce` and **34** for `crown:cleave` — both match the spec exactly, and neither matches
   Option B or the design doc's `pierce`. So the storyboard independently corroborates the spec.

**Conclusion of the tie-break:** the specification (§1.3 + §2 + §4) is self-consistent and
cross-corroborated; the two outliers are the §1.2 table (C1) and the design doc's §2.2 table (C2).

---

## 4. Why the as-built rule (Option A) is the right resolution for C1

It is tempting to "fix" C1 by applying `STATE_MULT`, because it makes the state names true. Two pieces
of evidence argue against doing so:

**(a) Applying `STATE_MULT` would break the worked example and every downstream artifact.** It changes
`crown:cleave` from 34 to 18, and it would require rewriting §4, the storyboard's numbers, the
prototype tests, and the Mission 04 evidence. The §4 example is the spec's own teaching device.

**(b) More importantly, `STATE_MULT` is largely redundant with `TOOL_MULT`, and applying it produces a
new imbalance.** The `TOOL_MULT` matrix *already* makes a state's best tool do more damage: e.g.
`cleave` vs `armoured` (1.6) beats `cleave` vs `raw` (0.6). So the *contrast between states* is already
carried by the tool matrix. Layering `STATE_MULT` on top compounds it: under Option B a `raw` zone with
its best tool deals **65.3** base, versus **21.1** for `armoured` — a **3.1×** spread driven purely by
the crowd's neglect. That is a very large, swingy reward for "hit the neglected zone", which risks
collapsing the decision into *"always find the raw zone"* rather than the intended *"read both the
beast and the crowd"*.

**A note on Option A's own weakness (stated honestly):** Option A makes `armoured` and `raw` symmetric
in *magnitude* — both 38.4 with the right tool. The difference between them is carried **entirely by
tool choice** (only `cleave` cracks armour; `pierce`/`burn` open raw flesh). This is a legitimate design
— the state tells you *which tool*, the crowd tells you *how much* — but it is **not** what the words
"hard to hurt" / "very soft" promise, and the §1.2 table exists precisely to promise the magnitude
difference. **This is the real, unresolved design question, and it belongs to the design owner, not to
this mission.**

### Non-degeneracy check (does either option break the game?)

120 days, a 50-player naive-chaser crowd, real molt rules (`evidence/mechanics-analysis-output.txt`):

| Reading | distinct best plays / 120 days |
| --- | --- |
| Option A (as-built) | **12** |
| Option B (state-scaled) | **14** |

Both keep the strategic space alive (the best play moves many times). **Neither option is degenerate**,
so the choice between them is a *design-intent* choice, not a *playability* necessity. That is another
reason not to change the engine unilaterally: the evidence does not force it.

---

## 5. Recommended resolution (for approval)

| # | Contradiction | Recommendation | Action |
| --- | --- | --- | --- |
| **C1** | `STATE_MULT` vs §2/§4 | **Keep the as-built formula (Option A).** §2 (the normative algorithm) and §4 (the worked example) are self-consistent and cross-corroborated by the storyboard. | **No engine change.** Correct `GAME_MECHANICS_SPECIFICATION.md` §1.2: either delete the `STATE_MULT` table or relabel it "unused/legacy — see §2". |
| **C2** | design §2.2 vs spec §1.3 | **Keep the as-built matrix (spec §1.3/§4).** Two normative sources plus the storyboard agree; the design doc's prose is the lone outlier. | **No engine change.** Correct `WINNING_GAME_DESIGN.md` §2.2: `Pierce` is strong vs **Raw**, weak vs **Armoured**, neutral vs **Exposed**. |

**Both recommendations are "keep the engine, fix the document."** The engine is not changed. The two
documents are made to agree with the code and with each other.

### If the design owner instead wants `STATE_MULT` honoured (Option B)

That is a legitimate design choice, but it is a **mechanics change**, not a documentation fix, and it
would require:

1. Editing `src/engine/resolve.ts` to multiply by `STATE_MULT` (one line — the code is already
   isolated for exactly this).
2. Updating the §4 worked example (`crown:cleave` → 18) and the storyboard's numbers.
3. Updating `tests/engine.test.ts` lines 119–123 and `tests/adversarial.test.ts` lines 56–57 (the
   hard-coded 53/34/27/17 values).
4. Re-running all 42 tests and regenerating the Mission 04 evidence that quotes those numbers.
5. Re-running the playtest, because balance changed.

Because that is a gameplay-affecting change, **it is not applied here.** It requires explicit approval
(see `APPROVED_RULE_RESOLUTION.md`, which is a placeholder until the user decides).

---

## 6. Impact on Mission 04's results

| Mission 04 result | Still valid under the recommended resolution? |
| --- | --- |
| 42/42 tests pass | **Yes** — the engine is unchanged; the tests encode the as-built formula, which is kept. |
| §4 worked example reproduced exactly (53, 34, 16) | **Yes** — this is the basis of the recommendation. |
| Non-degeneracy (payoff matrix) | **Yes** — and re-confirmed for both options in §4 above. |
| Accessibility / UI checks | **Yes** — unaffected by damage arithmetic. |
| `KNOWN_LIMITATIONS.md` D1 entry | **Partially superseded** — it describes only C1 and calls `STATE_MULT` "dead config", which is correct, but it misses C2 and does not state the design-intent risk. |

**Nothing in Mission 04's evidence needs to be retracted** under the recommended resolution, because the
engine does not change. The correction is to the two design documents.

---

## 7. Unresolved design question (for the design owner, not this mission)

Even after the documentation is fixed, one genuine design question remains and should be decided before
implementation:

> **Should a `raw` zone deal materially more than an `armoured` zone with the *right* tool (Option B,
> a 3.1× spread), or should the state only determine *which tool* is right (Option A, equal magnitude)?**

- Option A is what the engine and the worked example implement; it is less swingy.
- Option B matches the §1.2 table's intent and the words "hard to hurt / very soft".

This analysis does **not** decide it. It records it, with the numbers, for the person who owns the
design. **No playtest should run until this is settled**, because it changes what "good play" means.
