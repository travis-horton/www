/*
 * toki pona — the course content.
 *
 * Transcribed from Travis's own ten-level worksheet set (jan Tawi, July 2026),
 * codex 5_culture/interests/languages/toki_pona/anne/. Each level keeps that
 * material's shape: twelve new words with their glyphs, one grammar rule, then
 * translation both directions and a sentence to decode.
 *
 * sitelen pona glyphs are UCSUR codepoints, taken from the linku API
 * (api.linku.la) rather than typed by hand. The font shipped with the site is
 * the UCSUR-only build of nasin-nanpa, which has NO latin ligatures — writing
 * "mi" would render as "mi", not as a glyph. Every glyph here must therefore be
 * an explicit codepoint, and GLYPHS below is the single place they live.
 */

export const GLYPHS = {
  a: '\u{F1900}',
  akesi: '\u{F1901}',
  ala: '\u{F1902}',
  alasa: '\u{F1903}',
  ale: '\u{F1904}',
  anpa: '\u{F1905}',
  ante: '\u{F1906}',
  anu: '\u{F1907}',
  awen: '\u{F1908}',
  e: '\u{F1909}',
  en: '\u{F190A}',
  esun: '\u{F190B}',
  ijo: '\u{F190C}',
  ike: '\u{F190D}',
  ilo: '\u{F190E}',
  insa: '\u{F190F}',
  jaki: '\u{F1910}',
  jan: '\u{F1911}',
  jelo: '\u{F1912}',
  jo: '\u{F1913}',
  kala: '\u{F1914}',
  kalama: '\u{F1915}',
  kama: '\u{F1916}',
  kasi: '\u{F1917}',
  ken: '\u{F1918}',
  kepeken: '\u{F1919}',
  kili: '\u{F191A}',
  kin: '\u{F1979}',
  kiwen: '\u{F191B}',
  ko: '\u{F191C}',
  kon: '\u{F191D}',
  kule: '\u{F191E}',
  kulupu: '\u{F191F}',
  kute: '\u{F1920}',
  la: '\u{F1921}',
  lape: '\u{F1922}',
  laso: '\u{F1923}',
  lawa: '\u{F1924}',
  len: '\u{F1925}',
  lete: '\u{F1926}',
  li: '\u{F1927}',
  lili: '\u{F1928}',
  linja: '\u{F1929}',
  lipu: '\u{F192A}',
  loje: '\u{F192B}',
  lon: '\u{F192C}',
  luka: '\u{F192D}',
  lukin: '\u{F192E}',
  lupa: '\u{F192F}',
  ma: '\u{F1930}',
  mama: '\u{F1931}',
  mani: '\u{F1932}',
  meli: '\u{F1933}',
  mi: '\u{F1934}',
  mije: '\u{F1935}',
  moku: '\u{F1936}',
  moli: '\u{F1937}',
  monsi: '\u{F1938}',
  mu: '\u{F1939}',
  mun: '\u{F193A}',
  musi: '\u{F193B}',
  mute: '\u{F193C}',
  nanpa: '\u{F193D}',
  nasa: '\u{F193E}',
  nasin: '\u{F193F}',
  nena: '\u{F1940}',
  ni: '\u{F1941}',
  nimi: '\u{F1942}',
  noka: '\u{F1943}',
  o: '\u{F1944}',
  olin: '\u{F1945}',
  ona: '\u{F1946}',
  open: '\u{F1947}',
  pakala: '\u{F1948}',
  pali: '\u{F1949}',
  palisa: '\u{F194A}',
  pan: '\u{F194B}',
  pana: '\u{F194C}',
  pi: '\u{F194D}',
  pilin: '\u{F194E}',
  pimeja: '\u{F194F}',
  pini: '\u{F1950}',
  pipi: '\u{F1951}',
  poka: '\u{F1952}',
  poki: '\u{F1953}',
  pona: '\u{F1954}',
  pu: '\u{F1955}',
  sama: '\u{F1956}',
  seli: '\u{F1957}',
  selo: '\u{F1958}',
  seme: '\u{F1959}',
  sewi: '\u{F195A}',
  sijelo: '\u{F195B}',
  sike: '\u{F195C}',
  sin: '\u{F195D}',
  sina: '\u{F195E}',
  sinpin: '\u{F195F}',
  sitelen: '\u{F1960}',
  sona: '\u{F1961}',
  soweli: '\u{F1962}',
  suli: '\u{F1963}',
  suno: '\u{F1964}',
  supa: '\u{F1965}',
  suwi: '\u{F1966}',
  tan: '\u{F1967}',
  taso: '\u{F1968}',
  tawa: '\u{F1969}',
  telo: '\u{F196A}',
  tenpo: '\u{F196B}',
  toki: '\u{F196C}',
  tomo: '\u{F196D}',
  tu: '\u{F196E}',
  unpa: '\u{F196F}',
  uta: '\u{F1970}',
  utala: '\u{F1971}',
  walo: '\u{F1972}',
  wan: '\u{F1973}',
  waso: '\u{F1974}',
  wawa: '\u{F1975}',
  weka: '\u{F1976}',
  wile: '\u{F1977}',
};

/*
 * Latin punctuation is not part of sitelen pona — the worksheets render
 * "sina pilin seme?" as three glyphs and no question mark, because seme is
 * already the question. So strip punctuation before the lookup, and drop it
 * from the glyph line. Unknown words fall through as-is, punctuation and all.
 */
const PUNCT = /[.,!?;:"']/g;

/** A toki pona sentence rendered in glyphs. Unknown words fall through as-is. */
export const toGlyphs = (sentence) => sentence
  .split(/\s+/)
  .map((w) => GLYPHS[w.toLowerCase().replace(PUNCT, '')] || w)
  .join('');

const vocab = (word, gloss) => ({ word, gloss, glyph: GLYPHS[word] });

/*
 * A word brought BACK in a later level, wearing a different sense — luka
 * (Level 7, the hand) returning in Level 9 as the number five. It is not a
 * second teaching: `vocab` is the twelve new words a level owns, and the tests
 * hold that a word is taught exactly once. `again` cards ride alongside those
 * twelve, are drilled like any word card, and point back at the level that
 * first taught the word (see taughtIn). A second meeting is a feature of
 * spaced learning, not a duplication — Praxis leaf 9a1c55da, option 1.
 */
const again = (word, gloss) => ({
  word, gloss, glyph: GLYPHS[word], again: true,
});

export const LEVELS = [
  {
    id: '1',
    title: 'The first twelve',
    blurb: 'Twelve words, their glyphs, and the one particle that makes a sentence: li.',
    intro: 'A complete language in about 120 words, so every word carries a lot of weight — and each one has its own logogram, sitelen pona ("good writing"). Vowels as in Italian, stress the first syllable, j sounds like y.',
    vocab: [
      vocab('mi', 'I · me · my'),
      vocab('sina', 'you'),
      vocab('jan', 'person'),
      vocab('moku', 'food · to eat'),
      vocab('telo', 'water · liquid'),
      vocab('kili', 'fruit · vegetable'),
      vocab('tomo', 'house · room'),
      vocab('suli', 'big · important'),
      vocab('lili', 'small · a little'),
      vocab('pona', 'good · simple'),
      vocab('suno', 'sun · light'),
      vocab('mun', 'moon'),
    ],
    vocabNote: 'The glyphs give a lot away: suli is a figure with arms spread wide, lili the same figure shrunk; tomo is a house; telo is waves.',
    rule: {
      particle: 'li',
      body: 'li marks the predicate — it sits between the subject and what is said about it: kili li pona, "the fruit is good." There is no "is" in toki pona; li does that work. The single exception: when mi or sina is the WHOLE subject, li is dropped — mi moku, "I\'m eating." (Add anything else to that subject and li comes back — see Level 10.) That is genuinely the whole rule.',
    },
    glyphReading: ['telo', 'tomo', 'kili', 'suno', 'lili', 'jan'],
    toEnglish: [
      ['mi moku', "I'm eating"],
      ['suno li suli', 'the sun is big'],
      ['tomo li lili', 'the house is small'],
      ['telo li pona', 'water is good'],
      ['sina pona', "you're good"],
    ],
    toTokiPona: [
      ['The moon is small.', 'mun li lili'],
      ['I am important.', 'mi suli'],
      ['The person is eating.', 'jan li moku'],
    ],
    closingNote: 'Adjectives follow their noun — jan pona is "good person," which is also the idiom for friend. So "you are my friend" is sina jan pona mi. Read it back once out loud.',
    decode: ['moku li pona suli', 'food is very good'],
  },
  {
    id: '2',
    title: 'e, and twelve more',
    blurb: 'The little word that unlocks whole sentences — plus words 13 to 24.',
    intro: 'You know twelve words and li. Level 2 adds the little word that unlocks whole sentences — e — plus twelve new words.',
    vocab: [
      vocab('ona', 'he · she · it · they'),
      vocab('ni', 'this · that'),
      vocab('olin', 'to love'),
      vocab('wile', 'to want'),
      vocab('jo', 'to have'),
      vocab('lukin', 'to see · look'),
      vocab('kute', 'to hear · listen'),
      vocab('pali', 'to do · make'),
      vocab('pana', 'to give'),
      vocab('ijo', 'thing'),
      vocab('ike', 'bad'),
      vocab('ale', 'all · everything'),
    ],
    vocabNote: 'Notice ike is pona\'s opposite number, and ona covers he, she, it and they — toki pona doesn\'t gender its pronouns.',
    rule: {
      particle: 'e',
      body: 'e marks the direct object — it sits between the verb and the thing the verb lands on: mi moku e kili, "I eat fruit." jan li lukin e mun, "the person looks at the moon." One sharp edge: e comes before every object, no exceptions. li is the only particle that ever disappears (when mi or sina is the whole subject); e never does.',
    },
    glyphReading: ['olin', 'wile', 'jo', 'lukin', 'ona', 'ike'],
    toEnglish: [
      ['mi jo e tomo', 'I have a house'],
      ['sina lukin e mun', 'you see the moon'],
      ['ona li pana e kili', 'she/they give(s) fruit'],
      ['jan li kute e mi', 'the person hears me'],
      ['ni li ike', 'this is bad'],
    ],
    toTokiPona: [
      ['I want water.', 'mi wile e telo'],
      ['You are eating everything.', 'sina moku e ale'],
      ['They make good things.', 'ona li pali e ijo pona'],
    ],
    closingNote: 'ni does double duty: ni li pona is "this is good" — and after a noun it points: jan ni "this person," tomo ni "this house."',
    decode: ['mi olin e sina', 'I love you'],
  },
  {
    id: '3',
    title: 'Colours, and how words stack',
    blurb: 'No new particles — just modifiers, which follow their noun and pile up left to right.',
    intro: 'No new particles this time — Level 3 is about how words stack. Twelve new words (25–36 of ~120), most of them colors and qualities, which is exactly what stacking is for.',
    vocab: [
      vocab('mute', 'many · very'),
      vocab('sin', 'new · fresh'),
      vocab('sike', 'circle · round'),
      vocab('seli', 'fire · hot'),
      vocab('lete', 'cold'),
      vocab('pimeja', 'black · dark'),
      vocab('walo', 'white'),
      vocab('loje', 'red'),
      vocab('jelo', 'yellow'),
      vocab('laso', 'blue · green'),
      vocab('kule', 'color · colorful'),
      vocab('wawa', 'strong · energetic'),
    ],
    vocabNote: 'laso covers blue AND green — one word for the whole cool end of the spectrum. The warm end gets loje and jelo.',
    rule: {
      particle: 'stacking modifiers',
      body: 'Modifiers FOLLOW their noun: telo lete "cold water," kili loje "red fruit." They stack left to right — each new word modifies everything before it: kili loje lili "small red-fruit." Possession is just more stacking: tomo mi "my house," jan pona sina "your friend." And mute after a quality intensifies it: pona mute "very good."',
    },
    glyphReading: ['kule', 'loje', 'seli', 'lete', 'wawa', 'sike'],
    toEnglish: [
      ['telo seli', 'hot water (tea, coffee)'],
      ['kili loje lili', 'a small red fruit'],
      ['jan wawa li pali mute', 'the strong person works a lot'],
      ['tomo mi li pimeja', 'my house is dark'],
      ['mun li walo', 'the moon is white'],
    ],
    toTokiPona: [
      ['I want cold water.', 'mi wile e telo lete'],
      ['The new thing is round.', 'ijo sin li sike'],
      ['You are very strong.', 'sina wawa mute'],
    ],
    closingNote: 'For the bench: ijo kule = "a colorful thing." kule alone is any color at all; the specific ones you now own are loje · jelo · laso · pimeja · walo.',
    decode: ['kili loje mi li pona mute', 'my red fruit (the tomatoes) is very good'],
  },
  {
    id: '4',
    title: 'Preverbs — want to, can, learn to',
    blurb: 'A small set of verbs slides in front of another verb, with no e between them.',
    intro: 'Level 4 is where sentences get ambitious: preverbs let you want, can, and learn to do things. Twelve new words (37–48), heavy on verbs and sounds.',
    vocab: [
      vocab('ken', 'can · possible'),
      vocab('kama', 'to come · become'),
      vocab('awen', 'to stay · keep'),
      vocab('sona', 'to know'),
      vocab('open', 'to begin · open'),
      vocab('pini', 'to end · finish'),
      vocab('lape', 'to sleep'),
      vocab('toki', 'to speak · language'),
      vocab('musi', 'fun · to play'),
      vocab('kalama', 'sound · noise'),
      vocab('mu', '(any animal sound)'),
      vocab('soweli', 'land animal'),
    ],
    vocabNote: 'toki is the language\'s own name: toki pona = "the good/simple language." And mu is whatever noise the animal makes — moo, woof, meow, all of it.',
    rule: {
      particle: 'preverbs',
      body: 'A small set of verbs can slide in FRONT of another verb — with no e between them: mi wile lape "I want to sleep." sina ken toki "you can speak." The set so far: wile · ken · kama · awen · sona · open · pini · lukin ("try to"). Two lovely compounds: kama sona = come-to-know = to learn; sona toki = to know how to speak. An object still takes its e — after the MAIN verb: mi wile moku e kili.',
    },
    glyphReading: ['sona', 'kama', 'lape', 'toki', 'soweli', 'ken'],
    toEnglish: [
      ['mi kama sona e toki pona', "I'm learning toki pona"],
      ['soweli li mu', 'the animal makes its sound'],
      ['ona li ken kalama', 'she/it can make sound'],
      ['mi awen lape', 'I keep sleeping / stay asleep'],
      ['sina pini pali', 'you finished working'],
    ],
    toTokiPona: [
      ['I want to sleep.', 'mi wile lape'],
      ['The animal wants to eat.', 'soweli li wile moku'],
      ['You can learn.', 'sina ken kama sona'],
    ],
    closingNote: 'kalama musi "musical sound" = music — the household art form. Someone in this house makes kalama musi for a living.',
    decode: ['mi kama sona e toki pona', 'I am learning toki pona'],
  },
  {
    id: '5',
    title: 'Putting things in places',
    blurb: 'The prepositions — and they take their noun directly, with no e.',
    intro: 'Level 5 puts things in places: the prepositions. Twelve new words (49–60), including the garden, the tools, and the great outdoors.',
    vocab: [
      vocab('lon', 'at · in · on'),
      vocab('tawa', 'to · toward · to go'),
      vocab('kepeken', 'using · with'),
      vocab('tan', 'from · because of'),
      vocab('sama', 'same · like'),
      vocab('poka', 'side · nearby'),
      vocab('ma', 'land · earth · outdoors'),
      vocab('kasi', 'plant'),
      vocab('ilo', 'tool · device'),
      vocab('supa', 'table · flat surface'),
      vocab('lupa', 'door · opening'),
      vocab('insa', 'inside · center'),
    ],
    vocabNote: 'ma kasi "plant-land" = the garden. supa moku = the dining table. Your phone? ilo toki — the talking tool.',
    rule: {
      particle: 'prepositions',
      body: 'Prepositions follow the verb phrase — no e: mi lon tomo "I\'m in the house." ona li tawa ma kasi "she\'s going to the garden." mi pali kepeken ilo "I work using a tool." sina sama mi "you\'re like me." They also stand alone as verbs: lon = to be there, tawa = to go — which gives the classic farewell: mi tawa! "I\'m off!"',
    },
    glyphReading: ['lon', 'tawa', 'ma', 'kasi', 'ilo', 'lupa'],
    toEnglish: [
      ['mi lon ma kasi', "I'm in the garden"],
      ['kili li lon insa tomo', 'the fruit is inside the house'],
      ['ona li moku kepeken ilo', 'she eats with a utensil'],
      ['soweli li lon poka lupa', 'the animal is by the door'],
      ['mi tawa!', "I'm off! / bye"],
    ],
    toTokiPona: [
      ["I'm going to the house.", 'mi tawa tomo'],
      ['The plant is on the table.', 'kasi li lon supa'],
      ['The person comes from the land.', 'jan li kama tan ma'],
    ],
    closingNote: 'tan also answers "why": tan ni = "because of this." You\'ll meet its question-partner in Level 7.',
    decode: ['kasi mute li lon ma mi', 'many plants are on my land'],
  },
  {
    id: '6',
    title: 'Time, and the word la',
    blurb: 'la sets the scene for whatever comes after it — and tenpo builds the whole calendar.',
    intro: 'Level 6 adds time — and la, the little word that sets the scene. Twelve new words (61–72), with a detour through the market.',
    vocab: [
      vocab('tenpo', 'time'),
      vocab('la', '(sets the scene)'),
      vocab('taso', 'but · only'),
      vocab('ante', 'different · other'),
      vocab('lipu', 'paper · book · page'),
      vocab('nimi', 'name · word'),
      vocab('sitelen', 'picture · writing'),
      vocab('esun', 'shop · market'),
      vocab('mani', 'money'),
      vocab('pan', 'bread · grain'),
      vocab('moli', 'dead · death'),
      vocab('weka', 'away · gone'),
    ],
    vocabNote: 'The glyph script itself is sitelen pona — "good writing." And la\'s glyph is the little closing-paren curve: it sets the scene, then steps aside.',
    rule: {
      particle: 'la',
      body: 'X la Y — the phrase before la sets the scene for the sentence after it: tenpo ni la mi moku "right now, I\'m eating." tenpo compounds carry the whole calendar: tenpo suno = day · tenpo mun = month · tenpo lete = winter · tenpo ale la… "always…"',
    },
    glyphReading: ['tenpo', 'lipu', 'nimi', 'sitelen', 'esun', 'mani'],
    toEnglish: [
      ['tenpo ni la mi lon esun', "right now I'm at the market"],
      ['sina jo e lipu mute', 'you have many books'],
      ['mani li weka', 'the money is gone'],
      ['tenpo lete la ma li walo', 'in winter the land is white'],
      ['pan li moku pona', 'bread is good food'],
    ],
    toTokiPona: [
      ['I only want bread.', 'mi wile e pan taso'],
      ['The picture is different.', 'sitelen li ante'],
      ['Right now, you are at the shop.', 'tenpo ni la sina lon esun'],
    ],
    closingNote: 'nimi sina = your name. People get jan + a toki-pona-ized name: jan Tawi is taken — pick yours (jan An? jan Ane?) and it\'s official.',
    decode: ['tenpo ale la moku li pona', 'food is always good'],
  },
  {
    id: '7',
    title: 'Asking, and the body',
    blurb: 'Two question shapes — seme in the slot you care about, or X ala X — plus the whole body.',
    intro: 'Level 7 teaches you to ask. Twelve new words (73–84): the question words and the whole body.',
    vocab: [
      vocab('seme', 'what? · which?'),
      vocab('anu', 'or'),
      vocab('ala', 'not · no · zero'),
      vocab('pilin', 'heart · to feel'),
      vocab('sijelo', 'body'),
      vocab('lawa', 'head · to lead'),
      vocab('luka', 'hand · arm (& five)'),
      vocab('noka', 'leg · foot'),
      vocab('uta', 'mouth'),
      vocab('monsi', 'back · behind'),
      vocab('sinpin', 'front · face'),
      vocab('nasa', 'strange · silly'),
    ],
    vocabNote: 'luka is hand AND the number five — count your fingers; Level 9 counts with it. pilin is the heart that feels, not the one that pumps.',
    rule: {
      particle: 'asking questions',
      body: 'Two shapes: ① drop seme into the slot you\'re asking about — sina moku e seme? "you\'re eating WHAT?" · sina pilin seme? "how do you feel?" ② yes/no = X ala X: sina pona ala pona? "are you good?" — answer by repeating the word (pona = yes) or negating it (pona ala = no). ala also negates anything: mi sona ala "I don\'t know."',
    },
    glyphReading: ['seme', 'pilin', 'lawa', 'luka', 'noka', 'nasa'],
    toEnglish: [
      ['sina wile e seme?', 'what do you want?'],
      ['sijelo mi li wawa', 'my body is strong'],
      ['luka mi li lete', 'my hands are cold'],
      ['ona li nasa ala', "she's not weird"],
      ['sina lape ala lape?', 'are you sleeping?'],
    ],
    toTokiPona: [
      ['What do you see?', 'sina lukin e seme?'],
      ['My feet are big.', 'noka mi li suli'],
      ["I don't know.", 'mi sona ala'],
    ],
    closingNote: 'anu offers the choice: telo anu kili? "water or fruit?" Answer with the one you want.',
    decode: ['sina pilin seme?', 'how are you feeling?'],
  },
  {
    id: '8',
    title: 'pi, family, and the animals',
    blurb: 'The trickiest particle: pi restarts the modifier pile and bundles what follows.',
    intro: 'Level 8 brings the trickiest particle — pi — plus family and the animal kingdom. Twelve new words (85–96).',
    vocab: [
      vocab('pi', '(regroups words)'),
      vocab('kulupu', 'group · community'),
      vocab('mama', 'parent'),
      vocab('meli', 'woman · female'),
      vocab('mije', 'man · male'),
      vocab('waso', 'bird'),
      vocab('kala', 'fish'),
      vocab('akesi', 'reptile · frog'),
      vocab('pipi', 'bug · insect'),
      vocab('len', 'clothing · fabric'),
      vocab('kiwen', 'stone · hard thing'),
      vocab('ko', 'paste · powder · goo'),
    ],
    vocabNote: 'mama meli = mother · mama mije = father · kulupu mama = family. The animals sort by kind: soweli / waso / kala / akesi / pipi.',
    rule: {
      particle: 'pi',
      body: 'Modifiers normally stack one at a time, each modifying the whole pile before it. pi restarts the pile: it bundles the next TWO-or-more words into a single modifier. ilo pi kalama musi = "tool of (musical sound)" = an instrument — without pi it would read as "musical tool-sound." Rule of thumb: pi is always followed by at least two words. Never pi + one word.',
    },
    glyphReading: ['kulupu', 'mama', 'waso', 'kala', 'pipi', 'len'],
    toEnglish: [
      ['waso li moku e pipi', 'the bird eats bugs'],
      ['mama meli mi li pona', 'my mother is good'],
      ['len sina li kule mute', 'your clothes are very colorful'],
      ['kala li lon telo', 'fish live in water'],
      ['ona li jan pi toki pona', "she's a toki pona person"],
    ],
    toTokiPona: [
      ['The bug is tiny.', 'pipi li lili'],
      ['My family is big.', 'kulupu mama mi li suli'],
      ['The instrument is good.', 'ilo pi kalama musi li pona'],
    ],
    closingNote: 'Jewelry has no official word — one reading: ijo kiwen pona lili, "small lovely stone-things." The maker would be jan pi ijo kiwen. Improve on it; the language expects you to.',
    decode: ['mi olin e kulupu mama mi', 'I love my family'],
  },
  {
    id: '9',
    title: 'Commands, numbers, up and down',
    blurb: 'o replaces li for commands and wishes; the numbers add up — wan 1 · tu 2 · luka 5 — so luka tu is seven.',
    intro: 'Level 9 gives you commands, numbers, and the vertical axis. Twelve new words (97–108) — plus three you already own, back as numbers.',
    vocab: [
      vocab('o', 'hey! · do it!'),
      vocab('wan', 'one · united'),
      vocab('tu', 'two'),
      vocab('nanpa', 'number'),
      vocab('sewi', 'up · sky · sacred'),
      vocab('anpa', 'down · low'),
      vocab('poki', 'box · container'),
      vocab('palisa', 'stick · rod'),
      vocab('linja', 'line · string · hair'),
      vocab('nena', 'bump · hill · nose'),
      vocab('selo', 'skin · outer layer'),
      vocab('alasa', 'to hunt · forage'),
    ],
    // The counting system needs three words taught earlier as something else.
    again: [
      again('luka', 'five · hand'),
      again('mute', 'twenty · many'),
      again('ale', 'hundred · all'),
    ],
    vocabNote: 'Counting, all in one place — and a stance, said out loud: this course counts the additive way. wan 1 · tu 2 · luka 5 · mute 20 · ale 100 — biggest piece first, then add: luka tu = 7 · luka luka = 10 · mute luka tu = 27. luka is the hand from Level 7, counted on its five fingers; mute (Level 3) and ale (Level 2) are the same words wearing number hats. pu also offers the plainer wan · tu · mute "many" — real, and what most speakers use when nothing needs an exact count — but a system that stops at two cannot stack, so it is not the one taught here.',
    rule: {
      particle: 'o',
      body: 'o replaces li for commands and wishes: o moku! "eat!" · o lape pona "sleep well." Before a name it calls someone: jan An o, o lukin! "Anne — look!" And nanpa + a number makes ordinals: nanpa wan = "number one" = first, the best.',
    },
    glyphReading: ['o', 'wan', 'tu', 'sewi', 'poki', 'linja'],
    toEnglish: [
      ['o pana e telo tawa mi', 'give me water'],
      ['mun li lon sewi', 'the moon is up in the sky'],
      ['poki ni li jo e pan luka', 'this box has five loaves in it'],
      ['linja mi li pimeja', 'my hair is dark'],
      ['mi alasa e kili', "I'm foraging for fruit (blackberries)"],
    ],
    toTokiPona: [
      ['Look!', 'o lukin!'],
      ['This is number one!', 'ni li nanpa wan'],
      ['Seven birds are up high.', 'waso luka tu li lon sewi'],
    ],
    closingNote: 'The well-wish pattern runs on o: o tawa pona "travel well" · o moku pona "bon appétit" · o lape pona "good night."',
    decode: ['o lape pona', 'sleep well'],
  },
  {
    id: '10',
    title: 'The final eleven',
    blurb: 'The last words — en, a, kin — plus the phrasebook that makes you sound like a native.',
    intro: 'The last handful — eleven words (109–119) — plus the phrasebook that makes you sound like you\'ve been here all along.',
    vocab: [
      vocab('a', 'ah! · (emphasis)'),
      vocab('en', 'and (joins subjects)'),
      vocab('kin', 'also · too'),
      vocab('jaki', 'gross · dirty'),
      vocab('kon', 'air · breath · spirit'),
      vocab('nasin', 'path · way · method'),
      vocab('pakala', 'broken · mistake · dang!'),
      vocab('pu', 'the toki pona book'),
      vocab('suwi', 'sweet · cute'),
      vocab('utala', 'fight · battle'),
      vocab('unpa', 'intimacy'),
    ],
    vocabNote: 'pu is the language\'s own founding book — "to interact with the official toki pona book" is genuinely its definition. The language contains itself.',
    rule: {
      particle: 'en, a, kin — and the phrasebook',
      body: 'en joins subjects — and li comes back even with mi/sina in the mix: mi en sina li musi "you and I are having fun." a adds feeling anywhere: pona a! "SO good!" kin = too: mi kin! "me too!" The phrasebook: toki! hello · pona! thanks/nice · kama pona! welcome · mi tawa bye · tawa pona go well · pakala! the all-purpose dang.',
    },
    glyphReading: ['a', 'en', 'kin', 'nasin', 'suwi', 'kon'],
    toEnglish: [
      ['telo ni li jaki', 'this water is gross'],
      ['nasin ni li pona tawa mi', 'I like this way (lit. this path is good to me)'],
      ['kon li lete', 'the air is cold'],
      ['suwi a!', 'so cute/sweet!'],
      ['mi pakala', 'I messed up'],
    ],
    toTokiPona: [
      ['You and I are learning.', 'mi en sina li kama sona'],
      ['Me too!', 'mi kin!'],
      ['The fruit is sweet.', 'kili li suwi'],
    ],
    closingNote: 'X li pona tawa mi ("X is good to me") = "I like X" — the most-used idiom in the language. And that\'s the whole vocabulary now on your sheets: sina sona e ale a! · ale li pini — sina jan pi toki pona. (There is no Level 11; now it\'s just talking.)',
    decode: ['mi en sina li kulupu wan', 'you and I are one'],
  },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id) || null;

/** The level whose vocab first taught `word` (where an `again` card points back to), or null. */
export const taughtIn = (word) => LEVELS.find((l) => l.vocab.some((v) => v.word === word)) || null;

/*
 * Item kinds and how each is judged.
 *
 *   glyph      glyph shown, type the word          -> exact match
 *   word       word shown, give a meaning          -> matches any listed gloss
 *   tp-en      toki pona sentence -> English       -> SELF-GRADED
 *   en-tp      English -> toki pona                -> SELF-GRADED
 *
 * The two sentence kinds are self-graded on purpose: "mi olin e sina" has a
 * dozen good English renderings and no string comparison is going to be fair
 * about that. You commit an answer, then mark yourself. See the node's ①.
 */
export const SELF_GRADED = new Set(['tp-en', 'en-tp']);

const shuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
};

export const buildSession = (level) => {
  const items = [];

  level.glyphReading.forEach((word) => {
    items.push({
      kind: 'glyph',
      prompt: GLYPHS[word],
      promptIsGlyph: true,
      promptSub: 'which word is this?',
      answer: word,
      accepted: [word],
    });
  });

  level.vocab.forEach(({ word, gloss }) => {
    items.push({
      kind: 'word',
      prompt: word,
      promptGlyph: GLYPHS[word],
      promptSub: 'what does it mean?',
      answer: gloss,
      accepted: gloss.split('·').map((g) => g.trim()),
    });
  });

  // Words brought back from an earlier level in a new sense — drilled like a
  // word card, but the prompt says so, because "luka" here wants "five".
  (level.again || []).forEach(({ word, gloss }) => {
    items.push({
      kind: 'word',
      prompt: word,
      promptGlyph: GLYPHS[word],
      promptSub: 'what does it mean here? (back from an earlier level)',
      answer: gloss,
      accepted: gloss.split('·').map((g) => g.trim()),
    });
  });

  level.toEnglish.forEach(([tp, en]) => {
    items.push({
      kind: 'tp-en',
      prompt: tp,
      promptGlyph: toGlyphs(tp),
      promptSub: 'into English',
      answer: en,
    });
  });

  level.toTokiPona.forEach(([en, tp]) => {
    items.push({
      kind: 'en-tp',
      prompt: en,
      promptSub: 'into toki pona',
      answer: tp,
      answerGlyph: toGlyphs(tp),
    });
  });

  items.push({
    kind: 'tp-en',
    prompt: level.decode[0],
    promptGlyph: toGlyphs(level.decode[0]),
    promptSub: 'decode it',
    answer: level.decode[1],
  });

  return shuffle(items);
};

const normalize = (s) => String(s)
  .toLowerCase()
  .replace(/[.,!?;:"']/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/** Only meaningful for the exact-matched kinds; sentence kinds are self-graded. */
export const isCorrect = (item, response) => {
  const given = normalize(response);
  if (given === '') return false;
  return (item.accepted || []).some((a) => normalize(a) === given);
};
