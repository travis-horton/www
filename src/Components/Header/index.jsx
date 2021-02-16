import React from 'react';
import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <nav className={styles.navBar}>
      <a className={styles.navItem} href="/">about me</a>
      <a className={styles.navItem} href="/programming">software engineer</a>
      <a className={styles.navItem} href="/piano">pianist</a>
      <a className={styles.navItem} href="/accounting">accountant</a>
      <a className={styles.navItem} href="/blog">blog</a>
    </nav>
  </header>
);

export default Header;
