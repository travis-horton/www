import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { pages } from '../../assets/pages';
import {
  StyledHeaderImage,
} from './styles';

import './styles.css';

const subdirectory = () => {
  return document.location.pathname.split('/')[1];
};

const Header = () => {
  const [selectedTab, setSelectedTab] = useState(subdirectory());

  return (
    <header className='main-header'>
      <nav className='main-header__nav'>
        {
          pages.map((page) => {
            return (
              <Link
                to={`/${page.path}`}
                key={page.name}
                className={`nav__item ${selectedTab === page.path ? 'nav__item--selected' : ''}`}
                onClick={() => setSelectedTab(page.path)}
              >
                  <span className="nav__label">{page.name}</span>
                  <img
                    className='nav__icon'
                    src={page.icon}
                    alt={page.name}
                  />
              </Link>
            );
          })
        }
      </nav>
    </header>
  );
}

export default Header;
