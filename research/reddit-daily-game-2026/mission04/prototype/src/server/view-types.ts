/**
 * MOLT — shared wire types between server and client.
 * The client NEVER sends a damage number; it sends only a (zone, tool) strike.
 */
import type { BeastState, Strike, Zone, ZoneState } from '../engine/rules.ts';

export type CrowdBand = 'herd' | 'common' | 'lone' | 'read';

export interface ZoneView {
  id: Zone;
  name: string;
  state: ZoneState;
  baseValue: number;
  /** coarse, delayed band for today's crowd on this zone (anti-sniping, §7) */
  crowdBand: CrowdBand | null;
  hasRidge: boolean;
}

export interface StateView {
  day: number;
  zones: ZoneView[];
  mutated: boolean;
  fatiguedTool: string | null;
  previousOutcome: 'SLAIN' | 'ESCAPED' | null;
  previousDay: number | null;
  /** human-readable explanation of what changed since yesterday */
  moltNote: string | null;
  alreadyStruck: boolean;
  yourStrike: Strike | null;
  integrity: number;
  totalDamageSoFar: number;
  strikerCount: number;
}

export interface StrikeResponse {
  ok: boolean;
  reason?: string;
  /** provisional damage band (exact value finalised at resolution) */
  damage: number;
  crowdLabel: CrowdBand;
  share: number;
  isRead: boolean;
  state: StateView;
}

export interface HistoryEntry {
  day: number;
  outcome: 'SLAIN' | 'ESCAPED';
  totalDamage: number;
  integrity: number;
  n: number;
  topTool: string | null;
}

export interface HistoryView {
  entries: HistoryEntry[];
}

export type { BeastState, Strike, Zone, ZoneState };
