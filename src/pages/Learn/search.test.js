/* eslint-env jest */
/*
 * Guards the search INDEX, not the UI — same split as tokipona.test.js vs.
 * TokiPonaReview.test.jsx. Three directions in, one result shape out; see the
 * doc comment on search() in search.js for what each direction means.
 */

import { GLYPHS, LEVELS } from './tokipona';
import { search, WORD_COUNT } from './search';

const wordsOf = (results) => results.map((r) => r.word);

describe('word -> lessons (toki pona in)', () => {
  test('an exact word returns its gloss, glyph, and where it lives', () => {
    const [luka] = search('luka');
    expect(luka.word).toBe('luka');
    expect(luka.gloss).toBe('hand · arm (& five)');
    expect(luka.glyph).toBe(GLYPHS.luka);
    // luka is taught in Level 7, and Level 9's vocabNote leans on it again as
    // the number five ("luka tu = 7 · luka luka = 10") without a vocab card
    // there — that prose-only appearance should surface as 'mentioned'.
    expect(luka.levels).toEqual([
      { levelId: '7', title: 'Asking, and the body', role: 'introduces' },
      { levelId: '9', title: 'Commands, numbers, up and down', role: 'mentioned' },
    ]);
  });

  test('is case-insensitive', () => {
    expect(wordsOf(search('LUKA'))).toEqual(['luka']);
    expect(wordsOf(search('Luka'))).toEqual(['luka']);
  });

  test('a word used across levels lists every one of them, in order', () => {
    // "pona" is taught in Level 1 and shows up constantly afterward.
    const [pona] = search('pona');
    expect(pona.levels[0]).toEqual({ levelId: '1', title: 'The first twelve', role: 'introduces' });
    expect(pona.levels.length).toBeGreaterThan(1);
    const ids = pona.levels.map((l) => Number(l.levelId));
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  test('a word introduced AND used in its own level keeps the "introduces" tag', () => {
    // luka is taught, glyph-read, and used in an example sentence, all in Level 7.
    const [luka] = search('luka');
    const level7 = luka.levels.find((l) => l.levelId === '7');
    expect(level7.role).toBe('introduces');
  });
});

describe('words mentioned only in prose (the "luka bug" fix, generalized)', () => {
  test('a word used only in a later level\'s vocabNote/closingNote/rule prose is tagged "mentioned"', () => {
    // "jan" (Level 2) is never used in Level 6's structured fields, only in
    // its closingNote's naming-convention explanation ("jan Tawi", "jan An?").
    const [jan] = search('jan');
    const level6 = jan.levels.find((l) => l.levelId === '6');
    expect(level6).toEqual({ levelId: '6', title: 'Time, and the word la', role: 'mentioned' });
  });

  test('a "mentioned" role never overrides an existing "introduces" or "uses" tag for that level', () => {
    // "pona" is both taught (Level 1) and used constantly elsewhere; nothing
    // in prose should be able to knock a stronger tag down to "mentioned".
    const [pona] = search('pona');
    const level1 = pona.levels.find((l) => l.levelId === '1');
    expect(level1.role).toBe('introduces');
  });

  test('the English article "a" does not get credited as the toki pona word "a" in prose', () => {
    // Level 1's vocabNote and intro both use "a" as an English article
    // ("is a figure", "is a house", "a complete language") — none of that
    // should register as a Level 1 appearance of the toki pona word "a"
    // (which isn't taught until Level 10).
    const [a] = search('a');
    expect(a.levels.some((l) => l.levelId === '1')).toBe(false);
    // It should still resolve, from its own Level 10 vocab card.
    expect(a.levels.some((l) => l.levelId === '10' && l.role === 'introduces')).toBe(true);
  });
});

describe('English -> toki pona (the reverse lookup)', () => {
  test('"five" finds luka', () => {
    expect(wordsOf(search('five'))).toContain('luka');
  });

  test('"hand" also finds luka', () => {
    expect(wordsOf(search('hand'))).toContain('luka');
  });

  test('a whole-word match only, not a substring of a longer word', () => {
    // "man" must not spuriously match "mama" or anything else via substring.
    expect(wordsOf(search('man'))).not.toContain('mama');
  });

  test('a gloss word with no listed toki pona word finds nothing', () => {
    expect(search('helicopter')).toEqual([]);
  });
});

describe('glyph -> word', () => {
  test('a single pasted glyph resolves to its word', () => {
    expect(wordsOf(search(GLYPHS.luka))).toEqual(['luka']);
  });

  test('a run of glyphs with no spaces (a copy-paste from lipu tenpo) resolves all of them', () => {
    // Exactly how toGlyphs() renders "mi olin e sina" — see tokipona.js.
    const pasted = GLYPHS.mi + GLYPHS.olin + GLYPHS.e + GLYPHS.sina;
    expect(wordsOf(search(pasted)).sort()).toEqual(['e', 'mi', 'olin', 'sina'].sort());
  });

  test('glyph input takes priority over any coincidental text match', () => {
    const result = search(GLYPHS.luka);
    expect(result[0].matchedOn).toBe('glyph');
  });
});

describe('particles taught only through a rule, not a vocab card', () => {
  test('li resolves and is used across many levels', () => {
    const [li] = search('li');
    expect(li.gloss).toMatch(/predicate/);
    expect(li.glyph).toBe(GLYPHS.li);
    expect(li.levels.length).toBeGreaterThan(1);
  });

  test('e resolves the same way', () => {
    const [e] = search('e');
    expect(e.gloss).toMatch(/object/);
    expect(e.glyph).toBe(GLYPHS.e);
  });
});

describe('query tokenization (the reverse lookup, generalized)', () => {
  test('plural folding: "hands" finds luka the same way "hand" does', () => {
    expect(wordsOf(search('hands'))).toContain('luka');
  });

  test('plural folding: "colors" and the UK spelling "colours" both find kule', () => {
    expect(wordsOf(search('colors'))).toContain('kule');
    expect(wordsOf(search('colours'))).toContain('kule');
  });

  test('plural folding: "fruits" finds kili, "animals" finds soweli', () => {
    expect(wordsOf(search('fruits'))).toContain('kili');
    expect(wordsOf(search('animals'))).toContain('soweli');
  });

  test('plural folding: "things" finds every gloss that says "thing" (ijo and kiwen)', () => {
    expect(wordsOf(search('things')).sort()).toEqual(['ijo', 'kiwen']);
  });

  test('irregular plurals are out of scope by design: "feet" still finds nothing', () => {
    // foot/feet has no regular -s/-es shape; a lookup table of English
    // irregulars was judged disproportionate for a ~120-word course (see the
    // doc comment on foldPlural). This documents the choice, not an oversight.
    expect(search('feet')).toEqual([]);
  });

  test('multi-word queries tokenize and AND across tokens, not OR', () => {
    // "land" alone also matches ma ("land · earth · outdoors"), but "land
    // animal" should return only soweli, whose gloss literally is "land
    // animal" — the precise compound match, not every word containing "land".
    expect(wordsOf(search('land'))).toContain('ma');
    expect(wordsOf(search('land animal'))).toEqual(['soweli']);
  });

  test('multi-word: "hard thing" finds only kiwen, not every gloss containing "thing"', () => {
    expect(wordsOf(search('hard thing'))).toEqual(['kiwen']);
  });

  test('multi-word: "flat surface" finds supa', () => {
    expect(wordsOf(search('flat surface'))).toEqual(['supa']);
  });

  test('a multi-word query with no common word across all tokens finds nothing', () => {
    // "hand" -> luka only, "color" -> kule only; no word means both.
    expect(search('hand color')).toEqual([]);
  });

  test('numeral: "5" resolves the same way "five" does, via luka\'s aside', () => {
    expect(wordsOf(search('5'))).toContain('luka');
  });

  test('a numeral with no matching gloss ("3") finds nothing, rather than guessing', () => {
    expect(search('3')).toEqual([]);
  });
});

describe('English-index stopwords (derived from this corpus, not a generic list)', () => {
  test('"to" no longer returns a wall of unrelated verb glosses', () => {
    // Previously: every "to eat"/"to love"/"to know"-shaped verb gloss
    // matched, ~20 unrelated words. Now the bare infinitive marker is
    // excluded from the index entirely.
    expect(search('to')).toEqual([]);
  });

  test('words that legitimately mean "a", "of", "or", "and" are untouched', () => {
    // These occur once or twice in the corpus and point at the word that
    // actually means them — a generic stopword list would have wrongly
    // deleted these; only the two measured pollutants ("·" and "to") are cut.
    expect(wordsOf(search('of'))).toContain('tan');
    expect(wordsOf(search('or'))).toContain('anu');
    expect(wordsOf(search('and'))).toContain('en');
  });

  test('the gloss separator "·" is not itself a searchable token', () => {
    expect(search('·')).toEqual([]);
  });
});

describe('parenthetical asides in the reverse index', () => {
  test('"words" finds nimi (a real gloss word), not pi (whose entire gloss is a bracketed usage note)', () => {
    // Regression check for the exact reviewer finding: pi's gloss is
    // '(regroups words)' with nothing outside the parens, so it should never
    // have claimed "words" as one of its senses.
    expect(wordsOf(search('words'))).toEqual(['nimi']);
  });

  test('pi, la, and mu are still findable by their own toki pona spelling', () => {
    expect(wordsOf(search('pi'))).toEqual(['pi']);
    expect(wordsOf(search('la'))).toEqual(['la']);
    expect(wordsOf(search('mu'))).toEqual(['mu']);
  });

  test('an aside that supplements real primary content is still indexed ("five" still finds luka)', () => {
    // luka's gloss is 'hand · arm (& five)' — real content ("hand", "arm")
    // exists outside the parens, so the aside ("five") stays indexed. This is
    // the existing, already-tested behavior; this test just states the rule
    // that makes it different from pi's case.
    expect(wordsOf(search('five'))).toContain('luka');
  });
});

describe('no match', () => {
  test('a query that is neither toki pona, English, nor a glyph finds nothing', () => {
    expect(search('zzzzzz')).toEqual([]);
  });

  test('blank input finds nothing (and does not throw)', () => {
    expect(search('')).toEqual([]);
    expect(search('   ')).toEqual([]);
  });
});

describe('coverage', () => {
  test('every glyph in the course resolves to a searchable word', () => {
    // 119 vocab words + the two particles (e, li) that ride on rule prose only.
    expect(WORD_COUNT).toBe(Object.keys(GLYPHS).length);
  });

  test('every vocabulary word in every level is findable by exact toki pona search', () => {
    LEVELS.forEach((level) => {
      level.vocab.forEach((v) => {
        expect(wordsOf(search(v.word))).toContain(v.word);
      });
    });
  });
});
