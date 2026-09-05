/* eslint-env jest */
/*
 * The ballot's data and its vote arithmetic. The prose assertions here are
 * deliberate: an option with no case against it is not an option, it is an
 * advertisement, and that is the failure this page is most likely to drift
 * into as faces get added.
 */
import {
  CLOCK_OPTIONS, DOWN, OPTION_IDS, UP, cleanVotes, countVotes, toggleVote,
} from './options';

describe('the options', () => {
  test('every option carries a header, a description, and both cases', () => {
    CLOCK_OPTIONS.forEach((o) => {
      expect(o.title).toBeTruthy();
      expect(o.subtitle).toBeTruthy();
      expect(o.blurb.length).toBeGreaterThan(80);
      expect(o.pros.length).toBeGreaterThanOrEqual(2);
      expect(o.cons.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('the ids are unique — they key the votes', () => {
    expect(new Set(OPTION_IDS).size).toBe(OPTION_IDS.length);
  });

  test('the face at the top of the page is on the ballot', () => {
    // Otherwise the vote is between alternatives to something unopposed.
    expect(OPTION_IDS[0]).toBe('three-hands');
  });
});

describe('the votes', () => {
  test('a click sets, and the same click again clears', () => {
    const once = toggleVote({}, 'span', UP);
    expect(once).toEqual({ span: UP });
    expect(toggleVote(once, 'span', UP)).toEqual({});
  });

  test('the opposite click replaces rather than clearing', () => {
    expect(toggleVote({ span: UP }, 'span', DOWN)).toEqual({ span: DOWN });
  });

  test('voting on one option leaves the others alone', () => {
    const votes = toggleVote({ span: UP }, 'sextant', DOWN);
    expect(votes).toEqual({ span: UP, sextant: DOWN });
  });

  test('stored junk cannot put the buttons in an unreachable state', () => {
    expect(cleanVotes(null)).toEqual({});
    expect(cleanVotes('nope')).toEqual({});
    expect(cleanVotes({ 'no-such-option': UP })).toEqual({});
    expect(cleanVotes({ span: 7 })).toEqual({});
    expect(cleanVotes({ span: UP, sextant: 'up' })).toEqual({ span: UP });
  });

  test('the tally counts each direction', () => {
    expect(countVotes({})).toEqual({ up: 0, down: 0 });
    expect(countVotes({ span: UP, sextant: UP, 'extra-hands': DOWN }))
      .toEqual({ up: 2, down: 1 });
  });
});
