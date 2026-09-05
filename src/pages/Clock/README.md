# /clock — the seximal / niftimal clock

A static, client-only page at `travish.com/clock`. Praxis leaf `dc03d6ad`
("Niftimal clock app"), parent trunk **Seximal (base-6)**.

## The decomposition

### What a seximal clock shows

The time of day as a base-six number. The split used here:

| unit   | count        | real length | written as     |
|--------|--------------|-------------|----------------|
| hour   | 100₆ · 10₃₆ a day    | 40 min      | two digits, 00–55₆ |
| minute | 100₆ · 10₃₆ an hour  | 66.7 s      | two digits, 00–55₆ |
| second | 100₆ · 10₃₆ a minute | 1.85 s      | two digits, 00–55₆ |

36 × 36 × 36 = 46 656 = 6⁶ = 1000000₆ ticks a day. Every count is a **nif**
(100₆), so each unit is exactly one pair wide and the face is three pairs:
`23:41:05`. Midnight is `00:00:00`; the last tick of the day is `55:55:55`.

This is the same split the 2024 hexagon clock at `/programming/seximal-time-keeping`
uses (`projects/seximal_clock/constants.js`: 36 hours, 36 minutes, 36 seconds),
so the two clocks on the site agree. One deliberate difference: this page counts
from **local** midnight. The hexagon clock uses `getTime() % msInDay`, which is
midnight UTC — seven hours off in Boise.

### What a niftimal clock shows

The same number in base thirty-six (nif-timal: base nif). Because 36 = 6², one
niftimal digit is exactly one seximal pair, so the face is three glyphs:
`F:P:5` for the `23:41:05` above. Digits run `0–9` then `A–Z`, the ordering the
hexagon clock already uses for its unit labels.

That is the whole relationship between the two modes: **one day-fraction, two
notations.** The toggle changes how the number is written and nothing else.

### How the digits are named

Names come from Travis's spoken spec (`codex 5_culture/interests/seximal/seximal.md`,
memory `reference_seximal_conventions`), via the module that already encodes it
for `/learn`: `src/pages/Learn/seximal.js` (`pairName`, `seximalName`). Nothing
about the words is restated in this directory.

- Digits 1–5 are ordinary; 10₆ = **six**; 11–15₆ = seven … eleven.
- 20₆ = **dozen**, 30/40/50₆ = **thirsy / foursy / fifsy**, combining as
  dozen-one … fifsy-five.
- 100₆ = **nif**; pairs read "high pair *nif* low pair"; 10000₆ = **unexian**,
  four-digit blocks.

A **niftimal digit is spoken as its seximal pair name** — there is no second
vocabulary:

| glyph | value | spoken      |
|-------|-------|-------------|
| 6     | 6     | six         |
| A     | 10    | ten         |
| B     | 11    | eleven      |
| C     | 12    | dozen       |
| H     | 17    | dozen-five  |
| I     | 18    | thirsy      |
| O     | 24    | foursy      |
| U     | 30    | fifsy       |
| Z     | 35    | fifsy-five  |

So both modes speak identically; each unit carries its name under the digits,
and the names do not move when the notation does.

**Read as one number.** Because an hour is a nif of minutes and a minute a nif
of seconds, `hh:mm:ss₆` *is* the six-digit number `hhmmss₆`, and the spec's
pair-reading names it for free: `23:41:05` is
"dozen-three unexian, foursy-one nif five". The page shows this line too.
(One inherited quirk: a leading pair of exactly one is spoken bare — `00:01:05`
is "nif five", not "one nif five" — the same open question `blockName` in
`Learn/seximal.js` documents. If that ruling changes, it changes there.)

### How it is mounted

Exactly like `/learn`: a directory under `src/pages/`, a default export from
`src/pages/index.jsx`, one `<Route path="/clock">` in `src/App.jsx`. It is not
in the header nav (neither is `/learn`). nginx already falls back to
`index.html` for every path, so the route needs no server change. No new font:
the site's monospace stack carries digits and A–Z, and tabular numerals keep
the face from jittering. The nasin-nanpa UCSUR font exists for `/learn`'s
sitelen pona and has nothing to render here.

## Behaviour

- Updates every second (a seximal second is 1.85 real seconds, so a real-second
  tick is always fresh enough).
- Mode toggle persisted in `localStorage` under `travish.clock.mode`; reads and
  writes are wrapped, so a blocked store just means the choice is per-tab.
- Two buttons with `aria-pressed`, 44 px tall, no hover-only UI — the iPad is
  the target device.
- Site tokens only (`--main-accent-color`, `--light-grey`), so it follows
  whatever theme the rest of the site has.

## Files

- `clock.js` — the pure conversions: ticks since local midnight, split/join,
  seximal and niftimal faces, unit names, the one-number reading.
- `clock.test.js` — pins the split (6⁶, 40-min hour, 16:00 = 31104 exactly),
  the niftimal digit set, round-trips, and the glyph → pair-name table above.
- `index.jsx` / `index.test.jsx` — the page; default mode, toggle, persistence,
  fallback on garbage, and that it ticks.
- `styles.css`.
