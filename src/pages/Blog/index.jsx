import React from 'react';
import {
  Route, Switch, Link, useRouteMatch
} from 'react-router-dom';

import './styles.css';
import './neon-button.css';

import { TableOfContents } from './TableOfContents';

const Blog = () => {
  const match = useRouteMatch();
  return (
  <main>
    <Switch>
      <Route path={`${match.path}/contents`}>
        <TableOfContents />
      </Route>
      <Route path={match.path}>
        <div class='blog__button-container'>
        <Link
          className='blog__neon-button'
          to={`${match.url}/contents`}
        >
          here&apos;s where i write stuff sometimes
        </Link>
        </div>
      </Route>
    </Switch>
  </main>
  );
};

export default Blog;
