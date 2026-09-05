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
  MS_PER_TICK,
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
 * Hour and minute SWEEP: they are derived from the raw millisecond, so they
 * creep between marks the way a mechanical hand does. Second STEPS: it is
 * floored to the tick, because the tick is the smallest thing the clock claims
 * to know and a sweeping second hand would imply a precision the face does not
 * have.
 *
 * The hour hand turns once per DAY, not twice — 36 hours, one revolution — so
 * midnight is up, midday is down, and the hand reads as a sun position.
 */
export const handAngles = (msSinceMidnight) => ({
  lapse: turnToDegrees(msSinceMidnight / MS_PER_DAY),
  lull: turnToDegrees((msSinceMidnight % MS_PER_DAY) / MS_PER_HOUR),
  moment: turnToDegrees(
    ((Math.floor(msSinceMidnight / MS_PER_TICK) * MS_PER_TICK) % MS_PER_MINUTE) / MS_PER_MINUTE,
  ),
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

/** Cartesian point on a circle of radius r, at mark `i` of MARKS, centre 0,0. */
export const markPoint = (i, r) => {
  const rad = ((turnToDegrees(i / MARKS) - 90) * Math.PI) / 180;
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
};
