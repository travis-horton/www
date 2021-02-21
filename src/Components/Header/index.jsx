import React from 'react';
import { Link } from 'react-router-dom';
import aboutIcon from 'media/about-icon.png';
import keyboardIcon from 'media/keyboard-icon.png';
import pianoIcon from 'media/piano-icon.png';
import accountingIcon from 'media/accounting-icon.png';
import blogIcon from 'media/blog-icon.png';

import styles from './Header.module.css';

const pages = [
  {
    name: 'about me',
    icon: aboutIcon,
    path: '/home',
  },
  {
    name: 'software engineer',
    icon: keyboardIcon,
    path: '/programming',
  },
  {
    name: 'pianist',
    icon: pianoIcon,
    path: '/piano',
  },
  {
    name: 'accountant',
    icon: accountingIcon,
    path: '/accounting',
  },
  {
    name: 'blog',
    icon: blogIcon,
    path: '/blog',
  },
];

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: window.location.pathname,
    };
  }

  render() {
    const { selectedTab } = this.state;

    return (
      <header className={styles.header}>
        <nav className={styles.navBar}>
          {/*
      <a href="https://www.google.com">what i do</a>
      <a href="https://www.google.com">who i am</a>
      <a href="https://www.google.com">things i like</a>
      */}
          {
            pages.map((page) => (
              <Link
                key={page.name}
                to={page.path}
                className={`${styles.navItem} ${page.path === selectedTab ? styles.selected : ''}`}
                onClick={() => this.setState({ selectedTab: page.path })}
              >
                <span className={styles.navItemText}>{page.name}</span>
                <img className={styles.headerImage} src={page.icon} alt={page.name} />
              </Link>
            ))
          }
        </nav>
      </header>
    );
  }
}

export default Header;
