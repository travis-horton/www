import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { pages } from '../../assets/pages';
import {
  StyledHeader,
  StyledNavBar,
  StyledHeaderImage,
  StyledNavItem,
} from './styles';

const Header = () => {
  const [selectedTab, setSelectedTab] = useState(document.location.pathname);

  return (
    <StyledHeader>
      <StyledNavBar>
        {
          pages.map((page) => {
            return (
              <Link
                key={page.name}
                to={page.path}
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
