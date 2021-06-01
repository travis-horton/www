import React from 'react';

const Contact = () => (
  <div className={styles.main}>
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
    <p><a href="/res/other/horton-resume.pdf">resume (pdf)</a></p>
    <h2>projects</h2>
    <p>
      github:
      {' '}
      <a href="https://github.com/kiddspazz">kiddspazz</a>
    </p>
    <h2>blogs i follow</h2>
    <p>
      <a href="https://blog.jfo.click" target="blank">jeff fowler&apos;s blog</a>
      <br />
      <a href="https://jvns.ca/" target="blank">julia evan&apos;s blog</a>
    </p>
  </div>
);

export default Contact;
