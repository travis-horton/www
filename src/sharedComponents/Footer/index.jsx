import React from 'react';
import twitterLogo from 'url:/src/assets/media/twitter-logo.png';
import instaLogo from 'url:/src/assets/media/insta-logo.svg';

import {
  StyledFooter,
  StyledFooterContent,
  StyledFooterLogo,
} from './styles';

const Footer = () => (
  <StyledFooter>
    <StyledFooterContent>
        &copy;&apos;21 kiddspazz
    </StyledFooterContent>
    <StyledFooterLogo src={twitterLogo} alt="twitter-logo" />
    <StyledFooterLogo src={instaLogo} alt="instagram-logo" />
  </StyledFooter>
);

export default Footer;
