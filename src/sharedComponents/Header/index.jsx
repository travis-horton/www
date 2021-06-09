import React, { useState } from 'react';

import { pages } from '../../assets/pages';
import {
  StyledHeader,
  StyledNavBar,
  StyledHeaderImage,
  StyledNavItem,
} from './styles';

const Header = () => {
  const [selectedTab, setSelectedTab] = useState('about me');

  return (
    <StyledHeader>
      <StyledNavBar>
        {
          pages.map((page) => {
            return (
              <StyledNavItem
                selected={selectedTab === page.name}
                key={page.name}
                to={page.path}
                onClick={() => setSelectedTab(page.name)}
              >
                <span>{page.name}</span>
                <StyledHeaderImage src={page.icon} alt={page.name} />
              </StyledNavItem>
            );
          })
        }
      </StyledNavBar>
    </StyledHeader>
  );
}

export default Header;
