/* eslint-env jest */
/*
 * The three miss tallies, and the one property all of them share: a session
 * recorded before the field existed must never break the reader that came
 * after it. /learn's whole record is one append-only localStorage array with
 * no migration story, so every reader has to tolerate the shape of every
 * session ever written — that is the rule these tests exist to hold.
 */

import {
  recordSession, weakKinds, weakRules, weakWords,
} from './progress';

beforeEach(() => {
  window.localStorage.clear();
});

describe('weakRules', () => {
  test('tallies rule ids across sessions, commonest first', () => {
    recordSession({
      course: 'toki-pona',
      levelId: '4',
      total: 27,
      correct: 25,
      misses: ['en-tp', 'en-tp'],
      missedRules: ['no-e-after-preverb', 'li-after-noun-subject'],
    });
    recordSession({
      course: 'toki-pona',
      levelId: '5',
      total: 27,
      correct: 26,
      misses: ['en-tp'],
      missedRules: ['no-e-after-preverb'],
    });

    expect(weakRules('toki-pona')).toEqual([
      { rule: 'no-e-after-preverb', count: 2 },
      { rule: 'li-after-noun-subject', count: 1 },
    ]);
  });

  test('the coach line the kind tally could not say', () => {
    recordSession({
      course: 'toki-pona',
      levelId: '4',
      total: 27,
      correct: 25,
      misses: ['en-tp', 'en-tp'],
      missedRules: ['no-e-after-preverb', 'no-e-after-preverb'],
    });

    // Same two misses, read two ways. One says which tab to click; the other
    // says what he actually did wrong, which is the whole point.
    expect(weakKinds('toki-pona')).toEqual([{ kind: 'en-tp', count: 2 }]);
    expect(weakRules('toki-pona')).toEqual([{ rule: 'no-e-after-preverb', count: 2 }]);
  });

  test('a session from before the field existed contributes nothing, and throws nothing', () => {
    recordSession({
      course: 'toki-pona', levelId: '1', total: 27, correct: 20, misses: ['glyph'],
    });
    expect(weakRules('toki-pona')).toEqual([]);
    expect(weakKinds('toki-pona')).toEqual([{ kind: 'glyph', count: 1 }]);
  });

  test('junk in the array is skipped rather than tallied', () => {
    recordSession({
      course: 'toki-pona',
      levelId: '1',
      total: 27,
      correct: 26,
      missedRules: ['', null, 7, 'ala-negates'],
    });
    expect(weakRules('toki-pona')).toEqual([{ rule: 'ala-negates', count: 1 }]);
  });

  test('courses do not bleed into each other', () => {
    recordSession({
      course: 'seximal', levelId: '1', total: 10, correct: 9, missedRules: ['no-e-after-preverb'],
    });
    expect(weakRules('toki-pona')).toEqual([]);
    expect(weakRules('seximal')).toEqual([{ rule: 'no-e-after-preverb', count: 1 }]);
  });

  test('only the recent tail counts, so a fixed habit stops being reported', () => {
    recordSession({
      course: 'toki-pona', levelId: '1', total: 27, correct: 26, missedRules: ['ala-negates'],
    });
    for (let i = 0; i < 20; i += 1) {
      recordSession({
        course: 'toki-pona', levelId: '2', total: 27, correct: 27, missedRules: [],
      });
    }
    expect(weakRules('toki-pona')).toEqual([]);
  });

  test('it is a third reader over the same sessions, not a replacement', () => {
    recordSession({
      course: 'toki-pona',
      levelId: 'review',
      total: 12,
      correct: 10,
      misses: ['meaning', 'glyph'],
      missedWords: ['telo', 'ijo'],
      missedRules: [],
    });
    expect(weakWords('toki-pona')).toEqual([
      { word: 'telo', count: 1 },
      { word: 'ijo', count: 1 },
    ]);
    expect(weakKinds('toki-pona')).toHaveLength(2);
    expect(weakRules('toki-pona')).toEqual([]);
  });
});
