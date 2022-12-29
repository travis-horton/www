import React from 'react';

import performanceData from './performance_data';
import './styles.css';

const createPerfList = (performances) => (
  <table className='concerts'>
    {
      performances.map((perf) => (
        <tr className="performance" key={perf.date}>
          <td className="perfomance__name">{perf.name}</td>
          <td>Performers: {perf.performers}</td>
          <td><a href={perf.googleMapsLink}>Location: {perf.venue}</a></td>
          {perf.program && <td>Program: {perf.program}</td>}
          {perf.description && <td>Description: {perf.description}</td>}
          <td>Time and Date: {perf.date.toLocaleString()}</td>
        </tr>
      ))
    }
  </table>
)

const upcomingPerformances = 
  createPerfList(performanceData.filter((perf) => 
    perf.date > new Date()
  ))

const pastPerformances = 
  createPerfList(performanceData.filter((perf) => {
    return perf.date < new Date()
  }
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
