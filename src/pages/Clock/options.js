/*
 * The clock options, as data (Travis, 26.0905: "lay out the various clock
 * options at the bottom each with a header and description, pros and cons").
 *
 * Kept out of the component so the argument can be read and tested as prose
 * rather than dug out of JSX. Each option carries the case FOR and the case
 * AGAINST, and the case against is written to be as strong as the case for —
 * a ballot where one entry has three pros and no cons is not a ballot.
 *
 * The order is the order they were built, which is also roughly the order of
 * how much they ask of the reader. The first is the face at the top of the
 * page: the incumbent belongs on the ballot, or the vote is between
 * alternatives to something nobody voted on.
 */

export const CLOCK_OPTIONS = [
  {
    id: 'three-hands',
    title: 'Three hands on a thirty-six mark dial',
    subtitle: 'the face at the top of this page',
    blurb: `A lapse hand turning once a day, a lull hand once a lapse, a moment
      hand once a lull. Thirty-six marks, a major every sixth. Each hand's
      position is two seximal digits — which sixth of the dial, then which
      sixth of that sixth — and two seximal digits are one niftimal digit.`,
    pros: [
      'Three hands, so it reads like a clock anyone already owns.',
      'A hand\'s position IS a seximal pair, so the face teaches the pair rule by pointing at it instead of asserting it.',
      'Both notations live on the same tick: the inner ring carries the pair, the outer carries the glyph.',
    ],
    cons: [
      'Thirty-six marks is a thicket at the size a page actually shows a clock.',
      'The base is six, but the dial shows thirty-six — it argues for niftimal at least as loudly as for seximal.',
      'Watch, span, breath and snap have nowhere to appear on it.',
    ],
  },
  {
    id: 'span',
    title: 'The span, as one number',
    subtitle: 'no hands, no colons',
    blurb: `The whole time as a single three-digit seximal number, 000 to 555.
      There are six nif of spans in a day, which is exactly three digits wide,
      so the time is one number you can say without punctuation.`,
    pros: [
      'The shortest possible reading: one number, three digits, no colons.',
      'It is what Justin Kunimune proposed the span FOR, so the unit and the display were designed together.',
      'Trivially speakable, and trivially writable in a note.',
    ],
    cons: [
      'Resolution stops at 6 min 40 s — fine for an appointment, useless for a stopwatch.',
      'A bare number gives no sense of WHERE in the day you are; you have to already know the scale.',
      'Nothing to glance at. A number has to be read.',
    ],
  },
  {
    id: 'extra-hands',
    title: 'Watch and breath as extra hands',
    subtitle: 'the two proposed rungs, added to the existing face',
    blurb: `Keep the thirty-six mark dial and hang two more hands on it: a short
      thick one for the watch (a sixth of the day) and a thin one for the
      breath (a sixth of a lull). Both step rather than sweep.`,
    pros: [
      'Gives the two rungs we proposed somewhere to actually appear.',
      'Costs no new dial — it reuses the face already on the page.',
    ],
    cons: [
      'Both step through six positions only, so each is a coarser duplicate of a hand already there: the watch of the lapse, the breath of the moment.',
      'Five hands on thirty-six marks is crowded past reading.',
      'It adds hands without adding information, which is the worst trade on a clock face.',
    ],
  },
  {
    id: 'sextant',
    title: 'The watch as a wedge',
    subtitle: 'a region, not a pointer',
    blurb: `A watch is a sixth of the day and the dial already has six major
      marks, so the current watch is the wedge between two of them. Shade it
      rather than pointing at it.`,
    pros: [
      'The region is already drawn — six major marks means six wedges, at no cost.',
      'No new hand, so nothing gets more crowded.',
      'Reads at a glance as which part of the day it is, which is the one thing a four-hour unit is good for.',
    ],
    cons: [
      'Four hours is coarse. The wedge is right for a third of a working day.',
      'It can show the watch and nothing below it, so it is a one-rung idea.',
      'A shaded sixth competes with the hands for the same ink.',
    ],
  },
  {
    id: 'seven-hands',
    title: 'Six ticks, seven hands',
    subtitle: 'one hand per rung, one digit per hand',
    blurb: `Six marks. One hand for each step down the ladder: the watch hand
      says which sixth of the day, the lapse hand which sixth of the watch, and
      so on to the snap. The mark each hand has last passed is one seximal
      digit, so the seven read together as the whole day, 0000000 to 5555555 —
      6⁷ = 279936 snaps.`,
    pros: [
      'Six marks, six of everything: the face is finally honest about the base it is arguing for.',
      'One digit per hand, and the seven hands together are the entire day down to its finest named unit.',
      'Every rung of the ladder appears, including the two we had to invent.',
      'Thickness and darkness run opposite ways, so no rung shouts over the others.',
    ],
    cons: [
      'Seven hands is a great deal to disentangle at a glance.',
      'You have to know the hand order to read it; the key underneath is not optional.',
      'The snap hand completes a revolution every 1.85 s, which is busy on a page you leave open.',
      'Nobody has ever read a clock this way, so every viewer starts from zero.',
    ],
  },
];

export const OPTION_IDS = CLOCK_OPTIONS.map((o) => o.id);

export const VOTES_KEY = 'travish.clock.votes';

export const UP = 1;
export const DOWN = -1;

/**
 * Votes are per-browser, and that is a real limitation rather than a stage in
 * getting somewhere: there is no API behind this page yet, so nothing can be
 * counted across devices or people. The page says so where the buttons are,
 * because a vote button that silently goes nowhere is worse than no button.
 *
 * Unknown ids and unknown values are dropped on read, so an old or hand-edited
 * key cannot put the UI into a state the buttons cannot express.
 */
export const cleanVotes = (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  return Object.fromEntries(
    Object.entries(raw).filter(
      ([id, v]) => OPTION_IDS.includes(id) && (v === UP || v === DOWN),
    ),
  );
};

/** Clicking the vote you already hold clears it — three states, two buttons. */
export const toggleVote = (votes, id, value) => {
  const next = { ...votes };
  if (next[id] === value) delete next[id];
  else next[id] = value;
  return next;
};

/** The tally, for the summary line: how many of each the reader has marked. */
export const countVotes = (votes) => Object.values(votes).reduce(
  (acc, v) => ({
    up: acc.up + (v === UP ? 1 : 0),
    down: acc.down + (v === DOWN ? 1 : 0),
  }),
  { up: 0, down: 0 },
);
