import React from 'react';
import { Link } from 'react-router-dom';

import { LearnSearch } from './LearnSearch';

function LearnHome() {
  return (
    <div className="learn">
      <h1>Learn</h1>
      <p>
        Small courses in things worth knowing that almost nobody teaches.
        Every question is answered before the answer appears; recognising a
        right answer is a different skill from producing one.
      </p>

      <ul className="learn__levels">
        <li className="learn__level">
          <Link to="/learn/seximal" className="learn__level-title">Seximal</Link>
          <p className="learn__level-blurb">
            Counting, naming and arithmetic in base six. Five levels,
            infinitely generated.
          </p>
        </li>
        <li className="learn__level">
          <Link to="/learn/toki-pona" className="learn__level-title">toki pona</Link>
          <p className="learn__level-blurb">
            A complete language in about a hundred and twenty words, with a
            logogram for every one of them. Glyphs from the first lesson.
          </p>
        </li>
      </ul>

      <LearnSearch />
    </div>
  );
}

export default LearnHome;
