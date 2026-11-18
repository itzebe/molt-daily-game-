/**
 * MOLT — the beast field plate.
 *
 * A hand-authored naturalist's illustration. Five body zones, each a selectable
 * path. Zone state is encoded three ways (never colour alone, per §8):
 *   armoured → cross-hatch pattern + slate tint + "plate" outline
 *   raw      → vermilion wound fill + a torn edge marker
 *   exposed  → plain ink outline on bone
 *
 * Ridges (permanent scars) are drawn as extra scored lines.
 */
import type { Zone, ZoneState } from '../engine/rules.ts';
import type { ZoneView } from '../server/view-types.ts';

const SHAPES: Record<Zone, string> = {
  crown: 'M150 58 Q205 52 214 96 Q220 132 182 144 Q146 138 140 100 Q137 70 150 58 Z',
  hide: 'M202 118 Q300 108 332 164 Q343 196 300 206 Q230 200 200 174 Q184 143 202 118 Z',
  gut: 'M196 200 Q292 205 306 236 Q300 272 230 271 Q184 266 179 235 Q181 210 196 200 Z',
  claw: 'M166 204 Q178 260 172 316 Q170 332 150 332 Q131 332 132 312 Q138 258 140 208 Z',
  tail: 'M304 179 Q356 164 382 128 Q394 116 389 140 Q372 191 330 206 Q314 206 304 194 Z',
};

const LABEL_POS: Record<Zone, { x: number; y: number }> = {
  crown: { x: 176, y: 100 },
  hide: { x: 268, y: 162 },
  gut: { x: 244, y: 240 },
  claw: { x: 152, y: 270 },
  tail: { x: 350, y: 168 },
};

function fillFor(state: ZoneState, selected: boolean, hover: boolean): string {
  if (state === 'armoured') return 'url(#hatch)';
  if (state === 'raw') return 'var(--vermilion-soft)';
  if (selected || hover) return 'var(--bone-2)';
  return 'transparent';
}

export interface BeastProps {
  zones: ZoneView[];
  selected: Zone | null;
  hovered: Zone | null;
  onSelect: (z: Zone) => void;
  onHover: (z: Zone | null) => void;
  /** damage number to flash after a strike */
  flash?: { zone: Zone; damage: number } | null;
}

export function Beast({ zones, selected, hovered, onSelect, onHover, flash }: BeastProps) {
  return (
    <svg
      viewBox="0 0 420 360"
      role="group"
      aria-label="The beast. Select a body zone to strike."
      className="beast"
      style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'manipulation' }}
    >
      <defs>
        <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#c9cfd4" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--slate)" strokeWidth="2.2" />
        </pattern>
        <pattern id="wound" width="8" height="8" patternTransform="rotate(-20)" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="var(--vermilion-soft)" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--vermilion)" strokeWidth="1.4" />
        </pattern>
      </defs>

      {/* ground shadow */}
      <ellipse cx="235" cy="338" rx="150" ry="12" fill="var(--ink)" opacity="0.08" />

      {zones.map((z) => {
        const isSel = selected === z.id;
        const isHov = hovered === z.id;
        return (
          <g key={z.id}>
            <path
              d={SHAPES[z.id]}
              fill={z.state === 'raw' ? 'url(#wound)' : fillFor(z.state, isSel, isHov)}
              stroke="var(--ink)"
              strokeWidth={isSel ? 3.4 : 2}
              strokeLinejoin="round"
              style={{ cursor: 'pointer', transition: 'opacity .12s' }}
              opacity={selected && !isSel ? 0.72 : 1}
              role="button"
              tabIndex={0}
              aria-label={`${z.name}: ${z.state}${z.hasRidge ? ', scarred' : ''}`}
              aria-pressed={isSel}
              onClick={() => onSelect(z.id)}
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(z.id)}
              onBlur={() => onHover(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(z.id);
                }
              }}
            />
            {/* ridge scars — permanent record of the community */}
            {z.hasRidge && (
              <g stroke="var(--ink)" strokeWidth="1.2" opacity="0.75" pointerEvents="none">
                <line
                  x1={LABEL_POS[z.id].x - 22}
                  y1={LABEL_POS[z.id].y + 18}
                  x2={LABEL_POS[z.id].x + 22}
                  y2={LABEL_POS[z.id].y + 6}
                />
                <line
                  x1={LABEL_POS[z.id].x - 18}
                  y1={LABEL_POS[z.id].y + 26}
                  x2={LABEL_POS[z.id].x + 20}
                  y2={LABEL_POS[z.id].y + 14}
                />
              </g>
            )}
          </g>
        );
      })}

      {/* eye */}
      <circle cx="176" cy="92" r="5.5" fill="var(--ink)" />
      <circle cx="178" cy="90" r="1.6" fill="var(--bone)" />

      {/* claws on the foreleg */}
      <g stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" pointerEvents="none">
        <line x1="140" y1="330" x2="132" y2="340" />
        <line x1="150" y1="332" x2="148" y2="342" />
        <line x1="160" y1="330" x2="164" y2="340" />
      </g>

      {/* zone name labels */}
      {zones.map((z) => (
        <text
          key={`lbl-${z.id}`}
          x={LABEL_POS[z.id].x}
          y={LABEL_POS[z.id].y}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="12"
          letterSpacing="0.06em"
          fill="var(--ink)"
          opacity={selected && selected !== z.id ? 0.4 : 0.85}
          pointerEvents="none"
        >
          {z.name.toUpperCase()}
        </text>
      ))}

      {/* damage flash */}
      {flash && (
        <text
          x={LABEL_POS[flash.zone].x}
          y={LABEL_POS[flash.zone].y - 16}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="22"
          fontWeight="700"
          fill="var(--vermilion)"
          className="dmg-flash"
        >
          −{flash.damage}
        </text>
      )}
    </svg>
  );
}
