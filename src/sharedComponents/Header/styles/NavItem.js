import React from 'react';
import styled from 'styled-components';

const StyledNavItem = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d0a00;
  text-transform: uppercase;
  font-size: 1rem;

  ${props => props.selected
    ?
      'border-bottom: 2px solid #a714a2; \
      border-radius: 2px; \
      transition: 0.5s;'
    : ''
  }

  &:hover {
    text-decoration: none;
    cursor: pointer;
  }

  @media only screen and (max-width: 500px) {
    margin: 0.3rem 0;
    > span {
      display: none;
    }
  }
`;

export default StyledNavItem;
