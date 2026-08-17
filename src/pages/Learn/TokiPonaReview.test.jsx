/* eslint-env jest */
/*
 * The review screens. Same discipline as index.test.jsx: the questions are
 * generated, so nothing here asserts on a particular one — only on the thing
 * that must hold for all of them, which is that you commit an answer before
 * the truth appears.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Learn from '.';
import { recordSession } from './progress';

const renderAt = (path) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/learn/*" element={<Learn />} />
    </Routes>
  </MemoryRouter>,
);

beforeEach(() => {
  window.localStorage.clear();
});

test('the toki pona home offers review', () => {
  renderAt('/learn/toki-pona');
  const link = screen.getByRole('link', { name: /Review — everything so far/ });
  expect(link).toHaveAttribute('href', '/learn/toki-pona/review');
});

test('/review is the review, not a level called "review"', () => {
  renderAt('/learn/toki-pona/review');
  expect(screen.getByRole('heading', { level: 1, name: 'Review' })).toBeInTheDocument();
  expect(screen.queryByText('No such level')).not.toBeInTheDocument();
});

test('it says what it is drawing from before it asks anything', () => {
  recordSession({
    course: 'toki-pona', levelId: '2', total: 27, correct: 25, misses: [],
  });
  renderAt('/learn/toki-pona/review');

  expect(screen.getByText(/24 words from/)).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('it asks before it tells, then tells', () => {
  renderAt('/learn/toki-pona/review');
  fireEvent.click(screen.getByRole('button', { name: /^Start/ }));

  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.queryByText('No.')).not.toBeInTheDocument();
  expect(screen.queryByText('Yes.')).not.toBeInTheDocument();

  // Not a toki pona word, not an English gloss: reliably wrong whatever came up.
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzz' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));

  expect(screen.getByText('No.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
});

test('a whole session runs to a score and can be run again', () => {
  renderAt('/learn/toki-pona/review');
  fireEvent.click(screen.getByRole('button', { name: /^Start/ }));

  for (let i = 0; i < 12; i += 1) {
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  }

  expect(screen.getByRole('heading', { name: '0 / 12' })).toBeInTheDocument();
  expect(screen.getByText('These come back weighted next time:')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Again' }));
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

test('a corrupt progress store still gives you a session', () => {
  window.localStorage.setItem('travish.learn.v1', 'not json at all');
  renderAt('/learn/toki-pona/review');
  fireEvent.click(screen.getByRole('button', { name: /^Start/ }));
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});
