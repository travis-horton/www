/*
 * Geometry for the analog face. Pure — no React, no DOM — so the angles can be
 * asserted directly, the way clock.js's conversions are.
 *
 * The dial has NIF (36) marks. That number is the whole point: a hand's
 * position on it IS a two-digit seximal number — which sixth of the dial, then
 * which sixth of that sixth — and a two-digit seximal number is one niftimal
 * digit. So three hands are three niftimal digits, and the face teaches the
 * pair rule by pointing at it rather than asserting it.
 */

import {
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  NIF,
  NIFTIMAL_DIGITS,
  seximalPair,
} from './clock';

/** Marks around the dial, and the every-sixth ones that get a long stroke. */
export const MARKS = NIF;
export const MAJOR_EVERY = 6;

/**
 * Degrees clockwise from twelve for a fraction of a turn. Kept separate from
 * the unit maths so a hand is always `turnToDegrees(someFraction)` and the
 * wrap is in exactly one place.
 */
export const turnToDegrees = (turn) => (((turn % 1) + 1) % 1) * 360;

/**
 * The three hand angles, in degrees, from milliseconds since local midnight.
 *
 * ALL THREE SWEEP (Travis, 26.0905). They are derived from the raw
 * millisecond, so each creeps between marks the way a mechanical hand does and
 * crosses a mark at the instant that unit's digit changes.
 *
 * The moment hand used to step, floored to the tick, on the argument that a
 * sweeping hand would imply a precision the clock does not have. That argument
 * was wrong twice over: the clock knows the millisecond perfectly well — the
 * TICK is a unit, not a limit — and a stepped hand at 1.85 s reads as a
 * stutter rather than as precision. The digital face below is where the
 * flooring belongs, because there a digit is the reading.
 *
 * The lapse hand turns once per DAY, not twice — 36 lapses, one revolution —
 * so midnight is up, midday is down, and the hand reads as a sun position.
 */
export const handAngles = (msSinceMidnight) => ({
  lapse: turnToDegrees(msSinceMidnight / MS_PER_DAY),
  lull: turnToDegrees((msSinceMidnight % MS_PER_DAY) / MS_PER_HOUR),
  moment: turnToDegrees((msSinceMidnight % MS_PER_MINUTE) / MS_PER_MINUTE),
});

/**
 * The label for mark `i`, in the active notation. Only the majors are labelled
 * — 36 labels is a thicket — and in seximal the majors are exactly the round
 * numbers 0, 10, 20, 30, 40, 50, which is base six's answer to 12 · 3 · 6 · 9.
 */
export const markLabel = (i) => (i % MAJOR_EVERY === 0 ? seximalPair(i) : '');

/**
 * The label for mark `i` on the OUTER ring: its niftimal glyph, on every mark
 * including the in-between ones (Travis, 26.0905).
 *
 * Both rings are drawn at once on purpose. The inner ring carries the seximal
 * pair on the majors, the outer carries a single niftimal glyph on all 36, so
 * a mark shows its pair and its glyph together and the claim that one IS the
 * other stops needing to be asserted in prose. The mode toggle then chooses
 * which ring is emphasised rather than which one exists.
 */
export const outerLabel = (i) => NIFTIMAL_DIGITS[i];

/* --- sketches of the three ways to use the new units --------------------- */

export const SPANS_PER_DAY = 216; // 6³, so a span index is three seximal digits
const MS_PER_SPAN = MS_PER_DAY / SPANS_PER_DAY;
const MS_PER_WATCH = MS_PER_DAY / 6;
const MS_PER_BREATH = MS_PER_MINUTE / 6;

/**
 * The span face: the whole time as ONE number, 0..215, which is 000₆..555₆.
 * This is what seximal.net says the span is FOR — six nif of them in a day, so
 * you can say the time without colons, good to 6 min 40 s.
 */
export const spanIndex = (msSinceMidnight) => Math.floor(msSinceMidnight / MS_PER_SPAN);

/**
 * Which sixth of the day we are in, 0..5 — the watch, as a REGION rather than
 * a pointer. The dial already has six major marks, so a watch is the wedge
 * between two of them and needs no hand.
 */
export const watchIndex = (msSinceMidnight) => Math.floor(msSinceMidnight / MS_PER_WATCH);

/**
 * Watch and breath AS HANDS, for the sketch that shows why they are a weak
 * idea. Both step through only six positions — a watch is the lapse hand at a
 * sixth of its resolution, a breath the moment hand at a sixth of its — so on
 * a 36-mark dial they land on every sixth mark and read as slow duplicates.
 * Drawn stepping, so that is visible rather than argued.
 */
export const extraHandAngles = (msSinceMidnight) => ({
  watch: turnToDegrees(Math.floor(msSinceMidnight / MS_PER_WATCH) / 6),
  breath: turnToDegrees(
    Math.floor((msSinceMidnight % MS_PER_MINUTE) / MS_PER_BREATH) / 6,
  ),
});

/* --- the six-tick face: one hand per rung, one digit per hand ------------- */

/**
 * Travis, 26.0905: "a clock with just six ticks and all 7 hands".
 *
 * This is the shape the ladder was asking for. Six marks, and one hand for
 * each step down: the watch hand says which sixth of the DAY, the lapse hand
 * which sixth of the watch, and so on to the snap. Each hand therefore points
 * at exactly one seximal digit, and the seven of them read together as a
 * seven-digit numeral — 0000000₆ to 5555555₆, which is 6⁷ = 279936 snaps, the
 * whole day to its finest named unit.
 *
 * The 36-mark dial packs two digits into each hand's position and needs three
 * hands; this packs one digit per hand and needs seven. Same information, and
 * this one is honest about the base: six marks, six of everything.
 */
export const LADDER = ['watch', 'lapse', 'span', 'lull', 'breath', 'moment', 'snap'];

/** Digit `n` (1-based) of the day's seximal expansion, 0..5. */
export const ladderDigit = (msSinceMidnight, n) => (
  Math.floor(msSinceMidnight / (MS_PER_DAY / 6 ** n)) % 6
);

/** All seven digits, outermost rung first. */
export const ladderDigits = (msSinceMidnight) => (
  LADDER.map((_, i) => ladderDigit(msSinceMidnight, i + 1))
);

/**
 * Where each DIGIT sits: the mark a hand's current digit occupies. Stepped by
 * definition — this is the digit's home, not the hand's animation.
 */
export const ladderAngles = (msSinceMidnight) => Object.fromEntries(
  LADDER.map((unit, i) => [unit, turnToDegrees(ladderDigit(msSinceMidnight, i + 1) / 6)]),
);

/**
 * The seven hands as DRAWN — sweeping (Travis, 26.0905: "smoothly from tick to
 * tick… fast enough to seem non-discrete").
 *
 * A hand's turn is the real-valued position of the day inside the unit ABOVE
 * it, so hand n completes exactly one revolution per unit n−1. It crosses a
 * mark at the instant its digit changes and travels the arc in between, the
 * way an hour hand does on an ordinary clock; you read the digit off the mark
 * it has last passed. Stepping and sweeping therefore agree at every boundary
 * and nowhere else, which is what the test pins.
 */
export const ladderTurn = (msSinceMidnight, n) => (
  (msSinceMidnight / (MS_PER_DAY / 6 ** (n - 1))) % 1
);

export const ladderSweepAngles = (msSinceMidnight) => Object.fromEntries(
  LADDER.map((unit, i) => [unit, turnToDegrees(ladderTurn(msSinceMidnight, i + 1))]),
);

/** Cartesian point on a circle of radius r, at mark `i` of MARKS, centre 0,0. */
export const markPoint = (i, r) => {
  const rad = ((turnToDegrees(i / MARKS) - 90) * Math.PI) / 180;
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
};
