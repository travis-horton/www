/* eslint-env jest */
/*
 * Guards the content, not the UI. The glyphs are private-use codepoints taken
 * from the linku API — a typo in one is invisible on screen (it renders as a
 * box, or worse, as the wrong word's glyph) so it has to be caught here.
 */

import {
  buildSession, getLevel, GLYPHS, isCorrect, LEVELS, SELF_GRADED, taughtIn, toGlyphs,
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

describe('the numbers lesson brings luka back as five', () => {
  /*
   * luka is word 79, taught in Level 7 as the hand. It is ALSO five, and the
   * counting system Level 9 teaches cannot be used without it — for a while
   * Level 9's blurb promised numbers "stack from there" and never supplied
   * the five to stack with (Praxis leaf 9a1c55da). Ruling, 26.0904: option 1
   * — re-introduce luka in the numbers lesson, state the additive rule
   * (luka 5 · mute 20 · ale 100), fix the blurb, and say the stance out loud.
   * `again` cards are how a level does that without teaching a word twice.
   */
  const level9 = getLevel('9');

  test('luka, mute and ale come back as the number cards', () => {
    expect(level9.again.map((v) => v.word)).toEqual(['luka', 'mute', 'ale']);
  });

  test('an again card points back at an earlier level, never at its own', () => {
    LEVELS.forEach((level) => {
      (level.again || []).forEach((v) => {
        const from = taughtIn(v.word);
        expect(`${v.word}:${from && from.id}`).not.toBe(`${v.word}:null`);
        expect(Number(from.id)).toBeLessThan(Number(level.id));
        expect(level.vocab.map((w) => w.word)).not.toContain(v.word);
        expect(v.glyph).toBe(GLYPHS[v.word]);
      });
    });
  });

  test('the again cards are drilled, on top of the full exercise set', () => {
    const session = buildSession(level9);
    expect(session).toHaveLength(27 + level9.again.length);
    const luka = session.find((i) => i.kind === 'word' && i.prompt === 'luka');
    expect(luka.accepted).toContain('five');
  });

  test('the blurb no longer promises a stack it does not supply', () => {
    expect(level9.blurb).not.toMatch(/stop at two/);
    expect(level9.blurb).toMatch(/luka/);
  });

  test('the stance on the number system is stated in the lesson copy', () => {
    expect(level9.vocabNote).toMatch(/luka 5 · mute 20 · ale 100/);
    expect(level9.vocabNote).toMatch(/pu/);
  });

  test('the sentences drill luka as a number, stacked', () => {
    const sentences = [
      ...level9.toEnglish.map(([tp]) => tp),
      ...level9.toTokiPona.map(([, tp]) => tp),
    ];
    expect(sentences.some((s) => s.split(/\s+/).includes('luka'))).toBe(true);
    expect(sentences.some((s) => s.includes('luka tu'))).toBe(true);
  });

  test('taughtIn finds the first teaching and misses with null', () => {
    expect(taughtIn('luka').id).toBe('7');
    expect(taughtIn('zzz')).toBeNull();
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
