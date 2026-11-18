/**
 * MOLT engine — constants and pure rule tables.
 *
 * This module is the SINGLE SOURCE OF TRUTH for every number in the game.
 * It is pure: no I/O, no clock, no randomness, no network. Everything here is
 * derived verbatim from research/reddit-daily-game-2026/mission03/GAME_MECHANICS_SPECIFICATION.md.
 *
 * Mission 04 boundary: implement the approved mechanic exactly. Do not invent
 * scoring rules that contradict the specification.
 */

export const ZONES = ['crown', 'hide', 'gut', 'claw', 'tail'] as const;
export type Zone = (typeof ZONES)[number];

export const TOOLS = ['cleave', 'pierce', 'burn'] as const;
export type Tool = (typeof TOOLS)[number];

export type ZoneState = 'armoured' | 'exposed' | 'raw';

/** §1.1 Zone base values. */
export const ZONE_VALUE: Record<Zone, number> = {
  crown: 30,
  hide: 22,
  gut: 28,
  claw: 24,
  tail: 16,
};

/** §1.2 State multipliers. */
export const STATE_MULT: Record<ZoneState, number> = {
  armoured: 0.55,
  exposed: 1.0,
  raw: 1.7,
};

/** §1.3 Tool effectiveness vs state. TOOL_MULT[tool][state]. */
export const TOOL_MULT: Record<Tool, Record<ZoneState, number>> = {
  cleave: { armoured: 1.6, exposed: 1.0, raw: 0.6 },
  pierce: { armoured: 0.6, exposed: 1.0, raw: 1.6 },
  burn: { armoured: 1.0, exposed: 0.6, raw: 1.6 },
};

/** §1.4 Crowd factor bands. Ordered high→low by lower bound (exclusive-inclusive). */
export const CROWD_BANDS: ReadonlyArray<{ minShare: number; factor: number; label: string }> = [
  { minShare: 0.3, factor: 0.7, label: 'herd' },
  { minShare: 0.1, factor: 1.0, label: 'common' },
  { minShare: 0.03, factor: 1.4, label: 'lone' },
  { minShare: 0.0, factor: 1.9, label: 'read' },
];

/** A strike chosen by a player (the only input the client ever sends). */
export interface Strike {
  zone: Zone;
  tool: Tool;
}

/** Per-day beast state — the JSON stored at `day:{D}:state` (§5). */
export interface BeastState {
  day: number;
  zoneState: Record<Zone, ZoneState>;
  /** The tool that yesterday's crowd over-used; takes ×0.8 today (§3.3). */
  fatiguedTool: Tool | null;
  /** Zones carrying a permanent ridge (cosmetic + ×0.9 on re-hit) (§3.4). */
  ridges: Zone[];
  /** True when the `maw` mutation zone is present today (§3.5). */
  mutated: boolean;
  /** Yesterday's outcome, shown to players for context. */
  previousOutcome: 'SLAIN' | 'ESCAPED' | null;
}

export const MAW: { value: number; state: ZoneState } = { value: 34, state: 'raw' };
export const RIDGE_PENALTY = 0.9;
export const FATIGUE_PENALTY = 0.8;
export const OVERUSE_THRESHOLD = 0.35; // §3.1
export const NEGLECT_THRESHOLD = 0.05; // §3.2
export const RIDGE_THRESHOLD = 0.25; // §3.4
export const MUTATION_STDDEV = 0.06; // §3.5
export const INTEGRITY_COEFF = 30; // §1.5 — Integrity = 30 × N_distinct_strikers (Mission 09/10)
