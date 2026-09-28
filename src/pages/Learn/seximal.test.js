/*
 * Guards the naming spec itself. Every case below is either a worked example
 * from codex 5_culture/interests/seximal/seximal.md or a boundary of the rules
 * stated there. If one of these fails, the drill is teaching the wrong system,
 * which is worse than not existing.
 */

import {
  buildSession,
  fromDigits,
  getLevel,
  isCorrect,
  pairName,
  seximalName,
  toDigits,
} from './seximal';

const s6 = (str) => fromDigits(str);

describe('single words and pairs', () => {
  test('digits below six are ordinary', () => {
    expect(pairName(0)).toBe('zero');
    expect(pairName(5)).toBe('five');
  });

  test('decimal 6 through 11 are irregular single words', () => {
    expect(seximalName(6)).toBe('six'); // 10s6
    expect(seximalName(7)).toBe('seven');
    expect(seximalName(11)).toBe('eleven'); // 15s6
  });

  test('the sixes-place words', () => {
    expect(seximalName(12)).toBe('dozen'); // 20s6
    expect(seximalName(13)).toBe('dozen-one');
    expect(seximalName(17)).toBe('dozen-five');
    expect(seximalName(18)).toBe('thirsy'); // 30s6
    expect(seximalName(24)).toBe('foursy'); // 40s6
    expect(seximalName(30)).toBe('fifsy'); // 50s6
    expect(seximalName(35)).toBe('fifsy-five'); // 55s6
  });
});

describe('nif and pair-reading', () => {
  test('100s6 is nif, spoken bare', () => {
    expect(seximalName(s6('100'))).toBe('nif');
  });

  test('worked examples from the spec', () => {
    expect(seximalName(s6('3251'))).toBe('thirsy-two nif fifsy-one');
    expect(seximalName(s6('5331'))).toBe('fifsy-three nif thirsy-one');
    expect(seximalName(s6('4321'))).toBe('foursy-three nif dozen-one');
    expect(seximalName(s6('1000'))).toBe('six nif');
  });
});

describe('unexian', () => {
  test('worked examples from the spec', () => {
    expect(seximalName(s6('523521'))).toBe(
      'fifsy-two unexian, thirsy-five nif dozen-one',
    );
    expect(seximalName(s6('13132'))).toBe(
      'one unexian, thirsy-one nif thirsy-two',
    );
  });
});

describe('numerals', () => {
  test('round-trips', () => {
    expect(toDigits(42313)).toBe('523521');
    expect(fromDigits('523521')).toBe(42313);
    expect(fromDigits('16')).toBeNull(); // 6 is not a base-six digit
    expect(fromDigits('nif')).toBeNull();
  });
});

describe('answer matching', () => {
  const item = {
    answerMode: 'digits',
    value: 31,
    digits: '51',
    name: 'fifsy-one',
  };

  test('accepts the digits it asked for', () => {
    expect(isCorrect(item, '51')).toBe(true);
    expect(isCorrect(item, ' 51 ')).toBe(true);
    expect(isCorrect(item, '52')).toBe(false);
  });

  test('accepts the spoken name too — it is the harder answer, not a wrong one', () => {
    expect(isCorrect(item, 'fifsy-one')).toBe(true);
    expect(isCorrect(item, 'Fifsy one')).toBe(true);
  });

  test('a name-mode item will not accept digits', () => {
    const named = {
      answerMode: 'name',
      value: 31,
      digits: '51',
      name: 'fifsy-one',
    };
    expect(isCorrect(named, '51')).toBe(false);
    expect(isCorrect(named, 'fifsy-one')).toBe(true);
  });

  test('an empty answer is never right', () => {
    expect(isCorrect(item, '')).toBe(false);
  });

  /*
   * A write-it card PROMPTS with the name ("fifsy-one — write the base-six
   * numeral"). Accepting the name there means typing the prompt back is graded
   * right, which is every write-it card in Levels 1 and 2, free.
   */
  test('a write-it card will not accept its own prompt typed back', () => {
    const writeIt = {
      kind: 'write-it',
      prompt: 'fifsy-one',
      answerMode: 'digits',
      value: 31,
      digits: '51',
      name: 'fifsy-one',
    };
    expect(isCorrect(writeIt, 'fifsy-one')).toBe(false);
    expect(isCorrect(writeIt, 'Fifsy one')).toBe(false);
    expect(isCorrect(writeIt, '51')).toBe(true);
  });

  test('no generated write-it card is answered by its own prompt', () => {
    ['1', '2'].forEach((id) => {
      buildSession(getLevel(id), 60)
        .filter((i) => i.kind === 'write-it')
        .forEach((i) => {
          expect(isCorrect(i, i.prompt)).toBe(false);
          expect(isCorrect(i, i.digits)).toBe(true);
        });
    });
  });
});

describe('the complement drill', () => {
  /*
   * Level 5 teaches nif − XY as a two-digit rule: (five−X)(six−Y). The prompt
   * has to show two digits too, or a learner meets "nif − 4₆" against a rule
   * about pairs and is never told to pad. Math.random is pinned so the
   * generator's first pick (index 0 of [complement, chain]) and the draw of n
   * are both deterministic — no sampling, no flakes.
   */
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('the smallest n is prompted with a leading zero', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0); // pick → complement, n → 1
    const item = getLevel('5').generate();
    expect(item.kind).toBe('complement');
    expect(item.prompt).toBe('nif − 01₆');
    expect(item.value).toBe(35);
    expect(item.digits).toBe('55');
  });

  test('the largest n stays two digits — the pad never adds a third', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0) // pick → complement
      .mockReturnValue(0.99); // n → 35
    const item = getLevel('5').generate();
    expect(item.kind).toBe('complement');
    expect(item.prompt).toBe('nif − 55₆');
    expect(item.prompt).toMatch(/^nif − [0-5]{2}₆$/);
    expect(item.value).toBe(1);
  });

  // The same rule, where the complement is buried inside a chain.
  test('a chain with a complement inside pads it to two digits too', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.99) // pick → chain
      .mockReturnValueOnce(0) // a
      .mockReturnValueOnce(0) // b → 2
      .mockReturnValueOnce(0) // c
      .mockReturnValueOnce(0.99) // → the complement form
      .mockReturnValue(0); // inner → 1
    const item = getLevel('5').generate();
    expect(item.kind).toBe('chain');
    expect(item.prompt).toBe('(nif − 01₆) + 2₆');
    expect(item.value).toBe(37);
  });
});
