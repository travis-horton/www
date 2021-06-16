import React from 'react';
import styled from 'styled-components';

const clrNeon = 'hsl(302 79% 37%)';
const clrBg =  'hsl(0 0% 10%)';
const NeonButton = styled.a`
  font-size: 1rem;

  display: inline-block;
  max-width: 200px;
  cursor: pointer;
  text-decoration: none;
  color: ${clrNeon};
  border: ${clrNeon} 0.125em solid;
  padding: 0.25em 1em;
  border-radius: .25em;

  text-shadow: 0 0 0.1em currentColor;

  box-shadow:
    0 0 0.5em 0 ${clrNeon},
    inset 0 0 0.5em 0 ${clrNeon};

  position: relative;
  z-index: 3;

  &:before {
    pointer-events: none;
    content: "";
    position: absolute;
    background: ${clrNeon};
    top: 100%;
    left: 0;
    width: 100%;
    height: 100%;

    transform: perspective(1em) rotateX(40deg) scale(1, 0.45);
    filter: blur(1em);
    opacity: 0.7;
    transition: opacity 100ms linear;
  }

  &:after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    box-shadow: 0 0 2em 0.5em ${clrNeon};
    opacity: 0;
    z-index: 1;
    transition: opacity 100ms linear;
  }

  &:hover, &:focus {
    background: ${clrNeon};
    color: ${clrBg};
    text-shadow: 0 0 0.1em currentColor;;
    text-decoration: none;
  }

  &:hover::after, &:focus::after {
    opacity: 1;
  }

  &:hover::before, &:focus::before {
    opacity: 1;
  }
`;

export {
  NeonButton
};
