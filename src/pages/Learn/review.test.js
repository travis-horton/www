/* eslint-env jest */
/*
 * Guards review mode's two promises: it only ever asks about words you have
 * actually met, and it never runs out. Both are properties of every generated
 * session rather than of any particular question, so nothing here asserts on a
 * specific prompt — the same discipline as the seximal drill tests.
 */

import { LEVELS } from './tokipona';
import {
  buildReviewSession, clampLevels, defaultLevelsKnown, glossParts, isCorrect,
  knownVocab, missTally, REVIEW_KINDS, SESSION_LENGTH, weightFor,
} from './review';
import { levelsReached, recordSession, weakWords } from './progress';

const KEY = 'travish.learn.v1';

const wordsIn = (n) => LEVELS.slice(0, n).flatMap((l) => l.vocab.map((v) => v.word));

beforeEach(() => {
  window.localStorage.clear();
});

describe('the pool', () => {
  test('level 1 only draws on level 1', () => {
    const pool = knownVocab(1).map((v) => v.word);
    expect(pool.sort()).toEqual(wordsIn(1).sort());
  });

  test('it is cumulative, not just the newest level', () => {
    const pool = knownVocab(2).map((v) => v.word);
    wordsIn(2).forEach((w) => expect(pool).toContain(w));
    expect(pool.length).toBe(wordsIn(2).length);
  });

  test('a session never asks about a level you have not reached', () => {
    const allowed = new Set(wordsIn(1));
    const later = new Set(wordsIn(LEVELS.length).filter((w) => !allowed.has(w)));
    expect(later.size).toBeGreaterThan(0); // the test would be vacuous otherwise

    const session = buildReviewSession(1, { count: 200 });
    session.forEach((item) => {
      expect(allowed.has(item.word)).toBe(true);
      expect(later.has(item.word)).toBe(false);
    });
  });

  test('asking for more levels than exist is harmless', () => {
    expect(clampLevels(99)).toBe(LEVELS.length);
    expect(clampLevels(-4)).toBe(0);
    expect(clampLevels('nonsense')).toBe(LEVELS.length);
    expect(clampLevels(undefined)).toBe(LEVELS.length);
  });
});

describe('endlessness', () => {
  test('it produces as many questions as asked for, far past the vocabulary', () => {
    const pool = knownVocab(1);
    const session = buildReviewSession(1, { count: 500 });
    expect(session).toHaveLength(500);
    expect(session.length).toBeGreaterThan(pool.length * REVIEW_KINDS.length);
  });

  test('a hundred consecutive sessions all come out full and well-formed', () => {
    for (let i = 0; i < 100; i += 1) {
      const session = buildReviewSession(LEVELS.length);
      expect(session).toHaveLength(SESSION_LENGTH);
      session.forEach((item) => {
        expect(REVIEW_KINDS).toContain(item.kind);
        expect(typeof item.prompt).toBe('string');
        expect(item.prompt.length).toBeGreaterThan(0);
        expect(item.accepted.length).toBeGreaterThan(0);
      });
    }
  });

  test('an empty pool yields an empty session rather than spinning forever', () => {
    expect(buildReviewSession(0)).toEqual([]);
    expect(buildReviewSession(1, { count: 0 })).toEqual([]);
  });
});

describe('directions', () => {
  test('all three appear in every session of at least three questions', () => {
    for (let i = 0; i < 50; i += 1) {
      const kinds = new Set(buildReviewSession(1, { count: 3 }).map((it) => it.kind));
      expect([...kinds].sort()).toEqual([...REVIEW_KINDS].sort());
    }
  });

  test('glyph -> word shows the glyph and wants the word', () => {
    const item = buildReviewSession(1, { count: 60 }).find((it) => it.kind === 'glyph');
    expect(item.promptIsGlyph).toBe(true);
    expect(item.prompt.codePointAt(0)).toBeGreaterThanOrEqual(0xf1900);
    expect(isCorrect(item, item.answer)).toBe(true);
  });

  test('word -> meaning accepts any listed gloss', () => {
    const item = buildReviewSession(1, { count: 60 }).find((it) => it.kind === 'word');
    glossParts(item.answer).forEach((gloss) => {
      expect(isCorrect(item, gloss)).toBe(true);
    });
    expect(isCorrect(item, 'certainly not a gloss')).toBe(false);
  });

  test('meaning -> word is the reverse: a gloss in, the toki pona word out', () => {
    const item = buildReviewSession(1, { count: 60 }).find((it) => it.kind === 'meaning');
    const known = knownVocab(1);
    // The prompt is a meaning, not a word.
    expect(known.some((v) => v.word === item.prompt)).toBe(false);
    // And the word it belongs to is accepted, whatever case you type it in.
    expect(isCorrect(item, item.word)).toBe(true);
    expect(isCorrect(item, item.word.toUpperCase())).toBe(true);
    expect(isCorrect(item, '')).toBe(false);
  });

  test('a gloss shared by two words accepts either of them', () => {
    // Nothing in levels 1-2 collides today, so the property is checked on the
    // rule rather than on a word: every accepted answer for a meaning item is
    // a word that really does carry the prompted gloss.
    const pool = knownVocab(LEVELS.length);
    buildReviewSession(LEVELS.length, { count: 120 })
      .filter((it) => it.kind === 'meaning')
      .forEach((item) => {
        item.accepted.forEach((word) => {
          const entry = pool.find((v) => v.word === word);
          expect(entry).toBeDefined();
          const glosses = glossParts(entry.gloss).map((g) => g.toLowerCase());
          expect(glosses).toContain(item.prompt.toLowerCase());
        });
      });
  });
});

describe('weighting toward what is going wrong', () => {
  test('a missed word weighs more, with a cap', () => {
    expect(weightFor('telo', {})).toBe(1);
    expect(weightFor('telo', { telo: 2 })).toBeGreaterThan(weightFor('telo', { telo: 1 }));
    expect(weightFor('telo', { telo: 40 })).toBe(weightFor('telo', { telo: 4 }));
  });

  test('the weight actually moves the sampling', () => {
    const misses = { telo: 4 };
    const session = buildReviewSession(1, { count: 600, misses });
    const teloShare = session.filter((it) => it.word === 'telo').length / session.length;
    // Even weighting over twelve words would be ~8%; telo is weighted 7x.
    expect(teloShare).toBeGreaterThan(0.15);
  });

  test('it reads the per-word miss record written by a session', () => {
    recordSession({
      course: 'toki-pona',
      levelId: 'review',
      total: 12,
      correct: 10,
      misses: ['meaning', 'glyph'],
      missedWords: ['kili', 'kili'],
    });
    expect(weakWords('toki-pona')).toEqual([{ word: 'kili', count: 2 }]);
    expect(missTally()).toEqual({ kili: 2 });
  });
});

describe('how far the learner has got', () => {
  test('no history means level 1, not zero and not everything', () => {
    expect(levelsReached('toki-pona')).toBe(0);
    expect(defaultLevelsKnown()).toBe(1);
  });

  test('a drilled level joins the pool', () => {
    recordSession({
      course: 'toki-pona', levelId: '2', total: 27, correct: 20, misses: [],
    });
    expect(levelsReached('toki-pona')).toBe(2);
    expect(defaultLevelsKnown()).toBe(2);
  });

  test('review sessions are not levels and never inflate the range', () => {
    recordSession({
      course: 'toki-pona', levelId: '1', total: 27, correct: 27, misses: [],
    });
    recordSession({
      course: 'toki-pona', levelId: 'review', total: 12, correct: 12, misses: [],
    });
    expect(levelsReached('toki-pona')).toBe(1);
  });

  test('another course does not count', () => {
    recordSession({
      course: 'seximal', levelId: '5', total: 12, correct: 12, misses: [],
    });
    expect(levelsReached('toki-pona')).toBe(0);
  });
});

describe('a broken or absent store degrades, it does not throw', () => {
  const survives = () => {
    expect(() => levelsReached('toki-pona')).not.toThrow();
    expect(() => weakWords('toki-pona')).not.toThrow();
    expect(() => missTally()).not.toThrow();
    expect(defaultLevelsKnown()).toBeGreaterThanOrEqual(1);
    expect(buildReviewSession(defaultLevelsKnown())).toHaveLength(SESSION_LENGTH);
  };

  test('absent', () => {
    window.localStorage.removeItem(KEY);
    survives();
  });

  test('not even JSON', () => {
    window.localStorage.setItem(KEY, '{ this is not json');
    survives();
  });

  test('JSON of the wrong shape', () => {
    window.localStorage.setItem(KEY, '"a string"');
    survives();
    window.localStorage.setItem(KEY, '{"sessions":"not an array"}');
    survives();
  });

  test('sessions from an older version, with no per-word record', () => {
    window.localStorage.setItem(KEY, JSON.stringify({
      sessions: [
        {
          course: 'toki-pona', levelId: '1', total: 27, correct: 21, misses: ['word'],
        },
        {
          course: 'toki-pona', levelId: '2', total: 27, correct: 24, misses: ['glyph'],
        },
      ],
    }));
    expect(weakWords('toki-pona')).toEqual([]);
    expect(missTally()).toEqual({});
    expect(defaultLevelsKnown()).toBe(2);
    survives();
  });

  test('sessions full of junk', () => {
    window.localStorage.setItem(KEY, JSON.stringify({
      sessions: [null, 7, { course: 'toki-pona', levelId: {}, missedWords: [null, 3, ''] }],
    }));
    survives();
  });

  test('and a session still records after all that', () => {
    window.localStorage.setItem(KEY, 'garbage');
    recordSession({
      course: 'toki-pona', levelId: 'review', total: 12, correct: 11, missedWords: ['mun'],
    });
    expect(weakWords('toki-pona')).toEqual([{ word: 'mun', count: 1 }]);
  });
});
