# Mission 07 — Analysis Scripts

**Research only.** Nothing here modifies the engine, the UI, or any spec. Every script imports the
**frozen** engine at `mission04/prototype/src/engine/*` **read-only**.

Run with Node ≥ 22:

```bash
cd research/reddit-daily-game-2026/mission07
node --experimental-strip-types analysis/<script>.ts
```

All scripts print a report to stdout. Raw outputs are saved in `../evidence/*-output.txt`.

## Evidence categories

| Tag | Meaning |
|---|---|
| `[PROOF]` | exact arithmetic; no randomness |
| `[ENGINE]` | verified against the frozen engine's own functions |
| `[SIM]` | seeded simulation (seed disclosed in source) |

## Scripts

| Script | Category | Purpose | Output |
|---|---|---|---|
| `lib7.ts` | — | shared library: combos, `dmg` (delegates to engine), DP optima, LCG, strategies | — |
| `fidelity7.ts` | [ENGINE] | proves `lib7` reproduces the engine exactly | `fidelity7-output.txt` |
| `t6-reproduction.ts` | [PROOF]/[ENGINE] | reproduces T6; adds the individual axis + Nash test | `t6-reproduction-output.txt` |
| `predictability-sweep.ts` | [PROOF] | probe vs crowd: when is prediction rewarded? | `predictability-sweep-output.txt` |
| `tournament.ts` | [SIM]/[ENGINE] | mixed-population multi-day tournament | `tournament-output.txt` |
| `depth-tournament.ts` | [PROOF]/[SIM] | level-k reasoning + iterated best-response equilibrium | `depth-tournament-output.txt` |
| `prediction-experiments.ts` | [SIM]/[ENGINE] | V0–V3 forecast designs, scored | `prediction-experiments-output.txt` |
| `forecast-reflexivity.ts` | [SIM]/[PROOF] | reflexivity + predictability spectrum | `forecast-reflexivity-output.txt` |
| `shared-goal-alignment.ts` | [SIM]/[PROOF] | can the target reward skill over dispersion? | `shared-goal-alignment-output.txt` |
| `alternative-mechanics.ts` | [ENGINE] | molt-memory, feints, sacrifice, signals | `alternative-mechanics-output.txt` |
| `population-scaling.ts` | [SIM]/[PROOF] | `√N` vs linear across N; coefficient choice | `population-scaling-output.txt` |

## Determinism

- `[PROOF]` scripts are fully deterministic (no seed needed).
- `[SIM]` scripts use an inline LCG; the seed is a literal in the source and appears in the output.
- Re-running any script reproduces its output byte-for-byte.

## Integrity

`../SHA256SUMS.txt` covers the deliverables, these scripts, and the evidence. Verify:

```bash
cd research/reddit-daily-game-2026/mission07 && sha256sum -c SHA256SUMS.txt
```
