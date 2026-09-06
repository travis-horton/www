import React from 'react';

import Face from './Face';
import SixFace from './SixFace';
import { spanIndex } from './dial';
import { seximalTriple } from './clock';
import { CLOCK_OPTIONS } from './options';

/*
 * The ballot (Travis, 26.0905). Each option gets a header, a description, its
 * own live demo, the case for and the case against.
 *
 * THERE ARE NO VOTE BUTTONS, and their absence is the point. They existed for
 * about an hour, in commit c79bfef, backed by localStorage — which meant every
 * visitor kept a private tally that nobody, including Travis, could ever read.
 * A button that records your click into your own browser and nowhere else is
 * not a vote, it is a fidget. Rather than ship that, the counting waits for an
 * API this site does not have yet.
 *
 * Travis's call, 26.0905, and the reason is motivational rather than technical:
 * a working vote count is now the declared mid-point of the Zig backend. One
 * table, two routes, no auth, no journal parsing — it skips all of Phase 2 and
 * still puts something real in production. Roughly ten tasks out from where the
 * Zig sits today. Restoring the buttons is the reward for finishing them, so
 * they go back in when there is something behind them.
 *
 * Named Ballot, not Options, and that is not a style choice: the data lives in
 * options.js, macOS resolves imports case-insensitively, and a component file
 * called Options.jsx makes `import … from './options'` resolve to ITSELF. The
 * symptom is a component that renders as undefined with no import error at
 * all. Same trap that made Dial.jsx into Face.jsx.
 */

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
  return (
    <section className="clock__options">
      <h2 className="clock__h2">five clocks, none of them decided</h2>
      <p className="clock__lede">
        A few ways the units could reach a face, laid out with the case for and
        the case against. All five run live off the same clock.
      </p>
      <p className="clock__vote-note" data-testid="vote-pending">
        There is nowhere yet to put a vote. This site is static, with no API
        behind it, so a button here could only write your answer into your own
        browser where nobody would ever read it. Counting these is the next
        real thing the backend has to do.
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
              {/* The space is required, not cosmetic: flex `gap` supplies the
                  LOOK, but the accessible name concatenates raw text nodes, so
                  without it every heading read "1Three hands on a nif-mark
                  dial" in a screen reader's heading list. */}
              {' '}
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
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default Ballot;
