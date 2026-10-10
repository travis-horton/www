import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import JsThisBlog from './blog-posts/js-this.jsx';
import TheFlipFlop1 from './blog-posts/the-flip-flop-1.jsx';
import TheFirstBlog from './blog-posts/the-first-blog.jsx';
import { NotFoundContent } from '../NotFound';
import { Titled } from '/src/sharedComponents/DocumentHead';

import './styles.css';
import './neon-button.css';

// Each page's tab title (sharedComponents/DocumentHead says why it is set
// here, on the leaf, and not once for the whole section).
const titled = (title, page) => <Titled title={title}>{page}</Titled>;

const BlogToc = () => (
  <>
    {/* The page's name for screen readers and outlines; the list shows no
        title of its own, so it is not drawn. Each post has its own h1. */}
    <h1 className="visually-hidden">Blog</h1>
    <table className="blog__table-of-contents">
      <tbody>
        <tr>
          <td>
            <time>October 18, 2019</time>
          </td>
          <td>
            <Link to="js-this">
              JavaScript&apos;s <code>this</code>
            </Link>
          </td>
        </tr>
        <tr>
          <td>
            <time>June 27, 2019</time>
          </td>
          <td>
            <Link to="the-flip-flop-1">The D Flip-Flop, pt 1</Link>
          </td>
        </tr>
        <tr>
          <td>
            <time>June 26, 2019</time>
          </td>
          <td>
            <Link to="the-first-blog">The First Blog Post</Link>
          </td>
        </tr>
      </tbody>
    </table>
    <hr />
    <p>Plus a cool button that doesn&apos;t do anything:</p>
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
      <Route index element={titled('Blog', <BlogToc />)} />
      <Route
        path="js-this"
        element={titled("JavaScript's this", <JsThisBlog />)}
      />
      <Route
        path="the-flip-flop-1"
        element={titled('The D Flip-Flop, pt 1', <TheFlipFlop1 />)}
      />
      <Route
        path="the-first-blog"
        element={titled('The First Blog Post', <TheFirstBlog />)}
      />
      <Route path="*" element={titled('Not found', <NotFoundContent />)} />
    </Routes>
  </main>
);

export default Blog;
