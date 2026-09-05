/* eslint-env jest */
/*
 * The analog face's geometry. What is pinned here is the relationship between
 * time and angle — never a hand's literal degrees at some literal instant,
 * which would only re-state the arithmetic.
 */
import {
  handAngles,
  MAJOR_EVERY,
  markLabel,
  markPoint,
  MARKS,
  outerLabel,
  turnToDegrees,
} from './dial';
import {
  MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_TICK,
} from './clock';

describe('the dial', () => {
  test('has a mark per unit, and a major every sixth', () => {
    expect(MARKS).toBe(36);
    expect(MARKS / MAJOR_EVERY).toBe(6);
  });

  test('a turn wraps rather than running past a circle', () => {
    expect(turnToDegrees(0)).toBe(0);
    expect(turnToDegrees(0.25)).toBe(90);
    expect(turnToDegrees(1)).toBe(0);
    expect(turnToDegrees(1.5)).toBe(180);
    expect(turnToDegrees(-0.25)).toBe(270);
  });

  test('mark 0 is straight up and the marks run clockwise', () => {
    const top = markPoint(0, 100);
    expect(top.x).toBeCloseTo(0);
    expect(top.y).toBeCloseTo(-100);
    // A quarter of the way round is to the RIGHT, not the left.
    expect(markPoint(MARKS / 4, 100).x).toBeCloseTo(100);
  });
});

describe('the hands', () => {
  test('the lapse hand turns once a DAY, so midday is straight down', () => {
    expect(handAngles(0).lapse).toBe(0);
    expect(handAngles(MS_PER_DAY / 2).lapse).toBeCloseTo(180);
  });

  test('the lull hand turns once a lapse, the moment hand once a lull', () => {
    expect(handAngles(MS_PER_HOUR).lull).toBeCloseTo(0);
    expect(handAngles(MS_PER_HOUR / 2).lull).toBeCloseTo(180);
    expect(handAngles(MS_PER_MINUTE / 2).moment).toBeCloseTo(180, 0);
  });

  test('lapse and lull SWEEP — they move between marks', () => {
    const a = handAngles(MS_PER_TICK);
    const b = handAngles(MS_PER_TICK * 2);
    expect(b.lapse).toBeGreaterThan(a.lapse);
    expect(b.lull).toBeGreaterThan(a.lull);
  });

  test('the moment hand STEPS — it does not move inside a tick', () => {
    const onTick = handAngles(MS_PER_TICK * 5);
    const partWay = handAngles(MS_PER_TICK * 5 + MS_PER_TICK * 0.4);
    expect(partWay.moment).toBe(onTick.moment);
    // …and then it does move, by exactly one mark's worth.
    const next = handAngles(MS_PER_TICK * 6);
    expect(next.moment - onTick.moment).toBeCloseTo(360 / MARKS);
  });
});

describe('the mark labels', () => {
  test('the inner ring labels only the majors', () => {
    expect(markLabel(1)).toBe('');
    expect(markLabel(7)).toBe('');
    expect(markLabel(0)).not.toBe('');
  });

  test('the inner majors are the round seximal numbers', () => {
    expect([0, 6, 12, 18, 24, 30].map(markLabel))
      .toEqual(['00', '10', '20', '30', '40', '50']);
  });

  test('the outer ring names EVERY mark, in-between ones included', () => {
    const all = Array.from({ length: MARKS }, (_, i) => outerLabel(i));
    expect(all.filter(Boolean)).toHaveLength(MARKS);
    expect(all[1]).toBe('1');
    expect(all[10]).toBe('A');
    expect(all[35]).toBe('Z');
  });

  test('a mark carries its pair inside and its glyph outside — the pair rule, drawn', () => {
    // The whole reason both rings are drawn: mark 12 is "20" in seximal and
    // "C" in niftimal, and you can read both off the same tick.
    expect(markLabel(12)).toBe('20');
    expect(outerLabel(12)).toBe('C');
  });
});
