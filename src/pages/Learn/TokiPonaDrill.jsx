import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  buildSession,
  getLevel,
  GLYPHS,
  isCorrect,
  isSelfGraded,
  LEVELS,
  missLabels,
  RULES,
  taughtIn,
} from './tokipona';
import { recordSession, weakRules } from './progress';

/*
 * The toki pona drill.
 *
 * Same commit-first spine as the seximal one, with one real difference: SOME
 * items are SELF-GRADED. Translating "mi olin e sina" into English has a dozen
 * fair renderings and a string comparison would spend its life rejecting
 * correct answers, so you commit, the answer appears, and you say whether you
 * had it.
 *
 * Going the other way it is not a trade worth making. An English prompt whose
 * toki pona answer turns on a particle has one right answer, and the near-miss
 * — "mi wile telo" for "mi wile e telo" — is precisely what a learner marking
 * their own work forgives. Those are graded by machine; which ones and why is
 * PRODUCTION in tokipona.js. The item knows: `accepted` present means graded.
 *
 * And a miss is reported by the RULE it broke, not by the kind of exercise it
 * was, because "en-tp — 2" is not something anyone can act on.
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
  const [weak, setWeak] = useState([]);
  const inputRef = useRef(null);

  const item = items[index];
  const selfGraded = item && isSelfGraded(item);

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
    const missed = finalResults.filter((r) => !r.correct);
    recordSession({
      course: 'toki-pona',
      levelId: level.id,
      total: finalResults.length,
      correct: finalResults.filter((r) => r.correct).length,
      misses: missed.map((r) => r.kind),
      // New alongside `misses`; older sessions simply don't carry it. An item
      // testing two rules charges both, so this is longer than `misses`.
      missedRules: missed.flatMap((r) => r.rules || []),
    });
    // Read AFTER recording, so the cumulative list on the DONE screen includes
    // the session that just ended rather than being one drill out of date.
    setWeak(weakRules('toki-pona'));
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
    setResults([
      ...results,
      {
        kind: item.kind,
        rules: item.rules,
        correct: isCorrect(item, input),
      },
    ]);
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
          {(level.again || []).map((v) => {
            const from = taughtIn(v.word);
            return (
              <li key={v.word} className="tp__card tp__card--again">
                <span className="tp__glyph tp__glyph--card">{v.glyph}</span>
                <span className="tp__word">{v.word}</span>
                <span className="tp__gloss">{v.gloss}</span>
                <span className="tp__again">
                  {from ? `again — from Level ${from.id}` : 'again'}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="lesson__dim">{level.vocabNote}</p>

        <h2>{`The new grammar: ${level.rule.particle}`}</h2>
        <div className="tp__rule">
          {/* Five rules are labels, not glyph keys (stacking modifiers · preverbs · prepositions · asking questions · en, a, kin — and the phrasebook): no glyph block for those. */}
          {GLYPHS[level.rule.particle] && (
            <p className="tp__glyph tp__glyph--rule">
              {GLYPHS[level.rule.particle]}
            </p>
          )}
          <p>{level.rule.body}</p>
        </div>

        <p className="drill__actions">
          <button
            className="drill__button"
            type="button"
            onClick={() => setPhase(ANSWERING)}
          >
            {`Start — ${items.length} questions`}
          </button>
        </p>
      </div>
    );
  }

  if (phase === DONE) {
    const correct = results.filter((r) => r.correct).length;
    const missed = results.filter((r) => !r.correct);
    /*
     * Buckets are RULES where the item names one and item kinds where it does
     * not, both already turned into prose by missLabels — so a bad "kasi li
     * lon supa" reads "no e after a preposition", not "en-tp".
     */
    const tally = {};
    missed.forEach((r) =>
      missLabels(r).forEach((label) => {
        tally[label] = (tally[label] || 0) + 1;
      }),
    );
    const buckets = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    /*
     * The standing weak list, across recent sessions — rules only, because a
     * rule is a habit and an item kind is just a tab in a lesson.
     *
     * Shown only when history holds MORE than the drill just finished, which
     * on a first-ever session it does not: printing the same five lines twice
     * under two headings would teach a reader that the second heading is
     * decoration and to stop reading it.
     */
    const here = missed.reduce((acc, r) => acc + (r.rules || []).length, 0);
    const everywhere = weak.reduce((acc, r) => acc + r.count, 0);
    const standing = everywhere > here ? weak.slice(0, 5) : [];
    return (
      <div className="drill">
        <h2>{`${correct} / ${results.length}`}</h2>
        {missed.length === 0 ? (
          <p>Clean sweep.</p>
        ) : (
          <>
            <p>Where it went wrong:</p>
            <ul className="drill__weak">
              {buckets.map(([label, count]) => (
                <li key={label}>{count > 1 ? `${label} — ${count}` : label}</li>
              ))}
            </ul>
          </>
        )}
        {standing.length > 0 && (
          <>
            <p className="learn__meta">
              Your weak list, across recent sessions:
            </p>
            <ul className="drill__weak">
              {standing.map(({ rule, count }) => (
                <li key={rule}>{`${RULES[rule] || rule} — ${count}`}</li>
              ))}
            </ul>
          </>
        )}
        <p className="lesson__dim">{level.closingNote}</p>
        <p className="drill__actions">
          <button className="drill__button" type="button" onClick={restart}>
            Again
          </button>{' '}
          <button
            className="drill__link-button"
            type="button"
            onClick={() => setPhase(TEACHING)}
          >
            read the lesson again
          </button>{' '}
          <Link to="/learn/toki-pona">Back to the levels</Link>
        </p>
      </div>
    );
  }

  const checked = phase === CHECKED;
  const wasRight =
    checked && !selfGraded && results[results.length - 1].correct;

  return (
    <div className="drill">
      <p className="drill__meta">
        {`Level ${level.id} · ${index + 1} of ${items.length}`}
      </p>

      {item.promptIsGlyph ? (
        <p className="tp__glyph tp__glyph--prompt">{item.prompt}</p>
      ) : (
        <p className="drill__prompt tp__prompt">
          {item.prompt}
          {item.promptGlyph && (
            <span className="tp__glyph tp__glyph--inline">
              {item.promptGlyph}
            </span>
          )}
        </p>
      )}
      <p className="drill__sub">{item.promptSub}</p>

      <form onSubmit={onSubmit}>
        <label className="drill__label" htmlFor="answer">
          your answer
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
        />

        {checked && (
          <div
            className={`drill__verdict ${wasRight || selfGraded ? 'is-right' : 'is-wrong'}`}
          >
            {!selfGraded && (
              <p className="drill__verdict-line">{wasRight ? 'Yes.' : 'No.'}</p>
            )}
            <p>
              {item.answer}
              {item.answerGlyph && (
                <span className="tp__glyph tp__glyph--inline">
                  {item.answerGlyph}
                </span>
              )}
            </p>
            {/*
              Name the rule at the moment it breaks, not only in the tally at
              the end. A learner who has just written "mi wile telo" is the one
              person in the world who wants to be told about e right now.
            */}
            {!wasRight && !selfGraded && (item.rules || []).length > 0 && (
              <p className="drill__rule">
                {(item.rules || []).map((r) => RULES[r] || r).join(' · ')}
              </p>
            )}
          </div>
        )}

        <p className="drill__actions">
          {!checked && (
            <button className="drill__button" type="submit">
              Check
            </button>
          )}
          {checked && selfGraded && (
            <>
              <button
                className="drill__button"
                type="button"
                onClick={() =>
                  advance({ kind: item.kind, rules: item.rules, correct: true })
                }
              >
                I had it
              </button>
              <button
                className="drill__link-button"
                type="button"
                onClick={() =>
                  advance({
                    kind: item.kind,
                    rules: item.rules,
                    correct: false,
                  })
                }
              >
                I didn&apos;t
              </button>
            </>
          )}
          {checked && !selfGraded && (
            <button
              className="drill__button"
              type="button"
              onClick={() => advance(null)}
            >
              Next
            </button>
          )}
        </p>
      </form>
    </div>
  );
}

export default TokiPonaDrill;
