import React from 'react';
import twitterLogo from 'url:/src/assets/media/twitter-logo.png';
import instaLogo from 'url:/src/assets/media/insta-logo.svg';
import { version } from '../../../package.json';

import './styles.css';

const gitHash = (process.env.GIT_HASH || 'local').slice(0, 7);

const Footer = () => (
  <footer className='main-footer'>
    <small className='main-footer__content'>
        &copy;&apos;26 kiddspazz &middot; v{version}.{gitHash}
    </small>
    <a href='https://twitter.com/brightlyopen' target='_blank' rel='noreferrer'>
      <img className='main-footer__logo' src={twitterLogo} alt="twitter-logo" />
    </a>
    <a href='https://www.instagram.com/brightlyopen' target='_blank' rel='noreferrer'>
      <img className='main-footer__logo' src={instaLogo} alt="instagram-logo" />
    </a>
  </footer>
);

export default Footer;
