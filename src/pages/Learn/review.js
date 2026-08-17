/*
 * toki pona — review mode. Endless, cumulative, generated.
 *
 * A level drills its own twelve words and then it is finished. That is right
 * for a lesson and wrong for a language: the words you learned in level 1 are
 * the ones you will lose first, and there is nothing to practise between
 * finishing level 2 and level 3 being written.
 *
 * Review mode fixes that by generating questions over the vocabulary of EVERY
 * level reached so far. It never runs out because it samples with replacement,
 * weighted toward the words that have actually been going wrong.
 *
 * Three directions, all exact-matched (no self-grading here — these are
 * vocabulary, not translation, and vocabulary has right answers):
 *
 *   glyph    󱤴  -> "telo"          the glyph, read
 *   word     telo -> "water"        recognition; the easy direction
 *   meaning  "water" -> telo        production; the hard direction, and new
 *
 * The third is the point. Recognising ijo when you see it is not the same
 * skill as producing it when you want to say "thing", and only the second one
 * lets you speak. It did not exist anywhere in the course before this module.
 *
 * SCOPE: this is Tier 2 — words, in three directions. Generating whole
 * grammatical sentences is Tier 3 and is deliberately not here.
 */

import { GLYPHS, isCorrect, LEVELS } from './tokipona';
import { levelsReached, weakWords } from './progress';

export const COURSE = 'toki-pona';

/** Exact-matched, so the level drill's matcher is exactly right for us. */
export { isCorrect };

export const REVIEW_KINDS = ['glyph', 'word', 'meaning'];

export const SESSION_LENGTH = 12; // a dozen, same as everywhere else

const shuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
};

/** Glosses are stored as one "a · b · c" string; the parts are all acceptable. */
export const glossParts = (gloss) => String(gloss || '')
  .split('·')
  .map((g) => g.trim())
  .filter(Boolean);

/**
 * How many levels to draw from. Anything unreadable — no store, a corrupt
 * store, a hand-typed URL — falls back to the whole course rather than
 * throwing or drilling nothing.
 */
export const clampLevels = (n) => {
  if (!Number.isFinite(Number(n))) return LEVELS.length;
  return Math.max(0, Math.min(Math.floor(Number(n)), LEVELS.length));
};

/**
 * The furthest level with a recorded session, which is what "known so far"
 * means in practice. A learner who has read a lesson but never drilled it
 * still gets level 1, because a review of nothing is not a review.
 */
export const defaultLevelsKnown = () => {
  const reached = clampLevels(levelsReached(COURSE));
  return Math.max(1, Math.min(reached, LEVELS.length));
};

/** Every word from levels 1..n, first appearance winning if one ever repeats. */
export const knownVocab = (levelsKnown) => {
  const n = clampLevels(levelsKnown);
  const seen = new Set();
  const out = [];
  LEVELS.slice(0, n).forEach((level) => {
    (level.vocab || []).forEach((v) => {
      if (seen.has(v.word)) return;
      seen.add(v.word);
      out.push({ word: v.word, gloss: v.gloss, glyph: v.glyph || GLYPHS[v.word] });
    });
  });
  return out;
};

/*
 * A gloss can belong to more than one word once the vocabulary is big enough,
 * and the meaning->word direction is the one that trips over it: prompted with
 * "all", both ale and (later) ali are honest answers. So accepted answers for
 * that direction are looked up by gloss across everything known, not taken
 * from the one word the item was generated from.
 */
const glossIndex = (pool) => {
  const index = {};
  pool.forEach((v) => {
    glossParts(v.gloss).forEach((g) => {
      const key = g.toLowerCase();
      if (!index[key]) index[key] = [];
      if (!index[key].includes(v.word)) index[key].push(v.word);
    });
  });
  return index;
};

const glyphItem = (v) => ({
  kind: 'glyph',
  word: v.word,
  prompt: v.glyph,
  promptIsGlyph: true,
  promptSub: 'which word is this?',
  answer: v.word,
  accepted: [v.word],
});

const wordItem = (v) => ({
  kind: 'word',
  word: v.word,
  prompt: v.word,
  promptGlyph: v.glyph,
  promptSub: 'what does it mean?',
  answer: v.gloss,
  accepted: glossParts(v.gloss),
});

const meaningItem = (v, index) => {
  const parts = glossParts(v.gloss);
  const asked = parts.length ? parts[Math.floor(Math.random() * parts.length)] : v.gloss;
  const accepted = (index[String(asked).toLowerCase()] || [v.word]);
  const others = accepted.filter((w) => w !== v.word);
  return {
    kind: 'meaning',
    word: v.word,
    prompt: asked,
    promptSub: 'which toki pona word?',
    answer: others.length ? `${v.word} (also ${others.join(', ')})` : v.word,
    answerGlyph: v.glyph,
    accepted,
  };
};

const BUILDERS = {
  glyph: (v) => glyphItem(v),
  word: (v) => wordItem(v),
  meaning: (v, index) => meaningItem(v, index),
};

/*
 * Weighting. A word you have missed comes back sooner and more often, but the
 * curve is capped: four misses and five misses should not feel different, and
 * nothing should crowd the rest of the vocabulary out of a session.
 */
const MISS_WEIGHT = 1.5;
const MISS_CAP = 4;

export const weightFor = (word, misses) => 1 + MISS_WEIGHT * Math.min(misses[word] || 0, MISS_CAP);

/** The same word twice running feels like a bug even when it is chance. */
const without = (pool, word) => (pool.length > 1 ? pool.filter((v) => v.word !== word) : pool);

const weightedPick = (pool, misses) => {
  const total = pool.reduce((acc, v) => acc + weightFor(v.word, misses), 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weightFor(pool[i].word, misses);
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
};

/** The per-word miss tally as a plain map, read from local progress. */
export const missTally = (course = COURSE) => weakWords(course)
  .reduce((acc, { word, count }) => ({ ...acc, [word]: count }), {});

/**
 * Build a review session over levels 1..levelsKnown.
 *
 * Kinds are dealt round-robin from a reshuffled triple, so any session of
 * three or more questions contains all three directions — a purely random
 * kind per item would sometimes hand you twelve glyph readings, which is the
 * one shape of session review mode exists to prevent.
 */
export const buildReviewSession = (levelsKnown, options = {}) => {
  const { count = SESSION_LENGTH, misses = missTally() } = options;
  const pool = knownVocab(levelsKnown);
  if (pool.length === 0 || count <= 0) return [];

  const index = glossIndex(pool);
  const items = [];
  let kinds = [];
  let last = null;

  while (items.length < count) {
    if (kinds.length === 0) kinds = shuffle(REVIEW_KINDS);
    const kind = kinds.pop();
    const v = weightedPick(without(pool, last), misses);
    last = v.word;
    items.push(BUILDERS[kind](v, index));
  }

  return items;
};
