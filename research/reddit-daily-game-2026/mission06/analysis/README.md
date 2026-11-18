# Mission 06 analysis — reproduction guide

All Mission 06 evidence is regenerated from the scripts here. Each script imports the **frozen** engine
(`../../mission04/prototype/src/engine/`) read-only via relative paths; nothing in `mission04/` is modified.

## Requirements

- Node.js (tested on v24.22.2) with `--experimental-strip-types` (no build step).
- Run from this `analysis/` directory.

## Commands (each writes a reproducible stdout; captured outputs are in `../evidence/`)

```bash
node --experimental-strip-types fidelity-check.ts          # model == engine (3520/3520)
node --experimental-strip-types a5-derivation.ts           # A5 threshold (N=348) + population table
node --experimental-strip-types scale-invariance.ts        # damage/striker ~ const; ratio D/I vs N
node --experimental-strip-types population-matrix.ts       # per-N matrix, current vs linear
node --experimental-strip-types coefficient-sensitivity.ts # candidate matrices + p_min
node --experimental-strip-types coefficient-window.ts      # small-N handicap + k window
node --experimental-strip-types strategy-ceilings.ts       # exact per-strategy ceilings
node --experimental-strip-types dp-allocation.ts           # DP-optimal allocation + decentralised ceilings
node --experimental-strip-types smart-vs-blind.ts          # aggregate smart vs blind (T6)
node --experimental-strip-types mixed-state-ceilings.ts    # aggregate ceilings on mixed states
node --experimental-strip-types recommended-coefficient.ts # derivation + hardened-beast check
node --experimental-strip-types state-thresholds.ts        # threshold across beast states
node --experimental-strip-types c1-c2-combined.ts          # C1/C2 numerics + combined interaction
node --experimental-strip-types equilibrium-sim.ts         # multi-day degeneracy sim (real engine)
node --experimental-strip-types static-robustness.ts       # static vs adaptive (real molt rules)
node --experimental-strip-types mixed-crowd-tension.ts     # SLAIN rate vs de-herd fraction p
node --experimental-strip-types final-comparison.ts        # candidate thr_best/thr_lazy table
node --experimental-strip-types adversarial.ts             # T1–T6 adversarial attacks
```

## Design of the analysis

- **`lib.ts`** — shared library: the combo set, per-state base damage, an **exact dynamic-programming
  optimum** (`bestTotal`, not a hill-climber), and deterministic crowd models (LCG seeds disclosed).
- **Fidelity** — `fidelity-check.ts` proves `lib.ts` reproduces the engine's `damageFor` and `resolveDay`
  exactly, so the derivation is grounded in the real code.
- **Determinism** — every stochastic run uses a fixed LCG seed printed in the script; trial counts are
  stated. The exact computations (DP, aggregate) use no randomness.

## Honesty

- These are **model-level** results. They are **not** human evidence and are never presented as such.
- No participant data exists in this mission (no humans were involved).
- `bestTotal` is an **upper bound** on any real crowd; the realistic numbers are model-dependent and
  labelled as such.
