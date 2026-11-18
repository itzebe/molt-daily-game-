# Mission 05 evidence index

Raw artifacts backing every claim in the Mission 05 deliverables. All are reproducible by re-running the
scripts in `../analysis/` or the commands noted. This is **analysis evidence**, not human-playtest
evidence (there is none — no playtest was run).

| File | What it shows | Produced by |
| --- | --- | --- |
| `mechanics-analysis-output.txt` | The C1/C2 contradiction analysis: §4 example under both readings; state-meaning test; the fidelity self-checks (180/180 `damageFor`, 40/40 `resolveDay`). | `analysis/mechanics-analysis.ts` |
| `spec-quotes.txt` | Verbatim spec/design quotes for §1.2, §1.3, §2, §4 and design §2.1/§2.2/§2.4 (the contradiction sources). | `sed` extracts of `mission03/*.md` |
| `environment-molt-test-output.txt` | Proof the environment supports a genuine community molt: 8 distinct strikers → shared day → real molt + Bestiary entry; duplicate strike refused (409). | `analysis/molt-env-test.sh` (server on :8787) |
| `adversarial-probes-output.txt` | Model-level attacks A1–A4, A6: no static dominant play; obvious play decent; crowd factor 2.6×; low-turnout integrity scaling. | `analysis/adversarial-probes.ts` |
| `integrity-probe-output.txt` | A5: SLAIN rate vs N under uniform and herd crowd models (crossover ≈450–500). | `analysis/integrity-probe.ts` |
| `integrity-bestcase-output.txt` | A5: **best-case** coordinated total vs Integrity (N=10…1000); unreachable below ~348. | `analysis/integrity-bestcase.ts` |
| `integrity-bestcase-crossover.txt` | A5: fine sweep pinning the best-case crossover to ~348–350 strikers. | `analysis/integrity-bestcase.ts` (edited N list) |
| `hardened-crossover-check.txt` | A5 robustness: damage vs N on a hardened beast (2 armoured, 1 raw) — threshold persists. | inline check (see `ADVERSARIAL_FINDINGS.md`) |
| `scorer-selftest-output.txt` | Proof the playtest scorer runs (on the clearly-labelled synthetic sheet). **Not a result.** | `playtest-kit/score-playtest.mjs` |
| `screenshots/{desktop,tablet,mobile}.png` | The frozen build rendered after a genuine 8-participant molt, at 1440/834/390 px. | `analysis/capture-screenshots.mjs` |
| `screenshot-palette-analysis.txt` | Objective palette measurement of those screenshots (design direction intact). | inline `python3` analysis |

## Honesty notes

- The two "integrity" outputs and the adversarial outputs are **simulations**, not human data.
- `scorer-selftest-output.txt` uses `playtest-kit/SELF_TEST_synthetic_NON_DATA.csv`, whose every row is
  labelled "SELF-TEST ROW (not real)". It is a tool test only and is excluded from all counts.
- No file here contains participant data, because no participant data exists.
