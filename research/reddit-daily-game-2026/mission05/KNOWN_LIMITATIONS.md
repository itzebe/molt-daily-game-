# KNOWN LIMITATIONS — Mission 05

**Compiled:** 2026-11-18 · **Author:** OpenHands agent

Honest, complete list of what this mission did **not** establish, and what is known to be weak. Nothing
here is hidden in the report's prose.

---

## 1. The mission's central question is UNANSWERED

| # | Limitation | Why it matters | How to resolve |
| --- | --- | --- | --- |
| **L1** | **No human has played MOLT. Fun/enjoyment is untested.** | This was the whole point of Mission 05. The agent cannot recruit or observe humans. | A human runs `playtest-kit/RUNBOOK.md` with 8 real participants. |
| L2 | **No gamer vs non-gamer comparison exists.** | The two-population claim (non-gamer-legible *and* deep for strategists) is unverified. | Same playtest, both groups. |
| L3 | **No retention evidence.** | "Would return tomorrow" is untested; stated intention would not equal actual retention anyway. | Real cohort over multiple days. |

**Consequence:** the Mission 05 success criterion — *"we have genuine human evidence about whether MOLT
is enjoyable for gamers and non-gamers"* — is **not met**. It could not be met by an agent.

## 2. Findings that ARE established (model-level, not human)

| # | Finding | Confidence | Evidence |
| --- | --- | --- | --- |
| F1 | The shared goal (SLAIN) is **unreachable below ~348–500 strikers**, even in the best coordinated case. | High (optimiser upper bound) | `evidence/integrity-bestcase-*.txt`, `evidence/integrity-probe-output.txt` |
| F2 | The specification contains **two** contradictions, not one (Mission 04 found one). | High | `MECHANICS_CONTRADICTION_ANALYSIS.md` |
| F3 | The core mechanic is **not degenerate**: no static dominant play; the crowd factor swings damage 2.6×. | High (real engine) | `evidence/adversarial-probes-output.txt` |
| F4 | The environment **can** produce a genuine 8-participant community molt. | High (verified live) | `evidence/environment-molt-test-output.txt` |

## 3. Limitations of the model-level findings themselves

| # | Limitation | Note |
| --- | --- | --- |
| M1 | F1's realistic crossover assumes simple crowd models (uniform / 80-20 herd). | The **best-case** crossover (~348) is an upper bound and holds regardless of model; the realistic crossover (~450–500) is model-dependent. |
| M2 | All model runs use the genesis (all-exposed) or one hardened beast, not a long molt history. | A scarred beast with `raw` zones can deal more per striker; the threshold may be somewhat lower on a long-lived beast. Not quantified beyond `evidence/hardened-crossover-check.txt`. |
| M3 | The balance/adversarial simulations use naive bot archetypes. | Real humans may play very differently. This is why F1 is framed as an *upper bound*, not a prediction. |
| M4 | Bot-vs-bot results say nothing about enjoyment. | Stated throughout; never conflated with human evidence. |

## 4. Carried over from Mission 04 (still open)

| # | Limitation | Status |
| --- | --- | --- |
| U2 | No real concurrent load; in-memory store. | Unchanged |
| U3 | No Devvit runtime parity (plain Node). | Unchanged |
| U5 | Mobile verification is emulated, not on-device. | Unchanged |
| D1 | Spec `STATE_MULT` contradiction. | **Superseded** by `MECHANICS_CONTRADICTION_ANALYSIS.md` (now two contradictions, C1/C2), and awaiting approval. |

## 5. Honesty boundary (unchanged, restated)

- The only data-bearing sheet in this mission
  (`playtest-kit/SELF_TEST_synthetic_NON_DATA.csv`) is a **scorer tool test**, labelled "not real" in
  every row, and excluded from all counts. It is not a playtest result.
- No participant identities, scores, quotes, or behaviours were invented.
- No seeded/fixture crowd behaviour is presented as real community behaviour.
- The Mission 04 CDP UI checks are **engineering** checks and are **not** human-playtest evidence.

## 6. What would make this mission complete

1. The user records decisions in `APPROVED_RULE_RESOLUTION.md`.
2. A human runs the playtest per `playtest-kit/RUNBOOK.md`.
3. The filled sheet + scorer output are returned.
4. `PLAYTEST_RESULTS.md`, `GAMER_VS_NON_GAMER_ANALYSIS.md`, and `QUALITATIVE_FEEDBACK.md` are then
   written with **real** data.
