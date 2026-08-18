import React from 'react';
import { Link } from 'react-router-dom';

import { GLYPHS, LEVELS } from './tokipona';
import { summarize } from './progress';

function TokiPonaHome() {
  const reviewStats = summarize('toki-pona', 'review');
  return (
    <div className="learn">
      <p className="learn__back">
        <Link to="/learn">other courses</Link>
      </p>
      <h1>toki pona</h1>
      <p className="tp__glyph tp__glyph--banner">
        {`${GLYPHS.toki || ''}${GLYPHS.pona}`}
      </p>
      <p>
        A complete language in about a hundred and twenty words. Every word has
        a logogram —
        {' '}
        <em>sitelen pona</em>
        , &quot;good writing&quot; — and you meet them from the first lesson,
        because reading the glyphs is half of what makes the language fun.
      </p>
      <p>
        Vowels as in Italian, stress the first syllable,
        {' '}
        <em>j</em>
        {' '}
        sounds like
        {' '}
        <em>y</em>
        . Twelve new words a level.
      </p>

      <ul className="learn__levels">
        {LEVELS.map((level) => {
          const stats = summarize('toki-pona', level.id);
          return (
            <li key={level.id} className="learn__level">
              <Link to={`/learn/toki-pona/${level.id}`} className="learn__level-title">
                {`${level.id}. ${level.title}`}
              </Link>
              <p className="learn__level-blurb">{level.blurb}</p>
              {stats && (
                <p className="learn__level-stats">
                  {`best ${stats.best}% · last ${stats.last}% · ${stats.attempts} sessions`}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <ul className="learn__levels">
        <li className="learn__level">
          <Link to="/learn/toki-pona/review" className="learn__level-title">
            Review — everything so far
          </Link>
          <p className="learn__level-blurb">
            Generated drilling over every word you have met, in all three
            directions: read the glyph, give the meaning, and the hard one —
            produce the word from its meaning. It does not run out, and what
            you have been missing comes back more often.
          </p>
          {reviewStats && (
            <p className="learn__level-stats">
              {`best ${reviewStats.best}% · last ${reviewStats.last}% · ${reviewStats.attempts} sessions`}
            </p>
          )}
        </li>
      </ul>

      <p className="learn__meta">
        All ten levels are here — 119 words, twelve at a time and eleven at the
        end. There is no Level 11; after that it is just talking.
      </p>

      <h2>This course&apos;s house style</h2>
      <p>
        toki pona has genuine disagreements in it, and a course has to pick.
        These are the choices made here, said out loud rather than smuggled in:
      </p>
      <ul className="learn__levels">
        <li>
          <strong>e marks noun objects, full stop.</strong>
          {' '}
          A word after the verb without
          {' '}
          <em>e</em>
          {' '}
          is a modifier, not an object.
        </li>
        <li>
          <strong>Prepositions take their noun directly</strong>
          {' '}
          — no
          {' '}
          <em>e</em>
          {' '}
          after
          {' '}
          <em>tawa</em>
          ,
          {' '}
          <em>lon</em>
          ,
          {' '}
          <em>tan</em>
          ,
          {' '}
          <em>kepeken</em>
          .
        </li>
        <li>
          <strong>The 120 words of pu</strong>
          {' '}
          are the syllabus. The later community words —
          {' '}
          <em>kijetesantakalu</em>
          ,
          {' '}
          <em>soko</em>
          ,
          {' '}
          <em>misikeke</em>
          {' '}
          — are real and widely used, but they are an appendix, not the ladder.
        </li>
        <li>
          <strong>Latin letters, with sitelen pona alongside from day one.</strong>
        </li>
      </ul>
    </div>
  );
}

export default TokiPonaHome;
