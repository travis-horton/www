import React from 'react';
import styled from 'styled-components';

import headshotThumb from 'url:/src/assets/media/headshot-thumb.png';
import headshot from 'url:/src/assets/media/headshot.png';
import monkeyThumb from 'url:/src/assets/media/monkeh-thumb.jpg';
import monkey from 'url:/src/assets/media/monkeh.jpg';

import Image from '/src/sharedComponents/Image';
import {
  Main,
  StyledH1,
  StyledH2,
} from '/src/sharedComponents/units';

const ProfilePic = styled.div`
  float: left;
  margin-right: 14px;
`;

const MonkeyPic = styled.div`
  float: right;
  margin-left: 14px;
`;

const Home = () => (
  <Main>
    <ProfilePic>
      <Image alt="headshot" thumb={headshotThumb} src={headshot} height={285} width={285} />
    </ProfilePic>
    <header>
      <div>
        <StyledH1>
          travis horton
        </StyledH1>
        <StyledH2>
          software engineer
          <br />
          pianist
          <br />
          accountant
        </StyledH2>
      </div>
    </header>
    <div>
      <p>
        i&apos;m travis. i program in react/javascript/css/html and i&apos;ve been trying
        to learn rust. i play the piano. i do some accounting on the side. i live in boise, idaho
        with my wonderful wife anne and our cat monkey. and i run. really slowly.
      </p>
      <p>
        we bought a house in the summer of 2020! what an adult thing to do &mdash; i
        definitely never thought i&apos;d get this responsible.
      </p>
      <MonkeyPic>
        <Image alt="monkey" thumb={monkeyThumb} src={monkey} height={210} width={157} />
      </MonkeyPic>
      <p>
        i attended the recurse center spring 1, 2019 batch: february 18 - may 9. it was a
        great time, i met a lot of amazing people, and i learned a ton. here are some of
        the projects i worked on while i was there and before.
      </p>
      <p>
        in 2017, anne and i decided to leave our 6-year home of brooklyn for the road.
        we bought an rv and traveled the country for a year and a half. i studied
        programming part time while i worked half-time as an accountant for the brooklyn
        youth chorus.
      </p>
      <p>
        i studied piano for 6 years at unc-school of the arts and 2 more years at the new
        england conservatory. i moved to new york city in 2011 and worked as a pianist
        there for 6 years &mdash; played carnegie hall, joe&apos;s pub, off-broadway shows,
        worked for nyu and the brooklyn youth chorus as a vocal coach and staff pianist. i
        rode my bicycle a lot.
      </p>
    </div>
  </Main>
);

export default Home;
