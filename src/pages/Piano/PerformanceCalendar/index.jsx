import React from 'react';

import performanceData from './performance_data';
import './styles.css';

const createPerfList = (performances) =>
  performances.map((perf) =>
    <li className="performance" key={perf.date}>
      <h2 className="perfomance__name">{perf.name}</h2>
      <p>Performers: {perf.performers}</p>
      <a href={perf.googleMapsLink}>Location: {perf.venue}</a>
      {perf.program && <p>Program: {perf.program}</p>}
      {perf.description && <p>Description: {perf.description}</p>}
      <p>Time and Date: {perf.date.toLocaleString()}</p>
    </li>
  );

const upcomingPerformances = 
  createPerfList(performanceData.filter((perf) => 
  perf.date > new Date()
))

const pastPerformances = 
  createPerfList(performanceData.filter((perf) => 
  perf.date < new Date()
))

const PerformanceCalendar = () => {
  return (
    <div className="performances-content">
      <h1 className="performances-content__title">Upcoming Performances</h1>
      <ul>
      {upcomingPerformances}
      </ul>
      <h1 className="performances-content__title">Past Performances</h1>
      <ul>
      {pastPerformances}
      </ul>
    </div>
  )
};

export default PerformanceCalendar;
