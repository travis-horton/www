/* eslint-env jest */
/*
 * The transfer panel. transfer.test.js already guards the merge and the
 * parsing; what is left for the UI is the promise the logic cannot keep on its
 * own — that you are TOLD what the button will do before you press it, and
 * that a bad paste says so on screen instead of failing quietly.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Learn from '.';
import { exportCode } from './transfer';
import { load, recordSession } from './progress';

const KEY = 'travish.learn.v1';

const renderLearn = () =>
  render(
    <MemoryRouter initialEntries={['/learn']}>
      <Routes>
        <Route path="/learn/*" element={<Learn />} />
      </Routes>
    </MemoryRouter>,
  );

const openPanel = () =>
  fireEvent.click(
    screen.getByRole('button', { name: 'Move progress between devices' }),
  );

const pasteInto = (text) =>
  fireEvent.change(
    screen.getByRole('textbox', {
      name: /a code copied from the other device/,
    }),
    { target: { value: text } },
  );

const run = (over) => ({
  course: 'toki-pona',
  levelId: '1',
  total: 12,
  correct: 9,
  ...over,
});

beforeEach(() => {
  window.localStorage.clear();
});

test('the panel is offered on /learn and starts closed', () => {
  renderLearn();
  const toggle = screen.getByRole('button', {
    name: 'Move progress between devices',
  });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(
    screen.queryByRole('textbox', { name: /this device's record/ }),
  ).not.toBeInTheDocument();
});

test("opening it shows this device's code", () => {
  recordSession(run());
  renderLearn();
  openPanel();

  const box = screen.getByRole('textbox', { name: /this device's record/ });
  expect(box.value).toContain('travish.learn.progress');
  expect(JSON.parse(box.value).sessions).toHaveLength(1);
});

test('it says the merge is additive, with counts, BEFORE the button is pressed', () => {
  // A code from "the other device", carrying one session this one lacks.
  recordSession(run({ levelId: '4' }));
  const code = exportCode();
  window.localStorage.clear();
  recordSession(run({ levelId: '9' }));

  renderLearn();
  openPanel();
  pasteInto(code);

  expect(
    screen.getByText(/1 are new here, 0 this device already has/),
  ).toBeInTheDocument();
  expect(screen.getByText(/Nothing is removed/)).toBeInTheDocument();
  // The button repeats the number, so the count cannot be missed.
  expect(
    screen.getByRole('button', { name: 'Add 1 sessions to this device' }),
  ).toBeInTheDocument();
});

test('pressing it merges, and keeps what was already here', () => {
  recordSession(run({ levelId: '4' }));
  const code = exportCode();
  window.localStorage.clear();
  recordSession(run({ levelId: '9' }));

  renderLearn();
  openPanel();
  pasteInto(code);
  fireEvent.click(
    screen.getByRole('button', { name: 'Add 1 sessions to this device' }),
  );

  expect(
    screen.getByText(/Done — 1 added, 2 sessions on this device now/),
  ).toBeInTheDocument();
  const levels = load()
    .sessions.map((s) => s.levelId)
    .sort();
  expect(levels).toEqual(['4', '9']);
});

test('a corrupt paste shows the reason and cannot be committed', () => {
  recordSession(run());
  const before = window.localStorage.getItem(KEY);

  renderLearn();
  openPanel();
  pasteInto('{"nope":');

  expect(
    screen.getByText(/did not parse as a progress code/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Add to this device' }),
  ).toBeDisabled();
  expect(window.localStorage.getItem(KEY)).toBe(before);
});

test('a code from a newer version is refused on screen', () => {
  recordSession(run());
  const payload = JSON.parse(exportCode());
  payload.version = 99;

  renderLearn();
  openPanel();
  pasteInto(JSON.stringify(payload));

  expect(screen.getByText(/came from a newer version/)).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Add to this device' }),
  ).toBeDisabled();
});

test('a code with nothing new in it cannot be pressed either', () => {
  recordSession(run());
  const code = exportCode();

  renderLearn();
  openPanel();
  pasteInto(code);

  expect(
    screen.getByText(/0 are new here, 1 this device already has/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Add 0 sessions to this device' }),
  ).toBeDisabled();
});

test('the panel says out loud that it is temporary', () => {
  renderLearn();
  openPanel();
  expect(screen.getByText(/When \/learn gets a backend/)).toBeInTheDocument();
});
