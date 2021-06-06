import React from 'react';
import styled from 'styled-components';

const StyledNavItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d0a00;
  text-transform: uppercase;
  font-size: 16px;

  ${props => props.selected
    ?
      'border-bottom: 2px solid #a714a2; \
      border-radius: 2px; \
      transition: 0.5s;'
    : ''
  }

  &:hover {
    text-decoration: none;
  }

  @media only screen and (max-width: 500px) {
    margin: 5px 0;
    > span {
      display: none;
    }
  }
`;

export default StyledNavItem;
