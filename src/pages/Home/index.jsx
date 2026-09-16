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
          I&apos;m Travis. I live in Boise, Idaho, with my wife Anne. For work I
          mostly play the piano and do a little accounting for a children&apos;s
          chorus in Brooklyn. I&apos;m a recovering professional programmer, now
          just programming for fun.
        </p>

        <h4>At the piano</h4>
        <p>
          I&apos;m a staff pianist at
          {' '}
          <a
            href="https://www.boisestate.edu/"
            rel="noreferrer"
            target="_blank"
          >
            Boise State
          </a>
          , where I play for the choirs, which are Meistersingers, University
          Singers and Vox Angelis, and for the opera and musical theatre workshop.
          I play for the
          {' '}
          <a
            href="https://boisephil.org/master-chorale/"
            rel="noreferrer"
            target="_blank"
          >
            Boise Philharmonic Master Chorale
          </a>
          {' '}
          as well, and I keep a private piano studio in Boise. Until this fall I
          was also Adjunct Professor of Piano and Staff Pianist at the
          {' '}
          <a
            href="https://www.collegeofidaho.edu/"
            rel="noreferrer"
            target="_blank"
          >
            College of Idaho
          </a>
          . Nearly all of this is collaborative piano, which is what I trained
          for and the thing I am best at.
        </p>

        <h4>In the books</h4>
        <p>
          Since 2017 I have been the accountant for the
          {' '}
          <a
            href="https://www.brooklynyouthchorus.org/"
            rel="noreferrer"
            target="_blank"
          >
            Brooklyn Youth Chorus
          </a>
          . The work is remote and covers payroll, reconciliation, budgets and
          the monthly close. Accounting is just playing with numbers, and my
          first try at college (
          <a
            href="https://www.unc.edu/"
            rel="noreferrer"
            target="_blank"
          >
            UNC-CH
          </a>
          ) was as a math major. Though that didn&apos;t work out, my love of
          numbers stuck with me.
        </p>

        <h4>At the other keyboard</h4>
        <p>
          I was a front-end engineer at Bodybuilding.com and a full-stack engineer
          at
          {' '}
          <a href="https://www.honorcare.com" target="_blank" rel="noreferrer">honor</a>
          . In the spring of 2019 I spent three months (a &quot;batch&quot;) at the
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
          the backend that will eventually serve this site. Progress is slow.
        </p>

        <h4>A little background</h4>
        <p>
          I studied piano for six years at
          {' '}
          <a
            href="https://www.uncsa.edu/"
            rel="noreferrer"
            target="_blank"
          >
            UNC School of the Arts
          </a>
          {' '}
          and two more at the
          {' '}
          <a
            href="https://necmusic.edu/"
            rel="noreferrer"
            target="_blank"
          >
            New England Conservatory
          </a>
          . I moved to New York City in 2011 and
          worked there as a pianist for six years. I played Carnegie Hall and
          Joe&apos;s Pub and a number of Off-Broadway shows, and I worked for NYU
          and the Brooklyn Youth Chorus as a vocal coach and staff pianist. I rode
          my bicycle a lot. I married Anne in September of 2016.
        </p>
        <p>
          In 2017 Anne and I left Brooklyn, which had been home for six years, and
          bought an RV. We traveled the country in it for a year and a half. I
          studied programming part time during that stretch and worked half time
          as an accountant for the Chorus. We picked Boise as a home base at the
          end of it, and shortly afterward I was accepted into the Recurse Center.
        </p>

        <h4>Away from all that</h4>
        <p>
          I love board games, skiing and playing in my garden, and I have
          aspirations of being a &quot;runner&quot; (because right now I&apos;m
          just a jogger) and of having an escarpment oak bonsai tree!
        </p>
        <p>
          I keep a
          {' '}
          <a
            href="https://en.wikipedia.org/wiki/Calendar_reform"
            rel="noreferrer"
            target="_blank"
          >
            quarrel going with the Gregorian calendar
          </a>
          . I count in
          {' '}
          <a
            href="https://www.seximal.net/"
            rel="noreferrer"
            target="_blank"
          >
            base six
          </a>
          {' '}
          on purpose, and I am slowly learning
          {' '}
          <Link to="/learn">toki pona</Link>
          , which is a complete language of about 120 words.
        </p>

        <h4>Around here</h4>
        <p>
          The
          {' '}
          <Link to="/piano">pianist</Link>
          {' '}
          page covers the teaching and the playing, and lists what I have coming
          up. The
          {' '}
          <Link to="/programming">software engineer</Link>
          {' '}
          page has the things I have built for my own amusement, including a ray
          tracer, some Perlin noise, a bit of orbital mechanics and a clock that
          counts in base six.
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
