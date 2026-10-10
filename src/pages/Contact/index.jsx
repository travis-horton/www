import React from 'react';

import resume from 'url:/src/assets/resume.pdf';

const Contact = () => (
  <main>
    {/* The page's own name is its h1, drawn the size of the h2s below. */}
    <h1 className="page-heading">Contact</h1>
    <p>
      Email: <a href="mailto:travis@travish.com">travis@travish.com</a>
      <br />
      Phone: 919.593.0887
      <br />
      LinkedIn:{' '}
      <a
        href="https://www.linkedin.com/in/travis-horton-64b318182/"
        target="_blank"
        rel="noreferrer"
      >
        Travis Horton
      </a>
      <br />
    </p>
    <h2>Resume</h2>
    <p>
      <a href={resume}>Resume (pdf)</a>
    </p>
    <h2>Projects</h2>
    <p>
      Github:{' '}
      <a
        href="https://github.com/travis-horton"
        target="_blank"
        rel="noreferrer"
      >
        travis-horton
      </a>
    </p>
    <h2>Blogs I follow</h2>
    <p>
      <a href="https://blog.jfo.click" target="_blank" rel="noreferrer">
        Jeff Fowler&apos;s blog
      </a>
      <br />
      <a href="https://jvns.ca/" target="_blank" rel="noreferrer">
        Julia Evans&apos;s blog
      </a>
    </p>
  </main>
);

export default Contact;
