import React from 'react';
import {
  Route, Switch, Link, useRouteMatch, useParams
} from 'react-router-dom';

import {
  PerlinNoise
} from './projects';

const Programming = () => {
  const match = useRouteMatch();

  return (
    <main>
      <h1 style={{ textAlign: 'center' }}>
        <Link
          to={match.url}
          style={{ color: 'black' }}
        >
          front-end engineer
        </Link>
      </h1>
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
            <h2>personal projects</h2>
            <a href="topo_circle/index.html">perlin noise</a><br />
            <a href="ray_tracer/index.html">ray tracer</a><br />
            <a href="asteroids/index.html">asteroids</a><br />
            <a href="orbitz/index.html">orbits</a><br />
            <a href="polygon_race/index.html">polygon race</a><br />
            <a href="gol/index.html" target="_blank">game of life</a>
          </section>
        <section>
            <h2>goals</h2>
            <a href="https://www.postgresql.org/docs/11/tutorial-sql.html" target="blank">postgres tutorial</a><br />
            learn
            {' '}
            <a href="https://doc.rust-lang.org/stable/book/" target="blank">rust</a><br />
            <a href="https://www.nand2tetris.org" target="blank">nand2tetris</a><br />
          </section>
        <section>
            <h2>works in progress</h2>
            <a href="../kiddspazz/battleship/index.html">battleship</a><br />
            <h2>next projects</h2>
            rpg: roam the internet fighting html elements<br />
            goals tracker app
          </section>
          */}
    </main>
  );
}

const ProgrammingContent = () => {
  const match = useRouteMatch();
  return (
    <div>
      <p>
        currently with bodybuilding.com; started in march of 2020. i recently built
        {' '}
        <Link
          to="https://www.bodybuilding.com/workout-plans2"
          rel="noreferrer"
          target="_blank"
        >
          this page
        </Link>
        {' '}
        for them.
      </p>
      <div>
        <h2>personal projects</h2>
        <ul>
          <li>
            <Link
              to={`${match.url}/perlin-noise`}
            >
              perlin noise
            </Link>
          </li>
          <li>
            <Link
              to={`${match.url}/ray-tracer`}
            >
              ray tracer
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Programming;
