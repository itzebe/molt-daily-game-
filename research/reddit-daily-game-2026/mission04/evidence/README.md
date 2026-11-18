# Evidence index — Mission 04

Raw, reproducible artifacts backing `MISSION04_PROTOTYPE_REPORT.md`. All captured 2026-11-18 on the
prototype in `../prototype/`. Verify integrity with `sha256sum -c SHA256SUMS.txt` (run from this
directory's parent).

| File | What it is | Command that produced it |
| --- | --- | --- |
| `test-output.txt` | Full vitest run — 42/42 pass | `npx vitest run` |
| `typecheck-output.txt` | Type check output — **empty = 0 errors** (see `.NOTE.txt`) | `npx tsc --noEmit` |
| `build-output.txt` | Vite production build | `npx vite build` |
| `spec-example-reproduction.txt` | Engine vs the spec §4 worked example (53, 34, 16) | `node scripts/spec-example.mjs` |
| `balance-payoff-matrix.txt` | 90-day payoff matrix (non-degeneracy) | `node scripts/balance-matrix.mjs` |
| `ui-verification-output.txt` | Independent browser UI drive — 11/11 | `node scripts/verify-ui.mjs` |
| `a11y-audit-output.txt` | WCAG 2.2 AA audit at 3 widths — 13/13 | `node scripts/audit-a11y.mjs` |
| `verify-ui.mjs`, `audit-a11y.mjs` | Copies of the verification harnesses, for reproducibility | — |
| `screenshots/mobile.png` | Rendered UI at 390×844 | headless Chromium `--screenshot` |
| `screenshots/tablet.png` | Rendered UI at 834×1112 | headless Chromium `--screenshot` |
| `screenshots/desktop.png` | Rendered UI at 1440×900 | headless Chromium `--screenshot` |

## Notes

- The screenshots were captured after seeding a 3-day history (`scripts/seed-demo.mjs`) so the beast
  shows evolved zone states and a populated bestiary. **The crowd is synthetic** — never present these
  as real players (see `../KNOWN_LIMITATIONS.md` §4).
- The browser checks drive a real headless Chromium (v156) over the Chrome DevTools Protocol; they
  assert on the live DOM, not on a screenshot. This is independent of the implementation's own claims.
- The Playwright MCP browser could not be used (its sandbox could not start in this environment); the
  CDP harness was used instead and is the stronger artifact (it asserts, rather than renders).
