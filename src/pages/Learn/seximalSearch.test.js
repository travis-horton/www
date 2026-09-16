/* eslint-env jest */
/*
 * Guards the seximal search INDEX, not the UI (the UI half is in
 * index.test.jsx) — same split as search.test.js.
 */

import { LEVELS, seximalName } from './seximal';
import { HOMES, NAMED_NUMBERS, searchSeximal } from './seximalSearch';

const kinds = (results) => results.map((r) => r.kind);
const numbers = (results) => results.filter((r) => r.kind === 'number');
const levelIds = (result) => result.levels.map((l) => [l.levelId, l.role]);

describe('named numbers (built from seximal.js\'s own naming functions)', () => {
  test('the named numbers are exactly the ones the naming system produces', () => {
    expect(Object.keys(NAMED_NUMBERS).sort()).toEqual([
      'dozen', 'eight', 'eleven', 'fifsy', 'foursy', 'nif', 'nine',
      'seven', 'six', 'ten', 'thirsy', 'unexian',
    ]);
  });

  test('"dozen" is 20₆ = 12, taught in Level 1, and comes up again in Level 4', () => {
    const [r] = searchSeximal('dozen');
    expect(r).toMatchObject({
      kind: 'word', term: 'dozen', digits: '20', value: 12,
    });
    expect(levelIds(r)).toEqual([['1', 'introduces'], ['4', 'mentioned']]);
  });

  test('"nif" is 100₆ = 36, taught in Level 2, and used again by Level 5\'s complements', () => {
    const [r] = searchSeximal('nif');
    expect(r).toMatchObject({ digits: '100', value: 36 });
    expect(levelIds(r)).toEqual([['2', 'introduces'], ['5', 'mentioned']]);
  });

  test('"unexian" is 10000₆ and lives in Level 2', () => {
    const [r] = searchSeximal('unexian');
    expect(r).toMatchObject({ digits: '10000', value: 1296 });
    expect(levelIds(r)).toEqual([['2', 'introduces']]);
  });

  test('where a number is taught goes by size: "ten" is Level 1, even though Level 3\'s blurb says "ten" first-as-decimal', () => {
    const [r] = searchSeximal('ten');
    expect(r).toMatchObject({ digits: '14', value: 10 });
    expect(levelIds(r)).toEqual([['1', 'introduces'], ['3', 'mentioned']]);
  });

  test('seven through eleven, which no blurb names, still land on Level 1', () => {
    ['seven', 'eight', 'nine', 'eleven'].forEach((w) => {
      expect(levelIds(searchSeximal(w)[0])).toEqual([['1', 'introduces']]);
    });
  });

  test('the two homes are derived from the blurbs: "six" in Level 1, "nif" in Level 2', () => {
    expect(HOMES).toEqual({ pair: '1', block: '2' });
  });

  test('is case-insensitive', () => {
    expect(searchSeximal('Thirsy')[0]).toMatchObject({ term: 'thirsy', value: 18 });
  });

  test('zero … five find nothing — they are digits, not seximal words', () => {
    ['zero', 'one', 'two', 'three', 'four', 'five'].forEach((w) => {
      expect(searchSeximal(w)).toEqual([]);
    });
  });
});

describe('spoken names -> value (the inverse of seximalName)', () => {
  test('the spec\'s pair example: "thirsy-two nif fifsy-one" is 3251₆ = 751', () => {
    const [r] = searchSeximal('thirsy-two nif fifsy-one');
    expect(r).toMatchObject({
      kind: 'number', reading: 'name', digits: '3251', value: 751,
    });
    expect(levelIds(r)).toEqual([['2', 'reads']]);
  });

  test('the spec\'s unexian example: "fifsy-two unexian, thirsy-five nif dozen-one" is 523521₆', () => {
    const [r] = searchSeximal('fifsy-two unexian, thirsy-five nif dozen-one');
    expect(r).toMatchObject({ digits: '523521', value: 42313 });
  });

  test('forgiving about case, hyphens and commas, like the drill', () => {
    expect(searchSeximal('Thirsy Two NIF fifsy one')[0]).toMatchObject({ value: 751 });
  });

  test('"dozen-three" is a Level 1 number (below nif)', () => {
    const [r] = searchSeximal('dozen-three');
    expect(r).toMatchObject({ digits: '23', value: 15 });
    expect(levelIds(r)).toEqual([['1', 'reads']]);
  });

  test('"one nif" is accepted alongside the canonical bare "nif ..."', () => {
    expect(searchSeximal('one nif dozen')[0]).toMatchObject({ value: 36 + 12 });
    expect(searchSeximal('nif dozen')[0]).toMatchObject({ value: 36 + 12 });
  });

  test('round trip: every number from six to 5555₆ is found by its own name', () => {
    for (let n = 6; n < 1296; n += 1) {
      const found = searchSeximal(seximalName(n)).some((r) => r.value === n);
      if (!found) throw new Error(`${n} (${seximalName(n)}) was not found by its name`);
    }
  });

  test('round trip above unexian', () => {
    [1296, 1297, 1296 * 7, 42313, 1296 * 35 + 1295].forEach((n) => {
      expect(searchSeximal(seximalName(n)).some((r) => r.value === n)).toBe(true);
    });
  });

  test('a phrase that is not a seximal name finds nothing ("twenty three")', () => {
    expect(numbers(searchSeximal('twenty three'))).toEqual([]);
  });
});

describe('numerals — both readings when it could be either', () => {
  test('"20" comes back as 20₆ (= 12, dozen) first, then decimal 20 (= 32₆, thirsy-two)', () => {
    expect(numbers(searchSeximal('20')).map((r) => [r.reading, r.value, r.digits, r.term])).toEqual([
      ['seximal', 12, '20', 'dozen'],
      ['decimal', 20, '32', 'thirsy-two'],
    ]);
  });

  test('"36" has a 6 in it, so it can only be decimal: nif', () => {
    expect(numbers(searchSeximal('36')).map((r) => [r.reading, r.term])).toEqual([
      ['decimal', 'nif'],
    ]);
  });

  test('"20₆" and "20s6" pin the reading to base six', () => {
    ['20₆', '20s6', '20 s6'].forEach((q) => {
      expect(numbers(searchSeximal(q)).map((r) => [r.reading, r.value])).toEqual([['seximal', 12]]);
    });
  });

  test('a single digit 0-5 is the same number in both bases and comes back once', () => {
    expect(numbers(searchSeximal('5')).map((r) => r.term)).toEqual(['five']);
  });

  test('a numeral links to the level where numbers that size are read', () => {
    expect(levelIds(numbers(searchSeximal('55'))[0])).toEqual([['1', 'reads']]);
    expect(levelIds(numbers(searchSeximal('100'))[0])).toEqual([['2', 'reads']]);
  });

  test('numbers past the naming system\'s range (6^8 and up) do not throw, they just drop out', () => {
    expect(() => searchSeximal('999999999999')).not.toThrow();
    expect(searchSeximal('100000000')).toEqual([]); // 6^8 in base six, 100 million in decimal
  });
});

describe('topics (level titles and blurbs)', () => {
  test('"carry" finds Level 3 through the blurb\'s "carries"', () => {
    expect(searchSeximal('carry')).toEqual([expect.objectContaining({ kind: 'topic', levelId: '3' })]);
  });

  test('"complement" finds Level 5, "borrows" Level 3, "division" Level 4', () => {
    expect(searchSeximal('complement').map((r) => r.levelId)).toEqual(['5']);
    expect(searchSeximal('borrows').map((r) => r.levelId)).toEqual(['3']);
    expect(searchSeximal('division').map((r) => r.levelId)).toEqual(['4']);
  });

  test('a multi-word topic ANDs: "times table" is Level 4, "place value" is Level 2', () => {
    expect(searchSeximal('times table').map((r) => r.levelId)).toEqual(['4']);
    expect(searchSeximal('place value').map((r) => r.levelId)).toEqual(['2']);
  });

  test('function words in the blurbs are not topics', () => {
    ['the', 'and', 'of', 'instead'].forEach((w) => expect(searchSeximal(w)).toEqual([]));
  });

  test('number words are never topics — "nif" is one word result, not also three level results', () => {
    expect(kinds(searchSeximal('nif'))).toEqual(['word']);
    expect(kinds(searchSeximal('five'))).toEqual([]);
  });

  test('every level is reachable by the first word of its own title', () => {
    LEVELS.forEach((level) => {
      const first = level.title.split(/\s/)[0];
      expect(searchSeximal(first).map((r) => r.levelId)).toContain(level.id);
    });
  });
});

describe('no match', () => {
  test('blank input finds nothing (and does not throw)', () => {
    expect(searchSeximal('')).toEqual([]);
    expect(searchSeximal('   ')).toEqual([]);
  });

  test('a query that is none of the four finds nothing', () => {
    expect(searchSeximal('zzzzzz')).toEqual([]);
  });
});
