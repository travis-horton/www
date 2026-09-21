/*
 * Seximal (base 6) — Travis's spoken naming system, as a module.
 *
 * Authoritative spec: codex 5_culture/interests/seximal/seximal.md
 *   digits 1-5 normal · 6 = "six" (10s6) · decimal 7-11 are single words
 *   20s6 = "dozen" · 30/40/50 = "thirsy"/"foursy"/"fifsy" · 100s6 = "nif"
 *   multi-digit: read as pairs, "<high pair> nif <low pair>"
 *     3251s6 = "thirsy-two nif fifsy-one"
 *   6^4 = 10000s6 = "unexian"; numbers group in four-digit blocks
 *     523521s6 = "fifsy-two unexian, thirsy-five nif dozen-one"
 */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five'];

// 10s6 .. 15s6 are irregular single words (decimal 6..11).
const TEENS = ['six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

// Word for a non-zero digit in the sixes place. Index 1 is irregular (see TEENS).
const SIXES = [null, null, 'dozen', 'thirsy', 'foursy', 'fifsy'];

export const NIF = 36; // 100s6
const UNEXIAN = 1296; // 10000s6 = 6^4
const BIEXIAN = UNEXIAN * UNEXIAN;

/** Name a two-digit base-six pair, i.e. decimal 0..35. */
export const pairName = (n) => {
  if (n < 6) return ONES[n];
  const high = Math.floor(n / 6);
  const low = n % 6;
  if (high === 1) return TEENS[low];
  const base = SIXES[high];
  return low === 0 ? base : `${base}-${ONES[low]}`;
};

/**
 * Name a four-digit base-six block, i.e. decimal 0..1295, as "<pair> nif <pair>".
 *
 * NOTE, open question: a leading pair of exactly one is spoken bare — 100s6 is
 * "nif", not "one nif" — following the spec line "100s6 = nif" and Misali's
 * seximal, which Travis declared definitive. The spec's own unexian example
 * runs the other way ("one unexian"), so the two units are inconsistent here.
 * If the bare form is wrong, this is the only line to change.
 */
export const blockName = (n) => {
  const highPair = Math.floor(n / NIF);
  const lowPair = n % NIF;
  if (highPair === 0) return pairName(lowPair);
  const head = highPair === 1 ? 'nif' : `${pairName(highPair)} nif`;
  return lowPair === 0 ? head : `${head} ${pairName(lowPair)}`;
};

/** Full spoken name. Supports up to (but not including) biexian, 6^8. */
export const seximalName = (n) => {
  if (n < UNEXIAN) return blockName(n);
  if (n >= BIEXIAN) return null;
  const highBlock = Math.floor(n / UNEXIAN);
  const lowBlock = n % UNEXIAN;
  const head = `${blockName(highBlock)} unexian`;
  return lowBlock === 0 ? head : `${head}, ${blockName(lowBlock)}`;
};

/** Decimal -> base-six numeral string. */
export const toDigits = (n) => {
  if (n === 0) return '0';
  let rest = n;
  let out = '';
  while (rest > 0) {
    out = String(rest % 6) + out;
    rest = Math.floor(rest / 6);
  }
  return out;
};

/** Base-six numeral string -> decimal, or null if it isn't one. */
export const fromDigits = (s) => {
  const trimmed = String(s).trim();
  if (!/^[0-5]+$/.test(trimmed)) return null;
  return trimmed.split('').reduce((acc, d) => acc * 6 + Number(d), 0);
};

/*
 * Answer matching. Deliberately forgiving about the things that are typing,
 * not knowledge: case, hyphen-vs-space, commas, stray whitespace.
 */
export const normalizeName = (s) =>
  String(s).toLowerCase().replace(/[-,]/g, ' ').replace(/\s+/g, ' ').trim();

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const pick = (arr) => arr[randInt(0, arr.length - 1)];

/** Every item carries both forms of its answer, so feedback can always show both. */
const makeItem = ({ kind, prompt, promptSub, value, answerMode, explain }) => ({
  kind,
  prompt,
  promptSub,
  answerMode,
  explain,
  digits: toDigits(value),
  name: seximalName(value),
  value,
});

/**
 * True if the response matches. Arithmetic items are answered in digits, but a
 * correct spoken name is accepted too — it is the harder answer, not a wrong one.
 */
export const isCorrect = (item, response) => {
  const raw = String(response).trim();
  if (raw === '') return false;
  if (normalizeName(raw) === normalizeName(item.name)) return true;
  if (item.answerMode === 'name') return false;
  return fromDigits(raw) === item.value;
};

// ---------------------------------------------------------------------------
// Generators, one per level. Levels mirror the printed L1-5 worksheet set
// (seximal-worksheets-L1-5-2026-07-24.pdf).
//
// The numbers a level works with are named constants rather than literals
// inside the generators, because each LEVEL below also declares a
// `drillRange` — the span of values that level can say out loud, operands and
// answers alike, since every item carries seximalName(value) and the feedback
// shows it. The search's "also drilled in" line is derived from those spans,
// so they are built out of the same constants the generator uses and cannot
// quietly disagree with it. seximalSearch.test.js samples the real generators
// against the declared spans.
// ---------------------------------------------------------------------------

const PAIR_MAX = NIF - 1; // 55s6 — the biggest two-digit pair
const OPERAND_MIN = 2; // adding or multiplying by one teaches nothing
const SUB_MIN = 8; // a subtraction needs room under it
const FACTOR_MAX = 11; // 15s6 — the times table proper
const BIG_FACTOR_MAX = 17; // 25s6 — Level 4's "dozen-scale" half
const UNEXIAN_MAX = UNEXIAN * 30; // Level 2's occasional four-digit block

const nameIt = (value) =>
  makeItem({
    kind: 'name-it',
    prompt: `${toDigits(value)}₆`,
    promptSub: 'say the name',
    value,
    answerMode: 'name',
  });

const writeIt = (value) =>
  makeItem({
    kind: 'write-it',
    prompt: seximalName(value),
    promptSub: 'write the base-six numeral',
    value,
    answerMode: 'digits',
  });

const level1 = () => {
  const value = randInt(1, PAIR_MAX);
  return pick([nameIt, writeIt])(value);
};

const level2 = () => {
  const roll = Math.random();
  if (roll < 0.15) {
    // The unexian bonus: four-digit blocks.
    const value = randInt(UNEXIAN, UNEXIAN_MAX);
    return pick([nameIt, writeIt])(value);
  }
  const value = randInt(NIF, UNEXIAN - 1);
  return pick([nameIt, writeIt])(value);
};

const addItem = () => {
  const a = randInt(OPERAND_MIN, PAIR_MAX);
  const b = randInt(OPERAND_MIN, PAIR_MAX);
  const carries = (a % 6) + (b % 6) >= 6;
  return makeItem({
    kind: 'add',
    prompt: `${toDigits(a)}₆ + ${toDigits(b)}₆`,
    promptSub: `${seximalName(a)} plus ${seximalName(b)}`,
    value: a + b,
    answerMode: 'digits',
    explain: carries ? 'The ones place passed six, so it carried.' : null,
  });
};

const subtractItem = () => {
  const a = randInt(SUB_MIN, PAIR_MAX);
  const b = randInt(OPERAND_MIN, a - 1);
  const borrows = a % 6 < b % 6;
  return makeItem({
    kind: 'subtract',
    prompt: `${toDigits(a)}₆ − ${toDigits(b)}₆`,
    promptSub: `${seximalName(a)} minus ${seximalName(b)}`,
    value: a - b,
    answerMode: 'digits',
    explain: borrows
      ? 'The ones place went negative, so it borrowed a six.'
      : null,
  });
};

const level3 = () => pick([addItem, subtractItem])();

const multiplyItem = () => {
  const a = randInt(OPERAND_MIN, FACTOR_MAX);
  const b =
    Math.random() < 0.3
      ? randInt(6, BIG_FACTOR_MAX)
      : randInt(OPERAND_MIN, FACTOR_MAX);
  return makeItem({
    kind: 'multiply',
    prompt: `${toDigits(a)}₆ × ${toDigits(b)}₆`,
    promptSub: `${seximalName(a)} times ${seximalName(b)}`,
    value: a * b,
    answerMode: 'digits',
  });
};

const divideItem = () => {
  const divisor = randInt(OPERAND_MIN, FACTOR_MAX);
  const quotient = randInt(OPERAND_MIN, FACTOR_MAX);
  const dividend = divisor * quotient;
  return makeItem({
    kind: 'divide',
    prompt: `${toDigits(dividend)}₆ ÷ ${toDigits(divisor)}₆`,
    promptSub: `${seximalName(dividend)} over ${seximalName(divisor)}`,
    value: quotient,
    answerMode: 'digits',
  });
};

const level4 = () => pick([multiplyItem, divideItem])();

const complementItem = () => {
  const n = randInt(1, PAIR_MAX);
  return makeItem({
    kind: 'complement',
    prompt: `nif − ${toDigits(n).padStart(2, '0')}₆`,
    promptSub: `nif minus ${seximalName(n)}`,
    value: NIF - n,
    answerMode: 'digits',
    explain:
      'nif − XY = (five−X)(six−Y). It is a complement, not a big subtraction.',
  });
};

const chainItem = () => {
  const a = randInt(OPERAND_MIN, BIG_FACTOR_MAX);
  const b = randInt(OPERAND_MIN, FACTOR_MAX);
  const c = randInt(OPERAND_MIN, FACTOR_MAX);
  if (Math.random() < 0.5) {
    return makeItem({
      kind: 'chain',
      prompt: `(${toDigits(a)}₆ + ${toDigits(b)}₆) × ${toDigits(c)}₆`,
      promptSub: `${seximalName(a)} plus ${seximalName(b)}, times ${seximalName(c)}`,
      value: (a + b) * c,
      answerMode: 'digits',
    });
  }
  const inner = randInt(1, PAIR_MAX);
  return makeItem({
    kind: 'chain',
    prompt: `(nif − ${toDigits(inner)}₆) + ${toDigits(b)}₆`,
    promptSub: `the complement of ${seximalName(inner)}, plus ${seximalName(b)}`,
    value: NIF - inner + b,
    answerMode: 'digits',
    explain: 'A complement buried inside a chain — take the complement first.',
  });
};

const level5 = () => pick([complementItem, chainItem])();

export const LEVELS = [
  {
    id: '1',
    title: 'Counting & names',
    blurb:
      'The words themselves — six, dozen, thirsy, foursy, fifsy — up to fifsy-five.',
    generate: level1,
    drillRange: { min: 1, max: PAIR_MAX },
  },
  {
    id: '2',
    title: 'Place value & pair-reading',
    blurb: 'Bigger numbers read as pairs around nif. Occasional unexian.',
    generate: level2,
    drillRange: { min: NIF, max: UNEXIAN_MAX },
  },
  {
    id: '3',
    title: 'Adding & subtracting',
    blurb: 'Carries and borrows, where six is the wall instead of ten.',
    generate: level3,
    // A subtraction can land on one; a sum can reach two full pairs.
    drillRange: { min: 1, max: PAIR_MAX * 2 },
  },
  {
    id: '4',
    title: 'Times table & division',
    blurb: 'Multiplication back in, including dozen-scale.',
    generate: level4,
    drillRange: { min: OPERAND_MIN, max: FACTOR_MAX * BIG_FACTOR_MAX },
  },
  {
    id: '5',
    title: 'Complements & chains',
    blurb: 'nif-complements, then complements buried inside longer chains.',
    generate: level5,
    // The widest chain is (a + b) × c; a complement never leaves the pairs.
    drillRange: {
      min: 1,
      max: (BIG_FACTOR_MAX + FACTOR_MAX) * FACTOR_MAX,
    },
  },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id) || null;

export const SESSION_LENGTH = 12; // a dozen (20s6)

export const buildSession = (level, count = SESSION_LENGTH) => {
  const items = [];
  while (items.length < count) {
    items.push(level.generate());
  }
  return items;
};
