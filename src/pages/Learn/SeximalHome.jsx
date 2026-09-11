import React from 'react';
import { Link } from 'react-router-dom';

import { LEVELS } from './seximal';
import { summarize, weakKinds } from './progress';
import { SeximalSearch } from './LearnSearch';

function SeximalHome() {
  const weak = weakKinds('seximal').slice(0, 4);

  return (
    <div className="learn">
      <p className="learn__back">
        <Link to="/learn">other courses</Link>
      </p>
      <h1>Seximal</h1>
      <p>
        Counting in base six, out loud. Six is written
        {' '}
        <code>10</code>
        , a
        {' '}
        <strong>nif</strong>
        {' '}
        is
        {' '}
        <code>100</code>
        {' '}
        (thirty-six of them), and the numbers in between get their own
        words: six, seven, eight, nine, ten, eleven, then
        {' '}
        <strong>dozen</strong>
        ,
        {' '}
        <strong>thirsy</strong>
        ,
        {' '}
        <strong>foursy</strong>
        ,
        {' '}
        <strong>fifsy</strong>
        .
      </p>
      <p>
        Every question is generated, so a level never runs out. You answer
        before you see the answer — that is the point.
      </p>

      <SeximalSearch />

      <ul className="learn__levels">
        {LEVELS.map((level) => {
          const stats = summarize('seximal', level.id);
          return (
            <li key={level.id} className="learn__level">
              <Link to={`/learn/seximal/${level.id}`} className="learn__level-title">
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

      {weak.length > 0 && (
        <>
          <h2>Where it keeps going wrong</h2>
          <ul className="learn__levels">
            {weak.map((w) => (
              <li key={w.kind}>{`${w.kind} — missed ${w.count}×`}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default SeximalHome;
