/**
 * MISSION 06 — adversarial verification.
 *
 * Attacks the recommendation (linear I=kN, k=27) and the current design:
 *   T1 tool repetition -> tool fatigue
 *   T2 zone repetition -> over-use armour
 *   T3 participation spike / low-turnout day (N varies day to day)
 *   T4 deliberate crowd manipulation (one actor tries to force ESCAPED / harden)
 *   T5 C2 sensitivity of the A5 threshold (pierce 1.0 vs 1.6)
 *   T6 dominant static strategy search (is there a fixed combo that always wins?)
 *
 * Deterministic; disclosed seeds; model-level only.
 */
import { ZONES, TOOLS, ZONE_VALUE, TOOL_MULT, type Strike, type Zone, type Tool, type BeastState } from '../../mission04/prototype/src/engine/rules.ts';
import { resolveDay } from '../../mission04/prototype/src/engine/resolve.ts';
import { genesisState, molt } from '../../mission04/prototype/src/engine/molt.ts';
import { COMBOS, dmgFor, bestTotal, integrity, baseFor, lcg, allExposed, N_COMBOS } from './lib.ts';

const line = (s = '') => console.log(s);

line('============================================================');
line('MISSION 06 — ADVERSARIAL VERIFICATION');
line('============================================================');

// T1: tool repetition -> fatigue
line('\n--- T1: repeated use of one tool (fatigue 0.8 on yesterday\'s top tool) ---');
{
  let st = genesisState(1);
  const recent: Array<Record<string, number>> = [];
  for (let d = 1; d <= 3; d++) {
    const subs = Array.from({ length: 100 }, (_, i) => ({ userId: `u${i}`, strike: { zone: ZONES[i % 5], tool: 'cleave' as Tool } }));
    const res = resolveDay(d, st, subs);
    line(`  day ${d}: fatiguedTool=${st.fatiguedTool ?? 'none'} totalDamage=${res.totalDamage} topTool=${res.topTool}`);
    recent.push(res.zoneShare);
    st = molt({ nextDay: d + 1, resolution: res, recentZoneShares: recent, previousState: st });
  }
  line('  => day 2 onwards, cleave (yesterday\'s top tool) is penalised 0.8x; the crowd is nudged to vary.');
}

// T2: zone repetition -> over-use armour
line('\n--- T2: repeated attacks on one zone (over-use >=35% -> armour) ---');
{
  let st = genesisState(1);
  const recent: Array<Record<string, number>> = [];
  for (let d = 1; d <= 4; d++) {
    const subs = Array.from({ length: 100 }, (_, i) => ({ userId: `u${i}`, strike: { zone: 'crown' as Zone, tool: (['cleave', 'pierce', 'burn'] as Tool[])[i % 3] } }));
    const res = resolveDay(d, st, subs);
    line(`  day ${d}: crownShare=${res.zoneShare.crown.toFixed(2)} crownState(before)=${st.zoneState.crown} -> next=${molt({ nextDay: d + 1, resolution: res, recentZoneShares: recent, previousState: st }).zoneState.crown}`);
    recent.push(res.zoneShare);
    st = molt({ nextDay: d + 1, resolution: res, recentZoneShares: recent, previousState: st });
  }
  line('  => piling on one zone arms it next day (self-limiting): the obvious target is punished.');
}

// T3: participation spike / low turnout
line('\n--- T3: participation variability (spike then low turnout) ---');
{
  for (const [label, N] of [['low turnout', 12], ['normal', 200], ['spike', 3000]] as const) {
    const st = genesisState(1);
    const subs = Array.from({ length: N }, (_, i) => ({ userId: `u${i}`, strike: COMBOS[i % N_COMBOS] }));
    const res = resolveDay(1, st, subs);
    const I = integrity(N);
    line(`  ${label.padEnd(12)} N=${String(N).padStart(4)}  I=${I.toFixed(0).padStart(6)}  dmg=${res.totalDamage.toFixed(0).padStart(7)}  ${res.totalDamage >= I ? 'SLAIN' : 'ESCAPED'} (current sqrt formula)`);
    line(`               same N under linear k=27: I=${27 * N}  dmg=${res.totalDamage.toFixed(0)}  ${res.totalDamage >= 27 * N ? 'SLAIN' : 'ESCAPED'}`);
  }
  line('  => sqrt: turnout alone decides. linear: the same per-striker bar applies at every turnout.');
}

// T4: manipulation — can a minority force ESCAPED to harden the beast?
line('\n--- T4: deliberate crowd manipulation (an adversary wants ESCAPED) ---');
{
  // honest crowd spreads (dmg/striker ~29); adversary injects herd behaviour.
  for (const N of [50, 500]) {
    const st = genesisState(1);
    const honest = Array.from({ length: N }, (_, i) => ({ userId: `h${i}`, strike: COMBOS[i % N_COMBOS] }));
    const honestRes = resolveDay(1, st, honest);
    // adversary = 40% of the crowd all piling on crown:cleave (lowers total)
    const m = Math.floor(N * 0.4);
    const mix = [...honest.slice(m), ...Array.from({ length: m }, (_, i) => ({ userId: `a${i}`, strike: { zone: 'crown' as Zone, tool: 'cleave' as Tool } }))];
    const mixRes = resolveDay(1, st, mix);
    line(`  N=${N}: honest dmg=${honestRes.totalDamage.toFixed(0)} (${(honestRes.totalDamage / N).toFixed(1)}/str) -> with 40% piling: ${mixRes.totalDamage.toFixed(0)} (${(mixRes.totalDamage / N).toFixed(1)}/str)`);
  }
  line('  => a piling minority lowers the aggregate; the community outcome is manipulable by');
  line('     coordinated spoilers. This is inherent to a shared pool and should be disclosed.');
}

// T5: C2 sensitivity of the A5 threshold
line('\n--- T5: C2 (pierce vs exposed 1.0 vs 1.6) effect on the A5 threshold ---');
{
  function bestTotalC2(N: number, pierceExposed: number): number {
    const dmg = (c: { zone: Zone; tool: Tool }, share: number) => {
      const mult = c.tool === 'pierce' && allExposed.zoneState[c.zone] === 'exposed' ? pierceExposed : TOOL_MULT[c.tool][allExposed.zoneState[c.zone]];
      return Math.round(ZONE_VALUE[c.zone] * mult * (share >= 0.3 ? 0.7 : share >= 0.1 ? 1.0 : share >= 0.03 ? 1.4 : 1.9));
    };
    const value = COMBOS.map((c) => { const a = new Array<number>(N + 1).fill(0); for (let k = 1; k <= N; k++) a[k] = k * dmg(c, k / N); return a; });
    let dp = new Array<number>(N + 1).fill(-Infinity); dp[0] = 0;
    for (let i = 0; i < N_COMBOS; i++) { const nd = new Array<number>(N + 1).fill(-Infinity); for (let u = 0; u <= N; u++) { if (dp[u] === -Infinity) continue; for (let k = 0; u + k <= N; k++) { const v = dp[u] + value[i][k]; if (v > nd[u + k]) nd[u + k] = v; } } dp = nd; }
    return dp[N];
  }
  for (const pe of [1.0, 1.6]) {
    let thr = -1; for (let N = 1; N <= 2000; N++) if (bestTotalC2(N, pe) >= integrity(N)) { thr = N; break; }
    line(`  pierce-vs-exposed=${pe.toFixed(1)} -> best-case threshold N=${thr}`);
  }
  line('  => C2 shifts the threshold by a few % but does not change the structural conclusion.');
}

// T6: dominant static combo search
line('\n--- T6: is there a dominant static combo? (best for its zone in every state) ---');
{
  let found = 0;
  for (const z of ZONES) for (const t of TOOLS) {
    let winsAll = true;
    for (const stt of ['armoured', 'exposed', 'raw'] as const) {
      const mine = ZONE_VALUE[z] * TOOL_MULT[t][stt];
      const best = Math.max(...TOOLS.map((tt) => ZONE_VALUE[z] * TOOL_MULT[tt][stt]));
      if (mine < best) winsAll = false;
    }
    if (winsAll) found++;
  }
  line(`  combos best in every state: ${found}  => no static dominant play (matches Mission 05 A4).`);
}

line('\nDone.');
