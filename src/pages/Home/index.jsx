import React from 'react';
import { Link } from 'react-router-dom';

import headshotThumb from 'url:/src/assets/media/headshot-thumb.png';
import headshot from 'url:/src/assets/media/headshot.png';
import monkeyThumb from 'url:/src/assets/media/monkeh-thumb.jpg';
import monkey from 'url:/src/assets/media/monkeh.jpg';

import Image from '/src/sharedComponents/Image';

import './styles.css';

const Home = ({ selectedTab, setSelectedTab }) => (
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
          travis horton
        </h1>
        <h2>
          software engineer
          <br />
          pianist
          <br />
          accountant
        </h2>
      </div>
    </header>
    <div>
      <p>
        I&apos;m Travis. I program in React/JavaScript/CSS/HTML and I&apos;ve been trying
        to learn Rust. I play the piano. I do some accounting on the side. I live in Boise, Idaho
        with my wonderful wife Anne and our cat Monkey. And I run. Really slowly.
      </p>
      <p>
        We bought a house in the summer of 2020! What an adult thing to do &mdash; I
        definitely never thought I&apos;d get this responsible.
      </p>
      <div className='home__monkey-pic'>
        <Image alt="monkey" thumb={monkeyThumb} src={monkey} height={210} width={157} />
      </div>
      <p>
        I attended the Recurse Center Spring 1, 2019 batch: February 18 &mdash; May 9. It was a
        great time, I met a lot of amazing people, and I learned a ton.
        {' '}
        <Link to={`/programming`} onClick={() => setSelectedTab('programming')}>here</Link>
        {' '}
        are some of the projects I worked on while I was there and before.
      </p>
      <p>
        In 2017, Anne and I decided to leave our 6-year home of Brooklyn for the road.
        We bought an RV and traveled the country for a year and a half. I studied
        programming part time while I worked half-time as an accountant for the Brooklyn
        Youth Chorus.
      </p>
      <p>
        I studied piano for 6 years at UNC-School of the Arts and 2 more years at the New
        England Conservatory. I moved to New York City in 2011 and worked as a pianist
        there for 6 years &mdash; played Carnegie Hall, Joe&apos;s Pub, Off-Broadway shows,
        worked for NYU and the Brooklyn Youth Chorus as a vocal coach and staff pianist. I
        rode my bicycle a lot.
      </p>
    </div>
  </main>
);

export default Home;
