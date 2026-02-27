import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import JsThisBlog from './blog-posts/js-this.jsx';
import TheFlipFlop1 from './blog-posts/the-flip-flop-1.jsx';
import TheFirstBlog from './blog-posts/the-first-blog.jsx';

import './styles.css';
import './neon-button.css';

const BlogToc = () => (
  <>
    <table className="blog__table-of-contents">
      <tbody>
        <tr>
          <td><time>October 18, 2019</time></td>
          <td><Link to="js-this">JavaScript&apos;s <code>this</code></Link></td>
        </tr>
        <tr>
          <td><time>June 27, 2019</time></td>
          <td><Link to="the-flip-flop-1">The D Flip-Flop, pt 1</Link></td>
        </tr>
        <tr>
          <td><time>June 26, 2019</time></td>
          <td><Link to="the-first-blog">The First Blog Post</Link></td>
        </tr>
      </tbody>
    </table>
    <hr />
    <p>
      Plus a cool button that doesn&apos;t do anything:
    </p>
    <div className="blog__button-container">
      <Link className="blog__neon-button" to=".">
        Here&apos;s where i write stuff sometimes
      </Link>
    </div>
  </>
);

const Blog = () => (
  <main>
    <Routes>
      <Route index element={<BlogToc />} />
      <Route path="js-this" element={<JsThisBlog />} />
      <Route path="the-flip-flop-1" element={<TheFlipFlop1 />} />
      <Route path="the-first-blog" element={<TheFirstBlog />} />
    </Routes>
  </main>
);

export default Blog;
