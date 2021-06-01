import React from 'react';
import Image from '~/src/Components/Image';
import piano from 'url:~/src/media/piano-background.png';
import pianoThumb from 'url:~/src/media/piano-thumb.png';

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
    <Image alt="headshot" thumb={pianoThumb} src={piano} height={285} width={285} />
  </div>
);

export default Piano;
