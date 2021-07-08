import React from 'react';
import {
  Route, Switch, Link, useRouteMatch
} from 'react-router-dom';

export const TableOfContents = () => (
  <div class="content">
    <table class="blog__table-of-contents">
      <tbody>
        <tr>
          <td><time>October 18, 2019</time></td>
          <td><Link to="./js_this/">JavaScript's <code>this</code></Link></td>
        </tr>
        <tr>
          <td><time>June 27, 2019</time></td>
          <td><a href="./the_flip_flop1/">The D Flip-Flop, pt 1</a></td>
        </tr>
        <tr>
          <td><time>June 26, 2019</time></td>
          <td><a href="./the_first_blog/">The First Blog Post</a></td>
        </tr>
      </tbody>
    </table>
  </div>
);
