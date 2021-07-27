import React from 'react';
import {
  Route, Switch, Link, useRouteMatch, useParams
} from 'react-router-dom';

import {
  PerlinNoise,
  RayTracer,
  Orbitz,
  Asteroids,
  PolygonRace,
} from './projects';

import './styles.css';

const Programming = () => {
  const match = useRouteMatch();

  return (
    <main>
      <Switch>
        <Route path={`${match.path}/perlin-noise`}>
          <PerlinNoise />
        </Route>
        <Route path={`${match.path}/ray-tracer`}>
          <RayTracer />
        </Route>
        <Route path={`${match.path}/orbitz`}>
          <Orbitz />
        </Route>
        <Route path={`${match.path}/asteroids`}>
          <Asteroids />
        </Route>
        <Route path={`${match.path}/polygon-race`}>
          <PolygonRace />
        </Route>
        <Route path={match.path}>
          <ProgrammingContent />
        </Route>
      </Switch>
      {/*
        <section>
            <h2>personal projects</h2>
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
      <h1 className="programming__title">
        front-end engineer
      </h1>
      <p>
        currently with bodybuilding.com; started in march of 2020. i recently built
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
      <div>
        <h2>personal projects</h2>
        <ul>
          <li>
            <Link to={`${match.url}/perlin-noise`}>
              perlin noise
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/ray-tracer`}>
              ray tracer
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/orbitz`}>
              orbitz
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/asteroids`}>
              asteroids
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/polygon-race`}>
              polygon race
            </Link>
          </li>
        </ul>
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
      </div>
    </div>
  );
};

export default Programming;
