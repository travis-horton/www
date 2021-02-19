import React from 'react';
import piano from 'media/piano-background.png';
import styles from './Piano.module.css';

const Piano = () => (
  <div className={styles.main}>
    <p>
      i teach the piano at the
      {' '}
      <a
        href="https://www.collegeofidaho.edu/directory/travis-horton"
        rel="noreferrer"
        target="_blank"
      >
        college of idaho
      </a>
      , and also play the piano for
      their choirs and student recitals and juries. i started working with the college of
      idaho in the fall semester of 2019.
    </p>
    <img className={styles.pianoImage} src={piano} alt="piano" />
  </div>
);

export default Piano;
