# MOLT prototype (Mission 04)

A locally-runnable prototype of **MOLT**, the daily crowd-read beast game designed in Mission 03.

This is a **research prototype**. It is not deployed, not submitted, and does not touch any existing
product repository. See `../MISSION04_PROTOTYPE_REPORT.md` and `../KNOWN_LIMITATIONS.md`.

## Run

```bash
npm install

# API (Hono) on :8787
node --experimental-strip-types src/server/dev-server.ts

# Client (React + Vite) on :5173, in a second shell
npx vite --port 5173
```

Open http://localhost:5173.

## Test & verify

```bash
npx tsc --noEmit          # type check
npx vitest run            # 42 tests
npx vite build            # production build

# browser checks (client + server must be running):
node scripts/verify-ui.mjs http://localhost:5173     # 11 UI checks
node scripts/audit-a11y.mjs http://localhost:5173    # 13 WCAG AA checks
node scripts/spec-example.mjs                        # reproduces the spec §4 example
node scripts/balance-matrix.mjs                      # payoff-matrix simulation
node scripts/seed-demo.mjs                           # seed a multi-day history for demos
```

## Layout

- `src/engine/` — pure, I/O-free game rules (the single source of truth).
- `src/server/` — Hono API + a `Store` interface written to be Redis-implementable.
- `src/client/` — React UI; `Beast.tsx` draws the beast as a hand-authored SVG field plate.
- `tests/` — engine, adversarial, balance, and server tests.
- `scripts/` — verification and simulation harnesses.

## The one rule

`src/engine/rules.ts` is the single source of truth for every constant and table. Do not duplicate
game numbers anywhere else.
