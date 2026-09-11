import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { search as searchTokiPona } from './search';
import { searchSeximal } from './seximalSearch';

/*
 * The search boxes — "where did I meet this?" — in three places:
 *   TokiPonaSearch  the toki pona page (a toki pona word, an English word, or
 *                   a pasted glyph; see search.js)
 *   SeximalSearch   the seximal page (a named number, a spoken number, a
 *                   numeral in either base, or a topic; see seximalSearch.js)
 *   LearnSearch     /learn itself, both courses at once
 * Every result links to the lesson it lives in. None of them needs state
 * beyond the query string, so each lives on the page that lists the lessons
 * rather than on a route of its own.
 */

// How a result names each lesson it appears in. Anything not listed is a
// plain use (see search.js buildAppearances() for the toki pona roles).
const ROLE_LABELS = {
  introduces: ' (taught here)',
  reintroduces: ' (brought back here)',
  reads: ' (how to read it)',
};

const levelLinks = (course, levels) => (
  <p className="tp__search-levels">
    {levels.map((l, i) => (
      <React.Fragment key={l.levelId}>
        {i > 0 && ' · '}
        <Link to={`/learn/${course}/${l.levelId}`}>{`Level ${l.levelId}`}</Link>
        {ROLE_LABELS[l.role] || ' (used here)'}
      </React.Fragment>
    ))}
  </p>
);

const tokiPonaItem = (r) => (
  <li key={`tp-${r.word}`} className="tp__search-result">
    <span className="tp__glyph tp__glyph--inline">{r.glyph}</span>
    <span className="tp__word">{r.word}</span>
    <span className="tp__gloss">{r.gloss}</span>
    {levelLinks('toki-pona', r.levels)}
  </li>
);

// What a seximal number result says about itself, by how it was read.
const NUMBER_GLOSS = {
  word: (r) => `${r.digits}₆ · ${r.value} in decimal`,
  name: (r) => `written ${r.digits}₆ · ${r.value} in decimal`,
  seximal: (r) => `${r.digits}₆ read in base six · ${r.value} in decimal`,
  decimal: (r) => `${r.value} read in decimal · written ${r.digits}₆`,
};

const seximalItem = (r) => {
  if (r.kind === 'topic') {
    return (
      <li key={`sx-${r.key}`} className="tp__search-result">
        <Link to={`/learn/seximal/${r.levelId}`} className="tp__word">
          {`Level ${r.levelId}: ${r.title}`}
        </Link>
        <span className="tp__gloss">{r.blurb}</span>
      </li>
    );
  }
  const gloss = NUMBER_GLOSS[r.kind === 'word' ? 'word' : r.reading](r);
  return (
    <li key={`sx-${r.key}`} className="tp__search-result">
      <span className="tp__word">{r.term}</span>
      <span className="tp__gloss">{gloss}</span>
      {levelLinks('seximal', r.levels)}
    </li>
  );
};

/*
 * One box. Plain function, not a component: each caller below owns its query
 * state and passes the rendered result groups in.
 *
 * aria-live="polite" sits on a container that is always mounted (rather than
 * on the conditionally-rendered lists themselves) so a screen reader announces
 * "No match" or the results as they change while typing — content appearing
 * inside an already-live region is what triggers the announcement.
 */
const renderBox = ({
  id, label, placeholder, query, setQuery, groups,
}) => {
  const trimmed = query.trim();
  const found = groups.filter((g) => g.items.length > 0);
  const labelled = groups.length > 1;
  return (
    <div className="tp__search">
      <label className="drill__label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="drill__input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        placeholder={placeholder}
      />
      <div aria-live="polite">
        {trimmed !== '' && found.length === 0 && (
          <p className="learn__meta">{`No match for "${trimmed}".`}</p>
        )}
        {found.map((g) => (
          <React.Fragment key={g.course}>
            {labelled && <p className="learn__search-course">{g.course}</p>}
            <ul className="tp__search-results">{g.items}</ul>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export function TokiPonaSearch() {
  const [query, setQuery] = useState('');
  const items = useMemo(() => searchTokiPona(query).map(tokiPonaItem), [query]);
  return renderBox({
    id: 'tp-search',
    label: 'search — a toki pona word, an English word, or a pasted glyph',
    placeholder: 'five, luka, 󱤭…',
    query,
    setQuery,
    groups: [{ course: 'toki pona', items }],
  });
}

export function SeximalSearch() {
  const [query, setQuery] = useState('');
  const items = useMemo(() => searchSeximal(query).map(seximalItem), [query]);
  return renderBox({
    id: 'sx-search',
    label: 'search — a number word, a numeral in either base, or a topic',
    placeholder: 'dozen, 100, carry…',
    query,
    setQuery,
    groups: [{ course: 'seximal', items }],
  });
}

export function LearnSearch() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => [
    { course: 'toki pona', items: searchTokiPona(query).map(tokiPonaItem) },
    { course: 'seximal', items: searchSeximal(query).map(seximalItem) },
  ], [query]);
  return renderBox({
    id: 'learn-search',
    label: 'search both courses — a word, a number, or a pasted glyph',
    placeholder: 'five, nif, 20, 󱤭…',
    query,
    setQuery,
    groups,
  });
}
