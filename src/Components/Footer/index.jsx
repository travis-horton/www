import React from 'react';
import twitterLogo from 'media/twitter-logo.png';
import instaLogo from 'media/insta-logo.png';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    &copy; &apos;21 kiddspazz
    <img className={styles.footer_logo} src={twitterLogo} alt="twitter-logo" />
    <img className={styles.footer_logo} src={instaLogo} alt="instagram-logo" />
  </footer>
);

export default Footer;
