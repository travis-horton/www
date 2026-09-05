import React from 'react';
import {
  handAngles,
  markLabel,
  markPoint,
  MAJOR_EVERY,
  MARKS,
} from './dial';
import { msSinceLocalMidnight } from './clock';

const R = 100;          // viewBox is -110..110, so the rim has room for labels
const R_MARK_IN = 84;
const R_MARK_IN_MAJOR = 78;
const R_LABEL = 66;

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
function Face({ now, mode }) {
  const angles = handAngles(msSinceLocalMidnight(now));

  return (
    <svg
      className="clock__dial"
      viewBox="-110 -110 220 220"
      role="img"
      aria-label={`Analog face: lapse ${Math.round(angles.lapse)}°, lull ${Math.round(angles.lull)}°, moment ${Math.round(angles.moment)}°`}
      data-testid="dial"
    >
      <circle className="clock__dial-rim" cx="0" cy="0" r={R} />

      {Array.from({ length: MARKS }, (_, i) => {
        const major = i % MAJOR_EVERY === 0;
        const a = markPoint(i, R);
        const b = markPoint(i, major ? R_MARK_IN_MAJOR : R_MARK_IN);
        const label = markLabel(i, mode);
        const p = markPoint(i, R_LABEL);
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
                className="clock__dial-label"
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                data-testid={`dial-label-${i}`}
              >
                {label}
              </text>
            )}
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

      <circle className="clock__dial-pin" cx="0" cy="0" r="3.5" />
    </svg>
  );
}

export default Face;
