import React from 'react';
// import { Link } from 'react-router-dom';
// import aboutIcon from 'media/about-icon.png';
// import keyboardIcon from 'media/keyboard-icon.png';
// import pianoIcon from 'media/piano-icon.png';
// import accountingIcon from 'media/accounting-icon.png';
// import blogIcon from 'media/blog-icon.png';

import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <nav className={styles.navBar}>
      <a href="https://www.google.com">what i do</a>
      <a href="https://www.google.com">who i am</a>
      <a href="https://www.google.com">things i like</a>
      {/*
      <Link to="/" className={styles.navItem}>
        <span className={styles.navItemText}>about me</span>
        <img className={styles.headerImage} src={aboutIcon} alt="about me" />
      </Link>
      <Link to="/programming" className={styles.navItem}>
        <span className={styles.navItemText}>software engineer</span>
        <img className={styles.headerImage} src={keyboardIcon} alt="software" />
      </Link>
      <Link to="/piano" className={styles.navItem}>
        <span className={styles.navItemText}> pianist</span>
        <img className={styles.headerImage} src={pianoIcon} alt="piano" />
      </Link>
      <Link to="/accounting" className={styles.navItem}>
        <span className={styles.navItemText}> accountant</span>
        <img className={styles.headerImage} src={accountingIcon} alt="accounting" />
      </Link>
      <Link to="/blog" className={styles.navItem}>
        <span className={styles.navItemText}> blog</span>
        <img className={styles.headerImage} src={blogIcon} alt="blog" />
      </Link>
      */}
    </nav>
  </header>
);

export default Header;
