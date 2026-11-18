/**
 * MOLT — main client application.
 *
 * One obvious primary action: STRIKE. The beast is the centrepiece.
 * Mobile-first, minimal text, immediate feedback.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Beast } from './Beast.tsx';
import type { HistoryEntry, StateView, StrikeResponse, Zone, ZoneView } from '../server/view-types.ts';
import { TOOLS, type Tool } from '../engine/rules.ts';

const TOOL_LABEL: Record<Tool, string> = {
  cleave: 'Cleave',
  pierce: 'Pierce',
  burn: 'Burn',
};
const TOOL_HINT: Record<Tool, string> = {
  cleave: 'heavy — cracks armour',
  pierce: 'pointed — opens raw flesh',
  burn: 'fire — sears raw flesh, useless on plates',
};

function api<T>(path: string, init?: RequestInit): Promise<T> {
  return fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  }).then((r) => r.json() as Promise<T>);
}

function userId(): string {
  // Prototype identity: a stable per-browser id. In Devvit this is the Reddit
  // user id supplied by the server; the client never asserts it in production.
  let id = localStorage.getItem('molt-uid');
  if (!id) {
    id = 'u-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('molt-uid', id);
  }
  return id;
}

export function App() {
  const uid = useMemo(userId, []);
  const [state, setState] = useState<StateView | null>(null);
  const [selected, setSelected] = useState<Zone | null>(null);
  const [hovered, setHovered] = useState<Zone | null>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const [result, setResult] = useState<StrikeResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const s = await api<StateView>(`/api/state?userId=${encodeURIComponent(uid)}`);
    setState(s);
    if (s.yourStrike) {
      setSelected(s.yourStrike.zone);
      setTool(s.yourStrike.tool);
    }
    const h = await api<{ entries: HistoryEntry[] }>('/api/history');
    setHistory(h.entries);
  }, [uid]);

  useEffect(() => {
    load().catch((e) => setError(String(e)));
  }, [load]);

  const activeZone = selected ?? hovered;
  const zoneView: ZoneView | null = state?.zones.find((z: ZoneView) => z.id === activeZone) ?? null;

  async function strike() {
    if (!selected || !tool || busy) return;
    setBusy(true);
    setError(null);
    const res = await api<StrikeResponse>('/api/strike', {
      method: 'POST',
      body: JSON.stringify({ userId: uid, zone: selected, tool }),
    });
    if (!res.ok) {
      setError(res.reason === 'duplicate' ? 'You already struck today. Come back after the molt.' : 'Strike rejected.');
    } else {
      setResult(res);
      setState(res.state);
    }
    setBusy(false);
  }

  if (!state) return <main style={{ padding: 24 }}>Loading the beast…</main>;

  const canStrike = selected && tool && !state.alreadyStruck;

  return (
    <main className="shell">
      <header className="head">
        <div>
          <h1 className="title">MOLT</h1>
          <p className="sub mono">
            day {state.day}
            {state.strikerCount > 0 ? ` · ${state.strikerCount} struck` : ''}
          </p>
        </div>
        <p className="verdict mono" data-outcome={state.previousOutcome ?? ''}>
          {state.previousOutcome === 'SLAIN' && 'Yesterday: SLAIN'}
          {state.previousOutcome === 'ESCAPED' && 'Yesterday: ESCAPED'}
          {!state.previousOutcome && 'Day one'}
        </p>
      </header>

      {state.moltNote && (
        <p className="molt-note" role="status">
          {state.moltNote}
        </p>
      )}

      <div className="stage">
        <Beast
          zones={state.zones}
          selected={selected}
          hovered={hovered}
          onSelect={setSelected}
          onHover={setHovered}
          flash={result ? { zone: result.state.yourStrike!.zone, damage: result.damage } : null}
        />
      </div>

      {/* zone readout — the strategic layer */}
      <div className="readout" aria-live="polite">
        {zoneView ? (
          <>
            <span className="readout-name">{zoneView.name}</span>
            <span className={`tag tag-${zoneView.state}`}>{zoneView.state}</span>
            {zoneView.hasRidge && <span className="tag tag-ridge">scarred</span>}
            {zoneView.crowdBand && <span className="tag tag-crowd">crowd: {zoneView.crowdBand}</span>}
            {zoneView.crowdBand === null && <span className="tag tag-dim">crowd: unknown</span>}
          </>
        ) : (
          <span className="hint">Tap a zone on the beast.</span>
        )}
      </div>

      {/* tool selection */}
      <div className="tools" role="radiogroup" aria-label="Choose a tool">
        {TOOLS.map((t) => {
          const eff = zoneView ? effectiveness(t, zoneView.state) : null;
          const on = tool === t;
          return (
            <button
              key={t}
              role="radio"
              aria-checked={on}
              className={`tool ${on ? 'tool-on' : ''}`}
              onClick={() => setTool(t)}
              disabled={state.alreadyStruck}
            >
              <span className="tool-name">{TOOL_LABEL[t]}</span>
              {eff && <span className={`eff eff-${eff}`}>{eff === 'strong' ? 'effective' : eff === 'weak' ? 'weak' : '—'}</span>}
              <span className="tool-hint">{TOOL_HINT[t]}</span>
            </button>
          );
        })}
      </div>

      {/* primary action */}
      <button className="strike" onClick={strike} disabled={!canStrike || busy}>
        {state.alreadyStruck ? 'Struck — back tomorrow' : busy ? 'Striking…' : 'STRIKE'}
      </button>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {/* result card */}
      {result && result.ok && (
        <section className="result" role="status">
          <div className="result-main">
            <span className="result-dmg mono">−{result.damage}</span>
            <span className="result-label">
              {result.isRead ? (
                <>
                  <strong>A READ.</strong> You struck where only {Math.round(result.share * 100)}% went.
                </>
              ) : (
                <>
                  You struck with the crowd ({Math.round(result.share * 100)}% chose this).
                </>
              )}
            </span>
          </div>
          <p className="result-sub mono">
            day {result.state.day} · shared integrity {result.state.integrity.toLocaleString()}
          </p>
        </section>
      )}

      {/* bestiary — history of the community's kills */}
      {history.length > 0 && (
        <section className="bestiary">
          <h2 className="bestiary-title">Bestiary</h2>
          <ul className="bestiary-list">
            {history.slice().reverse().map((h) => (
              <li key={h.day} className="bestiary-item mono">
                <span>day {h.day}</span>
                <span className={`tag ${h.outcome === 'SLAIN' ? 'tag-raw' : 'tag-armoured'}`}>{h.outcome}</span>
                <span className="dim">
                  {h.n} strikers · {h.totalDamage.toLocaleString()} dmg
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="foot mono">
        <span>prototype · M0–M2</span>
        <a href="?dev=1" onClick={(e) => { e.preventDefault(); void devAdvance(uid).then(load); }}>
          advance day (test)
        </a>
      </footer>
    </main>
  );
}

async function devAdvance(_uid: string) {
  await api('/api/advance', { method: 'POST' });
}

function effectiveness(t: Tool, state: string): 'strong' | 'weak' | 'neutral' {
  const table: Record<Tool, Record<string, number>> = {
    cleave: { armoured: 1.6, exposed: 1.0, raw: 0.6 },
    pierce: { armoured: 0.6, exposed: 1.0, raw: 1.6 },
    burn: { armoured: 1.0, exposed: 0.6, raw: 1.6 },
  };
  const m = table[t][state] ?? 1;
  return m > 1 ? 'strong' : m < 1 ? 'weak' : 'neutral';
}
