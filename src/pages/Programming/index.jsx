import React from 'react';
import {
  Route, Switch, Link, useRouteMatch, useParams
} from 'react-router-dom';

import {
  Main,
  StyledH1,
  StyledH2,
  StyledUl,
  StyledA,
} from '/src/sharedComponents/units';

import {
  PerlinNoise
} from './projects';

const Programming = () => {
  const match = useRouteMatch();

  return (
    <Main>
      <StyledH1 style={{ textAlign: 'center' }}>
        <Link
          to={match.url}
          style={{
            textDecoration: 'none',
            color: 'black',
          }}
        >
          front-end engineer
        </Link>
      </StyledH1>
      <Switch>
        <Route path={`${match.path}/perlin-noise`}>
          <PerlinNoise />
        </Route>
        <Route path={match.path}>
          <ProgrammingContent />
        </Route>
      </Switch>
      {/*
        <section>
            <StyledH2>personal projects</StyledH2>
            <StyledA href="topo_circle/index.html">perlin noise</StyledA><br />
            <StyledA href="ray_tracer/index.html">ray tracer</StyledA><br />
            <StyledA href="asteroids/index.html">asteroids</StyledA><br />
            <StyledA href="orbitz/index.html">orbits</StyledA><br />
            <StyledA href="polygon_race/index.html">polygon race</StyledA><br />
            <StyledA href="gol/index.html" target="_blank">game of life</StyledA>
          </section>
        <section>
            <StyledH2>goals</StyledH2>
            <StyledA href="https://www.postgresql.org/docs/11/tutorial-sql.html" target="blank">postgres tutorial</StyledA><br />
            learn
            {' '}
            <StyledA href="https://doc.rust-lang.org/stable/book/" target="blank">rust</StyledA><br />
            <StyledA href="https://www.nand2tetris.org" target="blank">nand2tetris</StyledA><br />
          </section>
        <section>
            <StyledH2>works in progress</StyledH2>
            <StyledA href="../kiddspazz/battleship/index.html">battleship</StyledA><br />
            <StyledH2>next projects</StyledH2>
            rpg: roam the internet fighting html elements<br />
            goals tracker app
          </section>
          */}
    </Main>
  );
}

const ProgrammingContent = () => {
  const match = useRouteMatch();
  return (
    <div>
      <p>
        currently with bodybuilding.com; started in march of 2020. i recently built
        {' '}
        <StyledA
          href="https://www.bodybuilding.com/workout-plans2"
          rel="noreferrer"
          target="_blank"
        >
          this page
        </StyledA>
        {' '}
        for them.
      </p>
      <div>
        <h2>personal projects</h2>
        <StyledUl>
          <li>
            <Link to={`${match.url}/perlin-noise`}>perlin noise</Link>
          </li>
          <li>
            <Link to={`${match.url}/ray-tracer`}>ray tracer</Link>
          </li>
        </StyledUl>
      </div>
    </div>
  );
};

export default Programming;
