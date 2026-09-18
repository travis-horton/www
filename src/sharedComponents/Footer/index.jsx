import React from 'react';
import { Link } from 'react-router-dom';
import { version } from '../../../package.json';
import { versionLabel } from './versionLabel';

import './styles.css';

// Baked in at build time (Dockerfile ARGs, passed by deploy-to-dev); package.json is the fallback.
const label = versionLabel(process.env.APP_VERSION || version, process.env.BUILD_DATE);

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
      I&apos;m not on social media. The <Link to="/contact">contact page</Link>{' '}
      is the way to reach me.
    </small>
    <small className="main-footer__content main-footer__content--static">
      &copy;&apos;26 kiddspazz &middot; {label}
    </small>
  </footer>
);

export default Footer;
