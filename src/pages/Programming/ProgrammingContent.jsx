import React from 'react';
import { Link } from 'react-router-dom';

function ProgrammingContent() {
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
        I&apos;ve been doing some combination of the above (in addition to
        productive, profitable, and sometimes corporate work) professionally
        (read: in exchange for sweet dollar bills) for 5 years. Mostly in react
        and typescript, but also in python, MySQL, and some other idioms.
      </p>
      <div>
        <h2>Personal Projects</h2>
        <ul>
          <li>
            <Link to={"/programming/perlin-noise"}>
              Perlin noise
            </Link>
          </li>
          <li>
            <Link to={"/programming/ray-tracer"}>
              Ray tracer
            </Link>
          </li>
          <li>
            <Link to={"/programming/orbitz"}>
              Orbitz
            </Link>
          </li>
          <li>
            <Link to={"/programming/asteroids"}>
              Asteroids
            </Link>
          </li>
          <li>
            <Link to={"/programming/polygon-race"}>
              Polygon race
            </Link>
          </li>
        </ul>
        <section>
          <h2>Goals</h2>
          <a
            href="https://www.postgresql.org/docs/11/tutorial-sql.html"
            target="_blank"
            rel="noreferrer"
          >
            Postgres tutorial
          </a>
          <br />
          Learn
          {' '}
          <a
            href="https://doc.rust-lang.org/stable/book/"
            target="_blank"
            rel="noreferrer"
          >
            Rust
          </a>
          <br />
          <a href="https://www.nand2tetris.org" target="_blank" rel="noreferrer">
            Nand2tetris
          </a>
          <br />
        </section>
        <section>
          <h2>Works in progress</h2>
          <ul>
            <li>
              <Link to={"/programming/seximal-time-keeping"}>
                Seximal
              </Link>
            </li>
            <li>
              <Link to={"/programming/binary"}>
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
            There should be one&mdash;and preferably only one&mdash;obvious way to do
            it.
            <br />
            Although that way may not be obvious at first unless you&apos;re Dutch.
            Now is better than never.
            <br />
            Although never is often better than *right* now.
            <br />
            If the implementation is hard to explain, it&apos;s a bad idea.
            <br />
            If the implementation is easy to explain, it may be a good idea.
            <br />
            Namespaces are one honking great idea -- let&apos;s do more of those!
            <br />
          </p>
        </section>
      </div>
    </div>
  );
}

export default ProgrammingContent;
