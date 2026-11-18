# INDEPENDENT VERIFICATION REPORT

**Mission 10 · MOLT · Date:** 2026-11-18
Evidence: `evidence/independent-verification-output.txt`, `evidence/ui-verification-output.txt`,
`evidence/a11y-audit-output.txt`, `evidence/server-integrity-path.txt`, `evidence/rollback-verification.txt`.

This verification does **not** rely on the implementation agent's tests. It imports the changed engine
and a pristine baseline engine (separate git worktree) side by side and tests the shipped behaviour.

---

## 1. The runtime formula is exactly 30 × N

`analysis/independent-verification.ts` calls the changed `integrityFor` at
`n ∈ {0,1,2,3,7,10,37,100,999,1000,5000,100000,1000000}` and asserts `=== 30·n`. **13/13 pass.**
The baseline engine returns the old capped-sqrt values (e.g. `12000` at `n=1000`), confirming the
change is live and the two engines genuinely differ.

## 2. N retains its original definition

`integrityFor` still takes the same argument, and `resolveDay` still passes `agg.n` — the count of
**distinct submissions** (one strike per user). No change to how N is computed. The `resolveDay`
differential shows `rc.n === rb.n` for all 300 random crowds.

## 3. The formula is used in the real execution path

- `resolveDay` (engine) → used by `store.advance` → `POST /api/advance`.
- `app.ts:61` → `GET /api/state` returns `integrity`.
- **Live:** after 6 distinct strikes, `GET /api/state` returned `integrity = 180` (= 30×6).
- **UI:** the strike result card rendered "shared integrity 30".

## 4. No residual square-root integrity calculation

`grep -n 'sqrt\|INTEGRITY_CAP' src/` → the only `Math.sqrt` is `molt.ts:44`
(`Math.sqrt(variance)`, the §3.5 mutation — unrelated, preserved). No `INTEGRITY_CAP` remains.

## 5. Preserved mechanics unchanged

2923-check differential (see `ENGINE_BEHAVIOUR_PRESERVATION.md`): **PASS 2923 / FAIL 0.** The only
divergence between baseline and changed engines is the SLAIN/ESCAPED boundary (4/300 days), each
proven to lie between the two thresholds.

## 6. Documentation agrees with the engine

The corrected §1.2/§1.5/§7 (spec) and §2.2 (design) now describe exactly what `resolve.ts` computes.
The C1/C2 regression tests pin the §4 worked-example numbers the docs quote (34, 53, 91).

## 7. The old implementation can be restored

`evidence/rollback-verification.txt`: restoring the baseline files reproduced the original hashes and
`integrityFor(1000)=12000`; restoring Mission 10 returned `integrityFor(1000)=30000`. Working tree
left correct; `npm test` re-run **44/44**.

## 8. Full check battery

| Check | Tool | Result |
|---|---|---|
| Unit/integration tests | `vitest run` | 44/44 pass |
| Type check | `tsc --noEmit` | exit 0 |
| Production build | `vite build` | clean |
| Independent engine differential | `analysis/independent-verification.ts` | 2923/2923 |
| Independent browser UI checks | `scripts/verify-ui.mjs` (CDP, real Chromium) | **11/11 pass** |
| Accessibility audit (WCAG 2.2 AA proxies) | `scripts/audit-a11y.mjs` | **13/13 pass** at mobile 390px, tablet 834px, desktop 1440px + reduced-motion |

### Browser UI checks (independent harness, real Chromium 156)

11/11 — beast renders 5 selectable zones; primary STRIKE action present; zone selection updates the
readout; tool selection works; strike produces a damage card ("−21 … shared integrity 30"); second
strike blocked; server rejects duplicate (409); day advances after molt; molt explanation shown;
bestiary records the round; zones expose accessible names/states.

### Accessibility (independent harness)

13/13 — no horizontal overflow at 390/834/1440px; all text meets WCAG AA contrast (26 nodes);
interactive targets ≥ 24px (10 targets); all 5 beast zones keyboard-reachable; renders with
reduced motion. *(Note: the harness checks ≥24px, the WCAG 2.2 AA minimum; the design target is 44px —
see limitations.)*

## 9. Honest caveats

- The a11y audit is a **proxy** (CDP-measured contrast/targets/focus), not a full screen-reader pass.
- The benchmark reproduction uses a reconstructed strategy battery (see `MISSION09_BENCHMARK_REPRODUCTION.md`);
  it matches Mission 09's headline numbers exactly but is not byte-identical tooling.
- No test was skipped; no check is reported that was not run.
