import React, { useEffect, useRef, useState } from 'react';
import { LADDER, ladderDigits, ladderSweepAngles, markPoint } from './dial';
import { msSinceLocalMidnight } from './clock';

const R = 100;
const MARKS = 6;

// Small ticks (Travis, 26.0905). They only have to say where the sixths are;
// with seven hands turning inside them, a heavy mark competes with the thing
// it is there to measure. Six short strokes at the rim, and the numerals
// outside carry the reading.
const MARK_INNER = 92;

// Thick and SHORT for the slow hands, thin and long for the fast ones, as on
// any clock: the watch hand is the stubby one, the snap hand reaches the rim.
// (Travis, 26.0905 — the first cut had it backwards.)
const LENGTH = [34, 43, 52, 61, 70, 79, 88];
const WIDTH = [6, 5.2, 4.4, 3.6, 2.8, 2, 1.4];
// Weight and darkness pull in opposite directions (Travis, 26.0905): the
// skinniest hand is the darkest, lightening as the hands thicken. A thick pale
// hand and a thin dark one carry about the same amount of ink, so no rung
// shouts over the others — and the fastest hand, the one you actually watch,
// is the most legible.
// Floor raised from 0.32 to 0.45: black at 0.32 on white measures 2.23:1,
// under the 3:1 WCAG floor for a graphical object, so the watch hand was below
// the contrast minimum. 0.45 clears it at 3.35:1 and the ordering is untouched.
const OPACITY = [0.45, 0.54, 0.63, 0.72, 0.81, 0.9, 1];

/**
 * Six ticks, seven hands (Travis, 26.0905). Each hand turns once per the unit
 * above it, and the mark it has last passed is one seximal digit; the seven
 * digits together are the day down to the snap.
 *
 * The hands SWEEP (Travis, 26.0905: "smoothly from tick to tick"). That is why
 * this face runs off requestAnimationFrame rather than off the page's clock:
 * the page ticks once a moment, the snap hand completes a whole revolution in
 * that same moment, and anything slower than the display would turn the sweep
 * back into the stepping it was asked to replace. The frame callback also
 * stops on a hidden tab for free, which a timer does not.
 *
 * The digits below the face stay floored — they are the reading, not the
 * animation, and a digit that flickered between two values would be worse than
 * useless.
 */
function SixFace() {
  const [now, setNow] = useState(() => new Date());
  const frame = useRef(0);

  useEffect(() => {
    const draw = () => {
      setNow(new Date());
      frame.current = window.requestAnimationFrame(draw);
    };
    frame.current = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame.current);
  }, []);

  const ms = msSinceLocalMidnight(now);
  const angles = ladderSweepAngles(ms);
  const digits = ladderDigits(ms);

  return (
    <>
      <svg
        className="clock__dial"
        viewBox="-118 -118 236 236"
        role="img"
        aria-label={`Seven hands, one per unit: ${digits.join('')}`}
        data-testid="sixface"
      >
        <circle className="clock__dial-rim" cx="0" cy="0" r={R} />

        {Array.from({ length: MARKS }, (_, i) => {
          const a = markPoint((i * 36) / MARKS, R);
          const b = markPoint((i * 36) / MARKS, MARK_INNER);
          const p = markPoint((i * 36) / MARKS, 110);
          return (
            <React.Fragment key={i}>
              <line
                className="clock__dial-mark clock__dial-mark--six"
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              />
              <text
                className="clock__dial-outer is-major is-active"
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {i}
              </text>
            </React.Fragment>
          );
        })}

        {LADDER.map((unit, i) => (
          <line
            key={unit}
            className={`clock__dial-hand clock__dial-hand--${unit}`}
            data-testid={`six-hand-${unit}`}
            x1="0"
            y1="0"
            x2="0"
            y2={-LENGTH[i]}
            strokeWidth={WIDTH[i]}
            strokeOpacity={OPACITY[i]}
            transform={`rotate(${angles[unit]})`}
          />
        ))}

        <circle className="clock__dial-pin" cx="0" cy="0" r="3.5" />
      </svg>

      <div className="clock__six-readout" data-testid="sixface-digits">
        {digits.join('')}
        <span className="clock__dim">₆</span>
      </div>
      <ol className="clock__six-key">
        {LADDER.map((unit, i) => (
          <li key={unit}>
            <span className="clock__six-key-digit">{digits[i]}</span>
            {' '}
            {unit}
          </li>
        ))}
      </ol>
    </>
  );
}

export default SixFace;
