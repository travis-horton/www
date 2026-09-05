import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Face from './Face';
import { spanIndex } from './dial';

import {
  dayFraction,
  decimalTime,
  msSinceLocalMidnight,
  msToNextTick,
  niftimalDigit,
  seximalTriple,
  UNIT_DEFINITIONS,
  UNIT_NAMES,
  seximalPair,
  splitTicks,
  spokenTime,
  ticksSinceMidnight,
  unitNames,
} from './clock';

import './styles.css';

/*
 * A static, client-only clock. Nothing is fetched; the only state that
 * outlives the tab is which notation you last chose.
 */

const MODE_KEY = 'travish.clock.mode';
const SEXIMAL = 'seximal';
const NIFTIMAL = 'niftimal';
const MODES = [SEXIMAL, NIFTIMAL];

const loadMode = () => {
  try {
    return window.localStorage.getItem(MODE_KEY) === NIFTIMAL ? NIFTIMAL : SEXIMAL;
  } catch (e) {
    return SEXIMAL;
  }
};

const saveMode = (mode) => {
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch (e) {
    // Private mode or storage disabled: the toggle still works for this tab.
  }
};

const UNITS = ['hour', 'minute', 'second'];

// The count is a nif in both bases, and saying so in decimal ("36 a day") on a
// page arguing for base six undercuts the argument. 36 = 100₆ = 10₃₆, round in
// both — which is the whole reason the unit was chosen. Real length stays
// decimal: it is the orientation column, in units the reader already owns.
const LEGEND = [
  ['hour', '100₆ · 10₃₆ a day', '40 min'],
  ['minute', '100₆ · 10₃₆ an hour', '1 min 6.7 s'],
  ['second', '100₆ · 10₃₆ a minute', '1.85 s'],
];

function Clock() {
  const [mode, setMode] = useState(loadMode);
  const [now, setNow] = useState(() => new Date());

  // Tick on the SEXIMAL second, not the decimal one. A tick is 1.85 s, so a
  // 1000 ms interval showed the same face twice, then skipped one — the clock
  // was legible but visibly not keeping its own time. Each timeout is aimed at
  // the next tick boundary and re-aimed on arrival, so it cannot drift.
  useEffect(() => {
    let id;
    const tick = () => {
      const d = new Date();
      setNow(d);
      id = setTimeout(tick, msToNextTick(d));
    };
    id = setTimeout(tick, msToNextTick(new Date()));
    return () => clearTimeout(id);
  }, []);

  const choose = (m) => {
    setMode(m);
    saveMode(m);
  };

  const ticks = ticksSinceMidnight(now);
  const parts = splitTicks(ticks);
  const names = unitNames(ticks);
  const write = mode === NIFTIMAL ? niftimalDigit : seximalPair;
  // Three decimals, not two (Travis, 26.0905). A tick is 1/46656 of the day,
  // which is 0.00214% — smaller than 0.01, so at two places the number would
  // sit still for four or five ticks and then jump two. Three is the coarsest
  // precision at which every tick visibly moves it.
  const percent = dayFraction(ticks) * 100;
  const percentText = percent.toFixed(3);
  const ms = msSinceLocalMidnight(now);

  return (
    <main>
      <div className="clock">
        <h1>Clock</h1>
        <p className="clock__lede">
          The day cut into thirty-six hours, each a nif of minutes, each minute
          a nif of seconds. Written in base six that is three pairs; written in
          base thirty-six it is three glyphs. The names never change — a
          niftimal digit is spoken as its seximal pair.
        </p>

        <div className="clock__modes" role="group" aria-label="Notation">
          {MODES.map((m) => (
            <button
              type="button"
              key={m}
              className={`clock__mode ${mode === m ? 'is-on' : ''}`}
              aria-pressed={mode === m}
              onClick={() => choose(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <Face now={now} mode={mode} />

        <div className={`clock__face clock__face--${mode}`}>
          {UNITS.map((unit, i) => (
            <React.Fragment key={unit}>
              {i > 0 && <span className="clock__colon" aria-hidden="true">:</span>}
              <span className="clock__unit">
                <span className="clock__digits" data-testid={`digits-${unit}`}>
                  {write(parts[unit])}
                </span>
                <span className="clock__name" data-testid={`name-${unit}`}>
                  {names[unit]}
                </span>
                <span className="clock__label" data-testid={`label-${unit}`}>
                  {UNIT_NAMES[unit]}
                </span>
              </span>
            </React.Fragment>
          ))}
        </div>

        <p className="clock__spoken">
          read as one number:
          {' '}
          <strong>{spokenTime(ticks)}</strong>
        </p>

        <div
          className="clock__bar"
          role="progressbar"
          aria-label="Day"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="clock__bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="clock__meta">
          {`${decimalTime(now)} on the decimal clock · ${percentText}% of the day gone`}
        </p>

        <table className="clock__legend">
          <thead>
            <tr>
              <th>unit</th>
              <th>count</th>
              <th>real length</th>
            </tr>
          </thead>
          <tbody>
            {LEGEND.map(([unit, count, length]) => (
              <tr key={unit}>
                <td>{unit}</td>
                <td>{count}</td>
                <td className="clock__dim">{length}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="clock__h2">the units have names</h2>
        <p className="clock__lede">
          They are not invented here. They come from
          {' '}
          <a href="https://www.seximal.net/units">seximal.net</a>
          , and they are the units this clock already had — the generic hour,
          minute and second were standing in for them. The definitions look odd
          at first because that page writes its numbers in seximal: a moment is
          &ldquo;exactly 1.504 seconds&rdquo;, and 1.504₆ is 1.85. The span and
          the snap are Justin Kunimune&rsquo;s, adopted there as canon.
        </p>
        <p className="clock__lede">
          The published ladder skips two rungs, so two names below are
          <strong> ours, not canon</strong> — marked ✳. A <em>watch</em>
          {' '}
          because a ship&rsquo;s watch is already four hours, six to a day; a
          {' '}
          <em>breath</em> because a slow breath runs about eleven seconds, which
          gives it the same body-paced case the snap has. With both, every rung
          from a day down to a snap has a name and each is a sixth of the one
          above.
        </p>
        <dl className="clock__units">
          {UNIT_DEFINITIONS.map(([name, gloss, fraction, sign, si, source]) => (
            <div className="clock__unit-def" key={name} data-testid={`def-${name}`}>
              <dt>
                {name}
                {source === 'proposed here' && (
                  <span className="clock__unit-flag" title="not canon — proposed on this page">
                    ✳
                  </span>
                )}
              </dt>
              <dd>
                {gloss}
                <span className="clock__dim">
                  {' — '}
                  {fraction}
                  {` ${sign} `}
                  {si}
                  {' · '}
                  {source}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <h2 className="clock__h2">three sketches, none of them decided</h2>
        <p className="clock__lede">
          Ways the newer units could reach the face. All three run live off the
          same clock; none is wired to the toggle yet.
        </p>

        <div className="clock__sketches">
          <figure className="clock__sketch" data-testid="sketch-span">
            <div className="clock__sketch-span">{seximalTriple(spanIndex(ms))}</div>
            <figcaption>
              <strong>the span, one number</strong>
              {' — '}
              three seximal digits, 000 to 555, good to 6 min 40 s. What
              seximal.net says the span is for: the time without colons.
            </figcaption>
          </figure>

          <figure className="clock__sketch" data-testid="sketch-hands">
            <Face now={now} mode={mode} extraHands />
            <figcaption>
              <strong>watch and breath as hands</strong>
              {' — '}
              the short thick one and the thin one. Both step through six
              positions only, so they read as slow duplicates of the lapse and
              moment hands. Shown because seeing it settles it.
            </figcaption>
          </figure>

          <figure className="clock__sketch" data-testid="sketch-sextant">
            <Face now={now} mode={mode} sextant />
            <figcaption>
              <strong>the watch as a wedge</strong>
              {' — '}
              a watch is a sixth of the day and the dial already has six major
              marks, so it is a region, not a pointer. No new hand.
            </figcaption>
          </figure>
        </div>

        <p className="clock__foot">
          <Link to="/learn/seximal">the seximal course</Link>
          {' · '}
          <Link to="/programming/seximal-time-keeping">the hexagon clock</Link>
        </p>
      </div>
    </main>
  );
}

export default Clock;
