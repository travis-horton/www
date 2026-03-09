import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import pages from '../../assets/pages';

import './styles.css';

const Header = () => {
  const { pathname } = useLocation();
  const currentTab = pathname.split('/')[1];

  return (
    <header className="main-header">
      <nav className="main-header__nav" aria-label="Main navigation">
        {
          pages.map((page) => (
            <Link
              to={`/${page.path}`}
              key={page.name}
              className={`nav__item ${currentTab === page.path ? 'nav__item--selected' : ''}`}
            >
              <span className="nav__label">{page.name}</span>
              <img
                className="nav__icon"
                src={page.icon}
                alt={page.name}
              />
            </Link>
          ))
        }
      </nav>
    </header>
  );
};

export default Header;
