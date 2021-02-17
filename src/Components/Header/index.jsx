import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <nav className={styles.navBar}>
      <Link to="/">about me</Link>
      <Link to="/programming">software engineer</Link>
      <Link to="/piano">pianist</Link>
      <Link to="/accounting">accountant</Link>
      <Link to="/blog">blog</Link>
    </nav>
  </header>
);

export default Header;
