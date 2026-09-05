import React from 'react';
import { Link } from 'react-router-dom';
import { version } from '../../../package.json';

import './styles.css';

const gitHash = (process.env.GIT_HASH || 'local').slice(0, 7);

/*
 * The Twitter and Instagram links came out on 26.0905. Travis does not use
 * either account any more, and a link to an abandoned profile is worse than no
 * link at all.
 *
 * The footer now carries the things that are real but do not deserve a slot in
 * the header: /learn is a live route that the nav has never advertised, so
 * before this it was reachable only by guessing the URL.
 */
const Footer = () => (
  <footer className="main-footer">
    <small className="main-footer__content">
      <Link to="/learn">learn</Link>
      {' · courses in base six and toki pona'}
    </small>
    <small className="main-footer__content">
      I&apos;m not on social media. The
      {' '}
      <Link to="/contact">contact page</Link>
      {' '}
      is the way to reach me.
    </small>
    <small className="main-footer__content main-footer__content--static">
      &copy;&apos;26 kiddspazz &middot; v
      {version}
      .
      {gitHash}
    </small>
  </footer>
);

export default Footer;
