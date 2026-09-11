/* eslint-env jest */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Learn from '.';

/*
 * The drill is generated, so these tests avoid asserting on any particular
 * question. They assert on the thing that must hold for every question: you
 * commit an answer, and only then does the truth appear.
 */
const renderAt = (path) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/learn/*" element={<Learn />} />
    </Routes>
  </MemoryRouter>,
);

test('the course index renders', () => {
  renderAt('/learn');
  expect(screen.getByText('Seximal')).toBeInTheDocument();
});

test('the seximal level list renders every level', () => {
  renderAt('/learn/seximal');
  expect(screen.getByText(/1\. Counting & names/)).toBeInTheDocument();
  expect(screen.getByText(/5\. Complements & chains/)).toBeInTheDocument();
});

const start = () => fireEvent.click(screen.getByRole('button', { name: /^Start/ }));

test('a level teaches before it asks anything', () => {
  renderAt('/learn/seximal/1');

  // The lesson, not a question.
  expect(screen.getByRole('heading', { name: 'Counting & names' })).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

  start();
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

test('a drill asks before it tells, then tells', () => {
  renderAt('/learn/seximal/1');
  start();

  // Nothing is revealed until an answer is committed.
  expect(screen.queryByText('No.')).not.toBeInTheDocument();
  expect(screen.queryByText('Yes.')).not.toBeInTheDocument();

  // "999" is not a valid base-six numeral and matches no name, so it is
  // reliably wrong whatever question came up.
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '999' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));

  expect(screen.getByText('No.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
});

test('"show me" gives up and reveals, without pretending it was right', () => {
  renderAt('/learn/seximal/3');
  start();

  fireEvent.click(screen.getByRole('button', { name: 'show me' }));

  expect(screen.getByText('No.')).toBeInTheDocument();
});

describe('seximal search', () => {
  test('the seximal page finds a named number and links the level that teaches it', () => {
    const { container } = renderAt('/learn/seximal');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'dozen' },
    });
    expect(screen.getByText('dozen', { selector: '.tp__word' })).toBeInTheDocument();
    expect(screen.getByText('20₆ · 12 in decimal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Level 1' })).toHaveAttribute('href', '/learn/seximal/1');
    // Level 4 is listed because its summary says "dozen-scale". The drills of
    // every level use dozen, so "used here" on Level 4 alone would mislead.
    expect(container.querySelector('.tp__search-levels'))
      .toHaveTextContent('Level 1 (taught here) · Level 4 (mentioned here)');
  });

  test('a topic result links straight to its level', () => {
    renderAt('/learn/seximal');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'carry' },
    });
    expect(screen.getByRole('link', { name: 'Level 3: Adding & subtracting' }))
      .toHaveAttribute('href', '/learn/seximal/3');
  });

  test('/learn searches both courses at once, grouped by course', () => {
    renderAt('/learn');
    fireEvent.change(screen.getByRole('textbox', { name: /search both courses/i }), {
      target: { value: '20' },
    });
    // toki pona: mute is twenty. seximal: 20₆ is a dozen.
    expect(screen.getByText('mute', { selector: '.tp__word' })).toBeInTheDocument();
    expect(screen.getByText('dozen', { selector: '.tp__word' })).toBeInTheDocument();
    expect(screen.getByText('toki pona', { selector: '.learn__search-course' })).toBeInTheDocument();
    expect(screen.getByText('seximal', { selector: '.learn__search-course' })).toBeInTheDocument();
  });

  test('/learn says "No match" once, not once per course', () => {
    renderAt('/learn');
    fireEvent.change(screen.getByRole('textbox', { name: /search both courses/i }), {
      target: { value: 'zzzzzz' },
    });
    expect(screen.getAllByText(/No match for "zzzzzz"/)).toHaveLength(1);
  });
});

test('an unknown level does not explode', () => {
  renderAt('/learn/seximal/99');
  expect(screen.getByText('No such level')).toBeInTheDocument();
});

describe('toki pona', () => {
  test('the level list renders and states its house style', () => {
    renderAt('/learn/toki-pona');
    expect(screen.getByRole('heading', { level: 1, name: 'toki pona' })).toBeInTheDocument();
    expect(screen.getByText(/e marks noun objects/)).toBeInTheDocument();
  });

  test('a level teaches the twelve words and its rule before drilling', () => {
    renderAt('/learn/toki-pona/1');

    expect(screen.getByRole('heading', { name: /The first twelve/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The new grammar: li' })).toBeInTheDocument();
    expect(screen.getByText('mi')).toBeInTheDocument();
    expect(screen.getByText('mun')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    start();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('the search box finds a word by English gloss ("five" -> luka) and links its lesson', () => {
    renderAt('/learn/toki-pona');
    const box = screen.getByRole('textbox', { name: /search/i });

    fireEvent.change(box, { target: { value: 'five' } });

    expect(screen.getByText('luka', { selector: '.tp__word' })).toBeInTheDocument();
    expect(screen.getByText('hand · arm (& five)')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Level 7/ });
    expect(link).toHaveAttribute('href', '/learn/toki-pona/7');
  });

  test('the same search box finds it by "hand" too', () => {
    renderAt('/learn/toki-pona');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'hand' },
    });
    expect(screen.getByText('luka', { selector: '.tp__word' })).toBeInTheDocument();
  });

  test('a query matching nothing says so, not silence', () => {
    renderAt('/learn/toki-pona');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'zzzzzz' },
    });
    expect(screen.getByText(/No match for "zzzzzz"/)).toBeInTheDocument();
  });

  test('a translation item is self-graded — you say whether you had it', () => {
    renderAt('/learn/toki-pona/2');
    start();

    // Walk to the first self-graded item; the session order is shuffled.
    let guard = 0;
    while (!screen.queryByText('into English') && !screen.queryByText('into toki pona')
      && !screen.queryByText('decode it') && guard < 40) {
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      guard += 1;
    }

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    // No verdict is asserted for us — we are asked instead.
    expect(screen.queryByText('No.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'I had it' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "I didn't" })).toBeInTheDocument();
  });
});
