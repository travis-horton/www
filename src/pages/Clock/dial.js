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
export const markLabel = (i, mode) => {
  if (i % MAJOR_EVERY !== 0) return '';
  return mode === 'niftimal' ? NIFTIMAL_DIGITS[i] : seximalPair(i);
};

/** Cartesian point on a circle of radius r, at mark `i` of MARKS, centre 0,0. */
export const markPoint = (i, r) => {
  const rad = ((turnToDegrees(i / MARKS) - 90) * Math.PI) / 180;
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
};
