import React from 'react';
import {
  extraHandAngles,
  handAngles,
  markLabel,
  markPoint,
  outerLabel,
  watchIndex,
  MAJOR_EVERY,
  MARKS,
} from './dial';
import { msSinceLocalMidnight } from './clock';

const R = 100;
const R_MARK_IN = 84;
const R_MARK_IN_MAJOR = 78;
const R_LABEL = 66;       // seximal pairs, inside the rim, majors only
const R_OUTER = 114;      // niftimal glyphs, outside the rim, every mark

const HANDS = [
  { unit: 'lapse', length: 46, width: 5 },
  { unit: 'lull', length: 68, width: 3.4 },
  { unit: 'moment', length: 84, width: 1.6 },
];

/**
 * The analog face. Angles come from dial.js; this file only draws.
 *
 * Hands are positioned with an SVG transform straight off the angle rather
 * than a CSS transition, deliberately: a transition tweens the short way round
 * and would visibly rubber-band backwards through the whole dial at each wrap.
 */
function Face({
  now, mode, extraHands = false, sextant = false,
}) {
  const ms = msSinceLocalMidnight(now);
  const angles = handAngles(ms);
  const extra = extraHandAngles(ms);
  const watch = watchIndex(ms);

  return (
    <svg
      className="clock__dial"
      viewBox="-128 -128 256 256"
      role="img"
      aria-label={`Analog face: lapse ${Math.round(angles.lapse)}°, lull ${Math.round(angles.lull)}°, moment ${Math.round(angles.moment)}°`}
      data-testid="dial"
    >
      {sextant && (
        <path
          className="clock__dial-sextant"
          data-testid="sextant"
          d={(() => {
            const a = markPoint((watch * MARKS) / 6, R);
            const b = markPoint(((watch + 1) * MARKS) / 6, R);
            return `M 0 0 L ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y} Z`;
          })()}
        />
      )}

      <circle className="clock__dial-rim" cx="0" cy="0" r={R} />

      {Array.from({ length: MARKS }, (_, i) => {
        const major = i % MAJOR_EVERY === 0;
        const a = markPoint(i, R);
        const b = markPoint(i, major ? R_MARK_IN_MAJOR : R_MARK_IN);
        const label = markLabel(i);
        const p = markPoint(i, R_LABEL);
        const o = markPoint(i, R_OUTER);
        return (
          <React.Fragment key={i}>
            <line
              className={`clock__dial-mark ${major ? 'is-major' : ''}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
            />
            {label && (
              <text
                className={`clock__dial-label ${mode === 'seximal' ? 'is-active' : ''}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                data-testid={`dial-label-${i}`}
              >
                {label}
              </text>
            )}
            <text
              className={`clock__dial-outer ${mode === 'niftimal' ? 'is-active' : ''} ${major ? 'is-major' : ''}`}
              x={o.x}
              y={o.y}
              textAnchor="middle"
              dominantBaseline="central"
              data-testid={`dial-outer-${i}`}
            >
              {outerLabel(i)}
            </text>
          </React.Fragment>
        );
      })}

      {HANDS.map(({ unit, length, width }) => (
        <line
          key={unit}
          className={`clock__dial-hand clock__dial-hand--${unit}`}
          data-testid={`hand-${unit}`}
          x1="0"
          y1="0"
          x2="0"
          y2={-length}
          strokeWidth={width}
          transform={`rotate(${angles[unit]})`}
        />
      ))}

      {extraHands && ['watch', 'breath'].map((unit) => (
        <line
          key={unit}
          className={`clock__dial-hand clock__dial-hand--${unit}`}
          data-testid={`hand-${unit}`}
          x1="0"
          y1="0"
          x2="0"
          y2={unit === 'watch' ? -34 : -58}
          strokeWidth={unit === 'watch' ? 7 : 2.4}
          transform={`rotate(${extra[unit]})`}
        />
      ))}

      <circle className="clock__dial-pin" cx="0" cy="0" r="3.5" />
    </svg>
  );
}

export default Face;
