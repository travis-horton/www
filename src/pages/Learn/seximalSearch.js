/*
 * seximal — search, the second half of /learn's "where did I meet this?"
 * (search.js is the toki pona half; the two share a box on /learn itself).
 *
 * The seximal course has no vocabulary list the way toki pona does — its
 * questions are generated — so the index is built from the two things the
 * course DOES define as content:
 *
 *   ① the naming system in seximal.js. The named numbers (six … eleven, dozen,
 *     thirsy, foursy, fifsy, nif, unexian) are not typed out here: they are
 *     read back out of pairName()/seximalName(), so the index cannot drift
 *     from what the drill actually says.
 *   ② each level's title and blurb, for the topics ("carries", "complement",
 *     "times table") a learner half-remembers from a lesson.
 *
 * Four ways in, tried in this order, all returned:
 *   a named number   "dozen" -> 20₆ · 12, taught in Level 1, comes up in 4
 *   a spoken number  "thirsy-two nif fifsy-one" -> 3251₆ · 751
 *   a numeral        "20" -> BOTH readings: 20₆ (= 12, dozen) and decimal 20
 *                    (= 32₆, thirsy-two). "20₆" or "20s6" pins it to base six.
 *   a topic word     "carry" -> Level 3, "complement" -> Level 5
 *
 * Like search.js: no server, no fuzzy-matching library, a few lookup tables
 * built once at import time.
 */

import {
  LEVELS, NIF, blockName, fromDigits, normalizeName, pairName, seximalName, toDigits,
} from './seximal';
import { foldPlural } from './search';

const UNEXIAN = NIF * NIF; // 10000₆

/*
 * Same forgiveness as the drill's own answer matching (normalizeName: case,
 * hyphen-vs-space, commas), plus the punctuation a blurb carries — so
 * "nif-complements" and "fifsy-five" split into their words.
 */
const tokens = (text) => normalizeName(text)
  .replace(/[.!?;:"'()&—–]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const levelTokens = (level) => tokens(`${level.title} ${level.blurb}`);

/*
 * The named numbers: every single-word name the pair system produces for six
 * and up (six, seven … eleven, dozen, thirsy, foursy, fifsy), plus nif and
 * unexian. zero … five are left out on purpose — they are just digits, the
 * same word in every base, and "five" finding a seximal card would only be
 * noise next to toki pona's luka on the combined search.
 */
const buildNamedNumbers = () => {
  const named = {};
  for (let n = 6; n < NIF; n += 1) {
    const name = pairName(n);
    if (!name.includes('-')) named[name] = n;
  }
  named[seximalName(NIF)] = NIF; // 'nif'
  named[seximalName(UNEXIAN).split(' ').pop()] = UNEXIAN; // 'one unexian' -> 'unexian'
  return named;
};

const NAMED = buildNamedNumbers();

// Every word the naming system can produce — the named numbers above AND the
// digit words — so none of them is ever mistaken for a topic.
const NUMBER_VOCAB = (() => {
  const vocab = new Set(Object.keys(NAMED));
  for (let n = 0; n < NIF; n += 1) tokens(pairName(n)).forEach((t) => vocab.add(t));
  return vocab;
})();

/*
 * Where a named number is TAUGHT is decided by size, not by the first blurb
 * that mentions it: every number below nif is named in the level that
 * introduces "six" (the pair words), every number from nif up in the level
 * that introduces "nif" (pair-reading). Both homes are looked up from the
 * blurbs, not hard-coded. Size wins because blurbs are English prose: Level
 * 3's "six is the wall instead of ten" mentions "ten" — decimal ten — and a
 * first-mention rule would have claimed Level 3 teaches it. It still lists
 * Level 3 as a place "ten" comes up, which is true.
 */
const homeOf = (word, fallback) => LEVELS.find((l) => levelTokens(l).includes(word)) || fallback;
const PAIR_HOME = homeOf(seximalName(6), LEVELS[0]); // 'six'
const BLOCK_HOME = homeOf(seximalName(NIF), LEVELS[1]); // 'nif'
const homeFor = (value) => (value < NIF ? PAIR_HOME : BLOCK_HOME);

const byLevelOrder = (a, b) => Number(a.levelId) - Number(b.levelId);

const appearancesOf = (word, value) => {
  const home = homeFor(value);
  const levels = [{ levelId: home.id, title: home.title, role: 'introduces' }];
  LEVELS.forEach((level) => {
    if (level.id !== home.id && levelTokens(level).includes(word)) {
      levels.push({ levelId: level.id, title: level.title, role: 'mentioned' });
    }
  });
  return levels.sort(byLevelOrder);
};

/*
 * Topics: title + blurb words -> the levels they describe. These are English
 * sentences about arithmetic, so — unlike the toki pona glosses, where "or"
 * and "and" ARE meanings (anu, en) and a generic stopword list would delete
 * right answers — none of this course's topics is a function word. The set
 * below is exactly the function words the five blurbs contain.
 */
const TOPIC_STOPWORDS = new Set([
  'the', 'and', 'as', 'up', 'to', 'of', 'in', 'is', 'where', 'instead',
  'back', 'including', 'then', 'inside', 'around',
]);

const buildTopicIndex = () => {
  const index = {};
  const add = (token, levelId) => {
    if (!index[token]) index[token] = new Set();
    index[token].add(levelId);
  };
  LEVELS.forEach((level) => {
    levelTokens(level).forEach((t) => {
      if (TOPIC_STOPWORDS.has(t) || NUMBER_VOCAB.has(t)) return;
      add(t, level.id);
      add(foldPlural(t), level.id); // "carries" is also found by "carry"
    });
  });
  return index;
};

const TOPICS = buildTopicIndex();

// Multi-word topic queries AND across their words, same as search.js:
// "times table" is Level 4, not every level that says "the".
const topicHits = (raw) => {
  const words = tokens(raw).filter((t) => !TOPIC_STOPWORDS.has(t));
  if (words.length === 0) return [];
  const perWord = words.map((w) => new Set([
    ...(TOPICS[w] || []),
    ...(TOPICS[foldPlural(w)] || []),
  ]));
  const both = perWord.reduce((acc, set) => new Set([...acc].filter((id) => set.has(id))));
  return [...both].sort((a, b) => Number(a) - Number(b));
};

/*
 * Spoken name -> value, the inverse of seximalName(). A block (0 … 1295) is
 * looked up in a table of every blockName(), 1296 short strings built once;
 * above that, "<block> unexian, <block>" is split on "unexian". Single words
 * are the named-number table's job, so this only answers multi-word names.
 *
 * "one nif" is accepted as well as the canonical bare "nif": seximal.js
 * blockName() flags the bare leading one as an open question in the spec,
 * and a search box should not reject the form the spec has not ruled out.
 */
const BLOCK_VALUES = (() => {
  const table = {};
  for (let n = 0; n < UNEXIAN; n += 1) table[normalizeName(blockName(n))] = n;
  return table;
})();

const blockValue = (text) => {
  const s = text.trim();
  if (s in BLOCK_VALUES) return BLOCK_VALUES[s];
  const bare = s.replace(/^one nif\b/, 'nif');
  return bare in BLOCK_VALUES ? BLOCK_VALUES[bare] : null;
};

const parseSpokenName = (raw) => {
  const norm = normalizeName(raw);
  if (!norm.includes(' ')) return null;
  const parts = norm.split('unexian');
  if (parts.length === 1) return blockValue(norm);
  if (parts.length !== 2) return null;
  const high = blockValue(parts[0]);
  const low = parts[1].trim() === '' ? 0 : blockValue(parts[1]);
  if (!high || low === null) return null;
  return high * UNEXIAN + low;
};

/*
 * Numeral -> its readings. A bare numeral is ambiguous, so both readings come
 * back, base six first (this course writes its numerals in base six — "six is
 * written 10"). Digits 6-9 rule out base six; a ₆ or s6 suffix (the spec's
 * own "3251s6") rules out decimal; 0-5 are the same number either way and
 * come back once.
 */
const SIX_MARK = /(?:₆|s6)$/i;
const MAX_DIGITS = 12;

const numeralReadings = (raw) => {
  const compact = raw.replace(/\s+/g, '');
  const marked = SIX_MARK.test(compact);
  const digits = compact.replace(SIX_MARK, '');
  if (!/^\d+$/.test(digits) || digits.length > MAX_DIGITS) return [];

  const readings = [];
  const asSix = fromDigits(digits);
  if (asSix !== null && seximalName(asSix) !== null) {
    readings.push({ reading: 'seximal', value: asSix });
  }
  if (!marked) {
    const asTen = Number(digits);
    if (asTen !== asSix && seximalName(asTen) !== null) {
      readings.push({ reading: 'decimal', value: asTen });
    }
  }
  return readings;
};

const numberLevels = (value) => {
  const home = homeFor(value);
  return [{ levelId: home.id, title: home.title, role: 'reads' }];
};

const namedResult = (term) => ({
  course: 'seximal',
  kind: 'word',
  key: `word-${term}`,
  term,
  value: NAMED[term],
  digits: toDigits(NAMED[term]),
  levels: appearancesOf(term, NAMED[term]),
});

const numberResult = (value, reading) => ({
  course: 'seximal',
  kind: 'number',
  key: `number-${reading}-${value}`,
  reading,
  term: seximalName(value),
  value,
  digits: toDigits(value),
  levels: numberLevels(value),
});

const topicResult = (levelId) => {
  const level = LEVELS.find((l) => l.id === levelId);
  return {
    course: 'seximal',
    kind: 'topic',
    key: `topic-${levelId}`,
    levelId,
    title: level.title,
    blurb: level.blurb,
  };
};

/**
 * Search the seximal course. Returns an array (possibly empty) of results,
 * each tagged `kind`: 'word' (a named number), 'number' (a numeral or a
 * spoken name, with `reading` = 'seximal' | 'decimal' | 'name'), or 'topic'
 * (a level whose title/blurb matches).
 */
export const searchSeximal = (query) => {
  const raw = String(query).trim();
  if (!raw) return [];

  const results = [];
  const norm = normalizeName(raw);
  if (norm in NAMED) results.push(namedResult(norm));

  const spoken = parseSpokenName(raw);
  if (spoken !== null) results.push(numberResult(spoken, 'name'));

  numeralReadings(raw).forEach(({ reading, value }) => results.push(numberResult(value, reading)));

  topicHits(raw).forEach((levelId) => results.push(topicResult(levelId)));

  return results;
};

// Exposed for tests.
export const NAMED_NUMBERS = NAMED;
export const HOMES = { pair: PAIR_HOME.id, block: BLOCK_HOME.id };
