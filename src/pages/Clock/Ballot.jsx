import React, { useEffect, useState } from 'react';

import Face from './Face';
import SixFace from './SixFace';
import { spanIndex } from './dial';
import { seximalTriple } from './clock';
import {
  CLOCK_OPTIONS, DOWN, UP, VOTES_KEY, cleanVotes, countVotes, toggleVote,
} from './options';

/*
 * The ballot (Travis, 26.0905). Each option gets a header, a description, its
 * own live demo, the case for, the case against, and a vote.
 *
 * Named Ballot, not Options, and that is not a style choice: the data lives in
 * options.js, macOS resolves imports case-insensitively, and a component file
 * called Options.jsx makes `import … from './options'` resolve to ITSELF. The
 * symptom is a component that renders as undefined with no import error at
 * all. Same trap that made Dial.jsx into Face.jsx.
 *
 * The votes are stored in THIS BROWSER and nowhere else. There is no API
 * behind travish.com yet, so they cannot be counted across devices, let alone
 * across people. The page says that in plain words next to the buttons rather
 * than implying a tally that does not exist.
 */

const load = () => {
  try {
    return cleanVotes(JSON.parse(window.localStorage.getItem(VOTES_KEY)));
  } catch (e) {
    return {};
  }
};

const save = (votes) => {
  try {
    window.localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  } catch (e) {
    // Private mode or storage disabled: the buttons still work for this visit.
  }
};

/**
 * Each option's live demo, by id. Kept here so options.js stays pure data —
 * the arguments are testable without rendering an SVG.
 *
 * `now` is a Date for the faces, `ms` the milliseconds since local midnight
 * for the span. The seven-hand face takes neither: it runs its own
 * animation-frame clock, because its finest hand turns faster than the page.
 */
const demo = (id, now, ms, mode) => {
  switch (id) {
    case 'three-hands':
      return <Face now={now} mode={mode} />;
    case 'span':
      return (
        <div className="clock__sketch-span" data-testid="demo-span">
          {seximalTriple(spanIndex(ms))}
        </div>
      );
    case 'extra-hands':
      return <Face now={now} mode={mode} extraHands />;
    case 'sextant':
      return <Face now={now} mode={mode} sextant />;
    case 'seven-hands':
      return <SixFace />;
    default:
      return null;
  }
};

function Ballot({ now, ms, mode }) {
  const [votes, setVotes] = useState(load);

  useEffect(() => {
    save(votes);
  }, [votes]);

  const cast = (id, value) => setVotes((v) => toggleVote(v, id, value));
  const tally = countVotes(votes);

  return (
    <section className="clock__options">
      <h2 className="clock__h2">five clocks, none of them decided</h2>
      <p className="clock__lede">
        A few ways the units could reach a face, laid out with the case for and
        the case against. All five run live off the same clock. Vote on them.
      </p>
      <p className="clock__vote-note">
        The votes are kept in this browser and go nowhere else — there is no
        API behind this site yet, so nothing is counted across devices or
        between people. Treat it as marking up your own copy.
        {(tally.up > 0 || tally.down > 0) && (
          <span data-testid="vote-tally">
            {` You have marked ${tally.up} up and ${tally.down} down.`}
          </span>
        )}
      </p>

      {CLOCK_OPTIONS.map((opt, i) => (
        <article
          className="clock__option"
          key={opt.id}
          data-testid={`option-${opt.id}`}
        >
          <header className="clock__option-head">
            <h3 className="clock__option-title">
              <span className="clock__option-num">{i + 1}</span>
              {opt.title}
            </h3>
            <p className="clock__option-sub">{opt.subtitle}</p>
          </header>

          <div className="clock__option-body">
            {/* The id modifier matters: the seven-hand face shares its hand
                class names with the others and sets its own stroke-opacity,
                so any per-hand rule has to name the option it belongs to. */}
            <div className={`clock__option-demo clock__option-demo--${opt.id}`}>
              {demo(opt.id, now, ms, mode)}
            </div>

            <div className="clock__option-text">
              <p className="clock__option-blurb">{opt.blurb}</p>

              <div className="clock__option-cases">
                <div className="clock__case clock__case--pro">
                  <h4>for</h4>
                  <ul>
                    {opt.pros.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
                <div className="clock__case clock__case--con">
                  <h4>against</h4>
                  <ul>
                    {opt.cons.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              </div>

              <div className="clock__vote" role="group" aria-label={`Vote on ${opt.title}`}>
                <button
                  type="button"
                  className={`clock__vote-btn ${votes[opt.id] === UP ? 'is-on' : ''}`}
                  aria-pressed={votes[opt.id] === UP}
                  aria-label={`Vote up: ${opt.title}`}
                  data-testid={`up-${opt.id}`}
                  onClick={() => cast(opt.id, UP)}
                >
                  <span aria-hidden="true">▲</span>
                  {' up'}
                </button>
                <button
                  type="button"
                  className={`clock__vote-btn ${votes[opt.id] === DOWN ? 'is-on' : ''}`}
                  aria-pressed={votes[opt.id] === DOWN}
                  aria-label={`Vote down: ${opt.title}`}
                  data-testid={`down-${opt.id}`}
                  onClick={() => cast(opt.id, DOWN)}
                >
                  <span aria-hidden="true">▼</span>
                  {' down'}
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default Ballot;
