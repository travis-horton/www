import React from 'react';

import resume from 'url:/src/assets/resume.pdf';

const Contact = () => (
  <main>
    <h2>Contact</h2>
    <p>
      Email:
      {' '}
      <a href="mailto:travis@travish.com" target="_blank" rel="noreferrer">travis@travish.com</a>
      <br />
      Phone: 919.593.0887
      <br />
      Twitter:
      {' '}
      <a href="https://twitter.com/brightlyopen">brightlyopen</a>
      <br />
      Instagram:
      {' '}
      <a href="https://www.instagram.com/brightlyopen">brightlyopen</a>
      <br />
      LinkedIn:
      {' '}
      <a href="https://www.linkedin.com/in/travis-horton-64b318182/">Travis Horton</a>
      <br />
    </p>
    <h2>Resume</h2>
    <p><a href={ resume }>Resume (pdf)</a></p>
    <h2>Projects</h2>
    <p>
      Github:
      {' '}
      <a href="https://github.com/kiddspazz">kiddspazz</a>
    </p>
    <h2>Blogs I follow</h2>
    <p>
      <a href="https://blog.jfo.click" target="blank">Jeff Fowler&apos;s blog</a>
      <br />
      <a href="https://jvns.ca/" target="blank">Julia Evan&apos;s blog</a>
    </p>
  </main>
);

export default Contact;
