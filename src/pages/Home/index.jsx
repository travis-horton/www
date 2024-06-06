import React from 'react';
import { Link } from 'react-router-dom';

import headshotThumb from 'url:/src/assets/media/headshot-thumb.png';
import headshot from 'url:/src/assets/media/headshot.png';

import Image from '/src/sharedComponents/Image';

import './styles.css';

const Home = ({ setSelectedTab }) => (
  <main>
    <Image
      className='home__profile-pic'
      alt="headshot"
      thumb={headshotThumb}
      src={headshot}
      height={285}
      width={285}
    />
    <header>
      <div>
        <h1>
          Travis Horton
        </h1>
        <h2>
          Software Engineer
          <br />
          Pianist
          <br />
          Accountant
        </h2>
      </div>
    </header>
    <div>
      <p>
        I&apos;m Travis. I program in React/JavaScript/CSS/HTML/Python and I
        play the piano. I do some accounting on the side. I live in Boise, Idaho
        with my wonderful wife Anne.
      </p>
      <p>
        I work for the{' '}
        <a
          href="https://www.collegeofidaho.edu/directory/travis-horton"
          rel="noreferrer"
          target="_blank"
        >College of Idaho</a> as the Professor of Piano, Choir Director, and
        staff pianist.
      </p>
      <p>
        Until November 2023 I was programming during the morning/early afternoon
        and teaching piano in the afternoons and into the evening. Most
        recently, I was working for <a href="https://www.honorcare.com">honor</a>
        {' '}during the day. That was a great job.
      </p>
      <h4>A little background</h4>
      <p>
        I studied piano for 6 years at UNC-School of the Arts and 2 more years at the New
        England Conservatory. I moved to New York City in 2011 and worked as a pianist
        there for 6 years &mdash; played Carnegie Hall, Joe&apos;s Pub, Off-Broadway shows,
        worked for NYU and the Brooklyn Youth Chorus as a vocal coach and staff pianist. I
        rode my bicycle a lot. I married Anne in September, 2016.
      </p>
      <p>
        In 2017, Anne and I decided to leave our 6-year home of Brooklyn for the road.
        We bought an RV and traveled the country for a year and a half. I studied
        programming part time while I worked half-time as an accountant for the Brooklyn
        Youth Chorus. We decided on Boise as a home-base, and shortly thereafter
        I was accepted into the{' '}
        <a
          href="https://www.recurse.com/"
          rel="noreferrer"
          target="_blank"
        >Recurse Center</a>. That was awesome; if you have any interest in
        programming, please do check it out.
      </p>
      <p>
         <Link
           to={`/programming`}
          onClick={() => setSelectedTab('programming')}
         >Here</Link> are a few things I&apos;ve built on my own, mostly from a
        long time ago now.
      </p>
    </div>
  </main>
);

export default Home;
