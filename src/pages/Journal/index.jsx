import React from 'react';
import journalData from './journal_data';

import './styles.css';

const MsPerDay = (1000 * 60 * 60 * 24);
const MY_BDAY = new Date(1983, 9, 22);
const HEIGHT = 85;
const WIDTH = 85;

const getHOffset = (date) => {
  const weekDay = date.getDay()
  return WIDTH * weekDay
}

const getVOffset = (date) => {
  const today = new Date();

  const daysBetweenTodayAndDay = Math.floor(
    (today - date)/MsPerDay
  );

  const weeksBetweenTodayAndDay = Math.floor(
    ((daysBetweenTodayAndDay + 6 - today.getDay())/7)
  );

  return weeksBetweenTodayAndDay * HEIGHT;
}

const getMyDay = (date) => Math.floor((date - MY_BDAY)/(1000 * 60 * 60 * 24))

const Day = (day) => {
  const divLocation = {
    'top': getVOffset(day.date),
    'left': getHOffset(day.date),
  };

  let className = "journal__day";
  className += ` mh${day.mental_health - 5}`;
  if (day.s) className += " s";
  const mental_health = {
    5: '😁',
    4: '😀',
    3: '🙂',
    2: '😐',
    1: '😞',
    0: '😭',
  }

  return (
    <div className={className} key={Number(day.date)} style={divLocation}>
      <div className="day__day-number">
        <p>
        {getMyDay(day.date)}
        </p>
        <p className="smiley">
        {mental_health[day.mental_health - 5]}
        </p>
      </div>
    </div>
  )
}

const Journal = () => (
  <main>
    <div className="journal">
      {
        journalData.map(day =>
          Day(day)
        )
      }
    </div>
  </main>
);

export default Journal;
