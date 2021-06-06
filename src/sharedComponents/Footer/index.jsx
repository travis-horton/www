import React from 'react';
import twitterLogo from 'url:../../media/twitter-logo.png';
import instaLogo from 'url:../../media/insta-logo.svg';

import {
  StyledFooter,
  StyledFooterContent,
  StyledFooterLogo,
} from './styles';

const Footer = () => (
  <StyledFooter>
    <StyledFooterContent>
      <span>
        &copy;&apos;21 kiddspazz
      </span>
    </StyledFooterContent>
    <StyledFooterLogo src={twitterLogo} alt="twitter-logo" />
    <StyledFooterLogo src={instaLogo} alt="instagram-logo" />
  </StyledFooter>
);

export default Footer;
