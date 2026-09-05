/* eslint-env jest */
/*
 * Base conversions and digit naming for /clock. The naming words themselves
 * are pinned by Learn/seximal.test.js; what is pinned here is that the clock
 * splits the day the way it says it does, and that a niftimal digit is named
 * by its seximal pair — 'H' is 17 is "dozen-five".
 */
import {
  dayFraction,
  decimalTime,
  fromNiftimal,
  joinTicks,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_TICK,
  msSinceLocalMidnight,
  msToNextTick,
  niftimalDigit,
  niftimalTime,
  niftimalValue,
  seximalPair,
  seximalTime,
  splitTicks,
  spokenTime,
  TICKS_PER_DAY,
  ticksSinceMidnight,
  toNiftimal,
  unitNames,
} from './clock';

// All local-time constructors: the clock is local, so the tests are too.
const at = (h, m, s, ms = 0) => new Date(2026, 8, 4, h, m, s, ms);

describe('the split of the day', () => {
  test('a day is 6^6 ticks, three nifs deep', () => {
    expect(TICKS_PER_DAY).toBe(46656);
    expect(TICKS_PER_DAY).toBe(6 ** 6);
  });

  test('a seximal hour is 40 real minutes, a minute 66.7 s, a second 1.85 s', () => {
    expect(MS_PER_HOUR).toBe(40 * 60 * 1000);
    expect(MS_PER_MINUTE).toBeCloseTo(66666.67, 1);
    expect(MS_PER_TICK).toBeCloseTo(1851.85, 1);
  });
});

describe('niftimal digits', () => {
  test('0-9 then A-Z', () => {
    expect(niftimalDigit(0)).toBe('0');
    expect(niftimalDigit(9)).toBe('9');
    expect(niftimalDigit(10)).toBe('A');
    expect(niftimalDigit(17)).toBe('H');
    expect(niftimalDigit(35)).toBe('Z');
  });

  test('reject anything that is not a digit of base thirty-six', () => {
    expect(() => niftimalDigit(36)).toThrow(RangeError);
    expect(() => niftimalDigit(-1)).toThrow(RangeError);
    expect(() => niftimalDigit(1.5)).toThrow(RangeError);
  });

  test('digit values, either case', () => {
    expect(niftimalValue('A')).toBe(10);
    expect(niftimalValue('a')).toBe(10);
    expect(niftimalValue('Z')).toBe(35);
    expect(niftimalValue('7')).toBe(7);
    expect(niftimalValue('!')).toBeNull();
    expect(niftimalValue('AB')).toBeNull();
  });

  test('numerals round-trip', () => {
    expect(toNiftimal(0)).toBe('0');
    expect(toNiftimal(35)).toBe('Z');
    expect(toNiftimal(36)).toBe('10');
    expect(toNiftimal(46655)).toBe('ZZZ');
    expect(fromNiftimal('ZZZ')).toBe(46655);
    expect(fromNiftimal('zzz')).toBe(46655);
    expect(fromNiftimal('10')).toBe(36);
    expect(fromNiftimal('1:0')).toBeNull();
    for (let n = 0; n < 2000; n += 7) {
      expect(fromNiftimal(toNiftimal(n))).toBe(n);
    }
  });

  test('a niftimal digit is two seximal digits', () => {
    expect(seximalPair(0)).toBe('00');
    expect(seximalPair(5)).toBe('05');
    expect(seximalPair(6)).toBe('10');
    expect(seximalPair(17)).toBe('25');
    expect(seximalPair(35)).toBe('55');
  });
});

describe('ticks since midnight', () => {
  test('local midnight is zero, not midnight UTC', () => {
    expect(msSinceLocalMidnight(at(0, 0, 0))).toBe(0);
    expect(ticksSinceMidnight(at(0, 0, 0))).toBe(0);
  });

  test('the last millisecond of the day is the last tick', () => {
    expect(msSinceLocalMidnight(at(23, 59, 59, 999))).toBe(86399999);
    expect(ticksSinceMidnight(at(23, 59, 59, 999))).toBe(46655);
  });

  test('whole seximal hours land exactly', () => {
    expect(ticksSinceMidnight(at(0, 40, 0))).toBe(1296); // hour 1
    expect(ticksSinceMidnight(at(12, 0, 0))).toBe(23328); // hour 18 = 30₆
    expect(ticksSinceMidnight(at(16, 0, 0))).toBe(31104); // hour 24 = 40₆
  });

  test('a real second is not quite a tick', () => {
    expect(ticksSinceMidnight(at(0, 0, 1))).toBe(0);
    expect(ticksSinceMidnight(at(0, 0, 2))).toBe(1);
  });
});

describe('splitting and joining', () => {
  test('hour, minute, second', () => {
    expect(splitTicks(0)).toEqual({ hour: 0, minute: 0, second: 0 });
    expect(splitTicks(31104)).toEqual({ hour: 24, minute: 0, second: 0 });
    expect(splitTicks(46655)).toEqual({ hour: 35, minute: 35, second: 35 });
  });

  test('round-trips', () => {
    for (let n = 0; n < TICKS_PER_DAY; n += 97) {
      expect(joinTicks(splitTicks(n))).toBe(n);
    }
  });

  test('day fraction', () => {
    expect(dayFraction(0)).toBe(0);
    expect(dayFraction(23328)).toBe(0.5);
  });
});

describe('the two faces', () => {
  const t = joinTicks({ hour: 15, minute: 25, second: 5 }); // 23:41:05₆

  test('seximal is three zero-padded pairs', () => {
    expect(seximalTime(0)).toBe('00:00:00');
    expect(seximalTime(t)).toBe('23:41:05');
    expect(seximalTime(31104)).toBe('40:00:00');
    expect(seximalTime(46655)).toBe('55:55:55');
  });

  test('niftimal is the same three numbers, one glyph each', () => {
    expect(niftimalTime(0)).toBe('0:0:0');
    expect(niftimalTime(t)).toBe('F:P:5');
    expect(niftimalTime(31104)).toBe('O:0:0');
    expect(niftimalTime(46655)).toBe('Z:Z:Z');
  });

  test('the faces agree with the generic conversion', () => {
    expect(niftimalTime(t).replace(/:/g, '')).toBe(toNiftimal(t).padStart(3, '0'));
  });
});

describe('digit naming', () => {
  test('each unit is named by its seximal pair', () => {
    expect(unitNames(31104)).toEqual({ hour: 'foursy', minute: 'zero', second: 'zero' });
    expect(unitNames(joinTicks({ hour: 15, minute: 25, second: 5 })))
      .toEqual({ hour: 'dozen-three', minute: 'foursy-one', second: 'five' });
  });

  test('a niftimal glyph is spoken as its pair name', () => {
    const spoken = (glyph) => unitNames(joinTicks({
      hour: niftimalValue(glyph), minute: 0, second: 0,
    })).hour;
    expect(spoken('6')).toBe('six');
    expect(spoken('A')).toBe('ten');
    expect(spoken('B')).toBe('eleven');
    expect(spoken('C')).toBe('dozen');
    expect(spoken('H')).toBe('dozen-five');
    expect(spoken('I')).toBe('thirsy');
    expect(spoken('O')).toBe('foursy');
    expect(spoken('U')).toBe('fifsy');
    expect(spoken('Z')).toBe('fifsy-five');
  });

  test('the whole time reads as one number by the pair rule', () => {
    expect(spokenTime(0)).toBe('zero');
    expect(spokenTime(joinTicks({ hour: 15, minute: 25, second: 5 })))
      .toBe('dozen-three unexian, foursy-one nif five');
    expect(spokenTime(46655)).toBe('fifsy-five unexian, fifsy-five nif fifsy-five');
    expect(spokenTime(31104)).toBe('foursy unexian');
  });

  test('a leading one-nif minute is spoken bare, per the /learn module', () => {
    // 00:01:05₆ — same open question as blockName in Learn/seximal.js.
    expect(spokenTime(joinTicks({ hour: 0, minute: 1, second: 5 }))).toBe('nif five');
  });
});

describe('the decimal clock', () => {
  test('zero-padded 24-hour', () => {
    expect(decimalTime(at(0, 0, 0))).toBe('00:00:00');
    expect(decimalTime(at(16, 5, 9))).toBe('16:05:09');
  });
});

describe('ticking on the seximal second', () => {
  test('the wait always lands on the next tick, never inside one', () => {
    // The relationship, not a pinned literal: from any instant, waiting
    // msToNextTick lands on a tick index exactly one higher.
    [at(0, 0, 0), at(0, 0, 1, 7), at(9, 41, 33, 555), at(16, 0, 0), at(23, 59, 58)]
      .forEach((d) => {
        const landed = new Date(d.getTime() + msToNextTick(d));
        expect(ticksSinceMidnight(landed)).toBe(ticksSinceMidnight(d) + 1);
      });
  });

  test('the wait is a positive span no longer than one tick', () => {
    [at(0, 0, 0), at(4, 20, 0, 1), at(16, 0, 0), at(21, 15, 45, 999)].forEach((d) => {
      const wait = msToNextTick(d);
      expect(wait).toBeGreaterThan(0);
      expect(wait).toBeLessThanOrEqual(Math.ceil(MS_PER_TICK));
    });
  });

  test('re-aiming each tick does not drift over a whole hour of them', () => {
    // 36 ticks is a seximal minute; walking them by repeated re-aim must end
    // exactly 36 ticks on, which a rounded fixed period would not.
    let d = at(11, 11, 11, 11);
    const start = ticksSinceMidnight(d);
    for (let i = 0; i < 36; i += 1) d = new Date(d.getTime() + msToNextTick(d));
    expect(ticksSinceMidnight(d)).toBe(start + 36);
  });

  test('a decimal-second interval would NOT do this — the bug it replaces', () => {
    // 1000 ms lands inside the same tick more often than not: that is why the
    // face repeated, then skipped.
    const d = at(9, 41, 33, 0);
    const afterOneDecimalSecond = new Date(d.getTime() + 1000);
    expect(ticksSinceMidnight(afterOneDecimalSecond)).toBe(ticksSinceMidnight(d));
  });
});
