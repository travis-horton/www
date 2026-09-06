import React from 'react';

import data from '../../data/performances.json';

/*
 * Upcoming and past performances for /piano, from performances.json.
 *
 * Whether an entry is upcoming is DERIVED from its date at render time rather
 * than stored, so the file cannot rot into announcing a concert that happened
 * last spring.
 *
 * Entries with visibility 'draft' never render. That is where the judgement
 * calls live: the November Planets dates Travis's own calendar note says he
 * may not be playing, the run that might be a rehearsal, the gig whose name is
 * an unexpanded abbreviation. They stay in the file so the question is not
 * lost, and stay off the page so it does not claim something untrue.
 *
 * No entry shows a ROLE, because the calendar never recorded one and guessing
 * on a public page is worse than omitting.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parsed as local parts, never `new Date(str)` — that reads a bare ISO date as
// UTC and shows the previous evening for anyone west of Greenwich, which is
// everyone reading this.
const parts = (iso) => iso.split('-').map(Number);

const formatDate = (iso) => {
  const [y, m, d] = parts(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const formatTime = (t) => {
  if (!t) return null;
  const [h, min] = t.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return min === 0 ? `${hour}${suffix}` : `${hour}:${String(min).padStart(2, '0')}${suffix}`;
};

const todayIso = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

// A plain render function rather than a component: it takes no props of its
// own, so it needs no propTypes and cannot be mistaken for something with
// state. Called directly from .map().
const row = (p) => {
  const venue = p.venueId ? data.venues[p.venueId] : null;
  const inst = p.institutionId ? data.institutions[p.institutionId] : null;
  return (
    <li className="piano__perf" key={p.id}>
      <div className="piano__perf-when">
        {formatDate(p.date)}
        {p.startTime && <span className="piano__perf-time">{` · ${formatTime(p.startTime)}`}</span>}
      </div>
      <div className="piano__perf-what">
        <span className="piano__perf-title">{p.title}</span>
        {p.subtitle && <span className="piano__perf-sub">{`, ${p.subtitle}`}</span>}
      </div>
      <div className="piano__perf-where">
        {venue && <span>{venue.name}</span>}
        {venue && inst && <span>{' · '}</span>}
        {inst && <span>{inst.short}</span>}
      </div>
    </li>
  );
};

const byDateAsc = (a, b) => a.date.localeCompare(b.date);
const byDateDesc = (a, b) => b.date.localeCompare(a.date);

function Performances() {
  const today = todayIso();
  const shown = data.performances.filter((p) => p.visibility === 'public');
  const upcoming = shown.filter((p) => p.date >= today).sort(byDateAsc);
  const past = shown.filter((p) => p.date < today).sort(byDateDesc);
  const runs = Object.values(data.productions);

  return (
    <>
      <h4>Upcoming</h4>
      {upcoming.length === 0 ? (
        <p>Nothing on the books at the moment.</p>
      ) : (
        <ul className="piano__perfs">
          {upcoming.map(row)}
        </ul>
      )}

      <h4>Past concerts</h4>
      <ul className="piano__perfs">
        {past.map(row)}
      </ul>

      {runs.length > 0 && (
        <>
          <h4>Runs</h4>
          <ul className="piano__perfs">
            {runs.map((r) => (
              <li className="piano__perf" key={r.title}>
                <div className="piano__perf-what">
                  <span className="piano__perf-title">{r.title}</span>
                </div>
                <div className="piano__perf-where">
                  {r.note}
                  {r.venueId && data.venues[r.venueId] && ` · ${data.venues[r.venueId].name}`}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export default Performances;
