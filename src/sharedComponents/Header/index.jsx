import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { pages } from '../../assets/pages';
import {
  StyledHeader,
  StyledNavBar,
  StyledHeaderImage,
  StyledNavItem,
} from './styles';

const subdirectory = () => {
  return document.location.pathname.split("/")[1];
};

const Header = () => {
  const [selectedTab, setSelectedTab] = useState(subdirectory());

  return (
    <StyledHeader>
      <StyledNavBar>
        {
          pages.map((page) => {
            return (
              <Link
                key={page.name}
                to={`/${page.path}`}
                onClick={() => setSelectedTab(page.path)}
                style={{ textDecoration: 'none' }}
              >
                <StyledNavItem
                  selected={selectedTab === page.path}
                >
                  <span>{page.name}</span>
                  <StyledHeaderImage src={page.icon} alt={page.name} />
                </StyledNavItem>
              </Link>
            );
          })
        }
      </StyledNavBar>
    </StyledHeader>
  );
}

export default Header;
