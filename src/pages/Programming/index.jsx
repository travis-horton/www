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
    </main>
  );
}

const ProgrammingContent = () => {
  const match = useRouteMatch();
  return (
    <div>
      <p>
        I started working for <a href="https://www.joinhonor.com">joinhonor.com</a> late October of 2021.
        I&apos;m really lucky and happy to be here: all of my colleagues are smart and welcoming,
        my manager is reasonable, empathetic, and honest, and the work I&apos;m doing is fun,
        engaging, and meaningful. It&apos;s great.
      </p>
      <p>
        Our stack is Typescript/React and Python. I haven&apos;t done too much backend work before
        this role so I&apos;m definitely still learning Python, but it&apos;s going well.
      </p>
      <p>
        And we&apos;re hiring, so if your looking for a job: reach out!
      </p>
      <div>
        <h2>Personal Projects</h2>
        <ul>
          <li>
            <Link to={`${match.url}/perlin-noise`}>
              Perlin noise
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/ray-tracer`}>
              Ray tracer
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/orbitz`}>
              Orbitz
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/asteroids`}>
              Asteroids
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/polygon-race`}>
              Polygon race
            </Link>
          </li>
        </ul>
        <section>
          <h2>Goals</h2>
          <a href="https://www.postgresql.org/docs/11/tutorial-sql.html" target="blank">Postgres tutorial</a><br />
          Learn
          {' '}
          <a href="https://doc.rust-lang.org/stable/book/" target="blank">Rust</a><br />
          <a href="https://www.nand2tetris.org" target="blank">Nand2tetris</a><br />
        </section>
        <section>
          <h2>Works in progress</h2>
          <p>
            I&apos;ve been recently focused on re-building this website. That has included giving
            it a full design make-over (I hope you like it!), but also implementing React and
            React Router.
          </p>
          <p>
            Those are the big changes that you can see, but in addition I implemented automated
            builds; I have a "development" site (kiddspazz.com) which gets automatically built out
            on any push to my dev branch and this url (www.travish.com) which gets built out on any
            push to my main branch. All of this is using docker containers which also handle the
            routing and ssl/https stuff!
          </p>
          <p>
            This is some fun stuff y&apos;all: now I can make some little changes, see them in my
            "development" site pretty much immediately, and get them to my "production" site within
            minutes. For instance, the paragraph you&apos;re reading now was written on 7/29/21 at
            11:00. It was live on the "production" site by 11:10!
          </p>
          <h2>Next projects</h2>
          RPG: Roam the internet fighting html elements<br />
          Goals tracker app
        </section>
      </div>
    </div>
  );
};

export default Programming;
