import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  buildSession, getLevel, GLYPHS, isCorrect, LEVELS, SELF_GRADED,
} from './tokipona';
import { recordSession } from './progress';

/*
 * The toki pona drill.
 *
 * Same commit-first spine as the seximal one, with one real difference: two of
 * the four item kinds are SELF-GRADED. "mi olin e sina" has a dozen fair
 * English renderings, and a string comparison would spend its life rejecting
 * correct answers. So you commit, the answer appears, and you say whether you
 * had it. The scoring is exactly as honest as you are, which for retrieval
 * practice is the right trade.
 */

const TEACHING = 'teaching';
const ANSWERING = 'answering';
const CHECKED = 'checked';
const DONE = 'done';

function TokiPonaDrill() {
  const { levelId } = useParams();
  const level = getLevel(levelId);

  const [round, setRound] = useState(0);
  const [items, setItems] = useState(() => (level ? buildSession(level) : []));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState(TEACHING);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const item = items[index];
  const selfGraded = item && SELF_GRADED.has(item.kind);

  useEffect(() => {
    if (phase === ANSWERING && inputRef.current) inputRef.current.focus();
  }, [phase, index]);

  // Arrowing to an adjacent level reuses this component, so the previous
  // level's questions, position and score would otherwise carry across.
  useEffect(() => {
    const fresh = getLevel(levelId);
    setItems(fresh ? buildSession(fresh) : []);
    setIndex(0);
    setInput('');
    setResults([]);
    setPhase(TEACHING);
  }, [levelId]);

  if (!level) {
    return (
      <div className="drill">
        <h2>No such level</h2>
        <Link to="/learn/toki-pona">Back to the levels</Link>
      </div>
    );
  }

  const restart = () => {
    setItems(buildSession(level));
    setResults([]);
    setIndex(0);
    setInput('');
    setRound(round + 1);
    setPhase(ANSWERING);
  };

  const finish = (finalResults) => {
    recordSession({
      course: 'toki-pona',
      levelId: level.id,
      total: finalResults.length,
      correct: finalResults.filter((r) => r.correct).length,
      misses: finalResults.filter((r) => !r.correct).map((r) => r.kind),
    });
    setPhase(DONE);
  };

  const advance = (extra) => {
    const next = extra ? [...results, extra] : results;
    if (extra) setResults(next);
    if (index + 1 >= items.length) {
      finish(next);
      return;
    }
    setIndex(index + 1);
    setInput('');
    setPhase(ANSWERING);
  };

  const commit = () => {
    if (selfGraded) {
      setPhase(CHECKED);
      return;
    }
    setResults([...results, { kind: item.kind, correct: isCorrect(item, input) }]);
    setPhase(CHECKED);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (phase === ANSWERING) commit();
    else if (!selfGraded) advance(null);
  };

  if (phase === TEACHING) {
    const at = LEVELS.findIndex((l) => l.id === level.id);
    const prev = LEVELS[at - 1];
    const next = LEVELS[at + 1];
    return (
      <div className="drill">
        <p className="learn__back">
          <Link to="/learn/toki-pona">all toki pona levels</Link>
        </p>
        <nav className="level-nav">
          <Link
            className="level-nav__arrow"
            to={prev ? `/learn/toki-pona/${prev.id}` : '/learn/toki-pona'}
            aria-label={prev ? prev.title : 'Back to the levels'}
          >
            ←
          </Link>
          <h1 className="level-nav__title">{`Level ${level.id} — ${level.title}`}</h1>
          <Link
            className="level-nav__arrow"
            to={next ? `/learn/toki-pona/${next.id}` : '/learn/toki-pona'}
            aria-label={next ? next.title : 'Back to the levels'}
          >
            →
          </Link>
        </nav>
        <p>{level.intro}</p>

        <h2>The words</h2>
        <ul className="tp__cards">
          {level.vocab.map((v) => (
            <li key={v.word} className="tp__card">
              <span className="tp__glyph tp__glyph--card">{v.glyph}</span>
              <span className="tp__word">{v.word}</span>
              <span className="tp__gloss">{v.gloss}</span>
            </li>
          ))}
        </ul>
        <p className="lesson__dim">{level.vocabNote}</p>

        <h2>{`The new grammar: ${level.rule.particle}`}</h2>
        <div className="tp__rule">
          <p className="tp__glyph tp__glyph--rule">{GLYPHS[level.rule.particle]}</p>
          <p>{level.rule.body}</p>
        </div>

        <p className="drill__actions">
          <button className="drill__button" type="button" onClick={() => setPhase(ANSWERING)}>
            {`Start — ${items.length} questions`}
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
          <p>Clean sweep.</p>
        ) : (
          <>
            <p>Where it went wrong:</p>
            <ul className="drill__weak">
              {Object.entries(byKind).map(([kind, count]) => (
                <li key={kind}>{`${kind} — ${count}`}</li>
              ))}
            </ul>
          </>
        )}
        <p className="lesson__dim">{level.closingNote}</p>
        <p className="drill__actions">
          <button className="drill__button" type="button" onClick={restart}>Again</button>
          {' '}
          <button
            className="drill__link-button"
            type="button"
            onClick={() => setPhase(TEACHING)}
          >
            read the lesson again
          </button>
          {' '}
          <Link to="/learn/toki-pona">Back to the levels</Link>
        </p>
      </div>
    );
  }

  const checked = phase === CHECKED;
  const wasRight = checked && !selfGraded && results[results.length - 1].correct;

  return (
    <div className="drill">
      <p className="drill__meta">
        {`Level ${level.id} · ${index + 1} of ${items.length}`}
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
          <div className={`drill__verdict ${wasRight || selfGraded ? 'is-right' : 'is-wrong'}`}>
            {!selfGraded && <p className="drill__verdict-line">{wasRight ? 'Yes.' : 'No.'}</p>}
            <p>
              {item.answer}
              {item.answerGlyph && (
                <span className="tp__glyph tp__glyph--inline">{item.answerGlyph}</span>
              )}
            </p>
          </div>
        )}

        <p className="drill__actions">
          {!checked && (
            <button className="drill__button" type="submit">Check</button>
          )}
          {checked && selfGraded && (
            <>
              <button
                className="drill__button"
                type="button"
                onClick={() => advance({ kind: item.kind, correct: true })}
              >
                I had it
              </button>
              <button
                className="drill__link-button"
                type="button"
                onClick={() => advance({ kind: item.kind, correct: false })}
              >
                I didn&apos;t
              </button>
            </>
          )}
          {checked && !selfGraded && (
            <button className="drill__button" type="button" onClick={() => advance(null)}>
              Next
            </button>
          )}
        </p>
      </form>
    </div>
  );
}

export default TokiPonaDrill;
