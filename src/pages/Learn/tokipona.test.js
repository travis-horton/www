/* eslint-env jest */
/*
 * Guards the content, not the UI. The glyphs are private-use codepoints taken
 * from the linku API — a typo in one is invisible on screen (it renders as a
 * box, or worse, as the wrong word's glyph) so it has to be caught here.
 */

import {
  buildSession, getLevel, GLYPHS, isCorrect, LEVELS, SELF_GRADED, toGlyphs,
} from './tokipona';

describe('glyphs', () => {
  test('every vocabulary word in every level has one', () => {
    LEVELS.forEach((level) => {
      level.vocab.forEach((v) => {
        expect(typeof v.glyph).toBe('string');
        expect(v.glyph.length).toBeGreaterThan(0);
      });
    });
  });

  test('they are UCSUR private-use codepoints, not latin text', () => {
    Object.entries(GLYPHS).forEach(([word, glyph]) => {
      const cp = glyph.codePointAt(0);
      expect(`${word}:${cp >= 0xf1900 && cp <= 0xf19ff}`).toBe(`${word}:true`);
    });
  });

  test('no two words share a glyph', () => {
    const seen = Object.values(GLYPHS);
    expect(new Set(seen).size).toBe(seen.length);
  });

  test('a sentence renders word by word', () => {
    expect(toGlyphs('mi olin e sina')).toBe(
      GLYPHS.mi + GLYPHS.olin + GLYPHS.e + GLYPHS.sina,
    );
  });

  test('every word used in a sentence has a glyph', () => {
    LEVELS.forEach((level) => {
      const sentences = [
        ...level.toEnglish.map(([tp]) => tp),
        ...level.toTokiPona.map(([, tp]) => tp),
        level.decode[0],
      ];
      sentences.forEach((s) => {
        s.split(/\s+/).forEach((token) => {
          const word = token.replace(/[.,!?;:"']/g, '');
          expect(`${word}:${Boolean(GLYPHS[word])}`).toBe(`${word}:true`);
        });
      });
    });
  });

  test('latin punctuation is stripped, not rendered as a glyph', () => {
    // sitelen pona has no question mark — seme is already the question.
    expect(toGlyphs('sina pilin seme?')).toBe(
      GLYPHS.sina + GLYPHS.pilin + GLYPHS.seme,
    );
    expect(toGlyphs('mi tawa!')).toBe(GLYPHS.mi + GLYPHS.tawa);
  });
});

describe('levels', () => {
  test('all ten are here, in order', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    );
  });

  test('each has twelve new words and one rule', () => {
    LEVELS.forEach((level) => {
      // Level 10 is the last eleven words — 119 of pu, not 120.
      expect(level.vocab).toHaveLength(level.id === '10' ? 11 : 12);
      expect(level.rule.particle).toBeTruthy();
    });
  });

  test('no word is taught twice', () => {
    const taught = LEVELS.flatMap((l) => l.vocab.map((v) => v.word));
    expect(new Set(taught).size).toBe(taught.length);
  });

  test('every level has the full exercise set', () => {
    LEVELS.forEach((level) => {
      expect(level.glyphReading).toHaveLength(6);
      expect(level.toEnglish).toHaveLength(5);
      expect(level.toTokiPona).toHaveLength(3);
      expect(level.decode).toHaveLength(2);
      expect(level.vocabNote).toBeTruthy();
      expect(level.closingNote).toBeTruthy();
    });
  });

  test('the glyph-reading exercise only uses words from that level', () => {
    LEVELS.forEach((level) => {
      const known = level.vocab.map((v) => v.word);
      level.glyphReading.forEach((w) => expect(known).toContain(w));
    });
  });

  test('getLevel finds and misses correctly', () => {
    expect(getLevel('1').title).toBe('The first twelve');
    expect(getLevel('99')).toBeNull();
  });
});

describe('sessions', () => {
  const session = buildSession(getLevel('2'));

  test('covers every exercise in the lesson', () => {
    // 6 glyph-readings + 12 words + 5 to-English + 3 to-toki-pona + 1 decode
    expect(session).toHaveLength(27);
  });

  test('sentence items are self-graded, word items are not', () => {
    session.forEach((item) => {
      if (item.kind === 'tp-en' || item.kind === 'en-tp') {
        expect(SELF_GRADED.has(item.kind)).toBe(true);
        expect(item.accepted).toBeUndefined();
      } else {
        expect(SELF_GRADED.has(item.kind)).toBe(false);
        expect(item.accepted.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('answer matching', () => {
  const glyphItem = { kind: 'glyph', accepted: ['telo'] };
  const wordItem = { kind: 'word', accepted: ['he', 'she', 'it', 'they'] };

  test('exact for glyph reading', () => {
    expect(isCorrect(glyphItem, 'telo')).toBe(true);
    expect(isCorrect(glyphItem, ' Telo ')).toBe(true);
    expect(isCorrect(glyphItem, 'tomo')).toBe(false);
  });

  test('any listed gloss counts', () => {
    expect(isCorrect(wordItem, 'she')).toBe(true);
    expect(isCorrect(wordItem, 'they')).toBe(true);
    expect(isCorrect(wordItem, 'we')).toBe(false);
  });

  test('empty is never right', () => {
    expect(isCorrect(wordItem, '   ')).toBe(false);
  });
});
