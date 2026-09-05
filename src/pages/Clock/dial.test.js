/* eslint-env jest */
/*
 * The analog face's geometry. What is pinned here is the relationship between
 * time and angle — never a hand's literal degrees at some literal instant,
 * which would only re-state the arithmetic.
 */
import {
  handAngles,
  MAJOR_EVERY,
  extraHandAngles,
  markLabel,
  markPoint,
  MARKS,
  outerLabel,
  LADDER,
  ladderAngles,
  ladderDigit,
  ladderDigits,
  ladderSweepAngles,
  spanIndex,
  SPANS_PER_DAY,
  watchIndex,
  turnToDegrees,
} from './dial';
import {
  MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_TICK, seximalTriple,
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

  test('the moment hand SWEEPS too — it moves inside a tick', () => {
    // It used to step, floored to the tick; Travis asked for all three hands
    // to move continuously (26.0905).
    const onTick = handAngles(MS_PER_TICK * 5);
    const partWay = handAngles(MS_PER_TICK * 5 + MS_PER_TICK * 0.4);
    expect(partWay.moment).toBeGreaterThan(onTick.moment);
    // …and a whole tick still advances it by exactly one mark, which is the
    // property the stepping was there to make visible.
    const next = handAngles(MS_PER_TICK * 6);
    expect(next.moment - onTick.moment).toBeCloseTo(360 / MARKS);
  });
});

describe('the sketches', () => {
  test('a span index is three seximal digits, 000₆ to 555₆', () => {
    expect(SPANS_PER_DAY).toBe(6 ** 3);
    expect(spanIndex(0)).toBe(0);
    expect(spanIndex(MS_PER_DAY - 1)).toBe(SPANS_PER_DAY - 1);
    expect(seximalTriple(spanIndex(0))).toBe('000');
    expect(seximalTriple(spanIndex(MS_PER_DAY - 1))).toBe('555');
  });

  test('a span is six lulls, so it holds still across five of them', () => {
    const start = MS_PER_MINUTE * 12; // an arbitrary lull boundary
    expect(spanIndex(start + MS_PER_MINUTE * 5)).toBe(spanIndex(start));
    expect(spanIndex(start + MS_PER_MINUTE * 6)).toBe(spanIndex(start) + 1);
  });

  test('the watch is a sixth of the day, six of them', () => {
    expect(watchIndex(0)).toBe(0);
    expect(watchIndex(MS_PER_DAY / 2)).toBe(3);
    expect(watchIndex(MS_PER_DAY - 1)).toBe(5);
  });

  test('watch and breath hands step through six positions only', () => {
    // This is the sketch's own argument against itself: six stops, so they
    // land on every sixth mark and duplicate coarser versions of other hands.
    const seen = new Set();
    for (let i = 0; i < 36; i += 1) {
      seen.add(extraHandAngles((MS_PER_DAY / 36) * i).watch);
    }
    expect(seen.size).toBe(6);
  });
});

describe('six ticks, seven hands', () => {
  test('one hand per rung, outermost first', () => {
    expect(LADDER).toEqual([
      'watch', 'lapse', 'span', 'lull', 'breath', 'moment', 'snap',
    ]);
  });

  test('the seven digits ARE the day in seximal, to the snap', () => {
    expect(ladderDigits(0)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(ladderDigits(MS_PER_DAY - 1)).toEqual([5, 5, 5, 5, 5, 5, 5]);
    // Reading the hands as digits must equal converting the day directly.
    const ms = MS_PER_DAY * 0.4137;
    const asNumber = ladderDigits(ms).reduce((acc, d) => acc * 6 + d, 0);
    expect(asNumber).toBe(Math.floor((ms * 6 ** 7) / MS_PER_DAY));
  });

  test('a digit always sits ON a mark, whatever the hand is doing', () => {
    const angles = ladderAngles(MS_PER_DAY * 0.6183);
    Object.values(angles).forEach((a) => {
      // Distance to the NEAREST mark, not `a % 60`: 5/6 of a turn lands on
      // 299.99999999999994, whose remainder is 59.99…, not 0.
      const rem = a % 60;
      expect(Math.min(rem, 60 - rem)).toBeCloseTo(0);
    });
  });

  test('a hand CROSSES its mark exactly when the digit changes', () => {
    // Asserted on rungs 1–3 only: 6^n divides 86400000 in whole milliseconds
    // while n ≤ 3 (the day carries just 3^3), so those are the boundaries that
    // land exactly rather than near.
    [1, 2, 3].forEach((n) => {
      const step = MS_PER_DAY / 6 ** n;
      const unit = LADDER[n - 1];
      for (let k = 1; k < 6; k += 1) {
        expect(ladderSweepAngles(step * k)[unit])
          .toBeCloseTo(ladderAngles(step * k)[unit]);
      }
    });
  });

  test('…and sits between two marks the whole rest of the way', () => {
    const step = MS_PER_DAY / 6 ** 3; // one span
    const ms = step * 2 + step / 2; // halfway through the third span
    // Still reads as digit 2; drawn half a mark past it.
    expect(ladderAngles(ms).span).toBeCloseTo(120);
    expect(ladderSweepAngles(ms).span).toBeCloseTo(150);
  });

  test('every hand moves on a millisecond — none waits for its own digit', () => {
    const ms = MS_PER_DAY * 0.3183;
    const before = ladderSweepAngles(ms);
    const after = ladderSweepAngles(ms + 1);
    LADDER.forEach((unit) => expect(after[unit]).not.toBe(before[unit]));
  });

  test('each hand turns once per the unit above it', () => {
    // The lapse hand completes a turn in one watch, and starts over.
    const watch = MS_PER_DAY / 6;
    expect(ladderDigit(watch - 1, 2)).toBe(5);
    expect(ladderDigit(watch, 2)).toBe(0);
    expect(ladderDigit(watch, 1)).toBe(1);
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
