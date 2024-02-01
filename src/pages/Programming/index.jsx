import React from 'react';
import {
  Route, Switch, Link, useRouteMatch,
} from 'react-router-dom';

import {
  PerlinNoise,
  RayTracer,
  Orbitz,
  Asteroids,
  PolygonRace,
  SeximalTimeKeeping,
  BinaryNumerals,
} from './projects';

import './styles.css';

function Programming() {
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
        <Route path={`${match.path}/seximal-time-keeping`}>
          <SeximalTimeKeeping />
        </Route>
        <Route path={`${match.path}/binary`}>
          <BinaryNumerals />
        </Route>
        <Route path={match.path}>
          <ProgrammingContent />
        </Route>
      </Switch>
    </main>
  );
}

function ProgrammingContent() {
  const match = useRouteMatch();
  return (
    <div>
      <p>
        Yeah, I write stuff that computers can read sometimes. I like moving
        pixels around and doing math problems to get them to do so in
        interesting ways.
      </p>
      <p>
        I also like vim. I spend way too much time in my vim config (ostensibly)
        increasing my productivity (but really just making my life more fun).
      </p>
      <p>
        I've been doing some combination of the above (in addition to
        productive, profitable, and sometimes corporate work) professionally
        (read: in exchange for sweet dollar bills) for 5 years. Mostly in react
        and typescript, but also in python, MySQL, and some other idioms.
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
          <a
            href="https://www.postgresql.org/docs/11/tutorial-sql.html"
            target="blank"
          >
            Postgres tutorial
          </a>
          <br />
          Learn
          {' '}
          <a
            href="https://doc.rust-lang.org/stable/book/"
            target="blank"
          >
            Rust
          </a>
          <br />
          <a href="https://www.nand2tetris.org" target="blank">
            Nand2tetris
          </a>
          <br />
        </section>
        <section>
          <h2>Works in progress</h2>
          <ul>
            <li>
              <Link to={`${match.url}/seximal-time-keeping`}>
                Seximal
              </Link>
            </li>
            <li>
              <Link to={`${match.url}/binary`}>
                Binary
              </Link>
            </li>
          </ul>
          <h2>Next projects</h2>
          RPG: Roam the internet fighting html elements
          <br />
          Goals tracker app
        </section>
        <section>
          <h2>Fun quotes</h2>
          <p>
            This is the output if you type
            {' '}
            <code>import this</code>
            {' '}
            in a python
            interpreter:
          </p>
          <p>
            Beautiful is better than ugly.
            <br />
            Explicit is better than implicit.
            <br />
            Simple is better than complex.
            <br />
            Complex is better than complicated.
            <br />
            Flat is better than nested.
            <br />
            Sparse is better than dense.
            <br />
            Readability counts.
            <br />
            Special cases aren&apos;t special enough to break the rules.
            <br />
            Although practicality beats purity.
            <br />
            Errors should never pass silently.
            <br />
            Unless explicitly silenced.
            <br />
            In the face of ambiguity, refuse the temptation to guess.
            <br />
            There should be one-- and preferably only one --obvious way to do
            it.
            <br />
            Although that way may not be obvious at first unless you're Dutch.
            Now is better than never.
            <br />
            Although never is often better than *right* now.
            <br />
            If the implementation is hard to explain, it's a bad idea.
            <br />
            If the implementation is easy to explain, it may be a good idea.
            <br />
            Namespaces are one honking great idea -- let's do more of those!
            <br />
          </p>
        </section>
      </div>
    </div>
  );
}

export default Programming;
