import React from 'react';
import journalData from './utils/journal_data';

import './styles.css';

const MsPerDay = (1000 * 60 * 60 * 24);
const MY_BDAY = new Date(1983, 9, 22);
const HEIGHT = 85;
const WIDTH = 85;
const today = new Date();

const getHOffset = (date) => {
  const weekDay = date.getDay();
  return WIDTH * weekDay;
};

const getVOffset = (date) => {
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
  const day = jsDate.getDate().toString().padStart(2, '0');;

  const myDay = Math.floor((date - MY_BDAY) / (1000 * 60 * 60 * 24));

  return `${year}${month}${day} - ${myDay}`;
};

const Day = (day) => {
  const date = new Date(day.date);
  const divLocation = {
    top: getVOffset(date),
    left: getHOffset(date),
  };

  let className = 'journal__day';
  className += ` mh${day.mental_health - 5}`;
  if (parseInt(day.s)) className += " s";
  const mental_health = {
    5: '😁',
    4: '😀',
    3: '🙂',
    2: '😐',
    1: '😞',
    0: '😭',
  };

  return (
    <div className={className} key={Number(date)} style={divLocation}>
      <div className="day__day-number">
        <p>
          {getMyDay(date)}
        </p>
        <p className="smiley">
          {mental_health[Math.floor(day.mental_health) - 5]}
        </p>
      </div>
    </div>
  );
};

const Journal = () => (
  <main>
    <div className="journal">
      {
        journalData.map((day) => Day(day))
      }
    </div>
  </main>
);

export default Journal;
