import React from 'react';
import journalData from './utils/journal_data';

import './styles.css';

const MsPerDay = (1000 * 60 * 60 * 24);
const MY_BDAY = new Date(1983, 9, 22);
const HEIGHT = 85;
const WIDTH = 85;

const MENTAL_HEALTH_EMOJI = {
  5: '😁',
  4: '😀',
  3: '🙂',
  2: '😐',
  1: '😞',
  0: '😭',
};

const getHOffset = (date) => {
  const weekDay = date.getDay();
  return WIDTH * weekDay;
};

const getVOffset = (date) => {
  const today = new Date();
  const mostRecentSunday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay(),
  );
  const weeksBetweenTodayAndDay = Math.ceil(
    (mostRecentSunday - date) / (7 * MsPerDay),
  );

  return weeksBetweenTodayAndDay * HEIGHT;
};

const getMyDay = (date) => {
  const jsDate = new Date(date);
  const year = jsDate.getFullYear() - 2000;
  const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
  const day = jsDate.getDate().toString().padStart(2, '0');

  const myDay = Math.floor((date - MY_BDAY) / MsPerDay);

  return `${year}${month}${day} - ${myDay}`;
};

const Day = ({ date: rawDate, mental_health, s }) => {
  const date = new Date(rawDate);
  const divLocation = {
    top: getVOffset(date),
    left: getHOffset(date),
  };

  let className = 'journal__day';
  if (mental_health != null) className += ` mh${mental_health - 5}`;
  if (Number(s)) className += " s";

  return (
    <div className={className} style={divLocation}>
      <div className="day__day-number">
        <p>
          {getMyDay(date)}
        </p>
        <p className="smiley">
          {mental_health != null && MENTAL_HEALTH_EMOJI[Math.floor(mental_health) - 5]}
        </p>
      </div>
    </div>
  );
};

const Journal = () => (
  <main>
    <div className="journal">
      {
        journalData.map((day) => <Day key={day.date} {...day} />)
      }
    </div>
  </main>
);

export default Journal;
