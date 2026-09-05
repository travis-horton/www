import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  dayFraction,
  decimalTime,
  niftimalDigit,
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

const LEGEND = [
  ['hour', '36 a day', '40 min'],
  ['minute', '36 an hour', '1 min 6.7 s'],
  ['second', '36 a minute', '1.85 s'],
];

function Clock() {
  const [mode, setMode] = useState(loadMode);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const choose = (m) => {
    setMode(m);
    saveMode(m);
  };

  const ticks = ticksSinceMidnight(now);
  const parts = splitTicks(ticks);
  const names = unitNames(ticks);
  const write = mode === NIFTIMAL ? niftimalDigit : seximalPair;
  const percent = Math.round(dayFraction(ticks) * 1000) / 10;

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
                <span className="clock__label">{unit}</span>
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
          {`${decimalTime(now)} on the decimal clock · ${percent}% of the day gone`}
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
