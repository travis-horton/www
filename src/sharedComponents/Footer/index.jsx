import React from 'react';
import twitterLogo from 'url:/src/assets/media/twitter-logo.png';
import instaLogo from 'url:/src/assets/media/insta-logo.svg';

import './styles.css';

const Footer = () => (
  <footer className='main-footer'>
    <small className='main-footer__content'>
        &copy;&apos;21 kiddspazz
    </small>
    <a href='https://twitter.com/brightlyopen'>
      <img className='main-footer__logo' src={twitterLogo} alt="twitter-logo" />
    </a>
    <a href='https://www.instagram.com/brightlyopen'>
      <img className='main-footer__logo' src={instaLogo} alt="instagram-logo" />
    </a>
  </footer>
);

export default Footer;
