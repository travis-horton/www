/*
 * toki pona — search, over the same static corpus tokipona.js already
 * defines. The course is ~120 words across ten small lessons, so there is no
 * server and no fuzzy-matching library here: this module builds a few plain
 * lookup tables once, at import time, and answers queries against them.
 *
 * Three directions, because a learner arrives from three different places:
 *
 *   toki pona word -> gloss, glyph, and every lesson that introduces, uses,
 *     or merely mentions it. This is the "luka bug" fix: luka is taught in
 *     Level 7 and leaned on again in Level 9's vocabNote (as the number
 *     five) with nothing connecting the two — search is how a learner finds
 *     every lesson a word actually shows up in, not just the one that taught
 *     it. That includes lessons' freeform prose (vocabNote/closingNote/
 *     intro/rule.body), not only the structured fields — see buildAppearances().
 *   English word -> the toki pona word(s) whose gloss contains it. The gloss
 *     strings already ARE this index — vocab('luka', 'hand · arm (& five)')
 *     means both "hand" and "five" have to resolve to luka — so this is a
 *     tokenize-and-invert of data that already exists, not new content.
 *   a pasted sitelen pona glyph (or a run of them, copied from Discord or a
 *     lipu tenpo) -> the word(s) behind it.
 *
 * One query box can't know in advance which direction the input is, so
 * search() tries all three and returns whatever matches. See the doc comment
 * on search() for how the directions are picked apart.
 */

import { GLYPHS, LEVELS } from './tokipona';

/*
 * Two particles — e and li — carry no vocab() card of their own; they are
 * taught only through a level's `rule` prose (see tokipona.js Levels 1-2).
 * Without an entry here they would have a glyph and appear in every
 * appearances list, but no gloss — and "li" is exactly the kind of word a
 * learner searches for. The text below paraphrases the rule bodies that
 * already exist; it does not invent a new definition.
 */
const PARTICLE_GLOSSES = {
  li: 'marks the predicate (between subject and verb)',
  e: 'marks the direct object',
};

// Matches the punctuation stripped everywhere else in this course (tokipona.js
// PUNCT), plus the parens/ampersand that show up inside a gloss aside.
const STRIP = /[.,!?;:"'()&]/g;

const wordsIn = (sentence) => String(sentence)
  .split(/\s+/)
  .map((w) => w.toLowerCase().replace(STRIP, ''))
  .filter(Boolean);

/*
 * English words that are ALSO valid toki pona word keys, so a naive scan of
 * this course's freeform prose (vocabNote/closingNote/intro/rule.body, which
 * mixes English sentences with untranslated toki pona) would otherwise credit
 * every English use as a toki pona appearance. Measured against the actual
 * prose in tokipona.js (26.0828): "a" is the only collision the corpus
 * produces — every other single-word GLYPHS key (en, la, ni, mu, wan, tu...)
 * never collides with an English function word in this text — so this list
 * is short by evidence, not by assumption. If new lesson prose is added,
 * re-run search.test.js's "mentioned in prose" coverage check; a new
 * collision would show up as a bogus level appearance for a word that has no
 * business being on that level.
 */
const PROSE_STOPWORDS = new Set(['a']);

/**
 * word -> { word, gloss, glyph }, first vocab() card wins (tokipona.test.js
 * already guards against a word being taught twice).
 */
const buildWordEntries = () => {
  const entries = {};
  LEVELS.forEach((level) => {
    level.vocab.forEach((v) => {
      if (!entries[v.word]) entries[v.word] = { word: v.word, gloss: v.gloss, glyph: v.glyph };
    });
  });
  Object.entries(PARTICLE_GLOSSES).forEach(([word, gloss]) => {
    if (!entries[word]) entries[word] = { word, gloss, glyph: GLYPHS[word] };
  });
  return entries;
};

/*
 * word -> every level that touches it, in level order, each tagged with how:
 *   'introduces' — the level's vocab list taught it
 *   'uses'       — it shows up in that level's glyph-reading, an example
 *                  sentence, or the decode line, without being new there
 *   'mentioned'  — it only shows up in that level's freeform prose
 *                  (vocabNote/closingNote/intro/rule.body) — e.g. luka
 *                  (taught Level 7) doing double duty as the number five in
 *                  Level 9's vocabNote. Prose mixes English and toki pona, so
 *                  this pass only credits words already in WORD_ENTRIES (a
 *                  real toki pona word) and skips PROSE_STOPWORDS (English
 *                  words that collide with one, namely "a").
 * A word can be both in the same level (introduced and used in its own
 * examples) — role only ever strengthens (mentioned -> uses -> introduces),
 * never weakens, so a later prose-only pass can't downgrade a level a word
 * was already properly introduced or used in.
 */
const ROLE_RANK = { mentioned: 0, uses: 1, introduces: 2 };

const buildAppearances = (entries) => {
  const byWord = {};

  const touch = (word, level, role) => {
    if (!byWord[word]) byWord[word] = [];
    const existing = byWord[word].find((a) => a.levelId === level.id);
    if (existing) {
      if (ROLE_RANK[role] > ROLE_RANK[existing.role]) existing.role = role;
      return;
    }
    byWord[word].push({ levelId: level.id, title: level.title, role });
  };

  LEVELS.forEach((level) => {
    level.vocab.forEach((v) => touch(v.word, level, 'introduces'));
    level.glyphReading.forEach((w) => touch(w, level, 'uses'));
    level.toEnglish.forEach(([tp]) => wordsIn(tp).forEach((w) => touch(w, level, 'uses')));
    level.toTokiPona.forEach(([, tp]) => wordsIn(tp).forEach((w) => touch(w, level, 'uses')));
    wordsIn(level.decode[0]).forEach((w) => touch(w, level, 'uses'));

    const prose = [level.intro, level.vocabNote, level.closingNote, level.rule && level.rule.body];
    prose.forEach((text) => {
      if (!text) return;
      wordsIn(text).forEach((w) => {
        if (PROSE_STOPWORDS.has(w)) return;
        if (!entries[w]) return; // not a recognized toki pona word
        touch(w, level, 'mentioned');
      });
    });
  });

  return byWord;
};

/** gloss token (lowercase, one English word) -> Set of toki pona words. */
const buildEnglishIndex = (entries) => {
  const index = {};
  Object.values(entries).forEach(({ word, gloss }) => {
    wordsIn(gloss).forEach((token) => {
      if (!index[token]) index[token] = new Set();
      index[token].add(word);
    });
  });
  return index;
};

/** glyph codepoint string -> the word it renders. The exact inverse of GLYPHS. */
const buildGlyphIndex = () => Object.entries(GLYPHS)
  .reduce((acc, [word, glyph]) => ({ ...acc, [glyph]: word }), {});

const WORD_ENTRIES = buildWordEntries();
const APPEARANCES = buildAppearances(WORD_ENTRIES);
const ENGLISH_INDEX = buildEnglishIndex(WORD_ENTRIES);
const GLYPH_TO_WORD = buildGlyphIndex();

const byLevelOrder = (a, b) => Number(a.levelId) - Number(b.levelId);

const toResult = (word, matchedOn) => {
  const entry = WORD_ENTRIES[word];
  if (!entry) return null;
  return {
    word: entry.word,
    gloss: entry.gloss,
    glyph: entry.glyph,
    matchedOn,
    levels: (APPEARANCES[word] || []).slice().sort(byLevelOrder),
  };
};

/**
 * Search the whole toki pona course for a query, in whichever of the three
 * directions it turns out to fit. Returns an array of results (possibly
 * empty), each shaped like toResult() above.
 *
 * Direction is decided by what the query IS, not by an explicit mode:
 *   - If any character in it is a sitelen pona glyph codepoint, this is a
 *     glyph query. A pasted run of several glyphs (no spaces between them,
 *     same as toGlyphs() output) resolves every glyph in the run — iterated
 *     by Unicode code point, not UTF-16 unit, since these are
 *     supplementary-plane characters and naive indexing would split one
 *     glyph into two garbage halves.
 *   - Otherwise, an exact (case-insensitive) match against a toki pona word.
 *   - Otherwise, an exact (case-insensitive) match against a single English
 *     token drawn from the gloss strings — so "five" and "hand" both resolve
 *     to luka, because vocab('luka', 'hand · arm (& five)') already says so.
 * A query can hit more than one direction's table for different words; all
 * of them come back, deduplicated by word.
 */
export const search = (query) => {
  const raw = String(query).trim();
  if (!raw) return [];

  const results = [];
  const seen = new Set();
  const addWord = (word, matchedOn) => {
    if (seen.has(word)) return;
    const r = toResult(word, matchedOn);
    if (!r) return;
    seen.add(word);
    results.push(r);
  };

  const glyphHits = Array.from(raw).filter((cp) => GLYPH_TO_WORD[cp]);
  if (glyphHits.length > 0) {
    glyphHits.forEach((cp) => addWord(GLYPH_TO_WORD[cp], 'glyph'));
    return results;
  }

  const lower = raw.toLowerCase();
  if (WORD_ENTRIES[lower]) addWord(lower, 'word');
  (ENGLISH_INDEX[lower] || new Set()).forEach((word) => addWord(word, 'english'));

  return results;
};

// Exposed for the test that verifies coverage against tokipona.js directly.
export const WORD_COUNT = Object.keys(WORD_ENTRIES).length;
