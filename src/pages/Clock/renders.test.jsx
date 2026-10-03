import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Clock from '.';
import { msSinceLocalMidnight, spokenTime } from './clock';
import {
  extraHandAngles,
  handAngles,
  ladderDigits,
  ladderSweepAngles,
  MARKS,
  outerLabel,
} from './dial';

/*
 * What moves on this page, and how often. index.test.jsx pins what the page
 * SAYS; this file pins when it is drawn: the analog hands once per animation
 * frame, the digits once per seximal second, and nothing left running after
 * the page is gone.
 *
 * No component is mocked. The page is mounted the way index.test.jsx mounts
 * it, under the <main> the Programming section supplies.
 *
 * The render counts come from a pure function wrapped in a spy, everything
 * else in its module real: spokenTime is called once per render of the page
 * root and from nowhere else ("read as one number"), so its call count IS the
 * root's render count. outerLabel is called once per mark on a 36-mark dial
 * and from nowhere else, so 36 calls is one drawing of one dial's marks.
 */
jest.mock('./clock', () => {
  const real = jest.requireActual('./clock');
  return { __esModule: true, ...real, spokenTime: jest.fn(real.spokenTime) };
});
jest.mock('./dial', () => {
  const real = jest.requireActual('./dial');
  return { __esModule: true, ...real, outerLabel: jest.fn(real.outerLabel) };
});

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
  spokenTime.mockClear();
  outerLabel.mockClear();
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
  // four hours and a breath eleven seconds, so neither is due to step in
  // 160 ms. What is asserted is that they read the same clock as the hands
  // beside them, NOT that they stood still: at the mount instant itself, an
  // exact minute boundary, extraHandAngles puts the breath hand one step
  // back (300 rather than 0) and it reads 0 from the first frame on.
  expect(transforms('hand-watch')).toEqual([rotate(extraHandAngles(ms).watch)]);
  expect(transforms('hand-breath')).toEqual([
    rotate(extraHandAngles(ms).breath),
  ]);

  // …while the digits, which tick, have not moved at all.
  expect(screen.getByTestId('digits-second')).toHaveTextContent('00');
});

test('no frame is skipped: the hands are redrawn on each of the first three', () => {
  render(page);
  let before = {
    moment: transforms('hand-moment')[0],
    snap: transforms('six-hand-snap')[0],
  };

  // The tests around this one read the hands after 10 frames and after 112,
  // both even, so a face that drew on every OTHER frame would pass them all.
  // Three frames in a row cover an odd one and an even one whichever half
  // went missing.
  [1, 2, 3].forEach((frame) => {
    advance(FRAME_MS);
    expect(new Date().getTime() - T0.getTime()).toBe(frame * FRAME_MS);

    const ms = msSinceLocalMidnight(new Date());
    const moment = rotate(handAngles(ms).moment);
    const snap = rotate(ladderSweepAngles(ms).snap);
    expect(transforms('hand-moment')).toEqual([moment, moment, moment]);
    expect(transforms('six-hand-snap')).toEqual([snap]);

    // …and one frame is enough to move both, so "equal to the geometry now"
    // cannot be satisfied by a hand left where the frame before put it.
    expect(moment).not.toBe(before.moment);
    expect(snap).not.toBe(before.snap);
    before = { moment, snap };
  });
});

test('the faces are driven by requestAnimationFrame, not by a timer', () => {
  // A 16 ms timer loop draws the same pictures under jest's fake clock, and
  // every other test in this file passes on one. The difference is in the
  // browser: animation frames stop on a hidden tab and a timer does not,
  // which is what the hook's comment and the README promise.
  const raf = jest.spyOn(window, 'requestAnimationFrame');
  try {
    render(page);
    // Four analog faces (three dials and the seven-hand face), one request
    // each when they mount…
    expect(raf).toHaveBeenCalledTimes(4);

    // …and one each per frame after that: 4 × (1 + 10).
    advance(160);
    expect(raf).toHaveBeenCalledTimes(44);
  } finally {
    raf.mockRestore();
  }
});

test('the seven-hand face reads its digits off the same clock as its hands', () => {
  render(page);
  const readout = screen.getByTestId('sixface-digits');
  expect(readout.textContent).toBe('4000000₆');

  // A snap is 308.6 ms, so 400 ms (25 frames) is one snap and no more.
  advance(400);
  const ms = msSinceLocalMidnight(new Date());
  const digits = ladderDigits(ms).join('');
  expect(digits).toBe('4000001');

  // The readout, the face's spoken label and the key under it all step with
  // the hands; none of them is left at the value the face mounted with.
  expect(readout.textContent).toBe(`${digits}₆`);
  expect(screen.getByTestId('sixface')).toHaveAttribute(
    'aria-label',
    `Seven hands, one per unit: ${digits}`,
  );
  const key = document.querySelectorAll('.clock__six-key-digit');
  expect(Array.from(key, (el) => el.textContent).join('')).toBe(digits);
  expect(transforms('six-hand-snap')).toEqual([
    rotate(ladderSweepAngles(ms).snap),
  ]);
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

test('the page root renders once per seximal tick, not once per frame', () => {
  render(page);
  expect(spokenTime).toHaveBeenCalledTimes(1);
  const atMount = transforms('hand-moment');

  // 1800 ms is 112 frames and no tick: the first tick is 1851.85 ms in.
  advance(1800);

  // The frames really ran. Without this the count below could pass on a
  // clock that never drew anything: the last frame was at 1792 ms, and the
  // hands are where that instant puts them.
  const lastFrame = new Date(T0.getTime() + 112 * FRAME_MS);
  const drawn = rotate(handAngles(msSinceLocalMidnight(lastFrame)).moment);
  expect(transforms('hand-moment')).toEqual([drawn, drawn, drawn]);
  expect(drawn).not.toBe(atMount[0]);

  // …and the page around the faces was not rendered again for any of them.
  expect(spokenTime).toHaveBeenCalledTimes(1);

  // One tick later the digits step, and the root renders exactly once more.
  advance(100);
  expect(screen.getByTestId('digits-second')).toHaveTextContent('01');
  expect(spokenTime).toHaveBeenCalledTimes(2);
});

test("a dial's 36 marks are drawn once, not once per frame", () => {
  render(page);
  const dials = screen.getAllByTestId('dial').length;
  expect(dials).toBe(3);
  const once = dials * MARKS; // 108
  expect(outerLabel).toHaveBeenCalledTimes(once);
  const atMount = transforms('hand-moment');

  // 112 frames. The hands moved on every one of them (the positive control,
  // as above) and the marks, which never move, were not drawn again.
  advance(1800);
  const lastFrame = new Date(T0.getTime() + 112 * FRAME_MS);
  const drawn = rotate(handAngles(msSinceLocalMidnight(lastFrame)).moment);
  expect(transforms('hand-moment')).toEqual([drawn, drawn, drawn]);
  expect(drawn).not.toBe(atMount[0]);
  expect(outerLabel).toHaveBeenCalledTimes(once);

  // A tick re-renders the page and the ballot around the dials. The marks
  // depend on the notation alone, and the notation has not changed.
  advance(100);
  expect(screen.getByTestId('digits-second')).toHaveTextContent('01');
  expect(outerLabel).toHaveBeenCalledTimes(once);

  // Changing the notation is the one thing that redraws them: once each.
  fireEvent.click(screen.getByRole('button', { name: 'niftimal' }));
  expect(outerLabel).toHaveBeenCalledTimes(2 * once);
});
