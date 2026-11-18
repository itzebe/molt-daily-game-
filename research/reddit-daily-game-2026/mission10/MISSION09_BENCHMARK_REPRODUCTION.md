# MISSION 09 BENCHMARK REPRODUCTION

**Mission 10 · MOLT · Date:** 2026-11-18
Evidence: `evidence/benchmark-reproduction-output.txt`, `evidence/cliff-reproduction-output.txt`,
`evidence/individual-premium-output.txt`. Scripts: `analysis/benchmark-reproduction.ts`,
`analysis/cliff-reproduction.ts`, `analysis/individual-premium.ts`.

---

## 1. Method (and the fidelity guarantee)

The reproduction drives the **real, current engine** (`resolveDay`, `molt` from
`mission04/prototype`) and parameterises only the integrity threshold `k`. The state **evolves under
the candidate k** (the candidate-specific methodology), because the §3.7 escape penalty depends on
the outcome, which depends on k.

**Fidelity check:** at `k = 30` this harness's computed outcome/target/totalDamage must equal the
shipped engine's own `resolveDay`. Asserted on **every day of every run**: **PASS**.

Why not reuse `mission09/analysis/lib9.ts`? It imports `INTEGRITY_CAP` (removed) and `INTEGRITY_COEFF`
(now 30) from the engine; the Mission 09 directory is a frozen, checksummed artifact that must not be
mutated, and the approved change intentionally breaks that import. The reproduction therefore uses
fresh, self-contained tooling that mirrors Mission 09's strategies.

## 2. Headline reproduction (engine reading)

Battery: 13 rules (12 beast-ignoring + the engaged `TOP5`), 9 seeds
`{1,2,3,7,42,101,1234,9001,90210}`, N ∈ {25,50,200,1000}, 150 days.

| Constant | max SLAIN % over beast-ignoring rules | engaged `TOP5` SLAIN % | Mission 09 reported |
|---|---|---|---|
| **k = 29** | **50.0 %** | 99.3 % | 50 % / 99.3 % ✅ |
| **k = 30** | **0.7 %** | **98.7 %** | 0.7 % / 98.7 % ✅ |
| **k = 31** | **0.0 %** | **0.0 %** (unwinnable) | 0 % / 0 % ✅ |

**Exact agreement** with Mission 09 on all reported figures.

## 3. Failure cliff (N=200, engaged crowd, 9 seeds, 150 days)

| k | SLAIN |
|---|---|
| 29.8 | 98.7 % |
| 29.9 | 98.7 % |
| **30.0** | **98.7 %** |
| **30.02** | **0.0 %** |
| 30.05 / 30.1 / 30.2 / 30.5 | 0.0 % |

The cliff is **between k = 30.00 and k = 30.02** — exactly as Mission 09 reported.

**Mechanism (day-window per-player damage):**
- k = 30 → d1–3 = 29.13, d4–10 = 32.57, d11–30 = 32.37, d100–150 = 32.35 (overall 32.29)
- k = 30.1 → d1–3 = 29.13, d4–10 = 29.66, … (overall 29.69)

At k = 30 the crowd **tips up** (early escape → armour → a high-damage attractor); at k = 30.1 it
**locks down** (early escape → low-damage attractor). The outcome is set by the **opening days**.

**Determinism:** at k = 30, every seed gives **148/150** (identical). The lock-in is deterministic,
not noise.

**Day-3 lock-in (seed 1):** k = 30 → `ESCAPED, ESCAPED, SLAIN, SLAIN, SLAIN`; k = 30.02 →
`ESCAPED × 5`. Reproduces Mission 09's "day-3 bistable lock-in".

## 4. Individual premium (k-independence)

`analysis/individual-premium.ts`, genesis beast, N=200:
- herd (`crown:cleave`, 99.5 % share) → **21**
- deviator (`crown:pierce`, 0.5 % share) → **57**
- **premium = 171 %** — matches Mission 09 exactly.

`damageFor` has no k term; the deviator scores **57 for k ∈ {27,29,30,31}** (identical). k enters only
the shared comparison `Σ damage ≥ k·N`, so the individual axis is provably k-independent.

## 5. Deviations from Mission 09

| Item | Mission 09 | Mission 10 | Explanation |
|---|---|---|---|
| Battery size | 15 rules | 12 ignoring + 1 engaged | Faithful subset; the reported max-trivial and engaged numbers reproduce exactly |
| Tooling | `lib9.ts` | fresh scripts on the real engine | `lib9` is frozen; its import of a removed constant is expected |
| `randomDaily` at N=1000, k=29 | (part of the 50 %) | 16 %; `zoneMajor15` gives 50 % | Same headline (50 %) via the binding rule; per-rule split differs slightly by RNG stream |

**No deviation changes a headline.** No expected result was hardcoded; the simulation was not tuned
to force agreement.

## 6. Independent reproduction status

**REPRODUCED.** Every Mission 09 headline — k=29→50 %, k=30→0.7 %/98.7 %, k=31→unwinnable, the
30.00–30.02 cliff, day-3 lock-in, deterministic seeds, +171 % premium — was independently regenerated
from the real engine.
