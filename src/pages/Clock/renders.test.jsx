import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Clock from '.';
import { msSinceLocalMidnight } from './clock';
import { extraHandAngles, handAngles, ladderSweepAngles } from './dial';

/*
 * What moves on this page, and how often. index.test.jsx pins what the page
 * SAYS; this file pins when it is drawn: the analog hands once per animation
 * frame, the digits once per seximal second, and nothing left running after
 * the page is gone.
 *
 * No component is mocked. The page is mounted the way index.test.jsx mounts
 * it, under the <main> the Programming section supplies.
 */

// 16:00 local, the same instant index.test.jsx uses: seximal hour 24, a clean
// face, zero ticks into the minute.
const T0 = new Date(2026, 8, 4, 16, 0, 0, 0);

// jest's fake requestAnimationFrame fires on a 16 ms grid.
const FRAME_MS = 16;

const page = (
  <MemoryRouter initialEntries={['/programming/clock']}>
    <Routes>
      <Route
        path="/programming/clock"
        element={
          <main>
            <Clock />
          </main>
        }
      />
    </Routes>
  </MemoryRouter>
);

/*
 * Advance the fake clock ONE FRAME PER act(). React flushes its queued state
 * updates when an act() scope closes, so a single act() around 1800 ms would
 * fold a hundred frames' worth of updates into one render and every count in
 * this file would read the same before and after. A browser gives React one
 * render per drawn frame; one act() per 16 ms step is the same thing.
 */
const advance = (ms) => {
  let left = ms;
  while (left > 0) {
    const step = Math.min(FRAME_MS, left);
    act(() => {
      jest.advanceTimersByTime(step);
    });
    left -= step;
  }
};

const transforms = (testId) =>
  screen.queryAllByTestId(testId).map((el) => el.getAttribute('transform'));

const rotate = (degrees) => `rotate(${degrees})`;

let errors;

beforeEach(() => {
  // `now` is passed HERE rather than set afterwards with jest.setSystemTime.
  // The fake animation-frame grid is anchored where the fake clock was
  // installed; setting the time afterwards leaves the grid anchored to the
  // real wall clock, and the first frame then lands anywhere from 16 to 31 ms
  // after mount, differently on every run. Installed at T0, frames fall at
  // exactly T0 + 16, + 32, … so "the hand is where the clock says" can be
  // asserted to the digit.
  jest.useFakeTimers({ now: T0 });
  window.localStorage.clear();
  errors = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // React reports a state update on an unmounted component, a missing key and
  // an effect that misbehaves under StrictMode through console.error. None of
  // them is acceptable anywhere in this file.
  expect(errors).not.toHaveBeenCalled();
  errors.mockRestore();
  jest.useRealTimers();
});

test('all four faces sweep between ticks', () => {
  render(page);
  const atMount = {
    moment: transforms('hand-moment'),
    lull: transforms('hand-lull'),
    lapse: transforms('hand-lapse'),
    snap: transforms('six-hand-snap'),
  };
  // Three 36-mark dials (options 1, 3 and 4) and one seven-hand face.
  expect(atMount.moment).toHaveLength(3);
  expect(atMount.lull).toHaveLength(3);
  expect(atMount.lapse).toHaveLength(3);
  expect(atMount.snap).toHaveLength(1);

  // Ten frames, and less than a tenth of a seximal second (1851.85 ms).
  advance(160);
  expect(new Date().getTime() - T0.getTime()).toBe(160);

  // Every swept hand is exactly where the real geometry puts it at the faked
  // now: the faces read the clock per frame, not per tick.
  const ms = msSinceLocalMidnight(new Date());
  const angles = handAngles(ms);
  ['moment', 'lull', 'lapse'].forEach((unit) => {
    const now = transforms(`hand-${unit}`);
    expect(now).toEqual([
      rotate(angles[unit]),
      rotate(angles[unit]),
      rotate(angles[unit]),
    ]);
    now.forEach((t, i) => expect(t).not.toBe(atMount[unit][i]));
  });
  const snap = transforms('six-hand-snap');
  expect(snap).toEqual([rotate(ladderSweepAngles(ms).snap)]);
  expect(snap[0]).not.toBe(atMount.snap[0]);

  // The watch and breath hands (option 3) are STEPPED by design: a watch is
  // four hours and a breath eleven seconds, so neither has moved. They still
  // have to read the same clock as the hands beside them.
  expect(transforms('hand-watch')).toEqual([rotate(extraHandAngles(ms).watch)]);
  expect(transforms('hand-breath')).toEqual([
    rotate(extraHandAngles(ms).breath),
  ]);

  // …while the digits, which tick, have not moved at all.
  expect(screen.getByTestId('digits-second')).toHaveTextContent('00');
});

test.each([
  ['on its own', false],
  ['inside React.StrictMode', true],
])('leaving the page stops every loop (%s)', (_, strict) => {
  const { unmount } = render(
    strict ? <React.StrictMode>{page}</React.StrictMode> : page,
  );
  // The tick timer and the animation frames are all pending fake timers.
  expect(jest.getTimerCount()).toBeGreaterThan(0);

  // Let some frames run first, so the frame to cancel is no longer the first
  // one that was requested: a cleanup that remembers a stale id fails here.
  advance(160);
  expect(jest.getTimerCount()).toBeGreaterThan(0);

  unmount();
  expect(jest.getTimerCount()).toBe(0);

  // …and nothing re-arms itself afterwards.
  advance(2000);
  expect(jest.getTimerCount()).toBe(0);
});

test('the notation toggle reaches the dials', () => {
  render(page);
  const dials = screen.getAllByTestId('dial');
  expect(dials).toHaveLength(3);
  const mark = (dial, testId) =>
    dial.querySelector(`[data-testid="${testId}"]`);

  // Seximal: the inner ring of pairs is the emphasised one.
  dials.forEach((dial) => {
    expect(mark(dial, 'dial-label-6')).toHaveClass('is-active');
    expect(mark(dial, 'dial-outer-7')).not.toHaveClass('is-active');
  });

  fireEvent.click(screen.getByRole('button', { name: 'niftimal' }));

  // Niftimal: the outer ring of glyphs takes over, on all three dials.
  dials.forEach((dial) => {
    expect(mark(dial, 'dial-outer-7')).toHaveClass('is-active');
    expect(mark(dial, 'dial-label-6')).not.toHaveClass('is-active');
  });
});
