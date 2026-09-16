import React from 'react';

import Performances from './Performances';

import './styles.css';

function Piano() {
  return (
    <main>
      <p>
        I play the piano with other people. That is the work, and it is the part
        of music I have always wanted to do.
      </p>
      <p>
        I&apos;m a staff pianist at Boise State. I play for the choirs, which are
        Meistersingers, University Singers and Vox Angelis, and for the opera and
        musical theatre workshop, and guest artists turn up and I play for most of
        them. I also play for the Boise Philharmonic Master Chorale, and I teach a
        private piano studio. Until this fall I was Adjunct
        Professor of Piano and Staff Pianist at the College of Idaho in Caldwell,
        where I taught class piano and keyboarding skills and kept a studio of
        about fifteen students.
      </p>

      <h4>Collaborative piano</h4>
      <p>
        Collaborative piano is its own discipline, and it is what I trained for. A
        soloist decides the tempo, the rubato and where the phrase breathes. I
        decide all of the same things and then hand most of them to somebody else
        while continuing to play. Much of the skill is anticipation. I have to
        hear a breath before it arrives and know the text as well as the singer
        does, because the words are my part too.
      </p>
      <p>
        The rest of it is more practical. I play orchestra reductions that were
        never meant for two hands and try to make them sound deliberate. I
        transpose on sight, because a voice gets tired and the aria goes down a
        whole step that evening. Sight reading is a requirement rather than an
        accomplishment. None of this is glamorous and nobody has ever bought a
        ticket on my account, but the best moments in a performance are the ones
        nobody planned, and you only get those by listening closely enough to
        follow.
      </p>
      <p>
        I studied piano for six years at UNC School of the Arts and two more at
        the New England Conservatory.
      </p>

      <h4>Pits</h4>
      <p>
        I play musical theatre when I can get it. Recent runs include Always,
        Patsy Cline and The 25th Annual Putnam County Spelling Bee. This fall I am
        assistant music director on Annie. The work is the same set of skills
        applied under worse lighting and a tighter clock.
      </p>

      <h4>What I play for</h4>
      <ul>
        <li>Choral rehearsals and concerts</li>
        <li>Voice and instrumental recitals, whether student, faculty or degree</li>
        <li>Juries, studio classes and auditions</li>
        <li>Opera and musical theatre workshops and scenes programs</li>
        <li>Musical theatre pits, and music or assistant music direction</li>
        <li>Coachings for singers learning repertoire</li>
        <li>Guest artists and masterclasses</li>
        <li>Private lessons in piano and voice</li>
      </ul>
      <p>
        If you have a recital on the calendar and no pianist, or a singer who
        needs a coach, or a pit that needs a keyboard player, write to me at
        {' '}
        <a href="mailto:travis@travish.com">travis@travish.com</a>
        . If I am already booked or I am not the right fit, I can usually point
        you at someone who is.
      </p>

      <h4>Performances</h4>
      <p>
        What is coming up, and some of what has already happened. The list is not
        complete. A great deal of this work is rehearsals, juries and studio
        classes that nobody prints a program for.
      </p>
      <Performances />
    </main>
  );
}

export default Piano;
