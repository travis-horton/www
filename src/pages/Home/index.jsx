import React from 'react';
import { Link } from 'react-router-dom';

import headshotThumb from 'url:/src/assets/media/headshot-thumb.png';
import headshot from 'url:/src/assets/media/headshot.png';

import Image from '/src/sharedComponents/Image';

import './styles.css';

function Home() {
  return (
    <main>
      <Image
        className="home__profile-pic"
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
            Pianist
            <br />
            Accountant
            <br />
            Software Engineer
          </h2>
        </div>
      </header>
      <div>
        <p>
          I&apos;m Travis. I live in Boise, Idaho with my wife Anne. I hold three
          jobs, which sounds worse than it is. I play the piano, I keep the books
          for a children&apos;s chorus in Brooklyn, and I write software. Two of
          those are in Boise and one of them is remote, and most weeks they stay
          out of each other&apos;s way.
        </p>

        <h4>At the piano</h4>
        <p>
          I&apos;m Adjunct Professor of Piano and Staff Pianist at the
          {' '}
          <a
            href="https://www.collegeofidaho.edu/directory/travis-horton"
            rel="noreferrer"
            target="_blank"
          >
            College of Idaho
          </a>
          , and a staff pianist at Boise State. At the College I teach class piano
          and keyboarding skills, and I keep a studio of about fifteen students. I
          also play studio classes, recital hour, juries and student recitals
          there. At Boise State I play for the choirs, which are Meistersingers,
          University Singers and Vox Angelis, and for the opera and musical
          theatre workshop. I play for the Boise Philharmonic Master Chorale as
          well. Nearly all of this is collaborative piano, which is what I trained
          for and the thing I am best at.
        </p>

        <h4>In the books</h4>
        <p>
          Since 2017 I have been the accountant for the Brooklyn Youth Chorus. The
          work is remote and covers payroll, reconciliation, budgets and the
          monthly close. People are usually surprised that this is the same person
          who plays the piano. I find the two fit together better than they sound.
          A set of books either balances or it does not, and you learn which the
          same day you ask. Very little else in my week is that decisive.
        </p>

        <h4>At the other keyboard</h4>
        <p>
          I was a front-end engineer at Bodybuilding.com and a full-stack engineer
          at
          {' '}
          <a href="https://www.honorcare.com" target="_blank" rel="noreferrer">honor</a>
          . In the spring of 2019 I spent a batch at the
          {' '}
          <a
            href="https://www.recurse.com/"
            rel="noreferrer"
            target="_blank"
          >
            Recurse Center
          </a>
          {' '}
          in Brooklyn, which I recommend to anyone who is even slightly curious
          about programming. These days I write mostly JavaScript, React and
          Python. I have been learning Zig for the past several months and writing
          the backend that will eventually serve this site. Progress is slow. I am
          currently stuck on allocators, which I gather is the normal place to be
          stuck.
        </p>

        <h4>A little background</h4>
        <p>
          I studied piano for six years at UNC School of the Arts and two more at
          the New England Conservatory. I moved to New York City in 2011 and
          worked there as a pianist for six years. I played Carnegie Hall and
          Joe&apos;s Pub and a number of Off-Broadway shows, and I worked for NYU
          and the Brooklyn Youth Chorus as a vocal coach and staff pianist. I rode
          my bicycle a lot. I married Anne in September of 2016.
        </p>
        <p>
          In 2017 Anne and I left Brooklyn, which had been home for six years, and
          bought an RV. We travelled the country in it for a year and a half. I
          studied programming part time during that stretch and worked half time
          as an accountant for the Chorus. We picked Boise as a home base at the
          end of it, and shortly afterward I was accepted into the Recurse Center.
        </p>

        <h4>Away from all that</h4>
        <p>
          There is usually a board game on the table. Root and Spirit Island get
          the most play. I ski when the season allows it and I run at a pace I
          have made peace with. The garden produces more tomatoes than two people
          can reasonably eat. I have started an escarpment live oak as a bonsai,
          which is a project measured in decades, and the right time to begin one
          is always now. I cook dinner most nights.
        </p>
        <p>
          I keep a quarrel going with the Gregorian calendar. I count in base six
          on purpose, and I am slowly learning
          {' '}
          <Link to="/learn">toki pona</Link>
          , which is a complete language of about 120 words. I have written in a
          journal every day since the first of January, 2019. Every entry carries
          the same line at the top, which is as close to a philosophy as I have
          managed: extract the most joy out of the most life.
        </p>

        <h4>Around here</h4>
        <p>
          The
          {' '}
          <Link to="/piano">pianist</Link>
          {' '}
          page covers the teaching and the playing, and lists what I have coming
          up.
          {' '}
          <Link to="/programming">Software engineer</Link>
          {' '}
          has the things I have built for my own amusement, including a ray
          tracer, some Perlin noise, a bit of orbital mechanics and a clock that
          counts in base six. The
          {' '}
          <Link to="/blog">blog</Link>
          {' '}
          is sporadic and mostly concerns how computers work.
          {' '}
          <Link to="/contact">Contact</Link>
          {' '}
          has my email address.
        </p>
      </div>
    </main>
  );
}

export default Home;
