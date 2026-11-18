# Known Limitations

**Mission 07 · MOLT · Reddit Game of the Day Hackathon 2026**
**Date:** 2026-11-18

Honest list of what this mission did **not** establish, and where its evidence is weakest.

---

## 1. No human data (the largest gap)

- **Zero humans played MOLT in Mission 05 or Mission 07.** Every enjoyment, comprehension,
  legibility and return-intent statement is `[HYPOTHESIS]`.
- The "is it fun?" question — the reason Mission 04's verdict was CONDITIONAL — **remains open**.
- No simulation can answer it. `HUMAN_PLAYTEST_PLAN.md` is a tool, not a result.

---

## 2. Model limitations

- **Genesis-beast focus.** The strategy ceilings (herd 21, dispersion 29.1, equilibrium 34.1)
  are exact **on the all-exposed genesis beast**. Armoured/raw/mutated states shift the *levels*
  (Mission 06: SLAIN thresholds 255–348 across states) but not the *structure* (linear vs `√N`).
  The exact `k` should be re-derived across states before implementation.
- **Bots are more rational than humans.** The equilibrium (iterated best-response) assumes
  perfectly rational, perfectly informed players. Real crowds are noisier and may not converge.
  The *direction* of the findings is robust; the *magnitudes* are optimistic.
- **Crowd-factor banding.** The equilibrium shape depends on the four crowd bands
  (0.7/1.0/1.4/1.9). A different banding could move the fixed point. Not re-optimised here
  (banding is a frozen rule, not under review).
- **Tie-breaking and rounding.** `Math.round` and tool-order tie-breaks are inherited from the
  engine; the analysis is faithful to them (5325/5325 fidelity) but the results are sensitive to
  those conventions at small N.

---

## 3. Forecast mechanic

- The rejection of V1–V3 is **strong** (100% trivial hit rate, 0.00-bit entropy, proven
  reflexivity). Confidence: high.
- The **V4 shared-goal call** is **not** tested with humans; its value is argued, not measured.
  It is `[HYPOTHESIS]` and depends on decisions (k, live-share display) that are open.

---

## 4. Coefficient recommendation

- `k=27` is recommended as the *winnable* default and `k=30` as the *skill-goal* option. The
  choice between them is a **value judgement** (casual accessibility vs closing the trivial path),
  not a pure optimisation. We state the trade-off rather than hiding it.
- "Skilled fraction needed" numbers are from the genesis beast and a specific equilibrium shape;
  they are indicative, not exact for a real subreddit.

---

## 5. Scope and change-control limitations

- This mission **changed nothing**: engine, UI, rules and specs are untouched. No commit, push,
  merge, deploy or submission was made.
- C1, C2 and A5 (Missions 05/06) remain **open** and were **not** silently resolved.
- The **live-share display** (the change most likely to make crowd-reading matter) is a UI change
  and is **out of scope** here — flagged, not designed.

---

## 6. Evidence-category discipline

To avoid conflating categories, every claim in Mission 07 is tagged:

| Tag | Meaning | Where |
|---|---|---|
| `[PROOF]` | exact arithmetic, no simulation | dominance, equilibrium, ceilings |
| `[ENGINE]` | verified against the frozen engine | all damage/molt numbers; 5325/5325 fidelity |
| `[SIM]` | seeded simulation, seed disclosed | tournaments, reflexivity |
| `[HYPOTHESIS]` | design argument, not measured | enjoyment, V4, the demo |
| `[HUMAN]` | human playtest data | **none exist** |

**No `[HYPOTHESIS]` is presented as `[PROOF]`, and no `[SIM]` is presented as `[HUMAN]`.**

---

## 7. Reproducibility caveats

- Scripts require Node ≥ 22 with `--experimental-strip-types`; they import the frozen engine at
  a fixed commit (`410b3ba`). If the engine changes, the numbers change.
- Deterministic scripts use an inline LCG; seeds are in the script source and the outputs.
- `SHA256SUMS.txt` covers the deliverables, scripts and evidence; verify with `sha256sum -c`.
