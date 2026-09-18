/*
 * Guards the content, not the UI. The glyphs are private-use codepoints taken
 * from the linku API — a typo in one is invisible on screen (it renders as a
 * box, or worse, as the wrong word's glyph) so it has to be caught here.
 */

import {
  acceptedFromGloss,
  buildSession,
  getLevel,
  GLYPHS,
  isCorrect,
  isSelfGraded,
  KIND_LABELS,
  LEVELS,
  missLabels,
  PRODUCTION,
  RULES,
  structureOf,
  taughtIn,
  toGlyphs,
} from './tokipona';

describe('glyphs', () => {
  test('every vocabulary word in every level has one', () => {
    LEVELS.forEach((level) => {
      level.vocab.forEach((v) => {
        expect(typeof v.glyph).toBe('string');
        expect(v.glyph.length).toBeGreaterThan(0);
      });
    });
  });

  test('they are UCSUR private-use codepoints, not latin text', () => {
    Object.entries(GLYPHS).forEach(([word, glyph]) => {
      const cp = glyph.codePointAt(0);
      expect(`${word}:${cp >= 0xf1900 && cp <= 0xf19ff}`).toBe(`${word}:true`);
    });
  });

  test('no two words share a glyph', () => {
    const seen = Object.values(GLYPHS);
    expect(new Set(seen).size).toBe(seen.length);
  });

  test('a sentence renders word by word', () => {
    expect(toGlyphs('mi olin e sina')).toBe(
      GLYPHS.mi + GLYPHS.olin + GLYPHS.e + GLYPHS.sina,
    );
  });

  test('every word used in a sentence has a glyph', () => {
    LEVELS.forEach((level) => {
      const sentences = [
        ...level.toEnglish.map(([tp]) => tp),
        ...level.toTokiPona.map(([, tp]) => tp),
        level.decode[0],
      ];
      sentences.forEach((s) => {
        s.split(/\s+/).forEach((token) => {
          const word = token.replace(/[.,!?;:"']/g, '');
          expect(`${word}:${Boolean(GLYPHS[word])}`).toBe(`${word}:true`);
        });
      });
    });
  });

  test('latin punctuation is stripped, not rendered as a glyph', () => {
    // sitelen pona has no question mark — seme is already the question.
    expect(toGlyphs('sina pilin seme?')).toBe(
      GLYPHS.sina + GLYPHS.pilin + GLYPHS.seme,
    );
    expect(toGlyphs('mi tawa!')).toBe(GLYPHS.mi + GLYPHS.tawa);
  });
});

describe('levels', () => {
  test('all ten are here, in order', () => {
    expect(LEVELS.map((l) => l.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ]);
  });

  test('each has twelve new words and one rule', () => {
    LEVELS.forEach((level) => {
      // Level 10 is the last eleven words — 119 of pu, not 120.
      expect(level.vocab).toHaveLength(level.id === '10' ? 11 : 12);
      expect(level.rule.particle).toBeTruthy();
    });
  });

  test('no word is taught twice', () => {
    const taught = LEVELS.flatMap((l) => l.vocab.map((v) => v.word));
    expect(new Set(taught).size).toBe(taught.length);
  });

  test('every level has the full exercise set', () => {
    LEVELS.forEach((level) => {
      expect(level.glyphReading).toHaveLength(6);
      expect(level.toEnglish).toHaveLength(5);
      expect(level.toTokiPona).toHaveLength(3);
      expect(level.decode).toHaveLength(2);
      expect(level.vocabNote).toBeTruthy();
      expect(level.closingNote).toBeTruthy();
    });
  });

  test('the glyph-reading exercise only uses words from that level', () => {
    LEVELS.forEach((level) => {
      const known = level.vocab.map((v) => v.word);
      level.glyphReading.forEach((w) => expect(known).toContain(w));
    });
  });

  /*
   * w14 #2. Level 1's decode is "moku li pona suli" — a modifier stack, and
   * the only one Level 1 shows, so it stays. What must NOT be said about it is
   * "very": suli is big/important, and the plain intensifier is mute, a Level
   * 3 word. Level 1 has no business saying "very" anywhere.
   */
  test('Level 1 never glosses anything as "very" — mute is a Level 3 word', () => {
    const level1 = getLevel('1');
    const english = [...level1.toEnglish.map(([, en]) => en), level1.decode[1]];
    english.forEach((en) => {
      expect(`${en}:${/\bvery\b/i.test(en)}`).toBe(`${en}:false`);
    });
    expect(level1.decode[0]).toBe('moku li pona suli');
    expect(level1.closingNote).toMatch(/"very" arrives in Level 3, as mute\.$/);
  });

  /*
   * w14 #4. The decode is the capstone — the one sentence assembled from the
   * whole lesson — so it may not be a repeat of a to-English prompt (Level 4
   * once drilled "mi kama sona e toki pona" twice in a 27-item session). And
   * being the capstone, it may only use words the learner has met by then.
   */
  test('the decode sentence is new to its level, not a repeat of a prompt', () => {
    LEVELS.forEach((level) => {
      const prompts = level.toEnglish.map(([tp]) => tp);
      expect(`${level.id}:${prompts.includes(level.decode[0])}`).toBe(
        `${level.id}:false`,
      );
    });
  });

  test('the decode sentence only uses words taught by that level', () => {
    LEVELS.forEach((level) => {
      level.decode[0]
        .split(/\s+/)
        .map((t) => t.replace(/[.,!?;:"']/g, ''))
        .filter((w) => w !== 'li' && w !== 'e')
        .forEach((w) => {
          const from = taughtIn(w);
          const ok = Boolean(from) && Number(from.id) <= Number(level.id);
          expect(`${level.id}/${w}:${ok}`).toBe(`${level.id}/${w}:true`);
        });
    });
  });

  /*
   * w14 #3. Level 5 closes by promising tan's question-partner "in Level 7".
   * A promise across levels is content the later level must keep, or the
   * learner arrives at Level 7 and finds neither tan nor "why" anywhere in it.
   */
  test('Level 7 keeps the question-partner Level 5 promised: tan seme', () => {
    expect(getLevel('5').closingNote).toMatch(/Level 7/);
    expect(getLevel('7').rule.body).toMatch(/tan seme\? "why\?"/);
    expect(getLevel('7').rule.body).toMatch(/mi pali tan seme\?/);
  });

  test('getLevel finds and misses correctly', () => {
    expect(getLevel('1').title).toBe('The first twelve');
    expect(getLevel('99')).toBeNull();
  });
});

describe('sessions', () => {
  const session = buildSession(getLevel('2'));

  test('covers every exercise in the lesson', () => {
    // 6 glyph-readings + 12 words + 5 to-English + 3 to-toki-pona + 1 decode
    expect(session).toHaveLength(27);
  });

  /*
   * This used to read "sentence items are self-graded, word items are not",
   * and that is the behaviour the graded-production work changed. What did NOT
   * change, and is the half worth keeping: translating INTO English is still
   * self-graded, because it has no closed answer set and never will.
   */
  test('into-English is self-graded; word items are not', () => {
    session.forEach((item) => {
      if (item.kind === 'tp-en') {
        expect(isSelfGraded(item)).toBe(true);
        expect(item.accepted).toBeUndefined();
      } else if (item.kind !== 'en-tp') {
        expect(isSelfGraded(item)).toBe(false);
        expect(item.accepted.length).toBeGreaterThan(0);
      }
    });
  });

  test('an into-toki-pona item is graded exactly when PRODUCTION says so', () => {
    LEVELS.forEach((level) => {
      buildSession(level)
        .filter((item) => item.kind === 'en-tp')
        .forEach((item) => {
          const spec = PRODUCTION[item.answer];
          expect(`${item.answer}:${isSelfGraded(item)}`).toBe(
            `${item.answer}:${!spec}`,
          );
        });
    });
  });
});

/*
 * ---------------------------------------------------------------------------
 * Machine-graded production. The whole point is that a near-miss on a particle
 * is marked wrong instead of forgiven, so these tests are mostly about the ONE
 * way that goes bad: marking a correct answer wrong.
 * ---------------------------------------------------------------------------
 */
describe('graded production', () => {
  const specs = Object.entries(PRODUCTION).filter(([, spec]) => spec);

  test('every key is a sentence some level actually asks for', () => {
    const asked = new Set(
      LEVELS.flatMap((l) => l.toTokiPona.map(([, tp]) => tp)),
    );
    Object.keys(PRODUCTION).forEach((key) => {
      expect(`${key}:${asked.has(key)}`).toBe(`${key}:true`);
    });
  });

  test('every sentence the course asks for has a ruling, graded or not', () => {
    LEVELS.forEach((level) => {
      level.toTokiPona.forEach(([, tp]) => {
        // `null` is a ruling — deliberately self-graded. Missing is an oversight.
        expect(`${tp}:${tp in PRODUCTION}`).toBe(`${tp}:true`);
      });
    });
  });

  test('the canonical answer is always accepted', () => {
    LEVELS.forEach((level) => {
      buildSession(level)
        .filter((item) => item.kind === 'en-tp' && !isSelfGraded(item))
        .forEach((item) => {
          expect(`${item.answer}:${isCorrect(item, item.answer)}`).toBe(
            `${item.answer}:true`,
          );
        });
    });
  });

  test('so is every listed variant, punctuation and casing and all', () => {
    LEVELS.forEach((level) => {
      buildSession(level)
        .filter((item) => item.kind === 'en-tp' && !isSelfGraded(item))
        .forEach((item) => {
          item.accepted.forEach((variant) => {
            expect(isCorrect(item, ` ${variant.toUpperCase()}. `)).toBe(true);
          });
        });
    });
  });

  /*
   * THE VARIANT RULE, enforced. A variant may reorder words or add one; it may
   * never differ in its structural tokens. Without this, a well-meant "also"
   * could quietly accept the exact near-miss the grader exists to catch.
   */
  test('no variant differs from the canonical in its particles or prepositions', () => {
    specs.forEach(([canonical, spec]) => {
      const want = structureOf(canonical).slice().sort().join(' ');
      (spec.also || []).forEach((variant) => {
        const got = structureOf(variant).slice().sort().join(' ');
        expect(`${variant}:${got}`).toBe(`${variant}:${want}`);
      });
    });
  });

  test('the near-misses the weak list is made of are marked wrong', () => {
    const level4 = buildSession(getLevel('4'));
    const preverb = level4.find((i) => i.answer === 'mi wile lape');
    // The 26.0724 note's own error: an e that does not belong there.
    expect(isCorrect(preverb, 'mi wile e lape')).toBe(false);
    expect(isCorrect(preverb, 'mi wile lape')).toBe(true);

    const level5 = buildSession(getLevel('5'));
    const preposition = level5.find((i) => i.answer === 'kasi li lon supa');
    expect(isCorrect(preposition, 'kasi li lon e supa')).toBe(false);
    expect(isCorrect(preposition, 'kasi lon supa')).toBe(false); // dropped li
    expect(isCorrect(preposition, 'kasi li lon supa')).toBe(true);

    const level2 = buildSession(getLevel('2'));
    const object = level2.find((i) => i.answer === 'mi wile e telo');
    expect(isCorrect(object, 'mi wile telo')).toBe(false);
    expect(isCorrect(object, 'mi wile e telo')).toBe(true);
  });

  test('conjoined subjects are accepted in either order', () => {
    const item = buildSession(getLevel('10')).find(
      (i) => i.answer === 'mi en sina li kama sona',
    );
    expect(isCorrect(item, 'sina en mi li kama sona')).toBe(true);
    // ...but dropping the li that en brings back is still wrong.
    expect(isCorrect(item, 'mi en sina kama sona')).toBe(false);
  });

  test('the one sentence with free particle placement is left self-graded', () => {
    const item = buildSession(getLevel('6')).find(
      (i) => i.answer === 'mi wile e pan taso',
    );
    expect(isSelfGraded(item)).toBe(true);
  });
});

describe('rule tagging', () => {
  test('every rule named in the table has prose to say out loud', () => {
    Object.values(PRODUCTION).forEach((spec) => {
      if (!spec) return;
      spec.rules.forEach((rule) => {
        expect(`${rule}:${Boolean(RULES[rule])}`).toBe(`${rule}:true`);
      });
    });
  });

  test('no rule is defined that nothing exercises', () => {
    const used = new Set(
      Object.values(PRODUCTION).flatMap((s) => (s ? s.rules : [])),
    );
    Object.keys(RULES).forEach((rule) => {
      expect(`${rule}:${used.has(rule)}`).toBe(`${rule}:true`);
    });
  });

  test('every graded sentence is tagged with at least one rule', () => {
    Object.entries(PRODUCTION).forEach(([tp, spec]) => {
      if (!spec) return;
      expect(`${tp}:${spec.rules.length > 0}`).toBe(`${tp}:true`);
    });
  });

  /*
   * A tag has to be true of the sentence, or the coaching line is a lie. These
   * check the tags whose truth is visible on the surface of the string.
   */
  test('a tag naming a particle is only used where that particle is present', () => {
    const mustContain = {
      'e-after-verb': 'e',
      'la-sets-the-scene': 'la',
      'pi-regroups': 'pi',
      'o-for-commands': 'o',
      'en-joins-subjects': 'en',
      'li-after-noun-subject': 'li',
    };
    Object.entries(PRODUCTION).forEach(([tp, spec]) => {
      if (!spec) return;
      const words = tp
        .toLowerCase()
        .replace(/[.,!?;:"']/g, '')
        .split(/\s+/);
      spec.rules.forEach((rule) => {
        const needed = mustContain[rule];
        if (!needed) return;
        expect(`${tp}/${rule}:${words.includes(needed)}`).toBe(
          `${tp}/${rule}:true`,
        );
      });
    });
  });

  test('a tag saying a particle is ABSENT is only used where it is absent', () => {
    [
      'no-li-after-mi-sina',
      'no-e-after-preverb',
      'no-e-after-preposition',
    ].forEach((rule) => {
      const absent = rule === 'no-li-after-mi-sina' ? 'li' : 'e';
      Object.entries(PRODUCTION).forEach(([tp, spec]) => {
        if (!spec || !spec.rules.includes(rule)) return;
        const words = tp
          .toLowerCase()
          .replace(/[.,!?;:"']/g, '')
          .split(/\s+/);
        // The clause the rule is about must not contain the forbidden particle.
        // For the li rule that is the whole sentence (mi/sina subject, no li);
        // for the e rules it is that no e appears at all in these sentences.
        expect(`${tp}/${rule}:${words.includes(absent)}`).toBe(
          `${tp}/${rule}:false`,
        );
      });
    });
  });

  test('misses are reported by rule where there is one, by kind where there is not', () => {
    expect(
      missLabels({ kind: 'en-tp', rules: ['no-e-after-preverb'] }),
    ).toEqual([RULES['no-e-after-preverb']]);
    // Two rules, two suspects: a weak list, not an apportionment of blame.
    expect(
      missLabels({
        kind: 'en-tp',
        rules: ['li-after-noun-subject', 'no-e-after-preposition'],
      }),
    ).toHaveLength(2);
    expect(missLabels({ kind: 'glyph' })).toEqual([KIND_LABELS.glyph]);
    expect(missLabels({ kind: 'tp-en', rules: [] })).toEqual([
      KIND_LABELS['tp-en'],
    ]);
  });
});

describe('the numbers lesson brings luka back as five', () => {
  /*
   * luka is word 79, taught in Level 7 as the hand. It is ALSO five, and the
   * counting system Level 9 teaches cannot be used without it — for a while
   * Level 9's blurb promised numbers "stack from there" and never supplied
   * the five to stack with (Praxis leaf 9a1c55da). Ruling, 26.0904: option 1
   * — re-introduce luka in the numbers lesson, state the additive rule
   * (luka 5 · mute 20 · ale 100), fix the blurb, and say the stance out loud.
   * `again` cards are how a level does that without teaching a word twice.
   */
  const level9 = getLevel('9');

  test('luka, mute and ale come back as the number cards', () => {
    expect(level9.again.map((v) => v.word)).toEqual(['luka', 'mute', 'ale']);
  });

  test('an again card points back at an earlier level, never at its own', () => {
    LEVELS.forEach((level) => {
      (level.again || []).forEach((v) => {
        const from = taughtIn(v.word);
        expect(`${v.word}:${from && from.id}`).not.toBe(`${v.word}:null`);
        expect(Number(from.id)).toBeLessThan(Number(level.id));
        expect(level.vocab.map((w) => w.word)).not.toContain(v.word);
        expect(v.glyph).toBe(GLYPHS[v.word]);
      });
    });
  });

  test('the again cards are drilled, on top of the full exercise set', () => {
    const session = buildSession(level9);
    expect(session).toHaveLength(27 + level9.again.length);
    const luka = session.find((i) => i.kind === 'word' && i.prompt === 'luka');
    expect(luka.accepted).toContain('five');
  });

  test('the blurb no longer promises a stack it does not supply', () => {
    expect(level9.blurb).not.toMatch(/stop at two/);
    expect(level9.blurb).toMatch(/luka/);
  });

  test('the stance on the number system is stated in the lesson copy', () => {
    expect(level9.vocabNote).toMatch(/luka 5 · mute 20 · ale 100/);
    expect(level9.vocabNote).toMatch(/pu/);
  });

  test('the sentences drill luka as a number, stacked', () => {
    const sentences = [
      ...level9.toEnglish.map(([tp]) => tp),
      ...level9.toTokiPona.map(([, tp]) => tp),
    ];
    expect(sentences.some((s) => s.split(/\s+/).includes('luka'))).toBe(true);
    expect(sentences.some((s) => s.includes('luka tu'))).toBe(true);
  });

  test('taughtIn finds the first teaching and misses with null', () => {
    expect(taughtIn('luka').id).toBe('7');
    expect(taughtIn('zzz')).toBeNull();
  });
});

describe('answer matching', () => {
  const glyphItem = { kind: 'glyph', accepted: ['telo'] };
  const wordItem = { kind: 'word', accepted: ['he', 'she', 'it', 'they'] };

  test('exact for glyph reading', () => {
    expect(isCorrect(glyphItem, 'telo')).toBe(true);
    expect(isCorrect(glyphItem, ' Telo ')).toBe(true);
    expect(isCorrect(glyphItem, 'tomo')).toBe(false);
  });

  test('any listed gloss counts', () => {
    expect(isCorrect(wordItem, 'she')).toBe(true);
    expect(isCorrect(wordItem, 'they')).toBe(true);
    expect(isCorrect(wordItem, 'we')).toBe(false);
  });

  test('empty is never right', () => {
    expect(isCorrect(wordItem, '   ')).toBe(false);
  });
});

describe('the numbers lesson drills the numbers it teaches', () => {
  /*
   * luka is word 79, taught in Level 7 as the hand. It is ALSO five, and the
   * counting system Level 9 teaches — wan 1 · tu 2 · luka 5, stacked — cannot
   * be used without it. For a while Level 9 only said so in its vocabNote, so
   * a learner was told the number five existed and was never once asked to
   * read or write it.
   *
   * It cannot be fixed with a vocab card: no word is taught twice, and the
   * exercise counts above are fixed. It is fixed the way every level already
   * reaches back for earlier vocabulary — in the sentences.
   */
  const level9 = getLevel('9');
  const sentences = [
    ...level9.toEnglish.map(([tp]) => tp),
    ...level9.toTokiPona.map(([, tp]) => tp),
    level9.decode[0],
  ];
  const drills = (w) =>
    sentences.some((s) =>
      s
        .split(/\s+/)
        .map((t) => t.replace(/[.,!?;:"']/g, ''))
        .includes(w),
    );

  test('every number word it names is drilled there, luka included', () => {
    ['wan', 'tu', 'luka'].forEach((w) =>
      expect(`${w}:${drills(w)}`).toBe(`${w}:true`),
    );
  });

  test('it drills the stack, not just the two digits', () => {
    // "luka tu" = 7 is the whole point of counting in fives.
    expect(sentences.some((s) => s.includes('luka tu'))).toBe(true);
  });

  test('drilling luka here did not turn into teaching it twice', () => {
    const taughtIn = LEVELS.filter((l) =>
      l.vocab.some((v) => v.word === 'luka'),
    );
    expect(taughtIn.map((l) => l.id)).toEqual(['7']);
  });
});

/*
 * w14 #13 (= w4 #11a). Six glosses carry a parenthetical — mu "(any animal
 * sound)", la "(sets the scene)", pi "(regroups words)", a "(emphasis)", en
 * "and (joins subjects)", luka "arm (& five)" — and the matcher stripped
 * .,!?;:"' but not ()&, so the ONLY accepted answer for mu was the literal
 * string "(any animal sound)", and "arm" alone was wrong for luka. Two halves
 * to the fix: normalize ignores ()& as well, and a card's accepted list also
 * carries each gloss part with its parenthetical removed.
 */
describe('parenthetical glosses are answerable without the parentheses', () => {
  const card = (levelId, word) =>
    buildSession(getLevel(levelId)).find(
      (i) => i.kind === 'word' && i.prompt === word,
    );

  test('the plain words inside or beside the parentheses are accepted', () => {
    [
      ['4', 'mu', 'any animal sound'],
      ['6', 'la', 'sets the scene'],
      ['7', 'luka', 'hand'],
      ['7', 'luka', 'arm'],
      ['8', 'pi', 'regroups words'],
      ['10', 'en', 'and'],
      ['10', 'a', 'emphasis'],
    ].forEach(([levelId, word, answer]) => {
      expect(`${word}/${answer}:${isCorrect(card(levelId, word), answer)}`).toBe(
        `${word}/${answer}:true`,
      );
    });
  });

  test('widening the match did not make wrong answers right', () => {
    expect(isCorrect(card('4', 'mu'), 'moo')).toBe(false);
    // five is Level 9's again-card sense of luka, not the Level 7 gloss.
    expect(isCorrect(card('7', 'luka'), 'five')).toBe(false);
  });

  test('acceptedFromGloss keeps every part and adds the de-parenthesised one', () => {
    expect(acceptedFromGloss('hand · arm (& five)')).toEqual([
      'hand',
      'arm (& five)',
      'arm',
    ]);
    expect(acceptedFromGloss('and (joins subjects)')).toEqual([
      'and (joins subjects)',
      'and',
    ]);
    // A gloss that is ONLY a parenthetical stays as it is; normalize does the rest.
    expect(acceptedFromGloss('(any animal sound)')).toEqual([
      '(any animal sound)',
    ]);
    expect(acceptedFromGloss('')).toEqual([]);
  });
});
