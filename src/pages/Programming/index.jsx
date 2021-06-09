import React from 'react';

import {
  Main,
  StyledH2,
} from '/src/sharedComponents/units';

const Programming = () => (
  <Main>
    <StyledH2>bodybuilding.com client-side engineer</StyledH2>
    <p>
      started in march of 2020. i recently built
      {' '}
      <a
        href="https://www.bodybuilding.com/workout-plans2"
        rel="noreferrer"
        target="_blank"
      >
        this page
      </a>
      {' '}
      for them.
    </p>
    <section>
      <StyledH2>personal projects</StyledH2>
      <a href="topo_circle/index.html">perlin noise</a>
      <br />
      <a href="ray_tracer/index.html">ray tracer</a>
      <br />
      <a href="asteroids/index.html">asteroids</a>
      <br />
      <a href="orbitz/index.html">orbits</a>
      <br />
      <a href="polygon_race/index.html">polygon race</a>
      <br />
      <a href="gol/index.html" target="_blank">game of life</a>
    </section>
    <section>
      <StyledH2>goals</StyledH2>
      <a href="https://www.postgresql.org/docs/11/tutorial-sql.html" target="blank">postgres tutorial</a>
      <br />
      learn
      {' '}
      <a href="https://doc.rust-lang.org/stable/book/" target="blank">rust</a>
      <br />
      <a href="https://www.nand2tetris.org" target="blank">nand2tetris</a>
      <br />
    </section>
    <section>
      <StyledH2>works in progress</StyledH2>
      <a href="../kiddspazz/battleship/index.html">battleship</a>
      <br />
      <h2>next projects</h2>
      rpg: roam the internet fighting html elements
      <br />
      goals tracker app
    </section>
  </Main>
);

export default Programming;
