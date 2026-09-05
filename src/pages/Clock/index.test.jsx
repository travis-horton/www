/* eslint-env jest */
import React from 'react';
import {
  act, fireEvent, render, screen, within,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Clock from '.';
import { CLOCK_OPTIONS } from './options';

const MODE_KEY = 'travish.clock.mode';

// Mounted where it actually lives: under the Programming section, which
// supplies the <main> this page deliberately does not render itself.
const renderAt = () => render(
  <MemoryRouter initialEntries={['/programming/clock']}>
    <Routes>
      <Route path="/programming/clock" element={<main><Clock /></main>} />
    </Routes>
  </MemoryRouter>,
);

// 16:00 local is exactly seximal hour 24 (40₆, niftimal O) — a clean face.
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 8, 4, 16, 0, 0, 0));
  window.localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('opens in seximal, with the digits named', () => {
  renderAt();
  expect(screen.getByRole('button', { name: 'seximal' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('digits-hour')).toHaveTextContent('40');
  expect(screen.getByTestId('digits-minute')).toHaveTextContent('00');
  expect(screen.getByTestId('digits-second')).toHaveTextContent('00');
  expect(screen.getByTestId('name-hour')).toHaveTextContent('foursy');
  expect(screen.getByText('foursy unexian')).toBeInTheDocument();
});

test('niftimal rewrites the digits and keeps the names', () => {
  renderAt();
  fireEvent.click(screen.getByRole('button', { name: 'niftimal' }));

  expect(screen.getByRole('button', { name: 'niftimal' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'seximal' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByTestId('digits-hour')).toHaveTextContent('O');
  expect(screen.getByTestId('digits-minute')).toHaveTextContent('0');
  expect(screen.getByTestId('name-hour')).toHaveTextContent('foursy');
  expect(window.localStorage.getItem(MODE_KEY)).toBe('niftimal');
});

test('the chosen notation survives a reload', () => {
  window.localStorage.setItem(MODE_KEY, 'niftimal');
  renderAt();
  expect(screen.getByRole('button', { name: 'niftimal' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('digits-hour')).toHaveTextContent('O');
});

test('an unknown stored value falls back to seximal', () => {
  window.localStorage.setItem(MODE_KEY, 'octal');
  renderAt();
  expect(screen.getByRole('button', { name: 'seximal' })).toHaveAttribute('aria-pressed', 'true');
});

test('it ticks on the seximal second, not the decimal one', () => {
  renderAt();
  expect(screen.getByTestId('digits-second')).toHaveTextContent('00');
  // Two real seconds is one seximal second and a bit.
  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(screen.getByTestId('digits-second')).toHaveTextContent('01');
  // The face last moved at the TICK boundary, 1851.85… ms in, so the
  // orientation line reads that instant and not the 2000 ms we advanced.
  // Under the old 1000 ms interval it read 16:00:02, which is precisely the
  // cadence bug: the clock was sampling on someone else's second.
  expect(screen.getByText(/16:00:01 on the decimal clock/)).toBeInTheDocument();
});

test('the day percentage is fine enough that every tick moves it', () => {
  renderAt();
  const read = () => screen.getByText(/% of the day gone/).textContent
    .match(/([\d.]+)% of the day gone/)[1];
  const before = read();
  expect(before.split('.')[1]).toHaveLength(3);
  act(() => {
    jest.advanceTimersByTime(2000); // one tick and a bit
  });
  expect(read()).not.toBe(before);
});

test('it does not advance twice inside one seximal second', () => {
  renderAt();
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  // A whole decimal second is barely half a tick: the face must not have moved.
  expect(screen.getByTestId('digits-second')).toHaveTextContent('00');
});

test('the lede hands over "nif" before the page leans on it', () => {
  // The page says "a nif of minutes" all the way down, including in the unit
  // definitions and on the ballot. The word therefore has to be DEFINED on
  // first use, not glossed a clause after it has already been spent.
  renderAt();
  const nif = screen.getByTestId('nif-def');
  expect(nif.tagName).toBe('DFN');
  expect(nif).toHaveTextContent('nif');
  expect(nif.closest('p')).toHaveTextContent(/a nif is thirty-six/i);
});

describe('the ballot at the bottom', () => {
  test('every option is laid out with a header and both cases', () => {
    renderAt();
    CLOCK_OPTIONS.forEach((opt) => {
      const panel = screen.getByTestId(`option-${opt.id}`);
      expect(panel).toHaveTextContent(opt.title);
      expect(panel).toHaveTextContent(opt.subtitle);
      // By ROLE, not by text. `toHaveTextContent('for')` was a substring match
      // that "information" and "argues for" satisfied on their own, so it
      // passed with the whole for-column deleted.
      const { getByRole } = within(panel);
      expect(getByRole('heading', { name: 'for' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'against' })).toBeInTheDocument();
      // …and the cases themselves must actually render, which nothing checked.
      expect(panel).toHaveTextContent(opt.pros[0]);
      expect(panel).toHaveTextContent(opt.cons[0]);
    });
  });

  test('each option renders its own live demo', () => {
    // The demo() switch in Ballot.jsx is keyed by option id and falls through
    // to null. A new id would silently render an empty box.
    renderAt();
    CLOCK_OPTIONS.forEach((opt) => {
      const demo = screen.getByTestId(`option-${opt.id}`)
        .querySelector('.clock__option-demo');
      expect(demo).not.toBeNull();
      expect(demo.childElementCount).toBeGreaterThan(0);
    });
  });

  test('it says there is nowhere to put a vote yet', () => {
    // The buttons came out because localStorage votes are uncountable. The
    // page has to say why, or their absence just reads as an oversight.
    renderAt();
    expect(screen.getByTestId('vote-pending'))
      .toHaveTextContent(/nowhere yet to put a vote/i);
  });

  test('there are no vote buttons to click', () => {
    // STRUCTURAL, not by test id. The old version asserted the absence of
    // `up-${id}` / `down-${id}`, which exist nowhere in the repo outside that
    // assertion — so it was asserting the absence of ids it had invented, and
    // would have stayed green against vote buttons under any other name.
    renderAt();
    CLOCK_OPTIONS.forEach((opt) => {
      const panel = screen.getByTestId(`option-${opt.id}`);
      expect(within(panel).queryAllByRole('button')).toHaveLength(0);
    });
  });

  test('the page contributes no second main landmark', () => {
    // index.jsx and the README both make this load-bearing: the page renders a
    // fragment because Programming supplies the <main>. Nothing pinned it, so
    // re-adding one inside Clock would have kept every test green.
    renderAt();
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});
