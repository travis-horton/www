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
          I&apos;m Travis. I play the piano for a living, keep the books for a
          children&apos;s chorus, and write software because I like it. I live in
          Boise, Idaho with my wife Anne, and I drive to Caldwell more than
          you&apos;d think. Three jobs, one calendar. It works better than it
          sounds.
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
          , and a staff pianist at Boise State. At the College it&apos;s piano
          students, class piano and keyboarding skills, studio classes and
          recital hour. At Boise State it&apos;s the choirs &mdash;
          Meistersingers, University Singers, Vox Angelis &mdash; and the opera
          and musical theatre workshop. Both come with a great many juries in a
          great many keys. I also play for the Boise Philharmonic Master Chorale,
          and when a pit needs a keyboard player I&apos;m usually in it.
        </p>
        <p>
          Collaborative piano is the job I&apos;ve had longest. You sit slightly
          behind someone, you make their idea work, and nobody claps for you
          specifically. It&apos;s good work.
        </p>

        <h4>In the books</h4>
        <p>
          Since 2017 I&apos;ve been the accountant for the Brooklyn Youth Chorus,
          remotely. Payroll, reconciliation, budgets, the profit and loss, the
          balance sheet.
        </p>
        <p>
          People find this the surprising one. I don&apos;t. A set of books
          balances or it doesn&apos;t, and the answer arrives the same day you
          ask. Very little else in a musician&apos;s week offers that.
        </p>

        <h4>At the other keyboard</h4>
        <p>
          I was a front-end engineer at Bodybuilding.com and a full-stack engineer
          at
          {' '}
          <a href="https://www.honorcare.com" target="_blank" rel="noreferrer">honor</a>
          . In the spring of 2019 I went to the
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
          about programming.
        </p>
        <p>
          These days it&apos;s mostly JavaScript, React, and Python, and lately
          Zig &mdash; I&apos;m writing the backend that will eventually serve this
          site, one allocator at a time. I also spend an indefensible amount of
          time in my vim config.
        </p>

        <h4>A little background</h4>
        <p>
          I studied piano for 6 years at UNC-School of the Arts and 2 more years
          at the New England Conservatory. I moved to New York City in 2011 and
          worked as a pianist there for 6 years &mdash; played Carnegie Hall,
          Joe&apos;s Pub, Off-Broadway shows, worked for NYU and the Brooklyn
          Youth Chorus as a vocal coach and staff pianist. I rode my bicycle a
          lot. I married Anne in September, 2016.
        </p>
        <p>
          In 2017, Anne and I decided to leave our 6-year home of Brooklyn for the
          road. We bought an RV and traveled the country for a year and a half. I
          studied programming part time while I worked half-time as an accountant
          for the Brooklyn Youth Chorus. We decided on Boise as a home-base, and
          shortly thereafter I was accepted into the Recurse Center.
        </p>

        <h4>Three hats</h4>
        <p>
          The unifying thing is preparation. A choir rehearsal, a bank
          reconciliation, and a deploy all reward the same habit: read the whole
          thing first, find the measure where it goes wrong, fix that measure. The
          rest is just which room you&apos;re standing in.
        </p>

        <h4>Around here</h4>
        <p>
          The
          {' '}
          <Link to="/piano">pianist</Link>
          {' '}
          page covers the teaching and playing.
          {' '}
          <Link to="/programming">Software engineer</Link>
          {' '}
          has the things I&apos;ve built for fun &mdash; a ray tracer, Perlin
          noise, some orbital mechanics, a clock that counts in base six.
          {' '}
          <Link to="/learn">Learn</Link>
          {' '}
          has small courses in things almost nobody teaches: counting in base six,
          and toki pona, a complete language in about 120 words. The
          {' '}
          <Link to="/blog">blog</Link>
          {' '}
          is sporadic and mostly about how computers work.
          {' '}
          <Link to="/contact">Contact</Link>
          {' '}
          has the email address.
        </p>
        <h4>Off the clock</h4>
        <p>
          There is a board game on the table most weeks &mdash; Root, Spirit
          Island, Gaia Project, Terraforming Mars. I ski as much as the season
          allows, run slower than I&apos;d like and enjoy it anyway, and keep a
          garden that produces an indefensible quantity of tomatoes. I&apos;m
          starting an escarpment live oak as a bonsai, which is a ten-year
          project and therefore the right time to begin is now. I cook dinner.
        </p>
        <p>
          I also have an ongoing quarrel with the Gregorian calendar, count in
          base six on purpose, and am slowly learning
          {' '}
          <Link to="/learn">toki pona</Link>
          , a complete language with about 120 words. None of this is useful.
          That is rather the point.
        </p>
        <p>
          I&apos;ve kept a journal every single day since the first of January,
          2019. Every entry carries the same line, which is as close as I get to
          a philosophy: extract the most joy out of the most life.
        </p>
      </div>
    </main>
  );
}

export default Home;
