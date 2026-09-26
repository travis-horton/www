import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Learn from '.';
import { recordSession } from './progress';
import { fromDigits, seximalName, toDigits } from './seximal';
import { GLYPHS } from './tokipona';

/*
 * The drill is generated, so these tests avoid asserting on any particular
 * question. They assert on the thing that must hold for every question: you
 * commit an answer, and only then does the truth appear.
 */
const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn/*" element={<Learn />} />
      </Routes>
    </MemoryRouter>,
  );

test('an unknown course path renders the 404 inside the one <main>', () => {
  const { container } = renderAt('/learn/made-up');
  expect(screen.getByText('hm, nothing here')).toBeInTheDocument();
  expect(container.querySelectorAll('main')).toHaveLength(1);
});

test('the course index renders', () => {
  renderAt('/learn');
  expect(screen.getByText('Seximal')).toBeInTheDocument();
});

test('the seximal level list renders every level', () => {
  renderAt('/learn/seximal');
  expect(screen.getByText(/1\. Counting & names/)).toBeInTheDocument();
  expect(screen.getByText(/5\. Complements & chains/)).toBeInTheDocument();
});

const start = () =>
  fireEvent.click(screen.getByRole('button', { name: /^Start/ }));

test('a level teaches before it asks anything', () => {
  renderAt('/learn/seximal/1');

  // The lesson, not a question.
  expect(
    screen.getByRole('heading', { name: 'Counting & names' }),
  ).toBeInTheDocument();
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
    expect(
      screen.getByText('dozen', { selector: '.tp__word' }),
    ).toBeInTheDocument();
    expect(screen.getByText('20₆ · 12 in decimal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Level 1' })).toHaveAttribute(
      'href',
      '/learn/seximal/1',
    );
    // Level 4 is listed because its summary says "dozen-scale". The drills of
    // every level use dozen, so "used here" on Level 4 alone would mislead —
    // where it is drilled is the second line, below.
    expect(container.querySelector('.tp__search-levels')).toHaveTextContent(
      'Level 1 (taught here) · Level 4 (mentioned here)',
    );
  });

  test('a word every level drills says so in one line instead of listing five', () => {
    const { container } = renderAt('/learn/seximal');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'dozen' },
    });
    const lines = container.querySelectorAll('.tp__search-levels');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toHaveTextContent('drilled in every level');
  });

  test('"nif" names the two levels that drill it without saying so, and links them', () => {
    const { container } = renderAt('/learn/seximal');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'nif' },
    });
    const lines = container.querySelectorAll('.tp__search-levels');
    expect(lines[0]).toHaveTextContent(
      'Level 2 (taught here) · Level 5 (mentioned here)',
    );
    expect(lines[1]).toHaveTextContent('also drilled in: Level 3 · Level 4');
    expect(screen.getByRole('link', { name: 'Level 3' })).toHaveAttribute(
      'href',
      '/learn/seximal/3',
    );
  });

  test('a word with nothing to add gets no second line', () => {
    const { container } = renderAt('/learn/seximal');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'unexian' },
    });
    expect(container.querySelectorAll('.tp__search-levels')).toHaveLength(1);
  });

  test('a topic result links straight to its level', () => {
    renderAt('/learn/seximal');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'carry' },
    });
    expect(
      screen.getByRole('link', { name: 'Level 3: Adding & subtracting' }),
    ).toHaveAttribute('href', '/learn/seximal/3');
  });

  test('/learn searches both courses at once, grouped by course', () => {
    renderAt('/learn');
    fireEvent.change(
      screen.getByRole('textbox', { name: /search both courses/i }),
      {
        target: { value: '20' },
      },
    );
    // toki pona: mute is twenty. seximal: 20₆ is a dozen.
    expect(
      screen.getByText('mute', { selector: '.tp__word' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('dozen', { selector: '.tp__word' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('toki pona', { selector: '.learn__search-course' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('seximal', { selector: '.learn__search-course' }),
    ).toBeInTheDocument();
  });

  test('/learn says "No match" once, not once per course', () => {
    renderAt('/learn');
    fireEvent.change(
      screen.getByRole('textbox', { name: /search both courses/i }),
      {
        target: { value: 'zzzzzz' },
      },
    );
    expect(screen.getAllByText(/No match for "zzzzzz"/)).toHaveLength(1);
  });
});

test('an unknown level does not explode', () => {
  renderAt('/learn/seximal/99');
  expect(screen.getByText('No such level')).toBeInTheDocument();
});

/*
 * "read the lesson again" on the DONE screen used to keep the finished
 * session's position and results. Start then resumed on the LAST question, and
 * answering it recorded a session of 13 out of a dozen. Both drills had it.
 */
describe('"read the lesson again" starts a fresh session', () => {
  const lastSession = () => {
    const { sessions } = JSON.parse(
      window.localStorage.getItem('travish.learn.v1'),
    );
    return sessions[sessions.length - 1];
  };

  // Gives up on every question until the DONE screen shows `doneButton`.
  const finishDrill = (doneButton) => {
    let guard = 0;
    while (!screen.queryByRole('button', { name: doneButton }) && guard < 60) {
      const giveUp = screen.queryByRole('button', { name: 'show me' });
      if (giveUp) fireEvent.click(giveUp);
      else fireEvent.click(screen.getByRole('button', { name: 'Check' }));
      fireEvent.click(
        screen.queryByRole('button', { name: 'Next' }) ||
          screen.getByRole('button', { name: "I didn't" }),
      );
      guard += 1;
    }
  };

  test('seximal', () => {
    window.localStorage.clear();
    renderAt('/learn/seximal/1');
    start();
    finishDrill('Another dozen');
    expect(lastSession().total).toBe(12);

    fireEvent.click(
      screen.getByRole('button', { name: 'read the lesson again' }),
    );
    start();
    expect(screen.getByText(/· 1 of 12$/)).toBeInTheDocument();

    finishDrill('Another dozen');
    expect(lastSession().total).toBe(12);
  });

  test('toki pona', () => {
    window.localStorage.clear();
    renderAt('/learn/toki-pona/1');
    start();
    const total = Number(
      screen.getByText(/^Level 1 · 1 of \d+$/).textContent.split(' of ')[1],
    );
    finishDrill('Again');
    expect(lastSession().total).toBe(total);

    fireEvent.click(
      screen.getByRole('button', { name: 'read the lesson again' }),
    );
    start();
    expect(screen.getByText(`Level 1 · 1 of ${total}`)).toBeInTheDocument();

    finishDrill('Again');
    expect(lastSession().total).toBe(total);
  });
});

/*
 * The seximal lessons are prose about an engine that lives next door. Where a
 * lesson states a fact the engine also computes, the two are checked against
 * each other here, so the copy cannot drift from what the drill will accept.
 */
describe('the seximal lessons agree with the engine', () => {
  test('Lesson Two says "an unexian", not "a unexian"', () => {
    const { container } = renderAt('/learn/seximal/2');
    expect(container.textContent).toMatch(/is an unexian/);
    expect(container.textContent).not.toMatch(/is a unexian/);
  });

  test('Lesson Two works the unexian example the engine names', () => {
    // The spec's own worked example, pinned in seximal.test.js — the lesson
    // must say exactly what the drill will say.
    const spoken = seximalName(fromDigits('13132'));
    expect(spoken).toBe('one unexian, thirsy-one nif thirsy-two');
    const { container } = renderAt('/learn/seximal/2');
    expect(container.textContent).toContain(`13132 is ${spoken}`);
  });

  test('Lesson Four works a two-digit multiplication the engine agrees with', () => {
    // 23 in base six is fifteen; four of them is sixty, which is 140 in base six.
    const product = toDigits(fromDigits('23') * 4);
    expect(product).toBe('140');
    const { container } = renderAt('/learn/seximal/4');
    expect(container.textContent).toContain('carry at six');
    expect(container.textContent).toContain(`Answer ${product}`);
  });
});

describe('toki pona', () => {
  test('the level list renders and states its house style', () => {
    renderAt('/learn/toki-pona');
    expect(
      screen.getByRole('heading', { level: 1, name: 'toki pona' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/e marks noun objects/)).toBeInTheDocument();
  });

  test('a level teaches the twelve words and its rule before drilling', () => {
    renderAt('/learn/toki-pona/1');

    expect(
      screen.getByRole('heading', { name: /The first twelve/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'The new grammar: li' }),
    ).toBeInTheDocument();
    expect(screen.getByText('mi')).toBeInTheDocument();
    expect(screen.getByText('mun')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    start();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  /*
   * w14 #7. A level's rule.particle doubles as the heading label, and five of
   * the ten ("stacking modifiers", "preverbs", "prepositions", "asking
   * questions", "en, a, kin — and the phrasebook") are labels, not glyph keys.
   * Those levels rendered an empty glyph block above the rule.
   */
  test('the rule glyph renders only where the rule is a particle', () => {
    const li = renderAt('/learn/toki-pona/1');
    const glyph = li.container.querySelector('.tp__glyph--rule');
    expect(glyph).not.toBeNull();
    expect(glyph.textContent).toBe(GLYPHS.li);
    li.unmount();

    ['3', '4', '5', '7', '10'].forEach((id) => {
      const page = renderAt(`/learn/toki-pona/${id}`);
      const empty = page.container.querySelector('.tp__glyph--rule');
      expect(`${id}:${empty === null}`).toBe(`${id}:true`);
      page.unmount();
    });
  });

  test('the search box finds a word by English gloss ("five" -> luka) and links its lesson', () => {
    renderAt('/learn/toki-pona');
    const box = screen.getByRole('textbox', { name: /search/i });

    fireEvent.change(box, { target: { value: 'five' } });

    expect(
      screen.getByText('luka', { selector: '.tp__word' }),
    ).toBeInTheDocument();
    expect(screen.getByText('hand · arm (& five)')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Level 7/ });
    expect(link).toHaveAttribute('href', '/learn/toki-pona/7');
  });

  test('a level that only mentions a word in its prose says "mentioned", not "used"', () => {
    // search.js tags jan in Level 6 as 'mentioned' (its closingNote only).
    renderAt('/learn/toki-pona');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'jan' },
    });
    const levels = screen
      .getByText('jan', { selector: '.tp__word' })
      .closest('li')
      .querySelector('.tp__search-levels').textContent;
    expect(levels).toContain('Level 6 (mentioned here)');
    expect(levels).not.toContain('Level 6 (used here)');
  });

  test('the same search box finds it by "hand" too', () => {
    renderAt('/learn/toki-pona');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'hand' },
    });
    expect(
      screen.getByText('luka', { selector: '.tp__word' }),
    ).toBeInTheDocument();
  });

  test('a query matching nothing says so, not silence', () => {
    renderAt('/learn/toki-pona');
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'zzzzzz' },
    });
    expect(screen.getByText(/No match for "zzzzzz"/)).toBeInTheDocument();
  });

  /*
   * The session order is shuffled, so walk to the first item of the sub-kind
   * under test. Items passed on the way may be either sort — "Next" for a
   * machine-graded one, "I didn't" for a self-graded one — so take whichever
   * this question offers rather than assuming.
   */
  const walkTo = (...subs) => {
    let guard = 0;
    while (!subs.some((s) => screen.queryByText(s)) && guard < 40) {
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));
      const next =
        screen.queryByRole('button', { name: 'Next' }) ||
        screen.getByRole('button', { name: "I didn't" });
      fireEvent.click(next);
      guard += 1;
    }
    expect(guard).toBeLessThan(40);
  };

  test('translating INTO ENGLISH is self-graded — you say whether you had it', () => {
    renderAt('/learn/toki-pona/2');
    start();
    walkTo('into English', 'decode it');

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    // No verdict is asserted for us — we are asked instead.
    expect(screen.queryByText('No.')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'I had it' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: "I didn't" }),
    ).toBeInTheDocument();
  });

  /*
   * The other direction, and the reason this work exists. "mi wile telo" reads
   * close enough to "mi wile e telo" that a learner marking their own work
   * presses "I had it" — and dropping e is the actual, recorded weak spot. So
   * the machine marks it, and there is no button to forgive it with.
   */
  test('translating INTO TOKI PONA is machine-graded — the near-miss is marked wrong', () => {
    renderAt('/learn/toki-pona/2');
    start();
    walkTo('into toki pona');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'mi wile telo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText('No.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'I had it' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('a wrong sentence is told which rule it broke, right there', () => {
    renderAt('/learn/toki-pona/5');
    start();
    walkTo('into toki pona');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'nasa nasa nasa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    // Every level-5 production sentence turns on a preposition taking no e.
    expect(screen.getByText(/no e after a preposition/)).toBeInTheDocument();
  });

  /*
   * The end of a drill is the moment the weak list gets written down, and it
   * used to say "en-tp — 2", which names a tab in a lesson rather than a habit
   * to fix. Missing everything in level 5 must now name the rules: all three
   * of its production sentences turn on a preposition taking no e, and two of
   * them on li after a noun subject.
   */
  test('the DONE screen reports misses by rule, not by item kind', () => {
    window.localStorage.clear();
    // An earlier drill, so the standing list has something this one does not.
    recordSession({
      course: 'toki-pona',
      levelId: '4',
      total: 27,
      correct: 25,
      misses: ['en-tp', 'en-tp'],
      missedRules: ['no-e-after-preverb', 'no-e-after-preverb'],
    });

    renderAt('/learn/toki-pona/5');
    start();

    let guard = 0;
    while (!screen.queryByRole('button', { name: 'Again' }) && guard < 40) {
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));
      const next =
        screen.queryByRole('button', { name: 'Next' }) ||
        screen.getByRole('button', { name: "I didn't" });
      fireEvent.click(next);
      guard += 1;
    }

    expect(screen.getByText('Where it went wrong:')).toBeInTheDocument();
    // Twice over: once for this session, once in the standing list below it —
    // which is empty of everything else, because localStorage was cleared.
    expect(screen.getAllByText(/no e after a preposition — 3/)).toHaveLength(2);
    expect(screen.getAllByText(/li after a noun subject — 2/)).toHaveLength(2);
    // The old buckets are gone by name, but nothing that lacks a rule is lost:
    // glyph and word misses still land somewhere, under prose of their own.
    expect(screen.queryByText(/^en-tp/)).not.toBeInTheDocument();
    expect(screen.getByText(/reading glyphs — 6/)).toBeInTheDocument();

    // And the standing list, which is the thing worth copying into a tracker.
    // It is cumulative, not a restatement: the preverb rule was never touched
    // in this drill and is still on it, carried from the session recorded above.
    expect(
      screen.getByText('Your weak list, across recent sessions:'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no e between a preverb and its verb — 2/),
    ).toBeInTheDocument();
  });
});
