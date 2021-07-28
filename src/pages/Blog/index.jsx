import React from 'react';
import {
  Route, Switch, Link, useRouteMatch
} from 'react-router-dom';

import './styles.css';
import './neon-button.css';

const Blog = () => {
  const match = useRouteMatch();
  return (
    <main>
      <Switch>
        <Route path={`${match.path}`} exact>
          <table class="blog__table-of-contents">
            <tbody>
              <tr>
                <td><time>October 18, 2019</time></td>
                <td><Link to={`${match.url}/js-this`}>JavaScript's <code>this</code></Link></td>
              </tr>
              <tr>
                <td><time>June 27, 2019</time></td>
                <td><a href={`${match.url}/the-flip-flop-1`}>The D Flip-Flop, pt 1</a></td>
              </tr>
              <tr>
                <td><time>June 26, 2019</time></td>
                <td><a href={`${match.url}/the-first-blog`}>The First Blog Post</a></td>
              </tr>
            </tbody>
          </table>
          <hr />
          <p>
            plus a cool button that doesn't do anything:
          </p>
          <div class='blog__button-container'>
            <Link
              className='blog__neon-button'
              to={`${match.url}`}
            >
              here&apos;s where i write stuff sometimes
            </Link>
          </div>
        </Route>
        <Route path={`${match.path}/js-this`}>
          <h1>i'm working on making these each programmatically displayed...</h1>
        </Route>
        <Route path={`${match.path}/the-flip-flop-1`}>
          <h1>i'm working on making these each programmatically displayed...</h1>
        </Route>
        <Route path={`${match.path}/the-first-blog`}>
          <h1>i'm working on making these each programmatically displayed...</h1>
        </Route>
      </Switch>
    </main>
  );
};

export default Blog;
