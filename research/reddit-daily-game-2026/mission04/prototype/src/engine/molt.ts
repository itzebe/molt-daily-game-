/**
 * MOLT engine — molting: derive day D+1 from day D. Pure and deterministic.
 *
 * Implements §3 of the mechanics specification exactly.
 *
 * INTERPRETATIONS (documented, not spec changes):
 *  I4. The standard deviation for the mutation check (§3.5) is the population
 *      standard deviation of zoneShare across the five base zones.
 *  I5. Rule application order is 3.1 over-use → 3.2 neglect → 3.5 mutation →
 *      3.7 escape penalty → 3.6 default fill. Later rules may override earlier
 *      ones only where the spec says so (3.7 forces the least-hit zone armoured).
 *  I6. A zone cannot be both armoured and raw: over-use (3.1) wins over neglect
 *      (3.2), which cannot co-occur anyway (0.35 > 0.05).
 *  I7. `previousOutcome` is set from the resolved day so the UI can explain it.
 */
import {
  MAW,
  MUTATION_STDDEV,
  NEGLECT_THRESHOLD,
  OVERUSE_THRESHOLD,
  RIDGE_THRESHOLD,
  ZONES,
  type BeastState,
  type Tool,
  type Zone,
  type ZoneState,
} from './rules.ts';
import type { DayResolution } from './resolve.ts';

export interface MoltInput {
  nextDay: number;
  /** resolution of day D (the day just finished) */
  resolution: DayResolution;
  /** zoneShare history, most-recent-last, up to 3 entries incl. day D (§3.4) */
  recentZoneShares: Array<Record<string, number>>;
  /** state of day D (for ridge carry-over) */
  previousState: BeastState;
}

function populationStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** §3 — derive the next day's beast state. */
export function molt(input: MoltInput): BeastState {
  const { nextDay, resolution, recentZoneShares, previousState } = input;
  const n = resolution.n;

  const zoneShare: Record<string, number> = resolution.zoneShare;
  const zoneState = {} as Record<Zone, ZoneState>;
  for (const z of ZONES) zoneState[z] = 'exposed'; // §3.6 default fill

  // §3.1 over-use → armour
  for (const z of ZONES) {
    if (n > 0 && (zoneShare[z] ?? 0) >= OVERUSE_THRESHOLD) zoneState[z] = 'armoured';
  }
  // §3.2 neglect → raw
  for (const z of ZONES) {
    if (n > 0 && (zoneShare[z] ?? 0) <= NEGLECT_THRESHOLD) zoneState[z] = 'raw';
  }

  // §3.5 mutation — even crowd across the five base zones
  const shares = ZONES.map((z) => zoneShare[z] ?? 0);
  const mutated = n > 0 && populationStdDev(shares) < MUTATION_STDDEV;

  // §3.4 scarring — ridge if a zone took >=25% on any of the last three days
  const ridgeSet = new Set<Zone>(previousState.ridges);
  for (const dayShare of recentZoneShares.slice(-3)) {
    for (const z of ZONES) {
      if ((dayShare[z] ?? 0) >= RIDGE_THRESHOLD) ridgeSet.add(z);
    }
  }

  // §3.7 escape penalty — beast hardens; least-hit zone forced armoured
  if (resolution.outcome === 'ESCAPED' && n > 0) {
    let least: Zone = ZONES[0];
    let leastShare = Infinity;
    for (const z of ZONES) {
      const s = zoneShare[z] ?? 0;
      if (s < leastShare) {
        leastShare = s;
        least = z;
      }
    }
    zoneState[least] = 'armoured';
  }

  return {
    day: nextDay,
    zoneState,
    fatiguedTool: resolution.topTool as Tool | null, // §3.3
    ridges: [...ridgeSet],
    mutated,
    previousOutcome: resolution.outcome,
  };
}

/** The beast state for the very first day, before any crowd exists. */
export function genesisState(day = 1): BeastState {
  const zoneState = {} as Record<Zone, ZoneState>;
  for (const z of ZONES) zoneState[z] = 'exposed';
  return {
    day,
    zoneState,
    fatiguedTool: null,
    ridges: [],
    mutated: false,
    previousOutcome: null,
  };
}

export { MAW };
