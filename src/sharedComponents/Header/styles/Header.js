import React from 'react';
import styled from 'styled-components';

const StyledHeader = styled.header`
  z-index: 2;
  position: sticky;
  top: 0;
  height: 60px;
  min-width: 250px;
  padding: 6px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-bottom: 1px solid #eee;

  @media only screen and (max-width: 500px) {
    height: auto;
    position: sticky;
  }
`;

export default StyledHeader;
