import React from 'react';
import styled from 'styled-components';

const StyledHeaderImage = styled.img`
  display: none;
  margin: 3px;
  height: 28px;

  @media only screen and (max-width: 500px) {
    display: inline;
  }
`;

export default StyledHeaderImage;
