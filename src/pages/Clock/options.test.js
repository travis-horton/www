/* eslint-env jest */
/*
 * The ballot's data. The prose assertions here are deliberate: an option with
 * no case against it is not an option, it is an advertisement, and that is the
 * failure this page is most likely to drift into as faces get added.
 *
 * The vote arithmetic that used to be tested here went out with the buttons on
 * 26.0905. It comes back when there is a backend to count against.
 */
import { CLOCK_OPTIONS, OPTION_IDS } from './options';

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
