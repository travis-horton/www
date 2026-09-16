/* eslint-env jest */
/*
 * TokiPonaHome had NO test file at all, which is why /learn/toki-pona could go
 * blank in production while all 168 Learn tests stayed green. search.js is
 * well covered as a MODULE; the page that mounts it was covered by nothing.
 *
 * The first test here is the one that matters: mount the page. A component
 * that throws during render takes the whole route down and shows a blank
 * screen, and no amount of unit-testing the helpers underneath will catch it.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import TokiPonaHome from './TokiPonaHome';

const mount = () => render(
  <MemoryRouter initialEntries={['/learn/toki-pona']}>
    <TokiPonaHome />
  </MemoryRouter>,
);

beforeEach(() => {
  window.localStorage.clear();
});

test('the page renders at all', () => {
  expect(() => mount()).not.toThrow();
});

test('it renders the lesson list and the search box', () => {
  mount();
  expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
});

/*
 * Every one of these is a key that exists on Object.prototype. search.js keeps
 * its indexes in plain `{}` objects, so a lookup for one of these returns an
 * inherited Function rather than undefined — and `(FUNC || []).forEach` throws
 * "forEach is not a function", which unmounts the page.
 *
 * A user typing "constructor" into a search box is not hypothetical; it is
 * exactly what someone learning a programming-adjacent vocabulary does.
 */
const PROTO_KEYS = [
  'constructor',
  'toString',
  'valueOf',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  '__proto__',
  '__defineGetter__',
];

describe('prototype keys must not crash the page', () => {
  PROTO_KEYS.forEach((key) => {
    test(`typing "${key}" does not throw`, () => {
      mount();
      const box = screen.getByLabelText(/search/i);
      expect(() => fireEvent.change(box, { target: { value: key } })).not.toThrow();
    });
  });

  test('a prototype key reports no match rather than exploding', () => {
    mount();
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'constructor' },
    });
    expect(screen.getByText(/No match for "constructor"/)).toBeInTheDocument();
  });
});
