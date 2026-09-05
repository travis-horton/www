/*
 * /clock — one day-fraction, two notations.
 *
 * The day is cut into 36 hours, each hour into 36 minutes, each minute into 36
 * seconds: 36 × 36 × 36 = 46656 = 6^6 = 1000000₆ ticks a day. Every count is a
 * nif (100₆), so each unit is exactly two seximal digits wide — or exactly ONE
 * niftimal (base-36) digit. That is the whole relationship between the two
 * modes: the same number, written six digits at a time or three.
 *
 * The split is the one the 2024 seximal_clock project already uses
 * (src/pages/Programming/projects/seximal_clock/constants.js), so the two clocks
 * on the site agree with each other. README.md alongside has the decomposition.
 *
 * Names come from the /learn seximal module, the one place the naming spec
 * (codex 5_culture/interests/seximal/seximal.md) is encoded — nothing about the
 * words is restated here. A niftimal digit's spoken name IS its seximal pair
 * name: 'H' is 17 is "dozen-five". So both modes speak identically and only
 * the written form changes.
 */
import { pairName, seximalName, toDigits } from '../Learn/seximal';

export const NIF = 36;
export const HOURS_PER_DAY = NIF;
export const MINUTES_PER_HOUR = NIF;
export const SECONDS_PER_MINUTE = NIF;
export const TICKS_PER_DAY = NIF * NIF * NIF; // 46656 = 1000000₆

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** A seximal second in real milliseconds: 1851.85… */
export const MS_PER_TICK = MS_PER_DAY / TICKS_PER_DAY;
/** A seximal minute: 66.67 real seconds. */
export const MS_PER_MINUTE = MS_PER_DAY / (NIF * NIF);
/** A seximal hour: exactly 40 real minutes. */
export const MS_PER_HOUR = MS_PER_DAY / NIF;

export const NIFTIMAL_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ---------------------------------------------------------------------------
// Base conversions
// ---------------------------------------------------------------------------

/** One niftimal digit for decimal 0..35. */
export const niftimalDigit = (n) => {
  if (!Number.isInteger(n) || n < 0 || n >= NIF) {
    throw new RangeError(`niftimal digit out of range: ${n}`);
  }
  return NIFTIMAL_DIGITS[n];
};

/** Decimal value of one niftimal digit (either case), or null if it isn't one. */
export const niftimalValue = (ch) => {
  const s = String(ch);
  if (s.length !== 1) return null;
  const i = NIFTIMAL_DIGITS.indexOf(s.toUpperCase());
  return i === -1 ? null : i;
};

/** Decimal -> niftimal numeral string. */
export const toNiftimal = (n) => {
  if (n === 0) return '0';
  let rest = n;
  let out = '';
  while (rest > 0) {
    out = NIFTIMAL_DIGITS[rest % NIF] + out;
    rest = Math.floor(rest / NIF);
  }
  return out;
};

/** Niftimal numeral string -> decimal, or null if it isn't one. */
export const fromNiftimal = (s) => {
  const trimmed = String(s).trim().toUpperCase();
  if (!/^[0-9A-Z]+$/.test(trimmed)) return null;
  return trimmed.split('').reduce((acc, d) => acc * NIF + niftimalValue(d), 0);
};

/** Decimal 0..35 as a two-digit seximal pair, zero-padded: 17 -> "25". */
export const seximalPair = (n) => toDigits(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// The day
// ---------------------------------------------------------------------------

/**
 * Milliseconds since LOCAL midnight. Deliberately not `getTime() % MS_PER_DAY`,
 * which is midnight UTC — seven hours off in Boise.
 */
export const msSinceLocalMidnight = (date) => (
  ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000
  + date.getMilliseconds()
);

/**
 * Whole ticks (seximal seconds) since local midnight, 0..46655. Multiplying
 * before dividing keeps this in exact integer arithmetic; MS_PER_TICK itself
 * is not representable, and 16:00 must come out as exactly 31104, not 31103.
 */
export const ticksSinceMidnight = (date) => (
  Math.floor((msSinceLocalMidnight(date) * TICKS_PER_DAY) / MS_PER_DAY)
);

export const splitTicks = (ticks) => ({
  hour: Math.floor(ticks / (NIF * NIF)),
  minute: Math.floor(ticks / NIF) % NIF,
  second: ticks % NIF,
});

export const joinTicks = ({ hour, minute, second }) => (
  (hour * NIF + minute) * NIF + second
);

export const dayFraction = (ticks) => ticks / TICKS_PER_DAY;

// ---------------------------------------------------------------------------
// The two faces
// ---------------------------------------------------------------------------

const UNITS = ['hour', 'minute', 'second'];

const face = (ticks, write) => {
  const parts = splitTicks(ticks);
  return UNITS.map((u) => write(parts[u])).join(':');
};

/** "23:41:05" — three seximal pairs. */
export const seximalTime = (ticks) => face(ticks, seximalPair);

/** "F:P:5" — the same three numbers, one niftimal digit each. */
export const niftimalTime = (ticks) => face(ticks, niftimalDigit);

/** The spoken name of each unit. Identical in both modes — that is the point. */
export const unitNames = (ticks) => {
  const parts = splitTicks(ticks);
  return {
    hour: pairName(parts.hour),
    minute: pairName(parts.minute),
    second: pairName(parts.second),
  };
};

/**
 * The whole time read as ONE seximal number. Because an hour is a nif of
 * minutes and a minute is a nif of seconds, hh:mm:ss₆ is hhmmss₆, and the
 * spec's pair-reading gives "<hour> unexian, <minute> nif <second>" for free.
 */
export const spokenTime = (ticks) => seximalName(ticks);

const pad2 = (n) => String(n).padStart(2, '0');

/** The ordinary clock, for orientation: "16:00:00". */
export const decimalTime = (date) => (
  [date.getHours(), date.getMinutes(), date.getSeconds()].map(pad2).join(':')
);

/*
 * The units have proper names, from seximal.net/units, and they are the units
 * this clock already had. The page writes its own numbers in seximal, which is
 * what makes the definitions look wrong at a glance:
 *
 *   a lapse  is a "niftiday"   — 1/36 of a day       — "nif four minutes" = 40 min
 *   a lull   is an "untiday"   — 1/1296 of a day     — "10.4 seconds longer than
 *                                                      a minute", and 10.4₆ is
 *                                                      6.67, so 66.67 s
 *   a moment is a "niftilull"  — 1/46656 of a day    — "exactly 1.504 seconds",
 *                                                      and 1.504₆ is 1.8518
 *
 * 40 min · 66.67 s · 1.85 s are exactly this clock's hour, minute and second,
 * so the generic names were placeholders for these. A moment is the tick.
 *
 * The list below names each unit against its PARENT — niftiday, niftilapse,
 * niftilull — so the three read as one ladder. seximal.net names the lull
 * against the day instead ("an untiday"), which is the same quantity by a
 * different route: a nif of nifs is an un, so a niftilapse IS an untiday. Its
 * word is kept in parentheses, since that is what a reader will find there.
 */
export const UNIT_NAMES = {
  hour: 'lapse',
  minute: 'lull',
  second: 'moment',
};

/*
 * What each unit is, in one line, for the page: name, gloss, fraction of a
 * day, the sign, the SI length.
 *
 * The sign is per row and it is not decoration, and where it flips is a fact
 * about the numbers rather than a choice. A day is 86400 s = 2^7 · 3^3 · 5^2,
 * and 6^n = 2^n · 3^n, so 6^n divides the day exactly while n ≤ 3 — the three
 * of them needed by the 3^3. Watch, lapse and span therefore land whole in
 * ordinary units (4 h · 40 min · 6 min 40 s) and everything below the span
 * repeats: a lull is 66.666… s, a breath 11.111…, a moment 1.85185…, a snap
 * 0.30864…. The day itself is "≈" for a different reason: it is the Earth
 * turning, which is only near 24 h.
 *
 * SOURCES, and the page says which is which. The Misalian units are jan
 * Misali's; the span and snap are Justin Kunimune's, adopted as canon on
 * seximal.net. The watch and the breath are NOT canon — they are ours, filling
 * the 6^1 and 6^5 rungs the published ladder skips, and the page labels them
 * so nobody carries them off as official. "Watch" because a ship's watch is
 * already four hours, six to a day; "breath" because a slow breath is about
 * eleven seconds, which gives it the same body-paced justification the snap
 * has. (There is no canonical "sixti-" prefix, so these are glossed "a sixth
 * of a day" and "a sixth of a lull" rather than coined by analogy.)
 */
export const UNIT_DEFINITIONS = [
  ['day', 'the Earth turning once', '1', '≈', '24 h', 'Misalian'],
  ['watch', 'a sixth of a day — six in a day, as at sea', '1/10₆ day', '=', '4 h', 'proposed here'],
  ['lapse', 'a niftiday — a nif of them in a day', '1/100₆ day', '=', '40 min', 'Misalian'],
  ['span', 'a sixth of a lapse — six nif in a day, so the time is one number', '1/1000₆ day', '=', '6 min 40 s', 'Kunimunean'],
  ['lull', 'a niftilapse (seximal.net: an untiday) — a nif in a lapse', '1/10000₆ day', '≈', '1 min 6.7 s', 'Misalian'],
  ['breath', 'a sixth of a lull — about one slow breath', '1/100000₆ day', '≈', '11.1 s', 'proposed here'],
  ['moment', 'a niftilull — a nif in a lull, and the tick of this clock', '1/1000000₆ day', '≈', '1.85 s', 'Misalian'],
  ['snap', 'a sixth of a moment — near the pace of a syllable', '1/10000000₆ day', '≈', '0.309 s', 'Kunimunean'],
];

/**
 * Milliseconds from `date` to the next whole tick, 1..MS_PER_TICK.
 *
 * A tick is 1851.851… ms, which is not representable, so the boundary is
 * derived by integer arithmetic on the tick INDEX — ceil of (n+1) × ms/day ÷
 * ticks/day — rather than by adding a rounded period. Adding a rounded 1852 ms
 * would gain a whole tick roughly every nine minutes; adding 1851 would lose
 * one about as fast. Re-deriving from the wall clock each time also absorbs a
 * throttled background tab, which a fixed interval cannot.
 */
export const msToNextTick = (date) => {
  const next = Math.ceil(((ticksSinceMidnight(date) + 1) * MS_PER_DAY) / TICKS_PER_DAY);
  return Math.max(1, next - msSinceLocalMidnight(date));
};
