import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { LEVELS } from './tokipona';
import {
  buildReviewSession, defaultLevelsKnown, isCorrect, knownVocab, SESSION_LENGTH,
} from './review';
import { recordSession } from './progress';

/*
 * Review mode — the same commit-first spine as the level drills, pointed at
 * every level reached so far instead of one.
 *
 * Two differences from a level drill, both deliberate:
 *   - There is no lesson to read first, so the opening screen is a range and a
 *     button rather than a teaching phase.
 *   - Nothing here is self-graded. A level drill self-grades its sentence
 *     translations because "mi olin e sina" has a dozen fair renderings; a
 *     vocabulary word does not.
 */

const READY = 'ready';
const ANSWERING = 'answering';
const CHECKED = 'checked';
const DONE = 'done';

function TokiPonaReview() {
  const [levelsKnown, setLevelsKnown] = useState(() => defaultLevelsKnown());
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState(READY);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const item = items[index];
  const vocab = knownVocab(levelsKnown);
  const widened = levelsKnown >= LEVELS.length;

  useEffect(() => {
    if (phase === ANSWERING && inputRef.current) inputRef.current.focus();
  }, [phase, index]);

  const begin = (levels) => {
    setItems(buildReviewSession(levels));
    setResults([]);
    setIndex(0);
    setInput('');
    setPhase(ANSWERING);
  };

  const finish = (finalResults) => {
    recordSession({
      course: 'toki-pona',
      levelId: 'review',
      levels: levelsKnown,
      total: finalResults.length,
      correct: finalResults.filter((r) => r.correct).length,
      misses: finalResults.filter((r) => !r.correct).map((r) => r.kind),
      // New in review mode; older sessions simply don't carry it. See progress.js.
      missedWords: finalResults.filter((r) => !r.correct).map((r) => r.word),
    });
    setResults(finalResults);
    setPhase(DONE);
  };

  const commit = () => {
    setResults([...results, {
      kind: item.kind,
      word: item.word,
      correct: isCorrect(item, input),
    }]);
    setPhase(CHECKED);
  };

  const advance = () => {
    if (index + 1 >= items.length) {
      finish(results);
      return;
    }
    setIndex(index + 1);
    setInput('');
    setPhase(ANSWERING);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (phase === ANSWERING) commit();
    else advance();
  };

  if (phase === READY) {
    return (
      <div className="drill">
        <p className="learn__back">
          <Link to="/learn/toki-pona">all toki pona levels</Link>
        </p>
        <h1>Review</h1>
        <p>
          {`Everything you have met so far — ${vocab.length} words from `}
          {levelsKnown === 1 ? 'level 1' : `levels 1–${levelsKnown}`}
          , in all three directions: read the glyph, give the meaning, and the
          hard one — produce the word from its meaning. Questions are generated,
          so this does not run out, and words you have been missing come back
          more often.
        </p>
        <p className="drill__actions">
          <button className="drill__button" type="button" onClick={() => begin(levelsKnown)}>
            {`Start — ${SESSION_LENGTH} questions`}
          </button>
          {!widened && (
            <button
              className="drill__link-button"
              type="button"
              onClick={() => setLevelsKnown(LEVELS.length)}
            >
              {`draw from all ${LEVELS.length} levels`}
            </button>
          )}
        </p>
        <p className="learn__meta">
          Drawn from the levels you have drilled. Finish a new level and it
          joins the pool by itself.
        </p>
      </div>
    );
  }

  if (phase === DONE) {
    const correct = results.filter((r) => r.correct).length;
    const missed = results.filter((r) => !r.correct);
    const byWord = missed.reduce((acc, r) => ({ ...acc, [r.word]: (acc[r.word] || 0) + 1 }), {});
    return (
      <div className="drill">
        <h2>{`${correct} / ${results.length}`}</h2>
        {missed.length === 0 ? (
          <p>Clean sweep across everything you know.</p>
        ) : (
          <>
            <p>These come back weighted next time:</p>
            <ul className="drill__weak">
              {Object.entries(byWord).map(([word, count]) => (
                <li key={word}>{count > 1 ? `${word} — ${count}` : word}</li>
              ))}
            </ul>
          </>
        )}
        <p className="drill__actions">
          <button className="drill__button" type="button" onClick={() => begin(levelsKnown)}>
            Again
          </button>
          {' '}
          <Link to="/learn/toki-pona">Back to the levels</Link>
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="drill">
        <h2>Nothing to review yet</h2>
        <p>Drill a level first and its words will show up here.</p>
        <Link to="/learn/toki-pona">Back to the levels</Link>
      </div>
    );
  }

  const checked = phase === CHECKED;
  const wasRight = checked && results[results.length - 1].correct;

  return (
    <div className="drill">
      <p className="drill__meta">
        {`Review · ${index + 1} of ${items.length}`}
      </p>

      {item.promptIsGlyph
        ? <p className="tp__glyph tp__glyph--prompt">{item.prompt}</p>
        : (
          <p className="drill__prompt tp__prompt">
            {item.prompt}
            {item.promptGlyph && (
              <span className="tp__glyph tp__glyph--inline">{item.promptGlyph}</span>
            )}
          </p>
        )}
      <p className="drill__sub">{item.promptSub}</p>

      <form onSubmit={onSubmit}>
        <label className="drill__label" htmlFor="answer">your answer</label>
        <input
          id="answer"
          ref={inputRef}
          className="drill__input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          readOnly={checked}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {checked && (
          <div className={`drill__verdict ${wasRight ? 'is-right' : 'is-wrong'}`}>
            <p className="drill__verdict-line">{wasRight ? 'Yes.' : 'No.'}</p>
            <p>
              {item.answer}
              {item.answerGlyph && (
                <span className="tp__glyph tp__glyph--inline">{item.answerGlyph}</span>
              )}
            </p>
          </div>
        )}

        <p className="drill__actions">
          <button className="drill__button" type="submit">
            {checked ? 'Next' : 'Check'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default TokiPonaReview;
