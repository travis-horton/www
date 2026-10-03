import React from 'react';
import { Link } from 'react-router-dom';
import { versionLabel } from './versionLabel';

import './styles.css';

// Baked in at build time. APP_VERSION and BUILD_DATE are the Dockerfile's ARGs,
// passed by deploy-to-dev. A build without them (a laptop, the checks workflow,
// an image built by hand) falls back to npm_package_version: package.json's
// version, which npm puts in the environment of anything started with
// `npm run`. The bundler writes that one string into the code.
// ⚠️ Every name read here must ALSO be listed under "@parcel/transformer-js" →
// inlineEnvironment in package.json. Parcel skips npm_* names unless they are
// listed, without an error: the footer would just say v0.0.0.
// ⚠️ Do NOT import package.json here instead. That put the whole file (every
// dependency, the test settings) into the bundle visitors download.
// scripts/check-bundle.mjs fails the checks on either mistake.
const label = versionLabel(
  process.env.APP_VERSION || process.env.npm_package_version || '0.0.0',
  process.env.BUILD_DATE,
);

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
