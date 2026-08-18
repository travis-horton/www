import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  buildSession, getLevel, isCorrect, LEVELS, SESSION_LENGTH,
} from './seximal';
import { LESSONS } from './Lessons';
import { recordSession } from './progress';

/*
 * Commit-first drill engine.
 *
 * You type an answer and submit it BEFORE seeing the truth. That is the whole
 * design: recognising a right answer is not the same skill as producing one,
 * and a reveal-on-tap card quietly trains the easier one. "Show me" is the
 * escape hatch, and it scores as a miss, honestly.
 */

const TEACHING = 'teaching';
const ANSWERING = 'answering';
const CHECKED = 'checked';
const DONE = 'done';

function Drill() {
  const { levelId } = useParams();
  const level = getLevel(levelId);

  const [round, setRound] = useState(0);
  const items = useMemo(() => (level ? buildSession(level) : []), [level, round]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState(TEACHING);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const item = items[index];

  useEffect(() => {
    if (phase === ANSWERING && inputRef.current) inputRef.current.focus();
  }, [phase, index]);

  // Arrowing to an adjacent level reuses this component, so the old session's
  // position and score would otherwise carry across into the new one.
  useEffect(() => {
    setIndex(0);
    setInput('');
    setResults([]);
    setPhase(TEACHING);
  }, [levelId]);

  if (!level) {
    return (
      <div className="drill">
        <h2>No such level</h2>
        <Link to="/learn/seximal">Back to the seximal levels</Link>
      </div>
    );
  }

  const finish = (finalResults) => {
    recordSession({
      course: 'seximal',
      levelId: level.id,
      total: finalResults.length,
      correct: finalResults.filter((r) => r.correct).length,
      misses: finalResults.filter((r) => !r.correct).map((r) => r.kind),
    });
    setResults(finalResults);
    setPhase(DONE);
  };

  const commit = (gaveUp) => {
    const correct = !gaveUp && isCorrect(item, input);
    const next = [...results, { kind: item.kind, correct, response: input }];
    setResults(next);
    setPhase(CHECKED);
    if (gaveUp) setInput('');
    return next;
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
    if (phase === ANSWERING) commit(false);
    else advance();
  };

  if (phase === TEACHING) {
    const Lesson = LESSONS[level.id];
    const at = LEVELS.findIndex((l) => l.id === level.id);
    const prev = LEVELS[at - 1];
    const next = LEVELS[at + 1];
    return (
      <div className="drill">
        <p className="learn__back">
          <Link to="/learn/seximal">all seximal levels</Link>
        </p>
        <nav className="level-nav">
          <Link
            className="level-nav__arrow"
            to={prev ? `/learn/seximal/${prev.id}` : '/learn/seximal'}
            aria-label={prev ? prev.title : 'Back to the levels'}
          >
            ←
          </Link>
          <h1 className="level-nav__title">{level.title}</h1>
          <Link
            className="level-nav__arrow"
            to={next ? `/learn/seximal/${next.id}` : '/learn/seximal'}
            aria-label={next ? next.title : 'Back to the levels'}
          >
            →
          </Link>
        </nav>
        {Lesson && <Lesson />}
        <p className="drill__actions">
          <button
            className="drill__button"
            type="button"
            onClick={() => setPhase(ANSWERING)}
          >
            {`Start — a dozen questions (${SESSION_LENGTH})`}
          </button>
        </p>
      </div>
    );
  }

  if (phase === DONE) {
    const correct = results.filter((r) => r.correct).length;
    const missed = results.filter((r) => !r.correct);
    const byKind = missed.reduce((acc, r) => ({ ...acc, [r.kind]: (acc[r.kind] || 0) + 1 }), {});
    return (
      <div className="drill">
        <h2>{`${correct} / ${results.length}`}</h2>
        {missed.length === 0 ? (
          <p>Clean sweep. Nothing to carry into the next one.</p>
        ) : (
          <>
            <p>What went wrong, so the next session knows where to lean:</p>
            <ul className="drill__weak">
              {Object.entries(byKind).map(([kind, count]) => (
                <li key={kind}>{`${kind} — ${count}`}</li>
              ))}
            </ul>
          </>
        )}
        <p className="drill__actions">
          <button
            className="drill__button"
            type="button"
            onClick={() => {
              setResults([]);
              setIndex(0);
              setInput('');
              setPhase(ANSWERING);
              setRound(round + 1);
            }}
          >
            Another dozen
          </button>
          {' '}
          <button
            className="drill__link-button"
            type="button"
            onClick={() => setPhase(TEACHING)}
          >
            read the lesson again
          </button>
          {' '}
          <Link to="/learn/seximal">Back to the levels</Link>
        </p>
      </div>
    );
  }

  const checked = phase === CHECKED;
  const wasRight = checked && results[results.length - 1].correct;

  return (
    <div className="drill">
      <p className="drill__meta">
        {`${level.title} · ${index + 1} of ${items.length}`}
      </p>

      <p className="drill__prompt">{item.prompt}</p>
      <p className="drill__sub">{item.promptSub}</p>

      <form onSubmit={onSubmit}>
        <label className="drill__label" htmlFor="answer">
          {item.answerMode === 'name' ? 'the spoken name' : 'base-six digits'}
        </label>
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
          inputMode={item.answerMode === 'name' ? 'text' : 'numeric'}
        />

        {checked && (
          <div className={`drill__verdict ${wasRight ? 'is-right' : 'is-wrong'}`}>
            <p className="drill__verdict-line">{wasRight ? 'Yes.' : 'No.'}</p>
            <p>
              {`${item.digits}₆`}
              {' — '}
              {item.name}
            </p>
            {item.explain && <p className="drill__explain">{item.explain}</p>}
          </div>
        )}

        <p className="drill__actions">
          <button className="drill__button" type="submit">
            {checked ? 'Next' : 'Check'}
          </button>
          {!checked && (
            <button
              className="drill__link-button"
              type="button"
              onClick={() => commit(true)}
            >
              show me
            </button>
          )}
        </p>
      </form>

      <p className="drill__meta">
        {`a dozen questions (${SESSION_LENGTH})`}
      </p>
    </div>
  );
}

export default Drill;
