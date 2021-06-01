import React from 'react';
import twitterLogo from 'url:~/src/media/twitter-logo.png';
import instaLogo from 'url:~/src/media/ig-logo.png';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footer_content}>
      <span>
        &copy;&apos;21 kiddspazz
      </span>
    </div>
    <img className={styles.footer_logo} src={twitterLogo} alt="twitter-logo" />
    <img className={styles.footer_logo} src={instaLogo} alt="instagram-logo" />
  </footer>
);

export default Footer;
